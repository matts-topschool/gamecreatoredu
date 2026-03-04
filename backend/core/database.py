"""
MongoDB database connection and collection management.
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
import logging

from .config import settings

logger = logging.getLogger(__name__)

# Global database client and database reference
_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


def get_client() -> AsyncIOMotorClient:
    """Get MongoDB client instance."""
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.MONGO_URL)
        logger.info("MongoDB client initialized")
    return _client


def get_database() -> AsyncIOMotorDatabase:
    """Get database instance."""
    global _db
    if _db is None:
        client = get_client()
        _db = client[settings.DB_NAME]
        logger.info(f"Connected to database: {settings.DB_NAME}")
    return _db


# Convenience accessor
db = get_database()


# Collection accessors
def get_users_collection():
    return get_database().users


def get_games_collection():
    return get_database().games


def get_sessions_collection():
    return get_database().sessions


def get_session_events_collection():
    return get_database().session_events


def get_session_outcomes_collection():
    return get_database().session_outcomes


def get_marketplace_listings_collection():
    return get_database().marketplace_listings


def get_purchases_collection():
    return get_database().purchases


def get_classes_collection():
    return get_database().classes


async def create_indexes():
    """Create database indexes for optimal query performance."""
    db = get_database()
    
    # Users indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("google_id", sparse=True)
    
    # Games indexes
    await db.games.create_index("owner_id")
    await db.games.create_index("slug", unique=True)
    await db.games.create_index("status")
    await db.games.create_index("is_marketplace_listed")
    await db.games.create_index("subjects")
    await db.games.create_index("grade_levels")
    await db.games.create_index("standards_tags")
    
    # Sessions indexes
    await db.sessions.create_index("game_id")
    await db.sessions.create_index("teacher_id")
    await db.sessions.create_index("join_code", unique=True, sparse=True)
    await db.sessions.create_index("status")
    
    # Session events indexes
    await db.session_events.create_index("session_id")
    await db.session_events.create_index([("session_id", 1), ("created_at", -1)])
    await db.session_events.create_index("player_id")
    
    # Session outcomes indexes
    await db.session_outcomes.create_index([("session_id", 1), ("player_id", 1)], unique=True)
    
    # Marketplace indexes
    await db.marketplace_listings.create_index("seller_id")
    await db.marketplace_listings.create_index("listing_status")
    await db.marketplace_listings.create_index([("categories", 1), ("listing_status", 1)])
    
    # Purchases indexes
    await db.purchases.create_index("buyer_id")
    await db.purchases.create_index("seller_id")
    await db.purchases.create_index("game_id")
    
    # Classes indexes
    await db.classes.create_index("teacher_id")
    await db.classes.create_index("google_classroom_id", sparse=True)
    
    logger.info("Database indexes created successfully")


async def close_connection():
    """Close database connection."""
    global _client, _db
    if _client is not None:
        _client.close()
        _client = None
        _db = None
        logger.info("MongoDB connection closed")
