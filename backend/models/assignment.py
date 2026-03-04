"""
Assignment Model - Teachers assign games to classes, results sync to gradebook.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid


class GradeMetric(str, Enum):
    """What metric to use for grading."""
    SCORE = "score"  # Raw score points
    ACCURACY = "accuracy"  # Percentage correct
    BEST_ATTEMPT = "best_attempt"  # Best score from multiple attempts
    LATEST_ATTEMPT = "latest_attempt"  # Most recent attempt


class AssignmentStatus(str, Enum):
    """Assignment lifecycle status."""
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class StudentAttempt(BaseModel):
    """A student's attempt at an assigned game."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str  # StudentEnrollment ID
    student_external_id: Optional[str] = None  # Google Classroom student ID
    
    # Attempt data
    score: int = 0
    accuracy: float = 0.0
    time_seconds: int = 0
    max_combo: int = 0
    
    # Game-specific data
    questions_answered: int = 0
    questions_correct: int = 0
    
    # Sync status
    grade_synced: bool = False
    grade_synced_at: Optional[datetime] = None
    sync_error: Optional[str] = None
    
    # Timestamps
    started_at: Optional[datetime] = None
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AssignmentCreate(BaseModel):
    """Schema for creating an assignment."""
    game_id: str
    class_id: str
    
    # Optional settings
    title: Optional[str] = None  # Override game title
    instructions: Optional[str] = None
    due_date: Optional[datetime] = None
    
    # Grading
    grade_metric: GradeMetric = GradeMetric.ACCURACY
    points_possible: int = 100
    allow_multiple_attempts: bool = True
    max_attempts: Optional[int] = None  # None = unlimited
    
    # LMS sync
    sync_to_lms: bool = True
    create_lms_assignment: bool = True  # Create coursework in Google Classroom


class AssignmentUpdate(BaseModel):
    """Schema for updating an assignment."""
    title: Optional[str] = None
    instructions: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[AssignmentStatus] = None
    grade_metric: Optional[GradeMetric] = None
    points_possible: Optional[int] = None


class AssignmentInDB(BaseModel):
    """Assignment as stored in database."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    teacher_id: str
    game_id: str
    class_id: str
    
    # Basic info
    title: str
    instructions: Optional[str] = None
    
    # Status
    status: AssignmentStatus = AssignmentStatus.ACTIVE
    
    # Grading config
    grade_metric: GradeMetric = GradeMetric.ACCURACY
    points_possible: int = 100
    allow_multiple_attempts: bool = True
    max_attempts: Optional[int] = None
    
    # Due date
    due_date: Optional[datetime] = None
    
    # LMS integration
    sync_to_lms: bool = True
    external_assignment_id: Optional[str] = None  # Google Classroom coursework ID
    external_provider: Optional[str] = None
    
    # Student attempts
    attempts: List[StudentAttempt] = Field(default_factory=list)
    
    # Stats (cached)
    total_attempts: int = 0
    students_completed: int = 0
    average_score: float = 0.0
    average_accuracy: float = 0.0
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    def to_mongo_dict(self) -> dict:
        data = self.model_dump()
        data['created_at'] = data['created_at'].isoformat()
        data['updated_at'] = data['updated_at'].isoformat()
        if data.get('due_date'):
            data['due_date'] = data['due_date'].isoformat()
        for attempt in data['attempts']:
            attempt['completed_at'] = attempt['completed_at'].isoformat()
            if attempt.get('started_at'):
                attempt['started_at'] = attempt['started_at'].isoformat()
            if attempt.get('grade_synced_at'):
                attempt['grade_synced_at'] = attempt['grade_synced_at'].isoformat()
        return data


class Assignment(BaseModel):
    """Assignment response schema."""
    id: str
    teacher_id: str
    game_id: str
    class_id: str
    title: str
    instructions: Optional[str]
    status: AssignmentStatus
    grade_metric: GradeMetric
    points_possible: int
    allow_multiple_attempts: bool
    max_attempts: Optional[int]
    due_date: Optional[datetime]
    sync_to_lms: bool
    external_assignment_id: Optional[str]
    total_attempts: int
    students_completed: int
    average_score: float
    average_accuracy: float
    created_at: datetime
    updated_at: datetime


class AssignmentWithAttempts(Assignment):
    """Assignment with full attempt list."""
    attempts: List[StudentAttempt]


class AssignmentSummary(BaseModel):
    """Lightweight assignment info for lists."""
    id: str
    game_id: str
    class_id: str
    title: str
    status: AssignmentStatus
    due_date: Optional[datetime]
    students_completed: int
    total_students: int
    average_accuracy: float
