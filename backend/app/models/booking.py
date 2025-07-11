from beanie import Document, Link
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime, date
from enum import Enum
from app.models.user import User
from app.models.hotel import Hotel
from app.models.room import Room


class ReservationType(str, Enum):
    BED_BREAKFAST = "bed_breakfast"
    ALL_INCLUSIVE = "all_inclusive"
    ROOM_ONLY = "room_only"


class ReservationStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CHECKED_IN = "checked_in"
    CHECKED_OUT = "checked_out"
    CANCELLED = "cancelled"


class ReservationBase(BaseModel):
    hotel_id: str
    room_id: str
    visitor_id: str
    start_date: date
    end_date: date
    type: ReservationType
    status: ReservationStatus = ReservationStatus.PENDING
    total_price: float

    @field_validator('end_date')
    @classmethod
    def validate_dates(cls, v, info):
        if 'start_date' in info.data and v <= info.data['start_date']:
            raise ValueError('End date must be after start date')
        return v

    @field_validator('total_price')
    @classmethod
    def validate_price(cls, v):
        if v < 0:
            raise ValueError('Total price cannot be negative')
        return v


class ReservationCreate(ReservationBase):
    pass


class ReservationUpdate(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    type: Optional[ReservationType] = None
    status: Optional[ReservationStatus] = None
    total_price: Optional[float] = None


class Reservation(Document, ReservationBase):
    hotel: Link[Hotel]
    room: Link[Room]
    visitor: Link[User]
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

    class Settings:
        name = "reservations"
        indexes = [
            "hotel_id",
            "room_id",
            "visitor_id",
            "status",
            "start_date",
            "end_date"
        ]


class ReservationResponse(ReservationBase):
    id: str
    created_at: datetime
    updated_at: datetime
