"""
Student Router - Student-facing endpoints for assignments and gameplay.
Students login via class join code + name (no password required for MVP).
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import logging
import uuid

from core.database import get_database
from core.security import create_access_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/student", tags=["Student"])


def get_classes_collection():
    db = get_database()
    return db["classes"]


def get_assignments_collection():
    db = get_database()
    return db["assignments"]


def get_games_collection():
    db = get_database()
    return db["games"]


def get_student_sessions_collection():
    db = get_database()
    return db["student_sessions"]


# ==================== Schemas ====================

class StudentLoginRequest(BaseModel):
    """Student login via join code + name."""
    join_code: str = Field(..., min_length=4, max_length=20)
    student_name: str = Field(..., min_length=1, max_length=100)
    email: Optional[str] = None  # Optional for matching


class StudentLoginResponse(BaseModel):
    """Student login response with session token."""
    success: bool
    token: str
    student: dict
    class_info: dict


class StudentAssignment(BaseModel):
    """Assignment info for student view."""
    id: str
    title: str
    instructions: Optional[str]
    game_id: str
    game_title: str
    game_type: str
    due_date: Optional[datetime]
    points_possible: int
    allow_multiple_attempts: bool
    max_attempts: Optional[int]
    my_attempts: int
    my_best_score: Optional[int]
    my_best_accuracy: Optional[float]
    status: str  # pending, completed, overdue
    class_name: str


class StudentDashboard(BaseModel):
    """Student dashboard data."""
    student: dict
    class_info: dict
    assignments: List[StudentAssignment]
    stats: dict


class GameCompletionRequest(BaseModel):
    """Submit game completion for an assignment."""
    score: int = 0
    accuracy: float = 0.0
    time_seconds: int = 0
    max_combo: int = 0
    questions_answered: int = 0
    questions_correct: int = 0


# ==================== Student Auth ====================

async def get_current_student(token: str = Depends(lambda: None)):
    """
    Dependency to get current student from token.
    For MVP, we use a simple token-based auth.
    """
    # This will be implemented via header extraction
    pass


@router.post("/login", response_model=StudentLoginResponse)
async def student_login(request: StudentLoginRequest):
    """
    Student login via class join code and name.
    Matches student to a StudentEnrollment in the class.
    Creates a session token for the student.
    """
    classes = get_classes_collection()
    sessions = get_student_sessions_collection()
    
    # Find class by join code (case insensitive)
    class_doc = await classes.find_one(
        {"join_code": {"$regex": f"^{request.join_code}$", "$options": "i"}},
        {"_id": 0}
    )
    
    if not class_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid join code. Please check with your teacher."
        )
    
    # Find matching student in class
    students = class_doc.get("students", [])
    matched_student = None
    
    # Normalize the input name for matching
    input_name = request.student_name.strip().lower()
    input_email = request.email.strip().lower() if request.email else None
    
    for student in students:
        if student.get("status") != "active":
            continue
            
        # Try to match by email first (most reliable)
        if input_email and student.get("email"):
            if student["email"].lower() == input_email:
                matched_student = student
                break
        
        # Match by display name
        display_name = student.get("display_name", "").lower()
        if display_name == input_name:
            matched_student = student
            break
        
        # Match by first name + last name
        first_name = student.get("first_name", "").lower()
        last_name = student.get("last_name", "").lower()
        full_name = f"{first_name} {last_name}".strip()
        
        if full_name == input_name or first_name == input_name:
            matched_student = student
            break
    
    if not matched_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found in this class. Please check your name or contact your teacher."
        )
    
    # Create session token
    session_id = str(uuid.uuid4())
    token_data = {
        "sub": matched_student["id"],
        "type": "student",
        "class_id": class_doc["id"],
        "session_id": session_id
    }
    
    token = create_access_token(data=token_data)
    
    # Store session
    session_doc = {
        "id": session_id,
        "student_id": matched_student["id"],
        "class_id": class_doc["id"],
        "token": token,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_activity": datetime.now(timezone.utc).isoformat(),
        "is_active": True
    }
    
    await sessions.insert_one(session_doc)
    
    logger.info(f"Student logged in: {matched_student['display_name']} to class {class_doc['name']}")
    
    return StudentLoginResponse(
        success=True,
        token=token,
        student={
            "id": matched_student["id"],
            "display_name": matched_student["display_name"],
            "email": matched_student.get("email"),
            "first_name": matched_student.get("first_name"),
            "last_name": matched_student.get("last_name")
        },
        class_info={
            "id": class_doc["id"],
            "name": class_doc["name"],
            "subject": class_doc.get("subject"),
            "teacher_id": class_doc["teacher_id"]
        }
    )


@router.get("/verify")
async def verify_student_session(
    token: str = Query(..., description="Student session token")
):
    """Verify a student session token and return student info."""
    from core.security import decode_token
    
    try:
        payload = decode_token(token)
        
        if payload.get("type") != "student":
            raise HTTPException(status_code=401, detail="Invalid student token")
        
        student_id = payload.get("sub")
        class_id = payload.get("class_id")
        
        # Get class and student info
        classes = get_classes_collection()
        class_doc = await classes.find_one({"id": class_id}, {"_id": 0})
        
        if not class_doc:
            raise HTTPException(status_code=404, detail="Class not found")
        
        # Find student
        student = None
        for s in class_doc.get("students", []):
            if s["id"] == student_id:
                student = s
                break
        
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        return {
            "valid": True,
            "student": {
                "id": student["id"],
                "display_name": student["display_name"],
                "email": student.get("email")
            },
            "class_info": {
                "id": class_doc["id"],
                "name": class_doc["name"],
                "subject": class_doc.get("subject")
            }
        }
        
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ==================== Student Dashboard ====================

@router.get("/dashboard")
async def get_student_dashboard(
    token: str = Query(..., description="Student session token")
):
    """
    Get student dashboard with assignments and stats.
    """
    from core.security import decode_token
    
    # Verify token
    try:
        payload = decode_token(token)
        if payload.get("type") != "student":
            raise HTTPException(status_code=401, detail="Invalid student token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    student_id = payload.get("sub")
    class_id = payload.get("class_id")
    
    classes = get_classes_collection()
    assignments_coll = get_assignments_collection()
    games = get_games_collection()
    
    # Get class info
    class_doc = await classes.find_one({"id": class_id}, {"_id": 0})
    if not class_doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Find student
    student = None
    for s in class_doc.get("students", []):
        if s["id"] == student_id:
            student = s
            break
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get assignments for this class
    cursor = assignments_coll.find(
        {"class_id": class_id, "status": {"$in": ["active", "completed"]}},
        {"_id": 0}
    ).sort("due_date", 1)
    
    assignment_list = []
    total_completed = 0
    total_score = 0
    total_accuracy = 0
    accuracy_count = 0
    
    async for assignment_doc in cursor:
        # Get game info
        game = await games.find_one({"id": assignment_doc["game_id"]}, {"_id": 0})
        if not game:
            continue
        
        # Get student's attempts for this assignment
        my_attempts = [
            a for a in assignment_doc.get("attempts", [])
            if a.get("student_id") == student_id
        ]
        
        my_best_score = max([a.get("score", 0) for a in my_attempts], default=None) if my_attempts else None
        my_best_accuracy = max([a.get("accuracy", 0) for a in my_attempts], default=None) if my_attempts else None
        
        # Determine status
        now = datetime.now(timezone.utc)
        due_date = None
        if assignment_doc.get("due_date"):
            if isinstance(assignment_doc["due_date"], str):
                due_date = datetime.fromisoformat(assignment_doc["due_date"].replace('Z', '+00:00'))
            else:
                due_date = assignment_doc["due_date"]
        
        if my_attempts:
            status = "completed"
            total_completed += 1
            if my_best_score:
                total_score += my_best_score
            if my_best_accuracy:
                total_accuracy += my_best_accuracy
                accuracy_count += 1
        elif due_date and due_date < now:
            status = "overdue"
        else:
            status = "pending"
        
        # Get game type
        game_type = game.get("spec", {}).get("meta", {}).get("game_type", "quiz")
        
        assignment_list.append(StudentAssignment(
            id=assignment_doc["id"],
            title=assignment_doc["title"],
            instructions=assignment_doc.get("instructions"),
            game_id=assignment_doc["game_id"],
            game_title=game.get("title", "Untitled Game"),
            game_type=game_type,
            due_date=due_date,
            points_possible=assignment_doc.get("points_possible", 100),
            allow_multiple_attempts=assignment_doc.get("allow_multiple_attempts", True),
            max_attempts=assignment_doc.get("max_attempts"),
            my_attempts=len(my_attempts),
            my_best_score=my_best_score,
            my_best_accuracy=my_best_accuracy,
            status=status,
            class_name=class_doc["name"]
        ))
    
    # Calculate stats
    avg_accuracy = total_accuracy / accuracy_count if accuracy_count > 0 else 0
    
    return StudentDashboard(
        student={
            "id": student["id"],
            "display_name": student["display_name"],
            "email": student.get("email"),
            "games_played": student.get("games_played", 0),
            "total_score": student.get("total_score", 0),
            "avg_accuracy": student.get("avg_accuracy", 0)
        },
        class_info={
            "id": class_doc["id"],
            "name": class_doc["name"],
            "subject": class_doc.get("subject"),
            "grade_level": class_doc.get("grade_level")
        },
        assignments=assignment_list,
        stats={
            "total_assignments": len(assignment_list),
            "completed": total_completed,
            "pending": len([a for a in assignment_list if a.status == "pending"]),
            "overdue": len([a for a in assignment_list if a.status == "overdue"]),
            "average_accuracy": round(avg_accuracy, 1),
            "total_score": total_score
        }
    )


# ==================== Assignment Details ====================

@router.get("/assignment/{assignment_id}")
async def get_student_assignment(
    assignment_id: str,
    token: str = Query(..., description="Student session token")
):
    """
    Get assignment details for a student, including game info.
    """
    from core.security import decode_token
    
    # Verify token
    try:
        payload = decode_token(token)
        if payload.get("type") != "student":
            raise HTTPException(status_code=401, detail="Invalid student token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    student_id = payload.get("sub")
    class_id = payload.get("class_id")
    
    assignments_coll = get_assignments_collection()
    games = get_games_collection()
    classes = get_classes_collection()
    
    # Get assignment
    assignment_doc = await assignments_coll.find_one(
        {"id": assignment_id, "class_id": class_id},
        {"_id": 0}
    )
    
    if not assignment_doc:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Get game
    game = await games.find_one({"id": assignment_doc["game_id"]}, {"_id": 0})
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Get class for leaderboard
    class_doc = await classes.find_one({"id": class_id}, {"_id": 0})
    
    # Get student's attempts
    my_attempts = [
        a for a in assignment_doc.get("attempts", [])
        if a.get("student_id") == student_id
    ]
    
    # Build class leaderboard for this assignment
    leaderboard = []
    student_map = {s["id"]: s for s in class_doc.get("students", [])}
    
    # Get best attempt per student
    best_by_student = {}
    for attempt in assignment_doc.get("attempts", []):
        sid = attempt.get("student_id")
        score = attempt.get("score", 0)
        if sid not in best_by_student or score > best_by_student[sid]["score"]:
            best_by_student[sid] = attempt
    
    # Build leaderboard
    sorted_attempts = sorted(best_by_student.values(), key=lambda x: x.get("score", 0), reverse=True)
    for rank, attempt in enumerate(sorted_attempts[:10], 1):
        sid = attempt.get("student_id")
        student_info = student_map.get(sid, {})
        
        # Anonymize if settings require
        settings = class_doc.get("settings", {})
        if settings.get("leaderboard_anonymous"):
            display_name = f"Student {rank}"
        else:
            display_name = student_info.get("display_name", "Unknown")
        
        leaderboard.append({
            "rank": rank,
            "student_name": display_name,
            "score": attempt.get("score", 0),
            "accuracy": attempt.get("accuracy", 0),
            "is_me": sid == student_id
        })
    
    # Check if can attempt
    can_attempt = True
    max_attempts = assignment_doc.get("max_attempts")
    if max_attempts and len(my_attempts) >= max_attempts:
        can_attempt = False
    
    return {
        "assignment": {
            "id": assignment_doc["id"],
            "title": assignment_doc["title"],
            "instructions": assignment_doc.get("instructions"),
            "due_date": assignment_doc.get("due_date"),
            "points_possible": assignment_doc.get("points_possible", 100),
            "allow_multiple_attempts": assignment_doc.get("allow_multiple_attempts", True),
            "max_attempts": max_attempts
        },
        "game": {
            "id": game["id"],
            "title": game.get("title"),
            "game_type": game.get("spec", {}).get("meta", {}).get("game_type", "quiz"),
            "description": game.get("description")
        },
        "my_attempts": my_attempts,
        "can_attempt": can_attempt,
        "leaderboard": leaderboard
    }


# ==================== Submit Completion ====================

@router.post("/assignment/{assignment_id}/complete")
async def submit_assignment_completion(
    assignment_id: str,
    request: GameCompletionRequest,
    token: str = Query(..., description="Student session token")
):
    """
    Submit game completion for an assignment.
    Called when student finishes playing a game.
    """
    from core.security import decode_token
    from models.assignment import StudentAttempt
    
    # Verify token
    try:
        payload = decode_token(token)
        if payload.get("type") != "student":
            raise HTTPException(status_code=401, detail="Invalid student token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    student_id = payload.get("sub")
    class_id = payload.get("class_id")
    
    assignments_coll = get_assignments_collection()
    classes = get_classes_collection()
    
    # Get assignment
    assignment_doc = await assignments_coll.find_one(
        {"id": assignment_id, "class_id": class_id},
        {"_id": 0}
    )
    
    if not assignment_doc:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Get class and student for external ID
    class_doc = await classes.find_one({"id": class_id}, {"_id": 0})
    student = None
    for s in class_doc.get("students", []):
        if s["id"] == student_id:
            student = s
            break
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check max attempts
    existing_attempts = [
        a for a in assignment_doc.get("attempts", [])
        if a.get("student_id") == student_id
    ]
    
    max_attempts = assignment_doc.get("max_attempts")
    if max_attempts and len(existing_attempts) >= max_attempts:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum attempts ({max_attempts}) reached"
        )
    
    # Create attempt record
    attempt = StudentAttempt(
        student_id=student_id,
        student_external_id=student.get("external_id"),
        score=request.score,
        accuracy=request.accuracy,
        time_seconds=request.time_seconds,
        max_combo=request.max_combo,
        questions_answered=request.questions_answered,
        questions_correct=request.questions_correct
    )
    
    # Update assignment with new attempt
    await assignments_coll.update_one(
        {"id": assignment_id},
        {
            "$push": {"attempts": attempt.model_dump()},
            "$inc": {"total_attempts": 1},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    # Update student stats in class
    await classes.update_one(
        {"id": class_id, "students.id": student_id},
        {
            "$inc": {
                "students.$.games_played": 1,
                "students.$.total_score": request.score
            },
            "$set": {
                "students.$.last_activity": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Recalculate assignment stats
    updated_doc = await assignments_coll.find_one({"id": assignment_id}, {"_id": 0})
    attempts = updated_doc.get("attempts", [])
    
    unique_students = len(set(a.get("student_id") for a in attempts))
    avg_accuracy = sum(a.get("accuracy", 0) for a in attempts) / len(attempts) if attempts else 0
    avg_score = sum(a.get("score", 0) for a in attempts) / len(attempts) if attempts else 0
    
    await assignments_coll.update_one(
        {"id": assignment_id},
        {
            "$set": {
                "students_completed": unique_students,
                "average_accuracy": round(avg_accuracy, 2),
                "average_score": round(avg_score, 2)
            }
        }
    )
    
    logger.info(f"Student {student['display_name']} completed assignment {assignment_id} with score {request.score}")
    
    return {
        "success": True,
        "attempt_id": attempt.id,
        "score": request.score,
        "accuracy": request.accuracy,
        "message": "Great job! Your result has been recorded."
    }


# ==================== Leaderboard ====================

@router.get("/leaderboard/{class_id}")
async def get_class_leaderboard(
    class_id: str,
    token: str = Query(..., description="Student session token"),
    limit: int = Query(10, ge=1, le=50)
):
    """
    Get class leaderboard showing top students by total score.
    """
    from core.security import decode_token
    
    # Verify token
    try:
        payload = decode_token(token)
        if payload.get("type") != "student":
            raise HTTPException(status_code=401, detail="Invalid student token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    student_id = payload.get("sub")
    token_class_id = payload.get("class_id")
    
    # Students can only see their own class leaderboard
    if class_id != token_class_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    classes = get_classes_collection()
    
    class_doc = await classes.find_one({"id": class_id}, {"_id": 0})
    if not class_doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    settings = class_doc.get("settings", {})
    students = class_doc.get("students", [])
    
    # Sort by total score
    sorted_students = sorted(
        [s for s in students if s.get("status") == "active"],
        key=lambda x: x.get("total_score", 0),
        reverse=True
    )
    
    leaderboard = []
    for rank, student in enumerate(sorted_students[:limit], 1):
        if settings.get("leaderboard_anonymous"):
            display_name = f"Student {rank}"
        else:
            display_name = student.get("display_name", "Unknown")
        
        leaderboard.append({
            "rank": rank,
            "student_name": display_name,
            "total_score": student.get("total_score", 0),
            "games_played": student.get("games_played", 0),
            "avg_accuracy": round(student.get("avg_accuracy", 0), 1),
            "is_me": student["id"] == student_id
        })
    
    # Find current student's rank if not in top
    my_rank = None
    for i, student in enumerate(sorted_students, 1):
        if student["id"] == student_id:
            my_rank = i
            break
    
    return {
        "class_name": class_doc["name"],
        "leaderboard": leaderboard,
        "my_rank": my_rank,
        "total_students": len(sorted_students)
    }
