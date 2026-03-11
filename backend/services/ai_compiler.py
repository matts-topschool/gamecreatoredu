"""
AI Compiler Service - Generates GameSpecs from natural language prompts using OpenAI GPT-5.1.
Supports flexible game types with distinct mechanics for each type.
"""
import os
import json
import random
import logging
from collections import Counter
from typing import Optional, AsyncGenerator
from dotenv import load_dotenv

load_dotenv()

from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

# Game type specific instructions
GAME_TYPE_INSTRUCTIONS = {
    "quiz": """
For QUIZ games:
- Focus on clean question-answer flow
- Emphasize learning and explanation
- Include varied difficulty progression
- Support hints for struggling students
- Simple scoring based on correctness
""",
    "battle": """
For BATTLE games:
- Create a compelling enemy/boss character related to the topic (e.g., "Fraction Fiend", "Grammar Goblin")
- DO NOT set enemy.health.max — it will be calculated automatically based on question count
- Correct answers deal damage (base 10 + speed bonus + combo bonus)
- Answers within 15 seconds earn speed bonus damage
- Combo system: consecutive correct answers add bonus damage
- Include battle-themed feedback ("Critical hit!", "The monster staggers!")
- Victory when enemy health reaches 0. Player loses if they take too many wrong answers.
- Generate TWO sets of taunt messages: taunt_messages (normal, >50% HP) and taunt_messages_low_hp (desperate, <30% HP)
""",
    "adventure": """
For ADVENTURE games:
- Create a story context and narrative
- Include character dialogue and story progression
- Questions unlock story chapters or progress the plot
- Include branching choices where possible
- Create memorable NPCs related to the subject matter
- Victory is completing the story journey
""",
    "platformer": """
For PLATFORMER games:
- Questions act as "gates" or checkpoints
- Correct answers let the player advance
- Wrong answers might cost a life or restart section
- Include collectibles tied to bonus questions
- Level progression from easy to hard
""",
    "puzzle": """
For PUZZLE games — use puzzle_config instead of content.questions:
- Choose ONE sub_type based on the topic:
    "sort"  — drag items into named category bins (classify, group, organize)
    "match" — pair each term with its definition, translation, cause/effect
    "order" — arrange items in the correct sequence (timeline, steps of a process)
- Generate 2-3 rounds of increasing difficulty
- Each item needs: id (unique string like "item_1"), label (displayed term), icon (1 relevant emoji), correct_bin (bin id)
- For "order" sub_type: also include correct_position (1-indexed integer) on each item
- For "match" sub_type: bins have is_prompt: true; items have role: "answer"
- Bins represent categories/prompts/sequence — keep to 3-6 bins per round
- Items per round: 4-10 items (lower grades = fewer items)
- Set content.questions to an empty array []
- Each round needs a clear "instruction" string and an "explanation" of the concept
- Bin "hint" fields are strongly recommended for educational value
- DO NOT repeat items across rounds; each round should teach a new facet of the topic
""",
    "simulation": """
For SIMULATION games:
- Create a management or building scenario (e.g., run a restaurant, build a city)
- Questions influence success/resources
- Correct answers earn resources or unlock features
- Include progression and achievement system
"""
}

