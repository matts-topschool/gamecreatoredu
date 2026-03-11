"""
Game Mechanics Agent - Expert game design reviewer and fixer.

Understands the full world of digital game design (feedback loops, difficulty curves,
reward systems, pacing, player psychology) AND the GameCraft EDU system specifically.

Audits any GameSpec for mechanical oddities, balance problems, and design anti-patterns,
then returns a corrected spec with a detailed report of every change made.
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
# System knowledge injected into every request
# ─────────────────────────────────────────────

RUNTIME_KNOWLEDGE = """
## GameCraft EDU Runtime Knowledge

### BattleRuntime mechanics (what the frontend actually does)
- enemy.health starts at `entities.enemy.health.max`
- Each correct answer deals: `battle_config.damage_per_correct` + speed_bonus + combo_bonus
- Speed bonus: if answer time < `speed_bonus_threshold_seconds`, award `speed_bonus_damage`
- Combo bonus: `combo_count * battle_config.bonus_damage_per_combo`
- Wrong answer: player takes `player_damage_on_wrong` damage (player has 100 HP)
- Victory = enemy HP reaches 0. Defeat = player HP reaches 0.
- Timer per question: 30 seconds (hardcoded in frontend)
- Taunt messages: one random message shown under enemy sprite at all times

### QuizRuntime mechanics
- Score per correct: 10 base + combo_bonus (2 * combo) + speed_bonus (if < 10s)
- No lives system — game always completes all questions
- Victory screen always shown

### AdventureRuntime mechanics
- Story chapters unlock as questions are answered correctly
- NPCs have dialogue shown before each question
- Artifact collection on chapter completion

### GameSpec field reference
battle_config:
  damage_per_correct: int        # base damage per correct answer
  bonus_damage_per_combo: int    # added per consecutive correct answer in a run
  speed_bonus_threshold_seconds: int  # answer within this many seconds for bonus
  speed_bonus_damage: int        # bonus damage for fast answers
  player_damage_on_wrong: int    # HP player loses per wrong answer

entities.enemy.health.max: int   # total enemy HP
entities.enemy.taunt_messages: list[str]  # shown randomly; no phase-based logic yet
"""

MECHANICS_SYSTEM_PROMPT = f"""You are a senior game designer with 15+ years of experience across educational games, RPGs, and casual games. You deeply understand:

- Feedback loop design (reward frequency, variable ratio schedules)
- Difficulty curves (easy→hard ramp, spike detection, pacing)
- Player psychology (frustration thresholds, flow state, motivational scaffolding)
- Balance mathematics (damage/HP ratios, meaningful vs. trivial choices)
- Educational game design specifically (low frustration, high encouragement, learning reinforcement)

You also know the GameCraft EDU system inside out:

{RUNTIME_KNOWLEDGE}

## Your job
Audit the provided GameSpec for mechanical problems. Fix everything that is wrong or suboptimal. Return a JSON object with:
1. `fixed_spec` — the complete corrected GameSpec
2. `audit_report` — a structured list of every issue found and every change made

## Common problems to look for

### Battle game balance issues
- Enemy HP = exact multiple of damage_per_correct → no room for combos or misses to matter
- speed_bonus_threshold too tight (<8s) for educational content where students must read
- player_damage_on_wrong too high → punishing, demoralizing for students
- combo bonus too small relative to base damage → combos feel meaningless
- All questions same difficulty → no pacing
- Enemy taunt messages don't reflect battle state (same taunts at 90% HP and 5% HP)
- No "low HP phase" differentiation in enemy behavior
- Enemy HP not scaled to question count (always 100 regardless of 5 or 30 questions)

### Question quality issues
- Duplicate question stems or concepts
- Questions not ordered by difficulty (hard questions first)
- All questions same difficulty rating
- Missing explanations or single-word explanations
- Hints that give away the answer directly

### General spec issues
- Missing required fields
- Impossible win conditions (e.g., more damage needed than possible)
- Settings that contradict each other
- Grade level mismatch with question difficulty

## Fixing rules
- Scale enemy HP to: max(60, question_count * 8) for battle games
- Set speed_bonus_threshold_seconds to: max(10, estimated reading time) — never below 8
- Set player_damage_on_wrong to max 8 (never punish students too hard)
- Make combo bonus at least 30% of base damage to feel meaningful
- Add phase-aware taunt messages: normal phase (>50% HP), desperate phase (<30% HP)
- Sort questions by difficulty ascending (difficulty 1 first, highest last)
- For battle: ensure at least 3 taunt messages in each phase

## Output format
Return ONLY valid JSON:
{{
  "fixed_spec": {{ ...complete corrected GameSpec... }},
  "audit_report": {{
    "issues_found": [
      {{"field": "battle_config.damage_per_correct", "severity": "high|medium|low", "issue": "description", "fix": "what was changed"}}
    ],
    "total_issues": 0,
    "balance_score_before": 0,
    "balance_score_after": 0,
    "summary": "one sentence summary"
  }}
}}

