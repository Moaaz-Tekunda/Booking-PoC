from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List
from app.models.user import UserCreate, UserUpdate, UserResponse, User
from app.services.user_service import UserService
from app.core.dependencies import get_current_active_user, get_admin_user, get_super_admin_user

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_admin_user)
):
    """
    Get all users (Admin access required)
    
    **Access Level:** Admin (hotel admin or super admin)
    **Business Logic:** 
    - Super admins can see all users
    - Hotel admins can only see users from their hotel
    """
    # If hotel admin, filter by hotel_id
    if current_user.role == "admin_hotel" and current_user.hotel_id:
        return await UserService.get_users_by_hotel(current_user.hotel_id, skip=skip, limit=limit)
    
    # Super admin can see all users
    return await UserService.get_users(skip=skip, limit=limit)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific user by ID
    
    **Access Level:** Authenticated users
    **Business Logic:**
    - Users can view their own profile
    - Admins can view users from their hotel (hotel admin) or all users (super admin)
    """
    user = await UserService.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Users can only view their own profile
    if current_user.role == "viewer":
        if str(current_user.id) != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this user")
    
    # Hotel admins can only view users from their hotel
    elif current_user.role == "admin_hotel":
        if current_user.hotel_id != user.hotel_id and str(current_user.id) != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this user")
    
    # Super admin can view any user (no additional checks needed)
    
    return user


@router.post("/", response_model=UserResponse)
async def create_user(user_data: UserCreate):
    """
    Create a new user (Public access - for user registration)
    
    **Access Level:** Public
    **Business Logic:** 
    - Anyone can register as a viewer
    - Only super admins can create admin users (handled in service layer)
    """
    return await UserService.create_user(user_data)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str, 
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a user
    
    **Access Level:** Authenticated users
    **Business Logic:**
    - Users can update their own profile
    - Admins can update users from their hotel (hotel admin) or all users (super admin)
    - Role changes require super admin
    """
    # Users can only update their own profile
    if current_user.role == "viewer":
        if str(current_user.id) != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this user")
    
    # Hotel admins can only update users from their hotel
    elif current_user.role == "admin_hotel":
        user_to_update = await UserService.get_user(user_id)
        if not user_to_update:
            raise HTTPException(status_code=404, detail="User not found")
        
        if current_user.hotel_id != user_to_update.hotel_id and str(current_user.id) != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this user")
    
    # Super admin can update any user (no additional checks needed)
    
    user = await UserService.update_user(user_id, user_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_super_admin_user)
):
    """
    Delete a user (Super admin access required)
    
    **Access Level:** Super admin only
    **Business Logic:** Only super admins can delete users
    """
    deleted = await UserService.delete_user(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}


@router.get("/hotel/{hotel_id}", response_model=List[UserResponse])
async def get_users_by_hotel(
    hotel_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_admin_user)
):
    """
    Get all users for a specific hotel (Admin access required)
    
    **Access Level:** Admin (hotel admin or super admin)
    **Business Logic:**
    - Hotel admins can only see users from their hotel
    - Super admins can see users from any hotel
    """
    # Hotel admins can only see users from their hotel
    if current_user.role == "admin_hotel":
        if current_user.hotel_id != hotel_id:
            raise HTTPException(status_code=403, detail="Not authorized to view users from this hotel")
    
    return await UserService.get_users_by_hotel(hotel_id, skip=skip, limit=limit)
