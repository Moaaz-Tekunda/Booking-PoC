# Booking API Backend

A FastAPI backend application with MongoDB integration for managing bookings and users.

## Features

- FastAPI framework with async/await support
- MongoDB integration using Beanie ODM (Object Document Mapper)
- Motor (async MongoDB driver) as the underlying database driver
- RESTful API endpoints for users and bookings
- Pydantic models for data validation
- Clean architecture with separated concerns
- CORS middleware support
- Environment-based configuration
- Document relationships and references

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── bookings.py
│   │       │   └── users.py
│   │       └── api.py
│   ├── core/
│   │   ├── config.py
│   │   └── database.py
│   ├── models/
│   │   ├── booking.py
│   │   └── user.py
│   └── services/
│       ├── booking_service.py
│       └── user_service.py
├── main.py
├── run.py
├── requirements.txt
├── .env.example
└── .gitignore
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
copy .env.example .env
```

Edit the `.env` file with your MongoDB connection details:

```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=booking_db
SECRET_KEY=your-secret-key-here
DEBUG=True
```

### 3. Start MongoDB

Make sure MongoDB is running on your system. If using Docker:

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Run the Application

```bash
python run.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Health Check
- `GET /` - Welcome message
- `GET /health` - Health check endpoint

### Users
- `GET /api/v1/users/` - Get all users
- `GET /api/v1/users/{user_id}` - Get user by ID
- `POST /api/v1/users/` - Create new user
- `PUT /api/v1/users/{user_id}` - Update user
- `DELETE /api/v1/users/{user_id}` - Delete user

### Bookings
- `GET /api/v1/bookings/` - Get all bookings
- `GET /api/v1/bookings/{booking_id}` - Get booking by ID
- `POST /api/v1/bookings/` - Create new booking
- `PUT /api/v1/bookings/{booking_id}` - Update booking
- `DELETE /api/v1/bookings/{booking_id}` - Delete booking
- `GET /api/v1/bookings/user/{user_id}` - Get bookings for a specific user

## API Documentation

Once the server is running, you can access:

- Interactive API documentation: http://localhost:8000/docs
- ReDoc documentation: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/api/v1/openapi.json

## Development

The application uses:

- **FastAPI**: Modern, fast web framework for building APIs
- **Beanie**: Async ODM (Object Document Mapper) for MongoDB
- **Motor**: Async MongoDB driver for Python (used by Beanie)
- **Pydantic**: Data validation using Python type annotations
- **Uvicorn**: ASGI server implementation

## Why Beanie over Raw Motor?

**Beanie** provides several advantages over using Motor directly:

1. **ORM/ODM Features**: 
   - Document models with inheritance from Pydantic
   - Automatic validation and serialization
   - Relationship management (Links, References)
   - Query builder with type safety

2. **Better Developer Experience**:
   - Less boilerplate code
   - Type hints and IDE support
   - Automatic ObjectId handling
   - Built-in pagination and aggregation

3. **Data Integrity**:
   - Schema validation at the application level
   - Automatic timestamp management
   - Field validation and transformation

4. **Performance**:
   - Built on top of Motor (still async)
   - Optimized queries with fetch_links
   - Efficient relationship loading

## Models

### User Model
```json
{
  "name": "string",
  "email": "user@example.com",
  "phone": "string",
  "is_active": true
}
```

### Booking Model
```json
{
  "title": "string",
  "description": "string",
  "start_date": "2025-06-30T12:00:00Z",
  "end_date": "2025-06-30T14:00:00Z",
  "user_id": "string",
  "status": "active"
}
```

## Beanie ODM Features

### Document Relationships
```python
# User linked to Booking
class Booking(Document):
    user: Link[User]  # Reference to User document
    # ... other fields
```

### Query Examples
```python
# Find bookings for a user
bookings = await Booking.find(Booking.user.id == user_id).to_list()

# Get booking with user data
booking = await Booking.get(booking_id, fetch_links=True)

# Update a document
await booking.update({"$set": {"status": "completed"}})
```

### Automatic Features
- **ObjectId handling**: Automatic conversion between strings and ObjectIds
- **Timestamps**: Automatic created_at and updated_at fields
- **Validation**: Pydantic validation on all operations
- **Serialization**: Automatic JSON serialization for API responses
