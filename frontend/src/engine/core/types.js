/**
 * Universal Game Engine - Core Types
 * These types define the foundation of the ECS-based game engine.
 */

// ============== ENTITY COMPONENT SYSTEM ==============

/**
 * Base entity - everything in the game world
 */
export interface Entity {
  id: string;
  type: string;
  tags: Set<string>;
  components: Map<string, Component>;
  active: boolean;
  layer: number;
  children: string[];
  parent: string | null;
}

/**
 * Base component interface
 */
export interface Component {
  type: string;
  enabled: boolean;
}

/**
 * Transform component - position, rotation, scale
 */
export interface TransformComponent extends Component {
  type: 'transform';
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  anchorX: number;
  anchorY: number;
}

/**
 * Sprite component - visual representation
 */
export interface SpriteComponent extends Component {
  type: 'sprite';
  textureId: string;
  animations: Map<string, AnimationData>;
  currentAnimation: string;
  frameIndex: number;
  frameTime: number;
  tint: number;
  alpha: number;
  flipX: boolean;
  flipY: boolean;
  blendMode: string;
  filters: string[];
}

/**
 * Animation data
 */
export interface AnimationData {
  frames: number[];
  fps: number;
  loop: boolean;
  onComplete?: string; // Event to fire
}

/**
 * Physics body component
 */
export interface PhysicsBodyComponent extends Component {
  type: 'physics_body';
  bodyType: 'static' | 'dynamic' | 'kinematic';
  shape: 'box' | 'circle' | 'polygon' | 'capsule';
  width: number;
  height: number;
  radius?: number;
  mass: number;
  friction: number;
  restitution: number;
  isSensor: boolean;
  collisionLayer: number;
  collisionMask: number;
  velocity: { x: number; y: number };
  angularVelocity: number;
}

/**
 * Health component
 */
export interface HealthComponent extends Component {
  type: 'health';
  current: number;
  max: number;
  regeneration: number;
  invulnerable: boolean;
  invulnerabilityTimer: number;
  showHealthBar: boolean;
}

/**
 * Combat component
 */
export interface CombatComponent extends Component {
  type: 'combat';
  baseDamage: number;
  attackSpeed: number;
  critChance: number;
  critMultiplier: number;
  comboEnabled: boolean;
}

/**
 * AI component
 */
export interface AIComponent extends Component {
  type: 'ai';
  behavior: 'idle' | 'patrol' | 'chase' | 'flee' | 'wander' | 'custom';
  target: string | null;
  detectionRange: number;
  attackRange: number;
  patrolPath: { x: number; y: number }[];
  patrolIndex: number;
  thinkInterval: number;
  lastThinkTime: number;
}

/**
 * Question trigger component
 */
export interface QuestionTriggerComponent extends Component {
  type: 'question_trigger';
  questionPool: string;
  triggerType: 'collision' | 'timed' | 'manual';
  cooldown: number;
  lastTriggered: number;
  style: 'popup' | 'inline' | 'battle' | 'floating';
  pauseGame: boolean;
  onCorrect: Action[];
  onIncorrect: Action[];
}

/**
 * Particle emitter component
 */
export interface ParticleEmitterComponent extends Component {
  type: 'particle_emitter';
  preset: string;
  emitting: boolean;
  rate: number;
  lifetime: number;
  config: ParticleConfig;
}

/**
 * Movement component
 */
export interface MovementComponent extends Component {
  type: 'movement';
  speed: number;
  jumpForce: number;
  gravity: number;
  canJump: boolean;
  isGrounded: boolean;
  doubleJump: boolean;
  hasDoubleJumped: boolean;
}

// ============== GAME STATE ==============

/**
 * Game state - all runtime variables
 */
export interface GameState {
  variables: Map<string, StateVariable>;
  entities: Map<string, Entity>;
  currentScene: string;
  isPaused: boolean;
  gameTime: number;
  deltaTime: number;
}

/**
 * State variable
 */
export interface StateVariable {
  id: string;
  name: string;
  type: 'number' | 'string' | 'boolean' | 'array' | 'object';
  value: any;
  scope: 'player' | 'session' | 'global';
  persist: boolean;
}

// ============== EVENTS & ACTIONS ==============

