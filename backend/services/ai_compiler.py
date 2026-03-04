"""
AI Compiler Service - Generates GameSpecs from natural language prompts using OpenAI GPT-5.1.
Supports flexible game types with distinct mechanics for each type.
"""
import os
import json
import logging
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
- enemy.health should start at 100
- Correct answers deal damage (base 10 + speed bonus + combo bonus)
- Faster answers = more damage
- Combo system: consecutive correct answers multiply damage
- Include battle-themed feedback ("Critical hit!", "The monster staggers!")
- Victory when enemy health reaches 0
- Player can take damage on wrong answers (optional lives system)
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
For PUZZLE games:
- Include matching, sorting, or categorization challenges
- Questions can be "arrange these in order" or "match pairs"
- Support drag-and-drop style interactions
- Include visual/spatial reasoning elements
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
    "bonus_damage_per_combo": 5,
    "speed_bonus_threshold_seconds": 5,
    "speed_bonus_damage": 5,
    "player_damage_on_wrong": 10
  }
}

QUALITY GUIDELINES:
1. Questions must be grade-appropriate and clearly worded
2. All 4 answer options should be plausible (no obvious jokes)
3. Explanations should teach, not just say "that's correct"
4. Difficulty should progress gradually
5. Hints should guide without giving away the answer
6. For battle games, make the enemy character FUN and THEMATIC
7. Generate the exact number of questions requested

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
        
        prompt = f"""Generate {count} {question_type} questions about "{topic}" for grade {grade_level}.
Difficulty: {difficulty}/5

Output as JSON array:
[{{"id": "q1", "type": "{question_type}", "stem": "Question?", "options": [{{"id": "a", "text": "Option", "is_correct": false}}, ...], "explanation": "Why correct", "difficulty": {difficulty}, "hints": ["Hint"]}}]

JSON ONLY."""

        chat = self._get_chat("questions")
        response = await chat.send_message(UserMessage(text=prompt))
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            import re
            match = re.search(r'\[[\s\S]*\]', response)
            if match:
                return json.loads(match.group())
            raise ValueError("Failed to parse questions")
    
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
        return self._parse_response(response)
    
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
        
        # For battle games, ensure entities exist
        if spec["meta"].get("game_type") == "battle":
            spec.setdefault("entities", {})
            spec["entities"].setdefault("enemy", {
                "id": "boss",
                "name": "Knowledge Monster",
                "health": {"max": 100, "current": 100}
            })
            spec.setdefault("battle_config", {
                "damage_per_correct": 10,
                "bonus_damage_per_combo": 5,
                "speed_bonus_threshold_seconds": 5,
                "speed_bonus_damage": 5
            })
        
        return spec


# Singleton instance
_compiler_instance = None


def get_ai_compiler() -> AICompiler:
    """Get or create the AI compiler instance."""
    global _compiler_instance
    if _compiler_instance is None:
        _compiler_instance = AICompiler()
    return _compiler_instance
