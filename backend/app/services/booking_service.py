from typing import List, Optional
from datetime import datetime
from beanie import PydanticObjectId

from app.models.booking import Reservation, ReservationCreate, ReservationUpdate, ReservationResponse
from app.models.user import User
from app.models.hotel import Hotel
from app.models.room import Room


class ReservationService:
    @staticmethod
    async def create_reservation(reservation_data: ReservationCreate) -> Optional[ReservationResponse]:
        """Create a new reservation"""
        try:
            print(f"Creating reservation: {reservation_data}")  # For debugging
            
            # Verify all referenced entities exist
            print(f"Checking hotel_id: {reservation_data.hotel_id}")
            hotel = await Hotel.get(PydanticObjectId(reservation_data.hotel_id))
            if not hotel:
                print(f"Hotel not found: {reservation_data.hotel_id}")
                return None
                
            print(f"Checking room_id: {reservation_data.room_id}")
            room = await Room.get(PydanticObjectId(reservation_data.room_id))
            if not room:
                print(f"Room not found: {reservation_data.room_id}")
                return None
                
            print(f"Checking visitor_id: {reservation_data.visitor_id}")
            visitor = await User.get(PydanticObjectId(reservation_data.visitor_id))
            if not visitor:
                print(f"Visitor not found: {reservation_data.visitor_id}")
                return None
            
            # Check if room belongs to hotel
            print(f"Room hotel_id: {room.hotel_id}, Expected hotel_id: {reservation_data.hotel_id}")
            if room.hotel_id != reservation_data.hotel_id:
                print(f"Room does not belong to hotel. Room hotel_id: {room.hotel_id}, Expected: {reservation_data.hotel_id}")
                return None
            
            # Check for conflicting reservations using string date comparison
            print(f"Checking for conflicts for room {reservation_data.room_id} from {reservation_data.start_date} to {reservation_data.end_date}")
            conflicting = await Reservation.find({
                "room_id": reservation_data.room_id,
                "status": {"$in": ["confirmed", "checked_in"]},
                "$or": [
                    {
                        "start_date": {"$lte": reservation_data.end_date},
                        "end_date": {"$gte": reservation_data.start_date}
                    }
                ]
            }).to_list()
            
            if conflicting:
                print(f"Found {len(conflicting)} conflicting reservations")
                for conflict in conflicting:
                    print(f"Conflict: {conflict.start_date} to {conflict.end_date}, status: {conflict.status}")
                print(f"RESERVATION FAILED: Room {reservation_data.room_id} is already booked for the requested dates")
                return None  # Room is not available for these dates
            
            print("No conflicts found, creating reservation...")
            
            # Create reservation directly with string dates
            reservation = Reservation(
                hotel_id=reservation_data.hotel_id,
                room_id=reservation_data.room_id,
                visitor_id=reservation_data.visitor_id,
                start_date=reservation_data.start_date,
                end_date=reservation_data.end_date,
                type=reservation_data.type,
                status=reservation_data.status,
                total_price=reservation_data.total_price,
                hotel=hotel,
                room=room,
                visitor=visitor
            )
            
            print(f"About to save reservation: {reservation}")
            await reservation.create()
            print(f"Reservation created successfully with ID: {reservation.id}")
            
            return ReservationResponse.model_validate({
                **reservation.model_dump(),
                "id": str(reservation.id)
            })
        except ValueError as ve:
            print(f"Validation error creating reservation: {ve}")  # For debugging
            return None
        except Exception as e:
            print(f"Error creating reservation: {e}")  # For debugging
            print(f"Exception type: {type(e)}")  # For debugging
            return None

    @staticmethod
    async def get_reservation(reservation_id: str) -> Optional[ReservationResponse]:
        """Get a reservation by ID"""
        try:
            reservation = await Reservation.get(PydanticObjectId(reservation_id), fetch_links=True)
            if reservation:
                return ReservationResponse.model_validate({
                    **reservation.model_dump(),
                    "id": str(reservation.id)
                })
        except Exception:
            return None
        return None

    @staticmethod
    async def get_reservations(skip: int = 0, limit: int = 100) -> List[ReservationResponse]:
        """Get all reservations with pagination"""
        reservations = await Reservation.find().skip(skip).limit(limit).to_list()
        
        return [
            ReservationResponse.model_validate({
                **reservation.model_dump(),
                "id": str(reservation.id)
            })
            for reservation in reservations
        ]

    @staticmethod
    async def update_reservation(reservation_id: str, reservation_data: ReservationUpdate) -> Optional[ReservationResponse]:
        """Update a reservation"""
        try:
            reservation = await Reservation.get(PydanticObjectId(reservation_id))
            if not reservation:
                return None

            update_data = {k: v for k, v in reservation_data.model_dump(exclude_unset=True).items() if v is not None}
            
            if update_data:
                update_data["updated_at"] = datetime.utcnow()
                
                # If updating dates, check for conflicts
                if "start_date" in update_data or "end_date" in update_data:
                    start_date = update_data.get("start_date", reservation.start_date)
                    end_date = update_data.get("end_date", reservation.end_date)
                    
                    conflicting = await Reservation.find({
                        "room_id": reservation.room_id,
                        "status": {"$in": ["confirmed", "checked_in"]},
                        "_id": {"$ne": reservation.id},
                        "$or": [
                            {
                                "start_date": {"$lte": end_date},
                                "end_date": {"$gte": start_date}
                            }
                        ]
                    }).to_list()
                    
                    if conflicting:
                        return None  # Conflict with existing reservation
                
                await reservation.update({"$set": update_data})
                
                # Fetch updated reservation
                updated_reservation = await Reservation.get(PydanticObjectId(reservation_id))
                return ReservationResponse.model_validate({
                    **updated_reservation.model_dump(),
                    "id": str(updated_reservation.id)
                })
        except Exception:
            return None
        return None

    @staticmethod
    async def delete_reservation(reservation_id: str) -> bool:
        """Delete a reservation"""
        try:
            reservation = await Reservation.get(PydanticObjectId(reservation_id))
            if reservation:
                await reservation.delete()
                return True
        except Exception:
            pass
        return False

    @staticmethod
    async def get_reservations_by_hotel(hotel_id: str, skip: int = 0, limit: int = 100) -> List[ReservationResponse]:
        """Get reservations by hotel"""
        reservations = await Reservation.find(
            {"hotel_id": hotel_id}
        ).skip(skip).limit(limit).to_list()
        
        return [
            ReservationResponse.model_validate({
                **reservation.model_dump(),
                "id": str(reservation.id)
            })
            for reservation in reservations
        ]

    @staticmethod
    async def get_reservations_by_user(user_id: str, skip: int = 0, limit: int = 100) -> List[ReservationResponse]:
        """Get reservations by user"""
        reservations = await Reservation.find(
            {"visitor_id": user_id}
        ).skip(skip).limit(limit).to_list()
        
        return [
            ReservationResponse.model_validate({
                **reservation.model_dump(),
                "id": str(reservation.id)
            })
            for reservation in reservations
        ]

    @staticmethod
    async def check_room_availability(room_id: str, start_date: str, end_date: str) -> bool:
        """Check if a room is available for the given dates"""
        try:
            conflicting = await Reservation.find({
                "room_id": room_id,
                "status": {"$in": ["confirmed", "checked_in"]},
                "$or": [
                    {
                        "start_date": {"$lte": end_date},
                        "end_date": {"$gte": start_date}
                    }
                ]
            }).to_list()
            
            return len(conflicting) == 0
        except Exception as e:
            print(f"Error checking room availability: {e}")
            return False

    @staticmethod
    async def get_available_rooms_by_hotel(hotel_id: str, start_date: str, end_date: str) -> List:
        """Get available rooms for a hotel within the given date range"""
        try:
            # First get all rooms for the hotel
            from app.services.room_service import RoomService
            all_rooms = await RoomService.get_rooms_by_hotel(hotel_id)
            
            available_rooms = []
            for room in all_rooms:
                is_available = await ReservationService.check_room_availability(
                    str(room.id), start_date, end_date
                )
                if is_available:
                    available_rooms.append(room)
            
            return available_rooms
        except Exception as e:
            print(f"Error getting available rooms: {e}")
            return []
