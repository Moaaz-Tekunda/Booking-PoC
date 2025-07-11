from beanie import Document
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class RefreshToken(Document):
    """
    Model to store refresh tokens in the database
    
    This allows us to:
    - Track active refresh tokens per user
    - Revoke refresh tokens when needed (logout, security breach)
    - Prevent replay attacks with already used refresh tokens
    """
    user_id: str
    token_hash: str  # We store hash of the token, not the token itself
    expires_at: datetime
    is_active: bool = True
    created_at: datetime = datetime.utcnow()
    device_info: Optional[str] = None  # Optional: track device/browser info
    
    class Settings:
        name = "refresh_tokens"
        indexes = [
            "user_id",
            "token_hash",
            "expires_at",
            "is_active"
        ]


class TokenResponse(BaseModel):
    """Response model for authentication endpoints"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # Access token expiration in seconds


class LoginRequest(BaseModel):
    """Request model for login endpoint"""
    email: str
    password: str


class RefreshRequest(BaseModel):
    """Request model for refresh token endpoint"""
    refresh_token: str
