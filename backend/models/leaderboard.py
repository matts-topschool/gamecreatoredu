"""
Leaderboard models - Per-game and per-class leaderboards with persistent high scores.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid


class LeaderboardScope(str, Enum):
    """Scope of leaderboard visibility."""
    GLOBAL = "global"       # Anyone can see
    CLASS = "class"         # Only class members
    SESSION = "session"     # Only session participants


class LeaderboardType(str, Enum):
    """What metric to rank by."""
    SCORE = "score"
    TIME = "time"           # Fastest completion
    ACCURACY = "accuracy"
    COMBO = "combo"
    DAMAGE = "damage"       # For battle games


class GameResult(BaseModel):
    """
    A single game play result. Created when a player completes a game.
    This is the primary record for tracking student performance.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    # References
    game_id: str
    player_id: Optional[str] = None  # User ID if registered
    player_name: str
    player_email: Optional[str] = None
    
    # Class context (optional)
    class_id: Optional[str] = None
    session_id: Optional[str] = None
    
    # Scores
    score: int = 0
    accuracy: float = 0.0  # 0.0 to 1.0
    
    # Performance details
    questions_total: int = 0
    questions_correct: int = 0
    questions_wrong: int = 0
    
    # Time metrics
    time_taken_seconds: int = 0
    avg_answer_time_ms: int = 0
    
    # Battle-specific (for monster battle games)
    damage_dealt: int = 0
    enemy_defeated: bool = False
    
    # Engagement
    max_combo: int = 0
    hints_used: int = 0
    
    # Game metadata (cached for display)
    game_title: str = ""
    game_type: str = "quiz"
    
    # Timestamps
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    def to_mongo_dict(self) -> dict:
        data = self.model_dump()
        data['started_at'] = data['started_at'].isoformat()
        data['completed_at'] = data['completed_at'].isoformat()
        return data


class GameResultCreate(BaseModel):
    """Schema for submitting a game result."""
    game_id: str
    player_name: str
    score: int
    accuracy: float
    questions_total: int
    questions_correct: int
    time_taken_seconds: int
    max_combo: int = 0
    hints_used: int = 0
    damage_dealt: int = 0
    enemy_defeated: bool = False
    
    # Optional context
    class_id: Optional[str] = None
    session_id: Optional[str] = None


class LeaderboardEntry(BaseModel):
    """A single entry in a leaderboard."""
    rank: int
    player_id: Optional[str] = None
    player_name: str
    score: int
    accuracy: float
    time_seconds: int
    max_combo: int
    played_at: datetime
    is_current_player: bool = False


class GameLeaderboard(BaseModel):
    """Leaderboard for a specific game."""
    game_id: str
    game_title: str
    leaderboard_type: LeaderboardType
    scope: LeaderboardScope
    entries: List[LeaderboardEntry]
    total_players: int
    last_updated: datetime


class PlayerHighScore(BaseModel):
    """
    A player's best score for a game.
    Updated whenever they beat their previous best.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    game_id: str
    player_id: Optional[str] = None
    player_name: str
    player_email: Optional[str] = None
    
    # Best scores (updated only if beaten)
    best_score: int = 0
    best_accuracy: float = 0.0
    best_time_seconds: int = 999999  # Lower is better
    best_combo: int = 0
    best_damage: int = 0
    
    # Play history
    total_plays: int = 0
    total_score: int = 0  # Sum of all plays
    avg_score: float = 0.0
    avg_accuracy: float = 0.0
    
    # Timestamps
    first_played: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_played: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    best_score_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    def to_mongo_dict(self) -> dict:
        data = self.model_dump()
        data['first_played'] = data['first_played'].isoformat()
        data['last_played'] = data['last_played'].isoformat()
        data['best_score_at'] = data['best_score_at'].isoformat()
        return data


class ClassLeaderboard(BaseModel):
    """Aggregated leaderboard for a class across all games."""
    class_id: str
    class_name: str
    entries: List[LeaderboardEntry]
    time_period: str  # "all_time", "this_week", "this_month"
    last_updated: datetime


class PlayerStats(BaseModel):
    """
    Aggregated stats for a player across all games.
    Used for the student's personal dashboard.
    """
    player_id: Optional[str] = None
    player_name: str
    player_email: Optional[str] = None
    
    # Overall performance
    total_games_played: int = 0
    unique_games: int = 0
    total_score: int = 0
    avg_score: float = 0.0
    avg_accuracy: float = 0.0
    
    # Best achievements
    highest_score: int = 0
    highest_accuracy: float = 0.0
    highest_combo: int = 0
    
    # Time investment
    total_play_time_minutes: int = 0
    
    # Recent activity
    recent_games: List[Dict[str, Any]] = Field(default_factory=list)  # Last 5 games
    
    # Streaks
    current_streak: int = 0  # Days played in a row
    longest_streak: int = 0
    
    last_active: Optional[datetime] = None
