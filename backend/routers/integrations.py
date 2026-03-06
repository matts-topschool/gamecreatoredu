"""
Integrations Router - LMS/SIS OAuth flow, roster sync, grade sync, and file imports.
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query, Request, Response, UploadFile, File, Form
from fastapi.responses import RedirectResponse
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
import httpx
import logging
import os
import urllib.parse

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
from services.integrations import SUPPORTED_PROVIDERS, PROVIDER_CATEGORIES, REGIONS, GradeSubmission
from services.google_classroom import GoogleClassroomService, get_google_classroom_service
from services.ctf_parser import parse_ctf_file, parse_csv_students, STANDARD_CSV_MAPPINGS, CTFParseResult

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/integrations", tags=["Integrations"])

# Emergent Auth endpoint for session data (for basic login, not Classroom)
EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

# Google OAuth for Classroom (direct integration)
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI", "")
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"

# Required scopes for Google Classroom
GOOGLE_CLASSROOM_SCOPES = [
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.rosters.readonly",
    "https://www.googleapis.com/auth/classroom.coursework.students",
    "https://www.googleapis.com/auth/classroom.profile.emails",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]


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
async def list_providers(
    region: Optional[str] = Query(None, description="Filter by region: global, us, uk"),
    category: Optional[str] = Query(None, description="Filter by category: lms, sis, mis, integration, file_import")
):
    """
    List all supported LMS/SIS integration providers.
    Returns which are available vs coming soon.
    """
    providers = SUPPORTED_PROVIDERS
    
    # Filter by region
    if region:
        providers = [p for p in providers if p.get("region") == region or p.get("region") == "global"]
    
    # Filter by category
    if category:
        providers = [p for p in providers if p.get("category") == category]
    
    return {
        "providers": [
            {
                **p,
                "available": not p.get("coming_soon", False)
            }
            for p in providers
        ],
        "categories": PROVIDER_CATEGORIES,
        "regions": REGIONS,
        "total": len(providers)
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
    
    For Google Classroom, uses direct Google OAuth with Classroom scopes.
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
    
    # Check if Google OAuth is configured
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Google Classroom integration not configured. Please contact administrator."
        )
    
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
    
    # Build Google OAuth URL with Classroom scopes
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(GOOGLE_CLASSROOM_SCOPES),
        "state": state_id,
        "access_type": "offline",  # Get refresh token
        "prompt": "consent",  # Always show consent to get refresh token
        "include_granted_scopes": "true"
    }
    
    auth_url = f"{GOOGLE_AUTH_URL}?{urllib.parse.urlencode(params)}"
    
    logger.info(f"Initiating Google Classroom OAuth for user {current_user['id']}")
    
    return {
        "auth_url": auth_url,
        "state_id": state_id,
        "provider": request.provider
    }


@router.get("/google/callback")
async def google_oauth_callback(
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    error_description: Optional[str] = Query(None)
):
    """
    Google OAuth callback - exchanges authorization code for tokens.
    This is the redirect URI registered with Google Cloud Console.
    """
    if error:
        logger.error(f"Google OAuth error: {error} - {error_description}")
        # Redirect to frontend with error
        return RedirectResponse(
            url=f"https://impl-framework.preview.emergentagent.com/integrations?error={error}"
        )
    
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")
    
    tokens = get_integration_tokens_collection()
    
    # Look up the pending OAuth state
    pending = None
    if state:
        pending = await tokens.find_one({"state_id": state}, {"_id": 0})
        if not pending:
            logger.warning(f"OAuth state not found: {state}")
    
    if not pending:
        return RedirectResponse(
            url="https://impl-framework.preview.emergentagent.com/integrations?error=invalid_state"
        )
    
    user_id = pending["user_id"]
    original_redirect = pending.get("redirect_uri", "https://impl-framework.preview.emergentagent.com/integrations")
    
    # Exchange authorization code for tokens
    try:
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uri": GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code"
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if token_response.status_code != 200:
                logger.error(f"Token exchange failed: {token_response.status_code} - {token_response.text}")
                return RedirectResponse(
                    url=f"{original_redirect}?error=token_exchange_failed"
                )
            
            token_data = token_response.json()
            logger.info(f"Google token exchange successful. Keys: {list(token_data.keys())}")
            
            access_token = token_data.get("access_token")
            refresh_token = token_data.get("refresh_token")
            expires_in = token_data.get("expires_in", 3600)
            
            # Get user info from Google
            userinfo_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            user_info = {}
            if userinfo_response.status_code == 200:
                user_info = userinfo_response.json()
                logger.info(f"Got Google user info: {user_info.get('email')}")
    
    except Exception as e:
        logger.error(f"Token exchange error: {e}")
        return RedirectResponse(
            url=f"{original_redirect}?error=token_exchange_error"
        )
    
    # Store the tokens
    token_doc = {
        "user_id": user_id,
        "provider": "google_classroom",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_expires_at": (datetime.now(timezone.utc) + timedelta(seconds=expires_in)).isoformat(),
        "email": user_info.get("email"),
        "name": user_info.get("name"),
        "picture": user_info.get("picture"),
        "connected_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()  # Refresh token valid longer
    }
    
    # Store the tokens - first delete any pending states for this user
    await tokens.delete_many({
        "user_id": user_id,
        "provider": "google_classroom"
    })
    
    # Insert fresh token document
    await tokens.insert_one(token_doc)
    
    logger.info(f"Google Classroom tokens stored for user {user_id} ({user_info.get('email')})")
    
    # Redirect to the Google Courses page
    return RedirectResponse(
        url="https://impl-framework.preview.emergentagent.com/integrations/google_classroom/courses?connected=true"
    )


@router.get("/oauth/callback")
async def oauth_callback_legacy(
    session_id: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None)
):
    """
    Legacy OAuth callback from Emergent Auth (for backwards compatibility).
    New integrations should use /google/callback directly.
    """
    if error:
        raise HTTPException(status_code=400, detail=f"OAuth error: {error}")
    
    # Redirect to integrations page
    return RedirectResponse(url="https://impl-framework.preview.emergentagent.com/integrations")


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
            "region": p.get("region", "global"),
            "category": p.get("category", "lms"),
            "connected": False
        }
        
        if p["id"] in connected:
            provider_status.update(connected[p["id"]])
        
        result.append(provider_status)
    
    return {
        "providers": result,
        "categories": PROVIDER_CATEGORIES,
        "regions": REGIONS
    }


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


async def refresh_google_access_token(token_doc: dict) -> str:
    """
    Refresh a Google access token using the refresh token.
    Returns the new access token.
    """
    refresh_token = token_doc.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=400,
            detail="No refresh token available. Please reconnect Google Classroom."
        )
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token"
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code != 200:
                logger.error(f"Token refresh failed: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=400,
                    detail="Failed to refresh Google token. Please reconnect."
                )
            
            token_data = response.json()
            new_access_token = token_data.get("access_token")
            expires_in = token_data.get("expires_in", 3600)
            
            # Update the stored token
            tokens = get_integration_tokens_collection()
            await tokens.update_one(
                {"user_id": token_doc["user_id"], "provider": "google_classroom"},
                {
                    "$set": {
                        "access_token": new_access_token,
                        "token_expires_at": (datetime.now(timezone.utc) + timedelta(seconds=expires_in)).isoformat()
                    }
                }
            )
            
            logger.info(f"Refreshed Google access token for user {token_doc['user_id']}")
            return new_access_token
            
    except httpx.RequestError as e:
        logger.error(f"Token refresh request error: {e}")
        raise HTTPException(status_code=500, detail="Failed to refresh token")


async def get_valid_google_token(current_user: dict) -> str:
    """
    Get a valid Google access token for the current user.
    Refreshes if expired.
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
    
    access_token = token_doc.get("access_token")
    
    if not access_token:
        raise HTTPException(
            status_code=400,
            detail="Google Classroom token missing. Please reconnect."
        )
    
    # Check if token is expired
    token_expires_at = token_doc.get("token_expires_at")
    if token_expires_at:
        try:
            if isinstance(token_expires_at, str):
                expires_at = datetime.fromisoformat(token_expires_at.replace('Z', '+00:00'))
            else:
                expires_at = token_expires_at
            
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            
            # Refresh if within 5 minutes of expiry
            if expires_at < datetime.now(timezone.utc) + timedelta(minutes=5):
                logger.info("Access token expiring soon, refreshing...")
                access_token = await refresh_google_access_token(token_doc)
        except Exception as e:
            logger.warning(f"Could not parse token expiry: {e}")
    
    return access_token


