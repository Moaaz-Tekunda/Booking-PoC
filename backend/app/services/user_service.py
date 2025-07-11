from typing import List, Optional
from datetime import datetime
from beanie import PydanticObjectId

from app.models.user import User, UserCreate, UserUpdate, UserResponse
from app.core.security import get_password_hash, verify_password


class UserService:
    @staticmethod
    async def create_user(user_data: UserCreate) -> UserResponse:
        """Create a new user with properly hashed password"""
        # Hash the password securely
        hashed_password = get_password_hash(user_data.password)
        
        user_dict = user_data.model_dump(exclude={"password"})
        user = User(**user_dict, hashed_password=hashed_password)
        await user.create()
        
        return UserResponse.model_validate({
            **user.model_dump(),
            "id": str(user.id)
        })

    @staticmethod
    async def get_user(user_id: str) -> Optional[UserResponse]:
        """Get a user by ID"""
        try:
            user = await User.get(PydanticObjectId(user_id))
            if user:
                return UserResponse.model_validate({
                    **user.model_dump(),
                    "id": str(user.id)
                })
        except Exception:
            return None
        return None

    @staticmethod
    async def get_users(skip: int = 0, limit: int = 100) -> List[UserResponse]:
        """Get all users with pagination"""
        users = await User.find().skip(skip).limit(limit).to_list()
        return [
            UserResponse.model_validate({
                **user.model_dump(),
                "id": str(user.id)
            })
            for user in users
        ]

    @staticmethod
    async def update_user(user_id: str, user_data: UserUpdate) -> Optional[UserResponse]:
        """Update a user"""
        try:
            user = await User.get(PydanticObjectId(user_id))
            if not user:
                return None

            update_data = {k: v for k, v in user_data.model_dump(exclude_unset=True).items() if v is not None}
            if update_data:
                await user.update({"$set": update_data})
                
                # Fetch updated user
                updated_user = await User.get(PydanticObjectId(user_id))
                return UserResponse.model_validate({
                    **updated_user.model_dump(),
                    "id": str(updated_user.id)
                })
        except Exception:
            return None
        return None

    @staticmethod
    async def delete_user(user_id: str) -> bool:
        """Delete a user"""
        try:
            user = await User.get(PydanticObjectId(user_id))
            if user:
                await user.delete()
                return True
        except Exception:
            pass
        return False

    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        """Get a user by email (for authentication)"""
        return await User.find_one(User.email == email)

    @staticmethod
    async def authenticate_user(email: str, password: str) -> Optional[User]:
        """
        Authenticate a user with email and password
        
        Args:
            email: User's email address
            password: Plain text password
            
        Returns:
            User object if authentication successful, None otherwise
        """
        user = await User.find_one(User.email == email)
        if not user:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
            
        # Update last login timestamp
        await user.update({"$set": {"last_login": datetime.now()}})
        
        return user

    @staticmethod
    async def update_last_login(user_id: str) -> None:
        """Update user's last login timestamp"""
        await User.find_one(User.id == PydanticObjectId(user_id)).update(
            {"$set": {"last_login": datetime.utcnow()}}
        )

    @staticmethod
    async def get_users_by_hotel(hotel_id: str, skip: int = 0, limit: int = 100) -> List[UserResponse]:
        """Get all users for a specific hotel with pagination"""
        users = await User.find(User.hotel_id == hotel_id).skip(skip).limit(limit).to_list()
        return [
            UserResponse.model_validate({
                **user.model_dump(),
                "id": str(user.id)
            })
            for user in users
        ]
