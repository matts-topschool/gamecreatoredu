"""
Game Ideator Agent - Creative game concept generator for GameCraft EDU.

Thinks like a game designer AND an educator. Given a subject, grade level,
or open-ended brief, generates complete game concepts with:
- Compelling narrative hooks and enemy/world themes
- Mechanics that reinforce the learning objective
- Engagement patterns designed for the target age group
- Differentiation suggestions for different skill levels
- Cross-curricular connection opportunities

Can also analyze existing games and suggest remixes, sequels, or variations.
"""
import os
import json
import logging
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
# Deep knowledge injected into every session
# ─────────────────────────────────────────────

GAME_IDEATOR_SYSTEM_PROMPT = """You are a creative director at an educational game studio with expertise in:

- Game design (narrative, mechanics, reward systems, player motivation)
- Educational psychology (Bloom's taxonomy, spaced repetition, scaffolding, ZPD)
- Child development by grade band (K-2, 3-5, 6-8, 9-12)
- Popular culture trends that resonate with each age group
- The specific game types available in GameCraft EDU

## GameCraft EDU Platform Capabilities

### Available Game Types
1. **Battle** — Student answers questions to damage an enemy. Theme can be anything.
   - Best for: drilling facts, vocabulary, rapid recall
   - Engagement hook: combat tension, combo streaks, boss reveals
   - Age sweet spot: grades 3-10

2. **Quiz** — Clean Q&A flow with score tracking and explanations.
   - Best for: assessments, review sessions, formative checks
   - Engagement hook: streaks, speed bonuses, leaderboard
   - Age sweet spot: all grades

3. **Adventure** — Story unfolds as questions are answered. NPCs, dialogue, worlds.
   - Best for: narrative subjects (history, literature, science stories)
   - Engagement hook: story curiosity, character relationships, world exploration
   - Age sweet spot: grades 2-8

4. **Platformer** (coming) — Questions act as gates/checkpoints between levels.
   - Best for: sequential concepts, level-based curricula
   - Engagement hook: movement, collectibles, level unlocks

5. **Puzzle** (coming) — Match, sort, categorize, or arrange.
   - Best for: vocabulary, classification, ordering concepts
   - Engagement hook: satisfying snapping/completion, visual reveal

6. **Simulation** (coming) — Resource management tied to question performance.
   - Best for: economics, science, history, civics
   - Engagement hook: building something, watching it grow/fail

### Battle Theme Library (already built)
20 themes: Fantasy, Space, Ocean, Egypt, Forest, Cyberpunk, Steampunk, Prehistoric,
Mythology, Arctic, Volcano, Underwater, Sky Castle, Dark Forest, Time Travel,
Fairy Tale, Robot Factory, Jungle Temple, Crystal Caves, Dragon Realm

18 player characters with attack styles: Knight, Wizard, Archer, Ninja, Scientist,
Explorer, Pirate, Astronaut, Viking, Samurai, Witch, Robot, Dragon Rider, Time Traveler,
Ocean Diver, Desert Wanderer, Sky Sailor, Crystal Mage

### What Makes a Great Educational Game Concept
1. **Thematic coherence** — the game world should metaphorically reinforce the learning
   (e.g., "Grammar Goblins" invading a language kingdom makes grammar feel like defending your home)
2. **Appropriate difficulty arc** — starts easy enough to build confidence, ramps meaningfully
3. **Intrinsic motivation** — the game should make students WANT to know the answer
4. **Replayability** — reasons to play again (high score, different character, harder mode)
5. **Teacher utility** — easy to deploy, clear learning objectives, useful analytics
6. **Age-appropriate themes** — what excites a 7-year-old is different from a 15-year-old

## Output formats you can produce

### CONCEPT BRIEF (for a new game idea)
```json
{
  "concept": {
    "title": "Catchy game title",
    "tagline": "One-line hook",
    "game_type": "battle|quiz|adventure|platformer|puzzle|simulation",
    "theme": "Brief theme description",
    "narrative_hook": "The story/world premise that pulls students in",
    "enemy_or_challenge": "What they're fighting/solving (for battle/adventure)",
    "learning_objective": "Exactly what skill this teaches",
    "subjects": ["subject1"],
    "grade_band": "K-2|3-5|6-8|9-12",
    "difficulty_arc": "How difficulty progresses across the game",
    "engagement_hooks": ["hook1", "hook2", "hook3"],
    "replayability_features": ["feature1", "feature2"],
    "differentiation": {
      "struggling_students": "How to support them",
      "advanced_students": "How to challenge them"
    },
    "cross_curricular": ["connection1", "connection2"],
    "sample_questions": ["Q1?", "Q2?", "Q3?"],
    "why_it_works": "Educational psychology rationale"
  }
}
```

### REMIX BRIEF (variation of an existing concept)
```json
{
  "original": "original game title",
  "remix_type": "sequel|harder_mode|different_audience|cross_curricular",
  "new_concept": { ...same as CONCEPT BRIEF... },
  "what_changed": "What's different and why it adds value"
}
```

### THEMED COLLECTION (5 related games for a unit)
```json
{
  "unit_name": "Unit title",
  "unit_description": "What this collection covers",
  "games": [ ...5 CONCEPT BRIEFs... ],
  "progression": "How games build on each other",
  "suggested_order": ["game1", "game2", "game3", "game4", "game5"]
}
```

Always output ONLY valid JSON. No markdown, no explanations outside the JSON."""


