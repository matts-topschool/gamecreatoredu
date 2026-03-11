"""
Design Agent - Visual consistency enforcer for GameCraft EDU.

Reads design_guidelines.json as its source of truth and audits React component
JSX/Tailwind code for brand violations. Returns corrected component code with
a detailed diff of every change made.

Also generates new UI elements (empty states, loading skeletons, error states)
that are guaranteed brand-compliant from the start.
"""
import os
import json
import logging
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# Load design guidelines at module init
# ─────────────────────────────────────────────

def _load_design_guidelines() -> dict:
    """Load the design_guidelines.json from the project root."""
    candidates = [
        Path(__file__).parent.parent.parent / "design_guidelines.json",
        Path(__file__).parent.parent / "design_guidelines.json",
        Path("design_guidelines.json"),
    ]
    for path in candidates:
        if path.exists():
            with open(path) as f:
                return json.load(f)
    logger.warning("design_guidelines.json not found — using embedded defaults")
    return {}


DESIGN_GUIDELINES = _load_design_guidelines()

DESIGN_SYSTEM_PROMPT = f"""You are a senior UI/UX engineer and brand system expert for GameCraft EDU.

## Your Design System (SOURCE OF TRUTH)
```json
{json.dumps(DESIGN_GUIDELINES, indent=2)}
```

## Tech Stack
- React with Tailwind CSS v3
- Shadcn UI (Radix primitives): Button, Card, Badge, Dialog, Input, Select, etc.
- Framer Motion for animations
- Lucide React for icons
- Font: Outfit (headings), Manrope (body) — loaded via Google Fonts

## Brand Rules You Must Enforce

### Colors
- Primary actions: `bg-violet-600 hover:bg-violet-700` (Creative Violet #7c3aed)
- Gamification/callouts: `text-orange-500` (Playful Orange #f97316)
- Progress/safe actions: `text-teal-400` (Growth Teal #2dd4bf)
- Backgrounds: light=`bg-slate-50`, dark=`bg-slate-900`
- NEVER use arbitrary hex colors when a Tailwind class exists

### Typography
- ALL headings: `font-outfit font-bold tracking-tight`
- Body text: `font-manrope` (or rely on body default if set in index.css)
- Interactive labels (buttons, tabs): `uppercase tracking-wide text-sm font-semibold`
- h1: `text-4xl md:text-6xl font-bold tracking-tight font-outfit`
- h2: `text-3xl md:text-4xl font-semibold tracking-tight font-outfit`
- h3: `text-2xl font-semibold font-outfit`

### Spacing
- Section padding: `p-6`, `p-8`, or `p-12` — never `p-1` or `p-2` for containers
- Card padding: `p-6` minimum
- Gap between cards: `gap-4` or `gap-6`

### Components
- Primary buttons: `bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6 font-semibold uppercase tracking-wide active:scale-95`
- Secondary buttons: `border-2 border-violet-600 text-violet-600 hover:bg-violet-50 rounded-full`
- Ghost buttons: `text-violet-600 hover:bg-violet-50`
- Cards: `rounded-2xl shadow-sm border border-slate-100` (light) or `bg-slate-800 border-slate-700 rounded-2xl` (dark)
- Badges: match semantic meaning (success=emerald, warning=amber, error=rose, info=sky)

### Theme Split
- Marketplace, Dashboard, Auth pages: LIGHT mode (`bg-slate-50`, dark text)
- Studio, Play/Game pages: DARK mode (`bg-slate-900`, light text, glows)

### Animations (Framer Motion)
- Page entrance: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}`
- Card hover: `whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(124, 58, 237, 0.15)" }}`
- Button click: `whileTap={{ scale: 0.95 }}`
- Staggered lists: `transition={{ delay: index * 0.05 }}`

### Empty States
- Always include: icon (Lucide, 48px, text-slate-300), heading, subtext, CTA button
- Pattern: centered flex column, `py-20 text-center`

### Loading Skeletons
- Use Shadcn `<Skeleton>` component
- Match the shape of the content being loaded exactly

### Error States
- Use rose-50 background, rose-600 icon, clear action button to retry

## Your job
When given a React component file, audit it against these rules and:
1. Fix every brand violation
2. Add missing empty states, loading states, or error states if the component fetches data
3. Add Framer Motion entrance animations if missing
4. Return the complete corrected file

## Output format
Return ONLY valid JSON:
{{
  "corrected_code": "full corrected JSX/React component as a string",
  "audit_report": {{
    "violations": [
      {{"line_hint": "approximate location", "severity": "high|medium|low", "issue": "what was wrong", "fix": "what was changed"}}
    ],
    "total_violations": 0,
    "compliance_score_before": 0,
    "compliance_score_after": 0,
    "summary": "one sentence"
  }}
}}

OUTPUT ONLY VALID JSON. NO OTHER TEXT."""


