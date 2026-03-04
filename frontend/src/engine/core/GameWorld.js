/**
 * Universal Game Engine - Main World Manager
 * Orchestrates all game systems, entities, and rendering.
 */

import * as PIXI from 'pixi.js';

/**
 * GameWorld - The main game engine class
 * Manages entities, systems, events, and rendering
 */
export class GameWorld {
  constructor(container, spec, options = {}) {
    this.container = container;
    this.spec = spec;
    this.options = options;
    
    // Core state
    this.entities = new Map();
    this.systems = [];
    this.eventQueue = [];
    this.eventHandlers = new Map();
    this.state = new Map();
    
    // Timing
    this.lastTime = 0;
    this.gameTime = 0;
    this.deltaTime = 0;
    this.isPaused = false;
    this.timeScale = 1.0;
    
    // Analytics
    this.telemetryQueue = [];
    this.playerStats = {
      score: 0,
      combo: 0,
      maxCombo: 0,
      questionsAnswered: 0,
      questionsCorrect: 0,
      totalTimeMs: 0,
      damageDealt: 0,
      enemiesDefeated: 0
    };
    
    // Initialize subsystems
    this.initRenderer();
    this.initState();
    this.registerCoreSystems();
    
    // Callbacks
    this.onEvent = options.onEvent || (() => {});
    this.onStateChange = options.onStateChange || (() => {});
    this.onQuestionTrigger = options.onQuestionTrigger || (() => {});
    
    // Start game loop
    this.running = false;
    this.frameId = null;
  }
  
  // ============== INITIALIZATION ==============
  
  initRenderer() {
    const { width = 1280, height = 720 } = this.spec?.world?.canvas || {};
    
    // Create PIXI Application
    this.app = new PIXI.Application();
    
    // Async init - for now we'll do sync setup
    this.app.init({
      width,
      height,
      backgroundColor: this.spec?.world?.backgroundColor || 0x1a1a2e,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    }).then(() => {
      this.container.appendChild(this.app.canvas);
      this.setupLayers();
    });
    
    // Camera
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1,
      rotation: 0,
      target: null,
      bounds: null,
      smoothing: 0.1
    };
    
