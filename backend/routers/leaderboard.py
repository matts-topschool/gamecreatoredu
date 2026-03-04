"""
Leaderboard routes - Submit game results and retrieve leaderboards.
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime, timezone
import logging

from core.database import get_database
from core.security import get_current_user, get_current_user_optional
from models.leaderboard import (
    GameResult,
    GameResultCreate,
    LeaderboardEntry,
    GameLeaderboard,
    PlayerHighScore,
    PlayerStats,
    LeaderboardScope,
    LeaderboardType
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


def get_results_collection():
    db = get_database()
    return db["game_results"]


def get_highscores_collection():
    db = get_database()
    return db["high_scores"]


@router.post("/results", response_model=GameResult, status_code=status.HTTP_201_CREATED)
async def submit_game_result(
    request: GameResultCreate,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Submit a game result when a player completes a game.
    This updates leaderboards and player stats.
    """
    results = get_results_collection()
    highscores = get_highscores_collection()
    games = get_database()["games"]
    
    # Get game info
    game = await games.find_one({"id": request.game_id}, {"_id": 0, "title": 1, "spec": 1})
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game_title = game.get("title", "Unknown Game")
    game_type = game.get("spec", {}).get("meta", {}).get("game_type", "quiz")
    
    # Create game result
    result = GameResult(
        game_id=request.game_id,
        player_id=current_user["id"] if current_user else None,
        player_name=request.player_name,
        player_email=current_user.get("email") if current_user else None,
        class_id=request.class_id,
        session_id=request.session_id,
        score=request.score,
        accuracy=request.accuracy,
        questions_total=request.questions_total,
        questions_correct=request.questions_correct,
        questions_wrong=request.questions_total - request.questions_correct,
        time_taken_seconds=request.time_taken_seconds,
        max_combo=request.max_combo,
        hints_used=request.hints_used,
        damage_dealt=request.damage_dealt,
        enemy_defeated=request.enemy_defeated,
        game_title=game_title,
        game_type=game_type
    )
    
    await results.insert_one(result.to_mongo_dict())
    
    # Update high score
    await update_high_score(
        game_id=request.game_id,
        player_id=current_user["id"] if current_user else None,
        player_name=request.player_name,
        player_email=current_user.get("email") if current_user else None,
        result=result
    )
    
    logger.info(f"Game result submitted: {request.player_name} scored {request.score} on {game_title}")
    
    return result


