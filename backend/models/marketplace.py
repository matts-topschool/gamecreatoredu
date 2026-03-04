"""
Marketplace models - Listings, reviews, purchases, and collections.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid


class MarketplaceCategory(str, Enum):
    """Top-level categories for marketplace."""
    MATHEMATICS = "mathematics"
    ENGLISH_LANGUAGE_ARTS = "english_language_arts"
    SCIENCE = "science"
    SOCIAL_STUDIES = "social_studies"
    WORLD_LANGUAGES = "world_languages"
    ARTS = "arts"
    HEALTH_PE = "health_pe"
    TECHNOLOGY = "technology"
    OTHER = "other"


class MarketplaceSubcategory(BaseModel):
    """Subcategory within a main category."""
    id: str
    name: str
    parent_category: MarketplaceCategory


# Predefined subcategories
SUBCATEGORIES = {
    MarketplaceCategory.MATHEMATICS: [
        {"id": "arithmetic", "name": "Arithmetic"},
        {"id": "algebra", "name": "Algebra"},
        {"id": "geometry", "name": "Geometry"},
        {"id": "fractions", "name": "Fractions & Decimals"},
        {"id": "measurement", "name": "Measurement"},
        {"id": "data_analysis", "name": "Data Analysis"},
        {"id": "pre_calculus", "name": "Pre-Calculus"},
    ],
    MarketplaceCategory.ENGLISH_LANGUAGE_ARTS: [
        {"id": "reading", "name": "Reading Comprehension"},
        {"id": "writing", "name": "Writing"},
        {"id": "grammar", "name": "Grammar"},
        {"id": "vocabulary", "name": "Vocabulary"},
        {"id": "spelling", "name": "Spelling"},
        {"id": "phonics", "name": "Phonics"},
        {"id": "literature", "name": "Literature"},
    ],
    MarketplaceCategory.SCIENCE: [
        {"id": "biology", "name": "Biology"},
        {"id": "chemistry", "name": "Chemistry"},
        {"id": "physics", "name": "Physics"},
        {"id": "earth_science", "name": "Earth Science"},
        {"id": "environmental", "name": "Environmental Science"},
        {"id": "life_science", "name": "Life Science"},
    ],
    MarketplaceCategory.SOCIAL_STUDIES: [
        {"id": "history", "name": "History"},
        {"id": "geography", "name": "Geography"},
        {"id": "civics", "name": "Civics"},
        {"id": "economics", "name": "Economics"},
        {"id": "world_cultures", "name": "World Cultures"},
    ],
}


class GameReview(BaseModel):
    """A review/rating for a game."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    game_id: str
    reviewer_id: str
    reviewer_name: str
    
    rating: int = Field(..., ge=1, le=5)  # 1-5 stars
    title: Optional[str] = None
    content: Optional[str] = None
    
    # Helpfulness
    helpful_count: int = 0
    
    # Verification
    verified_purchase: bool = False
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    def to_mongo_dict(self) -> dict:
        data = self.model_dump()
        data['created_at'] = data['created_at'].isoformat()
        data['updated_at'] = data['updated_at'].isoformat()
        return data


class GameReviewCreate(BaseModel):
    """Schema for creating a review."""
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = Field(None, max_length=100)
    content: Optional[str] = Field(None, max_length=2000)


class GamePurchase(BaseModel):
    """A purchase/acquisition of a game."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    game_id: str
    buyer_id: str
    seller_id: str
    
    # Purchase details
    price_cents: int
    license_type: str
    
    # Payment
    payment_method: str = "free"  # free, stripe, credits
    payment_id: Optional[str] = None  # Stripe payment ID
    
    # Status
    status: str = "completed"  # pending, completed, refunded
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    def to_mongo_dict(self) -> dict:
        data = self.model_dump()
        data['created_at'] = data['created_at'].isoformat()
        return data


class GameCollection(BaseModel):
    """A curated collection of games."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    creator_id: str
    
    name: str
    description: Optional[str] = None
    slug: str
    
    game_ids: List[str] = Field(default_factory=list)
    
    is_public: bool = True
    is_featured: bool = False
    
    # Stats
    follower_count: int = 0
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class MarketplaceListing(BaseModel):
    """Extended listing data for marketplace display."""
    # Game base info
    id: str
    title: str
    description: str
    slug: str
    thumbnail_url: Optional[str]
    
    # Creator info
    creator_id: str
    creator_name: str
    creator_avatar: Optional[str] = None
    
    # Game type & settings
    game_type: str
    grade_levels: List[int]
    subjects: List[str]
    
    # Marketplace specific
    category: Optional[str] = None
    subcategory: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    
    # Pricing
    is_free: bool = True
    price_cents: int = 0
    license_type: str = "single"
    
    # Stats
    play_count: int = 0
    avg_rating: float = 0.0
    review_count: int = 0
    purchase_count: int = 0
    
    # SEO
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: List[str] = Field(default_factory=list)
    
    # Timestamps
    published_at: Optional[datetime] = None
    created_at: datetime


class MarketplaceListingCreate(BaseModel):
    """Schema for publishing a game to marketplace."""
    game_id: str
    
    # Category & Tags
    category: MarketplaceCategory
    subcategory: Optional[str] = None
    tags: List[str] = Field(default_factory=list, max_length=10)
    
    # Pricing
    is_free: bool = True
    price_cents: int = Field(default=0, ge=0)
    license_type: str = "single"
    
    # SEO
    seo_title: Optional[str] = Field(None, max_length=60)
    seo_description: Optional[str] = Field(None, max_length=160)
    seo_keywords: List[str] = Field(default_factory=list, max_length=10)


class MarketplaceSearchParams(BaseModel):
    """Search/filter parameters for marketplace."""
    query: Optional[str] = None
    
    # Filters
    categories: List[str] = Field(default_factory=list)
    subcategories: List[str] = Field(default_factory=list)
    grade_levels: List[int] = Field(default_factory=list)
    game_types: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    
    # Price filter
    is_free: Optional[bool] = None
    max_price_cents: Optional[int] = None
    
    # Rating filter
    min_rating: Optional[float] = None
    
    # Sorting
    sort_by: str = "popular"  # popular, newest, rating, price_low, price_high
    
    # Pagination
    page: int = 1
    limit: int = 20


class MarketplaceSearchResult(BaseModel):
    """Search results with pagination."""
    listings: List[MarketplaceListing]
    total: int
    page: int
    limit: int
    total_pages: int
    
    # Facets for filtering UI
    facets: Dict[str, List[Dict[str, Any]]] = Field(default_factory=dict)


class PublisherProfile(BaseModel):
    """Public profile for a game creator/publisher."""
    user_id: str
    display_name: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    
    # Stats
    total_games: int = 0
    total_plays: int = 0
    avg_rating: float = 0.0
    follower_count: int = 0
    
    # Featured games
    featured_game_ids: List[str] = Field(default_factory=list)
    
    # Verification
    is_verified: bool = False
    
    joined_at: datetime


class FeaturedSection(BaseModel):
    """A featured section on the marketplace homepage."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    subtitle: Optional[str] = None
    
    section_type: str = "games"  # games, collection, category, creator
    
    # Content
    game_ids: List[str] = Field(default_factory=list)
    collection_id: Optional[str] = None
    category: Optional[str] = None
    creator_id: Optional[str] = None
    
    # Display
    display_order: int = 0
    is_active: bool = True
    
    # Styling
    background_color: Optional[str] = None
    icon: Optional[str] = None
