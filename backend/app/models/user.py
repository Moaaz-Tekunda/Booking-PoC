from beanie import Document, Link
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"



class Role(str, Enum):
    VIEWER = "viewer"
    ADMIN_HOTEL = "admin_hotel"
    SUPER_ADMIN = "super_admin"


class UserBase(BaseModel):
    name: str
    email: EmailStr
    age: int
    mobile_number: str
    job_type: Optional[str] = None
    gender: Gender
    role: Role = Role.VIEWER
    hotel_id: Optional[str] = None
    is_active: bool = True

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if len(v) < 2:
            raise ValueError('Name must be at least 2 characters')
        return v

    @field_validator('age')
    @classmethod
    def validate_age(cls, v):
        if v < 18 or v > 120:
            raise ValueError('Age must be between 18 and 120')
        return v


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    age: Optional[int] = None
    mobile_number: Optional[str] = None
    job_type: Optional[str] = None
    gender: Optional[Gender] = None
    role: Optional[Role] = None
    hotel_id: Optional[str] = None
    is_active: Optional[bool] = None


class User(Document, UserBase):
    hashed_password: str
    created_at: datetime = datetime.utcnow()
    last_login: Optional[datetime] = None

    class Settings:
        name = "users"
        indexes = [
            "email",
            "role",
            "hotel_id",
            "is_active"
        ]


class UserResponse(UserBase):
    id: str
    created_at: datetime
    last_login: Optional[datetime] = None