# ==================== Google Classroom Operations ====================

@router.get("/google/courses")
async def list_google_courses(
    current_user: dict = Depends(get_current_user)
):
    """
    List courses from Google Classroom where user is a teacher.
    """
    # Get a valid access token (refreshes if needed)
    access_token = await get_valid_google_token(current_user)
    
    service = get_google_classroom_service(access_token)
    
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
    # Get valid access token
    access_token = await get_valid_google_token(current_user)
    service = get_google_classroom_service(access_token)
    
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
    
    # Get valid access token
    access_token = await get_valid_google_token(current_user)
    service = get_google_classroom_service(access_token)
    
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
            access_token = token_doc.get("access_token") or token_doc.get("session_token", "")
            service = get_google_classroom_service(access_token)
            
            # Build game URL - include assignment context
            frontend_url = os.environ.get("FRONTEND_URL", "https://impl-framework.preview.emergentagent.com")
            game_url = f"{frontend_url}/play/{request.game_id}?assignment={assignment.id}&student=true"
            
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
    
    access_token = token_doc.get("access_token") or token_doc.get("session_token", "")
    service = get_google_classroom_service(access_token)
    
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



# ==================== File Import Endpoints ====================

class FileImportPreview(BaseModel):
    """Preview result from file parsing."""
    success: bool
    file_type: str  # ctf, csv
    version: Optional[str] = None
    source_school: Optional[Dict[str, str]] = None
    students_found: int
    students: List[Dict[str, Any]]  # First 10 for preview
    errors: List[str]
    warnings: List[str]
    suggested_mapping: Optional[Dict[str, str]] = None


