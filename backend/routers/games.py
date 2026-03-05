"""
Game routes: CRUD operations for games.
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime, timezone
import logging

from core.database import get_games_collection, get_users_collection
from core.security import get_current_user
from models.game import (
    Game, 
    GameCreate, 
    GameUpdate, 
    GameInDB, 
    GameSummary,
    GameSpecUpdate,
    GameStatus,
    GameVisibility,
    game_from_db,
    generate_slug,
    create_default_game_spec
)
from schemas.common import SuccessResponse, PaginatedResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/games", tags=["Games"])


@router.get("", response_model=List[GameSummary])
async def list_games(
    current_user: dict = Depends(get_current_user),
    status: Optional[GameStatus] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """
    List all games owned by the current user.
    """
    games = get_games_collection()
    
    # Build query
    query = {"owner_id": current_user["id"]}
    
    if status:
        query["status"] = status.value
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    # Execute query with pagination
    skip = (page - 1) * page_size
    cursor = games.find(query, {"_id": 0, "spec": 0}).sort("updated_at", -1).skip(skip).limit(page_size)
    
    results = []
    async for doc in cursor:
        if isinstance(doc.get('created_at'), str):
            doc['created_at'] = datetime.fromisoformat(doc['created_at'])
        if isinstance(doc.get('updated_at'), str):
            doc['updated_at'] = datetime.fromisoformat(doc['updated_at'])
        results.append(GameSummary(**doc))
    
    return results


@router.post("", response_model=Game, status_code=status.HTTP_201_CREATED)
async def create_game(
    request: GameCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new game.
    """
    games = get_games_collection()
    users = get_users_collection()
    
    # Generate unique slug
    slug = generate_slug(request.title)
    
    # Create game with default spec if not provided
    spec = request.spec.model_dump() if request.spec else create_default_game_spec(
        request.title, 
        request.description
    )
    
    game_in_db = GameInDB(
        owner_id=current_user["id"],
        title=request.title,
        description=request.description,
        slug=slug,
        spec=spec,
        grade_levels=request.grade_levels,
        subjects=request.subjects
    )
    
    # Insert into database
    await games.insert_one(game_in_db.to_mongo_dict())
    
    # Update user's games_created count
    await users.update_one(
        {"id": current_user["id"]},
        {"$inc": {"games_created": 1}}
    )
    
    logger.info(f"Game created: {game_in_db.id} by user {current_user['id']}")
    
    return game_from_db(game_in_db.to_mongo_dict())