class GameIdeatorAgent:
    """
    Creative game concept generator that thinks like both a game designer and educator.

    Generates fresh concepts, remixes existing games, and builds themed collections
    aligned to curriculum objectives.
    """

    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("EMERGENT_LLM_KEY")
        self.use_openai = bool(os.environ.get("OPENAI_API_KEY"))

        if not self.api_key:
            raise ValueError("No API key found. Set OPENAI_API_KEY or EMERGENT_LLM_KEY")

        logger.info("Game Ideator Agent initialized")

    def _get_chat(self, session_suffix: str = "") -> LlmChat:
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"ideator_agent_{session_suffix}_{id(self)}",
            system_message=GAME_IDEATOR_SYSTEM_PROMPT
        )
        if self.use_openai:
            chat.with_model("openai", "gpt-5.1")
        else:
            chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
        return chat

    async def generate_concept(
        self,
        subject: str,
        grade_levels: list[int],
        learning_objective: Optional[str] = None,
        game_type: Optional[str] = None,
        tone: Optional[str] = None,
        avoid_themes: Optional[list[str]] = None
    ) -> dict:
        """
        Generate a single game concept for a given subject and grade level.

        Args:
            subject: e.g. "fractions", "World War 2", "photosynthesis"
            grade_levels: e.g. [4, 5]
            learning_objective: specific skill, e.g. "add fractions with unlike denominators"
            game_type: specific type if teacher wants one, else agent chooses best fit
            tone: e.g. "spooky", "funny", "epic", "cute" — optional creative direction
            avoid_themes: themes to skip (e.g. ["violence", "fantasy"])

        Returns:
            CONCEPT BRIEF dict
        """
        grade_band = self._grade_band(grade_levels)

        prompt = f"""Generate a CONCEPT BRIEF for this educational game:

Subject: {subject}
Grade levels: {grade_levels} ({grade_band})
{"Learning objective: " + learning_objective if learning_objective else ""}
{"Preferred game type: " + game_type if game_type else "Choose the best game type for this subject"}
{"Tone/style: " + tone if tone else ""}
{"Avoid these themes: " + ", ".join(avoid_themes) if avoid_themes else ""}

Think deeply about:
1. What metaphor or world would make students genuinely excited to learn {subject}?
2. What game mechanic best mirrors how {subject} actually works?
3. What would make a {grade_band} student tell their friend about this game?

Output ONLY the CONCEPT BRIEF JSON."""

        chat = self._get_chat(f"concept_{subject[:20]}")
        try:
            response = await chat.send_message(UserMessage(text=prompt))
            return self._parse_response(response)
        except Exception as e:
            logger.error(f"Concept generation failed: {e}")
            raise

    async def generate_bulk_concepts(
        self,
        subject: str,
        grade_levels: list[int],
        count: int = 5,
        game_types: Optional[list[str]] = None
    ) -> list[dict]:
        """
        Generate multiple distinct concepts for the same subject.
        Useful for showing teachers a variety of options.

        Args:
            subject: subject area
            grade_levels: target grades
            count: how many concepts (2-8)
            game_types: if specified, generate one of each type

        Returns:
            List of CONCEPT BRIEF dicts
        """
        count = min(max(count, 2), 8)
        grade_band = self._grade_band(grade_levels)

        types_instruction = ""
        if game_types:
            types_instruction = f"Generate one concept per game type, covering: {', '.join(game_types)}"
        else:
            types_instruction = f"Use a variety of game types. Do not repeat the same type twice."

        prompt = f"""Generate {count} DISTINCT game concepts for:

Subject: {subject}
Grade levels: {grade_levels} ({grade_band})

{types_instruction}

Each concept must have a completely different theme, narrative, and approach.
Make each one feel like a genuinely different game, not a reskin.

Output a JSON array of {count} CONCEPT BRIEF objects:
[ {{...concept...}}, {{...concept...}} ]

JSON ONLY."""

        chat = self._get_chat(f"bulk_{subject[:20]}_{count}")
        try:
            response = await chat.send_message(UserMessage(text=prompt))
            return self._parse_response(response)
        except Exception as e:
            logger.error(f"Bulk concept generation failed: {e}")
            raise

    async def remix_game(
        self,
        existing_spec: dict,
        remix_direction: str
    ) -> dict:
        """
        Generate a remix/variation of an existing game.

        Args:
            existing_spec: The current GameSpec JSON
            remix_direction: What kind of remix, e.g.:
                "make it harder for advanced students"
                "create a sequel that continues the story"
                "adapt for younger students"
                "add a cross-curricular science connection"

        Returns:
            REMIX BRIEF dict
        """
        title = existing_spec.get("meta", {}).get("title", "Unknown")
        game_type = existing_spec.get("meta", {}).get("game_type", "quiz")
        subjects = existing_spec.get("meta", {}).get("educational", {}).get("subjects", [])
        grades = existing_spec.get("meta", {}).get("educational", {}).get("grade_levels", [])

        prompt = f"""Create a REMIX BRIEF for this existing game:

Original title: {title}
Game type: {game_type}
Subjects: {subjects}
Grades: {grades}

Remix direction: {remix_direction}

Original spec summary:
{json.dumps({k: v for k, v in existing_spec.items() if k != "content"}, indent=2)}

Design a remix that genuinely adds value over the original. It should feel fresh, not just "the same but slightly different."

Output ONLY the REMIX BRIEF JSON."""

        chat = self._get_chat(f"remix_{title[:20]}")
        try:
            response = await chat.send_message(UserMessage(text=prompt))
            return self._parse_response(response)
        except Exception as e:
            logger.error(f"Remix generation failed for {title}: {e}")
            raise

    async def generate_unit_collection(
        self,
        unit_topic: str,
        grade_levels: list[int],
        num_games: int = 5,
        duration_weeks: Optional[int] = None
    ) -> dict:
        """
        Generate a themed collection of games for an entire curriculum unit.

        Args:
            unit_topic: e.g. "Ancient Egypt", "The Water Cycle", "Fractions Unit"
            grade_levels: target grades
            num_games: how many games in the collection (3-7)
            duration_weeks: how many weeks the unit covers

        Returns:
            THEMED COLLECTION dict
        """
        num_games = min(max(num_games, 3), 7)
        grade_band = self._grade_band(grade_levels)

        prompt = f"""Generate a THEMED COLLECTION for this curriculum unit:

Unit topic: {unit_topic}
Grade levels: {grade_levels} ({grade_band})
Number of games: {num_games}
{"Unit duration: " + str(duration_weeks) + " weeks" if duration_weeks else ""}

Design {num_games} games that:
1. Progress through the unit's key concepts in a logical learning sequence
2. Use different game types to maintain engagement variety
3. Build on each other — later games assume mastery of earlier concepts
4. Together cover the full unit comprehensively

Output ONLY the THEMED COLLECTION JSON."""

        chat = self._get_chat(f"unit_{unit_topic[:20]}")
        try:
            response = await chat.send_message(UserMessage(text=prompt))
            return self._parse_response(response)
        except Exception as e:
            logger.error(f"Unit collection generation failed: {e}")
            raise

    async def suggest_trending_concepts(
        self,
        grade_band: str,
        subject: Optional[str] = None,
        count: int = 6
    ) -> list[dict]:
        """
        Generate game concepts based on what's trending/engaging for a grade band.
        Draws on current pop culture, gaming trends, and age-appropriate interests.

        Args:
            grade_band: "K-2", "3-5", "6-8", or "9-12"
            subject: optional subject filter
            count: how many ideas

        Returns:
            List of CONCEPT BRIEF dicts with high novelty/engagement potential
        """
        prompt = f"""Generate {count} HIGH-NOVELTY game concepts for {grade_band} students.
{"Subject focus: " + subject if subject else "Any subject — prioritize what would excite this age group most"}

Design for MAXIMUM engagement and shareability. Think about:
- What games, shows, movies, memes are popular with {grade_band} students right now?
- What mechanics feel fresh and different from typical educational games?
- What would make a student say "this is actually fun"?

Each concept should feel genuinely exciting, not just "educational game but with a theme slapped on."

Output a JSON array of {count} CONCEPT BRIEF objects. JSON ONLY."""

        chat = self._get_chat(f"trending_{grade_band}")
        try:
            response = await chat.send_message(UserMessage(text=prompt))
            return self._parse_response(response)
        except Exception as e:
            logger.error(f"Trending concepts generation failed: {e}")
            raise

    def _grade_band(self, grade_levels: list[int]) -> str:
        if not grade_levels:
            return "3-5"
        avg = sum(grade_levels) / len(grade_levels)
        if avg <= 2:
            return "K-2"
        elif avg <= 5:
            return "3-5"
        elif avg <= 8:
            return "6-8"
        else:
            return "9-12"

    def _parse_response(self, response: str):
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            pass

        import re

        match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', response)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass

        # Try array
        match = re.search(r'\[[\s\S]*\]', response)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

        # Try object
        match = re.search(r'\{[\s\S]*\}', response)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

        raise ValueError(f"Could not parse ideator response: {response[:300]}...")


# ─────────────────────────────────────────────
# Singleton
# ─────────────────────────────────────────────

_agent_instance = None


def get_ideator_agent() -> GameIdeatorAgent:
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = GameIdeatorAgent()
    return _agent_instance
