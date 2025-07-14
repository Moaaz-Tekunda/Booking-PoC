import asyncio
import sys
sys.path.append('.')

from app.models.room import Room, RoomType
from app.models.hotel import Hotel
from app.core.database import connect_to_mongo
from datetime import datetime, timezone

async def create_demo_rooms():
    """Create demo rooms for existing hotels"""
    await connect_to_mongo()
    
    # Get all hotels
    hotels = await Hotel.find(Hotel.is_active == True).to_list()
    
    if not hotels:
        print("No hotels found. Please create hotels first.")
        return
    
    print(f"Found {len(hotels)} hotels. Creating rooms...")
    
    room_types = [
        {"type": RoomType.SINGLE, "price": 80, "occupancy": 1, "count": 3},
        {"type": RoomType.DOUBLE, "price": 120, "occupancy": 2, "count": 5},
        {"type": RoomType.SUITE, "price": 200, "occupancy": 4, "count": 2},
        {"type": RoomType.FAMILY, "price": 160, "occupancy": 6, "count": 2},
    ]
    
    total_rooms_created = 0
    
    for hotel in hotels:
        print(f"\nCreating rooms for hotel: {hotel.name}")
        
        # Check if rooms already exist for this hotel
        existing_rooms = await Room.find(Room.hotel_id == str(hotel.id)).to_list()
        if existing_rooms:
            print(f"  Hotel already has {len(existing_rooms)} rooms, skipping...")
            continue
        
        hotel_rooms_created = 0
        
        for room_config in room_types:
            for i in range(room_config["count"]):
                room_number = f"{room_config['type'].value.upper()}-{i+1:02d}"
                
                room = Room(
                    room_number=room_number,
                    hotel_id=str(hotel.id),
                    price_per_night=room_config["price"],
                    description=f"Comfortable {room_config['type'].value} room with modern amenities",
                    type=room_config["type"],
                    max_occupancy=room_config["occupancy"],
                    is_available=True,
                    hotel=hotel,  # Set the hotel link
                    created_at=datetime.now(timezone.utc)
                )
                
                try:
                    await room.save()
                    hotel_rooms_created += 1
                    total_rooms_created += 1
                    print(f"  Created room: {room_number} (${room_config['price']}/night)")
                except Exception as e:
                    print(f"  Failed to create room {room_number}: {e}")
        
        print(f"  Total rooms created for {hotel.name}: {hotel_rooms_created}")
    
    print(f"\nTotal rooms created across all hotels: {total_rooms_created}")

if __name__ == "__main__":
    asyncio.run(create_demo_rooms())
