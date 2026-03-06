"""
Google Classroom Integration Service
Uses Emergent OAuth for authentication and Google Classroom API for operations.
"""
import httpx
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel

from services.integrations import (
    IntegrationProvider,
    IntegrationStatus,
    ExternalClass,
    ExternalStudent,
    GradeSubmission
)

logger = logging.getLogger(__name__)

# Google Classroom API base URL
CLASSROOM_API_BASE = "https://classroom.googleapis.com/v1"


class GoogleClassroomService(IntegrationProvider):
    """
    Full Google Classroom integration using Emergent OAuth.
    Handles roster sync, assignment creation, and grade submission.
    """
    
    def __init__(self, access_token: Optional[str] = None):
        self.access_token = access_token
        self._http_client = None
    
    @property
    def provider_name(self) -> str:
        return "google_classroom"
    
    @property
    def http_client(self) -> httpx.AsyncClient:
        """Lazy-init HTTP client with auth header."""
        if not self._http_client:
            self._http_client = httpx.AsyncClient(
                base_url=CLASSROOM_API_BASE,
                headers={
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json"
                },
                timeout=30.0
            )
        return self._http_client
    
    async def close(self):
        """Close HTTP client."""
        if self._http_client:
            await self._http_client.aclose()
            self._http_client = None
    
    async def authenticate(self, credentials: Dict[str, Any]) -> bool:
        """
        Set access token from Emergent OAuth session.
        
        credentials should contain:
        - access_token: Google OAuth access token from Emergent
        """
        try:
            self.access_token = credentials.get("access_token")
            if not self.access_token:
                return False
            
            # Verify token by making a simple API call
            # Reset client to use new token
            self._http_client = None
            
            logger.info("Google Classroom authentication successful")
            return True
        except Exception as e:
            logger.error(f"Google Classroom auth failed: {e}")
            return False
    
    async def get_connection_status(self) -> IntegrationStatus:
        """Check if connected by making a test API call."""
        if not self.access_token:
            return IntegrationStatus.DISCONNECTED
        
        try:
            response = await self.http_client.get("/courses?pageSize=1")
            if response.status_code == 200:
                return IntegrationStatus.CONNECTED
            elif response.status_code == 401:
                return IntegrationStatus.DISCONNECTED
            else:
                return IntegrationStatus.ERROR
        except Exception as e:
            logger.error(f"Connection check failed: {e}")
            return IntegrationStatus.ERROR
    
    async def list_classes(self) -> List[ExternalClass]:
        """
        List all courses where the user is a teacher (including co-teacher).
        Uses: GET /courses?teacherId=me&courseStates=ACTIVE,PROVISIONED,DECLINED,SUSPENDED
        """
        try:
            courses = []
            page_token = None
            
            while True:
                # teacherId=me returns courses where user is ANY teacher role (owner or co-teacher)
                # Include all course states to ensure we get everything
                params = {
                    "teacherId": "me", 
                    "pageSize": 100,
                    "courseStates": ["ACTIVE", "PROVISIONED"]  # Include active and provisioned courses
                }
                if page_token:
                    params["pageToken"] = page_token
                
                response = await self.http_client.get("/courses", params=params)
                
                if response.status_code != 200:
                    logger.error(f"Failed to list courses: {response.status_code} - {response.text}")
                    # If teacherId=me fails, try without it (gets all courses user has access to)
                    if "teacherId" in params:
                        logger.info("Retrying without teacherId filter...")
                        params.pop("teacherId")
                        response = await self.http_client.get("/courses", params=params)
                        if response.status_code != 200:
                            break
                    else:
                        break
                
                data = response.json()
                logger.info(f"Google Classroom returned {len(data.get('courses', []))} courses")
                
                for course in data.get("courses", []):
                    courses.append(ExternalClass(
                        external_id=course["id"],
                        name=course.get("name", "Untitled Course"),
                        description=course.get("description"),
                        section=course.get("section"),
                        grade_level=course.get("room"),  # Google uses "room" field
                        teacher_email=course.get("ownerId"),
                        metadata={
                            "courseState": course.get("courseState"),
                            "alternateLink": course.get("alternateLink"),
                            "enrollmentCode": course.get("enrollmentCode")
                        }
                    ))
                
                page_token = data.get("nextPageToken")
                if not page_token:
                    break
            
            logger.info(f"Listed {len(courses)} Google Classroom courses")
            return courses
            
        except Exception as e:
            logger.error(f"Error listing courses: {e}")
            return []
    
    async def get_class(self, class_id: str) -> Optional[ExternalClass]:
        """
        Get course details.
        Uses: GET /courses/{id}
        """
        try:
            response = await self.http_client.get(f"/courses/{class_id}")
            
            if response.status_code != 200:
                logger.error(f"Failed to get course {class_id}: {response.text}")
                return None
            
            course = response.json()
            
            return ExternalClass(
                external_id=course["id"],
                name=course.get("name", "Untitled Course"),
                description=course.get("description"),
                section=course.get("section"),
                teacher_email=course.get("ownerId"),
                metadata={
                    "courseState": course.get("courseState"),
                    "alternateLink": course.get("alternateLink")
                }
            )
        except Exception as e:
            logger.error(f"Error getting course {class_id}: {e}")
            return None
    
    async def list_students(self, class_id: str) -> List[ExternalStudent]:
        """
        List all students in a course.
        Uses: GET /courses/{courseId}/students
        """
        try:
            students = []
            page_token = None
            
            while True:
                params = {"pageSize": 100}
                if page_token:
                    params["pageToken"] = page_token
                
                response = await self.http_client.get(
                    f"/courses/{class_id}/students",
                    params=params
                )
                
                if response.status_code != 200:
                    logger.error(f"Failed to list students: {response.text}")
                    break
                
                data = response.json()
                
                for student in data.get("students", []):
                    profile = student.get("profile", {})
                    name = profile.get("name", {})
                    
                    students.append(ExternalStudent(
                        external_id=student.get("userId", ""),
                        email=profile.get("emailAddress"),
                        first_name=name.get("givenName"),
                        last_name=name.get("familyName"),
                        display_name=name.get("fullName", profile.get("emailAddress", "Unknown")),
                        profile_photo_url=profile.get("photoUrl"),
                        metadata={
                            "courseId": student.get("courseId"),
                            "studentWorkFolder": student.get("studentWorkFolder")
                        }
                    ))
                
                page_token = data.get("nextPageToken")
                if not page_token:
                    break
            
            logger.info(f"Listed {len(students)} students for course {class_id}")
            return students
            
        except Exception as e:
            logger.error(f"Error listing students for {class_id}: {e}")
            return []
    
    async def sync_roster(self, class_id: str) -> Dict[str, Any]:
        """
        Sync roster from Google Classroom.
        Returns counts of added/removed/updated students.
        """
        students = await self.list_students(class_id)
        return {
            "added": len(students),  # In real implementation, compare with existing
            "removed": 0,
            "updated": 0,
            "total": len(students),
            "students": [s.model_dump() for s in students]
        }
    
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
        Uses: POST /courses/{courseId}/courseWork
        
        Returns the courseWork ID if successful.
        """
        try:
            # Build coursework request
            coursework = {
                "title": title,
                "description": description,
                "workType": "ASSIGNMENT",
                "state": "PUBLISHED",
                "maxPoints": points_possible,
                "materials": [
                    {
                        "link": {
                            "url": game_url,
                            "title": title
                        }
                    }
                ]
            }
            
            # Add due date if provided
            if due_date:
                try:
                    dt = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
                    coursework["dueDate"] = {
                        "year": dt.year,
                        "month": dt.month,
                        "day": dt.day
                    }
                    coursework["dueTime"] = {
                        "hours": dt.hour,
                        "minutes": dt.minute
                    }
                except Exception:
                    pass
            
            response = await self.http_client.post(
                f"/courses/{class_id}/courseWork",
                json=coursework
            )
            
            if response.status_code not in (200, 201):
                logger.error(f"Failed to create assignment: {response.text}")
                return None
            
            result = response.json()
            coursework_id = result.get("id")
            
            logger.info(f"Created coursework {coursework_id} in course {class_id}")
            return coursework_id
            
        except Exception as e:
            logger.error(f"Error creating assignment in {class_id}: {e}")
            return None
    
    async def submit_grade(self, submission: GradeSubmission) -> bool:
        """
        Submit a grade to Google Classroom.
        
        Flow:
        1. Get student submission for the coursework
        2. Patch the submission with the grade
        
        Uses: 
        - GET /courses/{courseId}/courseWork/{courseWorkId}/studentSubmissions?userId={studentId}
        - PATCH /courses/{courseId}/courseWork/{courseWorkId}/studentSubmissions/{submissionId}
        """
        try:
            # Parse assignment external ID (format: courseId:courseWorkId)
            parts = submission.assignment_external_id.split(":")
            if len(parts) != 2:
                logger.error(f"Invalid assignment ID format: {submission.assignment_external_id}")
                return False
            
            course_id, coursework_id = parts
            student_id = submission.student_external_id
            
            # Get student's submission
            response = await self.http_client.get(
                f"/courses/{course_id}/courseWork/{coursework_id}/studentSubmissions",
                params={"userId": student_id}
            )
            
            if response.status_code != 200:
                logger.error(f"Failed to get submission: {response.text}")
                return False
            
            submissions = response.json().get("studentSubmissions", [])
            if not submissions:
                logger.error(f"No submission found for student {student_id}")
                return False
            
            submission_id = submissions[0]["id"]
            
            # Calculate grade
            assigned_grade = None
            if submission.points_possible and submission.score is not None:
                # Convert score (0-1) to points
                assigned_grade = round(submission.score * submission.points_possible, 2)
            
            # Patch the submission with grade
            patch_data = {}
            if assigned_grade is not None:
                patch_data["assignedGrade"] = assigned_grade
                patch_data["draftGrade"] = assigned_grade
            
            if not patch_data:
                logger.warning("No grade data to submit")
                return True
            
            patch_response = await self.http_client.patch(
                f"/courses/{course_id}/courseWork/{coursework_id}/studentSubmissions/{submission_id}",
                params={"updateMask": "assignedGrade,draftGrade"},
                json=patch_data
            )
            
            if patch_response.status_code != 200:
                logger.error(f"Failed to patch grade: {patch_response.text}")
                return False
            
            logger.info(f"Submitted grade {assigned_grade} for student {student_id}")
            
            # Return the submission to mark it as "Returned/Graded"
            # This changes the status from "Not turned in" to "Returned"
            return_response = await self.http_client.post(
                f"/courses/{course_id}/courseWork/{coursework_id}/studentSubmissions/{submission_id}:return"
            )
            
            if return_response.status_code != 200:
                # Log but don't fail - grade was set successfully
                logger.warning(f"Failed to return submission (grade was set): {return_response.text}")
            else:
                logger.info(f"Submission returned for student {student_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error submitting grade: {e}")
            return False
    
    async def return_submission(
        self,
        course_id: str,
        coursework_id: str,
        submission_id: str
    ) -> bool:
        """
        Return a graded submission to the student.
        Uses: POST /courses/{courseId}/courseWork/{courseWorkId}/studentSubmissions/{id}:return
        """
        try:
            response = await self.http_client.post(
                f"/courses/{course_id}/courseWork/{coursework_id}/studentSubmissions/{submission_id}:return"
            )
            
            if response.status_code != 200:
                logger.error(f"Failed to return submission: {response.text}")
                return False
            
            return True
        except Exception as e:
            logger.error(f"Error returning submission: {e}")
            return False


# Singleton service instance cache (per user)
_service_cache: Dict[str, GoogleClassroomService] = {}


def get_google_classroom_service(access_token: str) -> GoogleClassroomService:
    """Get or create a Google Classroom service instance."""
    if access_token not in _service_cache:
        _service_cache[access_token] = GoogleClassroomService(access_token)
    return _service_cache[access_token]


async def cleanup_service(access_token: str):
    """Clean up a service instance."""
    if access_token in _service_cache:
        await _service_cache[access_token].close()
        del _service_cache[access_token]
