# Universal Game Engine - Implementation Architecture

## Core Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    RENDERING LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  PixiJS v8          - 2D WebGL rendering, sprites, particles    │
│  @pixi/spine        - Skeletal animations for characters        │
│  @pixi/tilemap      - Efficient tile-based worlds               │
│  pixi-filters       - Glow, blur, outline effects               │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    PHYSICS LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  Matter.js          - 2D physics (collision, gravity, forces)   │
│  Custom pathfinding - A* for AI movement                        │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    AUDIO LAYER                                   │
├─────────────────────────────────────────────────────────────────┤
│  Howler.js          - Spatial audio, music layers, effects      │
│  Tone.js (optional) - Procedural music for rhythm games         │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    ANIMATION LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  GSAP               - Tweens, timelines, complex sequences      │
│  Lottie-web         - Import After Effects animations           │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                              │
├─────────────────────────────────────────────────────────────────┤
│  Custom ECS         - Entity Component System for game objects  │
│  Zustand            - React state bridge                        │
│  Immer              - Immutable state updates                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Entity Component System (ECS)

The heart of the universal engine - everything is an Entity with Components:

```typescript
// Core Types

interface Entity {
  id: string;
  components: Map<string, Component>;
  tags: Set<string>;
  active: boolean;
}

interface Component {
  type: string;
  data: any;
  update?: (dt: number, entity: Entity, world: World) => void;
  render?: (entity: Entity, renderer: Renderer) => void;
  onEvent?: (event: GameEvent, entity: Entity) => void;
}

// Built-in Components

interface TransformComponent {
  type: 'transform';
  data: {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    anchor: { x: number; y: number };
  };
}

interface SpriteComponent {
  type: 'sprite';
  data: {
    texture: string;
    animations: Map<string, AnimationData>;
    currentAnimation: string;
    frameIndex: number;
    tint: number;
    alpha: number;
    blendMode: string;
    filters: Filter[];
  };
}

interface PhysicsBodyComponent {
  type: 'physics_body';
  data: {
    bodyType: 'static' | 'dynamic' | 'kinematic';
    shape: 'box' | 'circle' | 'polygon' | 'capsule';
    mass: number;
    friction: number;
    restitution: number;
    collisionMask: number;
    isSensor: boolean;
    velocity: { x: number; y: number };
  };
}

interface HealthComponent {
  type: 'health';
  data: {
    current: number;
    max: number;
    regeneration: number;
    invulnerable: boolean;
    invulnerabilityTime: number;
  };
}

interface AIComponent {
  type: 'ai';
  data: {
    behavior: 'idle' | 'patrol' | 'chase' | 'flee' | 'custom';
    target: string | null;
    detectionRange: number;
    attackRange: number;
    patrolPath: Point[];
    currentPathIndex: number;
    thinkInterval: number;
  };
}

interface QuestionTriggerComponent {
  type: 'question_trigger';
  data: {
    questionPool: string;
    triggered: boolean;
    cooldown: number;
    onCorrect: Action[];
    onIncorrect: Action[];
    style: 'popup' | 'inline' | 'battle';
  };
}

interface ParticleEmitterComponent {
  type: 'particle_emitter';
  data: {
    preset: string;  // 'fire', 'sparkle', 'smoke', etc.
    emitting: boolean;
    rate: number;
    lifetime: number;
    config: ParticleConfig;
  };
}
```

---

## Systems (Process Components Each Frame)

