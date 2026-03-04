# GameSpec Extension: Action/Battle Games

## Overview

This extension adds support for real-time action games like monster battles, 
while maintaining backward compatibility with quiz-style games.

---

## New Schema Elements

### 1. Entities (New Top-Level Section)

```json
{
  "entities": {
    "player": {
      "id": "player_hero",
      "type": "player",
      "name": "Hero",
      "sprite": "asset_hero_sprite",
      "stats": {
        "base_damage": 10,
        "attack_speed": 1.0,
        "combo_multiplier": 1.5
      },
      "animations": {
        "idle": { "frames": [0, 1, 2, 3], "fps": 4, "loop": true },
        "attack": { "frames": [4, 5, 6, 7, 8], "fps": 12, "loop": false },
        "victory": { "frames": [9, 10, 11], "fps": 6, "loop": true }
      }
    },
    "enemies": [
      {
        "id": "monster_fraction_fiend",
        "type": "enemy",
        "name": "Fraction Fiend",
        "sprite": "asset_monster_sprite",
        "stats": {
          "max_health": 100,
          "current_health": 100,
          "defense": 0
        },
        "animations": {
          "idle": { "frames": [0, 1, 2], "fps": 3, "loop": true },
          "hit": { "frames": [3, 4, 5], "fps": 10, "loop": false },
          "defeat": { "frames": [6, 7, 8, 9], "fps": 8, "loop": false }
        },
        "phases": [
          { "health_threshold": 0.5, "sprite_variant": "angry", "speed_boost": 1.2 }
        ]
      }
    ]
  }
}
```

### 2. Battle Scene Type

```json
{
  "scenes": [
    {
      "id": "battle_scene",
      "type": "battle",
      "title": "Defeat the Fraction Fiend!",
      
      "layout": {
        "type": "battle-arena",
        "background": "bg_dungeon",
        "layers": ["background", "effects", "entities", "ui"]
      },
      
      "battle_config": {
        "mode": "rapid_fire",
        "enemy_id": "monster_fraction_fiend",
        "player_id": "player_hero",
        "time_limit_seconds": null,
        "question_source": "content.questions",
        "question_mode": "continuous"
      },
      
      "components": [
        {
          "id": "enemy_display",
          "type": "entity-sprite",
          "entity_id": "monster_fraction_fiend",
          "position": { "x": "70%", "y": "40%" },
          "scale": 2.0
        },
        {
          "id": "player_display", 
          "type": "entity-sprite",
          "entity_id": "player_hero",
          "position": { "x": "20%", "y": "60%" },
          "scale": 1.5
        },
        {
          "id": "enemy_health_bar",
          "type": "health-bar",
          "entity_id": "monster_fraction_fiend",
          "position": "top-center",
          "style": { "width": "60%", "show_numbers": true }
        },
        {
          "id": "question_panel",
          "type": "battle-question",
          "position": "bottom",
          "style": "rapid-fire",
          "show_timer": true,
          "options_layout": "horizontal-4"
        },
        {
          "id": "combo_display",
          "type": "combo-counter",
          "position": "top-left",
          "format": "🔥 x{value}"
        },
        {
          "id": "damage_display",
          "type": "floating-damage",
          "style": "rpg"
        },
        {
          "id": "timer_display",
          "type": "battle-timer",
          "position": "top-right",
          "format": "mm:ss.ms"
        }
      ],
      
      "rules": [
        {
          "id": "correct_answer_attack",
          "trigger": "answer_submitted",
          "conditions": [{ "type": "is_correct", "value": true }],
          "actions": [
            { "type": "play_animation", "entity": "player_hero", "animation": "attack" },
            { "type": "calculate_damage", "formula": "base_damage * combo_multiplier * speed_bonus" },
            { "type": "deal_damage", "target": "monster_fraction_fiend", "amount": "calculated_damage" },
            { "type": "play_animation", "entity": "monster_fraction_fiend", "animation": "hit" },
            { "type": "show_floating_damage", "value": "calculated_damage", "position": "enemy" },
            { "type": "increment", "variable": "combo", "amount": 1 },
            { "type": "play_sound", "asset_id": "sound_sword_hit" },
            { "type": "screen_shake", "intensity": 0.3, "duration": 100 }
          ]
        },
        {
          "id": "wrong_answer_miss",
          "trigger": "answer_submitted",
          "conditions": [{ "type": "is_correct", "value": false }],
          "actions": [
            { "type": "play_animation", "entity": "player_hero", "animation": "attack" },
            { "type": "show_floating_text", "value": "MISS!", "style": "miss" },
            { "type": "set", "variable": "combo", "value": 0 },
            { "type": "play_sound", "asset_id": "sound_miss" }
          ]
        },
        {
          "id": "speed_bonus_calculation",
          "trigger": "answer_submitted",
          "conditions": [],
          "actions": [
            {
              "type": "calculate_speed_bonus",
              "time_variable": "answer_time_ms",
              "thresholds": [
                { "max_ms": 1000, "bonus": 2.0, "label": "LIGHTNING!" },
                { "max_ms": 2000, "bonus": 1.5, "label": "FAST!" },
                { "max_ms": 3000, "bonus": 1.2, "label": "GOOD" },
                { "default": true, "bonus": 1.0, "label": "" }
              ]
            }
          ]
        },
        {
          "id": "enemy_defeated",
          "trigger": "entity_health_zero",
          "conditions": [{ "type": "entity_id", "value": "monster_fraction_fiend" }],
          "actions": [
            { "type": "stop_timer", "timer_id": "battle_timer" },
            { "type": "play_animation", "entity": "monster_fraction_fiend", "animation": "defeat" },
            { "type": "play_animation", "entity": "player_hero", "animation": "victory" },
            { "type": "play_sound", "asset_id": "sound_victory" },
            { "type": "calculate_score", "formula": "base_score + time_bonus + combo_bonus" },
            { "type": "delay", "ms": 2000 },
            { "type": "navigate", "target": "victory_scene" }
          ]
        }
      ]
    }
  ]
}
```

