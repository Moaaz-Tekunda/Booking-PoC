from beanie import Document
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum


class RoomType(str, Enum):
    SINGLE = "single"
    DOUBLE = "double"
    SUITE = "suite"
    FAMILY = "family"


class RoomBase(BaseModel):
    room_number: str
    hotel_id: str
    price_per_night: float
    description: Optional[str] = None
    type: RoomType
    max_occupancy: int
    is_available: bool = True

    @field_validator('price_per_night')
    @classmethod
    def validate_price(cls, v):
        if v < 0:
            raise ValueError('Price per night cannot be negative')
        return v

    @field_validator('max_occupancy')
    @classmethod
    def validate_occupancy(cls, v):
        if v < 1 or v > 10:
            raise ValueError('Max occupancy must be between 1 and 10')
        return v


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    room_number: Optional[str] = None
    price_per_night: Optional[float] = None
    description: Optional[str] = None
    type: Optional[RoomType] = None
    max_occupancy: Optional[int] = None
    is_available: Optional[bool] = None


class Room(Document, RoomBase):
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "rooms"
        indexes = [
            "hotel_id",
            "room_number", 
            "type",
            "is_available",
            ("hotel_id", "room_number")  # Compound unique index
        ]


class RoomResponse(RoomBase):
    id: str
    created_at: datetime
