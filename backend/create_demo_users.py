import asyncio
import sys
sys.path.append('.')

from app.models.user import User, Role, Gender
from app.core.database import connect_to_mongo
from app.core.security import get_password_hash
from datetime import datetime

async def create_demo_users():
    """Create demo users for testing"""
    await connect_to_mongo()
    
    # Check if demo users already exist
    demo_admin = await User.find_one(User.email == "admin@demo.com")
    demo_user = await User.find_one(User.email == "user@demo.com")
    
    if not demo_admin:
        admin_user = User(
            name="Admin Demo",
            email="admin@demo.com",
            hashed_password=get_password_hash("admin123"),
            age=35,
            mobile_number="+1234567890",
            job_type="System Administrator",
            gender=Gender.MALE,
            role=Role.SUPER_ADMIN,
            is_active=True,
            created_at=datetime.utcnow()
        )
        await admin_user.save()
        print("Created demo admin user: admin@demo.com / admin123")
    else:
        print("Demo admin user already exists")
    
    if not demo_user:
        regular_user = User(
            name="John Viewer",
            email="user@demo.com",
            hashed_password=get_password_hash("user123"),
            age=28,
            mobile_number="+1234567891",
            job_type="Software Engineer",
            gender=Gender.MALE,
            role=Role.VIEWER,
            is_active=True,
            created_at=datetime.utcnow()
        )
        await regular_user.save()
        print("Created demo user: user@demo.com / user123")
    else:
        print("Demo user already exists")

if __name__ == "__main__":
    asyncio.run(create_demo_users())
