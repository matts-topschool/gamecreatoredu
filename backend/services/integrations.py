"""
Integration Framework - Abstract interfaces for LMS/SIS integrations.
Supports Google Classroom, Canvas, Clever, and other providers.
"""
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class IntegrationStatus(str, Enum):
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    PENDING = "pending"
    ERROR = "error"


class ExternalStudent(BaseModel):
    """Student data from external LMS/SIS."""
    external_id: str
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    display_name: str
    student_id: Optional[str] = None  # School ID
    profile_photo_url: Optional[str] = None
    metadata: Dict[str, Any] = {}


class ExternalClass(BaseModel):
    """Class/Course data from external LMS/SIS."""
    external_id: str
    name: str
    description: Optional[str] = None
    section: Optional[str] = None
    grade_level: Optional[str] = None
    subject: Optional[str] = None
    teacher_email: Optional[str] = None
    student_count: int = 0
    metadata: Dict[str, Any] = {}


class GradeSubmission(BaseModel):
    """Grade data to submit to external LMS."""
    student_external_id: str
    assignment_external_id: str
    score: float  # 0.0 to 1.0 (percentage)
    points_earned: Optional[float] = None
    points_possible: Optional[float] = None
    submission_time: Optional[str] = None
    feedback: Optional[str] = None


