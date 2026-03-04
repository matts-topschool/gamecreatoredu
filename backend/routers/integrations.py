"""
Integrations Router - LMS/SIS OAuth flow, roster sync, and grade sync.
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query, Request, Response
from fastapi.responses import RedirectResponse
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
import httpx
import logging
import os

from core.database import get_database
from core.security import get_current_user
from models.classroom import (
    ClassInDB,
    StudentEnrollment,
    ClassroomIntegration,
    IntegrationProvider as IntProvider
)
from models.assignment import (
    Assignment,
    AssignmentWithAttempts,
    AssignmentCreate,
    AssignmentUpdate,
    AssignmentInDB,
    AssignmentSummary,
    StudentAttempt,
    GradeMetric
)
from services.integrations import SUPPORTED_PROVIDERS, GradeSubmission
from services.google_classroom import GoogleClassroomService, get_google_classroom_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/integrations", tags=["Integrations"])

# Emergent Auth endpoint for session data
EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


def get_classes_collection():
    db = get_database()
    return db["classes"]


def get_assignments_collection():
    db = get_database()
    return db["assignments"]


def get_integration_tokens_collection():
    db = get_database()
    return db["integration_tokens"]


# ==================== Provider List ====================

@router.get("/providers")
async def list_providers():
    """
    List all supported LMS/SIS integration providers.
    Returns which are available vs coming soon.
    """
    return {
        "providers": [
            {
                **p,
                "available": not p.get("coming_soon", False)
            }
            for p in SUPPORTED_PROVIDERS
        ]
    }


# ==================== OAuth Flow ====================

class OAuthInitRequest(BaseModel):
    """Request to initiate OAuth flow."""
    provider: str
    class_id: Optional[str] = None  # Optional class to connect after auth
    redirect_uri: str  # Where to redirect after OAuth completes


@router.post("/oauth/init")
async def initiate_oauth(
    request: OAuthInitRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Initiate OAuth flow for an LMS/SIS provider.
    Returns the URL to redirect the user to.
    
    For Google Classroom, uses Emergent Auth which handles Google OAuth.
    """
    if request.provider != "google_classroom":
        # Check if provider exists but is coming soon
        provider_info = next((p for p in SUPPORTED_PROVIDERS if p["id"] == request.provider), None)
        if provider_info and provider_info.get("coming_soon"):
            raise HTTPException(
                status_code=400,
                detail=f"{provider_info['name']} integration is coming soon!"
            )
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {request.provider}")
    
    # Store pending OAuth state
    tokens = get_integration_tokens_collection()
    state_id = f"oauth_{current_user['id']}_{datetime.now(timezone.utc).timestamp()}"
    
    await tokens.insert_one({
        "state_id": state_id,
        "user_id": current_user["id"],
        "provider": request.provider,
        "class_id": request.class_id,
        "redirect_uri": request.redirect_uri,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    })
    
    # For Google Classroom, redirect to Emergent Auth with classroom scopes
    # The redirect_uri should be our callback endpoint
    callback_url = f"{request.redirect_uri.rsplit('/', 1)[0]}/integrations/callback"
    
    # Emergent Auth URL - it will redirect back with session_id
    auth_url = f"https://auth.emergentagent.com/?redirect={callback_url}&state={state_id}"
    
    return {
        "auth_url": auth_url,
        "state_id": state_id,
        "provider": request.provider
    }


