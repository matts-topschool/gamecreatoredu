# GameSpec Schema - The Game OS Core

This document defines the complete GameSpec schema - the JSON specification that powers every educational game on the platform.

## Overview

The GameSpec is a **declarative JSON document** that fully describes an educational game. The AI Compiler generates this spec from teacher prompts, and the Game Runtime executes it deterministically.

**Key Principles:**
- No arbitrary code execution - all logic is in the spec
- AI generates specs, Runtime executes them
- Specs are versioned and immutable once published
- Validation ensures all specs are playable

---

## Complete GameSpec Schema

```json
{
  "$schema": "https://gamecraft.edu/schemas/gamespec-v1.json",
  "version": "1.0",
  
  "meta": {
    "id": "uuid-v4",
    "title": "String (max 100 chars)",
    "description": "String (max 500 chars)",
    "thumbnail_url": "URL or asset reference",
    
    "educational": {
      "grade_levels": [1, 2, 3],
      "subjects": ["math", "science"],
      "standards": [
        {
          "id": "CCSS.MATH.1.OA.A.1",
          "description": "Add and subtract within 20"
        }
      ],
      "learning_objectives": [
        "Students will be able to add single-digit numbers"
      ]
    },
    
    "gameplay": {
      "estimated_duration_minutes": 15,
      "player_mode": "single|multiplayer|collaborative",
      "max_players": 30,
      "difficulty": 1-5
    },
    
    "accessibility": {
      "colorblind_safe": true,
      "screen_reader_friendly": true,
      "keyboard_navigable": true,
      "text_to_speech": false
    },
    
    "language": "en-US"
  },
  
  "assets": {
    "images": [
      {
        "id": "img_001",
        "url": "https://...",
        "alt": "Description for accessibility",
        "license": "unsplash|custom|generated"
      }
    ],
    "audio": [
      {
        "id": "audio_001",
        "url": "https://...",
        "type": "background|effect|narration"
      }
    ],
    "backgrounds": [
      {
        "id": "bg_001",
        "url": "https://...",
        "scene_ids": ["scene_1", "scene_2"]
      }
    ]
  },
  
  "state": {
    "variables": [
      {
        "id": "score",
        "name": "Score",
        "type": "number",
        "initial_value": 0,
        "scope": "player",
        "display": true
      },
      {
        "id": "lives",
        "name": "Lives",
        "type": "number",
        "initial_value": 3,
        "scope": "player",
        "display": true
      },
      {
        "id": "current_question_index",
        "name": "Current Question",
        "type": "number",
        "initial_value": 0,
        "scope": "player",
        "display": false
      },
      {
        "id": "streak",
        "name": "Streak",
        "type": "number",
        "initial_value": 0,
        "scope": "player",
        "display": true
      },
      {
        "id": "time_remaining",
        "name": "Time",
        "type": "number",
        "initial_value": 300,
        "scope": "session",
        "display": true
      }
    ]
  },
  
  "scenes": [
    {
      "id": "title_screen",
      "type": "title",
      "title": "Welcome to Math Quest!",
      
      "layout": {
        "type": "centered",
        "background": "bg_001",
        "padding": "large"
      },
      
      "components": [
        {
          "id": "title_text",
          "type": "text",
          "content": "Math Quest: Addition Adventure",
          "style": {
            "size": "h1",
            "color": "primary",
            "animation": "fadeIn"
          }
        },
        {
          "id": "start_button",
          "type": "button",
          "label": "Start Game",
          "style": "primary",
          "action": {
            "type": "navigate",
            "target": "question_scene"
          }
        }
      ],
      
      "rules": [],
      
      "transitions": {
        "entry": { "type": "fade", "duration": 500 },
        "exit": { "type": "slide", "direction": "left", "duration": 300 }
      }
    },
    
    {
      "id": "question_scene",
      "type": "question",
      "title": "Answer the Question",
      
      "layout": {
        "type": "card-center",
        "background": "bg_002",
        "padding": "medium"
      },
      
      "components": [
        {
          "id": "score_display",
          "type": "state-display",
          "variable": "score",
          "format": "Score: {value}",
          "position": "top-right"
        },
        {
          "id": "streak_display",
          "type": "state-display",
          "variable": "streak",
          "format": "🔥 {value}",
          "position": "top-left",
          "show_when": {
            "condition": "state.streak > 0"
          }
        },
        {
          "id": "question_card",
          "type": "question-card",
          "content_source": "content.questions",
          "index_variable": "current_question_index",
          "options_layout": "grid-2x2",
          "show_feedback": true,
          "feedback_duration_ms": 2000
        },
        {
          "id": "progress_bar",
          "type": "progress",
          "current_variable": "current_question_index",
          "total": "content.questions.length",
          "position": "bottom"
        }
      ],
      
      "rules": [
        {
          "id": "rule_correct_answer",
          "trigger": "answer_submitted",
          "conditions": [
            { "type": "is_correct", "value": true }
          ],
          "actions": [
            { "type": "increment", "variable": "score", "amount": 10 },
            { "type": "increment", "variable": "streak", "amount": 1 },
            { "type": "play_sound", "asset_id": "audio_correct" },
            { "type": "show_feedback", "feedback_type": "correct" }
          ]
        },
        {
          "id": "rule_wrong_answer",
          "trigger": "answer_submitted",
          "conditions": [
            { "type": "is_correct", "value": false }
          ],
          "actions": [
            { "type": "set", "variable": "streak", "value": 0 },
            { "type": "play_sound", "asset_id": "audio_wrong" },
            { "type": "show_feedback", "feedback_type": "incorrect" }
          ]
        },
        {
          "id": "rule_streak_bonus",
          "trigger": "answer_submitted",
          "conditions": [
            { "type": "is_correct", "value": true },
            { "type": "compare", "variable": "streak", "operator": ">=", "value": 3 }
          ],
          "actions": [
            { "type": "increment", "variable": "score", "amount": 5 },
            { "type": "show_toast", "message": "Streak Bonus! +5" }
          ]
        },
        {
          "id": "rule_advance_question",
          "trigger": "feedback_complete",
          "conditions": [],
          "actions": [
            { "type": "increment", "variable": "current_question_index", "amount": 1 },
            {
              "type": "conditional",
              "if": {
                "type": "compare",
                "variable": "current_question_index",
                "operator": ">=",
                "value": "content.questions.length"
              },
              "then": [
                { "type": "navigate", "target": "results_scene" }
              ]
            }
          ]
        }
      ],
      
      "transitions": {
        "entry": { "type": "slide", "direction": "right", "duration": 300 },
        "exit": { "type": "fade", "duration": 200 }
      }
    },
    
    {
      "id": "results_scene",
      "type": "result",
      "title": "Game Complete!",
      
      "layout": {
        "type": "centered",
        "background": "bg_003",
        "padding": "large"
      },
      
      "components": [
        {
          "id": "completion_text",
          "type": "text",
          "content": "Great Job!",
          "style": { "size": "h1", "animation": "bounceIn" }
        },
        {
          "id": "final_score",
          "type": "state-display",
          "variable": "score",
          "format": "Final Score: {value}",
          "style": { "size": "h2" }
        },
        {
          "id": "accuracy_display",
          "type": "computed-display",
          "compute": "round((state.score / (content.questions.length * 10)) * 100)",
          "format": "Accuracy: {value}%"
        },
        {
          "id": "leaderboard",
          "type": "leaderboard",
          "show_top": 10,
          "highlight_current_player": true,
          "show_when": {
            "condition": "session.mode === 'multiplayer'"
          }
        },
        {
          "id": "play_again_button",
          "type": "button",
          "label": "Play Again",
          "style": "primary",
          "action": {
            "type": "restart_game"
          }
        }
      ],
      
      "rules": [],
      
      "transitions": {
        "entry": { "type": "zoom", "duration": 500 }
      }
    }
  ],
  
  "content": {
    "questions": [
      {
        "id": "q_001",
        "type": "multiple_choice",
        "stem": "What is 3 + 4?",
        "stem_format": "text",
        "options": [
          { "id": "a", "text": "5", "is_correct": false },
          { "id": "b", "text": "6", "is_correct": false },
          { "id": "c", "text": "7", "is_correct": true },
          { "id": "d", "text": "8", "is_correct": false }
        ],
        "explanation": "3 + 4 = 7. You can count: 3, then add 4 more (4, 5, 6, 7).",
        "difficulty": 1,
        "standards": ["CCSS.MATH.1.OA.A.1"],
        "ai_feedback": {
          "a": "Not quite! 5 is actually 3 + 2. Try counting up from 3 four times.",
          "b": "Close! 6 is 3 + 3. You need to add one more.",
          "d": "Almost! 8 is 4 + 4. You're adding 3 + 4, not 4 + 4."
        },
        "hints": [
          "Try using your fingers to count",
          "Start at 3, then count up 4 more numbers"
        ],
        "time_limit_seconds": 30
      },
      {
        "id": "q_002",
        "type": "multiple_choice",
        "stem": "What is 5 + 3?",
        "options": [
          { "id": "a", "text": "7", "is_correct": false },
          { "id": "b", "text": "8", "is_correct": true },
          { "id": "c", "text": "9", "is_correct": false },
          { "id": "d", "text": "6", "is_correct": false }
        ],
        "explanation": "5 + 3 = 8. Start at 5 and count 3 more: 6, 7, 8.",
        "difficulty": 1,
        "standards": ["CCSS.MATH.1.OA.A.1"],
        "ai_feedback": {
          "a": "Not quite! 7 is 5 + 2. Count one more!",
          "c": "Close! 9 is 5 + 4. You only need to add 3.",
          "d": "6 is 5 + 1. You need to add 3, not 1."
        }
      }
    ],
    
    "story_nodes": [],
    
    "characters": [],
    
    "dialogue": []
  },
  
  "grading": {
    "scoring_model": "points",
    "max_score": null,
    "calculate_max_score": "content.questions.length * 10",
    "passing_threshold": 0.7,
    
    "score_breakdown": [
      {
        "category": "Correct Answers",
        "points_per": 10,
        "source": "correct_answers_count"
      },
      {
        "category": "Streak Bonuses",
        "points_per": 5,
        "source": "streak_bonuses_count"
      }
    ],
    
    "mastery_levels": [
      { "name": "Novice", "min_percent": 0, "max_percent": 49 },
      { "name": "Developing", "min_percent": 50, "max_percent": 69 },
      { "name": "Proficient", "min_percent": 70, "max_percent": 89 },
      { "name": "Mastered", "min_percent": 90, "max_percent": 100 }
    ],
    
    "standards_mapping": [
      {
        "standard_id": "CCSS.MATH.1.OA.A.1",
        "questions": ["q_001", "q_002"],
        "mastery_threshold": 0.8
      }
    ],
    
    "gradebook_export": {
      "format": "points",
      "include_time": true,
      "include_attempts": true
    }
  },
  
  "settings": {
    "allow_skip": false,
    "allow_hints": true,
    "max_hints_per_question": 2,
    "hint_penalty_points": 2,
    "allow_retry": false,
    "shuffle_questions": true,
    "shuffle_options": true,
    "show_correct_answer_on_wrong": true,
    "show_explanation": true,
    "timer_type": "none|per_question|total",
    "background_music": true,
    "sound_effects": true
  }
}
```