/**
 * Game event
 */
export interface GameEvent {
  type: string;
  data: Record<string, any>;
  source?: string;
  target?: string;
  timestamp: number;
}

/**
 * Action - something that happens in response to an event
 */
export interface Action {
  type: string;
  params: Record<string, any>;
}

/**
 * Rule - event trigger with conditions and actions
 */
export interface Rule {
  id: string;
  trigger: EventTrigger;
  conditions: Condition[];
  actions: Action[];
  enabled: boolean;
  priority: number;
}

/**
 * Event trigger
 */
export interface EventTrigger {
  type: string;
  filter?: Record<string, any>;
}

/**
 * Condition
 */
export interface Condition {
  type: string;
  params: Record<string, any>;
}

// ============== RENDERING ==============

/**
 * Layer definition
 */
export interface Layer {
  id: string;
  type: 'background' | 'parallax' | 'entity' | 'particle' | 'ui';
  depth: number;
  scrollFactor: number;
  visible: boolean;
}

/**
 * Camera config
 */
export interface CameraConfig {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
  follow: string | null;
  bounds: { minX: number; maxX: number; minY: number; maxY: number } | null;
  smoothing: number;
}

// ============== WORLD CONFIG ==============

/**
 * World configuration
 */
export interface WorldConfig {
  width: number;
  height: number;
  gravity: { x: number; y: number };
  friction: number;
  backgroundColor: number;
  boundaries: {
    behavior: 'wrap' | 'block' | 'destroy' | 'bounce';
    padding: number;
  };
}

/**
 * Particle configuration
 */
export interface ParticleConfig {
  maxParticles: number;
  spawnRate: number;
  lifetime: { min: number; max: number };
  speed: { min: number; max: number };
  direction: { min: number; max: number };
  scale: { start: number; end: number };
  alpha: { start: number; end: number };
  color: { start: number; end: number };
  gravity: { x: number; y: number };
  texture: string;
}

// ============== ANALYTICS ==============

/**
 * Telemetry event for analytics
 */
export interface TelemetryEvent {
  type: string;
  playerId: string;
  playerName: string;
  sessionId: string;
  gameTime: number;
  data: Record<string, any>;
  timestamp: number;
}

/**
 * Player session stats
 */
export interface PlayerStats {
  score: number;
  combo: number;
  maxCombo: number;
  questionsAnswered: number;
  questionsCorrect: number;
  totalTimeMs: number;
  damageDealt: number;
  enemiesDefeated: number;
}

// ============== QUESTION SYSTEM ==============

/**
 * Question definition
 */
export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'matching' | 'drag_drop';
  stem: string;
  stemFormat: 'text' | 'markdown' | 'latex' | 'image';
  options: QuestionOption[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: number;
  standards: string[];
  hints: string[];
  timeLimit?: number;
  aiFeedback: Record<string, string>;
}

/**
 * Question option
 */
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  image?: string;
}

/**
 * Answer result
 */
export interface AnswerResult {
  questionId: string;
  answerId: string;
  isCorrect: boolean;
  timeMs: number;
  pointsEarned: number;
  feedback: string;
  combo: number;
  speedBonus: number;
}

// ============== LEADERBOARD ==============

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  playerId?: string;
  playerName: string;
  avatarUrl?: string;
  score: number;
  accuracy: number;
  timeMs: number;
  comboMax: number;
  isCurrentPlayer: boolean;
}

/**
 * Leaderboard config
 */
export interface LeaderboardConfig {
  enabled: boolean;
  type: 'score' | 'time' | 'accuracy' | 'combo';
  showTop: number;
  showRanks: boolean;
  highlightCurrentPlayer: boolean;
  updateInterval: number;
}

// ============== EXPORTS ==============

export type ComponentType = 
  | TransformComponent 
  | SpriteComponent 
  | PhysicsBodyComponent 
  | HealthComponent
  | CombatComponent
  | AIComponent
  | QuestionTriggerComponent
  | ParticleEmitterComponent
  | MovementComponent;

export type SystemName = 
  | 'render'
  | 'physics'
  | 'animation'
  | 'ai'
  | 'health'
  | 'combat'
  | 'movement'
  | 'question'
  | 'particle'
  | 'audio';