@router.post("/import/preview")
async def preview_file_import(
    file: UploadFile = File(...),
    file_type: str = Form("auto"),  # auto, ctf, csv
    csv_format: Optional[str] = Form(None),  # sims, arbor, bromcom, generic
    current_user: dict = Depends(get_current_user)
):
    """
    Preview a file import without creating students.
    Detects file type and parses student data for preview.
    
    Supports:
    - CTF files (.ctf, .xml) - UK Common Transfer Format
    - CSV files (.csv) - Various formats from different MIS
    """
    content = await file.read()
    filename = file.filename or "upload"
    
    # Auto-detect file type
    if file_type == "auto":
        if filename.lower().endswith('.ctf') or filename.lower().endswith('.xml'):
            # Check if it's CTF by looking for CTF-specific tags
            content_preview = content[:2000].decode('utf-8', errors='ignore').lower()
            if 'ctf' in content_preview or 'pupil' in content_preview or '<header>' in content_preview:
                file_type = "ctf"
            else:
                file_type = "csv" if filename.lower().endswith('.csv') else "ctf"
        elif filename.lower().endswith('.csv'):
            file_type = "csv"
        else:
            file_type = "csv"  # Default to CSV
    
    result: CTFParseResult
    suggested_mapping = None
    
    if file_type == "ctf":
        result = parse_ctf_file(content, filename)
    else:
        # CSV parsing
        mapping = STANDARD_CSV_MAPPINGS.get(csv_format, STANDARD_CSV_MAPPINGS["generic"])
        result = parse_csv_students(content, mapping)
        suggested_mapping = mapping
    
    # Convert students for preview (max 10)
    preview_students = []
    for student in result.students[:10]:
        preview_students.append({
            "forename": student.forename,
            "surname": student.surname,
            "email": student.email,
            "upn": student.upn,
            "year_group": student.year_group,
            "registration_group": student.registration_group
        })
    
    return FileImportPreview(
        success=result.success,
        file_type=file_type,
        version=result.version,
        source_school=result.source_school,
        students_found=len(result.students),
        students=preview_students,
        errors=result.errors,
        warnings=result.warnings[:10],  # Limit warnings
        suggested_mapping=suggested_mapping
    )


class FileImportRequest(BaseModel):
    """Request to import students from a file."""
    class_id: str
    year_group_filter: Optional[str] = None  # Only import specific year group
    registration_group_filter: Optional[str] = None


