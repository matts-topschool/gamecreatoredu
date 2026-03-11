"""
Game model definitions including GameSpec schema.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid
import re


class GameStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class GameVisibility(str, Enum):
    PRIVATE = "private"
    PUBLIC = "public"
    UNLISTED = "unlisted"


class LicenseType(str, Enum):
    SINGLE = "single"
    CLASS = "class"
    SCHOOL = "school"
    DISTRICT = "district"


def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from title."""
    slug = title.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    slug = slug[:50]  # Limit length
    slug = f"{slug}-{str(uuid.uuid4())[:8]}"
    return slug


# ============== GameSpec Sub-schemas ==============

class AccessibilitySettings(BaseModel):
    """Accessibility settings for a game."""
    colorblind_safe: bool = True
    screen_reader_friendly: bool = True
    keyboard_navigable: bool = True
    text_to_speech: bool = False


class GameplaySettings(BaseModel):
    """Gameplay configuration."""
    estimated_duration_minutes: int = 15
    player_mode: str = "single"  # single, multiplayer, collaborative
    max_players: int = 30
    difficulty: int = 1  # 1-5


class EducationalMeta(BaseModel):
    """Educational metadata."""
    grade_levels: List[int] = Field(default_factory=list)
    subjects: List[str] = Field(default_factory=list)
    standards: List[Dict[str, str]] = Field(default_factory=list)
    learning_objectives: List[str] = Field(default_factory=list)


class GameMeta(BaseModel):
    """Game metadata section of spec."""
    title: str
    description: str = ""
    thumbnail_url: Optional[str] = None
    game_type: str = "quiz"  # quiz, battle, adventure, platformer, puzzle, simulation
    educational: EducationalMeta = Field(default_factory=EducationalMeta)
    gameplay: GameplaySettings = Field(default_factory=GameplaySettings)
    accessibility: AccessibilitySettings = Field(default_factory=AccessibilitySettings)
    language: str = "en-US"


class GameAsset(BaseModel):
    """Asset reference."""
    id: str
    url: str
    alt: Optional[str] = None
    type: Optional[str] = None
    license: str = "custom"


class GameAssets(BaseModel):
    """Assets section of spec."""
    images: List[GameAsset] = Field(default_factory=list)
    audio: List[GameAsset] = Field(default_factory=list)
    backgrounds: List[GameAsset] = Field(default_factory=list)


class StateVariable(BaseModel):
    """Game state variable."""
    id: str
    name: str
    type: str = "number"  # number, string, boolean, array
    initial_value: Any = 0
    scope: str = "player"  # player, session
    display: bool = True


class GameState(BaseModel):
    """State section of spec."""
    variables: List[StateVariable] = Field(default_factory=list)


class ComponentStyle(BaseModel):
    """Component styling."""
    size: Optional[str] = None
    color: Optional[str] = None
    animation: Optional[str] = None
    position: Optional[str] = None


class ComponentAction(BaseModel):
    """Component action definition."""
    type: str
    target: Optional[str] = None
    variable: Optional[str] = None
    value: Optional[Any] = None


class SceneComponent(BaseModel):
    """Component within a scene."""
    id: str
    type: str
    content: Optional[str] = None
    label: Optional[str] = None
    variable: Optional[str] = None
    format: Optional[str] = None
    style: Optional[Dict[str, Any]] = None
    action: Optional[ComponentAction] = None
    show_when: Optional[Dict[str, Any]] = None


class SceneLayout(BaseModel):
    """Scene layout configuration."""
    type: str = "centered"
    background: Optional[str] = None
    padding: str = "medium"


class SceneTransition(BaseModel):
    """Scene transition animation."""
    type: str = "fade"
    direction: Optional[str] = None
    duration: int = 300


class SceneTransitions(BaseModel):
    """Entry and exit transitions."""
    entry: Optional[SceneTransition] = None
    exit: Optional[SceneTransition] = None


class RuleCondition(BaseModel):
    """Rule condition."""
    type: str
    value: Optional[Any] = None
    variable: Optional[str] = None
    operator: Optional[str] = None


class RuleAction(BaseModel):
    """Rule action."""
    type: str
    variable: Optional[str] = None
    value: Optional[Any] = None
    amount: Optional[int] = None
    target: Optional[str] = None
    message: Optional[str] = None
    asset_id: Optional[str] = None
    feedback_type: Optional[str] = None


class SceneRule(BaseModel):
    """Rule definition."""
    id: str
    trigger: str
    conditions: List[RuleCondition] = Field(default_factory=list)
    actions: List[RuleAction] = Field(default_factory=list)


class Scene(BaseModel):
    """Scene definition."""
    id: str
    type: str  # title, question, story, board, result
    title: str
    layout: SceneLayout = Field(default_factory=SceneLayout)
    components: List[SceneComponent] = Field(default_factory=list)
    rules: List[SceneRule] = Field(default_factory=list)
    transitions: Optional[SceneTransitions] = None


