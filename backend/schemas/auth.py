"""
Authentication schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from models.user import User, UserRole, SubscriptionTier


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str = Field(..., min_length=1)


class RegisterRequest(BaseModel):
    """Registration request schema."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    display_name: str = Field(..., min_length=2, max_length=100)
    role: Optional[UserRole] = UserRole.TEACHER


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class AuthResponse(BaseModel):
    """Authentication response with user data."""
    user: User
    token: TokenResponse


class GoogleAuthRequest(BaseModel):
    """Google OAuth callback request."""
    code: str
    redirect_uri: Optional[str] = None


class PasswordResetRequest(BaseModel):
    """Password reset request."""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation."""
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)


class PasswordChangeRequest(BaseModel):
    """Password change for authenticated user."""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
