"""
Analytics routes - Retrieve insights, outcomes, and leaderboards.
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import logging

from core.database import (
    get_session_outcomes_collection,
    get_session_events_collection,
    get_games_collection,
    get_sessions_collection
)
from core.security import get_current_user
from models.analytics import SessionOutcome, HighScore, GameAnalytics, StudentProgress

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/sessions/{session_id}/results")
async def get_session_results(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed results for a completed session."""
    sessions = get_sessions_collection()
    outcomes = get_session_outcomes_collection()
    events = get_session_events_collection()
    
    # Verify session belongs to user
    session = await sessions.find_one(
        {"id": session_id, "teacher_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get all outcomes for this session
    outcome_list = []
    cursor = outcomes.find({"session_id": session_id}, {"_id": 0}).sort("rank", 1)
    async for doc in cursor:
        outcome_list.append(doc)
    
    # Get aggregated event stats
    event_stats = await get_event_stats(session_id)
    
    return {
        "session": session,
        "outcomes": outcome_list,
        "event_stats": event_stats,
        "summary": {
            "total_players": len(outcome_list),
            "avg_score": sum(o.get("final_score", 0) for o in outcome_list) / max(len(outcome_list), 1),
            "avg_accuracy": sum(o.get("accuracy_rate", 0) for o in outcome_list) / max(len(outcome_list), 1),
            "total_questions_answered": sum(o.get("questions_total", 0) for o in outcome_list)
        }
    }


@router.get("/games/{game_id}/performance")
async def get_game_performance(
    game_id: str,
    current_user: dict = Depends(get_current_user),
    days: int = Query(30, le=365)
):
    """Get performance analytics for a game across all sessions."""
    games = get_games_collection()
    sessions = get_sessions_collection()
    outcomes = get_session_outcomes_collection()
    
    # Verify game belongs to user
    game = await games.find_one(
        {"id": game_id, "owner_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Get sessions in date range
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    session_count = await sessions.count_documents({
        "game_id": game_id,
        "created_at": {"$gte": cutoff}
    })
    
    # Get outcome aggregates
    pipeline = [
        {"$match": {"game_id": game_id}},
        {"$group": {
            "_id": None,
            "total_plays": {"$sum": 1},
            "avg_score": {"$avg": "$final_score"},
            "avg_accuracy": {"$avg": "$accuracy_rate"},
            "avg_time_ms": {"$avg": "$total_time_ms"},
            "max_combo_overall": {"$max": "$max_combo"},
            "highest_score": {"$max": "$final_score"}
        }}
    ]
    
    aggregates = {}
    async for result in outcomes.aggregate(pipeline):
        aggregates = result
    
    # Get question difficulty breakdown
    question_stats = await get_question_stats(game_id)
    
    return {
        "game_id": game_id,
        "game_title": game.get("title"),
        "period_days": days,
        "sessions": session_count,
        "total_plays": aggregates.get("total_plays", 0),
        "avg_score": round(aggregates.get("avg_score", 0), 1),
        "avg_accuracy": round(aggregates.get("avg_accuracy", 0) * 100, 1),
        "avg_time_seconds": round(aggregates.get("avg_time_ms", 0) / 1000, 1),
        "highest_score": aggregates.get("highest_score", 0),
        "max_combo": aggregates.get("max_combo_overall", 0),
        "question_stats": question_stats
    }


@router.get("/games/{game_id}/leaderboard")
async def get_game_leaderboard(
    game_id: str,
    leaderboard_type: str = Query("score", regex="^(score|time|accuracy|combo)$"),
    limit: int = Query(10, le=100)
):
    """
    Get the all-time leaderboard for a game.
    Leaderboard type can be: score, time, accuracy, combo
    """
    outcomes = get_session_outcomes_collection()
    
    # Build sort based on leaderboard type
    sort_field = {
        "score": ("final_score", -1),
        "time": ("total_time_ms", 1),  # Lower is better
        "accuracy": ("accuracy_rate", -1),
        "combo": ("max_combo", -1)
    }[leaderboard_type]
    
    # Aggregate best performance per player
    pipeline = [
        {"$match": {"game_id": game_id, "completed": True}},
        {"$sort": {sort_field[0]: sort_field[1]}},
        {"$group": {
            "_id": {"$ifNull": ["$player_id", "$player_name"]},
            "player_name": {"$first": "$player_name"},
            "player_id": {"$first": "$player_id"},
            "best_score": {"$max": "$final_score"},
            "best_accuracy": {"$max": "$accuracy_rate"},
            "best_time_ms": {"$min": "$total_time_ms"},
            "best_combo": {"$max": "$max_combo"},
            "attempts": {"$sum": 1}
        }},
        {"$sort": {f"best_{leaderboard_type}" if leaderboard_type != "time" else "best_time_ms": sort_field[1]}},
        {"$limit": limit}
    ]
    
    leaderboard = []
    rank = 1
    async for entry in outcomes.aggregate(pipeline):
        leaderboard.append({
            "rank": rank,
            "player_name": entry.get("player_name"),
            "player_id": entry.get("player_id"),
            "score": entry.get("best_score", 0),
            "accuracy": round(entry.get("best_accuracy", 0) * 100, 1),
            "time_ms": entry.get("best_time_ms", 0),
            "combo": entry.get("best_combo", 0),
            "attempts": entry.get("attempts", 1)
        })
        rank += 1
    
    return {
        "game_id": game_id,
        "leaderboard_type": leaderboard_type,
        "entries": leaderboard
    }


@router.get("/students/{student_id}/progress")
async def get_student_progress(
    student_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a student's progress across all games."""
    outcomes = get_session_outcomes_collection()
    
    # Get all outcomes for this student
    pipeline = [
        {"$match": {"player_id": student_id}},
        {"$group": {
            "_id": None,
            "total_sessions": {"$sum": 1},
            "total_questions": {"$sum": "$questions_total"},
            "total_correct": {"$sum": "$questions_correct"},
            "avg_score": {"$avg": "$final_score"},
            "avg_accuracy": {"$avg": "$accuracy_rate"},
            "total_time_ms": {"$sum": "$total_time_ms"},
            "games_played": {"$addToSet": "$game_id"},
            "best_combo": {"$max": "$max_combo"}
        }}
    ]
    
    stats = {}
    async for result in outcomes.aggregate(pipeline):
        stats = result
    
    # Get recent activity
    recent_cursor = outcomes.find(
        {"player_id": student_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(10)
    
    recent_sessions = []
    async for doc in recent_cursor:
        recent_sessions.append(doc)
    
    return {
        "student_id": student_id,
        "total_sessions": stats.get("total_sessions", 0),
        "unique_games_played": len(stats.get("games_played", [])),
        "total_questions_answered": stats.get("total_questions", 0),
        "total_correct": stats.get("total_correct", 0),
        "overall_accuracy": round(stats.get("avg_accuracy", 0) * 100, 1),
        "avg_score": round(stats.get("avg_score", 0), 1),
        "total_play_time_minutes": round(stats.get("total_time_ms", 0) / 60000, 1),
        "best_combo": stats.get("best_combo", 0),
        "recent_sessions": recent_sessions
    }


@router.get("/classes/{class_id}/overview")
async def get_class_overview(
    class_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get analytics overview for a class."""
    # This would query students in the class and aggregate their performance
    # For now, return a placeholder structure
    return {
        "class_id": class_id,
        "message": "Class analytics coming in Phase 6"
    }


@router.post("/sessions/{session_id}/export")
async def export_session_data(
    session_id: str,
    format: str = Query("json", regex="^(json|csv)$"),
    current_user: dict = Depends(get_current_user)
):
    """Export session data for gradebook integration."""
    outcomes = get_session_outcomes_collection()
    sessions = get_sessions_collection()
    
    # Verify session belongs to user
    session = await sessions.find_one(
        {"id": session_id, "teacher_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get outcomes
    outcome_list = []
    cursor = outcomes.find({"session_id": session_id}, {"_id": 0}).sort("rank", 1)
    async for doc in cursor:
        outcome_list.append(doc)
    
    if format == "csv":
        # Generate CSV string
        import csv
        import io
        
        output = io.StringIO()
        if outcome_list:
            writer = csv.DictWriter(output, fieldnames=[
                "rank", "player_name", "final_score", "accuracy_rate", 
                "questions_total", "questions_correct", "max_combo"
            ])
            writer.writeheader()
            for outcome in outcome_list:
                writer.writerow({
                    "rank": outcome.get("rank"),
                    "player_name": outcome.get("player_name"),
                    "final_score": outcome.get("final_score"),
                    "accuracy_rate": round(outcome.get("accuracy_rate", 0) * 100, 1),
                    "questions_total": outcome.get("questions_total"),
                    "questions_correct": outcome.get("questions_correct"),
                    "max_combo": outcome.get("max_combo")
                })
        
        return {
            "format": "csv",
            "data": output.getvalue()
        }
    
    return {
        "format": "json",
        "session_id": session_id,
        "game_id": session.get("game_id"),
        "ended_at": session.get("ended_at"),
        "outcomes": outcome_list
    }


# Helper functions

async def get_event_stats(session_id: str) -> dict:
    """Get aggregated event statistics for a session."""
    events = get_session_events_collection()
    
    pipeline = [
        {"$match": {"session_id": session_id}},
        {"$group": {
            "_id": "$event_type",
            "count": {"$sum": 1}
        }}
    ]
    
    stats = {}
    async for result in events.aggregate(pipeline):
        stats[result["_id"]] = result["count"]
    
    return stats


async def get_question_stats(game_id: str) -> dict:
    """Get per-question statistics for a game."""
    events = get_session_events_collection()
    
    pipeline = [
        {"$match": {
            "event_type": "answer_submitted",
            # We'd need to join with sessions to get game_id
            # For now, simplified
        }},
        {"$group": {
            "_id": "$question_id",
            "attempts": {"$sum": 1},
            "correct": {"$sum": {"$cond": ["$is_correct", 1, 0]}},
            "avg_time_ms": {"$avg": "$answer_time_ms"}
        }}
    ]
    
    stats = {}
    async for result in events.aggregate(pipeline):
        if result["_id"]:
            accuracy = result["correct"] / max(result["attempts"], 1)
            stats[result["_id"]] = {
                "attempts": result["attempts"],
                "correct": result["correct"],
                "accuracy": round(accuracy * 100, 1),
                "avg_time_ms": round(result.get("avg_time_ms", 0))
            }
    
    return stats
