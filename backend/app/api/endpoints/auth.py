from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional

from app.models.auth import TokenResponse, LoginRequest, RefreshRequest
from app.models.user import User
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_active_user

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest, request: Request):
    """
    Authenticate user and return access + refresh tokens
    
    **Process:**
    1. Validates email and password
    2. Creates JWT access token (expires in 30 minutes)
    3. Creates JWT refresh token (expires in 7 days)
    4. Stores refresh token hash in database
    5. Returns both tokens to client
    
    **Usage:**
    - Store access token for API calls
    - Store refresh token securely for getting new access tokens
    - Include access token in Authorization header: `Bearer <access_token>`
    """
    # Get client info for tracking (optional)
    user_agent = request.headers.get("user-agent", "Unknown")
    client_ip = request.client.host if request.client else "Unknown"
    device_info = f"{user_agent} - {client_ip}"

    # Authenticate and generate tokens
    token_response = await AuthService.login(
        email=login_data.email,
        password=login_data.password,
        device_info=device_info
    )
    
    if not token_response:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return token_response


@router.post("/login/oauth", response_model=TokenResponse)
async def login_oauth(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2 compatible login endpoint for Swagger UI
    
    This endpoint provides the same functionality as /login but uses
    OAuth2PasswordRequestForm which makes the Swagger UI "Authorize" button work.
    
    In Swagger UI:
    1. Click "Authorize" button
    2. Enter username (email) and password
    3. Click "Authorize"
    4. The token will be automatically included in requests
    """
    token_response = await AuthService.login(
        email=form_data.username,  # OAuth2 form uses 'username' field for email
        password=form_data.password
    )
    
    if not token_response:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return token_response


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_data: RefreshRequest):
    """
    Get new access token using refresh token
    
    **When to use:**
    - When access token expires (you get 401 Unauthorized)
    - Proactively refresh before expiration
    
    **Process:**
    1. Validates refresh token
    2. Checks if refresh token exists and is active in database
    3. Generates new access token
    4. Returns new access token + same refresh token
    
    **Security Features:**
    - Refresh tokens are stored as hashes in database
    - Expired refresh tokens are automatically rejected
    - Revoked refresh tokens cannot be used
    """
    token_response = await AuthService.refresh_access_token(refresh_data.refresh_token)
    
    if not token_response:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return token_response


@router.post("/logout")
async def logout(
    refresh_data: RefreshRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Logout user by revoking refresh token
    
    **Process:**
    1. Validates current access token (via dependency)
    2. Revokes the provided refresh token
    3. Client should discard both access and refresh tokens
    
    **Security Note:**
    - Access tokens cannot be revoked (they expire naturally)
    - Only refresh tokens are revoked in the database
    - Client must discard access token for security
    """
    success = await AuthService.logout(
        refresh_token=refresh_data.refresh_token,
        user_id=str(current_user.id)
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not logout - invalid refresh token"
        )
    
    return {"message": "Successfully logged out"}


@router.post("/logout-all")
async def logout_all_devices(current_user: User = Depends(get_current_active_user)):
    """
    Logout user from all devices by revoking all refresh tokens
    
    **Use cases:**
    - Security breach - logout from all devices
    - Password change - force re-login everywhere
    - Account settings - "Sign out of all devices" feature
    
    **Process:**
    1. Revokes ALL refresh tokens for the user
    2. User will need to login again on all devices
    3. Current access tokens will still work until they expire
    """
    revoked_count = await AuthService.logout_all_devices(str(current_user.id))
    
    return {
        "message": f"Successfully logged out from {revoked_count} devices",
        "revoked_tokens": revoked_count
    }


@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """
    Get current authenticated user information
    
    **Purpose:**
    - Verify token is valid
    - Get user profile information
    - Check user role and permissions
    
    **Usage:**
    Include access token in Authorization header:
    `Authorization: Bearer <your_access_token>`
    """
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "hotel_id": current_user.hotel_id,
        "is_active": current_user.is_active,
        "last_login": current_user.last_login
    }


@router.post("/verify-token")
async def verify_token(current_user: User = Depends(get_current_active_user)):
    """
    Simple endpoint to verify if access token is valid
    
    **Returns:**
    - 200 OK if token is valid
    - 401 Unauthorized if token is invalid/expired
    
    **Use case:**
    Frontend can call this to check if user is still authenticated
    before making important API calls
    """
    return {"valid": True, "user_id": str(current_user.id)}
