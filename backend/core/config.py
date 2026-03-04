"""
Application configuration loaded from environment variables.
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Database
    MONGO_URL: str
    DB_NAME: str
    
    # CORS
    CORS_ORIGINS: str = "*"
    
    # JWT Authentication
    JWT_SECRET: str = "gamecraft-edu-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    # AI Integration
    EMERGENT_LLM_KEY: str = ""
    
    # Google OAuth (Future)
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    
    # Stripe (Future)
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    
    # App Settings
    APP_NAME: str = "GameCraft EDU"
    DEBUG: bool = False
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        extra = "ignore"


# Create settings instance
settings = Settings()
