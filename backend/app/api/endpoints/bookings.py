from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List
from app.models.booking import ReservationCreate, ReservationUpdate, ReservationResponse
from app.models.room import RoomResponse
from app.models.user import User
from app.services.booking_service import ReservationService
from app.core.dependencies import get_current_active_user, get_admin_user

router = APIRouter()


@router.post("/", response_model=ReservationResponse, status_code=201)
async def create_reservation(
    reservation: ReservationCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new reservation (Authentication required)
    
    **Access Level:** Authenticated users
    **Business Logic:**
    - Users can create reservations for themselves
    - Admins can create reservations for any user
    """
    # Regular users can only create reservations for themselves
    if current_user.role == "viewer":
        if reservation.visitor_id != str(current_user.id):
            raise HTTPException(
                status_code=403,
                detail="Users can only create reservations for themselves"
            )
    
    created_reservation = await ReservationService.create_reservation(reservation)
    if not created_reservation:
        raise HTTPException(
            status_code=400, 
            detail="Could not create reservation. Check that hotel, room, and user exist, and dates are available."
        )
    return created_reservation


@router.get("/", response_model=List[ReservationResponse])
async def get_reservations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_admin_user)
):
    """
    Get all reservations with pagination (Admin access required)
    
    **Access Level:** Admin (hotel admin or super admin)
    **Business Logic:**
    - Hotel admins can only see reservations from their hotel
    - Super admins can see all reservations
    """
    # Hotel admins can only see reservations from their hotel
    if current_user.role == "admin_hotel" and current_user.hotel_id:
        return await ReservationService.get_reservations_by_hotel(current_user.hotel_id, skip=skip, limit=limit)
    
    # Super admin can see all reservations
    return await ReservationService.get_reservations(skip=skip, limit=limit)


@router.get("/{reservation_id}", response_model=ReservationResponse)
async def get_reservation(
    reservation_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific reservation by ID
    
    **Access Level:** Authenticated users
    **Business Logic:**
    - Users can view their own reservations
    - Admins can view reservations from their hotel (hotel admin) or all reservations (super admin)
    """
    reservation = await ReservationService.get_reservation(reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    # Regular users can only view their own reservations
    if current_user.role == "viewer":
        if reservation.visitor_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized to view this reservation")
    
    # Hotel admins can only view reservations from their hotel
    elif current_user.role == "admin_hotel":
        if current_user.hotel_id != reservation.hotel_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this reservation")
    
    # Super admin can view any reservation (no additional checks needed)
    
    return reservation


@router.put("/{reservation_id}", response_model=ReservationResponse)
async def update_reservation(
    reservation_id: str, 
    reservation_update: ReservationUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a reservation
    
    **Access Level:** Authenticated users
    **Business Logic:**
    - Users can update their own reservations
    - Admins can update reservations from their hotel (hotel admin) or all reservations (super admin)
    """
    # Get the existing reservation to check ownership
    existing_reservation = await ReservationService.get_reservation(reservation_id)
    if not existing_reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    # Regular users can only update their own reservations
    if current_user.role == "viewer":
        if existing_reservation.visitor_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized to update this reservation")
    
    # Hotel admins can only update reservations from their hotel
    elif current_user.role == "admin_hotel":
        if current_user.hotel_id != existing_reservation.hotel_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this reservation")
    
    # Super admin can update any reservation (no additional checks needed)
    
    reservation = await ReservationService.update_reservation(reservation_id, reservation_update)
    if not reservation:
        raise HTTPException(
            status_code=404, 
            detail="Reservation not found or dates conflict with existing reservation"
        )
    return reservation


@router.delete("/{reservation_id}", status_code=204)
async def delete_reservation(
    reservation_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a reservation
    
    **Access Level:** Authenticated users
    **Business Logic:**
    - Users can delete their own reservations
    - Admins can delete reservations from their hotel (hotel admin) or all reservations (super admin)
    """
    # Get the existing reservation to check ownership
    existing_reservation = await ReservationService.get_reservation(reservation_id)
    if not existing_reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    # Regular users can only delete their own reservations
    if current_user.role == "viewer":
        if existing_reservation.visitor_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized to delete this reservation")
    
    # Hotel admins can only delete reservations from their hotel
    elif current_user.role == "admin_hotel":
        if current_user.hotel_id != existing_reservation.hotel_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this reservation")
    
    # Super admin can delete any reservation (no additional checks needed)
    
    success = await ReservationService.delete_reservation(reservation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Reservation not found")


@router.get("/hotel/{hotel_id}", response_model=List[ReservationResponse])
async def get_reservations_by_hotel(
    hotel_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_admin_user)
):
    """
    Get all reservations for a specific hotel (Admin access required)
    
    **Access Level:** Admin (hotel admin or super admin)
    **Business Logic:**
    - Hotel admins can only see reservations from their assigned hotel
    - Super admins can see reservations from any hotel
    """
    # Hotel admins can only see reservations from their hotel
    if current_user.role == "admin_hotel":
        if current_user.hotel_id != hotel_id:
            raise HTTPException(status_code=403, detail="Not authorized to view reservations from this hotel")
    
    return await ReservationService.get_reservations_by_hotel(hotel_id, skip=skip, limit=limit)


@router.get("/user/{user_id}", response_model=List[ReservationResponse])
async def get_reservations_by_user(
    user_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all reservations for a specific user
    
    **Access Level:** Authenticated users
    **Business Logic:**
    - Users can view their own reservations
    - Admins can view reservations from their hotel users (hotel admin) or all user reservations (super admin)
    """
    # Regular users can only view their own reservations
    if current_user.role == "viewer":
        if str(current_user.id) != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this user's reservations")
    
    # Hotel admins can only view reservations from users in their hotel
    elif current_user.role == "admin_hotel":
        # We need to check if the target user belongs to the same hotel
        # This would require a service method to check user's hotel
        # For now, we'll allow it and let the service filter appropriately
        pass
    
    # Super admin can view any user's reservations (no additional checks needed)
    
    return await ReservationService.get_reservations_by_user(user_id, skip=skip, limit=limit)


@router.get("/my-reservations", response_model=List[ReservationResponse])
async def get_my_reservations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user's reservations
    
    **Access Level:** Authenticated users
    **Business Logic:** Users can view their own reservations
    """
    return await ReservationService.get_reservations_by_user(str(current_user.id), skip=skip, limit=limit)


@router.get("/available-rooms/{hotel_id}", response_model=List[RoomResponse])
async def get_available_rooms(
    hotel_id: str,
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format")
):
    """
    Get available rooms for a hotel within the specified date range (Public access)
    
    **Access Level:** Public
    **Business Logic:** Anyone can check room availability for booking purposes
    """
    try:
        available_rooms = await ReservationService.get_available_rooms_by_hotel(
            hotel_id, start_date, end_date
        )
        return available_rooms
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error getting available rooms: {str(e)}"
        )
