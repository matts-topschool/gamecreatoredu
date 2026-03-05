"""
Marketplace routes - Browse, search, publish, and purchase games.
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime, timezone
import logging
import re

from core.database import get_database
from core.security import get_current_user, get_current_user_optional
from models.marketplace import (
    MarketplaceCategory,
    MarketplaceListing,
    MarketplaceListingCreate,
    MarketplaceSearchParams,
    MarketplaceSearchResult,
    GameReview,
    GameReviewCreate,
    GamePurchase,
    PublisherProfile,
    SUBCATEGORIES,
    CreatorStore,
    CreatorStoreInDB,
    CreatorStoreUpdate,
    CreatorStoreSummary,
    StoreFollower
)
from models.game import GameStatus, GameVisibility

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])


def get_games_collection():
    db = get_database()
    return db["games"]


def get_users_collection():
    db = get_database()
    return db["users"]


def get_reviews_collection():
    db = get_database()
    return db["game_reviews"]


def get_purchases_collection():
    db = get_database()
    return db["game_purchases"]


def get_stores_collection():
    db = get_database()
    return db["creator_stores"]


def get_store_followers_collection():
    db = get_database()
    return db["store_followers"]


# ============== Browse & Search ==============

@router.get("/browse", response_model=MarketplaceSearchResult)
async def browse_marketplace(
    query: Optional[str] = None,
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    grade_level: Optional[int] = None,
    game_type: Optional[str] = None,
    tag: Optional[str] = None,
    is_free: Optional[bool] = None,
    min_rating: Optional[float] = None,
    sort_by: str = "popular",
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Browse and search marketplace listings.
    
    Sort options: popular, newest, rating, price_low, price_high
    """
    games = get_games_collection()
    users = get_users_collection()
    
    # Build query
    match_query = {
        "status": GameStatus.PUBLISHED.value,
        "visibility": GameVisibility.PUBLIC.value,
        "is_marketplace_listed": True
    }
    
    # Text search
    if query:
        match_query["$or"] = [
            {"title": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
            {"marketplace_tags": {"$in": [query.lower()]}}
        ]
    
    # Category filter
    if category:
        match_query["marketplace_category"] = category
    
    if subcategory:
        match_query["marketplace_subcategory"] = subcategory
    
    # Grade level filter
    if grade_level:
        match_query["grade_levels"] = grade_level
    
    # Game type filter
    if game_type:
        match_query["spec.meta.game_type"] = game_type
    
    # Tag filter
    if tag:
        match_query["marketplace_tags"] = tag.lower()
    
    # Free filter
    if is_free is not None:
        if is_free:
            match_query["price_cents"] = 0
        else:
            match_query["price_cents"] = {"$gt": 0}
    
    # Rating filter
    if min_rating:
        match_query["avg_rating"] = {"$gte": min_rating}
    
    # Sort configuration
    sort_config = {"play_count": -1}  # Default: popular
    if sort_by == "newest":
        sort_config = {"published_at": -1}
    elif sort_by == "rating":
        sort_config = {"avg_rating": -1, "review_count": -1}
    elif sort_by == "price_low":
        sort_config = {"price_cents": 1}
    elif sort_by == "price_high":
        sort_config = {"price_cents": -1}
    
    # Pagination
    skip = (page - 1) * limit
    
    # Execute query
    cursor = games.find(match_query, {"_id": 0}).sort(list(sort_config.items())).skip(skip).limit(limit)
    
    # Get total count
    total = await games.count_documents(match_query)
    
    # Build listings with creator info
    listings = []
    async for doc in cursor:
        # Get creator info
        creator = await users.find_one({"id": doc["owner_id"]}, {"_id": 0, "display_name": 1, "avatar_url": 1})
        
        listing = build_listing_from_game(doc, creator)
        listings.append(listing)
    
    # Calculate total pages
    total_pages = (total + limit - 1) // limit
    
    # Build facets for filter UI
    facets = await build_facets(games, match_query)
    
    return MarketplaceSearchResult(
        listings=listings,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
        facets=facets
    )


@router.get("/featured")
async def get_featured_games(
    limit: int = Query(12, le=30)
):
    """Get featured games for homepage."""
    games = get_games_collection()
    users = get_users_collection()
    
    # Get high-rated, popular games
    cursor = games.find(
        {
            "status": GameStatus.PUBLISHED.value,
            "visibility": GameVisibility.PUBLIC.value,
            "is_marketplace_listed": True
        },
        {"_id": 0}
    ).sort([("avg_rating", -1), ("play_count", -1)]).limit(limit)
    
    listings = []
    async for doc in cursor:
        creator = await users.find_one({"id": doc["owner_id"]}, {"_id": 0, "display_name": 1})
        listing = build_listing_from_game(doc, creator)
        listings.append(listing)
    
    return {"featured": listings}


@router.get("/categories")
async def get_categories():
    """Get all categories and subcategories."""
    categories = []
    for cat in MarketplaceCategory:
        subcats = SUBCATEGORIES.get(cat, [])
        categories.append({
            "id": cat.value,
            "name": cat.value.replace("_", " ").title(),
            "subcategories": subcats
        })
    return {"categories": categories}


@router.get("/game/{game_id}", response_model=MarketplaceListing)
async def get_marketplace_listing(
    game_id: str,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Get a single marketplace listing by game ID."""
    games = get_games_collection()
    users = get_users_collection()
    
    game = await games.find_one(
        {
            "id": game_id,
            "status": GameStatus.PUBLISHED.value,
            "is_marketplace_listed": True
        },
        {"_id": 0}
    )
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found in marketplace")
    
    creator = await users.find_one({"id": game["owner_id"]}, {"_id": 0, "display_name": 1, "avatar_url": 1})
    
    # Increment view count (could be moved to analytics)
    await games.update_one({"id": game_id}, {"$inc": {"view_count": 1}})
    
    return build_listing_from_game(game, creator)


@router.get("/game/slug/{slug}")
async def get_marketplace_listing_by_slug(
    slug: str,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Get a marketplace listing by URL slug."""
    games = get_games_collection()
    users = get_users_collection()
    
    game = await games.find_one(
        {
            "slug": slug,
            "status": GameStatus.PUBLISHED.value,
            "is_marketplace_listed": True
        },
        {"_id": 0}
    )
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    creator = await users.find_one({"id": game["owner_id"]}, {"_id": 0, "display_name": 1})
    
    return build_listing_from_game(game, creator)


# ============== Publishing ==============

@router.post("/publish", response_model=MarketplaceListing)
async def publish_to_marketplace(
    request: MarketplaceListingCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Publish a game to the marketplace.
    Game must be owned by the current user.
    Forked games cannot be published unless the original creator allowed derivative sales.
    """
    games = get_games_collection()
    users = get_users_collection()
    
    # Find game and verify ownership
    game = await games.find_one(
        {"id": request.game_id, "owner_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found or not owned by you")
    
    # Check if this is a forked game - restrict publishing unless original allowed
    if game.get("is_forked") and game.get("forked_from_id"):
        # Fetch original game to check allow_derivative_sales
        original = await games.find_one(
            {"id": game["forked_from_id"]},
            {"_id": 0, "allow_derivative_sales": 1, "title": 1}
        )
        
        if original and not original.get("allow_derivative_sales", False):
            raise HTTPException(
                status_code=403, 
                detail=f"Cannot publish this game. The original creator of '{original.get('title', 'the source game')}' does not allow derivative works to be sold on the marketplace."
            )
    
    # Validate game has content
    spec = game.get("spec", {})
    if not spec or not spec.get("content", {}).get("questions"):
        raise HTTPException(
            status_code=400, 
            detail="Game must have at least one question to be published"
        )
    
    # Update game with marketplace data
    now = datetime.now(timezone.utc)
    update_data = {
        "status": GameStatus.PUBLISHED.value,
        "visibility": GameVisibility.PUBLIC.value,
        "is_marketplace_listed": True,
        "marketplace_category": request.category.value,
        "marketplace_subcategory": request.subcategory,
        "marketplace_tags": [t.lower() for t in request.tags],
        "price_cents": request.price_cents if not request.is_free else 0,
        "license_type": request.license_type,
        "allow_derivative_sales": request.allow_derivative_sales,
        "seo_title": request.seo_title or game.get("title"),
        "seo_description": request.seo_description or game.get("description"),
        "seo_keywords": request.seo_keywords,
        "published_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    await games.update_one({"id": request.game_id}, {"$set": update_data})
    
    # Refresh game data
    game = await games.find_one({"id": request.game_id}, {"_id": 0})
    creator = await users.find_one({"id": current_user["id"]}, {"_id": 0, "display_name": 1})
    
    logger.info(f"Game {request.game_id} published to marketplace by {current_user['id']}")
    
    return build_listing_from_game(game, creator)


@router.post("/unpublish/{game_id}")
async def unpublish_from_marketplace(
    game_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove a game from the marketplace."""
    games = get_games_collection()
    
    result = await games.update_one(
        {"id": game_id, "owner_id": current_user["id"]},
        {
            "$set": {
                "is_marketplace_listed": False,
                "visibility": GameVisibility.PRIVATE.value,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Game not found or not owned by you")
    
    return {"success": True, "message": "Game removed from marketplace"}


# ============== Reviews ==============

@router.post("/game/{game_id}/reviews", response_model=GameReview)
async def create_review(
    game_id: str,
    request: GameReviewCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a review for a game."""
    games = get_games_collection()
    reviews = get_reviews_collection()
    purchases = get_purchases_collection()
    
    # Verify game exists
    game = await games.find_one({"id": game_id, "is_marketplace_listed": True}, {"_id": 0})
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Check if user already reviewed
    existing = await reviews.find_one({
        "game_id": game_id,
        "reviewer_id": current_user["id"]
    })
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this game")
    
    # Check if verified purchase
    purchase = await purchases.find_one({
        "game_id": game_id,
        "buyer_id": current_user["id"],
        "status": "completed"
    })
    
    review = GameReview(
        game_id=game_id,
        reviewer_id=current_user["id"],
        reviewer_name=current_user.get("display_name", "Anonymous"),
        rating=request.rating,
        title=request.title,
        content=request.content,
        verified_purchase=bool(purchase)
    )
    
    await reviews.insert_one(review.to_mongo_dict())
    
    # Update game average rating
    await update_game_rating(game_id)
    
    return review


@router.get("/game/{game_id}/reviews")
async def get_game_reviews(
    game_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=50)
):
    """Get reviews for a game."""
    reviews = get_reviews_collection()
    
    skip = (page - 1) * limit
    
    cursor = reviews.find(
        {"game_id": game_id},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit)
    
    results = []
    async for doc in cursor:
        if isinstance(doc.get('created_at'), str):
            doc['created_at'] = datetime.fromisoformat(doc['created_at'])
        if isinstance(doc.get('updated_at'), str):
            doc['updated_at'] = datetime.fromisoformat(doc['updated_at'])
        results.append(doc)
    
    total = await reviews.count_documents({"game_id": game_id})
    
    return {
        "reviews": results,
        "total": total,
        "page": page,
        "limit": limit
    }


# ============== Purchases ==============

@router.post("/game/{game_id}/acquire")
async def acquire_game(
    game_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Acquire a game (purchase or get free).
    For paid games, this would integrate with Stripe.
    """
    games = get_games_collection()
    purchases = get_purchases_collection()
    
    # Get game
    game = await games.find_one({"id": game_id, "is_marketplace_listed": True}, {"_id": 0})
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Check if already acquired
    existing = await purchases.find_one({
        "game_id": game_id,
        "buyer_id": current_user["id"],
        "status": "completed"
    })
    if existing:
        return {"success": True, "message": "Already acquired", "purchase_id": existing["id"]}
    
    # Check if it's the owner
    if game["owner_id"] == current_user["id"]:
        return {"success": True, "message": "You own this game"}
    
    # For free games, just create purchase record
    if game.get("price_cents", 0) == 0:
        purchase = GamePurchase(
            game_id=game_id,
            buyer_id=current_user["id"],
            seller_id=game["owner_id"],
            price_cents=0,
            license_type=game.get("license_type", "single"),
            payment_method="free",
            status="completed"
        )
        
        await purchases.insert_one(purchase.to_mongo_dict())
        
        # Increment purchase count
        await games.update_one({"id": game_id}, {"$inc": {"purchase_count": 1}})
        
        return {"success": True, "message": "Game acquired!", "purchase_id": purchase.id}
    
    # For paid games, return Stripe checkout info
    # TODO: Integrate Stripe
    raise HTTPException(
        status_code=501, 
        detail="Paid games not yet supported. Coming soon!"
    )


@router.post("/game/{game_id}/fork")
async def fork_game(
    game_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Fork/duplicate a game to the user's library for editing.
    User must have acquired the game first (or it must be free).
    Creates an editable copy that the user owns.
    """
    games = get_games_collection()
    purchases = get_purchases_collection()
    
    # Get original game
    original_game = await games.find_one({"id": game_id, "is_marketplace_listed": True}, {"_id": 0})
    if not original_game:
        raise HTTPException(status_code=404, detail="Game not found in marketplace")
    
    # Check if it's the owner trying to fork their own game
    if original_game["owner_id"] == current_user["id"]:
        raise HTTPException(status_code=400, detail="You cannot fork your own game. Edit it directly instead.")
    
    # Check if user has acquired the game (or it's free)
    is_free = original_game.get("price_cents", 0) == 0
    
    if not is_free:
        purchase = await purchases.find_one({
            "game_id": game_id,
            "buyer_id": current_user["id"],
            "status": "completed"
        })
        if not purchase:
            raise HTTPException(
                status_code=403, 
                detail="You must acquire this game before you can fork it."
            )
    
    # Create the forked game
    import uuid
    now = datetime.now(timezone.utc)
    
    forked_game = {
        "id": str(uuid.uuid4()),
        "owner_id": current_user["id"],
        "title": f"{original_game['title']} (My Version)",
        "description": original_game.get("description", ""),
        "slug": f"{original_game.get('slug', 'game')[:30]}-fork-{str(uuid.uuid4())[:8]}",
        "thumbnail_url": original_game.get("thumbnail_url"),
        "spec": original_game.get("spec"),
        "spec_version": original_game.get("spec_version", 1),
        "status": "draft",  # Start as draft
        "visibility": "private",  # Start as private
        "is_marketplace_listed": False,  # Not listed
        "price_cents": 0,
        "license_type": "single",
        # Fork tracking
        "forked_from_id": game_id,
        "is_forked": True,
        "allow_derivative_sales": False,  # Forked games default to no resale
        # Copy educational metadata
        "grade_levels": original_game.get("grade_levels", []),
        "subjects": original_game.get("subjects", []),
        "standards_tags": original_game.get("standards_tags", []),
        "language": original_game.get("language", "en-US"),
        # Reset stats
        "play_count": 0,
        "avg_rating": 0.0,
        "review_count": 0,
        "purchase_count": 0,
        # Timestamps
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
        "published_at": None
    }
    
    await games.insert_one(forked_game)
    
    # Increment fork count on original (optional tracking)
    await games.update_one({"id": game_id}, {"$inc": {"fork_count": 1}})
    
    logger.info(f"Game {game_id} forked by user {current_user['id']} -> new game {forked_game['id']}")
    
    return {
        "success": True,
        "message": "Game forked successfully! You can now edit it in your studio.",
        "forked_game_id": forked_game["id"],
        "original_game_id": game_id,
        "can_resell": original_game.get("allow_derivative_sales", False)
    }


@router.get("/my-library")
async def get_my_library(
    current_user: dict = Depends(get_current_user)
):
    """Get games acquired by current user."""
    games = get_games_collection()
    purchases = get_purchases_collection()
    users = get_users_collection()
    
    # Get all user's purchases
    purchase_cursor = purchases.find(
        {"buyer_id": current_user["id"], "status": "completed"},
        {"_id": 0, "game_id": 1}
    )
    
    game_ids = []
    async for p in purchase_cursor:
        game_ids.append(p["game_id"])
    
    # Also include user's own games
    own_cursor = games.find(
        {"owner_id": current_user["id"]},
        {"_id": 0, "id": 1}
    )
    async for g in own_cursor:
        if g["id"] not in game_ids:
            game_ids.append(g["id"])
    
    # Get full game details
    if not game_ids:
        return {"library": []}
    
    cursor = games.find({"id": {"$in": game_ids}}, {"_id": 0})
    
    library = []
    async for doc in cursor:
        creator = await users.find_one({"id": doc["owner_id"]}, {"_id": 0, "display_name": 1})
        listing = build_listing_from_game(doc, creator)
        library.append(listing)
    
    return {"library": library}


# ============== Publisher Profiles ==============

@router.get("/publisher/{user_id}")
async def get_publisher_profile(
    user_id: str
):
    """Get a publisher's public profile and games."""
    games = get_games_collection()
    users = get_users_collection()
    
    # Get user
    user = await users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Publisher not found")
    
    # Get user's public games
    cursor = games.find(
        {
            "owner_id": user_id,
            "status": GameStatus.PUBLISHED.value,
            "is_marketplace_listed": True
        },
        {"_id": 0}
    ).sort("play_count", -1)
    
    published_games = []
    total_plays = 0
    total_rating = 0
    rating_count = 0
    
    async for doc in cursor:
        listing = build_listing_from_game(doc, user)
        published_games.append(listing)
        total_plays += doc.get("play_count", 0)
        if doc.get("avg_rating", 0) > 0:
            total_rating += doc.get("avg_rating", 0)
            rating_count += 1
    
    avg_rating = total_rating / rating_count if rating_count > 0 else 0
    
    profile = PublisherProfile(
        user_id=user_id,
        display_name=user.get("display_name", "Unknown"),
        bio=user.get("bio"),
        avatar_url=user.get("avatar_url"),
        total_games=len(published_games),
        total_plays=total_plays,
        avg_rating=round(avg_rating, 1),
        joined_at=datetime.fromisoformat(user["created_at"]) if isinstance(user.get("created_at"), str) else user.get("created_at", datetime.now(timezone.utc))
    )
    
    return {
        "profile": profile,
        "games": published_games
    }


# ============== Helper Functions ==============

def build_listing_from_game(game: dict, creator: dict = None) -> MarketplaceListing:
    """Convert a game document to a marketplace listing."""
    spec = game.get("spec", {})
    meta = spec.get("meta", {})
    
    return MarketplaceListing(
        id=game["id"],
        title=game.get("title", "Untitled"),
        description=game.get("description", ""),
        slug=game.get("slug", ""),
        thumbnail_url=game.get("thumbnail_url"),
        creator_id=game["owner_id"],
        creator_name=creator.get("display_name", "Unknown") if creator else "Unknown",
        creator_avatar=creator.get("avatar_url") if creator else None,
        game_type=meta.get("game_type", game.get("spec", {}).get("meta", {}).get("game_type", "quiz")),
        grade_levels=game.get("grade_levels", []),
        subjects=game.get("subjects", []),
        category=game.get("marketplace_category"),
        subcategory=game.get("marketplace_subcategory"),
        tags=game.get("marketplace_tags", []),
        is_free=game.get("price_cents", 0) == 0,
        price_cents=game.get("price_cents", 0),
        license_type=game.get("license_type", "single"),
        forked_from_id=game.get("forked_from_id"),
        is_forked=game.get("is_forked", False),
        allow_derivative_sales=game.get("allow_derivative_sales", False),
        play_count=game.get("play_count", 0),
        avg_rating=game.get("avg_rating", 0),
        review_count=game.get("review_count", 0),
        purchase_count=game.get("purchase_count", 0),
        seo_title=game.get("seo_title"),
        seo_description=game.get("seo_description"),
        seo_keywords=game.get("seo_keywords", []),
        published_at=datetime.fromisoformat(game["published_at"]) if game.get("published_at") else None,
        created_at=datetime.fromisoformat(game["created_at"]) if isinstance(game.get("created_at"), str) else game.get("created_at", datetime.now(timezone.utc))
    )


async def build_facets(games_collection, base_query: dict) -> dict:
    """Build facet data for filter UI."""
    # Get category counts
    category_pipeline = [
        {"$match": base_query},
        {"$group": {"_id": "$marketplace_category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    categories = []
    async for doc in games_collection.aggregate(category_pipeline):
        if doc["_id"]:
            categories.append({"value": doc["_id"], "count": doc["count"]})
    
    # Get grade level counts
    grade_pipeline = [
        {"$match": base_query},
        {"$unwind": "$grade_levels"},
        {"$group": {"_id": "$grade_levels", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    
    grades = []
    async for doc in games_collection.aggregate(grade_pipeline):
        grades.append({"value": doc["_id"], "count": doc["count"]})
    
    # Get game type counts
    type_pipeline = [
        {"$match": base_query},
        {"$group": {"_id": "$spec.meta.game_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    game_types = []
    async for doc in games_collection.aggregate(type_pipeline):
        if doc["_id"]:
            game_types.append({"value": doc["_id"], "count": doc["count"]})
    
    return {
        "categories": categories,
        "grade_levels": grades,
        "game_types": game_types
    }


async def update_game_rating(game_id: str):
    """Recalculate and update a game's average rating."""
    games = get_games_collection()
    reviews = get_reviews_collection()
    
    pipeline = [
        {"$match": {"game_id": game_id}},
        {"$group": {
            "_id": None,
            "avg_rating": {"$avg": "$rating"},
            "count": {"$sum": 1}
        }}
    ]
    
    result = None
    async for doc in reviews.aggregate(pipeline):
        result = doc
        break
    
    if result:
        await games.update_one(
            {"id": game_id},
            {"$set": {
                "avg_rating": round(result["avg_rating"], 1),
                "review_count": result["count"]
            }}
        )



# ==================== Creator Store Endpoints ====================

def generate_store_slug(name: str) -> str:
    """Generate URL-friendly slug from store name."""
    slug = re.sub(r'[^a-zA-Z0-9\s-]', '', name.lower())
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug).strip('-')
    return slug[:50]


@router.post("/store", response_model=CreatorStore, status_code=status.HTTP_201_CREATED)
async def create_store(
    store_name: str = Query(..., min_length=3, max_length=50),
    tagline: Optional[str] = Query(None, max_length=100),
    current_user: dict = Depends(get_current_user)
):
    """
    Create a creator store for the current user.
    Each user can only have one store.
    """
    stores = get_stores_collection()
    users = get_users_collection()
    
    # Check if user already has a store
    existing = await stores.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="You already have a store")
    
    # Generate unique slug
    base_slug = generate_store_slug(store_name)
    slug = base_slug
    counter = 1
    while await stores.find_one({"slug": slug}):
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    # Get user info for defaults
    user = await users.find_one({"id": current_user["id"]}, {"_id": 0})
    
    # Create store
    store = CreatorStoreInDB(
        user_id=current_user["id"],
        store_name=store_name,
        slug=slug,
        tagline=tagline,
        logo_url=user.get("avatar_url") if user else None
    )
    
    await stores.insert_one(store.to_mongo_dict())
    
    logger.info(f"Created store '{store_name}' for user {current_user['id']}")
    
    return await get_store_response(store.id)


@router.get("/store/my", response_model=CreatorStore)
async def get_my_store(current_user: dict = Depends(get_current_user)):
    """Get the current user's store."""
    stores = get_stores_collection()
    
    store_doc = await stores.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not store_doc:
        raise HTTPException(status_code=404, detail="You don't have a store yet")
    
    return await get_store_response(store_doc["id"])


@router.get("/store/{store_slug}", response_model=CreatorStore)
async def get_store_by_slug(store_slug: str):
    """Get a creator store by its URL slug."""
    stores = get_stores_collection()
    
    store_doc = await stores.find_one({"slug": store_slug}, {"_id": 0})
    if not store_doc:
        raise HTTPException(status_code=404, detail="Store not found")
    
    return await get_store_response(store_doc["id"])


@router.get("/store/id/{store_id}", response_model=CreatorStore)
async def get_store_by_id(store_id: str):
    """Get a creator store by ID."""
    return await get_store_response(store_id)


@router.put("/store", response_model=CreatorStore)
async def update_my_store(
    update: CreatorStoreUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update the current user's store."""
    stores = get_stores_collection()
    
    store_doc = await stores.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not store_doc:
        raise HTTPException(status_code=404, detail="You don't have a store yet")
    
    # Build update dict
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    # Update slug if store name changed
    if "store_name" in update_data:
        base_slug = generate_store_slug(update_data["store_name"])
        slug = base_slug
        counter = 1
        while True:
            existing = await stores.find_one({"slug": slug, "id": {"$ne": store_doc["id"]}})
            if not existing:
                break
            slug = f"{base_slug}-{counter}"
            counter += 1
        update_data["slug"] = slug
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await stores.update_one(
        {"id": store_doc["id"]},
        {"$set": update_data}
    )
    
    return await get_store_response(store_doc["id"])


@router.get("/store/{store_slug}/products", response_model=MarketplaceSearchResult)
async def get_store_products(
    store_slug: str,
    category: Optional[str] = None,
    sort_by: str = Query("newest", enum=["newest", "popular", "rating", "price_low", "price_high"]),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50)
):
    """Get all products from a store."""
    stores = get_stores_collection()
    games = get_games_collection()
    users = get_users_collection()
    
    # Get store
    store_doc = await stores.find_one({"slug": store_slug}, {"_id": 0})
    if not store_doc:
        raise HTTPException(status_code=404, detail="Store not found")
    
    # Build query
    query = {
        "owner_id": store_doc["user_id"],
        "is_marketplace_listed": True
    }
    
    if category:
        query["marketplace_category"] = category
    
    # Sort
    sort_field = {
        "newest": ("published_at", -1),
        "popular": ("play_count", -1),
        "rating": ("avg_rating", -1),
        "price_low": ("price_cents", 1),
        "price_high": ("price_cents", -1)
    }.get(sort_by, ("published_at", -1))
    
    # Get total count
    total = await games.count_documents(query)
    
    # Paginate
    skip = (page - 1) * limit
    cursor = games.find(query, {"_id": 0}).sort(*sort_field).skip(skip).limit(limit)
    
    # Get creator info
    creator = await users.find_one({"id": store_doc["user_id"]}, {"_id": 0})
    
    listings = []
    async for game in cursor:
        listings.append(build_listing_from_game(game, creator))
    
    return MarketplaceSearchResult(
        listings=listings,
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit,
        facets={}
    )


@router.post("/store/{store_slug}/follow")
async def follow_store(
    store_slug: str,
    current_user: dict = Depends(get_current_user)
):
    """Follow a creator store."""
    stores = get_stores_collection()
    followers = get_store_followers_collection()
    
    store_doc = await stores.find_one({"slug": store_slug}, {"_id": 0})
    if not store_doc:
        raise HTTPException(status_code=404, detail="Store not found")
    
    if store_doc["user_id"] == current_user["id"]:
        raise HTTPException(status_code=400, detail="You cannot follow your own store")
    
    # Check if already following
    existing = await followers.find_one({
        "store_id": store_doc["id"],
        "user_id": current_user["id"]
    })
    
    if existing:
        return {"success": True, "message": "Already following", "is_following": True}
    
    # Create follow
    follower = StoreFollower(
        store_id=store_doc["id"],
        user_id=current_user["id"]
    )
    
    await followers.insert_one(follower.model_dump())
    
    # Update store follower count
    await stores.update_one(
        {"id": store_doc["id"]},
        {"$inc": {"follower_count": 1}}
    )
    
    return {"success": True, "message": "Now following store", "is_following": True}


@router.delete("/store/{store_slug}/follow")
async def unfollow_store(
    store_slug: str,
    current_user: dict = Depends(get_current_user)
):
    """Unfollow a creator store."""
    stores = get_stores_collection()
    followers = get_store_followers_collection()
    
    store_doc = await stores.find_one({"slug": store_slug}, {"_id": 0})
    if not store_doc:
        raise HTTPException(status_code=404, detail="Store not found")
    
    result = await followers.delete_one({
        "store_id": store_doc["id"],
        "user_id": current_user["id"]
    })
    
    if result.deleted_count > 0:
        await stores.update_one(
            {"id": store_doc["id"]},
            {"$inc": {"follower_count": -1}}
        )
    
    return {"success": True, "message": "Unfollowed store", "is_following": False}


@router.get("/store/{store_slug}/is-following")
async def check_following(
    store_slug: str,
    current_user: dict = Depends(get_current_user)
):
    """Check if current user is following a store."""
    stores = get_stores_collection()
    followers = get_store_followers_collection()
    
    store_doc = await stores.find_one({"slug": store_slug}, {"_id": 0})
    if not store_doc:
        raise HTTPException(status_code=404, detail="Store not found")
    
    existing = await followers.find_one({
        "store_id": store_doc["id"],
        "user_id": current_user["id"]
    })
    
    return {"is_following": existing is not None}


@router.get("/stores/featured", response_model=List[CreatorStoreSummary])
async def get_featured_stores(limit: int = Query(6, ge=1, le=20)):
    """Get featured/top creator stores."""
    stores = get_stores_collection()
    
    # Get top stores by follower count and rating
    cursor = stores.find(
        {"total_products": {"$gt": 0}},
        {"_id": 0}
    ).sort([("is_featured_seller", -1), ("follower_count", -1), ("avg_rating", -1)]).limit(limit)
    
    results = []
    async for doc in cursor:
        results.append(CreatorStoreSummary(
            id=doc["id"],
            user_id=doc["user_id"],
            store_name=doc["store_name"],
            slug=doc["slug"],
            logo_url=doc.get("logo_url"),
            is_verified=doc.get("is_verified", False),
            avg_rating=doc.get("avg_rating", 0),
            total_products=doc.get("total_products", 0)
        ))
    
    return results


async def get_store_response(store_id: str) -> CreatorStore:
    """Get full store response with featured products."""
    stores = get_stores_collection()
    games = get_games_collection()
    users = get_users_collection()
    
    store_doc = await stores.find_one({"id": store_id}, {"_id": 0})
    if not store_doc:
        raise HTTPException(status_code=404, detail="Store not found")
    
    # Get featured products
    featured_products = []
    featured_ids = store_doc.get("featured_game_ids", [])
    
    if featured_ids:
        cursor = games.find(
            {"id": {"$in": featured_ids}, "is_marketplace_listed": True},
            {"_id": 0}
        )
        creator = await users.find_one({"id": store_doc["user_id"]}, {"_id": 0})
        async for game in cursor:
            featured_products.append(build_listing_from_game(game, creator))
    
    # If no featured set, get top games
    if not featured_products:
        cursor = games.find(
            {"owner_id": store_doc["user_id"], "is_marketplace_listed": True},
            {"_id": 0}
        ).sort("play_count", -1).limit(6)
        creator = await users.find_one({"id": store_doc["user_id"]}, {"_id": 0})
        async for game in cursor:
            featured_products.append(build_listing_from_game(game, creator))
    
    return CreatorStore(
        id=store_doc["id"],
        user_id=store_doc["user_id"],
        store_name=store_doc["store_name"],
        slug=store_doc["slug"],
        tagline=store_doc.get("tagline"),
        about=store_doc.get("about"),
        banner_url=store_doc.get("banner_url"),
        logo_url=store_doc.get("logo_url"),
        accent_color=store_doc.get("accent_color", "#7c3aed"),
        website_url=store_doc.get("website_url"),
        twitter_handle=store_doc.get("twitter_handle"),
        youtube_url=store_doc.get("youtube_url"),
        instagram_handle=store_doc.get("instagram_handle"),
        total_products=store_doc.get("total_products", 0),
        total_sales=store_doc.get("total_sales", 0),
        total_downloads=store_doc.get("total_downloads", 0),
        avg_rating=store_doc.get("avg_rating", 0),
        review_count=store_doc.get("review_count", 0),
        follower_count=store_doc.get("follower_count", 0),
        is_verified=store_doc.get("is_verified", False),
        is_featured_seller=store_doc.get("is_featured_seller", False),
        badges=store_doc.get("badges", []),
        featured_products=featured_products,
        created_at=datetime.fromisoformat(store_doc["created_at"]) if isinstance(store_doc.get("created_at"), str) else store_doc.get("created_at", datetime.now(timezone.utc))
    )


async def update_store_stats(user_id: str):
    """Update cached stats for a creator's store."""
    stores = get_stores_collection()
    games = get_games_collection()
    reviews = get_reviews_collection()
    purchases = get_purchases_collection()
    
    store_doc = await stores.find_one({"user_id": user_id}, {"_id": 0})
    if not store_doc:
        return
    
    # Count products
    total_products = await games.count_documents({
        "owner_id": user_id,
        "is_marketplace_listed": True
    })
    
    # Sum plays and calculate avg rating
    pipeline = [
        {"$match": {"owner_id": user_id, "is_marketplace_listed": True}},
        {"$group": {
            "_id": None,
            "total_plays": {"$sum": "$play_count"},
            "total_downloads": {"$sum": "$purchase_count"},
            "avg_rating": {"$avg": "$avg_rating"},
            "review_count": {"$sum": "$review_count"}
        }}
    ]
    
    stats = {"total_plays": 0, "total_downloads": 0, "avg_rating": 0, "review_count": 0}
    async for doc in games.aggregate(pipeline):
        stats = doc
        break
    
    # Count sales revenue
    revenue_pipeline = [
        {"$match": {"seller_id": user_id, "status": "completed"}},
        {"$group": {
            "_id": None,
            "total_sales": {"$sum": 1},
            "total_revenue": {"$sum": "$price_cents"}
        }}
    ]
    
    revenue_stats = {"total_sales": 0, "total_revenue": 0}
    async for doc in purchases.aggregate(revenue_pipeline):
        revenue_stats = doc
        break
    
    # Update store
    await stores.update_one(
        {"id": store_doc["id"]},
        {"$set": {
            "total_products": total_products,
            "total_sales": revenue_stats.get("total_sales", 0),
            "total_revenue_cents": revenue_stats.get("total_revenue", 0),
            "total_downloads": stats.get("total_downloads", 0),
            "avg_rating": round(stats.get("avg_rating", 0) or 0, 1),
            "review_count": stats.get("review_count", 0),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
