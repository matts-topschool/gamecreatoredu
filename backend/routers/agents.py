"""
Agent Routes - Expose the Game Mechanics Agent, Design Agent, and Game Ideator Agent via REST API.

Endpoints:
  POST /agents/mechanics/audit       — Audit a GameSpec and get a report
  POST /agents/mechanics/fix         — Audit + fix a GameSpec, return corrected version
  POST /agents/mechanics/fix-battle  — Fast deterministic battle balance fix (no LLM)
  POST /agents/design/audit          — Audit a React component for brand violations
  POST /agents/design/empty-state    — Generate a brand-compliant empty state
  POST /agents/design/skeleton       — Generate a loading skeleton for a layout
  POST /agents/ideator/concept       — Generate a single game concept
  POST /agents/ideator/bulk          — Generate multiple concepts for same subject
  POST /agents/ideator/remix         — Remix/variation of an existing game
  POST /agents/ideator/unit          — Full themed collection for a curriculum unit
  POST /agents/ideator/trending      — High-novelty concepts for a grade band
  POST /agents/ideator/create-demo   — Create Fault Line (Ideator's top pick) for current user
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
import uuid
import logging
from datetime import datetime, timezone

from core.security import get_current_user
from core.database import get_games_collection
from models.game import generate_slug
from services.game_mechanics_agent import get_mechanics_agent
from services.design_agent import get_design_agent
from services.game_ideator_agent import get_ideator_agent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agents", tags=["Agents"])


# ─────────────────────────────────────────────
# Request / Response models
# ─────────────────────────────────────────────

class MechanicsAuditRequest(BaseModel):
    spec: dict = Field(..., description="The GameSpec JSON to audit")


class MechanicsFixRequest(BaseModel):
    spec: dict = Field(..., description="The GameSpec JSON to audit and fix")


class DesignAuditRequest(BaseModel):
    component_code: str = Field(..., description="Full JSX source of the React component")
    component_name: str = Field(default="Component", description="File or component name")
    page_context: str = Field(
        default="light",
        description="Theme context: 'light' (Dashboard/Marketplace) or 'dark' (Studio/Play)"
    )


class EmptyStateRequest(BaseModel):
    context: str = Field(..., description="What is empty, e.g. 'no games created yet'")
    page_context: str = Field(default="light", description="'light' or 'dark'")


class SkeletonRequest(BaseModel):
    layout_description: str = Field(
        ...,
        description="Layout to match, e.g. '3-column card grid with title and description'"
    )


# ─────────────────────────────────────────────
# Mechanics Agent routes
# ─────────────────────────────────────────────

@router.post("/mechanics/audit")
async def audit_mechanics(
    request: MechanicsAuditRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Audit a GameSpec for mechanical problems.
    Returns a detailed report but does NOT modify the spec.
    """
    try:
        agent = get_mechanics_agent()
        report = await agent.audit_only(request.spec)
        return {
            "success": True,
            "audit_report": report
        }
    except Exception as e:
        logger.error(f"Mechanics audit failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Mechanics audit failed: {str(e)}"
        )


