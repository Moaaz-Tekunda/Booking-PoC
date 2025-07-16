from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, ConfigDict
from pathlib import Path


class Settings(BaseSettings):
    model_config = ConfigDict(
        env_file=Path(__file__).parent.parent.parent / ".env",
        extra="ignore"
    )
    
    PROJECT_NAME: str = "Booking API"
    API_STR: str = "/api"
    
    # MongoDB settings - these will be overridden by .env values
    MONGODB_URL: str
    DATABASE_NAME: str = "booking_db"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Debug mode
    DEBUG: bool = True


settings = Settings()