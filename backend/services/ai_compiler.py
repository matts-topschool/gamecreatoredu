"""
AI Compiler Service - Generates GameSpecs from natural language prompts using Claude.
"""
import os
import json
import logging
from typing import Optional, AsyncGenerator
from dotenv import load_dotenv

load_dotenv()

from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

# System prompt for game generation
GAME_COMPILER_SYSTEM_PROMPT = """You are an expert educational game designer AI. Your role is to transform teacher descriptions into complete, playable game specifications.

When given a game description, you MUST output a valid JSON GameSpec following this exact structure:

{
  "version": "2.0",
  "meta": {
    "title": "Game Title",
    "description": "Brief description",
    "game_type": "quiz|battle|platformer|puzzle|simulation|adventure",
    "educational": {
      "grade_levels": [3, 4, 5],
      "subjects": ["math", "science", "english", "history"],
      "standards": [{"id": "CCSS.MATH.3.OA.A.1", "description": "Description"}],
      "learning_objectives": ["Objective 1", "Objective 2"]
    },
    "gameplay": {
      "estimated_duration_minutes": 15,
      "player_mode": "single",
      "difficulty": 2
    }
  },
  "state": {
    "variables": [
      {"id": "score", "name": "Score", "type": "number", "initial_value": 0},
      {"id": "combo", "name": "Combo", "type": "number", "initial_value": 0},
      {"id": "lives", "name": "Lives", "type": "number", "initial_value": 3}
    ]
  },
  "entities": {
    "player": {
      "id": "hero",
      "name": "Player Character",
      "components": {
        "sprite": {"asset": "hero_sprite", "width": 64, "height": 64, "color": "0x7c3aed"},
        "health": {"max": 100, "current": 100},
        "combat": {"base_damage": 10}
      }
    },
    "enemies": [
      {
        "id": "enemy_1",
        "name": "Enemy Name",
        "components": {
          "sprite": {"asset": "enemy_sprite", "width": 80, "height": 80, "color": "0xef4444"},
          "health": {"max": 100, "current": 100},
          "ai": {"behavior": "patrol"}
        }
      }
    ]
  },
  "content": {
    "questions": [
      {
        "id": "q1",
        "type": "multiple_choice",
        "stem": "Question text here?",
        "options": [
          {"id": "a", "text": "Answer A", "is_correct": false},
          {"id": "b", "text": "Answer B", "is_correct": true},
          {"id": "c", "text": "Answer C", "is_correct": false},
          {"id": "d", "text": "Answer D", "is_correct": false}
        ],
        "explanation": "Explanation of the correct answer",
        "difficulty": 1,
        "hints": ["Hint 1", "Hint 2"]
      }
    ]
  },
  "scenes": [
    {
      "id": "title",
      "type": "title",
      "title": "Game Title",
      "components": [
        {"id": "title_text", "type": "text", "content": "Game Title", "style": {"size": "h1"}},
        {"id": "start_btn", "type": "button", "label": "Start Game", "action": {"type": "navigate", "target": "gameplay"}}
      ]
    },
    {
      "id": "gameplay",
      "type": "battle|question|platformer",
      "title": "Main Gameplay",
      "components": []
    },
    {
      "id": "victory",
      "type": "result",
      "title": "Victory!",
      "components": []
    }
  ],
  "rules": [
    {
      "id": "correct_answer",
      "trigger": {"type": "answer_correct"},
      "conditions": [],
      "actions": [
        {"type": "increment", "variable": "score", "amount": 10},
        {"type": "increment", "variable": "combo", "amount": 1},
        {"type": "play_sound", "sound": "correct"}
      ]
    },
    {
      "id": "wrong_answer",
      "trigger": {"type": "answer_incorrect"},
      "conditions": [],
      "actions": [
        {"type": "set", "variable": "combo", "value": 0},
        {"type": "play_sound", "sound": "incorrect"}
      ]
    }
  ],
  "settings": {
    "allow_hints": true,
    "shuffle_questions": true,
    "show_explanation": true,
    "leaderboard": {
      "enabled": true,
      "type": "score"
    }
  }
}

IMPORTANT GUIDELINES:
1. Generate 10-15 age-appropriate questions based on the topic and grade level
2. Include helpful explanations for each question
3. For battle/action games, create engaging enemy names related to the topic
4. Make the game theme match the educational content
5. Include appropriate difficulty progression
6. Add hints for struggling students
7. For speed-based games, add combo and time bonus rules
8. ALWAYS output valid JSON only - no markdown, no explanations, just the JSON

GAME TYPE SPECIFICS:
- quiz: Traditional question-answer format
- battle: Monster battles where correct answers deal damage
- platformer: Side-scrolling with question triggers
- puzzle: Matching, sorting, or logic puzzles
- simulation: Cooking, building, or management games
- adventure: Story-driven with branching paths"""


