from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from app.models.user import User
from app.services.auth_service import AuthService

# HTTP Bearer token scheme for Swagger UI
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """
    Dependency to get current authenticated user from JWT token
    
    This dependency:
    1. Extracts the Bearer token from Authorization header
    2. Validates the JWT token
    3. Returns the current user
    4. Raises 401 if token is invalid or user not found
    
    Usage:
        @app.get("/protected")
        async def protected_route(current_user: User = Depends(get_current_user)):
            return {"user": current_user.email}
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Extract token from Bearer scheme
        token = credentials.credentials
        
        # Get user from token
        user = await AuthService.get_current_user_from_token(token)
        if user is None:
            raise credentials_exception
            
        return user
        
    except Exception:
        raise credentials_exception


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to get current active user
    Ensures the user account is not deactivated
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


# Role-based access control dependencies
async def get_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """Dependency that requires admin role (hotel admin or super admin)"""
    if current_user.role not in ["admin_hotel", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not Authorized to access this resource"
        )
    return current_user


async def get_super_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """Dependency that requires super admin role"""
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required"
        )
    return current_user


async def get_hotel_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """Dependency that requires hotel admin role for a specific hotel"""
    if current_user.role not in ["admin_hotel"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hotel admin access required"
        )
    return current_user


# Optional authentication - doesn't raise error if no token provided
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[User]:
    """
    Optional authentication dependency
    Returns User if valid token provided, None if no token or invalid token
    Useful for endpoints that have different behavior for authenticated vs anonymous users
    """
    if not credentials:
        return None
        
    try:
        token = credentials.credentials
        user = await AuthService.get_current_user_from_token(token)
        return user if user and user.is_active else None
    except Exception:
        return None
