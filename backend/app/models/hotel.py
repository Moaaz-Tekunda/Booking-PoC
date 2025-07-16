from beanie import Document
from pydantic import BaseModel, EmailStr, field_validator, Field, ConfigDict, field_serializer
from typing import Optional, List, Annotated
from datetime import datetime, time


class HotelBase(BaseModel):
    name: str
    tax_number: str
    contact_email: EmailStr
    contact_phone: str
    address: str
    city: str
    country: str
    working_hours_start: str = "00:00:00"  # Time in HH:MM:SS format
    working_hours_end: str = "23:59:59"    # Time in HH:MM:SS format
    gallery: List[str] = []
    has_gym: bool = False
    has_spa: bool = False
    has_wifi: bool = True
    has_parking: bool = False
    swimming_pools_count: int = 0
    max_reservations_capacity: int
    is_active: bool = True
    created_by: Optional[str] = None

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if len(v) < 2:
            raise ValueError('Name must be at least 2 characters')
        return v

    @field_validator('working_hours_start', 'working_hours_end')
    @classmethod
    def validate_time_format(cls, v):
        """Validate time format and convert to HH:MM:SS if needed"""
        if isinstance(v, str):
            try:
                # Parse the time string to validate format
                time_obj = time.fromisoformat(v)
                # Return in standard format
                return time_obj.strftime('%H:%M:%S')
            except ValueError:
                raise ValueError('Time must be in HH:MM:SS format')
        return v

    @field_validator('swimming_pools_count')
    @classmethod
    def validate_pools(cls, v):
        if v < 0:
            raise ValueError('Swimming pools count cannot be negative')
        return v

    @field_validator('max_reservations_capacity')
    @classmethod
    def validate_capacity(cls, v):
        if v < 1:
            raise ValueError('Max reservations capacity must be at least 1')
        return v


class HotelCreate(BaseModel):
    name: str
    tax_number: str
    contact_email: EmailStr
    contact_phone: str
    address: str
    city: str
    country: str
    working_hours_start: str = "00:00:00"
    working_hours_end: str = "23:59:59"
    gallery: List[str] = []
    has_gym: bool = False
    has_spa: bool = False
    has_wifi: bool = True
    has_parking: bool = False
    swimming_pools_count: int = 0
    max_reservations_capacity: int
    is_active: bool = True

    # Copy all validators from HotelBase
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if len(v) < 2:
            raise ValueError('Name must be at least 2 characters')
        return v

    @field_validator('working_hours_start', 'working_hours_end')
    @classmethod
    def validate_time_format(cls, v):
        if isinstance(v, str):
            try:
                time_obj = time.fromisoformat(v)
                return time_obj.strftime('%H:%M:%S')
            except ValueError:
                raise ValueError('Time must be in HH:MM:SS format')
        return v

    @field_validator('swimming_pools_count')
    @classmethod
    def validate_pools(cls, v):
        if v < 0:
            raise ValueError('Swimming pools count cannot be negative')
        return v

    @field_validator('max_reservations_capacity')
    @classmethod
    def validate_capacity(cls, v):
        if v < 1:
            raise ValueError('Max reservations capacity must be at least 1')
        return v


class HotelUpdate(BaseModel):
    name: Optional[str] = None
    tax_number: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    working_hours_start: Optional[str] = None
    working_hours_end: Optional[str] = None
    gallery: Optional[List[str]] = None
    has_gym: Optional[bool] = None
    has_spa: Optional[bool] = None
    has_wifi: Optional[bool] = None
    has_parking: Optional[bool] = None
    swimming_pools_count: Optional[int] = None
    max_reservations_capacity: Optional[int] = None
    is_active: Optional[bool] = None



class Hotel(Document, HotelBase):
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "hotels"
        indexes = [
            "tax_number",
            "city",
            "country",
            "is_active",
            "created_by"
        ]


class HotelResponse(HotelBase):
    id: str
    created_at: datetime