### 3. Enhanced State Variables

```json
{
  "state": {
    "variables": [
      { "id": "combo", "name": "Combo", "type": "number", "initial_value": 0, "scope": "player" },
      { "id": "max_combo", "name": "Max Combo", "type": "number", "initial_value": 0, "scope": "player" },
      { "id": "total_damage", "name": "Total Damage", "type": "number", "initial_value": 0, "scope": "player" },
      { "id": "battle_time_ms", "name": "Battle Time", "type": "number", "initial_value": 0, "scope": "session" },
      { "id": "questions_answered", "name": "Questions", "type": "number", "initial_value": 0, "scope": "player" },
      { "id": "accuracy", "name": "Accuracy", "type": "number", "initial_value": 0, "scope": "player" },
      { "id": "speed_bonus_total", "name": "Speed Bonus", "type": "number", "initial_value": 0, "scope": "player" }
    ]
  }
}
```

### 4. Enhanced Grading for Battle Games

```json
{
  "grading": {
    "scoring_model": "battle",
    
    "score_components": [
      {
        "id": "time_score",
        "label": "Time Bonus",
        "formula": "max(0, 10000 - battle_time_ms) / 100",
        "max_points": 100
      },
      {
        "id": "accuracy_score", 
        "label": "Accuracy Bonus",
        "formula": "accuracy * 50",
        "max_points": 50
      },
      {
        "id": "combo_score",
        "label": "Combo Bonus",
        "formula": "max_combo * 10",
        "max_points": null
      },
      {
        "id": "damage_score",
        "label": "Total Damage",
        "formula": "total_damage",
        "max_points": null
      }
    ],
    
    "high_score_tracking": {
      "enabled": true,
      "leaderboard_type": "fastest_clear",
      "display_format": "time",
      "track_metrics": ["battle_time_ms", "max_combo", "accuracy"]
    }
  }
}
```

