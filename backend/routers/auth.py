"""
Authentication routes: register, login, logout, me.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
import logging

from core.config import settings
from core.database import get_users_collection
from core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)
from models.user import UserInDB, User, UserCreate, user_from_db
from schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    AuthResponse
)
from schemas.common import SuccessResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest):
    """
    Register a new user account.
    """
    users = get_users_collection()
    
    # Check if email already exists
    existing_user = await users.find_one({"email": request.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Create user
    user_in_db = UserInDB(
        email=request.email,
        display_name=request.display_name,
        password_hash=get_password_hash(request.password),
        role=request.role
    )
    
    # Insert into database
    await users.insert_one(user_in_db.to_mongo_dict())
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user_in_db.id, "email": user_in_db.email}
    )
    
    # Return user and token
    user = User(
        id=user_in_db.id,
        email=user_in_db.email,
        display_name=user_in_db.display_name,
        role=user_in_db.role,
        avatar_url=user_in_db.avatar_url,
        subscription_tier=user_in_db.subscription_tier,
        settings=user_in_db.settings,
        games_created=user_in_db.games_created,
        games_purchased=user_in_db.games_purchased,
        created_at=user_in_db.created_at,
        updated_at=user_in_db.updated_at
    )
    
    token = TokenResponse(
        access_token=access_token,
        expires_in=settings.JWT_EXPIRATION_HOURS * 3600
    )
    
    logger.info(f"New user registered: {user.email}")
    
    return AuthResponse(user=user, token=token)


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Login with email and password.
    """
    users = get_users_collection()
    
    # Find user by email
    user_doc = await users.find_one({"email": request.email})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(request.password, user_doc["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user_doc["id"], "email": user_doc["email"]}
    )
    
    # Return user (without password_hash) and token
    user_doc.pop("password_hash", None)
    user_doc.pop("_id", None)
    user = user_from_db(user_doc)
    
    token = TokenResponse(
        access_token=access_token,
        expires_in=settings.JWT_EXPIRATION_HOURS * 3600
    )
    
    logger.info(f"User logged in: {user.email}")
    
    return AuthResponse(user=user, token=token)


@router.get("/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user's information.
    """
    return user_from_db(current_user)


@router.post("/logout", response_model=SuccessResponse)
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout current user.
    Note: With JWT, actual invalidation requires token blacklisting.
    For now, this endpoint just confirms the logout intent.
    """
    logger.info(f"User logged out: {current_user.get('email')}")
    return SuccessResponse(message="Successfully logged out")


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(current_user: dict = Depends(get_current_user)):
    """
    Refresh the access token for the current user.
    """
    access_token = create_access_token(
        data={"sub": current_user["id"], "email": current_user["email"]}
    )
    
    return TokenResponse(
        access_token=access_token,
        expires_in=settings.JWT_EXPIRATION_HOURS * 3600
    )
