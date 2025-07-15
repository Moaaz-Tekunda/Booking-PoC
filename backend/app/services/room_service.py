from typing import List, Optional
from datetime import datetime
from beanie import PydanticObjectId

from app.models.room import Room, RoomCreate, RoomUpdate, RoomResponse
from app.models.hotel import Hotel


class RoomService:
    @staticmethod
    async def create_room(room_data: RoomCreate) -> Optional[RoomResponse]:
        """Create a new room"""
        try:
            # Verify hotel exists
            hotel = await Hotel.get(PydanticObjectId(room_data.hotel_id))
            if not hotel:
                return None
            
            # Check if room number already exists in this hotel
            existing_room = await Room.find_one({
                "hotel_id": room_data.hotel_id,
                "room_number": room_data.room_number
            })
            if existing_room:
                return None  # Room number already exists
            
            room = Room(**room_data.model_dump())
            await room.create()
            
            return RoomResponse.model_validate({
                **room.model_dump(),
                "id": str(room.id)
            })
        except Exception:
            return None

    @staticmethod
    async def get_room(room_id: str) -> Optional[RoomResponse]:
        """Get a room by ID"""
        try:
            room = await Room.get(PydanticObjectId(room_id))
            if room:
                return RoomResponse.model_validate({
                    **room.model_dump(),
                    "id": str(room.id)
                })
        except Exception:
            return None
        return None

    @staticmethod
    async def get_rooms(skip: int = 0, limit: int = 100, available_only: bool = False) -> List[RoomResponse]:
        """Get all rooms with pagination"""
        query = Room.find()
        if available_only:
            query = Room.find(Room.is_available == True)
        
        rooms = await query.skip(skip).limit(limit).to_list()
        
        return [
            RoomResponse.model_validate({
                **room.model_dump(),
                "id": str(room.id)
            })
            for room in rooms
        ]

    @staticmethod
    async def get_rooms_by_hotel(hotel_id: str, available_only: bool = False) -> List[RoomResponse]:
        """Get rooms by hotel ID"""
        try:
            # Build the query using string hotel_id
            query = {"hotel_id": hotel_id}
            if available_only:
                query["is_available"] = True
            
            rooms = await Room.find(query).to_list()
            
            return [
                RoomResponse.model_validate({
                    **room.model_dump(),
                    "id": str(room.id)
                })
                for room in rooms
            ]
        except Exception as e:
            print(f"Error in get_rooms_by_hotel: {e}")
            return []

    @staticmethod
    async def update_room(room_id: str, room_data: RoomUpdate) -> Optional[RoomResponse]:
        """Update a room"""
        try:
            room = await Room.get(PydanticObjectId(room_id))
            if not room:
                return None

            update_data = {k: v for k, v in room_data.model_dump(exclude_unset=True).items() if v is not None}
            
            if update_data:
                # Check for room number uniqueness if updating room_number
                if "room_number" in update_data:
                    existing_room = await Room.find_one({
                        "hotel_id": room.hotel_id,
                        "room_number": update_data["room_number"],
                        "_id": {"$ne": room.id}
                    })
                    if existing_room:
                        return None  # Room number already exists
                
                await room.update({"$set": update_data})
                
                # Fetch updated room
                updated_room = await Room.get(PydanticObjectId(room_id))
                return RoomResponse.model_validate({
                    **updated_room.model_dump(),
                    "id": str(updated_room.id)
                })
        except Exception:
            return None
        return None

    @staticmethod
    async def delete_room(room_id: str) -> bool:
        """Delete a room"""
        try:
            room = await Room.get(PydanticObjectId(room_id))
            if room:
                await room.delete()
                return True
        except Exception:
            pass
        return False
