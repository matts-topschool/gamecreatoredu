# GameCraft Universal Engine - Infinite Possibilities

## Vision: Any Game, Any Learning

The goal isn't to support specific game types - it's to create a **universal creative canvas** 
where AI and teachers can build ANY interactive experience imaginable.

---

## Game Types We Should Support (And Beyond)

### Action & Adventure
- ⚔️ **Monster Battles** - Attack with correct answers
- 🏃 **Platformers** - Jump, collect, avoid obstacles
- 🚀 **Space Shooters** - Blast asteroids with knowledge
- 🗡️ **Dungeon Crawlers** - Explore, fight, level up
- 🦸 **Superhero Games** - Power up with learning

### Racing & Speed
- 🏎️ **Racing Games** - Answer faster = drive faster
- 🎿 **Endless Runners** - Keep running by answering
- ⏱️ **Time Attack** - Beat the clock challenges
- 🏊 **Swimming/Flying** - Navigate through obstacles

### Puzzle & Strategy
- 🧩 **Match-3/Candy Crush** - Educational matching
- 🔮 **Tower Defense** - Build defenses with answers
- ♟️ **Chess/Strategy** - Move pieces by solving
- 🏰 **City Builders** - Construct by learning
- 🧱 **Tetris-style** - Blocks fall, answer to clear

### Creative & Expression
- 🎨 **Art Games** - Draw, color, create
- 🎵 **Music/Rhythm** - Play instruments, compose
- 👗 **Fashion/Design** - Create outfits, rooms
- 🍳 **Cooking Games** - Mix ingredients (fractions!)
- 🏗️ **Building/Sandbox** - Minecraft-style creation

### Simulation & Life
- 🐕 **Virtual Pets** - Care for creatures
- 🏪 **Tycoon Games** - Run businesses
- 🌱 **Farming/Gardening** - Grow and harvest
- 🐠 **Aquarium/Zoo** - Manage habitats
- 🏥 **Hospital/Vet** - Help patients

### Social & Story
- 📖 **Choose Your Adventure** - Branching narratives
- 🕵️ **Mystery/Detective** - Solve cases with clues
- 🎭 **Role Playing** - Become characters
- 💬 **Social Simulation** - Dialogue choices matter
- 🌍 **World Exploration** - Discover and learn

### Sports & Physical
- 🏀 **Basketball** - Shoot hoops with math
- ⚽ **Soccer/Football** - Score with knowledge
- 🎯 **Target Practice** - Aim and answer
- 🏌️ **Golf** - Calculate angles
- 🎾 **Tennis/Pong** - React and respond

### Unique & Experimental
- 🎪 **Carnival Games** - Mini-game collections
- 🔬 **Lab Experiments** - Virtual science
- 🌌 **Space Exploration** - Discover planets
- ⏰ **Time Travel** - Visit historical periods
- 🧬 **Evolution Games** - Watch things grow/change
- 🎰 **Game Shows** - Wheel of Fortune, Jeopardy
- 🗺️ **Treasure Hunts** - Follow maps and clues
- 🦠 **Microscope Games** - Explore tiny worlds

---

## The Universal Game Canvas

Instead of predefined game types, we create a **flexible canvas system**:

