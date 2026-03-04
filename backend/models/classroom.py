"""
Class model - Represents a classroom with students, supporting Google Classroom and SIS integration.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid


class IntegrationProvider(str, Enum):
    """Supported LMS/SIS integration providers."""
    NONE = "none"
    GOOGLE_CLASSROOM = "google_classroom"
    CANVAS = "canvas"
    CLEVER = "clever"
    CLASSLINK = "classlink"
    POWERSCHOOL = "powerschool"
    SCHOOLOGY = "schoology"


class ClassroomIntegration(BaseModel):
    """External LMS/SIS integration details."""
    provider: IntegrationProvider = IntegrationProvider.NONE
    external_id: Optional[str] = None  # ID in the external system
    external_name: Optional[str] = None
    sync_enabled: bool = True
    last_sync_at: Optional[datetime] = None
    sync_status: str = "never"  # never, syncing, success, error
    sync_error: Optional[str] = None
    
    # Provider-specific data
    metadata: Dict[str, Any] = Field(default_factory=dict)


class StudentEnrollment(BaseModel):
    """A student enrolled in a class."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None  # GameCraft user ID (if registered)
    
    # Student info
    email: Optional[str] = None
    display_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    student_id: Optional[str] = None  # School's student ID
    
    # External integration
    external_id: Optional[str] = None  # ID in Google Classroom/SIS
    external_provider: IntegrationProvider = IntegrationProvider.NONE
    
    # Enrollment status
    status: str = "active"  # active, inactive, removed
    enrolled_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Class-specific stats (cached for quick access)
    games_played: int = 0
    total_score: int = 0
    avg_accuracy: float = 0.0
    last_activity: Optional[datetime] = None


class ClassCreate(BaseModel):
    """Schema for creating a new class."""
    name: str
    description: Optional[str] = None
    grade_level: Optional[int] = None
    subject: Optional[str] = None
    
    # Optional integration setup
    integration: Optional[ClassroomIntegration] = None


class ClassUpdate(BaseModel):
    """Schema for updating a class."""
    name: Optional[str] = None
    description: Optional[str] = None
    grade_level: Optional[int] = None
    subject: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None


class ClassSettings(BaseModel):
    """Class configuration settings."""
    # Leaderboard settings
    leaderboard_public: bool = False  # If true, anyone can see
    leaderboard_anonymous: bool = False  # Show "Student 1" instead of names
    leaderboard_show_rank: bool = True
    leaderboard_show_score: bool = True
    leaderboard_show_accuracy: bool = True
    
    # Privacy settings
    hide_student_names_from_peers: bool = False
    require_approval_for_games: bool = False
    
    # Sync settings
    auto_sync_roster: bool = True
    sync_grades_to_lms: bool = False


class ClassInDB(BaseModel):
    """Class as stored in database."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    teacher_id: str
    
    # Basic info
    name: str
    description: Optional[str] = None
    grade_level: Optional[int] = None
    subject: Optional[str] = None
    
    # Join code for students
    join_code: str = Field(default_factory=lambda: str(uuid.uuid4())[:8].upper())
    
    # Students
    students: List[StudentEnrollment] = Field(default_factory=list)
    
    # Integration
    integration: ClassroomIntegration = Field(default_factory=ClassroomIntegration)
    
    # Settings
    settings: ClassSettings = Field(default_factory=ClassSettings)
    
    # Assigned games
    assigned_game_ids: List[str] = Field(default_factory=list)
    
    # Stats (cached)
    student_count: int = 0
    active_student_count: int = 0
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    def to_mongo_dict(self) -> dict:
        data = self.model_dump()
        data['created_at'] = data['created_at'].isoformat()
        data['updated_at'] = data['updated_at'].isoformat()
        if data['integration'].get('last_sync_at'):
            data['integration']['last_sync_at'] = data['integration']['last_sync_at'].isoformat()
        for student in data['students']:
            student['enrolled_at'] = student['enrolled_at'].isoformat()
            if student.get('last_activity'):
                student['last_activity'] = student['last_activity'].isoformat()
        return data


class Class(BaseModel):
    """Class response schema."""
    id: str
    teacher_id: str
    name: str
    description: Optional[str]
    grade_level: Optional[int]
    subject: Optional[str]
    join_code: str
    student_count: int
    active_student_count: int
    integration: ClassroomIntegration
    settings: ClassSettings
    assigned_game_ids: List[str]
    created_at: datetime
    updated_at: datetime


class ClassWithStudents(Class):
    """Class with full student list."""
    students: List[StudentEnrollment]


class StudentInClass(BaseModel):
    """Simplified student view for lists."""
    id: str
    display_name: str
    email: Optional[str]
    games_played: int
    total_score: int
    avg_accuracy: float
    last_activity: Optional[datetime]
    status: str