@router.get("/oauth/callback")
async def oauth_callback(
    session_id: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None)
):
    """
    OAuth callback from Emergent Auth.
    Exchanges session_id for tokens and stores them.
    """
    if error:
        raise HTTPException(status_code=400, detail=f"OAuth error: {error}")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")
    
    # Get session data from Emergent Auth
    async with httpx.AsyncClient() as client:
        response = await client.get(
            EMERGENT_AUTH_URL,
            headers={"X-Session-ID": session_id}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get session data")
        
        session_data = response.json()
    
    # The session_data contains the Google OAuth tokens
    # Store them for the user
    tokens = get_integration_tokens_collection()
    
    # Look up the pending OAuth state
    pending = None
    if state:
        pending = await tokens.find_one({"state_id": state}, {"_id": 0})
    
    user_id = pending["user_id"] if pending else session_data.get("id")
    
    # Store or update the integration token
    token_doc = {
        "user_id": user_id,
        "provider": "google_classroom",
        "session_token": session_data.get("session_token"),
        "email": session_data.get("email"),
        "name": session_data.get("name"),
        "picture": session_data.get("picture"),
        "connected_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    }
    
    await tokens.update_one(
        {"user_id": user_id, "provider": "google_classroom"},
        {"$set": token_doc},
        upsert=True
    )
    
    # If there's a class_id, update that class's integration
    if pending and pending.get("class_id"):
        classes = get_classes_collection()
        await classes.update_one(
            {"id": pending["class_id"]},
            {
                "$set": {
                    "integration.provider": "google_classroom",
                    "integration.sync_enabled": True,
                    "integration.sync_status": "connected",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
    
    # Clean up pending state
    if state:
        await tokens.delete_one({"state_id": state})
    
    # Redirect back to the app
    redirect_uri = pending.get("redirect_uri", "/dashboard") if pending else "/dashboard"
    return RedirectResponse(url=f"{redirect_uri}?integration=connected")


@router.get("/status")
async def get_integration_status(
    current_user: dict = Depends(get_current_user)
):
    """
    Get the current user's integration connection status for all providers.
    """
    tokens = get_integration_tokens_collection()
    
    # Find all connected integrations for this user
    cursor = tokens.find(
        {"user_id": current_user["id"], "provider": {"$ne": None}},
        {"_id": 0, "session_token": 0}
    )
    
    connected = {}
    async for doc in cursor:
        provider = doc.get("provider")
        if provider:
            connected[provider] = {
                "connected": True,
                "email": doc.get("email"),
                "name": doc.get("name"),
                "connected_at": doc.get("connected_at"),
                "expires_at": doc.get("expires_at")
            }
    
    # Build response with all providers
    result = []
    for p in SUPPORTED_PROVIDERS:
        provider_status = {
            "id": p["id"],
            "name": p["name"],
            "description": p.get("description", ""),
            "features": p.get("features", []),
            "coming_soon": p.get("coming_soon", False),
            "connected": False
        }
        
        if p["id"] in connected:
            provider_status.update(connected[p["id"]])
        
        result.append(provider_status)
    
    return {"providers": result}


@router.delete("/disconnect/{provider}")
async def disconnect_integration(
    provider: str,
    current_user: dict = Depends(get_current_user)
):
    """Disconnect an integration."""
    tokens = get_integration_tokens_collection()
    
    result = await tokens.delete_one({
        "user_id": current_user["id"],
        "provider": provider
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    return {"success": True, "provider": provider}


# ==================== Google Classroom Operations ====================

@router.get("/google/courses")
async def list_google_courses(
    current_user: dict = Depends(get_current_user)
):
    """
    List courses from Google Classroom where user is a teacher.
    """
    tokens = get_integration_tokens_collection()
    token_doc = await tokens.find_one(
        {"user_id": current_user["id"], "provider": "google_classroom"},
        {"_id": 0}
    )
    
    if not token_doc:
        raise HTTPException(
            status_code=400,
            detail="Google Classroom not connected. Please connect first."
        )
    
    # Use the session token to make API calls
    service = get_google_classroom_service(token_doc.get("session_token", ""))
    
    try:
        courses = await service.list_classes()
        return {
            "courses": [c.model_dump() for c in courses],
            "total": len(courses)
        }
    except Exception as e:
        logger.error(f"Error listing Google Classroom courses: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/google/import-class/{external_course_id}")
async def import_google_class(
    external_course_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Import a Google Classroom course as a GameCraft class.
    Creates the class and imports all students.
    """
    tokens = get_integration_tokens_collection()
    token_doc = await tokens.find_one(
        {"user_id": current_user["id"], "provider": "google_classroom"},
        {"_id": 0}
    )
    
    if not token_doc:
        raise HTTPException(status_code=400, detail="Google Classroom not connected")
    
    service = get_google_classroom_service(token_doc.get("session_token", ""))
    
    # Get course details
    course = await service.get_class(external_course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found in Google Classroom")
    
    # Get students
    external_students = await service.list_students(external_course_id)
    
    # Create GameCraft class
    classes = get_classes_collection()
    
    # Check if already imported
    existing = await classes.find_one({
        "teacher_id": current_user["id"],
        "integration.external_id": external_course_id
    })
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="This course has already been imported"
        )
    
    # Create class with students
    students = []
    for ext_student in external_students:
        students.append(StudentEnrollment(
            display_name=ext_student.display_name,
            email=ext_student.email,
            first_name=ext_student.first_name,
            last_name=ext_student.last_name,
            external_id=ext_student.external_id,
            external_provider=IntProvider.GOOGLE_CLASSROOM
        ).model_dump())
    
    new_class = ClassInDB(
        teacher_id=current_user["id"],
        name=course.name,
        description=course.description,
        integration=ClassroomIntegration(
            provider=IntProvider.GOOGLE_CLASSROOM,
            external_id=external_course_id,
            external_name=course.name,
            sync_enabled=True,
            last_sync_at=datetime.now(timezone.utc),
            sync_status="success"
        )
    )
    
    class_dict = new_class.to_mongo_dict()
    class_dict["students"] = students
    class_dict["student_count"] = len(students)
    class_dict["active_student_count"] = len(students)
    
    await classes.insert_one(class_dict)
    
    logger.info(f"Imported Google Classroom course {external_course_id} with {len(students)} students")
    
    return {
        "success": True,
        "class_id": new_class.id,
        "name": course.name,
        "students_imported": len(students)
    }


@router.post("/google/sync-roster/{class_id}")
async def sync_google_roster(
    class_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Sync roster from Google Classroom for an existing class.
    Adds new students, marks removed students as inactive.
    """
    classes = get_classes_collection()
    tokens = get_integration_tokens_collection()
    
    # Get class
    class_doc = await classes.find_one(
        {"id": class_id, "teacher_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not class_doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Check integration
    integration = class_doc.get("integration", {})
    if integration.get("provider") != "google_classroom":
        raise HTTPException(status_code=400, detail="Class not connected to Google Classroom")
    
    external_id = integration.get("external_id")
    if not external_id:
        raise HTTPException(status_code=400, detail="External course ID not set")
    
    # Get token
    token_doc = await tokens.find_one(
        {"user_id": current_user["id"], "provider": "google_classroom"},
        {"_id": 0}
    )
    
    if not token_doc:
        raise HTTPException(status_code=400, detail="Google Classroom not connected")
    
    service = get_google_classroom_service(token_doc.get("session_token", ""))
    
    # Get students from Google Classroom
    external_students = await service.list_students(external_id)
    external_ids = {s.external_id for s in external_students}
    
    # Get existing students
    existing_students = class_doc.get("students", [])
    existing_external_ids = {s.get("external_id") for s in existing_students if s.get("external_id")}
    
    # Find new students to add
    added = 0
    updated = 0
    removed = 0
    
    for ext_student in external_students:
        if ext_student.external_id not in existing_external_ids:
            # Add new student
            new_student = StudentEnrollment(
                display_name=ext_student.display_name,
                email=ext_student.email,
                first_name=ext_student.first_name,
                last_name=ext_student.last_name,
                external_id=ext_student.external_id,
                external_provider=IntProvider.GOOGLE_CLASSROOM
            )
            
            await classes.update_one(
                {"id": class_id},
                {"$push": {"students": new_student.model_dump()}}
            )
            added += 1
    
    # Mark students as inactive if removed from Google Classroom
    for student in existing_students:
        ext_id = student.get("external_id")
        if ext_id and ext_id not in external_ids and student.get("status") == "active":
            await classes.update_one(
                {"id": class_id, "students.external_id": ext_id},
                {"$set": {"students.$.status": "inactive"}}
            )
            removed += 1
    
    # Update sync status
    await classes.update_one(
        {"id": class_id},
        {
            "$set": {
                "integration.last_sync_at": datetime.now(timezone.utc).isoformat(),
                "integration.sync_status": "success",
                "student_count": len(existing_students) + added - removed,
                "active_student_count": len(existing_students) + added - removed,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {
        "success": True,
        "added": added,
        "updated": updated,
        "removed": removed,
        "total": len(external_students)
    }


# ==================== Assignments ====================

@router.post("/assignments", response_model=Assignment, status_code=status.HTTP_201_CREATED)
async def create_assignment(
    request: AssignmentCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a game assignment for a class.
    Optionally creates a linked assignment in Google Classroom.
    """
    classes = get_classes_collection()
    games_collection = get_database()["games"]
    assignments = get_assignments_collection()
    
    # Verify class ownership
    class_doc = await classes.find_one(
        {"id": request.class_id, "teacher_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not class_doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Verify game exists
    game = await games_collection.find_one({"id": request.game_id}, {"_id": 0})
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Create assignment
    assignment = AssignmentInDB(
        teacher_id=current_user["id"],
        game_id=request.game_id,
        class_id=request.class_id,
        title=request.title or game.get("title", "Game Assignment"),
        instructions=request.instructions,
        due_date=request.due_date,
        grade_metric=request.grade_metric,
        points_possible=request.points_possible,
        allow_multiple_attempts=request.allow_multiple_attempts,
        max_attempts=request.max_attempts,
        sync_to_lms=request.sync_to_lms
    )
    
    # If class has Google Classroom integration and sync is enabled, create coursework
    integration = class_doc.get("integration", {})
    if (request.create_lms_assignment and 
        integration.get("provider") == "google_classroom" and
        integration.get("external_id")):
        
        tokens = get_integration_tokens_collection()
        token_doc = await tokens.find_one(
            {"user_id": current_user["id"], "provider": "google_classroom"},
            {"_id": 0}
        )
        
        if token_doc:
            service = get_google_classroom_service(token_doc.get("session_token", ""))
            
            # Build game URL
            frontend_url = os.environ.get("FRONTEND_URL", "https://impl-framework.preview.emergentagent.com")
            game_url = f"{frontend_url}/play/{request.game_id}?assignment={assignment.id}"
            
            # Create coursework in Google Classroom
            coursework_id = await service.create_assignment(
                class_id=integration["external_id"],
                title=assignment.title,
                description=assignment.instructions or f"Play this educational game: {game.get('title')}",
                game_url=game_url,
                due_date=request.due_date.isoformat() if request.due_date else None,
                points_possible=request.points_possible
            )
            
            if coursework_id:
                assignment.external_assignment_id = f"{integration['external_id']}:{coursework_id}"
                assignment.external_provider = "google_classroom"
                logger.info(f"Created Google Classroom coursework: {coursework_id}")
    
    await assignments.insert_one(assignment.to_mongo_dict())
    
    # Add assignment to class's assigned games
    await classes.update_one(
        {"id": request.class_id},
        {"$addToSet": {"assigned_game_ids": request.game_id}}
    )
    
    return assignment_from_db(assignment.to_mongo_dict())


@router.get("/assignments", response_model=List[AssignmentSummary])
async def list_assignments(
    class_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all assignments, optionally filtered by class."""
    assignments = get_assignments_collection()
    classes = get_classes_collection()
    
    query = {"teacher_id": current_user["id"]}
    if class_id:
        query["class_id"] = class_id
    
    cursor = assignments.find(query, {"_id": 0}).sort("created_at", -1)
    
    results = []
    async for doc in cursor:
        # Get student count for class
        class_doc = await classes.find_one({"id": doc["class_id"]}, {"_id": 0, "student_count": 1})
        total_students = class_doc.get("student_count", 0) if class_doc else 0
        
        results.append(AssignmentSummary(
            id=doc["id"],
            game_id=doc["game_id"],
            class_id=doc["class_id"],
            title=doc["title"],
            status=doc["status"],
            due_date=datetime.fromisoformat(doc["due_date"]) if doc.get("due_date") else None,
            students_completed=doc.get("students_completed", 0),
            total_students=total_students,
            average_accuracy=doc.get("average_accuracy", 0)
        ))
    
    return results


@router.get("/assignments/{assignment_id}", response_model=AssignmentWithAttempts)
async def get_assignment(
    assignment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get assignment details with all attempts."""
    assignments = get_assignments_collection()
    
    doc = await assignments.find_one(
        {"id": assignment_id, "teacher_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not doc:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    return assignment_with_attempts_from_db(doc)


@router.post("/assignments/{assignment_id}/submit-result")
async def submit_assignment_result(
    assignment_id: str,
    score: int,
    accuracy: float,
    time_seconds: int = 0,
    max_combo: int = 0,
    questions_answered: int = 0,
    questions_correct: int = 0,
    student_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Submit a game result for an assignment.
    Called when a student completes a game that's part of an assignment.
    """
    assignments = get_assignments_collection()
    classes = get_classes_collection()
    
    # Get assignment
    assignment_doc = await assignments.find_one({"id": assignment_id}, {"_id": 0})
    if not assignment_doc:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Find student in class
    class_doc = await classes.find_one(
        {"id": assignment_doc["class_id"]},
        {"_id": 0, "students": 1}
    )
    
    if not class_doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Find student by user_id or student_id
    student = None
    for s in class_doc.get("students", []):
        if s.get("user_id") == current_user["id"] or s.get("id") == student_id:
            student = s
            break
    
    if not student:
        raise HTTPException(status_code=403, detail="You are not enrolled in this class")
    
    # Check max attempts
    if assignment_doc.get("max_attempts"):
        existing_attempts = [
            a for a in assignment_doc.get("attempts", [])
            if a.get("student_id") == student["id"]
        ]
        if len(existing_attempts) >= assignment_doc["max_attempts"]:
            raise HTTPException(
                status_code=400,
                detail=f"Maximum attempts ({assignment_doc['max_attempts']}) reached"
            )
    
    # Create attempt record
    attempt = StudentAttempt(
        student_id=student["id"],
        student_external_id=student.get("external_id"),
        score=score,
        accuracy=accuracy,
        time_seconds=time_seconds,
        max_combo=max_combo,
        questions_answered=questions_answered,
        questions_correct=questions_correct
    )
    
    # Update assignment
    await assignments.update_one(
        {"id": assignment_id},
        {
            "$push": {"attempts": attempt.model_dump()},
            "$inc": {"total_attempts": 1},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    # Update student stats in class
    await classes.update_one(
        {"id": assignment_doc["class_id"], "students.id": student["id"]},
        {
            "$inc": {
                "students.$.games_played": 1,
                "students.$.total_score": score
            },
            "$set": {
                "students.$.last_activity": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Recalculate assignment stats
    updated_doc = await assignments.find_one({"id": assignment_id}, {"_id": 0})
    attempts = updated_doc.get("attempts", [])
    
    unique_students = len(set(a.get("student_id") for a in attempts))
    avg_accuracy = sum(a.get("accuracy", 0) for a in attempts) / len(attempts) if attempts else 0
    avg_score = sum(a.get("score", 0) for a in attempts) / len(attempts) if attempts else 0
    
    await assignments.update_one(
        {"id": assignment_id},
        {
            "$set": {
                "students_completed": unique_students,
                "average_accuracy": round(avg_accuracy, 2),
                "average_score": round(avg_score, 2)
            }
        }
    )
    
    return {
        "success": True,
        "attempt_id": attempt.id,
        "message": "Result submitted successfully"
    }


@router.post("/assignments/{assignment_id}/sync-grades")
async def sync_grades_to_lms(
    assignment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Sync all unsynced grades to the LMS (Google Classroom).
    """
    assignments = get_assignments_collection()
    tokens = get_integration_tokens_collection()
    
    # Get assignment
    assignment_doc = await assignments.find_one(
        {"id": assignment_id, "teacher_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not assignment_doc:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    if not assignment_doc.get("external_assignment_id"):
        raise HTTPException(status_code=400, detail="Assignment not linked to LMS")
    
    # Get token
    token_doc = await tokens.find_one(
        {"user_id": current_user["id"], "provider": "google_classroom"},
        {"_id": 0}
    )
    
    if not token_doc:
        raise HTTPException(status_code=400, detail="Google Classroom not connected")
    
    service = get_google_classroom_service(token_doc.get("session_token", ""))
    
    # Get grade metric
    grade_metric = assignment_doc.get("grade_metric", "accuracy")
    points_possible = assignment_doc.get("points_possible", 100)
    
    # Group attempts by student and get best/latest based on metric
    student_grades = {}
    for attempt in assignment_doc.get("attempts", []):
        student_id = attempt.get("student_id")
        student_ext_id = attempt.get("student_external_id")
        
        if not student_ext_id:
            continue
        
        # Calculate grade based on metric
        if grade_metric == "accuracy":
            grade_score = attempt.get("accuracy", 0)  # 0-100
        elif grade_metric == "score":
            grade_score = attempt.get("score", 0) / 1000 * 100  # Normalize to 0-100
        else:
            grade_score = attempt.get("accuracy", 0)
        
        if grade_metric == "best_attempt":
            if student_id not in student_grades or grade_score > student_grades[student_id]["score"]:
                student_grades[student_id] = {
                    "external_id": student_ext_id,
                    "score": grade_score,
                    "attempt_id": attempt.get("id")
                }
        else:  # latest or single
            student_grades[student_id] = {
                "external_id": student_ext_id,
                "score": grade_score,
                "attempt_id": attempt.get("id")
            }
    
    # Submit grades
    synced = 0
    failed = 0
    
    for student_id, grade_data in student_grades.items():
        submission = GradeSubmission(
            student_external_id=grade_data["external_id"],
            assignment_external_id=assignment_doc["external_assignment_id"],
            score=grade_data["score"] / 100,  # Convert to 0-1
            points_earned=grade_data["score"] / 100 * points_possible,
            points_possible=points_possible
        )
        
        success = await service.submit_grade(submission)
        
        if success:
            # Mark attempt as synced
            await assignments.update_one(
                {"id": assignment_id, "attempts.id": grade_data["attempt_id"]},
                {
                    "$set": {
                        "attempts.$.grade_synced": True,
                        "attempts.$.grade_synced_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            synced += 1
        else:
            failed += 1
    
    return {
        "success": True,
        "synced": synced,
        "failed": failed,
        "total": len(student_grades)
    }


# ==================== Helper Functions ====================

def assignment_from_db(doc: dict) -> Assignment:
    """Convert MongoDB document to Assignment model."""
    if isinstance(doc.get('created_at'), str):
        doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    if isinstance(doc.get('updated_at'), str):
        doc['updated_at'] = datetime.fromisoformat(doc['updated_at'])
    if doc.get('due_date') and isinstance(doc['due_date'], str):
        doc['due_date'] = datetime.fromisoformat(doc['due_date'])
    
    return Assignment(
        id=doc["id"],
        teacher_id=doc["teacher_id"],
        game_id=doc["game_id"],
        class_id=doc["class_id"],
        title=doc["title"],
        instructions=doc.get("instructions"),
        status=doc["status"],
        grade_metric=doc.get("grade_metric", "accuracy"),
        points_possible=doc.get("points_possible", 100),
        allow_multiple_attempts=doc.get("allow_multiple_attempts", True),
        max_attempts=doc.get("max_attempts"),
        due_date=doc.get("due_date"),
        sync_to_lms=doc.get("sync_to_lms", False),
        external_assignment_id=doc.get("external_assignment_id"),
        total_attempts=doc.get("total_attempts", 0),
        students_completed=doc.get("students_completed", 0),
        average_score=doc.get("average_score", 0),
        average_accuracy=doc.get("average_accuracy", 0),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"]
    )


def assignment_with_attempts_from_db(doc: dict) -> AssignmentWithAttempts:
    """Convert MongoDB document to AssignmentWithAttempts model."""
    base = assignment_from_db(doc)
    
    attempts = []
    for a in doc.get("attempts", []):
        if isinstance(a.get('completed_at'), str):
            a['completed_at'] = datetime.fromisoformat(a['completed_at'])
        if a.get('started_at') and isinstance(a['started_at'], str):
            a['started_at'] = datetime.fromisoformat(a['started_at'])
        if a.get('grade_synced_at') and isinstance(a['grade_synced_at'], str):
            a['grade_synced_at'] = datetime.fromisoformat(a['grade_synced_at'])
        attempts.append(StudentAttempt(**a))
    
    return AssignmentWithAttempts(
        **base.model_dump(),
        attempts=attempts
    )