```
┌─────────────────────────────────────────────────────────────┐
│                    UNIVERSAL GAME CANVAS                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                                                         ││
│  │    ANY visual element can exist ANYWHERE                ││
│  │    ANY interaction can trigger ANY outcome              ││
│  │    ANY state can affect ANY other state                 ││
│  │    Time, physics, sound - all configurable             ││
│  │                                                         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  LAYERS: Background → World → Entities → Effects → UI       │
│  SYSTEMS: Rendering → Physics → Audio → Input → AI          │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Primitives (Building Blocks)

Everything is built from these atomic elements:

### Visual Primitives
```yaml
Sprite:        Animated images, sprite sheets, GIFs
Shape:         Rectangle, circle, polygon, line, path
Text:          Any font, size, color, effects
Particle:      Fire, smoke, sparkles, rain, snow
Gradient:      Backgrounds, overlays, transitions
Mask:          Reveal/hide areas, spotlight effects
Filter:        Blur, glow, shadow, color shift
```

### Interactive Primitives
```yaml
Clickable:     Tap/click responses
Draggable:     Pick up and move
Droppable:     Receive dropped items
Hoverable:     Mouse-over effects
Scrollable:    Pan and zoom areas
Keyboard:      Key press responses
Voice:         Speech recognition input
Gesture:       Swipe, pinch, rotate
Timer:         Countdown, elapsed, interval
```

### Behavior Primitives
```yaml
Physics:       Gravity, bounce, friction, collision
Pathfinding:   Move along paths, avoid obstacles
Animation:     Tweens, keyframes, sequences
State Machine: Switch between modes/states
Spawner:       Create new entities over time
Destroyer:     Remove entities on condition
Transformer:   Change properties over time
Randomizer:    Add unpredictability
```

### Audio Primitives
```yaml
Sound Effect:  Short clips on events
Music:         Background loops, layers
Voice:         Text-to-speech, narration
Spatial:       3D positioned audio
```

---

## Universal GameSpec v2.0

```javascript
{
  "version": "2.0",
  "type": "universal",  // Not locked to a game type
  
  // === WORLD SETUP ===
  "world": {
    "canvas": {
      "width": 1920,
      "height": 1080,
      "coordinate_system": "cartesian",  // or "isometric", "polar"
      "origin": "bottom-left",           // or "center", "top-left"
      "camera": {
        "follow": "player",              // or fixed, or path
        "bounds": { "x": [0, 5000], "y": [0, 1000] },
        "zoom": { "min": 0.5, "max": 2.0 }
      }
    },
    
    "physics": {
      "enabled": true,
      "gravity": { "x": 0, "y": -9.8 },
      "friction": 0.1,
      "collision_layers": ["ground", "player", "enemies", "projectiles"]
    },
    
    "time": {
      "scale": 1.0,          // Slow-mo or speed up
      "max_delta": 0.1,      // Prevent physics explosions
      "paused_on_question": false  // Keep world moving?
    },
    
    "boundaries": {
      "behavior": "wrap",    // or "block", "destroy", "bounce"
      "padding": 100
    }
  },
  
  // === VISUAL LAYERS ===
  "layers": [
    {
      "id": "sky",
      "type": "parallax",
      "depth": 0,
      "scroll_factor": 0.2,
      "content": { "type": "gradient", "colors": ["#1a1a2e", "#16213e", "#0f3460"] }
    },
    {
      "id": "background",
      "type": "tiled",
      "depth": 1,
      "tile_asset": "bg_tiles",
      "scroll_factor": 0.5
    },
    {
      "id": "world",
      "type": "entity",
      "depth": 2,
      "scroll_factor": 1.0
    },
    {
      "id": "effects",
      "type": "particle",
      "depth": 3
    },
    {
      "id": "ui",
      "type": "fixed",
      "depth": 4
    }
  ],
  
  // === ENTITY DEFINITIONS (Reusable Templates) ===
  "entity_types": {
    "player": {
      "components": {
        "sprite": {
          "asset": "hero_spritesheet",
          "default_animation": "idle"
        },
        "physics_body": {
          "type": "dynamic",
          "shape": "capsule",
          "mass": 1.0
        },
        "movement": {
          "speed": 300,
          "jump_force": 500,
          "double_jump": true
        },
        "health": {
          "max": 100,
          "regeneration": 0
        },
        "combat": {
          "base_damage": 10,
          "attack_speed": 1.0,
          "combo_enabled": true
        }
      },
      "animations": {
        "idle": { "frames": "0-3", "fps": 4, "loop": true },
        "run": { "frames": "4-11", "fps": 12, "loop": true },
        "jump": { "frames": "12-14", "fps": 8, "loop": false },
        "attack": { "frames": "15-20", "fps": 15, "loop": false },
        "hurt": { "frames": "21-23", "fps": 10, "loop": false },
        "victory": { "frames": "24-27", "fps": 6, "loop": true }
      }
    },
    
    "enemy_base": {
      "components": {
        "sprite": { "asset": null },  // Set per instance
        "physics_body": { "type": "kinematic" },
        "ai": {
          "behavior": "patrol",       // or "chase", "flee", "wander"
          "detection_range": 300,
          "attack_range": 50
        },
        "health": { "max": 50 },
        "loot": {
          "drop_chance": 0.5,
          "items": ["coin", "powerup"]
        }
      }
    },
    
    "collectible": {
      "components": {
        "sprite": { "asset": null },
        "physics_body": { "type": "trigger" },  // No collision, just detection
        "pickup": {
          "effect": "instant",        // or "hover_to_player"
          "sound": "pickup_coin"
        },
        "float_animation": {
          "enabled": true,
          "amplitude": 5,
          "frequency": 2
        }
      }
    },
    
    "projectile": {
      "components": {
        "sprite": { "asset": null },
        "physics_body": { "type": "dynamic", "gravity_scale": 0 },
        "movement": { "speed": 500 },
        "lifetime": { "seconds": 3 },
        "on_hit": {
          "damage": 10,
          "effects": ["explosion_small"],
          "destroy": true
        }
      }
    },
    
    "platform": {
      "components": {
        "sprite": { "asset": "platform_tiles" },
        "physics_body": { "type": "static" },
        "platform_type": "solid"      // or "one_way", "moving", "falling"
      }
    },
    
    "question_trigger": {
      "components": {
        "collider": { "type": "trigger", "shape": "box" },
        "visual": { "type": "glow", "color": "#ffcc00" },
        "question": {
          "pool": "content.questions",
          "difficulty_match": "player_progress",
          "on_correct": [],
          "on_incorrect": []
        }
      }
    }
  },
  
  // === SPAWNED ENTITIES (Actual game objects) ===
  "entities": [
    {
      "id": "hero",
      "type": "player",
      "position": { "x": 100, "y": 200 },
      "spawn_at_start": true
    },
    {
      "id": "monster_1",
      "type": "enemy_base",
      "overrides": {
        "sprite.asset": "goblin_sprite",
        "health.max": 30,
        "ai.behavior": "patrol"
      },
      "position": { "x": 500, "y": 200 }
    }
  ],
  
  // === SPAWNERS (Dynamic entity creation) ===
  "spawners": [
    {
      "id": "coin_spawner",
      "entity_type": "collectible",
      "overrides": { "sprite.asset": "coin_sprite" },
      "spawn_rate": 2.0,              // Per second
      "max_active": 10,
      "spawn_area": { "x": [0, 1000], "y": [100, 300] },
      "conditions": [{ "type": "score_below", "value": 100 }]
    },
    {
      "id": "enemy_wave_spawner",
      "entity_type": "enemy_base",
      "spawn_on_event": "wave_start",
      "wave_config": {
        "count": [5, 8, 12, 20],       // Enemies per wave
        "delay_between": 0.5,
        "types": ["goblin", "orc", "troll"]
      }
    }
  ],
  
  // === UNIVERSAL RULES ENGINE ===
  "rules": [
    // Example: Correct answer powers up attack
    {
      "id": "answer_power_attack",
      "trigger": { "type": "event", "name": "answer_correct" },
      "actions": [
        { "type": "modify", "target": "hero.combat.base_damage", "operation": "multiply", "value": 1.5, "duration": 5000 },
        { "type": "spawn_effect", "effect": "power_aura", "attach_to": "hero" },
        { "type": "play_sound", "sound": "powerup" },
        { "type": "screen_flash", "color": "#ffcc00", "duration": 100 }
      ]
    },
    
    // Example: Speed bonus based on answer time
    {
      "id": "speed_bonus",
      "trigger": { "type": "event", "name": "answer_submitted" },
      "conditions": [{ "type": "variable", "name": "answer_time_ms", "operator": "<", "value": 2000 }],
      "actions": [
        { "type": "calculate", "output": "speed_multiplier", "formula": "1 + (2000 - answer_time_ms) / 2000" },
        { "type": "spawn_text", "text": "FAST! x{speed_multiplier}", "style": "floating", "position": "hero" }
      ]
    },
    
    // Example: Combo system
    {
      "id": "combo_increment",
      "trigger": { "type": "event", "name": "answer_correct" },
      "actions": [
        { "type": "modify", "target": "state.combo", "operation": "add", "value": 1 },
        { "type": "conditional", "if": { "variable": "state.combo", "operator": ">=", "value": 5 },
          "then": [
            { "type": "spawn_effect", "effect": "fire_aura", "attach_to": "hero" },
            { "type": "set", "target": "hero.sprite.filter", "value": "flame" }
          ]
        }
      ]
    },
    
    // Example: Enemy killed triggers celebration
    {
      "id": "enemy_death",
      "trigger": { "type": "entity_event", "entity_type": "enemy_base", "event": "health_zero" },
      "actions": [
        { "type": "spawn_effect", "effect": "explosion", "position": "trigger_entity.position" },
        { "type": "spawn_loot", "source": "trigger_entity.loot" },
        { "type": "modify", "target": "state.enemies_defeated", "operation": "add", "value": 1 },
        { "type": "screen_shake", "intensity": 0.2, "duration": 200 }
      ]
    },
    
    // Example: Level complete
    {
      "id": "level_complete",
      "trigger": { "type": "condition_met" },
      "conditions": [{ "type": "variable", "name": "state.enemies_defeated", "operator": ">=", "value": "level.enemy_count" }],
      "actions": [
        { "type": "pause_world" },
        { "type": "play_sound", "sound": "victory_fanfare" },
        { "type": "show_ui", "ui": "victory_screen" },
        { "type": "save_score", "leaderboard": "level_{level.id}" }
      ]
    }
  ],
  
  // === PROCEDURAL GENERATION ===
  "procedural": {
    "level_generation": {
      "enabled": true,
      "type": "platformer",
      "seed": "random",            // or specific seed for reproducibility
      "parameters": {
        "length": { "min": 1000, "max": 3000 },
        "difficulty_curve": "gradual",
        "platform_density": 0.7,
        "enemy_density": 0.3,
        "collectible_density": 0.5
      }
    },
    
    "question_scaling": {
      "enabled": true,
      "adapt_to_performance": true,
      "difficulty_range": [1, 5],
      "increase_on_streak": 3,
      "decrease_on_miss": 2
    }
  },
  
  // === UI SYSTEM ===
  "ui": {
    "hud": {
      "elements": [
        {
          "id": "health_bar",
          "type": "progress_bar",
          "bind": "hero.health.current / hero.health.max",
          "position": { "anchor": "top-left", "offset": { "x": 20, "y": 20 } },
          "style": { "width": 200, "height": 20, "colors": ["#ff0000", "#00ff00"] }
        },
        {
          "id": "score",
          "type": "text",
          "bind": "state.score",
          "format": "Score: {value}",
          "position": { "anchor": "top-right", "offset": { "x": -20, "y": 20 } },
          "style": { "font": "game_font", "size": 24, "color": "#ffffff" }
        },
        {
          "id": "combo",
          "type": "animated_text",
          "bind": "state.combo",
          "format": "x{value}",
          "visible_when": { "variable": "state.combo", "operator": ">", "value": 0 },
          "position": { "anchor": "center-right", "offset": { "x": -50, "y": 0 } },
          "animation": "pulse_on_change"
        }
      ]
    },
    
    "question_overlay": {
      "style": "minimal",           // or "full_screen", "bottom_panel", "floating"
      "pause_game": false,
      "dim_background": 0.3,
      "position": "bottom-center",
      "animation": "slide_up"
    },
    
    "screens": {
      "title": { "template": "title_screen", "customization": {} },
      "pause": { "template": "pause_menu" },
      "victory": { "template": "victory_screen" },
      "game_over": { "template": "game_over_screen" },
      "leaderboard": { "template": "leaderboard" }
    }
  },
  
  // === EDUCATIONAL CONTENT ===
  "content": {
    "questions": [],                // Populated by AI or teacher
    "learning_objectives": [],
    "standards": [],
    
    "integration_points": [
      {
        "trigger": "question_zone",
        "frequency": "every_30_seconds",
        "context": "gameplay",      // Questions relate to what's happening
        "reward": "powerup"
      },
      {
        "trigger": "boss_battle",
        "frequency": "rapid_fire",
        "context": "combat",
        "reward": "damage"
      }
    ]
  },
  
  // === AUDIO ===
  "audio": {
    "music": {
      "layers": [
        { "id": "base", "asset": "music_base", "volume": 0.5 },
        { "id": "action", "asset": "music_action", "volume": 0, "fade_in_on": "combat_start" },
        { "id": "boss", "asset": "music_boss", "volume": 0, "fade_in_on": "boss_encounter" }
      ]
    },
    "sound_effects": {
      "jump": "sfx_jump",
      "attack": "sfx_sword",
      "coin": "sfx_coin",
      "correct": "sfx_correct",
      "incorrect": "sfx_incorrect",
      "victory": "sfx_victory"
    },
    "spatial_audio": true
  }
}
```

---

## Visual Effect Library

Pre-built effects that any game can use:

```yaml
Particles:
  - fire, smoke, explosion, sparkle, rain, snow, leaves
  - magic_burst, heal_aura, damage_numbers, coin_burst
  - confetti, fireworks, bubbles, dust_cloud