---

## Component Types Reference

### Display Components
| Type | Description | Key Props |
|------|-------------|-----------|
| `text` | Static or dynamic text | content, style, animation |
| `image` | Image display | asset_id, alt, size |
| `state-display` | Shows state variable | variable, format |
| `computed-display` | Computed value | compute (expression), format |
| `progress` | Progress bar | current_variable, total |

### Interactive Components
| Type | Description | Key Props |
|------|-------------|-----------|
| `button` | Clickable button | label, style, action |
| `question-card` | Question with options | content_source, options_layout |
| `input` | Text input field | placeholder, validation |
| `drag-drop` | Drag and drop zone | items, targets |

### Game Components
| Type | Description | Key Props |
|------|-------------|-----------|
| `leaderboard` | Live leaderboard | show_top, highlight_current |
| `timer` | Countdown timer | variable, format |
| `board-2d` | 2D game board | grid_size, cell_component |
| `character` | Animated character | character_id, animation |

---

## Rule System

### Triggers
- `scene_enter` - When scene loads
- `scene_exit` - When leaving scene
- `answer_submitted` - When player submits answer
- `feedback_complete` - When feedback animation ends
- `timer_tick` - Every second (if timer enabled)
- `timer_end` - When timer reaches 0
- `state_changed` - When any state variable changes
- `button_click` - When button is clicked

