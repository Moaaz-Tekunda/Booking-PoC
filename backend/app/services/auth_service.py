from typing import Optional, Tuple
from datetime import datetime, timedelta, timezone
import hashlib
from beanie import PydanticObjectId

from app.models.user import User
from app.models.auth import RefreshToken, TokenResponse
from app.services.user_service import UserService
from app.core.security import create_access_token, create_refresh_token, verify_token
from app.core.config import settings


class AuthService:
    
    @staticmethod
    def _hash_token(token: str) -> str:
        """Create a hash of the token for secure storage"""
        return hashlib.sha256(token.encode()).hexdigest()
    
    @staticmethod
    async def login(email: str, password: str, device_info: Optional[str] = None) -> Optional[TokenResponse]:
        """
        Authenticate user and return access + refresh tokens
        
        Args:
            email: User's email
            password: User's password
            device_info: Optional device/browser information
            
        Returns:
            TokenResponse with access and refresh tokens, or None if authentication fails
        """
        # Authenticate user
        user = await UserService.authenticate_user(email, password)
        if not user:
            return None
            
        if not user.is_active:
            return None  # User account is deactivated
        
        # Create token payload
        token_data = {
            "sub": str(user.id),  # Subject (user ID)
            "email": user.email,
            "role": user.role,
            "hotel_id": user.hotel_id
        }
        
        # Create tokens
        access_token = create_access_token(data=token_data)
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        # Store refresh token in database
        refresh_token_doc = RefreshToken(
            user_id=str(user.id),
            token_hash=AuthService._hash_token(refresh_token),
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            device_info=device_info
        )
        await refresh_token_doc.create()
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    @staticmethod
    async def refresh_access_token(refresh_token: str) -> Optional[TokenResponse]:
        """
        Generate new access token using refresh token
        
        Args:
            refresh_token: The refresh token
            
        Returns:
            New TokenResponse with fresh access token, or None if refresh token is invalid
        """
        # Verify refresh token
        payload = verify_token(refresh_token, token_type="refresh")
        if not payload:
            return None
            
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        # Check if refresh token exists in database and is active
        token_hash = AuthService._hash_token(refresh_token)
        stored_token = await RefreshToken.find_one({
            "user_id": user_id,
            "token_hash": token_hash,
            "is_active": True,
            "expires_at": {"$gte": datetime.now(timezone.utc)}
        })
        
        if not stored_token:
            return None  # Token not found, expired, or revoked
        
        # Get user details for new access token
        user = await User.get(PydanticObjectId(user_id))
        if not user or not user.is_active:
            return None
        
        # Create new access token
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "hotel_id": user.hotel_id
        }
        
        new_access_token = create_access_token(data=token_data)
        
        # Optionally rotate refresh token (create new one and deactivate old one)
        # For now, we'll keep the same refresh token active
        
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=refresh_token,  # Return same refresh token
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    @staticmethod
    async def logout(refresh_token: str, user_id: Optional[str] = None) -> bool:
        """
        Logout user by revoking refresh token
        
        Args:
            refresh_token: The refresh token to revoke
            user_id: Optional user ID for additional validation
            
        Returns:
            True if logout successful, False otherwise
        """
        token_hash = AuthService._hash_token(refresh_token)
        
        # Find and deactivate the refresh token
        query = {"token_hash": token_hash, "is_active": True}
        if user_id:
            query["user_id"] = user_id
            
        result = await RefreshToken.find_one(query)
        if result:
            await result.update({"$set": {"is_active": False}})
            return True
        
        return False
    
    @staticmethod
    async def logout_all_devices(user_id: str) -> int:
        """
        Logout user from all devices by revoking all their refresh tokens
        
        Args:
            user_id: The user ID
            
        Returns:
            Number of tokens revoked
        """
        result = await RefreshToken.find({"user_id": user_id, "is_active": True}).update_many(
            {"$set": {"is_active": False}}
        )
        return result.modified_count
    
    @staticmethod
    async def get_current_user_from_token(token: str) -> Optional[User]:
        """
        Get current user from access token
        
        Args:
            token: JWT access token
            
        Returns:
            User object if token is valid, None otherwise
        """
        payload = verify_token(token, token_type="access")
        if not payload:
            return None
            
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        try:
            user = await User.get(PydanticObjectId(user_id))
            if user and user.is_active:
                return user
        except Exception:
            pass
            
        return None
    
    @staticmethod
    async def cleanup_expired_tokens() -> int:
        """
        Clean up expired refresh tokens from database
        This should be run periodically (e.g., daily cron job)
        
        Returns:
            Number of tokens deleted
        """
        result = await RefreshToken.find({
            "expires_at": {"$lt": datetime.now(timezone.utc)}
        }).delete()
        
        return result.deleted_count