    // Main stage container that moves with camera
    this.worldContainer = new PIXI.Container();
    this.uiContainer = new PIXI.Container(); // Fixed UI layer
  }
  
  setupLayers() {
    const layers = this.spec?.layers || [
      { id: 'background', type: 'background', depth: 0 },
      { id: 'world', type: 'entity', depth: 1 },
      { id: 'effects', type: 'particle', depth: 2 },
      { id: 'ui', type: 'ui', depth: 3 }
    ];
    
    this.layers = new Map();
    
    // Sort by depth
    layers.sort((a, b) => a.depth - b.depth);
    
    for (const layerDef of layers) {
      const container = new PIXI.Container();
      container.sortableChildren = true;
      
      if (layerDef.type === 'ui') {
        this.uiContainer.addChild(container);
      } else {
        this.worldContainer.addChild(container);
      }
      
      this.layers.set(layerDef.id, {
        container,
        config: layerDef
      });
    }
    
    this.app.stage.addChild(this.worldContainer);
    this.app.stage.addChild(this.uiContainer);
  }
  
  initState() {
    // Initialize state variables from spec
    const variables = this.spec?.state?.variables || [];
    
    for (const varDef of variables) {
      this.state.set(varDef.id, {
        ...varDef,
        value: varDef.initial_value ?? varDef.initialValue ?? 0
      });
    }
    
    // Default game variables
    if (!this.state.has('score')) {
      this.state.set('score', { id: 'score', name: 'Score', value: 0, type: 'number' });
    }
    if (!this.state.has('combo')) {
      this.state.set('combo', { id: 'combo', name: 'Combo', value: 0, type: 'number' });
    }
  }
  
  registerCoreSystems() {
    // Systems run in order of priority (lower first)
    this.systems = [
      { name: 'input', priority: 5, update: this.updateInput.bind(this) },
      { name: 'ai', priority: 10, update: this.updateAI.bind(this) },
      { name: 'movement', priority: 20, update: this.updateMovement.bind(this) },
      { name: 'physics', priority: 30, update: this.updatePhysics.bind(this) },
      { name: 'combat', priority: 40, update: this.updateCombat.bind(this) },
      { name: 'health', priority: 50, update: this.updateHealth.bind(this) },
      { name: 'animation', priority: 60, update: this.updateAnimation.bind(this) },
      { name: 'particle', priority: 70, update: this.updateParticles.bind(this) },
      { name: 'camera', priority: 80, update: this.updateCamera.bind(this) },
      { name: 'render', priority: 100, update: this.updateRender.bind(this) },
    ];
    
    this.systems.sort((a, b) => a.priority - b.priority);
  }
  
  // ============== ENTITY MANAGEMENT ==============
  
  createEntity(type, config = {}) {
    const entityDef = this.spec?.entity_types?.[type] || {};
    const id = config.id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const entity = {
      id,
      type,
      tags: new Set(config.tags || []),
      components: new Map(),
      active: true,
      layer: config.layer || 'world',
      children: [],
      parent: null,
      sprite: null, // PIXI sprite reference
    };
    
    // Merge default components with overrides
    const components = { ...entityDef.components, ...config.components };
    
    // Create transform component
    entity.components.set('transform', {
      type: 'transform',
      enabled: true,
      x: config.position?.x ?? config.x ?? 0,
      y: config.position?.y ?? config.y ?? 0,
      rotation: config.rotation ?? 0,
      scaleX: config.scaleX ?? 1,
      scaleY: config.scaleY ?? 1,
      anchorX: 0.5,
      anchorY: 0.5
    });
    
    // Add other components
    for (const [compType, compData] of Object.entries(components)) {
      if (compType !== 'transform') {
        entity.components.set(compType, {
          type: compType,
          enabled: true,
          ...compData
        });
      }
    }
    
    // Create visual representation
    if (components.sprite) {
      this.createEntitySprite(entity, components.sprite);
    }
    
    this.entities.set(id, entity);
    
    // Fire entity created event
    this.emit({ type: 'entity_created', data: { entityId: id, entityType: type } });
    
    return entity;
  }
  
  createEntitySprite(entity, spriteConfig) {
    const transform = entity.components.get('transform');
    
    // Create a simple colored rectangle as placeholder
    // In full implementation, this would load textures
    const graphics = new PIXI.Graphics();
    graphics.rect(0, 0, spriteConfig.width || 50, spriteConfig.height || 50);
    graphics.fill(spriteConfig.color || 0x7c3aed);
    
    const sprite = new PIXI.Sprite(this.app.renderer.generateTexture(graphics));
    sprite.anchor.set(transform.anchorX, transform.anchorY);
    sprite.x = transform.x;
    sprite.y = transform.y;
    sprite.rotation = transform.rotation;
    sprite.scale.set(transform.scaleX, transform.scaleY);
    
    // Add to appropriate layer
    const layer = this.layers.get(entity.layer);
    if (layer) {
      layer.container.addChild(sprite);
    }
    
    entity.sprite = sprite;
  }
  
  destroyEntity(id) {
    const entity = this.entities.get(id);
    if (!entity) return;
    
    // Remove sprite from stage
    if (entity.sprite) {
      entity.sprite.destroy();
    }
    
    // Remove children
    for (const childId of entity.children) {
      this.destroyEntity(childId);
    }
    
    this.entities.delete(id);
    
    this.emit({ type: 'entity_destroyed', data: { entityId: id } });
  }
  
  getEntity(id) {
    return this.entities.get(id);
  }
  
  queryEntities(filter = {}) {
    const results = [];
    
    for (const entity of this.entities.values()) {
      if (!entity.active) continue;
      
      // Filter by type
      if (filter.type && entity.type !== filter.type) continue;
      
      // Filter by tags
      if (filter.tags) {
        const hasTags = filter.tags.every(tag => entity.tags.has(tag));
        if (!hasTags) continue;
      }
      
      // Filter by component
      if (filter.hasComponent && !entity.components.has(filter.hasComponent)) continue;
      
      results.push(entity);
    }
    
    return results;
  }
  
  // ============== EVENT SYSTEM ==============
  
  emit(event) {
    const fullEvent = {
      ...event,
      timestamp: this.gameTime
    };
    
    this.eventQueue.push(fullEvent);
    
    // Also call external handler
    this.onEvent(fullEvent);
  }
  
  on(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType).push(handler);
  }
  
  off(eventType, handler) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
  
  processEvents() {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      
      // Process rules
      this.processRulesForEvent(event);
      
      // Call registered handlers
      const handlers = this.eventHandlers.get(event.type) || [];
      for (const handler of handlers) {
        handler(event);
      }
      
      // Universal handlers
      const universalHandlers = this.eventHandlers.get('*') || [];
      for (const handler of universalHandlers) {
        handler(event);
      }
    }
  }
  
  processRulesForEvent(event) {
    const rules = this.spec?.rules || [];
    
    for (const rule of rules) {
      if (!rule.enabled) continue;
      
      // Check if trigger matches
      if (rule.trigger?.type !== event.type && rule.trigger?.name !== event.type) continue;
      
      // Check conditions
      const conditionsMet = this.checkConditions(rule.conditions, event);
      if (!conditionsMet) continue;
      
      // Execute actions
      for (const action of rule.actions) {
        this.executeAction(action, event);
      }
    }
  }
  
  checkConditions(conditions, event) {
    if (!conditions || conditions.length === 0) return true;
    
    for (const condition of conditions) {
      let result = false;
      
      switch (condition.type) {
        case 'is_correct':
          result = event.data?.isCorrect === condition.value;
          break;
          
        case 'compare':
          const variable = this.state.get(condition.variable);
          const value = variable?.value ?? 0;
          result = this.compareValues(value, condition.operator, condition.value);
          break;
          
        case 'entity_has_component':
          const entity = this.getEntity(condition.entityId || event.data?.entityId);
          result = entity?.components.has(condition.component);
          break;
          
        default:
          result = true;
      }
      
      if (!result) return false;
    }
    
    return true;
  }
  
  compareValues(a, operator, b) {
    switch (operator) {
      case '==': case '===': return a === b;
      case '!=': case '!==': return a !== b;
      case '>': return a > b;
      case '>=': return a >= b;
      case '<': return a < b;
      case '<=': return a <= b;
      default: return false;
    }
  }
  
  executeAction(action, event) {
    switch (action.type) {
      case 'set':
        this.setStateValue(action.variable, action.value);
        break;
        
      case 'increment':
        const currentVal = this.getStateValue(action.variable);
        this.setStateValue(action.variable, currentVal + (action.amount ?? 1));
        break;
        
      case 'decrement':
        const currVal = this.getStateValue(action.variable);
        this.setStateValue(action.variable, currVal - (action.amount ?? 1));
        break;
        
      case 'multiply':
        const val = this.getStateValue(action.variable);
        this.setStateValue(action.variable, val * action.value);
        break;
        
      case 'spawn_entity':
        this.createEntity(action.entityType, action.config);
        break;
        
      case 'destroy_entity':
        this.destroyEntity(action.target || event.data?.entityId);
        break;
        
      case 'play_animation':
        this.playAnimation(action.entity || event.data?.entityId, action.animation);
        break;
        
      case 'play_sound':
        this.playSound(action.sound);
        break;
        
      case 'spawn_effect':
        this.spawnEffect(action.effect, action.position || event.data?.position);
        break;
        
      case 'screen_shake':
        this.screenShake(action.intensity, action.duration);
        break;
        
      case 'show_toast':
        this.emit({ type: 'show_toast', data: { message: action.message } });
        break;
        
      case 'deal_damage':
        this.dealDamage(action.target, action.amount);
        break;
        
      case 'navigate':
        this.emit({ type: 'scene_change', data: { scene: action.target } });
        break;
        
      case 'trigger_question':
        this.onQuestionTrigger(action.questionPool || 'default');
        break;
        
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }
  
  // ============== STATE MANAGEMENT ==============
  
  getStateValue(key) {
    const variable = this.state.get(key);
    return variable?.value ?? 0;
  }
  
  setStateValue(key, value) {
    let variable = this.state.get(key);
    
    if (!variable) {
      variable = { id: key, name: key, value: 0, type: 'number' };
      this.state.set(key, variable);
    }
    
    const oldValue = variable.value;
    variable.value = value;
    
    // Update player stats
    if (key === 'score') this.playerStats.score = value;
    if (key === 'combo') {
      this.playerStats.combo = value;
      if (value > this.playerStats.maxCombo) {
        this.playerStats.maxCombo = value;
      }
    }
    
    // Notify state change
    this.onStateChange({ key, oldValue, newValue: value, state: this.getFullState() });
    
    // Emit event
    this.emit({ 
      type: 'state_changed', 
      data: { key, oldValue, newValue: value } 
    });
  }
  
  getFullState() {
    const state = {};
    for (const [key, variable] of this.state) {
      state[key] = variable.value;
    }
    return state;
  }
  
  // ============== GAME SYSTEMS ==============
  
  updateInput(dt) {
    // Input handling would go here
    // For now, handled by React components
  }
  
  updateAI(dt) {
    const aiEntities = this.queryEntities({ hasComponent: 'ai' });
    
    for (const entity of aiEntities) {
      const ai = entity.components.get('ai');
      const transform = entity.components.get('transform');
      
      if (!ai.enabled) continue;
      
      // Simple AI behaviors
      switch (ai.behavior) {
        case 'patrol':
          this.updatePatrolBehavior(entity, ai, transform, dt);
          break;
        case 'chase':
          this.updateChaseBehavior(entity, ai, transform, dt);
          break;
      }
    }
  }
  
  updatePatrolBehavior(entity, ai, transform, dt) {
    if (!ai.patrolPath || ai.patrolPath.length === 0) return;
    
    const target = ai.patrolPath[ai.patrolIndex];
    const dx = target.x - transform.x;
    const dy = target.y - transform.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 10) {
      ai.patrolIndex = (ai.patrolIndex + 1) % ai.patrolPath.length;
    } else {
      const speed = 100 * dt;
      transform.x += (dx / dist) * speed;
      transform.y += (dy / dist) * speed;
    }
  }
  
  updateChaseBehavior(entity, ai, transform, dt) {
    if (!ai.target) return;
    
    const target = this.getEntity(ai.target);
    if (!target) return;
    
    const targetTransform = target.components.get('transform');
    const dx = targetTransform.x - transform.x;
    const dy = targetTransform.y - transform.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < ai.attackRange) {
      this.emit({ type: 'ai_attack', data: { attacker: entity.id, target: ai.target } });
    } else if (dist < ai.detectionRange) {
      const speed = 150 * dt;
      transform.x += (dx / dist) * speed;
      transform.y += (dy / dist) * speed;
    }
  }
  
  updateMovement(dt) {
    // Platform movement, velocity application
    const movingEntities = this.queryEntities({ hasComponent: 'movement' });
    
    for (const entity of movingEntities) {
      const movement = entity.components.get('movement');
      const transform = entity.components.get('transform');
      const physics = entity.components.get('physics_body');
      
      if (physics && physics.velocity) {
        transform.x += physics.velocity.x * dt;
        transform.y += physics.velocity.y * dt;
      }
    }
  }
  
  updatePhysics(dt) {
    // Simplified physics - in full implementation would use Matter.js
    const physicsEntities = this.queryEntities({ hasComponent: 'physics_body' });
    
    for (const entity of physicsEntities) {
      const physics = entity.components.get('physics_body');
      const transform = entity.components.get('transform');
      
      if (physics.bodyType !== 'static') {
        // Apply gravity
        const gravity = this.spec?.world?.physics?.gravity || { x: 0, y: 0 };
        physics.velocity.y += gravity.y * dt * 50;
        
        // Apply velocity
        transform.x += physics.velocity.x * dt;
        transform.y += physics.velocity.y * dt;
        
        // Simple ground collision
        if (transform.y > 600) {
          transform.y = 600;
          physics.velocity.y = 0;
        }
      }
    }
  }
  
  updateCombat(dt) {
    // Combat system updates
  }
  
  updateHealth(dt) {
    const healthEntities = this.queryEntities({ hasComponent: 'health' });
    
    for (const entity of healthEntities) {
      const health = entity.components.get('health');
      
      // Apply regeneration
      if (health.regeneration > 0 && health.current < health.max) {
        health.current = Math.min(health.max, health.current + health.regeneration * dt);
      }
      
      // Check for death
      if (health.current <= 0 && entity.active) {
        this.emit({ 
          type: 'entity_health_zero', 
          data: { entityId: entity.id, entityType: entity.type } 
        });
        
        if (entity.tags.has('enemy')) {
          this.playerStats.enemiesDefeated++;
          this.emit({ type: 'enemy_defeated', data: { entityId: entity.id } });
        }
      }
      
      // Update invulnerability timer
      if (health.invulnerable && health.invulnerabilityTimer > 0) {
        health.invulnerabilityTimer -= dt * 1000;
        if (health.invulnerabilityTimer <= 0) {
          health.invulnerable = false;
        }
      }
    }
  }
  
  updateAnimation(dt) {
    const animatedEntities = this.queryEntities({ hasComponent: 'sprite' });
    
    for (const entity of animatedEntities) {
      const sprite = entity.components.get('sprite');
      
      if (!sprite.animations || !sprite.currentAnimation) continue;
      
      const anim = sprite.animations.get?.(sprite.currentAnimation) || 
                   sprite.animations[sprite.currentAnimation];
      
      if (!anim) continue;
      
      sprite.frameTime += dt;
      
      const frameDuration = 1 / (anim.fps || 10);
      
      if (sprite.frameTime >= frameDuration) {
        sprite.frameTime = 0;
        sprite.frameIndex++;
        
        if (sprite.frameIndex >= anim.frames.length) {
          if (anim.loop) {
            sprite.frameIndex = 0;
          } else {
            sprite.frameIndex = anim.frames.length - 1;
            if (anim.onComplete) {
              this.emit({ type: anim.onComplete, data: { entityId: entity.id } });
            }
          }
        }
      }
    }
  }
  
  updateParticles(dt) {
    // Particle system update
  }
  
  updateCamera(dt) {
    // Camera following and bounds
    if (this.camera.target) {
      const target = this.getEntity(this.camera.target);
      if (target) {
        const transform = target.components.get('transform');
        const targetX = -transform.x + this.app.screen.width / 2;
        const targetY = -transform.y + this.app.screen.height / 2;
        
        this.camera.x += (targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (targetY - this.camera.y) * this.camera.smoothing;
      }
    }
  }
  
  updateRender(dt) {
    // Sync entity transforms to sprites
    for (const entity of this.entities.values()) {
      if (!entity.sprite || !entity.active) continue;
      
      const transform = entity.components.get('transform');
      if (!transform) continue;
      
      entity.sprite.x = transform.x;
      entity.sprite.y = transform.y;
      entity.sprite.rotation = transform.rotation;
      entity.sprite.scale.set(transform.scaleX, transform.scaleY);
    }
    
    // Apply camera transform
    this.worldContainer.x = this.camera.x;
    this.worldContainer.y = this.camera.y;
    this.worldContainer.scale.set(this.camera.zoom);
    this.worldContainer.rotation = this.camera.rotation;
  }
  
  // ============== GAME LOOP ==============
  
  start() {
    if (this.running) return;
    
    this.running = true;
    this.lastTime = performance.now();
    
    this.emit({ type: 'game_start', data: {} });
    
    this.tick();
  }
  
  tick = () => {
    if (!this.running) return;
    
    const now = performance.now();
    this.deltaTime = Math.min((now - this.lastTime) / 1000, 0.1); // Cap at 100ms
    this.lastTime = now;
    
    if (!this.isPaused) {
      this.gameTime += this.deltaTime * this.timeScale;
      this.playerStats.totalTimeMs = Math.floor(this.gameTime * 1000);
      
      // Process events
      this.processEvents();
      
      // Run systems
      for (const system of this.systems) {
        system.update(this.deltaTime * this.timeScale);
      }
    }
    
    this.frameId = requestAnimationFrame(this.tick);
  }
  
  pause() {
    this.isPaused = true;
    this.emit({ type: 'game_pause', data: {} });
  }
  
  resume() {
    this.isPaused = false;
    this.emit({ type: 'game_resume', data: {} });
  }
  
  stop() {
    this.running = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    this.emit({ type: 'game_stop', data: {} });
  }
  
  destroy() {
    this.stop();
    
    // Clean up entities
    for (const [id] of this.entities) {
      this.destroyEntity(id);
    }
    
    // Destroy PIXI app
    if (this.app) {
      this.app.destroy(true);
    }
  }
  
  // ============== HELPER METHODS ==============
  
  playAnimation(entityId, animationName) {
    const entity = this.getEntity(entityId);
    if (!entity) return;
    
    const sprite = entity.components.get('sprite');
    if (sprite) {
      sprite.currentAnimation = animationName;
      sprite.frameIndex = 0;
      sprite.frameTime = 0;
    }
  }
  
  playSound(soundId) {
    // Audio playback - would use Howler.js
    this.emit({ type: 'play_sound', data: { soundId } });
  }
  
  spawnEffect(effectId, position) {
    this.emit({ type: 'spawn_effect', data: { effectId, position } });
  }
  
  screenShake(intensity = 0.5, duration = 200) {
    this.emit({ type: 'screen_shake', data: { intensity, duration } });
  }
  
  dealDamage(targetId, amount) {
    const target = this.getEntity(targetId);
    if (!target) return;
    
    const health = target.components.get('health');
    if (!health || health.invulnerable) return;
    
    health.current = Math.max(0, health.current - amount);
    this.playerStats.damageDealt += amount;
    
    this.emit({ 
      type: 'damage_dealt', 
      data: { target: targetId, amount, newHealth: health.current } 
    });
  }
  
  // ============== QUESTION/ANSWER HANDLING ==============
  
  handleAnswer(result) {
    this.playerStats.questionsAnswered++;
    
    if (result.isCorrect) {
      this.playerStats.questionsCorrect++;
      
      // Update combo
      const newCombo = this.getStateValue('combo') + 1;
      this.setStateValue('combo', newCombo);
      
      // Add score with combo bonus
      const basePoints = result.pointsEarned || 10;
      const comboBonus = Math.floor(basePoints * (newCombo * 0.1));
      const speedBonus = result.speedBonus || 0;
      const totalPoints = basePoints + comboBonus + speedBonus;
      
      this.setStateValue('score', this.getStateValue('score') + totalPoints);
      
      this.emit({ 
        type: 'answer_correct', 
        data: { ...result, totalPoints, combo: newCombo }
      });
    } else {
      // Reset combo
      this.setStateValue('combo', 0);
      
      this.emit({ 
        type: 'answer_incorrect', 
        data: { ...result, combo: 0 }
      });
    }
  }
  
  // ============== TELEMETRY ==============
  
  recordTelemetry(type, data) {
    const event = {
      type,
      playerId: this.options.playerId,
      playerName: this.options.playerName,
      sessionId: this.options.sessionId,
      gameTime: this.gameTime,
      data,
      timestamp: Date.now()
    };
    
    this.telemetryQueue.push(event);
    
    // Flush periodically
    if (this.telemetryQueue.length >= 10) {
      this.flushTelemetry();
    }
  }
  
  flushTelemetry() {
    if (this.telemetryQueue.length === 0) return;
    
    const events = [...this.telemetryQueue];
    this.telemetryQueue = [];
    
    // Send to server
    this.emit({ type: 'telemetry_flush', data: { events } });
  }
  
  getPlayerStats() {
    return { ...this.playerStats };
  }
}

export default GameWorld;