@router.post("/import/ctf/{class_id}")
async def import_ctf_to_class(
    class_id: str,
    file: UploadFile = File(...),
    year_group_filter: Optional[str] = Form(None),
    registration_group_filter: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Import students from a CTF file into a class.
    Creates StudentEnrollment records for each student.
    """
    classes = get_classes_collection()
    
    # Verify class ownership
    class_doc = await classes.find_one(
        {"id": class_id, "teacher_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not class_doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Parse CTF file
    content = await file.read()
    result = parse_ctf_file(content, file.filename or "upload.ctf")
    
    if not result.success:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse CTF file: {', '.join(result.errors)}"
        )
    
    # Filter students if requested
    students_to_import = result.students
    if year_group_filter:
        students_to_import = [s for s in students_to_import if s.year_group == year_group_filter]
    if registration_group_filter:
        students_to_import = [s for s in students_to_import if s.registration_group == registration_group_filter]
    
    # Get existing student UPNs to avoid duplicates
    existing_students = class_doc.get("students", [])
    existing_upns = {s.get("external_id") for s in existing_students if s.get("external_id")}
    existing_emails = {s.get("email") for s in existing_students if s.get("email")}
    
    # Create enrollments
    added = 0
    skipped = 0
    
    for ctf_student in students_to_import:
        # Skip duplicates
        if ctf_student.upn and ctf_student.upn in existing_upns:
            skipped += 1
            continue
        if ctf_student.email and ctf_student.email in existing_emails:
            skipped += 1
            continue
        
        enrollment = StudentEnrollment(
            display_name=f"{ctf_student.forename} {ctf_student.surname}",
            email=ctf_student.email,
            first_name=ctf_student.forename,
            last_name=ctf_student.surname,
            external_id=ctf_student.upn,
            external_provider=IntProvider.OTHER,
            metadata={
                "year_group": ctf_student.year_group,
                "registration_group": ctf_student.registration_group,
                "imported_from": "ctf",
                "import_date": datetime.now(timezone.utc).isoformat()
            }
        )
        
        await classes.update_one(
            {"id": class_id},
            {"$push": {"students": enrollment.model_dump()}}
        )
        added += 1
        
        # Track new UPN/email
        if ctf_student.upn:
            existing_upns.add(ctf_student.upn)
        if ctf_student.email:
            existing_emails.add(ctf_student.email)
    
    # Update student count
    await classes.update_one(
        {"id": class_id},
        {
            "$inc": {"student_count": added, "active_student_count": added},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    logger.info(f"Imported {added} students from CTF to class {class_id} (skipped {skipped} duplicates)")
    
    return {
        "success": True,
        "students_imported": added,
        "students_skipped": skipped,
        "total_in_file": len(result.students),
        "source_school": result.source_school,
        "ctf_version": result.version,
        "warnings": result.warnings[:5]
    }


@router.post("/import/csv/{class_id}")
async def import_csv_to_class(
    class_id: str,
    file: UploadFile = File(...),
    format: str = Form("generic"),  # sims, arbor, bromcom, generic
    current_user: dict = Depends(get_current_user)
):
    """
    Import students from a CSV file into a class.
    Supports various MIS export formats: SIMS, Arbor, Bromcom, or generic.
    """
    classes = get_classes_collection()
    
    # Verify class ownership
    class_doc = await classes.find_one(
        {"id": class_id, "teacher_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not class_doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Get column mapping
    mapping = STANDARD_CSV_MAPPINGS.get(format, STANDARD_CSV_MAPPINGS["generic"])
    
    # Parse CSV
    content = await file.read()
    result = parse_csv_students(content, mapping)
    
    if not result.success:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse CSV file: {', '.join(result.errors)}"
        )
    
    # Get existing emails to avoid duplicates
    existing_students = class_doc.get("students", [])
    existing_emails = {s.get("email") for s in existing_students if s.get("email")}
    existing_upns = {s.get("external_id") for s in existing_students if s.get("external_id")}
    
    # Create enrollments
    added = 0
    skipped = 0
    
    for csv_student in result.students:
        # Skip duplicates
        if csv_student.upn and csv_student.upn in existing_upns:
            skipped += 1
            continue
        if csv_student.email and csv_student.email in existing_emails:
            skipped += 1
            continue
        
        enrollment = StudentEnrollment(
            display_name=f"{csv_student.forename} {csv_student.surname}",
            email=csv_student.email,
            first_name=csv_student.forename,
            last_name=csv_student.surname,
            external_id=csv_student.upn,
            external_provider=IntProvider.OTHER,
            metadata={
                "year_group": csv_student.year_group,
                "registration_group": csv_student.registration_group,
                "imported_from": f"csv_{format}",
                "import_date": datetime.now(timezone.utc).isoformat()
            }
        )
        
        await classes.update_one(
            {"id": class_id},
            {"$push": {"students": enrollment.model_dump()}}
        )
        added += 1
        
        # Track
        if csv_student.upn:
            existing_upns.add(csv_student.upn)
        if csv_student.email:
            existing_emails.add(csv_student.email)
    
    # Update student count
    await classes.update_one(
        {"id": class_id},
        {
            "$inc": {"student_count": added, "active_student_count": added},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    logger.info(f"Imported {added} students from CSV ({format}) to class {class_id}")
    
    return {
        "success": True,
        "students_imported": added,
        "students_skipped": skipped,
        "total_in_file": len(result.students),
        "format_used": format,
        "warnings": result.warnings[:5]
    }


@router.get("/import/csv-formats")
async def list_csv_formats():
    """List available CSV format mappings."""
    return {
        "formats": [
            {
                "id": "sims",
                "name": "SIMS",
                "description": "Capita SIMS export format",
                "columns": list(STANDARD_CSV_MAPPINGS["sims"].values())
            },
            {
                "id": "arbor",
                "name": "Arbor Education",
                "description": "Arbor MIS export format",
                "columns": list(STANDARD_CSV_MAPPINGS["arbor"].values())
            },
            {
                "id": "bromcom",
                "name": "Bromcom",
                "description": "Bromcom MIS export format", 
                "columns": list(STANDARD_CSV_MAPPINGS["bromcom"].values())
            },
            {
                "id": "generic",
                "name": "Generic",
                "description": "Standard CSV with First Name, Last Name, Email columns",
                "columns": list(STANDARD_CSV_MAPPINGS["generic"].values())
            }
        ]
    }