class DesignAgent:
    """
    Visual consistency agent for GameCraft EDU.

    Audits React component files against design_guidelines.json and returns
    corrected code with a full violation report.
    """

    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("EMERGENT_LLM_KEY")
        self.use_openai = bool(os.environ.get("OPENAI_API_KEY"))

        if not self.api_key:
            raise ValueError("No API key found. Set OPENAI_API_KEY or EMERGENT_LLM_KEY")

        logger.info("Design Agent initialized")

    def _get_chat(self, session_suffix: str = "") -> LlmChat:
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"design_agent_{session_suffix}_{id(self)}",
            system_message=DESIGN_SYSTEM_PROMPT
        )
        if self.use_openai:
            chat.with_model("openai", "gpt-5.1")
        else:
            chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
        return chat

    async def audit_component(self, component_code: str, component_name: str = "Component", page_context: str = "light") -> dict:
        """
        Audit a React component for design system violations.

        Args:
            component_code: Full JSX source of the component
            component_name: File/component name (for logging)
            page_context: "light" (Dashboard/Marketplace) or "dark" (Studio/Play)

        Returns:
            {
                "corrected_code": str,
                "audit_report": {
                    "violations": [...],
                    "total_violations": int,
                    "compliance_score_before": int,  # 0-100
                    "compliance_score_after": int,
                    "summary": str
                },
                "was_modified": bool
            }
        """
        logger.info(f"Design audit: {component_name} (context={page_context})")

        prompt = f"""## Audit Request: {component_name}
Page theme context: {page_context.upper()} MODE

## Component source:
```jsx
{component_code}
```

Audit this component against the design system. Fix all violations and return the corrected component."""

        chat = self._get_chat(component_name.replace("/", "_")[:30])

        try:
            response = await chat.send_message(UserMessage(text=prompt))
            result = self._parse_response(response)

            result["was_modified"] = (
                result.get("corrected_code", "").strip() != component_code.strip()
            )

            violations = result.get("audit_report", {}).get("total_violations", 0)
            logger.info(f"Design audit complete: {violations} violations, modified={result['was_modified']}")
            return result

        except Exception as e:
            logger.error(f"Design audit failed for {component_name}: {e}")
            return {
                "corrected_code": component_code,
                "audit_report": {
                    "violations": [],
                    "total_violations": 0,
                    "compliance_score_before": 50,
                    "compliance_score_after": 50,
                    "summary": f"Audit failed: {str(e)}"
                },
                "was_modified": False
            }

    async def generate_empty_state(self, context: str, page_context: str = "light") -> str:
        """
        Generate a brand-compliant empty state component.

        Args:
            context: Description of what is empty (e.g. "no games created yet")
            page_context: "light" or "dark"

        Returns:
            JSX string for the empty state component
        """
        prompt = f"""Generate a brand-compliant empty state JSX component for: "{context}"
Theme: {page_context.upper()} MODE

Requirements:
- Lucide React icon, 48px, muted color
- Heading with font-outfit
- Subtext explaining what to do
- CTA button using primary violet style
- Centered layout with py-20
- Framer Motion entrance animation

Return ONLY the JSX code as a string (no JSON wrapper needed for this request)."""

        chat = self._get_chat("empty_state")
        try:
            return await chat.send_message(UserMessage(text=prompt))
        except Exception as e:
            logger.error(f"Empty state generation failed: {e}")
            return ""

    async def generate_loading_skeleton(self, layout_description: str) -> str:
        """
        Generate a Shadcn Skeleton loading state matching the described layout.

        Args:
            layout_description: e.g. "a 3-column card grid with title and description"

        Returns:
            JSX string for the skeleton component
        """
        prompt = f"""Generate a loading skeleton JSX component for: "{layout_description}"

Requirements:
- Use Shadcn <Skeleton> component (import from '@/components/ui/skeleton')
- Match the described layout exactly — same structure, just skeleton placeholders
- Animate with the default Skeleton pulse animation (built-in)
- Brand-compliant spacing (gap-4/gap-6, p-6 cards, rounded-2xl)

Return ONLY the JSX code."""

        chat = self._get_chat("skeleton")
        try:
            return await chat.send_message(UserMessage(text=prompt))
        except Exception as e:
            logger.error(f"Skeleton generation failed: {e}")
            return ""

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

        raise ValueError(f"Could not parse design agent response: {response[:300]}...")


# ─────────────────────────────────────────────
# Singleton
# ─────────────────────────────────────────────

_agent_instance = None


def get_design_agent() -> DesignAgent:
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = DesignAgent()
    return _agent_instance