@router.get("/game/{game_id}", response_model=GameLeaderboard)
async def get_game_leaderboard(
    game_id: str,
    type: LeaderboardType = LeaderboardType.SCORE,
    scope: LeaderboardScope = LeaderboardScope.GLOBAL,
    class_id: Optional[str] = None,
    limit: int = Query(10, le=50),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Get the leaderboard for a specific game.
    
    - type: What to rank by (score, time, accuracy, combo, damage)
    - scope: global (all players), class (specific class), session
    - class_id: Required if scope is "class"
    """
    highscores = get_highscores_collection()
    games = get_database()["games"]
    
    # Get game info
    game = await games.find_one({"id": game_id}, {"_id": 0, "title": 1})
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Build query
    query = {"game_id": game_id}
    if scope == LeaderboardScope.CLASS and class_id:
        # For class scope, we'd need to filter by class members
        # This is a simplified version - in production, join with class members
        pass
    
    # Determine sort field
    sort_field = "best_score"
    sort_order = -1  # Descending (higher is better)
    
    if type == LeaderboardType.TIME:
        sort_field = "best_time_seconds"
        sort_order = 1  # Ascending (lower is better)
    elif type == LeaderboardType.ACCURACY:
        sort_field = "best_accuracy"
    elif type == LeaderboardType.COMBO:
        sort_field = "best_combo"
    elif type == LeaderboardType.DAMAGE:
        sort_field = "best_damage"
    
    # Get high scores
    cursor = highscores.find(query, {"_id": 0}).sort(sort_field, sort_order).limit(limit)
    
    entries = []
    rank = 1
    async for doc in cursor:
        entries.append(LeaderboardEntry(
            rank=rank,
            player_id=doc.get("player_id"),
            player_name=doc.get("player_name", "Unknown"),
            score=doc.get("best_score", 0),
            accuracy=doc.get("best_accuracy", 0),
            time_seconds=doc.get("best_time_seconds", 0),
            max_combo=doc.get("best_combo", 0),
            played_at=datetime.fromisoformat(doc.get("best_score_at", datetime.now(timezone.utc).isoformat())),
            is_current_player=bool(current_user and doc.get("player_id") == current_user.get("id"))
        ))
        rank += 1
    
    # Count total players
    total = await highscores.count_documents(query)
    
    return GameLeaderboard(
        game_id=game_id,
        game_title=game.get("title", "Unknown"),
        leaderboard_type=type,
        scope=scope,
        entries=entries,
        total_players=total,
        last_updated=datetime.now(timezone.utc)
    )


@router.get("/game/{game_id}/my-rank")
async def get_my_rank(
    game_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get the current user's rank and stats for a game."""
    highscores = get_highscores_collection()
    
    # Get user's high score
    user_score = await highscores.find_one(
        {"game_id": game_id, "player_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not user_score:
        return {
            "has_played": False,
            "rank": None,
            "total_players": await highscores.count_documents({"game_id": game_id})
        }
    
    # Calculate rank
    higher_scores = await highscores.count_documents({
        "game_id": game_id,
        "best_score": {"$gt": user_score.get("best_score", 0)}
    })
    
    rank = higher_scores + 1
    total = await highscores.count_documents({"game_id": game_id})
    
    return {
        "has_played": True,
        "rank": rank,
        "total_players": total,
        "best_score": user_score.get("best_score", 0),
        "best_accuracy": user_score.get("best_accuracy", 0),
        "best_time_seconds": user_score.get("best_time_seconds", 0),
        "best_combo": user_score.get("best_combo", 0),
        "total_plays": user_score.get("total_plays", 0),
        "last_played": user_score.get("last_played")
    }


@router.get("/player/stats", response_model=PlayerStats)
async def get_player_stats(
    current_user: dict = Depends(get_current_user)
):
    """Get aggregated stats for the current player."""
    results = get_results_collection()
    highscores = get_highscores_collection()
    
    player_id = current_user["id"]
    
    # Get all results for this player
    pipeline = [
        {"$match": {"player_id": player_id}},
        {"$group": {
            "_id": None,
            "total_games": {"$sum": 1},
            "unique_games": {"$addToSet": "$game_id"},
            "total_score": {"$sum": "$score"},
            "avg_score": {"$avg": "$score"},
            "avg_accuracy": {"$avg": "$accuracy"},
            "highest_score": {"$max": "$score"},
            "highest_accuracy": {"$max": "$accuracy"},
            "highest_combo": {"$max": "$max_combo"},
            "total_time_seconds": {"$sum": "$time_taken_seconds"},
            "last_active": {"$max": "$completed_at"}
        }}
    ]
    
    cursor = results.aggregate(pipeline)
    stats_doc = None
    async for doc in cursor:
        stats_doc = doc
        break
    
    # Get recent games
    recent_cursor = results.find(
        {"player_id": player_id},
        {"_id": 0}
    ).sort("completed_at", -1).limit(5)
    
    recent_games = []
    async for doc in recent_cursor:
        recent_games.append({
            "game_id": doc.get("game_id"),
            "game_title": doc.get("game_title"),
            "score": doc.get("score"),
            "accuracy": doc.get("accuracy"),
            "played_at": doc.get("completed_at")
        })
    
    if stats_doc:
        return PlayerStats(
            player_id=player_id,
            player_name=current_user.get("display_name", "Player"),
            player_email=current_user.get("email"),
            total_games_played=stats_doc.get("total_games", 0),
            unique_games=len(stats_doc.get("unique_games", [])),
            total_score=stats_doc.get("total_score", 0),
            avg_score=stats_doc.get("avg_score", 0),
            avg_accuracy=stats_doc.get("avg_accuracy", 0),
            highest_score=stats_doc.get("highest_score", 0),
            highest_accuracy=stats_doc.get("highest_accuracy", 0),
            highest_combo=stats_doc.get("highest_combo", 0),
            total_play_time_minutes=stats_doc.get("total_time_seconds", 0) // 60,
            recent_games=recent_games,
            last_active=datetime.fromisoformat(stats_doc["last_active"]) if stats_doc.get("last_active") else None
        )
    else:
        return PlayerStats(
            player_id=player_id,
            player_name=current_user.get("display_name", "Player"),
            player_email=current_user.get("email")
        )


@router.get("/player/{player_id}/history")
async def get_player_history(
    player_id: str,
    game_id: Optional[str] = None,
    limit: int = Query(20, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get game history for a player (teachers can view student history)."""
    results = get_results_collection()
    
    # Build query
    query = {"player_id": player_id}
    if game_id:
        query["game_id"] = game_id
    
    cursor = results.find(query, {"_id": 0}).sort("completed_at", -1).limit(limit)
    
    history = []
    async for doc in cursor:
        history.append(doc)
    
    return {"results": history, "total": len(history)}


# Helper functions

async def update_high_score(
    game_id: str,
    player_id: Optional[str],
    player_name: str,
    player_email: Optional[str],
    result: GameResult
):
    """Update a player's high score if they beat their previous best."""
    highscores = get_highscores_collection()
    
    # Find existing high score
    query = {"game_id": game_id}
    if player_id:
        query["player_id"] = player_id
    else:
        query["player_name"] = player_name
        query["player_id"] = None
    
    existing = await highscores.find_one(query, {"_id": 0})
    
    now = datetime.now(timezone.utc)
    
    if existing:
        # Update if better
        updates = {
            "total_plays": existing.get("total_plays", 0) + 1,
            "total_score": existing.get("total_score", 0) + result.score,
            "last_played": now.isoformat()
        }
        
        if result.score > existing.get("best_score", 0):
            updates["best_score"] = result.score
            updates["best_score_at"] = now.isoformat()
        
        if result.accuracy > existing.get("best_accuracy", 0):
            updates["best_accuracy"] = result.accuracy
        
        if result.time_taken_seconds < existing.get("best_time_seconds", 999999):
            updates["best_time_seconds"] = result.time_taken_seconds
        
        if result.max_combo > existing.get("best_combo", 0):
            updates["best_combo"] = result.max_combo
        
        if result.damage_dealt > existing.get("best_damage", 0):
            updates["best_damage"] = result.damage_dealt
        
        # Calculate average
        new_plays = updates["total_plays"]
        updates["avg_score"] = updates["total_score"] / new_plays
        
        await highscores.update_one(query, {"$set": updates})
    else:
        # Create new high score record
        high_score = PlayerHighScore(
            game_id=game_id,
            player_id=player_id,
            player_name=player_name,
            player_email=player_email,
            best_score=result.score,
            best_accuracy=result.accuracy,
            best_time_seconds=result.time_taken_seconds,
            best_combo=result.max_combo,
            best_damage=result.damage_dealt,
            total_plays=1,
            total_score=result.score,
            avg_score=float(result.score)
        )
        
        await highscores.insert_one(high_score.to_mongo_dict())
