"""
User routes: profile management, settings.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone
import logging

from core.database import get_users_collection
from core.security import get_current_user
from models.user import User, UserUpdate, user_from_db
from schemas.common import SuccessResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=User)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """
    Get the current user's profile.
    """
    return user_from_db(current_user)


@router.put("/profile", response_model=User)
async def update_profile(
    request: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update the current user's profile.
    """
    users = get_users_collection()
    
    # Build update document
    update_data = request.model_dump(exclude_unset=True)
    
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        # Handle nested settings
        if "settings" in update_data and update_data["settings"]:
            update_data["settings"] = update_data["settings"].model_dump() if hasattr(update_data["settings"], "model_dump") else update_data["settings"]
        
        await users.update_one(
            {"id": current_user["id"]},
            {"$set": update_data}
        )
    
    # Fetch and return updated user
    updated_doc = await users.find_one({"id": current_user["id"]}, {"_id": 0, "password_hash": 0})
    return user_from_db(updated_doc)


@router.get("/subscription")
async def get_subscription(current_user: dict = Depends(get_current_user)):
    """
    Get the current user's subscription status.
    """
    return {
        "tier": current_user.get("subscription_tier", "free"),
        "expires_at": current_user.get("subscription_expires_at"),
        "features": get_tier_features(current_user.get("subscription_tier", "free"))
    }


def get_tier_features(tier: str) -> dict:
    """Get features available for a subscription tier."""
    features = {
        "free": {
            "games_limit": None,  # Unlimited
            "can_share": True,
            "can_sell": False,
            "advanced_ai": False,
            "detailed_analytics": False,
            "priority_support": False,
            "custom_branding": False
        },
        "creator": {
            "games_limit": None,
            "can_share": True,
            "can_sell": True,
            "advanced_ai": True,
            "detailed_analytics": True,
            "priority_support": True,
            "custom_branding": True
        },
        "school": {
            "games_limit": None,
            "can_share": True,
            "can_sell": True,
            "advanced_ai": True,
            "detailed_analytics": True,
            "priority_support": True,
            "custom_branding": True,
            "sso": True,
            "admin_dashboard": True
        },
        "district": {
            "games_limit": None,
            "can_share": True,
            "can_sell": True,
            "advanced_ai": True,
            "detailed_analytics": True,
            "priority_support": True,
            "custom_branding": True,
            "sso": True,
            "admin_dashboard": True,
            "dedicated_csm": True,
            "custom_integrations": True
        }
    }
    
    return features.get(tier, features["free"])


@router.delete("/account", response_model=SuccessResponse)
async def delete_account(current_user: dict = Depends(get_current_user)):
    """
    Delete the current user's account.
    Note: This should also clean up associated data (games, sessions, etc.)
    """
    users = get_users_collection()
    
    # In a full implementation, we'd also:
    # - Delete or archive user's games
    # - Cancel any subscriptions
    # - Remove from any classes
    # - etc.
    
    await users.delete_one({"id": current_user["id"]})
    
    logger.info(f"Account deleted: {current_user['email']}")
    
    return SuccessResponse(message="Account deleted successfully")
