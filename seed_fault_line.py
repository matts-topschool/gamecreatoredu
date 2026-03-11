"""
Standalone seed script: Insert Fault Line into MongoDB.

Usage:
    python seed_fault_line.py [MONGO_URL] [DB_NAME]

Defaults:
    MONGO_URL = mongodb://localhost:27017
    DB_NAME   = gamecraft_edu

Or set environment variables MONGO_URL and DB_NAME.
"""
import sys
import uuid
import re
import os
from datetime import datetime, timezone
from pymongo import MongoClient

MONGO_URL = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME   = sys.argv[2] if len(sys.argv) > 2 else os.environ.get("DB_NAME", "gamecraft_edu")

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
        "gameplay": {
            "estimated_duration_minutes": 20,
            "difficulty": 3
        }
    },
    "entities": {
        "player": {
            "id": "hero",
            "name": "Logic Engineer",
            "character": "Scientist",
            "health": {"max": 100, "current": 100},
            "attack": {"base_damage": 10}
        },
        "enemy": {
            "id": "boss",
            "name": "The Sophist Colossus",
            "description": "A towering figure made of crumbling arguments and half-truths, rising from the volcanic fault lines where logic fails. It speaks in silver tongues and hollow reasoning — but every flaw you expose cracks its stone form.",
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
                "id": "q1",
                "type": "multiple_choice",
                "stem": "A student says: 'Dr. Patel's research on climate change can't be trusted — she drives a gas-powered car.' What logical fallacy is being used here?",
                "options": [
                    {"id": "a", "text": "Ad Hominem — attacking the person's character or behavior instead of their argument", "is_correct": True},
                    {"id": "b", "text": "Straw Man — misrepresenting someone's argument to make it easier to attack", "is_correct": False},
                    {"id": "c", "text": "False Dilemma — presenting only two options when more exist", "is_correct": False},
                    {"id": "d", "text": "Appeal to Authority — relying on an expert's opinion without supporting evidence", "is_correct": False}
                ],
                "explanation": "Ad Hominem means 'against the person.' Dr. Patel's car has nothing to do with whether her research methodology is sound. To actually disprove her findings, you'd need to show flaws in her data, methods, or reasoning — not her personal lifestyle choices.",
                "difficulty": 1,
                "hints": ["The attack is directed at who the person IS, not what their argument says."]
            },
            {
                "id": "q2",
                "type": "multiple_choice",
                "stem": "An ad claims: '4 out of 5 dentists recommend BrightSmile toothpaste.' What critical question MOST exposes the weakness of this evidence?",
                "options": [
                    {"id": "a", "text": "Which country were the dentists from?", "is_correct": False},
                    {"id": "b", "text": "What were the dentists actually asked, and what were the other options they could choose?", "is_correct": True},
                    {"id": "c", "text": "Is BrightSmile toothpaste more expensive than competitors?", "is_correct": False},
                    {"id": "d", "text": "Do the dentists personally use BrightSmile themselves?", "is_correct": False}
                ],
                "explanation": "The survey question matters enormously. Dentists may have been asked 'Do you recommend fluoride toothpaste?' and BrightSmile was simply one of many acceptable answers. Without knowing the question wording and the full range of choices, '4 out of 5' tells us almost nothing meaningful.",
                "difficulty": 1,
                "hints": ["Think about what information is missing that would change how you interpret this statistic."]
            },
            {
                "id": "q3",
                "type": "multiple_choice",
                "stem": "A politician argues: 'We must either ban all social media or accept that teenagers will be completely addicted to their phones forever.' What is wrong with this argument?",
                "options": [
                    {"id": "a", "text": "It uses emotional language to manipulate the audience", "is_correct": False},
                    {"id": "b", "text": "It attacks people who use social media instead of addressing the real issue", "is_correct": False},
                    {"id": "c", "text": "It presents only two extreme options while ignoring the many possible solutions in between", "is_correct": True},
                    {"id": "d", "text": "It draws on the popularity of an idea rather than its merits", "is_correct": False}
                ],
                "explanation": "This is a False Dilemma (also called False Dichotomy). The real world offers dozens of middle-ground options: regulation, age limits, screen time guidelines, digital literacy education, parental controls, and more. Forcing a choice between two extremes prevents careful thinking about realistic alternatives.",
                "difficulty": 2,
                "hints": ["Count the options being offered. Are those really the only two possibilities?"]
            },
            {
                "id": "q4",
                "type": "multiple_choice",
                "stem": "A classmate says: 'Mrs. Rivera argued that we should read more challenging books. But she obviously just wants to make our lives harder and doesn't care about us.' What fallacy has your classmate committed?",
                "options": [
                    {"id": "a", "text": "Circular Reasoning — using the conclusion as evidence for itself", "is_correct": False},
                    {"id": "b", "text": "Straw Man — misrepresenting Mrs. Rivera's actual argument to make it easier to dismiss", "is_correct": True},
                    {"id": "c", "text": "Hasty Generalization — drawing a broad conclusion from a single example", "is_correct": False},
                    {"id": "d", "text": "Slippery Slope — claiming one action will lead to extreme unintended consequences", "is_correct": False}
                ],
                "explanation": "Mrs. Rivera's actual argument is that challenging books build reading skills. Your classmate has replaced that argument with a distorted, easy-to-attack version. A Straw Man doesn't engage with what was actually said; it invents a weaker version to knock down.",
                "difficulty": 2,
                "hints": ["Is your classmate responding to what Mrs. Rivera actually said, or to a version of it they invented?"]
            },
            {
                "id": "q5",
                "type": "multiple_choice",
                "stem": "An article argues: 'Ice cream sales increase during summer, and drowning rates also increase during summer. Therefore, eating ice cream causes drowning.' What is the critical flaw in this reasoning?",
                "options": [
                    {"id": "a", "text": "The argument uses an unreliable source for its statistics", "is_correct": False},
                    {"id": "b", "text": "The argument commits an Ad Hominem by attacking people who eat ice cream", "is_correct": False},
                    {"id": "c", "text": "The argument confuses correlation with causation — two things happening together does not mean one causes the other", "is_correct": True},
                    {"id": "d", "text": "The argument uses circular reasoning by assuming the conclusion in the premise", "is_correct": False}
                ],
                "explanation": "Both ice cream sales and drowning increase in summer because of a THIRD factor: hot weather. This is called a 'confounding variable.' Correlation (two things moving together) is not causation (one thing causing the other). This confusion is one of the most dangerous reasoning errors in science and public policy.",
                "difficulty": 2,
                "hints": ["Is there a third factor that could cause BOTH things to happen at the same time?"]
            },
            {
                "id": "q6",
                "type": "multiple_choice",
                "stem": "A social media post reads: 'Millions of people believe the vaccine causes autism. When MILLIONS of people believe something, can they all be wrong?' What fallacy does this rely on?",
                "options": [
                    {"id": "a", "text": "Appeal to Nature — claiming something is good because it is natural", "is_correct": False},
                    {"id": "b", "text": "Appeal to Popularity (Bandwagon) — using widespread belief as evidence for truth", "is_correct": True},
                    {"id": "c", "text": "False Cause — incorrectly identifying one event as the cause of another", "is_correct": False},
                    {"id": "d", "text": "Anecdotal Evidence — drawing broad conclusions from personal stories", "is_correct": False}
                ],
                "explanation": "Yes, millions of people can be wrong — and history proves it. Popularity is not the same as truth. The only way to evaluate whether vaccines cause autism is through rigorous, peer-reviewed scientific studies — which overwhelmingly show no link.",
                "difficulty": 3,
                "hints": ["Think of a historical example where most people believed something that turned out to be false."]
            },
            {
                "id": "q7",
                "type": "multiple_choice",
                "stem": "A debate opponent says: 'If we allow students to choose their own essay topics, next they'll want to choose their own grades, then their own graduation requirements — and soon the entire academic system will collapse.' This is an example of:",
                "options": [
                    {"id": "a", "text": "Hasty Generalization — drawing a conclusion from too few examples", "is_correct": False},
                    {"id": "b", "text": "Appeal to Tradition — arguing something is correct because it has always been done that way", "is_correct": False},
                    {"id": "c", "text": "Slippery Slope — claiming a reasonable action will inevitably lead to extreme, unrelated consequences", "is_correct": True},
                    {"id": "d", "text": "Straw Man — replacing the original argument with a weaker version", "is_correct": False}
                ],
                "explanation": "A Slippery Slope claims that one reasonable step will inevitably trigger a chain of increasingly extreme consequences — without showing WHY each step would actually occur. Letting students choose essay topics doesn't logically lead to grade selection or academic collapse.",
                "difficulty": 3,
                "hints": ["Does the argument actually show HOW each step in the chain follows from the one before it?"]
            },
            {
                "id": "q8",
                "type": "multiple_choice",
                "stem": "A critic says: 'The only study showing year-round school improves performance was funded by a company that sells school air conditioning units.' Which response BEST evaluates this criticism?",
                "options": [
                    {"id": "a", "text": "The critic is right — any study with a conflict of interest is automatically invalid", "is_correct": False},
                    {"id": "b", "text": "The critic raises a legitimate concern about bias, but the study's specific methods and data still need to be examined to determine its validity", "is_correct": True},
                    {"id": "c", "text": "The critic is wrong — scientists always report data honestly regardless of who funds them", "is_correct": False},
                    {"id": "d", "text": "The argument is a Slippery Slope because it assumes the funding affects the results", "is_correct": False}
                ],
                "explanation": "Funding source is a legitimate flag for potential bias, but it doesn't automatically invalidate research. The right response is to examine the methodology, sample size, and peer review status. Dismissing a study purely because of funding is itself a form of Ad Hominem. Critical thinkers investigate; they don't just reject.",
                "difficulty": 3,
                "hints": ["What's the difference between a reason to be suspicious of a source and proof that a source is wrong?"]
            },
            {
                "id": "q9",
                "type": "multiple_choice",
                "stem": "A news headline reads: 'EXPERTS SAY: New superfood cures cancer!' What two pieces of information are MOST critical to evaluate before accepting this claim?",
                "options": [
                    {"id": "a", "text": "The name of the superfood and whether it tastes good", "is_correct": False},
                    {"id": "b", "text": "Who the experts are, what they actually said, and whether peer-reviewed studies support the claim", "is_correct": True},
                    {"id": "c", "text": "How many people shared the article on social media", "is_correct": False},
                    {"id": "d", "text": "Whether the article was published recently and has colorful graphics", "is_correct": False}
                ],
                "explanation": "'Experts say' is vague to the point of meaninglessness. A headline can compress 'may show some promise in early mouse trials' into 'CURES CANCER.' Before accepting health claims, trace the claim to its primary source: the actual study, its methodology, sample size, and peer-review status.",
                "difficulty": 3,
                "hints": ["Headlines often simplify or exaggerate. What would the original scientific paper actually say?"]
            },
            {
                "id": "q10",
                "type": "multiple_choice",
                "stem": "A classmate argues: 'You can't criticize how our school handles bullying — you've never been a school principal. You don't know what it's like.' What is the flaw in this response?",
                "options": [
                    {"id": "a", "text": "It is an Appeal to Authority because it requires the arguer to be an authority figure", "is_correct": False},
                    {"id": "b", "text": "It confuses lived experience with logical argument — you don't need to hold a position to evaluate the reasoning behind its policies", "is_correct": True},
                    {"id": "c", "text": "It is a Straw Man because it misrepresents the criticism about bullying", "is_correct": False},
                    {"id": "d", "text": "It is Circular Reasoning because it uses the principal's role to prove the principal is right", "is_correct": False}
                ],
                "explanation": "This is a variation of Ad Hominem called 'Gatekeeping.' Arguments are evaluated on their logic and evidence, not the identity of who makes them. A student who researches anti-bullying policies can absolutely evaluate school decisions. Otherwise, only principals could criticize principals — making accountability impossible.",
                "difficulty": 3,
                "hints": ["Does the quality of an argument actually depend on who is making it?"]
            },
            {
                "id": "q11",
                "type": "multiple_choice",
                "stem": "An influencer posts: 'I switched to a plant-based diet and my energy doubled, my skin cleared up, and I lost 20 pounds. You should try it too!' What type of evidence is this, and why is it the WEAKEST form for a health recommendation?",
                "options": [
                    {"id": "a", "text": "Survey data — reliable but limited to self-reporting", "is_correct": False},
                    {"id": "b", "text": "Correlation — shows two things happened together but not why", "is_correct": False},
                    {"id": "c", "text": "Anecdotal evidence — a single personal story cannot account for individual variation, placebo effect, or other lifestyle changes made at the same time", "is_correct": True},
                    {"id": "d", "text": "Expert testimony — valid only if the influencer has medical credentials", "is_correct": False}
                ],
                "explanation": "Anecdotal evidence is a personal story (n=1). It cannot control for the dozens of other things that changed simultaneously. Strong evidence requires large sample sizes, control groups, and replicated results across diverse populations.",
                "difficulty": 4,
                "hints": ["What other variables might have changed at the same time as the diet?"]
            },
            {
                "id": "q12",
                "type": "multiple_choice",
                "stem": "A politician says: 'My opponent wants to reduce the military budget. Clearly, she doesn't care about protecting our country.' This argument is MOST guilty of which error?",
                "options": [
                    {"id": "a", "text": "Circular Reasoning — assuming the conclusion is already true in the premise", "is_correct": False},
                    {"id": "b", "text": "False Cause — claiming the budget reduction would cause the country to be unprotected", "is_correct": False},
                    {"id": "c", "text": "Straw Man combined with false inference about motive — reframing a policy position as a moral failing without evidence", "is_correct": True},
                    {"id": "d", "text": "Hasty Generalization — inferring that all politicians who reduce budgets are unpatriotic", "is_correct": False}
                ],
                "explanation": "The politician has replaced a debatable policy position with an invented motive ('she doesn't care about protecting us'). This combines Straw Man (misrepresenting the position) with Ad Hominem (attacking character). Neither engages with the actual policy argument.",
                "difficulty": 4,
                "hints": ["What is the actual policy position? What has the politician turned it into instead?"]
            },
            {
                "id": "q13",
                "type": "multiple_choice",
                "stem": "A company claims its AI hiring tool is unbiased because 'it was built using objective data, and data can't be biased.' Identify the most significant flaw in this claim.",
                "options": [
                    {"id": "a", "text": "The claim is an Appeal to Novelty — arguing the tool is good because it is new technology", "is_correct": False},
                    {"id": "b", "text": "Data reflects the biases present when it was collected — training data from historically biased hiring decisions will encode and replicate those biases in the model", "is_correct": True},
                    {"id": "c", "text": "The claim is a Slippery Slope because hiring tools will eventually replace all human workers", "is_correct": False},
                    {"id": "d", "text": "The claim uses circular reasoning by assuming the tool is objective because it uses data", "is_correct": False}
                ],
                "explanation": "Data is a record of human decisions — and human decisions can be systematically biased. An AI tool trained on resumes from decades when certain groups were excluded will learn that those groups are 'less qualified.' The word 'objective' describes the process of collection, not whether the underlying decisions were fair.",
                "difficulty": 4,
                "hints": ["Who created the data this tool was trained on, and what were their biases?"]
            },
            {
                "id": "q14",
                "type": "multiple_choice",
                "stem": "A classmate argues: 'We should trust our school's dress code — it's been in place for 30 years, and tradition means it must work.' What fallacy is being used, and what would a STRONGER argument look like?",
                "options": [
                    {"id": "a", "text": "Appeal to Tradition — the fallacy; a stronger argument would cite specific outcomes the dress code has achieved (e.g., reduced bullying incidents, improved focus data)", "is_correct": True},
                    {"id": "b", "text": "Hasty Generalization — the fallacy; a stronger argument would give more examples of successful dress codes", "is_correct": False},
                    {"id": "c", "text": "False Dilemma — the fallacy; a stronger argument would acknowledge options besides having or not having a dress code", "is_correct": False},
                    {"id": "d", "text": "Appeal to Authority — the fallacy; a stronger argument would find education experts who support dress codes", "is_correct": False}
                ],
                "explanation": "Appeal to Tradition argues that longevity equals validity — but something can be wrong for 30 years. A stronger argument requires evidence of actual outcomes: has the dress code achieved measurable goals? The age of a policy tells you only how old it is, not whether it works.",
                "difficulty": 4,
                "hints": ["Does something being done for a long time prove it's effective? What would actually prove that?"]
            },
            {
                "id": "q15",
                "type": "multiple_choice",
                "stem": "BOSS ROUND: A viral post argues: 'Scientists keep changing their minds — first eggs were bad, then good. So scientists don't know anything, and we should trust our instincts instead.' Identify ALL the reasoning errors in this argument.",
                "options": [
                    {"id": "a", "text": "Hasty Generalization only — the person drew a broad conclusion from two examples", "is_correct": False},
                    {"id": "b", "text": "The argument commits a Hasty Generalization, misrepresents how science works (updating based on new evidence IS the system working correctly), and creates a False Dilemma (science vs. instinct are not the only options)", "is_correct": True},
                    {"id": "c", "text": "Appeal to Nature only — the argument suggests natural instincts are more reliable than science", "is_correct": False},
                    {"id": "d", "text": "Straw Man only — the argument misrepresents what scientists actually claim about eggs", "is_correct": False}
                ],
                "explanation": "This is a multi-layered fallacy: (1) Hasty Generalization — two diet examples don't represent all science. (2) Misunderstanding of science — revising conclusions when new evidence emerges IS the process working correctly. (3) False Dilemma — the alternative to 'trust scientists perfectly' isn't 'trust only your instincts.' Critical consumers of science evaluate studies and distinguish preliminary findings from established consensus.",
                "difficulty": 5,
                "hints": ["Is 'scientists changed their minds' evidence that scientists are wrong? What does it actually show about scientific method?"]
            }
        ]
    },
    "settings": {
        "allow_hints": True,
        "shuffle_questions": True,
        "show_explanation": True,
        "leaderboard": {
            "enabled": True,
            "type": "score"
        }
    }
}