```typescript
// System Interface
interface System {
  name: string;
  requiredComponents: string[];
  priority: number;  // Lower = runs first
  
  update(entities: Entity[], world: World, dt: number): void;
}

// Built-in Systems

class PhysicsSystem implements System {
  name = 'physics';
  requiredComponents = ['transform', 'physics_body'];
  priority = 10;
  
  private engine: Matter.Engine;
  
  update(entities, world, dt) {
    // Sync Matter.js bodies with entity transforms
    // Handle collisions
    // Fire collision events
  }
}

class RenderSystem implements System {
  name = 'render';
  requiredComponents = ['transform', 'sprite'];
  priority = 100;
  
  update(entities, world, dt) {
    // Update sprite positions from transforms
    // Advance animations
    // Apply filters/effects
  }
}

class AISystem implements System {
  name = 'ai';
  requiredComponents = ['transform', 'ai'];
  priority = 20;
  
  update(entities, world, dt) {
    // Run behavior trees
    // Pathfinding
    // Target selection
  }
}

class HealthSystem implements System {
  name = 'health';
  requiredComponents = ['health'];
  priority = 30;
  
  update(entities, world, dt) {
    // Apply regeneration
    // Check for death (health <= 0)
    // Handle invulnerability timers
  }
}

class QuestionSystem implements System {
  name = 'question';
  requiredComponents = ['question_trigger'];
  priority = 50;
  
  update(entities, world, dt) {
    // Check trigger zones
    // Spawn question UI
    // Process answers
  }
}

class ParticleSystem implements System {
  name = 'particles';
  requiredComponents = ['particle_emitter'];
  priority = 90;
  
  update(entities, world, dt) {
    // Update particle positions
    // Spawn new particles
    // Remove dead particles
  }
}
```

---

## Game World Manager

```typescript
class GameWorld {
  private entities: Map<string, Entity> = new Map();
  private systems: System[] = [];
  private eventQueue: GameEvent[] = [];
  private state: GameState;
  private spec: GameSpec;
  
  // Pixi.js stage
  private stage: PIXI.Container;
  private renderer: PIXI.Renderer;
  
  // Physics
  private physicsEngine: Matter.Engine;
  
  // Audio
  private audioManager: AudioManager;
  
  constructor(spec: GameSpec, container: HTMLElement) {
    this.spec = spec;
    this.initRenderer(container);
    this.initPhysics();
    this.initAudio();
    this.registerSystems();
    this.loadSpec(spec);
  }
  
  // Entity Management
  createEntity(type: string, overrides?: Partial<EntityType>): Entity
  destroyEntity(id: string): void
  getEntity(id: string): Entity | undefined
  queryEntities(tags: string[]): Entity[]
  
  // Event System
  emit(event: GameEvent): void
  on(eventType: string, handler: EventHandler): void
  off(eventType: string, handler: EventHandler): void
  
  // Game Loop
  start(): void
  pause(): void
  resume(): void
  
  private update(dt: number): void {
    // 1. Process event queue
    this.processEvents();
    
    // 2. Run systems in priority order
    for (const system of this.systems) {
      const entities = this.getEntitiesForSystem(system);
      system.update(entities, this, dt);
    }
    
    // 3. Clean up destroyed entities
    this.cleanupEntities();
  }
  
  private render(): void {
    this.renderer.render(this.stage);
  }
}
```

---

## Spec-to-World Compiler

Transforms GameSpec JSON into live game entities:

```typescript
class SpecCompiler {
  compile(spec: GameSpec, world: GameWorld): void {
    // 1. Setup world configuration
    this.setupWorld(spec.world, world);
    
    // 2. Load assets
    await this.loadAssets(spec.assets);
    
    // 3. Create layers
    for (const layer of spec.layers) {
      this.createLayer(layer, world);
    }
    
    // 4. Register entity types
    for (const [name, type] of Object.entries(spec.entity_types)) {
      world.registerEntityType(name, type);
    }
    
    // 5. Spawn initial entities
    for (const entityDef of spec.entities) {
      world.createEntity(entityDef.type, entityDef);
    }
    
    // 6. Setup spawners
    for (const spawner of spec.spawners) {
      world.createSpawner(spawner);
    }
    
    // 7. Compile rules into event handlers
    for (const rule of spec.rules) {
      this.compileRule(rule, world);
    }
    
    // 8. Setup UI
    this.setupUI(spec.ui, world);
  }
  
  private compileRule(rule: Rule, world: GameWorld): void {
    // Convert declarative rule to event handler
    const handler = (event: GameEvent) => {
      // Check conditions
      if (!this.checkConditions(rule.conditions, event, world)) {
        return;
      }
      
      // Execute actions
      for (const action of rule.actions) {
        this.executeAction(action, event, world);
      }
    };
    
    // Register handler for trigger event
    world.on(rule.trigger.name, handler);
  }
  
  private executeAction(action: Action, event: GameEvent, world: GameWorld): void {
    switch (action.type) {
      case 'spawn_entity':
        world.createEntity(action.entityType, action.config);
        break;
        
      case 'destroy_entity':
        world.destroyEntity(action.target);
        break;
        
      case 'modify':
        this.modifyValue(action.target, action.operation, action.value, world);
        break;
        
      case 'play_animation':
        this.playAnimation(action.entity, action.animation, world);
        break;
        
      case 'play_sound':
        world.audioManager.play(action.sound);
        break;
        
      case 'spawn_effect':
        this.spawnEffect(action.effect, action.position, world);
        break;
        
      case 'screen_shake':
        world.camera.shake(action.intensity, action.duration);
        break;
        
      case 'show_question':
        world.questionManager.show(action.questionId);
        break;
        
      case 'navigate':
        world.loadScene(action.target);
        break;
        
      // ... many more action types
    }
  }
}
```

