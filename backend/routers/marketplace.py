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
    SUBCATEGORIES
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