# System prompt for game generation
GAME_COMPILER_SYSTEM_PROMPT = """You are an expert educational game designer. Transform teacher descriptions into complete, playable game specifications.

Your games must be ENGAGING, AGE-APPROPRIATE, and EDUCATIONALLY EFFECTIVE.

OUTPUT FORMAT: Valid JSON GameSpec only. No markdown, no explanations.

BASE GAMESPEC STRUCTURE:
{
  "version": "2.0",
  "meta": {
    "title": "Engaging Title Here",
    "description": "Brief, exciting description",
    "game_type": "quiz|battle|adventure|platformer|puzzle|simulation",
    "educational": {
      "grade_levels": [4, 5],
      "subjects": ["math"],
      "learning_objectives": ["Objective 1", "Objective 2"]
    },
    "gameplay": {
      "estimated_duration_minutes": 15,
      "difficulty": 2
    }
  },
  "content": {
    "questions": [
      {
        "id": "q1",
        "type": "multiple_choice",
        "stem": "Clear question text?",
        "options": [
          {"id": "a", "text": "Wrong answer", "is_correct": false},
          {"id": "b", "text": "Correct answer", "is_correct": true},
          {"id": "c", "text": "Wrong answer", "is_correct": false},
          {"id": "d", "text": "Wrong answer", "is_correct": false}
        ],
        "explanation": "Clear explanation of why the answer is correct",
        "difficulty": 1,
        "hints": ["Helpful hint"]
      }
    ]
  },
  "settings": {
    "allow_hints": true,
    "shuffle_questions": true,
    "show_explanation": true,
    "leaderboard": {"enabled": true, "type": "score"}
  }
}

FOR BATTLE GAMES - ADD THIS STRUCTURE:
{
  "entities": {
    "player": {
      "id": "hero",
      "name": "Knowledge Knight",
      "health": {"max": 100, "current": 100},
      "attack": {"base_damage": 10}
    },
    "enemy": {
      "id": "boss",
      "name": "The Fraction Fiend",
      "description": "A fearsome monster who despises math knowledge!",
      "health": {"max": 100, "current": 100},
      "weakness": "Correct answers",
      "taunt_messages": [
        "You'll never defeat me!",
        "Math is too hard for you!",
        "Give up now!"
      ],
      "defeat_message": "Nooo! Your knowledge is too powerful!"
    }
  },
  "battle_config": {
    "damage_per_correct": 10,
    "bonus_damage_per_combo": 4,
    "speed_bonus_threshold_seconds": 15,
    "speed_bonus_damage": 5,
    "player_damage_on_wrong": 20
  }
}

FOR PUZZLE GAMES - USE THIS STRUCTURE (instead of content.questions):
{
  "puzzle_config": {
    "sub_type": "sort",
    "rounds": 2,
    "time_limit_seconds": 60,
    "points_per_correct_placement": 100,
    "partial_credit": true,
    "show_labels_on_items": true,
    "rounds_data": [
      {
        "id": "round_1",
        "instruction": "Drag each animal into its correct vertebrate class",
        "explanation": "Vertebrates are classified by skin covering, temperature regulation, and reproduction.",
        "items": [
          {"id": "item_1", "label": "Eagle", "icon": "🦅", "correct_bin": "bird"},
          {"id": "item_2", "label": "Shark", "icon": "🦈", "correct_bin": "fish"},
          {"id": "item_3", "label": "Wolf",  "icon": "🐺", "correct_bin": "mammal"}
        ],
        "bins": [
          {"id": "bird",   "label": "Bird",   "icon": "🪶", "hint": "Has feathers and wings"},
          {"id": "fish",   "label": "Fish",   "icon": "🐠", "hint": "Breathes with gills"},
          {"id": "mammal", "label": "Mammal", "icon": "🐾", "hint": "Warm-blooded, live birth"}
        ]
      }
    ]
  },
  "puzzle_visuals": {
    "color_scheme": "nature"
  },
  "content": {"questions": []}
}

For "match" sub_type: bins have is_prompt: true, items have role: "answer", correct_bin = the bin id of the prompt they match.
For "order" sub_type: one bin with id "sequence", items have correct_position (1-indexed integer).

QUALITY GUIDELINES:
1. Questions must be grade-appropriate and clearly worded
2. All 4 answer options should be plausible (no obvious jokes)
3. Explanations should teach, not just say "that's correct"
4. Difficulty should progress gradually (easy first, hard at 60-80% through)
5. Hints should guide without giving away the answer
6. For battle games, make the enemy character FUN and THEMATIC
7. Generate the exact number of questions requested

ANSWER PLACEMENT RULES (CRITICAL):
- The correct answer position (a/b/c/d) will be specified per question — YOU MUST follow it exactly
- Do NOT default the correct answer to option b or c
- Place the correct answer ONLY at the position specified in each question's instruction

DISTRACTOR QUALITY RULES:
- NEVER use "all of the above" or "none of the above"
- Distractors must reflect real student misconceptions, not nonsense
- For numeric answers: distractors must be close in value (e.g., if correct=24, use 22, 26, 28 — not 100)
- For verbal answers: distractors must share domain vocabulary with the correct answer
- Every option must be a similar length and grammatical form as the correct answer

QUESTION DIVERSITY RULES:
- No two questions may start with the same word
- Mix cognitive depth across the set: recall, comprehension, and application questions
- Avoid repeating the same concept across multiple questions

OUTPUT ONLY VALID JSON. NO OTHER TEXT."""