---

## React Integration

```tsx
// Main Game Component
interface GameCanvasProps {
  spec: GameSpec;
  onGameEvent?: (event: GameEvent) => void;
  onStateChange?: (state: GameState) => void;
  paused?: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  spec, 
  onGameEvent, 
  onStateChange,
  paused 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<GameWorld | null>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create game world
    const world = new GameWorld(spec, containerRef.current);
    worldRef.current = world;
    
    // Setup event forwarding
    world.on('*', (event) => {
      onGameEvent?.(event);
    });
    
    world.on('state_change', (state) => {
      onStateChange?.(state);
    });
    
    // Start game loop
    world.start();
    
    return () => {
      world.destroy();
    };
  }, [spec]);
  
  useEffect(() => {
    if (paused) {
      worldRef.current?.pause();
    } else {
      worldRef.current?.resume();
    }
  }, [paused]);
  
  return (
    <div 
      ref={containerRef} 
      className="game-canvas"
      data-testid="game-canvas"
    />
  );
};

// Question Overlay Component
const QuestionOverlay: React.FC<{
  question: Question;
  style: 'popup' | 'inline' | 'battle';
  onAnswer: (answer: string, timeMs: number) => void;
}> = ({ question, style, onAnswer }) => {
  const [startTime] = useState(Date.now());
  
  const handleAnswer = (answerId: string) => {
    const timeMs = Date.now() - startTime;
    onAnswer(answerId, timeMs);
  };
  
  return (
    <div className={`question-overlay question-overlay--${style}`}>
      <div className="question-stem">{question.stem}</div>
      <div className="question-options">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleAnswer(option.id)}
            className="question-option"
            data-testid={`option-${option.id}`}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};

// Complete Game Player Component
const GamePlayer: React.FC<{
  gameId: string;
  sessionId?: string;
}> = ({ gameId, sessionId }) => {
  const [spec, setSpec] = useState<GameSpec | null>(null);
  const [gameState, setGameState] = useState<GameState>({});
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    // Load game spec
    gameService.getGameSpec(gameId).then(setSpec);
  }, [gameId]);
  
  const handleGameEvent = (event: GameEvent) => {
    switch (event.type) {
      case 'show_question':
        setCurrentQuestion(event.question);
        if (spec?.ui?.question_overlay?.pause_game) {
          setIsPaused(true);
        }
        break;
        
      case 'game_over':
        // Handle game over
        break;
        
      case 'level_complete':
        // Handle level complete
        break;
    }
    
    // Send to server if in session
    if (sessionId) {
      sessionService.sendEvent(sessionId, event);
    }
  };
  
  const handleAnswer = async (answer: string, timeMs: number) => {
    const isCorrect = checkAnswer(currentQuestion!, answer);
    
    // Send answer event to game
    const event: GameEvent = {
      type: isCorrect ? 'answer_correct' : 'answer_incorrect',
      data: { answer, timeMs, questionId: currentQuestion!.id }
    };
    
    // Game world will process and trigger rules
    worldRef.current?.emit(event);
    
    setCurrentQuestion(null);
    setIsPaused(false);
  };
  
  if (!spec) return <LoadingSpinner />;
  
  return (
    <div className="game-player">
      <GameCanvas
        spec={spec}
        onGameEvent={handleGameEvent}
        onStateChange={setGameState}
        paused={isPaused}
      />
      
      {currentQuestion && (
        <QuestionOverlay
          question={currentQuestion}
          style={spec.ui?.question_overlay?.style || 'popup'}
          onAnswer={handleAnswer}
        />
      )}
      
      <GameHUD state={gameState} config={spec.ui?.hud} />
    </div>
  );
};
```