---

## New Component Types for Battle Games

### Entity Sprite
Renders animated game characters with sprite sheets.

```jsx
<EntitySprite 
  entityId="monster_fraction_fiend"
  animation="idle"
  onAnimationComplete={(anim) => handleAnimEnd(anim)}
/>
```

### Health Bar
Visual health indicator with optional damage preview.

```jsx
<HealthBar
  current={75}
  max={100}
  showDamagePreview={true}
  pendingDamage={15}
/>
```

### Battle Question
Rapid-fire question display optimized for speed.

```jsx
<BattleQuestion
  question={currentQuestion}
  onAnswer={(answer, timeMs) => handleAnswer(answer, timeMs)}
  showTimer={true}
/>
```

### Floating Damage
Animated damage numbers that float up and fade.

```jsx
<FloatingDamage
  value={42}
  isCritical={combo >= 5}
  position={{ x: 500, y: 200 }}
/>
```

### Combo Counter
Displays current combo with streak animations.

```jsx
<ComboCounter
  value={7}
  showMultiplier={true}
  animate={true}
/>
```

---

## Implementation Phases

### Phase 2.5: Battle System Extension
1. Extend GameSpec schema with entities and battle scenes
2. Create BattleEngine component (separate from QuizEngine)
3. Implement sprite animation system
4. Add damage calculation and combat rules

### Phase 2.6: Visual Effects
1. Floating damage numbers
2. Screen shake effects
3. Particle systems (hit sparks, magic effects)
4. Combo fire animations

### Phase 2.7: AI Compiler Enhancement
1. Train prompts to recognize battle/action game requests
2. Generate appropriate entity stats and animations
3. Create balanced difficulty curves
4. Generate varied monster types

---

## Example Full GameSpec: Fraction Fighter

```json
{
  "version": "1.1",
  "meta": {
    "title": "Fraction Fighter",
    "description": "Defeat monsters using your fraction skills!",
    "game_type": "battle",
    "educational": {
      "grade_levels": [4, 5, 6],
      "subjects": ["math"],
      "standards": ["CCSS.MATH.4.NF.A.1"],
      "learning_objectives": ["Add and compare fractions with like denominators"]
    },
    "gameplay": {
      "estimated_duration_minutes": 5,
      "player_mode": "single",
      "difficulty": 2
    }
  },
  
  "entities": {
    "player": {
      "id": "hero",
      "name": "Math Knight",
      "sprite": "hero_sprite",
      "stats": { "base_damage": 10 }
    },
    "enemies": [
      {
        "id": "fraction_fiend",
        "name": "Fraction Fiend", 
        "sprite": "monster_sprite",
        "stats": { "max_health": 100 }
      }
    ]
  },
  
  "content": {
    "questions": [
      {
        "id": "q1",
        "type": "multiple_choice",
        "stem": "What is 1/4 + 1/4?",
        "options": [
          { "id": "a", "text": "1/2", "is_correct": true },
          { "id": "b", "text": "2/8", "is_correct": false },
          { "id": "c", "text": "1/4", "is_correct": false },
          { "id": "d", "text": "2/4", "is_correct": false }
        ],
        "difficulty": 1
      }
    ]
  },
  
  "scenes": [
    {
      "id": "battle",
      "type": "battle",
      "battle_config": {
        "mode": "rapid_fire",
        "enemy_id": "fraction_fiend"
      }
    },
    {
      "id": "victory",
      "type": "result",
      "title": "Victory!"
    }
  ]
}
```

---

## Asset Requirements

For battle games, we'll need:
- Sprite sheets (can use free assets or AI-generated)
- Sound effects (sword swing, hit, miss, victory)
- Background music (optional)
- Particle effect textures

The AI compiler can reference a library of pre-made assets or generate placeholders.
