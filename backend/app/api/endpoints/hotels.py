from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from app.models.hotel import Hotel, HotelCreate, HotelUpdate, HotelResponse
from app.models.user import User
from app.services.hotel_service import HotelService
from app.core.dependencies import get_current_user_optional, get_admin_user, get_current_active_user

router = APIRouter()



@router.get("/myHotels", response_model=List[HotelResponse])
async def get_my_hotels(
    current_user: User = Depends(get_current_active_user)
):
    return await HotelService.get_hotels_by_creator(str(current_user.id))
    



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
    # Additional authorization: hotel admins can only update their own hotel
    if current_user.role == "admin_hotel" and current_user.hotel_id != hotel_id:
        raise HTTPException(
            status_code=403, 
            detail="Hotel admin can only update their assigned hotel"
        )
    
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
    if current_user.role == "admin_hotel" and current_user.hotel_id != hotel_id:
        raise HTTPException(
            status_code=403, 
            detail="Hotel admin can only delete their assigned hotel"
        )
    
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