### Conditions
```json
{ "type": "is_correct", "value": true|false }
{ "type": "compare", "variable": "score", "operator": ">=", "value": 100 }
{ "type": "state_equals", "variable": "lives", "value": 0 }
{ "type": "all_questions_answered" }
{ "type": "expression", "expr": "state.score > 50 && state.streak >= 3" }
```

### Actions
```json
{ "type": "set", "variable": "score", "value": 0 }
{ "type": "increment", "variable": "score", "amount": 10 }
{ "type": "decrement", "variable": "lives", "amount": 1 }
{ "type": "navigate", "target": "scene_id" }
{ "type": "restart_game" }
{ "type": "end_game" }
{ "type": "play_sound", "asset_id": "audio_id" }
{ "type": "show_toast", "message": "Great job!" }
{ "type": "show_feedback", "feedback_type": "correct|incorrect" }
{ "type": "emit_event", "event_type": "custom_event", "payload": {} }
{ "type": "conditional", "if": {...}, "then": [...], "else": [...] }
```

---

## Validation Rules

A GameSpec must pass these validations before publishing:

1. **Meta Validation**
   - Title required, max 100 chars
   - At least one grade level
   - At least one subject
   - Valid language code

2. **Scene Validation**
   - At least one scene required
   - All scene_id references must exist
   - No circular transitions
   - Title scene should have start action

3. **Content Validation**
   - Questions must have at least 2 options
   - Exactly one correct answer per question
   - All content_source references valid

4. **State Validation**
   - All variable references in rules must exist
   - Initial values match declared types

5. **Asset Validation**
   - All asset_id references must exist
   - URLs must be valid or asset references

---

## AI Compiler Prompt Template

```
You are an expert educational game designer. Create a GameSpec JSON for the following game:

TEACHER PROMPT:
{user_prompt}

REQUIREMENTS:
- Target grades: {grade_levels}
- Subject: {subject}
- Duration: ~{duration} minutes
- Question count: {question_count}

Generate a complete, valid GameSpec following the schema. Include:
1. Engaging title and description
2. Appropriate difficulty progression
3. Clear learning objectives tied to standards
4. Varied question types where appropriate
5. Helpful AI feedback for wrong answers
6. Gamification elements (streak, bonus points)
7. Accessibility considerations

Return ONLY valid JSON matching the GameSpec schema.
```

---

This schema provides the complete foundation for the Game OS, enabling:
- AI to generate full games from prompts
- Teachers to customize games in Builder Mode
- Runtime to execute games deterministically
- Analytics to track learning outcomes
