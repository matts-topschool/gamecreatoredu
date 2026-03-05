"""
Compilation Task Model - Tracks async AI game compilation jobs.
"""
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum


class TaskStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class CompilationTask(BaseModel):
    """Async compilation task for AI game generation."""
    id: str
    user_id: str
    status: TaskStatus = TaskStatus.PENDING
    
    # Request parameters
    prompt: str
    grade_levels: Optional[list[int]] = None
    subjects: Optional[list[str]] = None
    game_type: Optional[str] = None
    question_count: int = 10
    duration_minutes: int = 15
    
    # Result
    spec: Optional[dict] = None
    error: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        use_enum_values = True


class CompilationTaskCreate(BaseModel):
    """Request to create a new compilation task."""
    prompt: str = Field(..., min_length=10, max_length=5000)
    grade_levels: Optional[list[int]] = None
    subjects: Optional[list[str]] = None
    game_type: Optional[str] = None
    question_count: int = Field(default=10, ge=5, le=30)
    duration_minutes: int = Field(default=15, ge=5, le=60)


class CompilationTaskResponse(BaseModel):
    """Response for compilation task status."""
    task_id: str
    status: str
    spec: Optional[dict] = None
    error: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