def generate_slug(title):
    slug = title.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    slug = slug[:50]
    return f"{slug}-{str(uuid.uuid4())[:8]}"


def main():
    print(f"Connecting to {MONGO_URL} / {DB_NAME}...")
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)

    try:
        client.server_info()  # Test connection
    except Exception as e:
        print(f"ERROR: Cannot connect to MongoDB: {e}")
        print("\nMake sure MongoDB is running and MONGO_URL is correct.")
        print(f"Usage: python seed_fault_line.py <MONGO_URL> <DB_NAME>")
        return 1

    db = client[DB_NAME]

    # Find owner user
    user = db.users.find_one({})
    if not user:
        print("ERROR: No users found in database. Create an account first, then run this script.")
        return 1

    owner_id = str(user.get("id") or user.get("_id"))
    print(f"Found user: {user.get('email', owner_id)}")

    # Check for existing game
    existing = db.games.find_one({"title": "Fault Line"})
    if existing:
        print(f"Fault Line already exists. Updating spec...")
        db.games.update_one(
            {"title": "Fault Line"},
            {"$set": {"spec": FAULT_LINE_SPEC, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        print(f"  Game ID: {existing.get('id')}")
        print(f"  Updated successfully.")
        return 0

    game_id = str(uuid.uuid4())
    slug = generate_slug("Fault Line")
    now = datetime.now(timezone.utc).isoformat()

    doc = {
        "id": game_id,
        "owner_id": owner_id,
        "title": "Fault Line",
        "description": "Logical fallacies have taken physical form as geological monsters. Identify the flawed argument to defeat each creature before the volcano erupts. Grades 7-10 | ELA & Critical Thinking.",
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

    result = db.games.insert_one(doc)
    print(f"\nFault Line inserted successfully!")
    print(f"  Game ID : {game_id}")
    print(f"  Slug    : {slug}")
    print(f"  MongoDB : {result.inserted_id}")
    print(f"\n  Play it  : /play/{game_id}")
    print(f"  Edit it  : /studio/{game_id}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
