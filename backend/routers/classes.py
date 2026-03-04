"""
Classes routes - Manage classrooms, students, and LMS integrations.
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime, timezone
import logging

from core.database import get_database
from core.security import get_current_user
from models.classroom import (
    Class,
    ClassWithStudents,
    ClassCreate,
    ClassUpdate,
    ClassInDB,
    StudentEnrollment,
    StudentInClass,
    IntegrationProvider as IntProvider
)
from services.integrations import (
    get_integration_provider,
    SUPPORTED_PROVIDERS,
    IntegrationStatus
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/classes", tags=["Classes"])


def get_classes_collection():
    db = get_database()
    return db["classes"]


@router.post("", response_model=Class, status_code=status.HTTP_201_CREATED)
async def create_class(
    request: ClassCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new class."""
    classes = get_classes_collection()
    
    classroom = ClassInDB(
        teacher_id=current_user["id"],
        name=request.name,
        description=request.description,
        grade_level=request.grade_level,
        subject=request.subject
    )
    
    if request.integration:
        classroom.integration = request.integration
    
    await classes.insert_one(classroom.to_mongo_dict())
    
    logger.info(f"Class created: {classroom.id} by teacher {current_user['id']}")
    
    return class_from_db(classroom.to_mongo_dict())


@router.get("", response_model=List[Class])
async def list_classes(
    current_user: dict = Depends(get_current_user),
    limit: int = Query(50, le=100)
):
    """List all classes for the current teacher."""
    classes = get_classes_collection()
    
    cursor = classes.find(
        {"teacher_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit)
    
    results = []
    async for doc in cursor:
        results.append(class_from_db(doc))
    
    return results


@router.get("/{class_id}", response_model=ClassWithStudents)
async def get_class(
    class_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get class details with student list."""
    classes = get_classes_collection()
    
    doc = await classes.find_one(
        {"id": class_id, "teacher_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    return class_with_students_from_db(doc)


@router.patch("/{class_id}", response_model=Class)
async def update_class(
    class_id: str,
    request: ClassUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update class details."""
    classes = get_classes_collection()
    
    doc = await classes.find_one(
        {"id": class_id, "teacher_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if request.name is not None:
        updates["name"] = request.name
    if request.description is not None:
        updates["description"] = request.description
    if request.grade_level is not None:
        updates["grade_level"] = request.grade_level
    if request.subject is not None:
        updates["subject"] = request.subject
    if request.settings is not None:
        updates["settings"] = request.settings
    
    await classes.update_one({"id": class_id}, {"$set": updates})
    
    doc.update(updates)
    return class_from_db(doc)


@router.delete("/{class_id}")
async def delete_class(
    class_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a class."""
    classes = get_classes_collection()
    
    result = await classes.delete_one({
        "id": class_id,
        "teacher_id": current_user["id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Class not found")
    
    return {"success": True}


# Student Management

@router.post("/{class_id}/students", response_model=StudentEnrollment)
async def add_student(
    class_id: str,
    display_name: str,
    email: Optional[str] = None,
    student_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Manually add a student to a class."""
    classes = get_classes_collection()
    
    doc = await classes.find_one(
        {"id": class_id, "teacher_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Check for duplicate
    existing_students = doc.get("students", [])
    for s in existing_students:
        if email and s.get("email") == email:
            raise HTTPException(status_code=400, detail="Student with this email already exists")
    
    student = StudentEnrollment(
        display_name=display_name,
        email=email,
        student_id=student_id
    )
    
    await classes.update_one(
        {"id": class_id},
        {
            "$push": {"students": student.model_dump()},
            "$inc": {"student_count": 1, "active_student_count": 1},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    return student


@router.get("/{class_id}/students", response_model=List[StudentInClass])
async def list_students(
    class_id: str,
    current_user: dict = Depends(get_current_user)
):
    """List all students in a class."""
    classes = get_classes_collection()
    
    doc = await classes.find_one(
        {"id": class_id, "teacher_id": current_user["id"]},
        {"_id": 0, "students": 1}
    )
    
    if not doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    students = []
    for s in doc.get("students", []):
        students.append(StudentInClass(
            id=s.get("id", ""),
            display_name=s.get("display_name", ""),
            email=s.get("email"),
            games_played=s.get("games_played", 0),
            total_score=s.get("total_score", 0),
            avg_accuracy=s.get("avg_accuracy", 0),
            last_activity=datetime.fromisoformat(s["last_activity"]) if s.get("last_activity") else None,
            status=s.get("status", "active")
        ))
    
    return students


@router.delete("/{class_id}/students/{student_id}")
async def remove_student(
    class_id: str,
    student_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove a student from a class."""
    classes = get_classes_collection()
    
    result = await classes.update_one(
        {"id": class_id, "teacher_id": current_user["id"]},
        {
            "$pull": {"students": {"id": student_id}},
            "$inc": {"student_count": -1, "active_student_count": -1},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return {"success": True}


# Student Join

@router.post("/join/{join_code}")
async def join_class_by_code(
    join_code: str,
    display_name: str,
    email: Optional[str] = None,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    Join a class using a join code.
    Students can join with or without an account.
    """
    classes = get_classes_collection()
    
    doc = await classes.find_one(
        {"join_code": join_code.upper()},
        {"_id": 0}
    )
    
    if not doc:
        raise HTTPException(status_code=404, detail="Invalid join code")
    
    # Check if already enrolled
    existing_students = doc.get("students", [])
    for s in existing_students:
        if current_user and s.get("user_id") == current_user["id"]:
            return {"success": True, "class_id": doc["id"], "message": "Already enrolled"}
        if email and s.get("email") == email:
            return {"success": True, "class_id": doc["id"], "message": "Already enrolled"}
    
    # Add student
    student = StudentEnrollment(
        user_id=current_user["id"] if current_user else None,
        display_name=display_name,
        email=email or (current_user.get("email") if current_user else None)
    )
    
    await classes.update_one(
        {"id": doc["id"]},
        {
            "$push": {"students": student.model_dump()},
            "$inc": {"student_count": 1, "active_student_count": 1},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    return {
        "success": True,
        "class_id": doc["id"],
        "class_name": doc["name"],
        "student_id": student.id
    }


# Integration Management

@router.get("/integrations/providers")
async def list_integration_providers():
    """List all supported LMS/SIS integration providers."""
    return {"providers": SUPPORTED_PROVIDERS}


@router.post("/{class_id}/integrations/connect")
async def connect_integration(
    class_id: str,
    provider: str,
    credentials: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    Connect a class to an external LMS/SIS.
    
    Credentials required depend on provider:
    - google_classroom: OAuth2 tokens (handled via OAuth flow)
    - canvas: base_url, api_token
    - clever: api_token
    """
    classes = get_classes_collection()
    
    doc = await classes.find_one(
        {"id": class_id, "teacher_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Get provider
    integration = get_integration_provider(provider)
    if not integration:
        raise HTTPException(status_code=400, detail=f"Unknown provider: {provider}")
    
    # Authenticate
    success = await integration.authenticate(credentials)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to authenticate with provider")
    
    # Update class with integration info
    await classes.update_one(
        {"id": class_id},
        {
            "$set": {
                "integration.provider": provider,
                "integration.sync_enabled": True,
                "integration.sync_status": "connected",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {"success": True, "provider": provider, "status": "connected"}


@router.post("/{class_id}/integrations/sync")
async def sync_roster(
    class_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Sync roster from connected LMS/SIS.
    Adds new students, removes students no longer in the class.
    """
    classes = get_classes_collection()
    
    doc = await classes.find_one(
        {"id": class_id, "teacher_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    provider_name = doc.get("integration", {}).get("provider")
    if not provider_name or provider_name == "none":
        raise HTTPException(status_code=400, detail="No integration connected")
    
    integration = get_integration_provider(provider_name)
    if not integration:
        raise HTTPException(status_code=400, detail="Integration provider not available")
    
    # TODO: Re-authenticate with stored credentials
    
    # Perform sync
    external_id = doc.get("integration", {}).get("external_id")
    if not external_id:
        raise HTTPException(status_code=400, detail="External class ID not set")
    
    result = await integration.sync_roster(external_id)
    
    # Update sync status
    await classes.update_one(
        {"id": class_id},
        {
            "$set": {
                "integration.last_sync_at": datetime.now(timezone.utc).isoformat(),
                "integration.sync_status": "success",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {
        "success": True,
        "added": result.get("added", 0),
        "removed": result.get("removed", 0),
        "updated": result.get("updated", 0),
        "total": result.get("total", 0)
    }


@router.get("/{class_id}/integrations/status")
async def get_integration_status(
    class_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get the current integration status for a class."""
    classes = get_classes_collection()
    
    doc = await classes.find_one(
        {"id": class_id, "teacher_id": current_user["id"]},
        {"_id": 0, "integration": 1}
    )
    
    if not doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    return doc.get("integration", {"provider": "none"})


# Helper functions

def class_from_db(doc: dict) -> Class:
    """Convert MongoDB document to Class model."""
    if isinstance(doc.get('created_at'), str):
        doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    if isinstance(doc.get('updated_at'), str):
        doc['updated_at'] = datetime.fromisoformat(doc['updated_at'])
    
    return Class(
        id=doc["id"],
        teacher_id=doc["teacher_id"],
        name=doc["name"],
        description=doc.get("description"),
        grade_level=doc.get("grade_level"),
        subject=doc.get("subject"),
        join_code=doc["join_code"],
        student_count=doc.get("student_count", 0),
        active_student_count=doc.get("active_student_count", 0),
        integration=doc.get("integration", {}),
        settings=doc.get("settings", {}),
        assigned_game_ids=doc.get("assigned_game_ids", []),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"]
    )


def class_with_students_from_db(doc: dict) -> ClassWithStudents:
    """Convert MongoDB document to ClassWithStudents model."""
    base = class_from_db(doc)
    
    students = []
    for s in doc.get("students", []):
        if isinstance(s.get('enrolled_at'), str):
            s['enrolled_at'] = datetime.fromisoformat(s['enrolled_at'])
        if s.get('last_activity') and isinstance(s['last_activity'], str):
            s['last_activity'] = datetime.fromisoformat(s['last_activity'])
        students.append(StudentEnrollment(**s))
    
    return ClassWithStudents(
        **base.model_dump(),
        students=students
    )