Screen Effects:
  - shake, flash, zoom_pulse, vignette, blur
  - chromatic_aberration, scanlines, crt_effect

Transitions:
  - fade, wipe, dissolve, pixelate, spiral
  - shatter, burn, freeze, rainbow_sweep

Text Effects:
  - floating_damage, popup_score, typewriter
  - rainbow_text, shake_text, grow_shrink
```

---

## AI Prompt Engineering for Universal Games

The AI compiler should understand creative requests:

```
INPUT: "Make a cooking game where kids learn fractions by 
        mixing ingredients. Like 1/2 cup flour + 1/4 cup sugar"

AI UNDERSTANDS:
- Game type: Simulation/Cooking
- Mechanic: Drag-and-drop ingredients
- Math concept: Fraction addition
- Visual style: Kitchen, colorful, kid-friendly
- Feedback: Visual (bowl filling up), Audio (sizzle, ding)

GENERATES:
- Kitchen background with stations
- Ingredient sprites with fraction labels  
- Mixing bowl with fill animation
- Recipe cards as question format
- Timer for baking phase
- Star rating based on accuracy
```

```
INPUT: "Space game where answering vocabulary makes your 
        rocket go faster and you're racing to planets"

AI UNDERSTANDS:
- Game type: Racing/Space
- Mechanic: Speed based on correct answers
- Subject: Vocabulary/Language
- Visual style: Space, planets, stars
- Multiplayer potential: Race against others

