from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List
from app.models.room import RoomCreate, RoomUpdate, RoomResponse
from app.models.user import User
from app.services.room_service import RoomService
from app.core.dependencies import get_current_user_optional, get_admin_user

router = APIRouter()

@router.post("/", response_model=RoomResponse, status_code=201)
async def create_room(
    room: RoomCreate,
    current_user: User = Depends(get_admin_user)
):
    """
    Create a new room (Admin access required)
    
    **Access Level:** Admin (hotel admin or super admin)
    **Business Logic:**
    - Hotel admins can only create rooms for hotels they created
    - Super admins can create rooms for any hotel
    """

    if current_user.role == "admin_hotel":
    
        from app.services.hotel_service import HotelService
        hotel = await HotelService.get_hotel(room.hotel_id)
        
        if not hotel:
            raise HTTPException(
                status_code=404,
                detail="Hotel not found"
            )
        
        if hotel.created_by != str(current_user.id):
            raise HTTPException(
                status_code=403,
                detail="Hotel admin can only create rooms for hotels they own"
            )
    
    created_room = await RoomService.create_room(room)
    if not created_room:
        raise HTTPException(
            status_code=400, 
            detail="Could not create room. Hotel may not exist or room number already exists."
        )
    return created_room

@router.get("/", response_model=List[RoomResponse])
async def get_rooms(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    available_only: bool = Query(False),
    current_user: User = Depends(get_current_user_optional)
):
    """
    Get all rooms with pagination (Public access, enhanced for authenticated users)
    
    **Access Level:** Public
    **Enhanced Features for Authenticated Users:**
    - May show additional room details or availability
    """
    return await RoomService.get_rooms(skip=skip, limit=limit, available_only=available_only)


@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(room_id: str):
    """
    Get a specific room by ID (Public access)
    
    **Access Level:** Public
    **Business Logic:** Anyone can view room details for booking purposes
    """
    room = await RoomService.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@router.get("/hotel/{hotel_id}", response_model=List[RoomResponse])
async def get_rooms_by_hotel(
    hotel_id: str,
    available_only: bool = Query(False)
):
    """
    Get all rooms for a specific hotel (Public access)
    
    **Access Level:** Public
    **Business Logic:** Anyone can view hotel rooms for booking purposes
    """
    return await RoomService.get_rooms_by_hotel(hotel_id, available_only=available_only)


@router.put("/{room_id}", response_model=RoomResponse)
async def update_room(
    room_id: str, 
    room_update: RoomUpdate,
    current_user: User = Depends(get_admin_user)
):
    """
    Update a room (Admin access required)
    
    **Access Level:** Admin (hotel admin or super admin)
    **Business Logic:**
    - Hotel admins can only update rooms from their assigned hotel
    - Super admins can update rooms from any hotel
    """
    # Get the room to check hotel ownership
    existing_room = await RoomService.get_room(room_id)
    if not existing_room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Hotel admins can only update rooms from hotels they created
    if current_user.role == "admin_hotel":
        from app.services.hotel_service import HotelService
        hotel = await HotelService.get_hotel(existing_room.hotel_id)
        
        if not hotel:
            raise HTTPException(
                status_code=404,
                detail="Hotel not found"
            )
        
        if hotel.created_by != str(current_user.id):
            raise HTTPException(
                status_code=403,
                detail="Hotel admin can only update rooms from hotels they own"
            )
    
    room = await RoomService.update_room(room_id, room_update)
    if not room:
        raise HTTPException(
            status_code=404, 
            detail="Room not found or room number already exists"
        )
    return room


@router.delete("/{room_id}", status_code=204)
async def delete_room(
    room_id: str,
    current_user: User = Depends(get_admin_user)
):
    """
    Delete a room (Admin access required)
    
    **Access Level:** Admin (hotel admin or super admin)
    **Business Logic:**
    - Hotel admins can only delete rooms from their assigned hotel
    - Super admins can delete rooms from any hotel
    """
    # Get the room to check hotel ownership
    existing_room = await RoomService.get_room(room_id)
    if not existing_room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Hotel admins can only delete rooms from hotels they created
    if current_user.role == "admin_hotel":
        from app.services.hotel_service import HotelService
        hotel = await HotelService.get_hotel(existing_room.hotel_id)
        
        if not hotel:
            raise HTTPException(
                status_code=404,
                detail="Hotel not found"
            )
        
        if hotel.created_by != str(current_user.id):
            raise HTTPException(
                status_code=403,
                detail="Hotel admin can only delete rooms from hotels they own"
            )
    
    success = await RoomService.delete_room(room_id)
    if not success:
        raise HTTPException(status_code=404, detail="Room not found")
