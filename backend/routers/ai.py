"""
AI routes - Game compilation with async task-based approach to handle long-running AI operations.
"""
from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional
import json
import logging
import uuid
import asyncio
from datetime import datetime, timezone

from core.security import get_current_user
from core.database import get_database
from services.ai_compiler import get_ai_compiler
from models.compilation_task import (
    CompilationTask, 
    CompilationTaskCreate, 
    CompilationTaskResponse,
    TaskStatus
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI Compiler"])


# Legacy request model for backward compatibility
class CompileRequest(BaseModel):
    """Request to compile a game from a prompt."""
    prompt: str = Field(..., min_length=10, max_length=5000)
    grade_levels: Optional[List[int]] = None
    subjects: Optional[List[str]] = None
    game_type: Optional[str] = None
    question_count: int = Field(default=10, ge=5, le=30)
    duration_minutes: int = Field(default=15, ge=5, le=60)


class GenerateQuestionsRequest(BaseModel):
    """Request to generate additional questions."""
    topic: str = Field(..., min_length=3, max_length=200)
    grade_level: int = Field(..., ge=0, le=12)
    question_type: str = Field(default="multiple_choice")
    count: int = Field(default=10, ge=1, le=30)
    difficulty: int = Field(default=2, ge=1, le=5)


class RefineSpecRequest(BaseModel):
    """Request to refine an existing spec."""
    current_spec: dict
    refinement_prompt: str = Field(..., min_length=10, max_length=2000)


async def run_compilation_task(task_id: str, user_id: str, request_data: dict):
    """Background task to run AI compilation."""
    db = get_database()
    
    try:
        # Mark as processing
        await db.compilation_tasks.update_one(
            {"id": task_id},
            {"$set": {"status": TaskStatus.PROCESSING, "started_at": datetime.now(timezone.utc)}}
        )
        
        compiler = get_ai_compiler()
        
        spec = await compiler.compile_game(
            prompt=request_data["prompt"],
            grade_levels=request_data.get("grade_levels"),
            subjects=request_data.get("subjects"),
            game_type=request_data.get("game_type"),
            question_count=request_data.get("question_count", 10),
            duration_minutes=request_data.get("duration_minutes", 15)
        )
        
        # Mark as completed with result
        await db.compilation_tasks.update_one(
            {"id": task_id},
            {
                "$set": {
                    "status": TaskStatus.COMPLETED,
                    "spec": spec,
                    "completed_at": datetime.now(timezone.utc)
                }
            }
        )
        
        logger.info(f"Task {task_id} completed: {spec.get('meta', {}).get('title')}")
        
    except Exception as e:
        logger.error(f"Task {task_id} failed: {e}")
        await db.compilation_tasks.update_one(
            {"id": task_id},
            {
                "$set": {
                    "status": TaskStatus.FAILED,
                    "error": str(e),
                    "completed_at": datetime.now(timezone.utc)
                }
            }
        )


@router.post("/compile/start")
async def start_compilation(
    request: CompileRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Start an async compilation task. Returns immediately with a task_id.
    Poll /ai/compile/status/{task_id} for results.
    """
    db = get_database()
    task_id = str(uuid.uuid4())
    
    # Create task record
    task = CompilationTask(
        id=task_id,
        user_id=current_user["id"],
        prompt=request.prompt,
        grade_levels=request.grade_levels,
        subjects=request.subjects,
        game_type=request.game_type,
        question_count=request.question_count,
        duration_minutes=request.duration_minutes
    )
    
    await db.compilation_tasks.insert_one(task.model_dump())
    
    # Start background task
    background_tasks.add_task(
        run_compilation_task,
        task_id,
        current_user["id"],
        request.model_dump()
    )
    
    logger.info(f"Started compilation task {task_id} for user {current_user['id']}")
    
    return {
        "task_id": task_id,
        "status": "pending",
        "message": "Compilation started. Poll /api/ai/compile/status/{task_id} for results."
    }


@router.get("/compile/status/{task_id}")
async def get_compilation_status(
    task_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Check the status of a compilation task.
    Returns the compiled spec when complete.
    """
    db = get_database()
    
    task = await db.compilation_tasks.find_one(
        {"id": task_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    response = {
        "task_id": task["id"],
        "status": task["status"],
        "created_at": task["created_at"]
    }
    
    if task["status"] == TaskStatus.COMPLETED:
        response["spec"] = task["spec"]
        response["completed_at"] = task.get("completed_at")
        response["success"] = True
    elif task["status"] == TaskStatus.FAILED:
        response["error"] = task.get("error", "Unknown error")
        response["completed_at"] = task.get("completed_at")
        response["success"] = False
    
    return response


@router.post("/compile")
async def compile_game(
    request: CompileRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Compile a game specification from a natural language prompt.
    
    NOTE: This endpoint may timeout on long compilations due to proxy limits.
    For reliability, use /ai/compile/start and poll /ai/compile/status/{task_id}
    
    This endpoint now starts an async task and returns the task_id for polling.
    """
    # For backward compatibility, we start the task and return polling info
    db = get_database()
    task_id = str(uuid.uuid4())
    
    # Create task record
    task = CompilationTask(
        id=task_id,
        user_id=current_user["id"],
        prompt=request.prompt,
        grade_levels=request.grade_levels,
        subjects=request.subjects,
        game_type=request.game_type,
        question_count=request.question_count,
        duration_minutes=request.duration_minutes
    )
    
    await db.compilation_tasks.insert_one(task.model_dump())
    
    # Start background task
    background_tasks.add_task(
        run_compilation_task,
        task_id,
        current_user["id"],
        request.model_dump()
    )
    
    logger.info(f"Started async compilation (via /compile) task {task_id}")
    
    # Return task info for polling - frontend needs to handle this
    return {
        "task_id": task_id,
        "status": "pending",
        "poll_url": f"/api/ai/compile/status/{task_id}",
        "message": "Compilation started in background. Poll status endpoint for results."
    }


@router.post("/generate-questions")
async def generate_questions(
    request: GenerateQuestionsRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate additional questions for an existing game or topic.
    """
    try:
        compiler = get_ai_compiler()
        
        questions = await compiler.generate_questions(
            topic=request.topic,
            grade_level=request.grade_level,
            question_type=request.question_type,
            count=request.count,
            difficulty=request.difficulty
        )
        
        return {
            "success": True,
            "questions": questions,
            "count": len(questions)
        }
        
    except Exception as e:
        logger.error(f"Question generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate questions: {str(e)}"
        )


@router.post("/refine")
async def refine_spec(
    request: RefineSpecRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Refine an existing game spec based on teacher feedback.
    """
    try:
        compiler = get_ai_compiler()
        
        refined_spec = await compiler.refine_spec(
            current_spec=request.current_spec,
            refinement_prompt=request.refinement_prompt
        )
        
        return {
            "success": True,
            "spec": refined_spec
        }
        
    except Exception as e:
        logger.error(f"Spec refinement failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to refine spec: {str(e)}"
        )
