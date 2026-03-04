"""
AI routes - Game compilation and content generation.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional
import json
import logging

from core.security import get_current_user
from services.ai_compiler import get_ai_compiler

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI Compiler"])


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


class GenerateFeedbackRequest(BaseModel):
    """Request to generate feedback for a wrong answer."""
    question: dict
    wrong_answer_id: str


class RefineSpecRequest(BaseModel):
    """Request to refine an existing spec."""
    current_spec: dict
    refinement_prompt: str = Field(..., min_length=10, max_length=2000)


@router.post("/compile")
async def compile_game(
    request: CompileRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Compile a game specification from a natural language prompt.
    Uses AI to generate a complete, playable game spec.
    """
    try:
        compiler = get_ai_compiler()
        
        spec = await compiler.compile_game(
            prompt=request.prompt,
            grade_levels=request.grade_levels,
            subjects=request.subjects,
            game_type=request.game_type,
            question_count=request.question_count,
            duration_minutes=request.duration_minutes
        )
        
        logger.info(f"Game compiled for user {current_user['id']}: {spec.get('meta', {}).get('title')}")
        
        return {
            "success": True,
            "spec": spec
        }
        
    except Exception as e:
        logger.error(f"Compilation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile game: {str(e)}"
        )


@router.post("/compile/stream")
async def compile_game_streaming(
    request: CompileRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Compile a game with streaming response for real-time UI feedback.
    """
    async def generate():
        try:
            compiler = get_ai_compiler()
            
            async for chunk in compiler.compile_game_streaming(
                prompt=request.prompt,
                grade_levels=request.grade_levels,
                subjects=request.subjects,
                game_type=request.game_type,
                question_count=request.question_count,
                duration_minutes=request.duration_minutes
            ):
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            
            yield f"data: {json.dumps({'done': True})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )


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


@router.post("/generate-feedback")
async def generate_feedback(
    request: GenerateFeedbackRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate personalized feedback for a wrong answer.
    """
    try:
        compiler = get_ai_compiler()
        
        feedback = await compiler.generate_feedback(
            question=request.question,
            wrong_answer_id=request.wrong_answer_id
        )
        
        return {
            "success": True,
            "feedback": feedback
        }
        
    except Exception as e:
        logger.error(f"Feedback generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate feedback: {str(e)}"
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