class QuestionOption(BaseModel):
    """Question answer option."""
    id: str
    text: str
    is_correct: bool = False


class Question(BaseModel):
    """Question content."""
    id: str
    type: str = "multiple_choice"
    stem: str
    stem_format: str = "text"
    options: List[QuestionOption] = Field(default_factory=list)
    correct_answer: Optional[Any] = None
    explanation: Optional[str] = None
    difficulty: int = 1
    standards: List[str] = Field(default_factory=list)
    ai_feedback: Dict[str, str] = Field(default_factory=dict)
    hints: List[str] = Field(default_factory=list)
    time_limit_seconds: Optional[int] = None


class StoryNode(BaseModel):
    """Story node for narrative games."""
    id: str
    text: str
    speaker: Optional[str] = None
    branches: List[Dict[str, Any]] = Field(default_factory=list)


class GameContent(BaseModel):
    """Content section of spec."""
    questions: List[Question] = Field(default_factory=list)
    story_nodes: List[StoryNode] = Field(default_factory=list)
    characters: List[Dict[str, Any]] = Field(default_factory=list)
    dialogue: List[Dict[str, Any]] = Field(default_factory=list)


class MasteryLevel(BaseModel):
    """Mastery level definition."""
    name: str
    min_percent: int
    max_percent: int


class StandardMapping(BaseModel):
    """Standard to questions mapping."""
    standard_id: str
    questions: List[str] = Field(default_factory=list)
    mastery_threshold: float = 0.8


class GradingConfig(BaseModel):
    """Grading configuration."""
    scoring_model: str = "points"  # points, mastery, completion
    max_score: Optional[int] = None
    passing_threshold: float = 0.7
    mastery_levels: List[MasteryLevel] = Field(default_factory=lambda: [
        MasteryLevel(name="Novice", min_percent=0, max_percent=49),
        MasteryLevel(name="Developing", min_percent=50, max_percent=69),
        MasteryLevel(name="Proficient", min_percent=70, max_percent=89),
        MasteryLevel(name="Mastered", min_percent=90, max_percent=100)
    ])
    standards_mapping: List[StandardMapping] = Field(default_factory=list)


class GameSettings(BaseModel):
    """Game settings."""
    allow_skip: bool = False
    allow_hints: bool = True
    max_hints_per_question: int = 2
    hint_penalty_points: int = 2
    allow_retry: bool = False
    shuffle_questions: bool = True
    shuffle_options: bool = True
    show_correct_answer_on_wrong: bool = True
    show_explanation: bool = True
    timer_type: str = "none"  # none, per_question, total
    background_music: bool = True
    sound_effects: bool = True


class BattleEntity(BaseModel):
    """Battle game entity (player or enemy)."""
    model_config = ConfigDict(extra="allow")  # Allow extra fields
    
    id: str
    name: str
    description: Optional[str] = None
    health: Dict[str, Any] = Field(default_factory=lambda: {"max": 100, "current": 100})
    weakness: Optional[str] = None
    taunt_messages: List[str] = Field(default_factory=list)
    defeat_message: Optional[str] = None


class BattleEntities(BaseModel):
    """Battle game entities container."""
    model_config = ConfigDict(extra="allow")  # Allow extra fields
    
    player: Optional[Dict[str, Any]] = None
    enemy: Optional[BattleEntity] = None


class BattleConfig(BaseModel):
    """Battle game configuration."""
    model_config = ConfigDict(extra="allow")  # Allow extra fields
    
    damage_per_correct: int = 10
    bonus_damage_per_combo: int = 5
    speed_bonus_threshold_seconds: int = 5
    speed_bonus_damage: int = 5
    player_damage_on_wrong: int = 10


class GameSpec(BaseModel):
    """
    Complete Game Specification - The heart of the Game OS.
    This JSON document fully describes an educational game.
    """
    model_config = ConfigDict(extra="allow")  # Allow extra fields for flexibility

    version: str = "1.0"
    meta: GameMeta
    assets: GameAssets = Field(default_factory=GameAssets)
    state: GameState = Field(default_factory=GameState)
    scenes: List[Scene] = Field(default_factory=list)
    content: GameContent = Field(default_factory=GameContent)
    grading: GradingConfig = Field(default_factory=GradingConfig)
    settings: GameSettings = Field(default_factory=GameSettings)
    # Battle game specific fields
    entities: Optional[Dict[str, Any]] = None
    battle_config: Optional[Dict[str, Any]] = None
    # Puzzle game specific fields
    puzzle_config: Optional[Dict[str, Any]] = None
    puzzle_visuals: Optional[Dict[str, Any]] = None


# ============== Game Model ==============

class GameBase(BaseModel):
    """Base game fields."""
    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(default="", max_length=500)


class GameCreate(GameBase):
    """Schema for creating a new game."""
    spec: Optional[GameSpec] = None
    grade_levels: List[int] = Field(default_factory=list)
    subjects: List[str] = Field(default_factory=list)


