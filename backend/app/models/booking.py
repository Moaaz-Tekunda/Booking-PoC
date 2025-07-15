from beanie import Document, Link
from pydantic import BaseModel, field_validator
from typing import Optional, Union
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
    start_date: str
    end_date: str
    type: ReservationType
    status: ReservationStatus = ReservationStatus.PENDING
    total_price: float

    @field_validator('start_date', 'end_date')
    @classmethod
    def validate_date_format(cls, v):
        if isinstance(v, str):
            try:
                datetime.strptime(v, "%Y-%m-%d")
                return v
            except ValueError:
                raise ValueError('Date must be in YYYY-MM-DD format')
        return v

    @field_validator('end_date')
    @classmethod
    def validate_dates(cls, v, info):
        start_date = info.data.get('start_date')
        if start_date and v <= start_date:
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
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    type: Optional[ReservationType] = None
    status: Optional[ReservationStatus] = None
    total_price: Optional[float] = None

    @field_validator('start_date', 'end_date')
    @classmethod
    def validate_date_format(cls, v):
        if v is not None and isinstance(v, str):
            try:
                datetime.strptime(v, "%Y-%m-%d")
                return v
            except ValueError:
                raise ValueError('Date must be in YYYY-MM-DD format')
        return v


class Reservation(Document):
    hotel_id: str
    room_id: str
    visitor_id: str
    start_date: str
    end_date: str
    type: ReservationType
    status: ReservationStatus = ReservationStatus.PENDING
    total_price: float
    hotel: Link[Hotel]
    room: Link[Room]
    visitor: Link[User]
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

    @field_validator('start_date', 'end_date')
    @classmethod
    def validate_date_format(cls, v):
        if isinstance(v, str):
            try:
                datetime.strptime(v, "%Y-%m-%d")
                return v
            except ValueError:
                raise ValueError('Date must be in YYYY-MM-DD format')
        return v

    @field_validator('end_date')
    @classmethod
    def validate_dates(cls, v, info):
        start_date = info.data.get('start_date')
        if start_date and v <= start_date:
            raise ValueError('End date must be after start date')
        return v

    @field_validator('total_price')
    @classmethod
    def validate_price(cls, v):
        if v < 0:
            raise ValueError('Total price cannot be negative')
        return v

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