@router.get("/{game_id}", response_model=Game)
async def get_game(
    game_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific game by ID.
    Allows access if:
    1. User owns the game, OR
    2. User has acquired/purchased the game from marketplace, OR
    3. Game is published and public
    """
    from core.database import get_database
    db = get_database()
    games = get_games_collection()
    purchases = db["game_purchases"]
    
    # First try to find the game
    game_doc = await games.find_one({"id": game_id}, {"_id": 0})
    
    if not game_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )
    
    # Check access permissions
    is_owner = game_doc.get("owner_id") == current_user["id"]
    is_published = game_doc.get("status") == "published" and game_doc.get("visibility") == "public"
    
    # Check if user has acquired the game
    has_acquired = await purchases.find_one({
        "game_id": game_id,
        "buyer_id": current_user["id"],
        "status": "completed"
    })
    
    if not is_owner and not is_published and not has_acquired:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found or you don't have access"
        )
    
    return game_from_db(game_doc)


@router.get("/slug/{slug}", response_model=Game)
async def get_game_by_slug(
    slug: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific game by slug.
    """
    games = get_games_collection()
    
    game_doc = await games.find_one(
        {"slug": slug, "owner_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not game_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )
    
    return game_from_db(game_doc)


@router.put("/{game_id}", response_model=Game)
async def update_game(
    game_id: str,
    request: GameUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update a game's metadata.
    """
    games = get_games_collection()
    
    # Check game exists and belongs to user
    game_doc = await games.find_one({"id": game_id, "owner_id": current_user["id"]})
    if not game_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )
    
    # Build update document
    update_data = request.model_dump(exclude_unset=True)
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        # If title changed, update the spec meta too
        if "title" in update_data and game_doc.get("spec"):
            game_doc["spec"]["meta"]["title"] = update_data["title"]
            update_data["spec"] = game_doc["spec"]
        
        await games.update_one(
            {"id": game_id},
            {"$set": update_data}
        )
    
    # Fetch and return updated game
    updated_doc = await games.find_one({"id": game_id}, {"_id": 0})
    return game_from_db(updated_doc)


@router.put("/{game_id}/spec", response_model=Game)
async def update_game_spec(
    game_id: str,
    request: GameSpecUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update a game's spec (the full game definition).
    """
    games = get_games_collection()
    
    # Check game exists and belongs to user
    game_doc = await games.find_one({"id": game_id, "owner_id": current_user["id"]})
    if not game_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )
    
    # Update spec and increment version
    await games.update_one(
        {"id": game_id},
        {
            "$set": {
                "spec": request.spec,
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            "$inc": {"spec_version": 1}
        }
    )
    
    # Fetch and return updated game
    updated_doc = await games.find_one({"id": game_id}, {"_id": 0})
    return game_from_db(updated_doc)


@router.delete("/{game_id}", response_model=SuccessResponse)
async def delete_game(
    game_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a game.
    """
    games = get_games_collection()
    users = get_users_collection()
    
    # Check game exists and belongs to user
    game_doc = await games.find_one({"id": game_id, "owner_id": current_user["id"]})
    if not game_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )
    
    # Delete the game
    await games.delete_one({"id": game_id})
    
    # Update user's games_created count
    await users.update_one(
        {"id": current_user["id"]},
        {"$inc": {"games_created": -1}}
    )
    
    logger.info(f"Game deleted: {game_id} by user {current_user['id']}")
    
    return SuccessResponse(message="Game deleted successfully")


@router.post("/{game_id}/publish", response_model=Game)
async def publish_game(
    game_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Publish a game (change status from draft to published).
    """
    games = get_games_collection()
    
    # Check game exists and belongs to user
    game_doc = await games.find_one({"id": game_id, "owner_id": current_user["id"]})
    if not game_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )
    
    # Validate game has required content
    spec = game_doc.get("spec", {})
    if not spec or not spec.get("scenes") or len(spec.get("scenes", [])) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Game must have at least one scene to publish"
        )
    
    # Update status to published
    now = datetime.now(timezone.utc).isoformat()
    await games.update_one(
        {"id": game_id},
        {
            "$set": {
                "status": GameStatus.PUBLISHED.value,
                "published_at": now,
                "updated_at": now
            }
        }
    )
    
    logger.info(f"Game published: {game_id}")
    
    # Fetch and return updated game
    updated_doc = await games.find_one({"id": game_id}, {"_id": 0})
    return game_from_db(updated_doc)


@router.post("/{game_id}/duplicate", response_model=Game)
async def duplicate_game(
    game_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a copy of an existing game.
    """
    games = get_games_collection()
    
    # Get the original game
    original = await games.find_one({"id": game_id, "owner_id": current_user["id"]})
    if not original:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )
    
    # Create new game based on original
    new_title = f"{original['title']} (Copy)"
    new_slug = generate_slug(new_title)
    
    # Copy and update the spec title
    new_spec = original.get("spec", {}).copy() if original.get("spec") else None
    if new_spec and "meta" in new_spec:
        new_spec["meta"]["title"] = new_title
    
    new_game = GameInDB(
        owner_id=current_user["id"],
        title=new_title,
        description=original.get("description", ""),
        slug=new_slug,
        spec=new_spec,
        grade_levels=original.get("grade_levels", []),
        subjects=original.get("subjects", []),
        standards_tags=original.get("standards_tags", []),
        language=original.get("language", "en-US")
    )
    
    await games.insert_one(new_game.to_mongo_dict())
    
    logger.info(f"Game duplicated: {game_id} -> {new_game.id}")
    
    return game_from_db(new_game.to_mongo_dict())


@router.get("/{game_id}/spec")
async def get_game_spec(
    game_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get just the game spec (for the editor).
    """
    games = get_games_collection()
    
    game_doc = await games.find_one(
        {"id": game_id, "owner_id": current_user["id"]},
        {"_id": 0, "spec": 1, "spec_version": 1}
    )
    
    if not game_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found"
        )
    
    return {
        "spec": game_doc.get("spec"),
        "spec_version": game_doc.get("spec_version", 1)
    }