class AICompiler:
    """AI-powered game specification generator."""
    
    def __init__(self):
        self.api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment")
    
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
        
        Args:
            prompt: Teacher's description of the desired game
            grade_levels: Target grade levels (e.g., [3, 4, 5])
            subjects: Subject areas (e.g., ["math"])
            game_type: Specific game type if requested
            question_count: Number of questions to generate
            duration_minutes: Target game duration
            
        Returns:
            Complete GameSpec dictionary
        """
        # Build enhanced prompt with context
        enhanced_prompt = self._build_prompt(
            prompt, grade_levels, subjects, game_type, question_count, duration_minutes
        )
        
        # Initialize chat
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"game_compile_{id(self)}",
            system_message=GAME_COMPILER_SYSTEM_PROMPT
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        # Send message
        user_message = UserMessage(text=enhanced_prompt)
        
        try:
            response = await chat.send_message(user_message)
            
            # Parse JSON response
            spec = self._parse_response(response)
            
            # Validate and enhance spec
            spec = self._validate_and_enhance(spec)
            
            logger.info(f"Successfully compiled game: {spec.get('meta', {}).get('title', 'Unknown')}")
            
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
        """
        Generate GameSpec with streaming response for real-time UI updates.
        Yields chunks of the JSON as it's generated.
        """
        enhanced_prompt = self._build_prompt(
            prompt, grade_levels, subjects, game_type, question_count, duration_minutes
        )
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"game_compile_stream_{id(self)}",
            system_message=GAME_COMPILER_SYSTEM_PROMPT
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        user_message = UserMessage(text=enhanced_prompt)
        
        # For now, get full response and yield it
        # In future, implement true streaming
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
        
        prompt = f"""Generate {count} {question_type} questions about "{topic}" for grade {grade_level} students.
        
Difficulty level: {difficulty}/5

Output as a JSON array of question objects with this structure:
[
  {{
    "id": "q1",
    "type": "{question_type}",
    "stem": "Question text?",
    "options": [
      {{"id": "a", "text": "Option A", "is_correct": false}},
      {{"id": "b", "text": "Option B", "is_correct": true}},
      {{"id": "c", "text": "Option C", "is_correct": false}},
      {{"id": "d", "text": "Option D", "is_correct": false}}
    ],
    "explanation": "Why the answer is correct",
    "difficulty": {difficulty},
    "hints": ["Hint 1"]
  }}
]

Output ONLY the JSON array, no other text."""

        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"question_gen_{id(self)}",
            system_message="You are an expert educational content creator. Generate high-quality, age-appropriate questions."
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        try:
            questions = json.loads(response)
            return questions
        except json.JSONDecodeError:
            # Try to extract JSON from response
            import re
            match = re.search(r'\[[\s\S]*\]', response)
            if match:
                return json.loads(match.group())
            raise ValueError("Failed to parse questions from AI response")
    
    async def generate_feedback(
        self,
        question: dict,
        wrong_answer_id: str
    ) -> str:
        """Generate personalized feedback for a wrong answer."""
        
        prompt = f"""A student answered a question incorrectly. Generate helpful, encouraging feedback.

