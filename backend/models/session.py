"""
Session model - Tracks live game sessions and player participation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid
import random
import string


class SessionMode(str, Enum):
    LIVE = "live"           # Teacher-led, real-time
    ASYNC = "async"         # Self-paced
    PRACTICE = "practice"   # No tracking, just play
    DEMO = "demo"           # Demo mode


class SessionStatus(str, Enum):
    LOBBY = "lobby"
    ACTIVE = "active"
    PAUSED = "paused"
    ENDED = "ended"


def generate_join_code() -> str:
    """Generate a 6-character alphanumeric join code."""
    chars = string.ascii_uppercase + string.digits
    # Remove confusing characters
    chars = chars.replace('0', '').replace('O', '').replace('I', '').replace('1', '')
    return ''.join(random.choices(chars, k=6))


class SessionSettings(BaseModel):
    """Session configuration options."""
    allow_late_join: bool = True
    show_leaderboard: bool = True
    leaderboard_type: str = "score"  # score, time, accuracy, combo
    randomize_questions: bool = True
    time_limit_minutes: Optional[int] = None
    max_players: int = 50
    allow_retries: bool = False
    show_correct_answers: bool = True
    adaptive_difficulty: bool = True


class Participant(BaseModel):
    """Player in a session."""
    user_id: Optional[str] = None  # None for anonymous/guest players
    display_name: str
    avatar_url: Optional[str] = None
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_connected: bool = True
    last_active_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Live state
    current_score: int = 0
    current_combo: int = 0
    max_combo: int = 0
    questions_answered: int = 0
    questions_correct: int = 0
    total_time_ms: int = 0


class SessionCreate(BaseModel):
    """Schema for creating a new session."""
    game_id: str
    class_id: Optional[str] = None
    mode: SessionMode = SessionMode.LIVE
    settings: SessionSettings = Field(default_factory=SessionSettings)


class SessionInDB(BaseModel):
    """Session as stored in database."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    game_id: str
    teacher_id: str
    class_id: Optional[str] = None
    
    join_code: str = Field(default_factory=generate_join_code)
    
    mode: SessionMode = SessionMode.LIVE
    status: SessionStatus = SessionStatus.LOBBY
    settings: SessionSettings = Field(default_factory=SessionSettings)
    
    # Game state
    current_scene_id: Optional[str] = None
    game_state: Dict[str, Any] = Field(default_factory=dict)
    
    # Participants
    participants: List[Participant] = Field(default_factory=list)
    
    # Timing
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    
    def to_mongo_dict(self) -> dict:
        data = self.model_dump()
        data['created_at'] = data['created_at'].isoformat()
        if data['started_at']:
            data['started_at'] = data['started_at'].isoformat()
        if data['ended_at']:
            data['ended_at'] = data['ended_at'].isoformat()
        # Convert participants
        for p in data['participants']:
            p['joined_at'] = p['joined_at'].isoformat()
            p['last_active_at'] = p['last_active_at'].isoformat()
        return data


class Session(BaseModel):
    """Session response schema."""
    id: str
    game_id: str
    teacher_id: str
    join_code: str
    mode: SessionMode
    status: SessionStatus
    settings: SessionSettings
    participants: List[Participant]
    current_scene_id: Optional[str]
    created_at: datetime
    started_at: Optional[datetime]
    ended_at: Optional[datetime]


class LeaderboardEntry(BaseModel):
    """Single leaderboard entry."""
    rank: int
    player_name: str
    player_id: Optional[str] = None
    avatar_url: Optional[str] = None
    score: int
    accuracy: float
    time_ms: int
    combo_max: int
    is_current_player: bool = False