---

## Asset Pipeline

```typescript
// Asset types the engine supports
type AssetType = 
  | 'spritesheet'    // Texture atlas with frames
  | 'spine'          // Skeletal animation
  | 'image'          // Single image
  | 'audio'          // Sound effect or music
  | 'tilemap'        // Tile-based map data
  | 'font'           // Custom font
  | 'particle'       // Particle effect config
  | 'shader';        // Custom shader

// Asset loader with caching
class AssetManager {
  private cache: Map<string, any> = new Map();
  private loader: PIXI.Loader;
  
  async loadAssets(manifest: AssetManifest): Promise<void> {
    const toLoad = manifest.filter(a => !this.cache.has(a.id));
    
    // Batch load with progress
    for (const asset of toLoad) {
      this.loader.add(asset.id, asset.url);
    }
    
    await new Promise(resolve => this.loader.load(resolve));
    
    // Post-process and cache
    for (const asset of toLoad) {
      const processed = this.processAsset(asset);
      this.cache.set(asset.id, processed);
    }
  }
  
  get(id: string): any {
    return this.cache.get(id);
  }
  
  // Generate placeholder assets for rapid prototyping
  generatePlaceholder(type: AssetType, config: any): any {
    switch (type) {
      case 'spritesheet':
        return this.generatePlaceholderSprite(config);
      case 'audio':
        return this.generatePlaceholderAudio(config);
      // ...
    }
  }
}
```

---

## Effect Library

Pre-built effects that can be spawned anywhere:

```typescript
const EFFECT_PRESETS = {
  // Combat Effects
  sword_slash: {
    type: 'animated_sprite',
    spritesheet: 'effects_combat',
    animation: 'slash',
    duration: 300,
    scale: 1.5
  },
  
  explosion_small: {
    type: 'particle',
    preset: 'explosion',
    scale: 0.5,
    duration: 500,
    particles: 20
  },
  
  damage_number: {
    type: 'text',
    font: 'damage_font',
    animate: 'float_up_fade',
    duration: 1000
  },
  
  // Magic Effects
  heal_sparkle: {
    type: 'particle',
    preset: 'sparkle',
    color: '#00ff88',
    duration: 1500
  },
  
  fire_burst: {
    type: 'particle',
    preset: 'fire',
    scale: 2,
    duration: 800
  },
  
  // UI Effects  
  combo_fire: {
    type: 'particle',
    preset: 'fire',
    attach: true,
    continuous: true
  },
  
  power_aura: {
    type: 'animated_sprite',
    spritesheet: 'effects_aura',
    animation: 'power',
    attach: true,
    loop: true
  },
  
  // Screen Effects
  screen_shake: {
    type: 'camera',
    action: 'shake'
  },
  
  screen_flash: {
    type: 'overlay',
    action: 'flash'
  }
};
```

---

## Next Steps for Implementation

### Phase 2A: Core Engine (Week 1-2)
1. Install PixiJS, Matter.js, Howler.js
2. Implement ECS base classes
3. Create GameWorld manager
4. Build basic systems (render, physics)

### Phase 2B: Spec Compiler (Week 2-3)
1. Build spec parser/validator
2. Implement action executor
3. Create rule compiler
4. Build entity factory

### Phase 2C: Components Library (Week 3-4)
1. React GameCanvas component
2. Question overlay system
3. HUD components
4. Screen transitions

### Phase 2D: AI Integration (Week 4-5)
1. Enhanced prompts for game generation
2. Asset suggestion system
3. Difficulty balancing AI
4. Procedural content generation

### Phase 2E: Asset Pipeline (Week 5-6)
1. Asset loading/caching
2. Placeholder generation
3. Free asset library integration
4. User upload system