class AICompiler:
    """AI-powered game specification generator using OpenAI GPT-5.1."""
    
    def __init__(self):
        # Try OpenAI key first, fall back to Emergent key
        self.api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("EMERGENT_LLM_KEY")
        self.use_openai = bool(os.environ.get("OPENAI_API_KEY"))
        
        if not self.api_key:
            raise ValueError("No API key found. Set OPENAI_API_KEY or EMERGENT_LLM_KEY")
        
        logger.info(f"AI Compiler initialized with {'OpenAI' if self.use_openai else 'Emergent'} key")
    
    def _get_chat(self, session_suffix: str = "") -> LlmChat:
        """Create a configured LlmChat instance."""
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"game_compile_{session_suffix}_{id(self)}",
            system_message=GAME_COMPILER_SYSTEM_PROMPT
        )
        
        # Use OpenAI GPT-5.1 for better JSON generation
        if self.use_openai:
            chat.with_model("openai", "gpt-5.1")
        else:
            chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        return chat
    
    async def compile_game(
        self,
        prompt: str,
        grade_levels: list[int] = None,
        subjects: list[str] = None,
        game_type: str = None,
        question_count: int = 10,
        duration_minutes: int = 15
    ) -> dict:
        """
        Generate a complete GameSpec from a natural language prompt.
        """
        enhanced_prompt = self._build_prompt(
            prompt, grade_levels, subjects, game_type, question_count, duration_minutes
        )
        
        chat = self._get_chat("main")
        user_message = UserMessage(text=enhanced_prompt)
        
        try:
            logger.info(f"Compiling game: type={game_type}, questions={question_count}")
            response = await chat.send_message(user_message)
            
            spec = self._parse_response(response)
            spec = self._validate_and_enhance(spec, game_type)

            # Shuffle options and validate distribution
            questions = spec.get("content", {}).get("questions", [])
            if questions:
                self._shuffle_question_options(questions)
                self._validate_answer_distribution(questions)

            logger.info(f"Successfully compiled: {spec.get('meta', {}).get('title', 'Unknown')}")
            return spec
            
        except Exception as e:
            logger.error(f"AI compilation failed: {e}")
            raise
    
    async def compile_game_streaming(
        self,
        prompt: str,
        grade_levels: list[int] = None,
        subjects: list[str] = None,
        game_type: str = None,
        question_count: int = 10,
        duration_minutes: int = 15
    ) -> AsyncGenerator[str, None]:
        """Generate GameSpec with streaming response."""
        enhanced_prompt = self._build_prompt(
            prompt, grade_levels, subjects, game_type, question_count, duration_minutes
        )
        
        chat = self._get_chat("stream")
        user_message = UserMessage(text=enhanced_prompt)
        
        try:
            response = await chat.send_message(user_message)
            yield response
        except Exception as e:
            logger.error(f"Streaming compilation failed: {e}")
            yield json.dumps({"error": str(e)})
    
    async def generate_questions(
        self,
        topic: str,
        grade_level: int,
        question_type: str = "multiple_choice",
        count: int = 10,
        difficulty: int = 2
    ) -> list[dict]:
        """Generate additional questions for an existing game."""
        
        position_instructions = self._build_answer_position_instructions(count)

        prompt = f"""Generate {count} {question_type} questions about "{topic}" for grade {grade_level}.
Difficulty: {difficulty}/5

{position_instructions}

DISTRACTOR RULES:
- No "all of the above" or "none of the above"
- Distractors must reflect common student misconceptions
- For numeric answers: distractors must be numerically close to the correct value
- All options must be similar in length and grammatical form
- No two questions may start with the same word

Output as JSON array:
[{{"id": "q1", "type": "{question_type}", "stem": "Question?", "options": [{{"id": "a", "text": "Option", "is_correct": false}}, {{"id": "b", "text": "Option", "is_correct": false}}, {{"id": "c", "text": "Option", "is_correct": false}}, {{"id": "d", "text": "Option", "is_correct": false}}], "explanation": "Why correct", "difficulty": {difficulty}, "hints": ["Hint"]}}]

JSON ONLY."""

        chat = self._get_chat("questions")
        response = await chat.send_message(UserMessage(text=prompt))

        try:
            questions = json.loads(response)
        except json.JSONDecodeError:
            import re
            match = re.search(r'\[[\s\S]*\]', response)
            if match:
                questions = json.loads(match.group())
            else:
                raise ValueError("Failed to parse questions")

        self._shuffle_question_options(questions)
        self._validate_answer_distribution(questions)
        return questions
    
    async def refine_spec(
        self,
        current_spec: dict,
        refinement_prompt: str
    ) -> dict:
        """Refine an existing GameSpec based on teacher feedback."""
        
        prompt = f"""Current game spec:
```json
{json.dumps(current_spec, indent=2)}
```

Teacher's requested changes:
{refinement_prompt}

Output the COMPLETE updated GameSpec as valid JSON only."""

        chat = self._get_chat("refine")
        response = await chat.send_message(UserMessage(text=prompt))
        spec = self._parse_response(response)

        questions = spec.get("content", {}).get("questions", [])
        if questions:
            self._shuffle_question_options(questions)
            self._validate_answer_distribution(questions)

        return spec
    
    def _build_prompt(
        self,
        prompt: str,
        grade_levels: list[int],
        subjects: list[str],
        game_type: str,
        question_count: int,
        duration_minutes: int
    ) -> str:
        """Build an enhanced prompt with game-type specific instructions."""
        
        parts = [f"Create an educational game:\n\n{prompt}\n"]
        
        if grade_levels:
            parts.append(f"Grade Levels: {', '.join(map(str, grade_levels))}")
        
        if subjects:
            parts.append(f"Subjects: {', '.join(subjects)}")
        
        if game_type:
            parts.append(f"Game Type: {game_type.upper()}")
            # Add game-type specific instructions
            type_instructions = GAME_TYPE_INSTRUCTIONS.get(game_type.lower(), "")
            if type_instructions:
                parts.append(f"\n{type_instructions}")
        
        parts.append(f"\nGenerate EXACTLY {question_count} questions")
        parts.append(f"Target duration: {duration_minutes} minutes")
        parts.append(f"\n{self._build_answer_position_instructions(question_count)}")
        parts.append("\nOutput ONLY valid JSON GameSpec. No markdown or explanations.")

        return "\n".join(parts)
    
    def _parse_response(self, response: str) -> dict:
        """Parse JSON from AI response."""
        
        # Try direct parse
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            pass
        
        import re
        
        # Try markdown code blocks
        match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', response)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        
        # Try raw JSON object
        match = re.search(r'\{[\s\S]*\}', response)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        
        raise ValueError(f"Could not parse JSON: {response[:500]}...")
    
    def _build_answer_position_instructions(self, question_count: int) -> str:
        """
        Generate per-question correct-answer position assignments.
        Distributes A/B/C/D evenly across the question set so the LLM cannot
        default to a favourite position (typically B or C).
        """
        positions = ['a', 'b', 'c', 'd']
        # Build a balanced sequence: repeat the shuffled set, then trim to length
        balanced = []
        while len(balanced) < question_count:
            chunk = positions[:]
            random.shuffle(chunk)
            balanced.extend(chunk)
        balanced = balanced[:question_count]

        lines = ["REQUIRED CORRECT ANSWER POSITIONS (you MUST follow these exactly):"]
        for i, pos in enumerate(balanced, start=1):
            lines.append(f"  Question {i} (id: q{i}): correct answer MUST be option '{pos}'")
        return "\n".join(lines)

    def _shuffle_question_options(self, questions: list[dict]) -> list[dict]:
        """
        Post-generation shuffle of each question's options array.
        This is a hard guarantee — regardless of what the LLM produced,
        the correct answer will end up at a random position.
        """
        for question in questions:
            options = question.get("options", [])
            if not options:
                continue
            random.shuffle(options)
            # Re-label ids a/b/c/d in shuffled order
            labels = ['a', 'b', 'c', 'd']
            for idx, option in enumerate(options):
                if idx < len(labels):
                    option['id'] = labels[idx]
            question['options'] = options
        return questions

    def _validate_answer_distribution(self, questions: list[dict]) -> dict:
        """
        Check how evenly correct answers are spread across A/B/C/D.
        Returns a report dict. Logs a warning if any position is over-represented.
        """
        correct_positions = []
        for q in questions:
            for opt in q.get("options", []):
                if opt.get("is_correct"):
                    correct_positions.append(opt.get("id", "?"))
                    break

        counts = Counter(correct_positions)
        total = len(correct_positions)
        expected = total / 4 if total else 1
        max_deviation = max((abs(counts.get(p, 0) - expected) for p in ['a', 'b', 'c', 'd']), default=0)

        report = {
            "total_questions": total,
            "distribution": dict(counts),
            "max_deviation_from_uniform": round(max_deviation, 2),
            "is_balanced": max_deviation <= max(2, total * 0.2)
        }

        if not report["is_balanced"]:
            logger.warning(
                f"Answer distribution imbalanced after shuffle: {counts}. "
                f"Max deviation: {max_deviation:.1f} from expected {expected:.1f}"
            )
        else:
            logger.info(f"Answer distribution: {dict(counts)} (balanced)")

        return report

    def _validate_and_enhance(self, spec: dict, game_type: str = None) -> dict:
        """Validate spec and add missing required fields."""
        
        # Ensure version
        spec.setdefault("version", "2.0")
        
        # Ensure meta
        spec.setdefault("meta", {})
        spec["meta"].setdefault("title", "Educational Game")
        spec["meta"].setdefault("game_type", game_type or "quiz")
        
        # Ensure content
        spec.setdefault("content", {"questions": []})
        
        # Ensure state variables
        spec.setdefault("state", {"variables": []})
        required_vars = {"score": 0, "combo": 0}
        existing_ids = {v.get("id") for v in spec["state"].get("variables", [])}
        
        for var_id, initial in required_vars.items():
            if var_id not in existing_ids:
                spec["state"]["variables"].append({
                    "id": var_id,
                    "name": var_id.capitalize(),
                    "type": "number",
                    "initial_value": initial
                })
        
        # Ensure settings
        spec.setdefault("settings", {})
        spec["settings"].setdefault("allow_hints", True)
        spec["settings"].setdefault("shuffle_questions", True)
        spec["settings"].setdefault("show_explanation", True)
        spec["settings"].setdefault("leaderboard", {"enabled": True, "type": "score"})
        
        # For battle games, ensure entities exist with scaled HP
        if spec["meta"].get("game_type") == "battle":
            question_count = len(spec.get("content", {}).get("questions", []))
            scaled_hp = max(60, question_count * 8)

            spec.setdefault("entities", {})
            spec["entities"].setdefault("enemy", {
                "id": "boss",
                "name": "Knowledge Monster",
                "health": {"max": scaled_hp, "current": scaled_hp}
            })
            # If HP was hardcoded to 100 (the AI default), override with scaled value
            enemy_hp = spec["entities"].get("enemy", {}).get("health", {})
            if enemy_hp.get("max", 0) == 100 and question_count > 0:
                enemy_hp["max"] = scaled_hp
                enemy_hp["current"] = scaled_hp

            spec.setdefault("battle_config", {
                "damage_per_correct": 10,
                "bonus_damage_per_combo": 4,
                "speed_bonus_threshold_seconds": 15,
                "speed_bonus_damage": 5,
                "player_damage_on_wrong": 20
            })
            # Fix any bad defaults the AI generated
            cfg = spec["battle_config"]
            if cfg.get("speed_bonus_threshold_seconds", 99) < 8:
                cfg["speed_bonus_threshold_seconds"] = 15
            if cfg.get("player_damage_on_wrong", 0) < 15:
                cfg["player_damage_on_wrong"] = 20

        # For puzzle games, ensure puzzle_config block is valid
        if spec["meta"].get("game_type") == "puzzle":
            spec.setdefault("puzzle_config", {
                "sub_type": "sort",
                "rounds": 1,
                "points_per_correct_placement": 100,
                "partial_credit": True,
                "show_labels_on_items": True,
                "rounds_data": []
            })
            # Enforce valid sub_type
            valid_sub_types = {"sort", "match", "order"}
            if spec["puzzle_config"].get("sub_type") not in valid_sub_types:
                spec["puzzle_config"]["sub_type"] = "sort"
            # Keep rounds count in sync with actual data
            rounds_data = spec["puzzle_config"].get("rounds_data", [])
            spec["puzzle_config"]["rounds"] = len(rounds_data)
            # Ensure puzzle_visuals
            spec.setdefault("puzzle_visuals", {"color_scheme": "nature"})
            # Puzzle games must have empty questions (not missing)
            spec["content"]["questions"] = []

        return spec


# Singleton instance
_compiler_instance = None


def get_ai_compiler() -> AICompiler:
    """Get or create the AI compiler instance."""
    global _compiler_instance
    if _compiler_instance is None:
        _compiler_instance = AICompiler()
    return _compiler_instance
