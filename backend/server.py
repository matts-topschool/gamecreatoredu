"""
GameCraft EDU - Main FastAPI Application
AI-Powered Game Creation & Marketplace for Educators
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import sys
from pathlib import Path

# Add backend directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from core.config import settings
from core.database import create_indexes, close_connection
from routers import auth_router, games_router, users_router
from routers.sessions import router as sessions_router
from routers.analytics import router as analytics_router
from routers.ai import router as ai_router
from routers.leaderboard import router as leaderboard_router
from routers.classes import router as classes_router
from schemas.common import HealthCheckResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown."""
    # Startup
    logger.info(f"Starting {settings.APP_NAME}...")
    try:
        await create_indexes()
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error(f"Failed to create indexes: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    await close_connection()


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Game Creation & Marketplace for Educators",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix
app.include_router(auth_router, prefix="/api")
app.include_router(games_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(sessions_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(leaderboard_router, prefix="/api")
app.include_router(classes_router, prefix="/api")


# Root endpoint
@app.get("/api/", tags=["Root"])
async def root():
    """API root endpoint."""
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": "1.0.0",
        "docs": "/docs"
    }


# Health check endpoint
@app.get("/api/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring."""
    return HealthCheckResponse(
        status="healthy",
        version="1.0.0",
        database="connected"
    )