Question: {question.get('stem')}
Correct Answer: {next((o['text'] for o in question.get('options', []) if o.get('is_correct')), 'Unknown')}
Student's Answer: {next((o['text'] for o in question.get('options', []) if o.get('id') == wrong_answer_id), 'Unknown')}

Provide a brief (1-2 sentences), encouraging explanation of why their answer was incorrect and guide them toward the right answer. Be supportive and educational."""

        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"feedback_{id(self)}",
            system_message="You are a supportive teacher providing feedback to students."
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        response = await chat.send_message(UserMessage(text=prompt))
        return response.strip()
    
    async def refine_spec(
        self,
        current_spec: dict,
        refinement_prompt: str
    ) -> dict:
        """Refine an existing GameSpec based on teacher feedback."""
        
        prompt = f"""Here is the current game specification:

```json
{json.dumps(current_spec, indent=2)}
```

The teacher wants to make these changes:
{refinement_prompt}

Output the complete updated GameSpec as valid JSON only."""

        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"refine_{id(self)}",
            system_message=GAME_COMPILER_SYSTEM_PROMPT
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
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
        """Build an enhanced prompt with all context."""
        
        parts = [f"Create an educational game based on this description:\n\n{prompt}\n"]
        
        if grade_levels:
            parts.append(f"Target Grade Levels: {', '.join(map(str, grade_levels))}")
        
        if subjects:
            parts.append(f"Subjects: {', '.join(subjects)}")
        
        if game_type:
            parts.append(f"Game Type: {game_type}")
        
        parts.append(f"Number of Questions: {question_count}")
        parts.append(f"Target Duration: {duration_minutes} minutes")
        
        parts.append("\nGenerate a complete, valid JSON GameSpec. Output ONLY the JSON, no explanations or markdown.")
        
        return "\n".join(parts)
    
    def _parse_response(self, response: str) -> dict:
        """Parse JSON from AI response, handling potential formatting issues."""
        
        # Try direct parse first
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            pass
        
        # Try to extract JSON from markdown code blocks
        import re
        
        # Look for ```json ... ``` blocks
        match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', response)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        
        # Look for raw JSON object
        match = re.search(r'\{[\s\S]*\}', response)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        
        raise ValueError(f"Could not parse JSON from response: {response[:500]}...")
    
    def _validate_and_enhance(self, spec: dict) -> dict:
        """Validate spec and add any missing required fields."""
        
        # Ensure version
        if "version" not in spec:
            spec["version"] = "2.0"
        
        # Ensure meta
        if "meta" not in spec:
            spec["meta"] = {}
        
        if "title" not in spec["meta"]:
            spec["meta"]["title"] = "Educational Game"
        
        # Ensure state variables
        if "state" not in spec:
            spec["state"] = {"variables": []}
        
        required_vars = ["score", "combo"]
        existing_var_ids = {v.get("id") for v in spec["state"].get("variables", [])}
        
        for var_id in required_vars:
            if var_id not in existing_var_ids:
                spec["state"]["variables"].append({
                    "id": var_id,
                    "name": var_id.capitalize(),
                    "type": "number",
                    "initial_value": 0
                })
        
        # Ensure settings with leaderboard
        if "settings" not in spec:
            spec["settings"] = {}
        
        if "leaderboard" not in spec["settings"]:
            spec["settings"]["leaderboard"] = {
                "enabled": True,
                "type": "score"
            }
        
        return spec


# Singleton instance
_compiler_instance = None


def get_ai_compiler() -> AICompiler:
    """Get or create the AI compiler instance."""
    global _compiler_instance
    if _compiler_instance is None:
        _compiler_instance = AICompiler()
    return _compiler_instance