class IntegrationProvider(ABC):
    """
    Abstract base class for LMS/SIS integrations.
    Implement this for each provider (Google Classroom, Canvas, etc.)
    """
    
    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return the provider name."""
        pass
    
    @abstractmethod
    async def authenticate(self, credentials: Dict[str, Any]) -> bool:
        """
        Authenticate with the provider.
        Returns True if successful.
        """
        pass
    
    @abstractmethod
    async def get_connection_status(self) -> IntegrationStatus:
        """Check if currently connected."""
        pass
    
    @abstractmethod
    async def list_classes(self) -> List[ExternalClass]:
        """List all classes the teacher has access to."""
        pass
    
    @abstractmethod
    async def get_class(self, class_id: str) -> Optional[ExternalClass]:
        """Get details of a specific class."""
        pass
    
    @abstractmethod
    async def list_students(self, class_id: str) -> List[ExternalStudent]:
        """List all students in a class."""
        pass
    
    @abstractmethod
    async def sync_roster(self, class_id: str) -> Dict[str, Any]:
        """
        Sync roster from LMS to GameCraft.
        Returns sync results (added, removed, updated counts).
        """
        pass
    
    @abstractmethod
    async def submit_grade(self, submission: GradeSubmission) -> bool:
        """
        Submit a grade back to the LMS.
        Returns True if successful.
        """
        pass
    
    @abstractmethod
    async def create_assignment(
        self, 
        class_id: str, 
        title: str, 
        description: str,
        game_url: str,
        due_date: Optional[str] = None,
        points_possible: float = 100
    ) -> Optional[str]:
        """
        Create an assignment in the LMS linked to a GameCraft game.
        Returns the external assignment ID if successful.
        """
        pass


class GoogleClassroomProvider(IntegrationProvider):
    """
    Google Classroom integration.
    Uses Google Classroom API v1.
    """
    
    def __init__(self, user_credentials: Optional[Dict[str, Any]] = None):
        self.credentials = user_credentials
        self.service = None
    
    @property
    def provider_name(self) -> str:
        return "google_classroom"
    
    async def authenticate(self, credentials: Dict[str, Any]) -> bool:
        """
        Authenticate with Google Classroom using OAuth2 credentials.
        
        Required credentials:
        - access_token: OAuth2 access token
        - refresh_token: OAuth2 refresh token (for auto-refresh)
        """
        try:
            # TODO: Implement actual Google API authentication
            # This is a placeholder for the integration framework
            self.credentials = credentials
            logger.info("Google Classroom authentication initiated")
            return True
        except Exception as e:
            logger.error(f"Google Classroom auth failed: {e}")
            return False
    
    async def get_connection_status(self) -> IntegrationStatus:
        if not self.credentials:
            return IntegrationStatus.DISCONNECTED
        # TODO: Validate token
        return IntegrationStatus.CONNECTED
    
    async def list_classes(self) -> List[ExternalClass]:
        """
        List all courses where the user is a teacher.
        Uses: GET https://classroom.googleapis.com/v1/courses
        """
        # TODO: Implement actual API call
        # Placeholder response
        logger.info("Listing Google Classroom courses")
        return []
    
    async def get_class(self, class_id: str) -> Optional[ExternalClass]:
        """
        Get course details.
        Uses: GET https://classroom.googleapis.com/v1/courses/{id}
        """
        # TODO: Implement actual API call
        return None
    
    async def list_students(self, class_id: str) -> List[ExternalStudent]:
        """
        List students in a course.
        Uses: GET https://classroom.googleapis.com/v1/courses/{courseId}/students
        """
        # TODO: Implement actual API call
        logger.info(f"Listing students for course {class_id}")
        return []
    
    async def sync_roster(self, class_id: str) -> Dict[str, Any]:
        """Sync roster from Google Classroom."""
        students = await self.list_students(class_id)
        return {
            "added": 0,
            "removed": 0,
            "updated": 0,
            "total": len(students)
        }
    
    async def submit_grade(self, submission: GradeSubmission) -> bool:
        """
        Submit a grade to Google Classroom.
        Uses: PATCH https://classroom.googleapis.com/v1/courses/{courseId}/courseWork/{courseWorkId}/studentSubmissions/{id}
        """
        # TODO: Implement actual API call
        logger.info(f"Submitting grade for student {submission.student_external_id}")
        return True
    
    async def create_assignment(
        self,
        class_id: str,
        title: str,
        description: str,
        game_url: str,
        due_date: Optional[str] = None,
        points_possible: float = 100
    ) -> Optional[str]:
        """
        Create a coursework assignment in Google Classroom.
        Uses: POST https://classroom.googleapis.com/v1/courses/{courseId}/courseWork
        """
        # TODO: Implement actual API call
        logger.info(f"Creating assignment '{title}' in course {class_id}")
        return None


class CanvasProvider(IntegrationProvider):
    """
    Canvas LMS integration.
    Uses Canvas REST API.
    """
    
    def __init__(self, base_url: str = "", api_token: str = ""):
        self.base_url = base_url
        self.api_token = api_token
    
    @property
    def provider_name(self) -> str:
        return "canvas"
    
    async def authenticate(self, credentials: Dict[str, Any]) -> bool:
        """
        Authenticate with Canvas using API token.
        
        Required credentials:
        - base_url: Canvas instance URL (e.g., https://school.instructure.com)
        - api_token: API access token
        """
        try:
            self.base_url = credentials.get("base_url", "")
            self.api_token = credentials.get("api_token", "")
            logger.info("Canvas authentication initiated")
            return True
        except Exception as e:
            logger.error(f"Canvas auth failed: {e}")
            return False
    
    async def get_connection_status(self) -> IntegrationStatus:
        if not self.api_token:
            return IntegrationStatus.DISCONNECTED
        return IntegrationStatus.CONNECTED
    
    async def list_classes(self) -> List[ExternalClass]:
        """
        List courses.
        Uses: GET /api/v1/courses
        """
        # TODO: Implement actual API call
        return []
    
    async def get_class(self, class_id: str) -> Optional[ExternalClass]:
        """
        Get course details.
        Uses: GET /api/v1/courses/{id}
        """
        return None
    
    async def list_students(self, class_id: str) -> List[ExternalStudent]:
        """
        List students in a course.
        Uses: GET /api/v1/courses/{course_id}/users?enrollment_type[]=student
        """
        return []
    
    async def sync_roster(self, class_id: str) -> Dict[str, Any]:
        students = await self.list_students(class_id)
        return {"added": 0, "removed": 0, "updated": 0, "total": len(students)}
    
    async def submit_grade(self, submission: GradeSubmission) -> bool:
        """
        Submit grade to Canvas.
        Uses: PUT /api/v1/courses/{course_id}/assignments/{assignment_id}/submissions/{user_id}
        """
        return True
    
    async def create_assignment(
        self,
        class_id: str,
        title: str,
        description: str,
        game_url: str,
        due_date: Optional[str] = None,
        points_possible: float = 100
    ) -> Optional[str]:
        """
        Create assignment in Canvas.
        Uses: POST /api/v1/courses/{course_id}/assignments
        """
        return None


class CleverProvider(IntegrationProvider):
    """
    Clever SSO/SIS integration.
    Uses Clever Data API.
    """
    
    def __init__(self, api_token: str = ""):
        self.api_token = api_token
    
    @property
    def provider_name(self) -> str:
        return "clever"
    
    async def authenticate(self, credentials: Dict[str, Any]) -> bool:
        self.api_token = credentials.get("api_token", "")
        return bool(self.api_token)
    
    async def get_connection_status(self) -> IntegrationStatus:
        return IntegrationStatus.CONNECTED if self.api_token else IntegrationStatus.DISCONNECTED
    
    async def list_classes(self) -> List[ExternalClass]:
        # Clever uses "sections" for classes
        return []
    
    async def get_class(self, class_id: str) -> Optional[ExternalClass]:
        return None
    
    async def list_students(self, class_id: str) -> List[ExternalStudent]:
        return []
    
    async def sync_roster(self, class_id: str) -> Dict[str, Any]:
        return {"added": 0, "removed": 0, "updated": 0, "total": 0}
    
    async def submit_grade(self, submission: GradeSubmission) -> bool:
        # Clever doesn't support grade submission
        return False
    
    async def create_assignment(
        self,
        class_id: str,
        title: str,
        description: str,
        game_url: str,
        due_date: Optional[str] = None,
        points_possible: float = 100
    ) -> Optional[str]:
        # Clever doesn't support assignment creation
        return None


# Provider factory
def get_integration_provider(provider_name: str) -> Optional[IntegrationProvider]:
    """Get an integration provider instance by name."""
    providers = {
        "google_classroom": GoogleClassroomProvider,
        "canvas": CanvasProvider,
        "clever": CleverProvider,
    }
    
    provider_class = providers.get(provider_name)
    if provider_class:
        return provider_class()
    return None


# List of supported providers
SUPPORTED_PROVIDERS = [
    # === US & Global Providers ===
    {
        "id": "google_classroom",
        "name": "Google Classroom",
        "description": "Sync classes and students from Google Classroom",
        "features": ["roster_sync", "assignment_creation", "grade_submission"],
        "requires_oauth": True,
        "region": "global",
        "category": "lms"
    },
    {
        "id": "canvas",
        "name": "Canvas LMS",
        "description": "Integrate with Instructure Canvas LMS",
        "features": ["roster_sync", "assignment_creation", "grade_submission"],
        "requires_oauth": False,
        "requires_api_token": True,
        "region": "global",
        "category": "lms",
        "coming_soon": True
    },
    {
        "id": "clever",
        "name": "Clever",
        "description": "SSO and roster sync via Clever",
        "features": ["roster_sync", "sso"],
        "requires_oauth": True,
        "region": "us",
        "category": "sis",
        "coming_soon": True
    },
    {
        "id": "classlink",
        "name": "ClassLink",
        "description": "SSO and roster sync via ClassLink OneRoster",
        "features": ["roster_sync", "sso"],
        "requires_oauth": True,
        "coming_soon": True,
        "region": "us",
        "category": "sis"
    },
    {
        "id": "powerschool",
        "name": "PowerSchool",
        "description": "Integrate with PowerSchool SIS",
        "features": ["roster_sync", "grade_submission"],
        "coming_soon": True,
        "region": "us",
        "category": "sis"
    },
    {
        "id": "schoology",
        "name": "Schoology",
        "description": "Integrate with Schoology LMS (PowerSchool)",
        "features": ["roster_sync", "assignment_creation", "grade_submission"],
        "coming_soon": True,
        "region": "us",
        "category": "lms"
    },
    {
        "id": "alma",
        "name": "Alma SIS",
        "description": "Modern cloud-based Student Information System",
        "features": ["roster_sync", "grade_submission", "parent_portal"],
        "requires_api_token": True,
        "region": "us",
        "category": "sis",
        "coming_soon": True
    },
    # === UK Providers ===
    {
        "id": "arbor",
        "name": "Arbor Education",
        "description": "UK cloud-based MIS for schools and MATs",
        "features": ["roster_sync", "grade_submission", "attendance", "ctf_import"],
        "requires_api_token": True,
        "region": "uk",
        "category": "mis",
        "coming_soon": True
    },
    {
        "id": "sims",
        "name": "SIMS (Capita)",
        "description": "UK's most widely used school management system",
        "features": ["roster_sync", "grade_submission", "ctf_import", "ctf_export"],
        "requires_api_token": True,
        "region": "uk",
        "category": "mis",
        "coming_soon": True
    },
    {
        "id": "bromcom",
        "name": "Bromcom MIS",
        "description": "UK cloud MIS with integrated assessments",
        "features": ["roster_sync", "grade_submission", "ctf_import"],
        "requires_api_token": True,
        "region": "uk",
        "category": "mis",
        "coming_soon": True
    },
    {
        "id": "scholarpack",
        "name": "ScholarPack",
        "description": "UK primary school MIS with CTF support",
        "features": ["roster_sync", "ctf_import", "ctf_export"],
        "requires_api_token": True,
        "region": "uk",
        "category": "mis",
        "coming_soon": True
    },
    {
        "id": "isams",
        "name": "iSAMS",
        "description": "School management for UK independent schools",
        "features": ["roster_sync", "grade_submission", "parent_portal"],
        "requires_api_token": True,
        "region": "uk",
        "category": "mis",
        "coming_soon": True
    },
    {
        "id": "groupcall",
        "name": "Groupcall Xporter",
        "description": "UK data integration and sync platform",
        "features": ["roster_sync", "data_sync", "wonde_compatible"],
        "requires_api_token": True,
        "region": "uk",
        "category": "integration",
        "coming_soon": True
    },
    {
        "id": "wonde",
        "name": "Wonde",
        "description": "UK schools data platform - connects to any MIS",
        "features": ["roster_sync", "universal_connector", "real_time_sync"],
        "requires_api_token": True,
        "region": "uk",
        "category": "integration",
        "coming_soon": True
    },
    # === File Import ===
    {
        "id": "ctf_import",
        "name": "CTF File Import",
        "description": "Import UK Common Transfer File (.ctf/.xml) directly",
        "features": ["file_import", "roster_sync", "bulk_import"],
        "requires_oauth": False,
        "requires_api_token": False,
        "region": "uk",
        "category": "file_import"
    },
    {
        "id": "csv_import",
        "name": "CSV/Excel Import",
        "description": "Import students from CSV or Excel files",
        "features": ["file_import", "roster_sync", "bulk_import"],
        "requires_oauth": False,
        "requires_api_token": False,
        "region": "global",
        "category": "file_import"
    }
]


# Provider categories for UI grouping
PROVIDER_CATEGORIES = {
    "lms": {"name": "Learning Management Systems", "description": "Full LMS platforms"},
    "sis": {"name": "Student Information Systems", "description": "Student data and grades"},
    "mis": {"name": "Management Information Systems", "description": "UK school management"},
    "integration": {"name": "Integration Platforms", "description": "Connect multiple systems"},
    "file_import": {"name": "File Import", "description": "Import from files"}
}

# Region labels
REGIONS = {
    "global": "Global",
    "us": "United States",
    "uk": "United Kingdom"
}