class GameUpdate(BaseModel):
    """Schema for updating a game."""
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    thumbnail_url: Optional[str] = None
    status: Optional[GameStatus] = None
    visibility: Optional[GameVisibility] = None
    grade_levels: Optional[List[int]] = None
    subjects: Optional[List[str]] = None
    standards_tags: Optional[List[str]] = None


class GameSpecUpdate(BaseModel):
    """Schema for updating just the game spec."""
    # Accept raw dict to support AI-generated specs with extended fields
    spec: Dict[str, Any]


class GameInDB(GameBase):
    """Game as stored in database."""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    owner_id: str
    slug: str
    thumbnail_url: Optional[str] = None
    
    spec: Optional[Dict[str, Any]] = None
    spec_version: int = 1
    
    status: GameStatus = GameStatus.DRAFT
    visibility: GameVisibility = GameVisibility.PRIVATE
    
    is_marketplace_listed: bool = False
    price_cents: int = 0
    license_type: LicenseType = LicenseType.SINGLE
    
    # Fork/derivative tracking
    forked_from_id: Optional[str] = None  # Original game ID if this is a fork
    is_forked: bool = False  # True if this game is a fork/derivative
    allow_derivative_sales: bool = False  # Creator allows resale of forked games
    
    grade_levels: List[int] = Field(default_factory=list)
    subjects: List[str] = Field(default_factory=list)
    standards_tags: List[str] = Field(default_factory=list)
    language: str = "en-US"
    
    play_count: int = 0
    avg_rating: float = 0.0
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    published_at: Optional[datetime] = None
    
    def to_mongo_dict(self) -> dict:
        """Convert to dictionary for MongoDB storage."""
        data = self.model_dump()
        data['created_at'] = data['created_at'].isoformat()
        data['updated_at'] = data['updated_at'].isoformat()
        if data['published_at']:
            data['published_at'] = data['published_at'].isoformat()
        return data


class Game(GameBase):
    """Game response schema."""
    model_config = ConfigDict(extra="ignore")
    
    id: str
    owner_id: str
    slug: str
    thumbnail_url: Optional[str] = None
    
    spec: Optional[Dict[str, Any]] = None
    spec_version: int
    
    status: GameStatus
    visibility: GameVisibility
    
    is_marketplace_listed: bool
    price_cents: int
    
    # Fork/derivative tracking
    forked_from_id: Optional[str] = None
    is_forked: bool = False
    allow_derivative_sales: bool = False
    
    grade_levels: List[int]
    subjects: List[str]
    standards_tags: List[str]
    language: str
    
    play_count: int
    avg_rating: float
    
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None


class GameSummary(BaseModel):
    """Condensed game info for lists."""
    id: str
    title: str
    slug: str
    description: str
    thumbnail_url: Optional[str] = None
    status: GameStatus
    play_count: int
    avg_rating: float
    grade_levels: List[int]
    subjects: List[str]
    created_at: datetime
    updated_at: datetime


def game_from_db(doc: dict) -> Game:
    """Convert MongoDB document to Game model."""
    if isinstance(doc.get('created_at'), str):
        doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    if isinstance(doc.get('updated_at'), str):
        doc['updated_at'] = datetime.fromisoformat(doc['updated_at'])
    if doc.get('published_at') and isinstance(doc['published_at'], str):
        doc['published_at'] = datetime.fromisoformat(doc['published_at'])
    
    return Game(**doc)


def create_default_game_spec(title: str, description: str = "") -> dict:
    """Create a default empty game spec."""
    return GameSpec(
        meta=GameMeta(
            title=title,
            description=description
        ),
        state=GameState(variables=[
            StateVariable(id="score", name="Score", type="number", initial_value=0, display=True),
            StateVariable(id="current_question", name="Current Question", type="number", initial_value=0, display=False)
        ]),
        scenes=[
            Scene(
                id="title_screen",
                type="title",
                title="Welcome",
                components=[
                    SceneComponent(
                        id="title_text",
                        type="text",
                        content=title,
                        style={"size": "h1"}
                    ),
                    SceneComponent(
                        id="start_button",
                        type="button",
                        label="Start Game",
                        style={"variant": "primary"},
                        action=ComponentAction(type="navigate", target="question_scene")
                    )
                ]
            ),
            Scene(
                id="question_scene",
                type="question",
                title="Questions",
                components=[
                    SceneComponent(
                        id="question_card",
                        type="question-card",
                        content="content.questions"
                    )
                ]
            ),
            Scene(
                id="results_scene",
                type="result",
                title="Results",
                components=[
                    SceneComponent(
                        id="results_text",
                        type="text",
                        content="Great Job!",
                        style={"size": "h1"}
                    ),
                    SceneComponent(
                        id="score_display",
                        type="state-display",
                        variable="score",
                        format="Final Score: {value}"
                    )
                ]
            )
        ]
    ).model_dump()