OUTPUT ONLY VALID JSON. NO OTHER TEXT."""


class GameMechanicsAgent:
    """
    Expert game design agent that audits and repairs GameSpec objects.

    Can be called standalone (audit only) or as part of the compilation pipeline
    to auto-fix specs before they reach students.
    """

    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("EMERGENT_LLM_KEY")
        self.use_openai = bool(os.environ.get("OPENAI_API_KEY"))

        if not self.api_key:
            raise ValueError("No API key found. Set OPENAI_API_KEY or EMERGENT_LLM_KEY")

        logger.info("Game Mechanics Agent initialized")

    def _get_chat(self, session_suffix: str = "") -> LlmChat:
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"mechanics_agent_{session_suffix}_{id(self)}",
            system_message=MECHANICS_SYSTEM_PROMPT
        )
        if self.use_openai:
            chat.with_model("openai", "gpt-5.1")
        else:
            chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
        return chat

    async def audit_and_fix(self, spec: dict, auto_fix: bool = True) -> dict:
        """
        Audit a GameSpec for mechanical problems and optionally fix them.

        Args:
            spec: The GameSpec dict to audit
            auto_fix: If True, return the fixed spec. If False, return audit only.

        Returns:
            {
                "fixed_spec": dict,        # corrected spec (same as input if no issues)
                "audit_report": {
                    "issues_found": [...],
                    "total_issues": int,
                    "balance_score_before": int,   # 0-100
                    "balance_score_after": int,    # 0-100
                    "summary": str
                },
                "was_modified": bool
            }
        """
        game_type = spec.get("meta", {}).get("game_type", "quiz")
        question_count = len(spec.get("content", {}).get("questions", []))

        logger.info(f"Mechanics audit: type={game_type}, questions={question_count}")

        prompt = self._build_audit_prompt(spec, auto_fix)

        chat = self._get_chat(f"{game_type}_{question_count}")

        try:
            response = await chat.send_message(UserMessage(text=prompt))
            result = self._parse_response(response)

            # Determine if the spec was actually changed
            result["was_modified"] = (
                json.dumps(result.get("fixed_spec", {}), sort_keys=True) !=
                json.dumps(spec, sort_keys=True)
            )

            issues = result.get("audit_report", {}).get("total_issues", 0)
            logger.info(
                f"Mechanics audit complete: {issues} issues found, "
                f"modified={result['was_modified']}"
            )
            return result

        except Exception as e:
            logger.error(f"Mechanics audit failed: {e}")
            # Fail gracefully — return original spec unchanged
            return {
                "fixed_spec": spec,
                "audit_report": {
                    "issues_found": [],
                    "total_issues": 0,
                    "balance_score_before": 50,
                    "balance_score_after": 50,
                    "summary": f"Audit failed: {str(e)}"
                },
                "was_modified": False
            }

    async def audit_only(self, spec: dict) -> dict:
        """Run audit and return only the report — no spec changes."""
        result = await self.audit_and_fix(spec, auto_fix=False)
        return result.get("audit_report", {})

    async def fix_battle_balance(self, spec: dict) -> dict:
        """
        Targeted fix for battle game balance only — faster than a full audit.
        Applies deterministic rules without an LLM call for speed.
        """
        if spec.get("meta", {}).get("game_type") != "battle":
            return spec

        question_count = len(spec.get("content", {}).get("questions", []))
        changes = []

        spec = json.loads(json.dumps(spec))  # deep copy

        # Scale enemy HP to question count
        target_hp = max(60, question_count * 8)
        current_hp = spec.get("entities", {}).get("enemy", {}).get("health", {}).get("max", 100)
        if abs(current_hp - target_hp) > 10:
            spec.setdefault("entities", {}).setdefault("enemy", {}).setdefault("health", {})
            spec["entities"]["enemy"]["health"]["max"] = target_hp
            spec["entities"]["enemy"]["health"]["current"] = target_hp
            changes.append(f"Scaled enemy HP from {current_hp} to {target_hp} (question_count={question_count})")

        battle_config = spec.setdefault("battle_config", {})

        # Speed threshold — never below 8s
        threshold = battle_config.get("speed_bonus_threshold_seconds", 5)
        if threshold < 8:
            battle_config["speed_bonus_threshold_seconds"] = 10
            changes.append(f"Raised speed threshold from {threshold}s to 10s (reading time)")

        # Player damage on wrong — cap at 8
        wrong_damage = battle_config.get("player_damage_on_wrong", 10)
        if wrong_damage > 8:
            battle_config["player_damage_on_wrong"] = 8
            changes.append(f"Reduced player damage on wrong from {wrong_damage} to 8 (student-friendly)")

        # Combo bonus — at least 30% of base
        base = battle_config.get("damage_per_correct", 10)
        combo = battle_config.get("bonus_damage_per_combo", 5)
        if combo < base * 0.3:
            new_combo = max(4, round(base * 0.4))
            battle_config["bonus_damage_per_combo"] = new_combo
            changes.append(f"Raised combo bonus from {combo} to {new_combo} (feels meaningful)")

        if changes:
            logger.info(f"Battle balance fixes applied: {changes}")

        return spec

    def _build_audit_prompt(self, spec: dict, auto_fix: bool) -> str:
        game_type = spec.get("meta", {}).get("game_type", "quiz")
        question_count = len(spec.get("content", {}).get("questions", []))

        mode = "AUDIT AND FIX" if auto_fix else "AUDIT ONLY (do not change the spec)"

        return f"""## Task: {mode}

Game type: {game_type}
Question count: {question_count}

## GameSpec to audit:
```json
{json.dumps(spec, indent=2)}
```

Review this spec for ALL mechanical issues. {"Fix every issue and return the corrected spec." if auto_fix else "List every issue but return the original spec unchanged as fixed_spec."}

Return the JSON object as specified in your instructions."""

    def _parse_response(self, response: str) -> dict:
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

        match = re.search(r'\{[\s\S]*\}', response)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

        raise ValueError(f"Could not parse mechanics agent response: {response[:300]}...")


# ─────────────────────────────────────────────
# Singleton
# ─────────────────────────────────────────────

_agent_instance = None


def get_mechanics_agent() -> GameMechanicsAgent:
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = GameMechanicsAgent()
    return _agent_instance
