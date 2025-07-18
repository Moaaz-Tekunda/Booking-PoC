from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from app.models.user import User
from app.services.user_service import UserService
from app.services.hotel_service import HotelService
from app.services.booking_service import ReservationService
from app.core.dependencies import get_admin_user
from datetime import datetime, timedelta
from app.core.dependencies import get_hotel_admin_user


router = APIRouter()


class DashboardStats(BaseModel):
    total_users: int
    total_hotels: int
    total_bookings: int
    total_revenue: float
    active_hotels: int
    pending_bookings: int
    recent_activity: list[Dict[str, Any]]


class HotelAdminDashboardStats(BaseModel):
    my_hotels: int
    total_reservations: int
    recent_activity: list[Dict[str, Any]]


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_admin_user)
):
    """
    Get dashboard statistics (Admin access required)
    
    **Access Level:** Admin (hotel admin or super admin)
    **Returns:** Dashboard statistics including users, hotels, bookings, and revenue
    """
    try:
        # Get all users (filtered by hotel for hotel admins)
        if current_user.role == "admin_hotel" and current_user.hotel_id:
            users = await UserService.get_users_by_hotel(current_user.hotel_id, skip=0, limit=10000)
        else:
            users = await UserService.get_users(skip=0, limit=10000)
        
        # Get hotels (all for super admin, created hotels for hotel admin)
        if current_user.role == "admin_hotel":
            # Hotel admin sees only hotels they created
            hotels = await HotelService.get_hotels_by_creator(str(current_user.id))
        else:
            # Super admin sees all hotels
            hotels = await HotelService.get_hotels(skip=0, limit=10000, active_only=False)
        
        # Get all reservations
        if current_user.role == "admin_hotel":
            # Get all hotels created by this hotel admin
            admin_hotels = await HotelService.get_hotels_by_creator(str(current_user.id))
            reservations = []
            
            # Get reservations for all hotels created by this admin
            for hotel in admin_hotels:
                hotel_reservations = await ReservationService.get_reservations_by_hotel(
                    str(hotel.id), skip=0, limit=10000
                )
                reservations.extend(hotel_reservations)
        else:
            reservations = await ReservationService.get_reservations(skip=0, limit=10000)
        
        # Calculate statistics
        total_users = len(users)
        total_hotels = len(hotels)
        total_bookings = len(reservations)
        active_hotels = len([h for h in hotels if h.is_active])
        pending_bookings = len([r for r in reservations if r.status == "pending"])
        
        # Calculate total revenue
        total_revenue = sum(reservation.total_price for reservation in reservations)
        
        # Generate recent activity (mock data for now, can be enhanced later)
        recent_activity = []
        
        # Add recent user registrations
        recent_users = sorted(users, key=lambda x: x.created_at, reverse=True)[:3]
        for user in recent_users:
            time_ago = _time_ago(user.created_at)
            recent_activity.append({
                "type": "user_registration",
                "title": "New user registration",
                "description": f"{user.name} ({user.email}) joined",
                "time": time_ago,
                "icon": "users",
                "created_at": user.created_at  # Add for proper sorting
            })
        
        # Add recent hotel additions
        recent_hotels = sorted(hotels, key=lambda x: x.created_at, reverse=True)[:2]
        for hotel in recent_hotels:
            time_ago = _time_ago(hotel.created_at)
            recent_activity.append({
                "type": "hotel_added",
                "title": "New hotel added",
                "description": f"{hotel.name} in {hotel.city}",
                "time": time_ago,
                "icon": "building",
                "created_at": hotel.created_at  # Add for proper sorting
            })
        
        # Add recent bookings
        recent_reservations = sorted(reservations, key=lambda x: x.created_at, reverse=True)[:3]
        for reservation in recent_reservations:
            time_ago = _time_ago(reservation.created_at)
            recent_activity.append({
                "type": "booking_created",
                "title": "New booking",
                "description": f"Reservation for ${reservation.total_price}",
                "time": time_ago,
                "icon": "calendar",
                "created_at": reservation.created_at  # Add for proper sorting
            })
        
        # Sort recent activity by actual datetime (most recent first) and limit to 5 items
        recent_activity.sort(key=lambda x: x["created_at"], reverse=True)
        
        # Remove the created_at field before returning (it was just for sorting)
        for activity in recent_activity:
            del activity["created_at"]
            
        recent_activity = recent_activity[:5]
        
        return DashboardStats(
            total_users=total_users,
            total_hotels=total_hotels,
            total_bookings=total_bookings,
            total_revenue=total_revenue,
            active_hotels=active_hotels,
            pending_bookings=pending_bookings,
            recent_activity=recent_activity
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard stats: {str(e)}")


def _time_ago(created_at: datetime) -> str:
    """Helper function to calculate time ago"""
    now = datetime.utcnow()
    diff = now - created_at
    total_seconds = int(diff.total_seconds())
    
    if diff.days > 0:
        return f"{diff.days}d ago"
    elif total_seconds > 3600:
        hours = total_seconds // 3600
        return f"{hours}h ago"
    elif total_seconds > 60:
        minutes = total_seconds // 60
        return f"{minutes}m ago"
    else:   
        return "Just now"

@router.get("/hotel-admin", response_model=HotelAdminDashboardStats)  
async def get_hotel_admin_dashboard_stats(
    current_user: User = Depends(get_hotel_admin_user)
):
    if current_user.role != "admin_hotel":
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:               
        # Get all hotels created by this hotel admin
        hotels = await HotelService.get_hotels_by_creator(str(current_user.id))
        
        # Get reservations for all hotels created by this admin
        reservations = []
        for hotel in hotels:
            hotel_reservations = await ReservationService.get_reservations_by_hotel(
                str(hotel.id), skip=0, limit=10000
            )
            reservations.extend(hotel_reservations)
            
        total_hotels = len(hotels)
        total_reservations = len(reservations)

        recent_activity = generate_hotel_admin_recent_activity(reservations, hotels)

        return HotelAdminDashboardStats(
            my_hotels=total_hotels,
            total_reservations=total_reservations,
            recent_activity=recent_activity

       )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching hotel admin dashboard stats: {str(e)}")
    
def generate_hotel_admin_recent_activity(reservations, hotels):
    recent_activity = []
    
    # Add recent reservations (last 5)
    recent_reservations = sorted(reservations, key=lambda x: x.created_at, reverse=True)[:5]
    for reservation in recent_reservations:
        # Find which hotel this reservation belongs to
        hotel = next((h for h in hotels if str(h.id) == str(reservation.hotel_id)), None)
        hotel_name = hotel.name if hotel else "Unknown Hotel"
        
        time_ago = _time_ago(reservation.created_at)
        recent_activity.append({
            "type": "reservation_created",
            "title": "New reservation",
            "description": f"${reservation.total_price} booking at {hotel_name}",
            "time": time_ago,
            "icon": "calendar",
            "created_at": reservation.created_at  # Add for proper sorting
        })
    
    # Add recent hotel additions (last 2)
    recent_hotels = sorted(hotels, key=lambda x: x.created_at, reverse=True)[:2]
    for hotel in recent_hotels:
        time_ago = _time_ago(hotel.created_at)
        recent_activity.append({
            "type": "hotel_added",
            "title": "Hotel added",
            "description": f"{hotel.name} in {hotel.city}",
            "time": time_ago,
            "icon": "building",
            "created_at": hotel.created_at  # Add for proper sorting
        })
    
    # Sort by actual datetime (most recent first) and limit to 6 most recent activities
    recent_activity.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Remove the created_at field before returning (it was just for sorting)
    for activity in recent_activity:
        del activity["created_at"]
    
    return recent_activity[:6]
    
