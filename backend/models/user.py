"""
User model definitions.
"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid


class UserRole(str, Enum):
    TEACHER = "teacher"
    STUDENT = "student"
    ADMIN = "admin"


class SubscriptionTier(str, Enum):
    FREE = "free"
    CREATOR = "creator"
    SCHOOL = "school"
    DISTRICT = "district"


class ThemePreference(str, Enum):
    LIGHT = "light"
    DARK = "dark"
    AUTO = "auto"


class UserSettings(BaseModel):
    """User preferences and settings."""
    theme: ThemePreference = ThemePreference.AUTO
    email_notifications: bool = True
    show_hints: bool = True


class UserBase(BaseModel):
    """Base user fields shared across schemas."""
    email: EmailStr
    display_name: str = Field(..., min_length=2, max_length=100)


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    display_name: Optional[str] = Field(None, min_length=2, max_length=100)
    avatar_url: Optional[str] = None
    settings: Optional[UserSettings] = None


class UserInDB(UserBase):
    """User as stored in database (includes password hash)."""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    password_hash: str
    role: UserRole = UserRole.TEACHER
    avatar_url: Optional[str] = None
    subscription_tier: SubscriptionTier = SubscriptionTier.FREE
    subscription_expires_at: Optional[datetime] = None
    stripe_customer_id: Optional[str] = None
    stripe_account_id: Optional[str] = None
    google_id: Optional[str] = None
    settings: UserSettings = Field(default_factory=UserSettings)
    games_created: int = 0
    games_purchased: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    def to_mongo_dict(self) -> dict:
        """Convert to dictionary for MongoDB storage."""
        data = self.model_dump()
        # Convert datetime to ISO string for MongoDB
        data['created_at'] = data['created_at'].isoformat()
        data['updated_at'] = data['updated_at'].isoformat()
        if data['subscription_expires_at']:
            data['subscription_expires_at'] = data['subscription_expires_at'].isoformat()
        # Convert nested models
        data['settings'] = self.settings.model_dump()
        return data


class User(UserBase):
    """User response schema (excludes sensitive fields)."""
    model_config = ConfigDict(extra="ignore")
    
    id: str
    role: UserRole
    avatar_url: Optional[str] = None
    subscription_tier: SubscriptionTier
    settings: UserSettings
    games_created: int = 0
    games_purchased: int = 0
    created_at: datetime
    updated_at: datetime


class UserPublic(BaseModel):
    """Public user info (for marketplace, etc.)."""
    id: str
    display_name: str
    avatar_url: Optional[str] = None
    games_created: int = 0


def user_from_db(doc: dict) -> User:
    """Convert MongoDB document to User model."""
    # Parse datetime strings
    if isinstance(doc.get('created_at'), str):
        doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    if isinstance(doc.get('updated_at'), str):
        doc['updated_at'] = datetime.fromisoformat(doc['updated_at'])
    
    return User(**doc)
