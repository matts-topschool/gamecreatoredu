"""
Session routes - Create, manage, and join game sessions.
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime, timezone
import logging

from core.database import (
    get_sessions_collection, 
    get_games_collection,
    get_session_events_collection,
    get_session_outcomes_collection
)
from core.security import get_current_user, get_current_user_optional
from models.session import (
    Session, 
    SessionCreate, 
    SessionInDB, 
    SessionStatus,
    SessionMode,
    Participant,
    LeaderboardEntry,
    generate_join_code
)
from models.analytics import GameEvent, EventType, SessionOutcome
from schemas.common import SuccessResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("", response_model=Session, status_code=status.HTTP_201_CREATED)
async def create_session(
    request: SessionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new game session."""
    sessions = get_sessions_collection()
    games = get_games_collection()
    
    # Verify game exists and user owns it
    game = await games.find_one({"id": request.game_id})
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Create session
    session = SessionInDB(
        game_id=request.game_id,
        teacher_id=current_user["id"],
        class_id=request.class_id,
        mode=request.mode,
        settings=request.settings
    )
    
    await sessions.insert_one(session.to_mongo_dict())
    
    logger.info(f"Session created: {session.id} for game {request.game_id}")
    
    return session_from_db(session.to_mongo_dict())


@router.get("", response_model=List[Session])
async def list_sessions(
    current_user: dict = Depends(get_current_user),
    status: Optional[SessionStatus] = None,
    game_id: Optional[str] = None,
    limit: int = Query(20, le=100)
):
    """List sessions created by the current user."""
    sessions = get_sessions_collection()
    
    query = {"teacher_id": current_user["id"]}
    if status:
        query["status"] = status.value
    if game_id:
        query["game_id"] = game_id
    
    cursor = sessions.find(query, {"_id": 0}).sort("created_at", -1).limit(limit)
    
    results = []
    async for doc in cursor:
        results.append(session_from_db(doc))
    
    return results


