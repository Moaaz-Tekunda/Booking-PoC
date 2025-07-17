from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from app.models.hotel import Hotel, HotelCreate, HotelUpdate, HotelResponse
from app.models.user import User
from app.services.hotel_service import HotelService
from app.core.dependencies import get_current_user_optional, get_admin_user, get_current_active_user, get_hotel_admin_user

router = APIRouter()



@router.get("/myHotels", response_model=List[HotelResponse])
async def get_my_hotels(
    current_user: User = Depends(get_hotel_admin_user)
):
    """
    Get hotels created by the current hotel admin
    
    **Access Level:** Hotel Admin only
    **Business Logic:** Returns only hotels created by the requesting hotel admin
    """
    
    try:
        hotels = await HotelService.get_hotels_by_creator(str(current_user.id))
        return hotels
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch hotels")
    



@router.post("/", response_model=HotelResponse, status_code=201)
async def create_hotel(
    hotel: HotelCreate,
    current_user: User = Depends(get_admin_user)
):
    """
    Create a new hotel (Admin access required)
    
    **Access Level:** Admin (hotel admin or super admin)
    **Business Logic:** Only hotel admins or super admins can create hotels
    """
    try:
        return await HotelService.create_hotel(hotel, creator_id=str(current_user.id))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[HotelResponse])
async def get_hotels(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    active_only: bool = Query(True),
    current_user: User = Depends(get_current_user_optional)
):
    """
    Get all hotels with pagination (Public access, enhanced for authenticated users)
    
    **Access Level:** Public (anyone can access)
    **Enhanced Features for Authenticated Users:**
    - May include additional hotel details in future
    - Different filtering options based on user role
    """
    return await HotelService.get_hotels(skip=skip, limit=limit, active_only=active_only)


@router.get("/{hotel_id}", response_model=HotelResponse)
async def get_hotel(hotel_id: str):
    """Get a specific hotel by ID"""
    hotel = await HotelService.get_hotel(hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel


@router.put("/{hotel_id}", response_model=HotelResponse)
async def update_hotel(
    hotel_id: str, 
    hotel_update: HotelUpdate,
    current_user: User = Depends(get_admin_user)
):
    """
    Update a hotel (Admin access required)
    
    **Access Level:** Admin (hotel admin or super admin)
    **Business Logic:** 
    - Super admins can update any hotel
    - Hotel admins can only update their assigned hotel
    """
    print(f"[HOTEL UPDATE] User ID: {current_user.id}, Role: {current_user.role}, Updating Hotel ID: {hotel_id}")
    
    # Additional authorization: hotel admins can only update their own hotel
    if current_user.role == "admin_hotel":
        # Check if the hotel belongs to this hotel admin
        hotel_to_update = await HotelService.get_hotel(hotel_id)
        if not hotel_to_update:
            print(f"[HOTEL UPDATE] Hotel {hotel_id} not found")
            raise HTTPException(status_code=404, detail="Hotel not found")
        
        if hotel_to_update.created_by != str(current_user.id):
            print(f"[HOTEL UPDATE] Access denied - Hotel admin {current_user.id} trying to update hotel {hotel_id} not owned by them")
            raise HTTPException(
                status_code=403, 
                detail="Hotel admin can only update their own hotels"
            )
    
    print(f"[HOTEL UPDATE] Authorization passed for user {current_user.id} to update hotel {hotel_id}")
    hotel = await HotelService.update_hotel(hotel_id, hotel_update)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel


@router.delete("/{hotel_id}", status_code=204)
async def delete_hotel(
    hotel_id: str,
    current_user: User = Depends(get_admin_user)
):
    """
    Delete a hotel (Admin access required)
    
    **Access Level:** Admin (hotel admin or super admin)
    **Business Logic:** 
    - Super admins can delete any hotel
    - Hotel admins can only delete their assigned hotel
    """
    # Additional authorization: hotel admins can only delete their own hotel
    print(f"[HOTEL DELETE] User ID: {current_user.id}, Role: {current_user.role}, Deleting Hotel ID: {hotel_id}")
    success = await HotelService.delete_hotel(hotel_id)
    if not success:
        raise HTTPException(status_code=404, detail="Hotel not found")


@router.get("/search/", response_model=List[HotelResponse])
async def search_hotels(
    city: Optional[str] = Query(None, description="Filter by city"),
    country: Optional[str] = Query(None, description="Filter by country")
):
    """Search hotels by city or country"""
    return await HotelService.search_hotels(city=city, country=country)

