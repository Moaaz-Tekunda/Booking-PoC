from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.user import User
from app.models.hotel import Hotel
from app.models.room import Room
from app.models.booking import Reservation
from app.models.auth import RefreshToken

import logging

logger = logging.getLogger(__name__)


class Database:
    def __init__(self):
        self.client = None
        self.database = None


db = Database()


async def get_database():
    return db.database


async def connect_to_mongo():
    """Create database connection and initialize Beanie"""
    logger.info("Connecting to MongoDB...")
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db.database = db.client[settings.DATABASE_NAME]
    
    # Initialize Beanie with document models
    await init_beanie(
        database=db.database,
        document_models=[User, Hotel, Room, Reservation, RefreshToken]
    )
    
    logger.info("Connected to MongoDB and initialized Beanie!")


async def close_mongo_connection():
    """Close database connection"""
    logger.info("Closing connection to MongoDB...")
    if db.client:
        db.client.close()
    logger.info("Connection closed!")