GENERATES:
- Scrolling space background with parallax
- Rocket sprite with thrust animation
- Planet waypoints as checkpoints
- Speed boost effects on correct
- Slow-down on incorrect
- Leaderboard integration
```

---

## Rendering Engine Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      GAME RENDERER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   CANVAS     │  │   PHYSICS    │  │    AUDIO     │          │
│  │   (Pixi.js)  │  │  (Matter.js) │  │   (Howler)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └────────────┬────┴────────────────┘                   │
│                      │                                          │
│              ┌───────▼───────┐                                  │
│              │  GAME LOOP    │                                  │
│              │  (60 FPS)     │                                  │
│              └───────┬───────┘                                  │
│                      │                                          │
│    ┌─────────────────┼─────────────────┐                       │
│    │                 │                 │                        │
│    ▼                 ▼                 ▼                        │
│ ┌──────┐        ┌──────┐        ┌──────────┐                   │
│ │UPDATE│        │RENDER│        │  INPUT   │                   │
│ │ Tick │        │ Draw │        │ Handler  │                   │
│ └──────┘        └──────┘        └──────────┘                   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                     REACT WRAPPER                                │
│  <GameCanvas spec={gameSpec} onEvent={handleEvent} />           │
└─────────────────────────────────────────────────────────────────┘
```

---

## What This Enables

With this universal system, teachers (and AI) can create:

1. **A rhythm game** where music notes are math problems
2. **A gardening sim** where plants grow based on science answers
3. **A detective game** where clues are vocabulary words
4. **A fashion game** where outfits need fraction measurements
5. **A space exploration** where planet facts unlock travel
6. **A cooking show** where recipes teach chemistry
7. **A sports game** where stats are calculated live
8. **A pet simulator** where care routines teach responsibility
9. **A city builder** where economics concepts unlock buildings
10. **ANYTHING ELSE** they can imagine!

The key is **AI understands intent** and **engine renders anything**.
