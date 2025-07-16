from typing import List, Optional
from datetime import datetime
from beanie import PydanticObjectId
from app.models.hotel import Hotel, HotelCreate, HotelUpdate, HotelResponse


class HotelService:
    @staticmethod
    async def create_hotel(hotel_data: HotelCreate, creator_id: Optional[str] = None) -> HotelResponse:
        """Create a new hotel"""
        hotel_dict = hotel_data.model_dump()
        if creator_id:
            hotel_dict["created_by"] = creator_id

        hotel = Hotel(**hotel_dict)
        await hotel.create()
        
        # Use model_validate to create response from hotel document
        return HotelResponse.model_validate({
            **hotel.model_dump(),
            "id": str(hotel.id)
        })

    @staticmethod
    async def get_hotel(hotel_id: str) -> Optional[HotelResponse]:
        """Get a hotel by ID"""
        try:
            hotel = await Hotel.get(PydanticObjectId(hotel_id))
            if hotel:
                return HotelResponse.model_validate({
                    **hotel.model_dump(),
                    "id": str(hotel.id)
                })
        except Exception:
            return None
        return None

    @staticmethod
    async def get_hotels(skip: int = 0, limit: int = 100, active_only: bool = True) -> List[HotelResponse]:
        """Get all hotels with pagination"""
        query = Hotel.find()
        if active_only:
            query = Hotel.find(Hotel.is_active == True)
        
        hotels = await query.skip(skip).limit(limit).to_list()
        
        return [
            HotelResponse.model_validate({
                **hotel.model_dump(),
                "id": str(hotel.id)
            })
            for hotel in hotels
        ]

    @staticmethod
    async def update_hotel(hotel_id: str, hotel_data: HotelUpdate) -> Optional[HotelResponse]:
        """Update a hotel"""
        try:
            hotel = await Hotel.get(PydanticObjectId(hotel_id))
            if not hotel:
                return None

            update_data = {k: v for k, v in hotel_data.model_dump(exclude_unset=True).items() if v is not None}
            
            if update_data:
                await hotel.update({"$set": update_data})
                
                # Fetch updated hotel
                updated_hotel = await Hotel.get(PydanticObjectId(hotel_id))
                return HotelResponse.model_validate({
                    **updated_hotel.model_dump(),
                    "id": str(updated_hotel.id)
                })
        except Exception:
            return None
        return None

    @staticmethod
    async def delete_hotel(hotel_id: str) -> bool:
        """Delete a hotel (soft delete by setting is_active to False)"""
        try:
            hotel = await Hotel.get(PydanticObjectId(hotel_id))
            if hotel:
                await hotel.update({"$set": {"is_active": False}})
                return True
        except Exception:
            pass
        return False

    @staticmethod
    async def search_hotels(city: Optional[str] = None, country: Optional[str] = None) -> List[HotelResponse]:
        """Search hotels by city or country"""
        query = {"is_active": True}
        
        if city:
            query["city"] = {"$regex": city, "$options": "i"}
        if country:
            query["country"] = {"$regex": country, "$options": "i"}
        
        hotels = await Hotel.find(query).to_list()
        
        return [
            HotelResponse.model_validate({
                **hotel.model_dump(),
                "id": str(hotel.id)
            })
            for hotel in hotels
        ]
    

    @staticmethod
    async def get_hotels_by_creator(creator_id: str) -> List[HotelResponse]:
            hotels = await Hotel.find(Hotel.created_by == creator_id).to_list()
            
            return [
                HotelResponse.model_validate({
                    **hotel.model_dump(),
                    "id": str(hotel.id)
                })
                for hotel in hotels
            ]