@router.get("/join/{code}")
async def join_session_by_code(
    code: str,
    player_name: str = Query(..., min_length=1, max_length=50),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Join a session using a join code.
    Can be used by authenticated users or guests.
    """
    sessions = get_sessions_collection()
    
    # Find session by join code
    session_doc = await sessions.find_one(
        {"join_code": code.upper(), "status": {"$in": ["lobby", "active"]}},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found or has ended")
    
    # Check if late join is allowed
    if session_doc["status"] == "active" and not session_doc["settings"]["allow_late_join"]:
        raise HTTPException(status_code=400, detail="This session does not allow late joining")
    
    # Check max players
    if len(session_doc["participants"]) >= session_doc["settings"]["max_players"]:
        raise HTTPException(status_code=400, detail="Session is full")
    
    # Create participant
    participant = Participant(
        user_id=current_user["id"] if current_user else None,
        display_name=player_name,
        avatar_url=current_user.get("avatar_url") if current_user else None
    )
    
    # Add participant to session
    await sessions.update_one(
        {"id": session_doc["id"]},
        {"$push": {"participants": participant.model_dump()}}
    )
    
    # Log event
    await log_event(
        session_id=session_doc["id"],
        player_id=participant.user_id,
        player_name=player_name,
        event_type=EventType.PLAYER_JOIN
    )
    
    logger.info(f"Player {player_name} joined session {session_doc['id']}")
    
    return {
        "session_id": session_doc["id"],
        "game_id": session_doc["game_id"],
        "status": session_doc["status"],
        "player_name": player_name,
        "settings": session_doc["settings"]
    }


@router.get("/{session_id}", response_model=Session)
async def get_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get session details."""
    sessions = get_sessions_collection()
    
    session_doc = await sessions.find_one(
        {"id": session_id, "teacher_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return session_from_db(session_doc)


@router.post("/{session_id}/start", response_model=Session)
async def start_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Start a session (move from lobby to active)."""
    sessions = get_sessions_collection()
    
    session_doc = await sessions.find_one(
        {"id": session_id, "teacher_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session_doc["status"] != "lobby":
        raise HTTPException(status_code=400, detail="Session is not in lobby state")
    
    now = datetime.now(timezone.utc).isoformat()
    
    await sessions.update_one(
        {"id": session_id},
        {"$set": {"status": "active", "started_at": now}}
    )
    
    # Log event
    await log_event(
        session_id=session_id,
        event_type=EventType.SESSION_START
    )
    
    session_doc["status"] = "active"
    session_doc["started_at"] = now
    
    return session_from_db(session_doc)


@router.post("/{session_id}/end", response_model=Session)
async def end_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """End a session and compute final outcomes."""
    sessions = get_sessions_collection()
    outcomes = get_session_outcomes_collection()
    
    session_doc = await sessions.find_one(
        {"id": session_id, "teacher_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found")
    
    now = datetime.now(timezone.utc)
    
    await sessions.update_one(
        {"id": session_id},
        {"$set": {"status": "ended", "ended_at": now.isoformat()}}
    )
    
    # Compute and save outcomes for each participant
    participants = session_doc.get("participants", [])
    for i, participant in enumerate(participants):
        outcome = await compute_session_outcome(
            session_id=session_id,
            game_id=session_doc["game_id"],
            participant=participant,
            rank=i + 1,
            total_players=len(participants)
        )
        await outcomes.insert_one(outcome.to_mongo_dict())
    
    # Log event
    await log_event(
        session_id=session_id,
        event_type=EventType.SESSION_END
    )
    
    logger.info(f"Session ended: {session_id}")
    
    session_doc["status"] = "ended"
    session_doc["ended_at"] = now.isoformat()
    
    return session_from_db(session_doc)


@router.post("/{session_id}/events")
async def submit_game_event(
    session_id: str,
    event_type: EventType,
    event_data: dict = {},
    player_name: str = Query(...),
    player_id: Optional[str] = None
):
    """
    Submit a gameplay event from the client.
    This is called by the game engine during play.
    """
    sessions = get_sessions_collection()
    
    # Verify session exists and is active
    session_doc = await sessions.find_one(
        {"id": session_id, "status": "active"},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=404, detail="Active session not found")
    
    # Log the event
    event = await log_event(
        session_id=session_id,
        player_id=player_id,
        player_name=player_name,
        event_type=event_type,
        event_data=event_data
    )
    
    # Update participant stats if answer event
    if event_type == EventType.ANSWER_SUBMITTED:
        is_correct = event_data.get("is_correct", False)
        points = event_data.get("points", 0)
        
        # Find and update the participant
        for i, p in enumerate(session_doc.get("participants", [])):
            if p.get("display_name") == player_name:
                update_path = f"participants.{i}"
                updates = {
                    f"{update_path}.questions_answered": p.get("questions_answered", 0) + 1,
                    f"{update_path}.current_score": p.get("current_score", 0) + points,
                    f"{update_path}.last_active_at": datetime.now(timezone.utc).isoformat()
                }
                if is_correct:
                    updates[f"{update_path}.questions_correct"] = p.get("questions_correct", 0) + 1
                    updates[f"{update_path}.current_combo"] = p.get("current_combo", 0) + 1
                    if p.get("current_combo", 0) + 1 > p.get("max_combo", 0):
                        updates[f"{update_path}.max_combo"] = p.get("current_combo", 0) + 1
                else:
                    updates[f"{update_path}.current_combo"] = 0
                
                await sessions.update_one({"id": session_id}, {"$set": updates})
                break
    
    return {"success": True, "event_id": event.id}


@router.get("/{session_id}/leaderboard", response_model=List[LeaderboardEntry])
async def get_session_leaderboard(
    session_id: str,
    limit: int = Query(10, le=50)
):
    """Get the current leaderboard for a session."""
    sessions = get_sessions_collection()
    
    session_doc = await sessions.find_one({"id": session_id}, {"_id": 0})
    
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session_doc.get("settings", {}).get("show_leaderboard", True):
        raise HTTPException(status_code=403, detail="Leaderboard is disabled for this session")
    
    participants = session_doc.get("participants", [])
    leaderboard_type = session_doc.get("settings", {}).get("leaderboard_type", "score")
    
    # Sort by appropriate metric
    if leaderboard_type == "score":
        participants.sort(key=lambda p: p.get("current_score", 0), reverse=True)
    elif leaderboard_type == "accuracy":
        participants.sort(
            key=lambda p: p.get("questions_correct", 0) / max(p.get("questions_answered", 1), 1),
            reverse=True
        )
    elif leaderboard_type == "combo":
        participants.sort(key=lambda p: p.get("max_combo", 0), reverse=True)
    elif leaderboard_type == "time":
        participants.sort(key=lambda p: p.get("total_time_ms", float('inf')))
    
    leaderboard = []
    for i, p in enumerate(participants[:limit]):
        accuracy = (
            p.get("questions_correct", 0) / max(p.get("questions_answered", 1), 1)
        )
        
        leaderboard.append(LeaderboardEntry(
            rank=i + 1,
            player_name=p.get("display_name", "Unknown"),
            player_id=p.get("user_id"),
            avatar_url=p.get("avatar_url"),
            score=p.get("current_score", 0),
            accuracy=accuracy,
            time_ms=p.get("total_time_ms", 0),
            combo_max=p.get("max_combo", 0)
        ))
    
    return leaderboard


@router.get("/{session_id}/state")
async def get_session_state(session_id: str):
    """Get current game state for a session (for clients to sync)."""
    sessions = get_sessions_collection()
    
    session_doc = await sessions.find_one({"id": session_id}, {"_id": 0})
    
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "status": session_doc.get("status"),
        "current_scene_id": session_doc.get("current_scene_id"),
        "game_state": session_doc.get("game_state", {}),
        "participant_count": len(session_doc.get("participants", [])),
        "leaderboard_enabled": session_doc.get("settings", {}).get("show_leaderboard", True)
    }


# Helper functions

async def log_event(
    session_id: str,
    event_type: EventType,
    player_id: Optional[str] = None,
    player_name: str = "System",
    event_data: dict = {}
) -> GameEvent:
    """Log a game event to the database."""
    events = get_session_events_collection()
    
    event = GameEvent(
        session_id=session_id,
        player_id=player_id,
        player_name=player_name,
        event_type=event_type,
        event_data=event_data,
        question_id=event_data.get("question_id"),
        answer_id=event_data.get("answer_id"),
        is_correct=event_data.get("is_correct"),
        answer_time_ms=event_data.get("answer_time_ms"),
        points_earned=event_data.get("points", 0),
        combo_at_time=event_data.get("combo", 0)
    )
    
    await events.insert_one(event.to_mongo_dict())
    
    return event


async def compute_session_outcome(
    session_id: str,
    game_id: str,
    participant: dict,
    rank: int,
    total_players: int
) -> SessionOutcome:
    """Compute final outcome for a participant."""
    events = get_session_events_collection()
    
    # Get all events for this player in this session
    player_events = []
    cursor = events.find({
        "session_id": session_id,
        "player_name": participant.get("display_name")
    })
    async for event in cursor:
        player_events.append(event)
    
    # Calculate metrics
    questions_answered = participant.get("questions_answered", 0)
    questions_correct = participant.get("questions_correct", 0)
    accuracy = questions_correct / max(questions_answered, 1)
    
    outcome = SessionOutcome(
        session_id=session_id,
        game_id=game_id,
        player_id=participant.get("user_id"),
        player_name=participant.get("display_name", "Unknown"),
        final_score=participant.get("current_score", 0),
        rank=rank,
        percentile=(total_players - rank + 1) / total_players * 100 if total_players > 0 else 0,
        questions_total=questions_answered,
        questions_correct=questions_correct,
        questions_incorrect=questions_answered - questions_correct,
        accuracy_rate=accuracy,
        total_time_ms=participant.get("total_time_ms", 0),
        max_combo=participant.get("max_combo", 0),
        completed=True
    )
    
    return outcome


def session_from_db(doc: dict) -> Session:
    """Convert MongoDB document to Session model."""
    if isinstance(doc.get('created_at'), str):
        doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    if doc.get('started_at') and isinstance(doc['started_at'], str):
        doc['started_at'] = datetime.fromisoformat(doc['started_at'])
    if doc.get('ended_at') and isinstance(doc['ended_at'], str):
        doc['ended_at'] = datetime.fromisoformat(doc['ended_at'])
    
    # Parse participant dates
    for p in doc.get('participants', []):
        if isinstance(p.get('joined_at'), str):
            p['joined_at'] = datetime.fromisoformat(p['joined_at'])
        if isinstance(p.get('last_active_at'), str):
            p['last_active_at'] = datetime.fromisoformat(p['last_active_at'])
    
    return Session(**doc)