@router.post("/mechanics/fix")
async def fix_mechanics(
    request: MechanicsFixRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Audit a GameSpec and return a corrected version with a full change report.
    Use this when a teacher wants to review suggested fixes before accepting them.
    """
    try:
        agent = get_mechanics_agent()
        result = await agent.audit_and_fix(request.spec, auto_fix=True)
        return {
            "success": True,
            "fixed_spec": result["fixed_spec"],
            "audit_report": result["audit_report"],
            "was_modified": result["was_modified"]
        }
    except Exception as e:
        logger.error(f"Mechanics fix failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Mechanics fix failed: {str(e)}"
        )


@router.post("/mechanics/fix-battle")
async def fix_battle_balance(
    request: MechanicsFixRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Fast deterministic battle balance fix — no LLM, instant response.
    Applies known-good rules: HP scaling, speed threshold, player damage cap, combo tuning.
    Use this for quick fixes during game creation without waiting for a full AI audit.
    """
    try:
        agent = get_mechanics_agent()
        fixed_spec = await agent.fix_battle_balance(request.spec)
        return {
            "success": True,
            "fixed_spec": fixed_spec
        }
    except Exception as e:
        logger.error(f"Battle balance fix failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Battle balance fix failed: {str(e)}"
        )


# ─────────────────────────────────────────────
# Design Agent routes
# ─────────────────────────────────────────────

@router.post("/design/audit")
async def audit_design(
    request: DesignAuditRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Audit a React component for design system violations.
    Returns corrected JSX and a violation report.
    """
    try:
        agent = get_design_agent()
        result = await agent.audit_component(
            component_code=request.component_code,
            component_name=request.component_name,
            page_context=request.page_context
        )
        return {
            "success": True,
            "corrected_code": result["corrected_code"],
            "audit_report": result["audit_report"],
            "was_modified": result["was_modified"]
        }
    except Exception as e:
        logger.error(f"Design audit failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Design audit failed: {str(e)}"
        )


@router.post("/design/empty-state")
async def generate_empty_state(
    request: EmptyStateRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a brand-compliant empty state JSX component.
    """
    try:
        agent = get_design_agent()
        jsx = await agent.generate_empty_state(
            context=request.context,
            page_context=request.page_context
        )
        return {
            "success": True,
            "jsx": jsx
        }
    except Exception as e:
        logger.error(f"Empty state generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Empty state generation failed: {str(e)}"
        )


@router.post("/design/skeleton")
async def generate_skeleton(
    request: SkeletonRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a Shadcn Skeleton loading state matching the described layout.
    """
    try:
        agent = get_design_agent()
        jsx = await agent.generate_loading_skeleton(request.layout_description)
        return {
            "success": True,
            "jsx": jsx
        }
    except Exception as e:
        logger.error(f"Skeleton generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Skeleton generation failed: {str(e)}"
        )


# ─────────────────────────────────────────────
# Ideator Agent request models
# ─────────────────────────────────────────────

class IdeatorConceptRequest(BaseModel):
    subject: str = Field(..., description="e.g. 'fractions', 'World War 2', 'photosynthesis'")
    grade_levels: List[int] = Field(..., description="e.g. [4, 5]")
    learning_objective: Optional[str] = Field(None, description="Specific skill to teach")
    game_type: Optional[str] = Field(None, description="Preferred game type, or omit to let agent choose")
    tone: Optional[str] = Field(None, description="e.g. 'spooky', 'funny', 'epic', 'cute'")
    avoid_themes: Optional[List[str]] = Field(None, description="Themes to skip")


class IdeatorBulkRequest(BaseModel):
    subject: str = Field(...)
    grade_levels: List[int] = Field(...)
    count: int = Field(default=5, ge=2, le=8, description="Number of distinct concepts")
    game_types: Optional[List[str]] = Field(None, description="Generate one per type if specified")


class IdeatorRemixRequest(BaseModel):
    existing_spec: dict = Field(..., description="The GameSpec to remix")
    remix_direction: str = Field(..., description="e.g. 'make harder for advanced students'")


class IdeatorUnitRequest(BaseModel):
    unit_topic: str = Field(..., description="e.g. 'Ancient Egypt', 'The Water Cycle'")
    grade_levels: List[int] = Field(...)
    num_games: int = Field(default=5, ge=3, le=7)
    duration_weeks: Optional[int] = Field(None, description="How many weeks the unit covers")


class IdeatorTrendingRequest(BaseModel):
    grade_band: str = Field(..., description="'K-2', '3-5', '6-8', or '9-12'")
    subject: Optional[str] = Field(None)
    count: int = Field(default=6, ge=2, le=8)


# ─────────────────────────────────────────────
# Ideator Agent routes
# ─────────────────────────────────────────────

@router.post("/ideator/concept")
async def generate_concept(
    request: IdeatorConceptRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a single game concept for a given subject and grade level.
    Returns a full CONCEPT BRIEF with narrative hook, mechanics, engagement patterns, and sample questions.
    """
    try:
        agent = get_ideator_agent()
        concept = await agent.generate_concept(
            subject=request.subject,
            grade_levels=request.grade_levels,
            learning_objective=request.learning_objective,
            game_type=request.game_type,
            tone=request.tone,
            avoid_themes=request.avoid_themes
        )
        return {"success": True, "concept": concept}
    except Exception as e:
        logger.error(f"Concept generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Concept generation failed: {str(e)}"
        )


@router.post("/ideator/bulk")
async def generate_bulk_concepts(
    request: IdeatorBulkRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate multiple distinct concepts for the same subject.
    Useful for showing teachers a variety of options before they commit to one.
    """
    try:
        agent = get_ideator_agent()
        concepts = await agent.generate_bulk_concepts(
            subject=request.subject,
            grade_levels=request.grade_levels,
            count=request.count,
            game_types=request.game_types
        )
        return {"success": True, "concepts": concepts, "count": len(concepts)}
    except Exception as e:
        logger.error(f"Bulk concept generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bulk concept generation failed: {str(e)}"
        )


@router.post("/ideator/remix")
async def remix_game(
    request: IdeatorRemixRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a remix or variation of an existing game.
    Returns a REMIX BRIEF showing what changed and why it adds value.
    """
    try:
        agent = get_ideator_agent()
        remix = await agent.remix_game(
            existing_spec=request.existing_spec,
            remix_direction=request.remix_direction
        )
        return {"success": True, "remix": remix}
    except Exception as e:
        logger.error(f"Remix generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Remix generation failed: {str(e)}"
        )


@router.post("/ideator/unit")
async def generate_unit_collection(
    request: IdeatorUnitRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a themed collection of games covering an entire curriculum unit.
    Returns a THEMED COLLECTION with progression order and how games build on each other.
    """
    try:
        agent = get_ideator_agent()
        collection = await agent.generate_unit_collection(
            unit_topic=request.unit_topic,
            grade_levels=request.grade_levels,
            num_games=request.num_games,
            duration_weeks=request.duration_weeks
        )
        return {"success": True, "collection": collection}
    except Exception as e:
        logger.error(f"Unit collection generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unit collection generation failed: {str(e)}"
        )


@router.post("/ideator/trending")
async def suggest_trending_concepts(
    request: IdeatorTrendingRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate high-novelty game concepts based on what engages a specific grade band.
    Draws on current trends, pop culture, and age-appropriate interests.
    """
    try:
        agent = get_ideator_agent()
        concepts = await agent.suggest_trending_concepts(
            grade_band=request.grade_band,
            subject=request.subject,
            count=request.count
        )
        return {"success": True, "concepts": concepts, "count": len(concepts)}
    except Exception as e:
        logger.error(f"Trending concepts generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Trending concepts generation failed: {str(e)}"
        )


# ─────────────────────────────────────────────
# Fault Line — Ideator's Favourite Demo Game
# ─────────────────────────────────────────────

FAULT_LINE_SPEC = {
    "version": "2.0",
    "meta": {
        "title": "Fault Line",
        "description": "Logical fallacies have taken physical form as geological monsters. You're a Geological Linguist — identify the flawed argument to defeat each creature before the volcano erupts.",
        "game_type": "battle",
        "educational": {
            "grade_levels": [7, 8, 9, 10],
            "subjects": ["ELA", "Critical Thinking", "Media Literacy"],
            "learning_objectives": [
                "Identify and name common logical fallacies by their defining features",
                "Evaluate the strength of evidence in arguments",
                "Distinguish between valid inference and emotional or rhetorical manipulation",
                "Apply critical reasoning to real-world text sources (news, ads, social media)"
            ]
        },
        "gameplay": {"estimated_duration_minutes": 20, "difficulty": 3}
    },
    "entities": {
        "player": {
            "id": "hero", "name": "Logic Engineer", "character": "Scientist",
            "health": {"max": 100, "current": 100}, "attack": {"base_damage": 10}
        },
        "enemy": {
            "id": "boss",
            "name": "The Sophist Colossus",
            "description": "A towering figure made of crumbling arguments and half-truths, rising from the volcanic fault lines where logic fails. Every flaw you expose cracks its stone form.",
            "health": {"max": 160, "current": 160},
            "weakness": "Naming the fallacy and exposing WHY it fails",
            "taunt_messages": [
                "Everyone agrees I'm right — so I must be!",
                "You can't disprove me, therefore I'm correct.",
                "My opponent is clearly biased, so ignore their data.",
                "This has always been done this way. Why change?",
                "If you question me, bad things will happen to everyone."
            ],
            "taunt_messages_low_hp": [
                "W-wait... my argument is still valid! The people LOVE it!",
                "You're only winning because you got lucky — this proves nothing!",
                "Fine, but this one thing I said WAS true, so the rest must be too!",
                "My source is very credible! He has over 10,000 followers!"
            ],
            "defeat_message": "Impossible... my arguments were so CONFIDENT. How can confidence be wrong?!"
        }
    },
    "battle_config": {
        "damage_per_correct": 10,
        "bonus_damage_per_combo": 4,
        "speed_bonus_threshold_seconds": 15,
        "speed_bonus_damage": 5,
        "player_damage_on_wrong": 20
    },
    "content": {
        "questions": [
            {
                "id": "q1", "type": "multiple_choice", "difficulty": 1,
                "stem": "A student says: 'Dr. Patel's research on climate change can't be trusted — she drives a gas-powered car.' What logical fallacy is being used here?",
                "options": [
                    {"id": "a", "text": "Ad Hominem — attacking the person's character or behavior instead of their argument", "is_correct": True},
                    {"id": "b", "text": "Straw Man — misrepresenting someone's argument to make it easier to attack", "is_correct": False},
                    {"id": "c", "text": "False Dilemma — presenting only two options when more exist", "is_correct": False},
                    {"id": "d", "text": "Appeal to Authority — relying on an expert's opinion without supporting evidence", "is_correct": False}
                ],
                "explanation": "Ad Hominem means 'against the person.' Dr. Patel's car has nothing to do with whether her research methodology is sound. To disprove her findings you'd need to show flaws in her data or methods — not her personal lifestyle.",
                "hints": ["The attack is directed at who the person IS, not what their argument says."]
            },
            {
                "id": "q2", "type": "multiple_choice", "difficulty": 1,
                "stem": "An ad claims: '4 out of 5 dentists recommend BrightSmile toothpaste.' What critical question MOST exposes the weakness of this evidence?",
                "options": [
                    {"id": "a", "text": "Which country were the dentists from?", "is_correct": False},
                    {"id": "b", "text": "What were the dentists actually asked, and what were the other options they could choose?", "is_correct": True},
                    {"id": "c", "text": "Is BrightSmile toothpaste more expensive than competitors?", "is_correct": False},
                    {"id": "d", "text": "Do the dentists personally use BrightSmile themselves?", "is_correct": False}
                ],
                "explanation": "The survey question matters enormously. Without knowing the question wording and the full range of choices, '4 out of 5' tells us almost nothing meaningful.",
                "hints": ["Think about what information is missing that would change how you interpret this statistic."]
            },
            {
                "id": "q3", "type": "multiple_choice", "difficulty": 2,
                "stem": "A politician argues: 'We must either ban all social media or accept that teenagers will be completely addicted to their phones forever.' What is wrong with this argument?",
                "options": [
                    {"id": "a", "text": "It uses emotional language to manipulate the audience", "is_correct": False},
                    {"id": "b", "text": "It attacks people who use social media instead of addressing the real issue", "is_correct": False},
                    {"id": "c", "text": "It presents only two extreme options while ignoring the many possible solutions in between", "is_correct": True},
                    {"id": "d", "text": "It draws on the popularity of an idea rather than its merits", "is_correct": False}
                ],
                "explanation": "This is a False Dilemma. The real world offers dozens of middle-ground options: regulation, age limits, digital literacy education, parental controls, and more.",
                "hints": ["Count the options being offered. Are those really the only two possibilities?"]
            },
            {
                "id": "q4", "type": "multiple_choice", "difficulty": 2,
                "stem": "A classmate says: 'Mrs. Rivera argued that we should read more challenging books. But she obviously just wants to make our lives harder and doesn't care about us.' What fallacy has your classmate committed?",
                "options": [
                    {"id": "a", "text": "Circular Reasoning — using the conclusion as evidence for itself", "is_correct": False},
                    {"id": "b", "text": "Straw Man — misrepresenting Mrs. Rivera's actual argument to make it easier to dismiss", "is_correct": True},
                    {"id": "c", "text": "Hasty Generalization — drawing a broad conclusion from a single example", "is_correct": False},
                    {"id": "d", "text": "Slippery Slope — claiming one action will lead to extreme unintended consequences", "is_correct": False}
                ],
                "explanation": "A Straw Man doesn't engage with what was actually said; it invents a weaker, easier-to-attack version to knock down.",
                "hints": ["Is your classmate responding to what Mrs. Rivera actually said, or to a version of it they invented?"]
            },
            {
                "id": "q5", "type": "multiple_choice", "difficulty": 2,
                "stem": "An article argues: 'Ice cream sales increase during summer, and drowning rates also increase during summer. Therefore, eating ice cream causes drowning.' What is the critical flaw?",
                "options": [
                    {"id": "a", "text": "The argument uses an unreliable source for its statistics", "is_correct": False},
                    {"id": "b", "text": "The argument confuses correlation with causation — two things happening together does not mean one causes the other", "is_correct": True},
                    {"id": "c", "text": "The argument commits an Ad Hominem by attacking people who eat ice cream", "is_correct": False},
                    {"id": "d", "text": "The argument uses circular reasoning by assuming the conclusion in the premise", "is_correct": False}
                ],
                "explanation": "Both increase in summer because of a third factor: hot weather. This 'confounding variable' shows that correlation is not causation — one of the most dangerous reasoning errors in science and public policy.",
                "hints": ["Is there a third factor that could cause BOTH things to happen at the same time?"]
            },
            {
                "id": "q6", "type": "multiple_choice", "difficulty": 3,
                "stem": "A post reads: 'Millions of people believe the vaccine causes autism. When MILLIONS believe something, can they all be wrong?' What fallacy does this rely on?",
                "options": [
                    {"id": "a", "text": "Appeal to Nature — claiming something is good because it is natural", "is_correct": False},
                    {"id": "b", "text": "Appeal to Popularity (Bandwagon) — using widespread belief as evidence for truth", "is_correct": True},
                    {"id": "c", "text": "False Cause — incorrectly identifying one event as the cause of another", "is_correct": False},
                    {"id": "d", "text": "Anecdotal Evidence — drawing broad conclusions from personal stories", "is_correct": False}
                ],
                "explanation": "Yes, millions can be wrong. Billions once believed the Earth was flat. Popularity is not the same as truth. The only way to evaluate vaccine claims is through rigorous peer-reviewed studies — which overwhelmingly show no link.",
                "hints": ["Think of a historical example where most people believed something that turned out to be false."]
            },
            {
                "id": "q7", "type": "multiple_choice", "difficulty": 3,
                "stem": "A debate opponent says: 'If we allow students to choose their essay topics, next they'll want to choose their grades, then graduation requirements — and the academic system will collapse.' This is an example of:",
                "options": [
                    {"id": "a", "text": "Hasty Generalization — drawing a conclusion from too few examples", "is_correct": False},
                    {"id": "b", "text": "Appeal to Tradition — arguing something is correct because it has always been done that way", "is_correct": False},
                    {"id": "c", "text": "Slippery Slope — claiming a reasonable action will inevitably lead to extreme, unrelated consequences", "is_correct": True},
                    {"id": "d", "text": "Straw Man — replacing the original argument with a weaker version", "is_correct": False}
                ],
                "explanation": "A Slippery Slope chains increasingly extreme consequences without showing WHY each step would actually occur. Each step in the chain requires independent evidence.",
                "hints": ["Does the argument actually show HOW each step in the chain follows from the one before it?"]
            },
            {
                "id": "q8", "type": "multiple_choice", "difficulty": 3,
                "stem": "A critic says: 'The only study showing year-round school improves performance was funded by a company that sells school air conditioning units.' Which response BEST evaluates this criticism?",
                "options": [
                    {"id": "a", "text": "The critic is right — any study with a conflict of interest is automatically invalid", "is_correct": False},
                    {"id": "b", "text": "The critic raises a legitimate concern about bias, but the study's specific methods and data still need to be examined to determine its validity", "is_correct": True},
                    {"id": "c", "text": "The critic is wrong — scientists always report data honestly regardless of who funds them", "is_correct": False},
                    {"id": "d", "text": "The argument is a Slippery Slope because it assumes the funding affects the results", "is_correct": False}
                ],
                "explanation": "Funding source is a flag for potential bias, but doesn't automatically invalidate research. The right response is to examine methodology, sample size, and peer review. Critical thinkers investigate; they don't just reject.",
                "hints": ["What's the difference between a reason to be suspicious of a source and proof that a source is wrong?"]
            },
            {
                "id": "q9", "type": "multiple_choice", "difficulty": 3,
                "stem": "A news headline reads: 'EXPERTS SAY: New superfood cures cancer!' What two pieces of information are MOST critical to evaluate before accepting this claim?",
                "options": [
                    {"id": "a", "text": "The name of the superfood and whether it tastes good", "is_correct": False},
                    {"id": "b", "text": "Who the experts are, what they actually said, and whether peer-reviewed studies support the claim", "is_correct": True},
                    {"id": "c", "text": "How many people shared the article on social media", "is_correct": False},
                    {"id": "d", "text": "Whether the article was published recently and has colorful graphics", "is_correct": False}
                ],
                "explanation": "'Experts say' is vague. A headline can compress 'may show some promise in early mouse trials' into 'CURES CANCER.' Trace the claim to its primary source — the actual study, its methodology, and peer-review status.",
                "hints": ["Headlines often simplify or exaggerate. What would the original scientific paper actually say?"]
            },
            {
                "id": "q10", "type": "multiple_choice", "difficulty": 3,
                "stem": "A classmate argues: 'You can't criticize how our school handles bullying — you've never been a school principal. You don't know what it's like.' What is the flaw?",
                "options": [
                    {"id": "a", "text": "It is an Appeal to Authority because it requires the arguer to be an authority figure", "is_correct": False},
                    {"id": "b", "text": "It confuses lived experience with logical argument — you don't need to hold a position to evaluate the reasoning behind its policies", "is_correct": True},
                    {"id": "c", "text": "It is a Straw Man because it misrepresents the criticism about bullying", "is_correct": False},
                    {"id": "d", "text": "It is Circular Reasoning because it uses the principal's role to prove the principal is right", "is_correct": False}
                ],
                "explanation": "This is Ad Hominem Gatekeeping. Arguments are evaluated on logic and evidence, not the identity of who makes them. Otherwise, only principals could criticize principals — making accountability impossible.",
                "hints": ["Does the quality of an argument actually depend on who is making it?"]
            },
            {
                "id": "q11", "type": "multiple_choice", "difficulty": 4,
                "stem": "An influencer posts: 'I switched to a plant-based diet and my energy doubled, my skin cleared up, and I lost 20 pounds. You should try it too!' What type of evidence is this, and why is it the WEAKEST form for a health recommendation?",
                "options": [
                    {"id": "a", "text": "Survey data — reliable but limited to self-reporting", "is_correct": False},
                    {"id": "b", "text": "Correlation — shows two things happened together but not why", "is_correct": False},
                    {"id": "c", "text": "Anecdotal evidence — a single personal story cannot account for individual variation, placebo effect, or other lifestyle changes made at the same time", "is_correct": True},
                    {"id": "d", "text": "Expert testimony — valid only if the influencer has medical credentials", "is_correct": False}
                ],
                "explanation": "Anecdotal evidence is a personal story (n=1). Strong evidence requires large sample sizes, control groups, and replicated results across diverse populations.",
                "hints": ["What other variables might have changed at the same time as the diet?"]
            },
            {
                "id": "q12", "type": "multiple_choice", "difficulty": 4,
                "stem": "A politician says: 'My opponent wants to reduce the military budget. Clearly, she doesn't care about protecting our country.' This argument is MOST guilty of which error?",
                "options": [
                    {"id": "a", "text": "Circular Reasoning — assuming the conclusion is already true in the premise", "is_correct": False},
                    {"id": "b", "text": "False Cause — claiming the budget reduction would cause the country to be unprotected", "is_correct": False},
                    {"id": "c", "text": "Straw Man combined with false inference about motive — reframing a policy position as a moral failing without evidence", "is_correct": True},
                    {"id": "d", "text": "Hasty Generalization — inferring that all politicians who reduce budgets are unpatriotic", "is_correct": False}
                ],
                "explanation": "The politician replaced a debatable policy position with an invented motive. This combines Straw Man (misrepresenting the position) with Ad Hominem (attacking character). Neither engages with the actual policy argument.",
                "hints": ["What is the actual policy position? What has the politician turned it into instead?"]
            },
            {
                "id": "q13", "type": "multiple_choice", "difficulty": 4,
                "stem": "A company claims its AI hiring tool is unbiased because 'it was built using objective data, and data can't be biased.' Identify the most significant flaw in this claim.",
                "options": [
                    {"id": "a", "text": "The claim is an Appeal to Novelty — arguing the tool is good because it is new technology", "is_correct": False},
                    {"id": "b", "text": "Data reflects the biases present when it was collected — training data from historically biased hiring decisions will encode and replicate those biases in the model", "is_correct": True},
                    {"id": "c", "text": "The claim is a Slippery Slope because hiring tools will eventually replace all human workers", "is_correct": False},
                    {"id": "d", "text": "The claim uses circular reasoning by assuming the tool is objective because it uses data", "is_correct": False}
                ],
                "explanation": "Data is a record of human decisions — and human decisions can be systematically biased. 'Objective' describes the process of collection, not whether the underlying decisions were fair. Algorithmic bias is one of the most important critical thinking topics of our era.",
                "hints": ["Who created the data this tool was trained on, and what were their biases?"]
            },
            {
                "id": "q14", "type": "multiple_choice", "difficulty": 4,
                "stem": "A classmate argues: 'We should trust our school's dress code — it's been in place for 30 years, and tradition means it must work.' What fallacy is being used, and what would a STRONGER argument look like?",
                "options": [
                    {"id": "a", "text": "Appeal to Tradition — the fallacy; a stronger argument would cite specific outcomes the dress code has achieved (e.g., reduced bullying incidents, improved focus data)", "is_correct": True},
                    {"id": "b", "text": "Hasty Generalization — the fallacy; a stronger argument would give more examples of successful dress codes", "is_correct": False},
                    {"id": "c", "text": "False Dilemma — the fallacy; a stronger argument would acknowledge other options besides having or not having a dress code", "is_correct": False},
                    {"id": "d", "text": "Appeal to Authority — the fallacy; a stronger argument would find education experts who support dress codes", "is_correct": False}
                ],
                "explanation": "Appeal to Tradition argues that longevity equals validity. A stronger argument requires evidence of actual outcomes. The age of a policy tells you only how old it is, not whether it works.",
                "hints": ["Does something being done for a long time prove it's effective? What would actually prove that?"]
            },
            {
                "id": "q15", "type": "multiple_choice", "difficulty": 5,
                "stem": "BOSS ROUND: A viral post argues: 'Scientists keep changing their minds — first eggs were bad, then good. So scientists don't know anything, and we should trust our instincts instead.' Identify ALL the reasoning errors.",
                "options": [
                    {"id": "a", "text": "Hasty Generalization only — the person drew a broad conclusion from two examples", "is_correct": False},
                    {"id": "b", "text": "The argument commits a Hasty Generalization, misrepresents how science works (updating based on new evidence IS the system working correctly), and creates a False Dilemma (science vs. instinct are not the only options)", "is_correct": True},
                    {"id": "c", "text": "Appeal to Nature only — the argument suggests natural instincts are more reliable than science", "is_correct": False},
                    {"id": "d", "text": "Straw Man only — the argument misrepresents what scientists actually claim about eggs", "is_correct": False}
                ],
                "explanation": "Multi-layered fallacy: (1) Hasty Generalization — two examples don't represent all science. (2) Misunderstanding science — revising conclusions when new evidence emerges IS the process working correctly. (3) False Dilemma — the alternative to 'trust scientists perfectly' isn't 'trust only your instincts.'",
                "hints": ["Is 'scientists changed their minds' evidence that scientists are wrong? What does it actually show about scientific method?"]
            }
        ]
    },
    "settings": {
        "allow_hints": True,
        "shuffle_questions": True,
        "show_explanation": True,
        "leaderboard": {"enabled": True, "type": "score"}
    }
}


@router.post("/ideator/create-demo")
async def create_fault_line_demo(
    current_user: dict = Depends(get_current_user)
):
    """
    Create the Game Ideator Agent's top pick — 'Fault Line' — as a playable game
    for the current user. The spec is pre-built (no LLM wait).

    Returns the game ID and slug for immediate play or editing.
    """
    try:
        games = get_games_collection()

        # Check if this user already has Fault Line
        existing = await games.find_one({
            "owner_id": current_user["id"],
            "title": "Fault Line"
        })
        if existing:
            return {
                "success": True,
                "already_existed": True,
                "game_id": existing.get("id"),
                "slug": existing.get("slug"),
                "message": "Fault Line is already in your library."
            }

        game_id = str(uuid.uuid4())
        slug = generate_slug("Fault Line")
        now = datetime.now(timezone.utc).isoformat()

        doc = {
            "id": game_id,
            "owner_id": current_user["id"],
            "title": "Fault Line",
            "description": "Logical fallacies have taken physical form as geological monsters. Identify the flawed argument to defeat each creature before the volcano erupts. Grades 7–10 | ELA & Critical Thinking.",
            "slug": slug,
            "thumbnail_url": None,
            "spec": FAULT_LINE_SPEC,
            "spec_version": 1,
            "status": "published",
            "visibility": "public",
            "is_marketplace_listed": False,
            "price_cents": 0,
            "license_type": "single",
            "forked_from_id": None,
            "is_forked": False,
            "allow_derivative_sales": False,
            "grade_levels": [7, 8, 9, 10],
            "subjects": ["ELA", "Critical Thinking", "Media Literacy"],
            "standards_tags": [],
            "language": "en-US",
            "play_count": 0,
            "avg_rating": 0.0,
            "created_at": now,
            "updated_at": now,
            "published_at": now
        }

        await games.insert_one(doc)
        logger.info(f"Fault Line created for user {current_user['id']}: {game_id}")

        return {
            "success": True,
            "already_existed": False,
            "game_id": game_id,
            "slug": slug,
            "message": "Fault Line created successfully! 15 questions on logical fallacies, grades 7-10."
        }
    except Exception as e:
        logger.error(f"Fault Line demo creation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Demo creation failed: {str(e)}"
        )
