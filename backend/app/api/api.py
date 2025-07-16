from fastapi import APIRouter

from app.api.endpoints import bookings, users, hotels, rooms, auth, dashboard

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(hotels.router, prefix="/hotels", tags=["hotels"])
api_router.include_router(rooms.router, prefix="/rooms", tags=["rooms"])
api_router.include_router(bookings.router, prefix="/reservations", tags=["reservations"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
