"""
Analytics models - Track all gameplay events and outcomes for insights.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid


class EventType(str, Enum):
    # Session Events
    SESSION_START = "session_start"
    SESSION_END = "session_end"
    PLAYER_JOIN = "player_join"
    PLAYER_LEAVE = "player_leave"
    
    # Gameplay Events
    SCENE_ENTER = "scene_enter"
    SCENE_EXIT = "scene_exit"
    
    # Question Events
    QUESTION_SHOWN = "question_shown"
    ANSWER_SUBMITTED = "answer_submitted"
    HINT_USED = "hint_used"
    
    # Combat/Action Events
    DAMAGE_DEALT = "damage_dealt"
    DAMAGE_TAKEN = "damage_taken"
    ENEMY_DEFEATED = "enemy_defeated"
    LEVEL_COMPLETE = "level_complete"
    
    # Achievement Events
    COMBO_ACHIEVED = "combo_achieved"
    HIGH_SCORE = "high_score"
    BADGE_EARNED = "badge_earned"
    
    # Custom
    CUSTOM = "custom"


class GameEvent(BaseModel):
    """Individual gameplay event - immutable log entry."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    player_id: Optional[str] = None
    player_name: str
    
    event_type: EventType
    event_data: Dict[str, Any] = Field(default_factory=dict)
    
    # Context
    scene_id: Optional[str] = None
    game_time_ms: int = 0  # Time since game start
    
    # For question events
    question_id: Optional[str] = None
    answer_id: Optional[str] = None
    is_correct: Optional[bool] = None
    answer_time_ms: Optional[int] = None
    
    # Scoring
    points_earned: int = 0
    combo_at_time: int = 0
    
    # State snapshot (optional, for debugging)
    state_snapshot: Optional[Dict[str, Any]] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    def to_mongo_dict(self) -> dict:
        data = self.model_dump()
        data['created_at'] = data['created_at'].isoformat()
        return data


class MasteryLevel(str, Enum):
    NOVICE = "novice"           # 0-49%
    DEVELOPING = "developing"   # 50-69%
    PROFICIENT = "proficient"   # 70-89%
    MASTERED = "mastered"       # 90-100%


class StandardMastery(BaseModel):
    """Mastery of a specific learning standard."""
    standard_id: str
    standard_name: str
    questions_attempted: int = 0
    questions_correct: int = 0
    accuracy: float = 0.0
    mastery_level: MasteryLevel = MasteryLevel.NOVICE
    last_attempted: Optional[datetime] = None


class SessionOutcome(BaseModel):
    """
    Computed outcome for a player at session end.
    This is the main analytics record for a play session.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    game_id: str
    player_id: Optional[str] = None
    player_name: str
    
    # Final Scores
    final_score: int = 0
    rank: int = 0
    percentile: float = 0.0
    
    # Performance Metrics
    questions_total: int = 0
    questions_correct: int = 0
    questions_incorrect: int = 0
    accuracy_rate: float = 0.0
    
    # Time Metrics
    total_time_ms: int = 0
    avg_answer_time_ms: float = 0.0
    fastest_answer_ms: int = 0
    slowest_answer_ms: int = 0
    
    # Engagement Metrics
    hints_used: int = 0
    retries_used: int = 0
    max_combo: int = 0
    
    # Combat/Action Metrics (for action games)
    total_damage_dealt: int = 0
    enemies_defeated: int = 0
    levels_completed: int = 0
    
    # Standards Mastery
    mastery_by_standard: List[StandardMastery] = Field(default_factory=list)
    
    # Difficulty Progression
    avg_difficulty_faced: float = 0.0
    difficulty_at_start: int = 1
    difficulty_at_end: int = 1
    
    # Completion
    completion_rate: float = 0.0
    completed: bool = False
    
    # Timestamps
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ended_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    def to_mongo_dict(self) -> dict:
        data = self.model_dump()
        data['started_at'] = data['started_at'].isoformat()
        data['ended_at'] = data['ended_at'].isoformat()
        data['created_at'] = data['created_at'].isoformat()
        for m in data['mastery_by_standard']:
            if m.get('last_attempted'):
                m['last_attempted'] = m['last_attempted'].isoformat()
        return data


class HighScore(BaseModel):
    """
    Persistent high score record for leaderboards.
    One per player per game.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    game_id: str
    player_id: Optional[str] = None
    player_name: str
    avatar_url: Optional[str] = None
    
    # Best scores (updated if beaten)
    best_score: int = 0
    best_time_ms: int = 0  # Lower is better
    best_accuracy: float = 0.0
    best_combo: int = 0
    
    # Metadata
    attempts: int = 0
    last_played: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    first_played: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    def to_mongo_dict(self) -> dict:
        data = self.model_dump()
        data['last_played'] = data['last_played'].isoformat()
        data['first_played'] = data['first_played'].isoformat()
        return data


class GameAnalytics(BaseModel):
    """
    Aggregated analytics for a game across all sessions.
    Updated after each session ends.
    """
    game_id: str
    
    # Play counts
    total_sessions: int = 0
    total_plays: int = 0
    unique_players: int = 0
    
    # Performance aggregates
    avg_score: float = 0.0
    avg_accuracy: float = 0.0
    avg_completion_rate: float = 0.0
    avg_time_ms: float = 0.0
    
    # Difficulty
    avg_final_difficulty: float = 0.0
    
    # Question analytics
    questions_by_difficulty: Dict[int, Dict[str, Any]] = Field(default_factory=dict)
    # {1: {"total": 100, "correct": 80, "accuracy": 0.8}, ...}
    
    # Problem spots
    hardest_questions: List[str] = Field(default_factory=list)  # Question IDs with lowest accuracy
    
    # Time tracking
    peak_play_hours: List[int] = Field(default_factory=list)  # Hours of day with most plays
    
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StudentProgress(BaseModel):
    """
    Long-term progress tracking for a student across all games.
    Persists beyond individual sessions.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    student_name: str
    
    # Overall stats
    total_games_played: int = 0
    total_sessions: int = 0
    total_questions_answered: int = 0
    total_correct: int = 0
    overall_accuracy: float = 0.0
    
    # Time investment
    total_play_time_ms: int = 0
    
    # Standards mastery (aggregated across all games)
    mastery_by_standard: Dict[str, StandardMastery] = Field(default_factory=dict)
    
    # Subject performance
    performance_by_subject: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    # {"math": {"accuracy": 0.85, "games_played": 10}, ...}
    
    # Engagement
    games_completed: int = 0
    avg_session_length_ms: float = 0.0
    longest_streak: int = 0
    
    # Achievements/Badges
    badges_earned: List[str] = Field(default_factory=list)
    
    # Timeline
    first_play: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_play: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    def to_mongo_dict(self) -> dict:
        data = self.model_dump()
        data['first_play'] = data['first_play'].isoformat()
        data['last_play'] = data['last_play'].isoformat()
        return data
