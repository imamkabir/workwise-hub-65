# Iconic Portal Backend API

A FastAPI-based content sharing platform with credit system, file management, and referral program.

## Features

- **Authentication**: JWT-based login/signup with bcrypt password hashing
- **User Management**: Profile management with role-based access control
- **File Management**: Upload, download, and manage files with metadata
- **Credit System**: Purchase and redeem credits for file downloads
- **Referral System**: Earn credits by referring new users
- **Admin Panel**: Administrative functions for user and content management

## Tech Stack

- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Database (easily switchable to PostgreSQL)
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing
- **Pydantic**: Data validation using Python type annotations

## Quick Start

### 1. Install Dependencies

```bash
cd iconic_portal_backend
pip install -r requirements.txt
```

### 2. Environment Setup

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your configurations
# At minimum, change the SECRET_KEY for production
```

### 3. Run the Server

```bash
# Development mode (with auto-reload)
uvicorn main:app --reload --port 8000

# Or simply run the main.py file
python main.py
```

### 4. Access the API

- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new account
- `POST /auth/login` - Login and get JWT token
- `POST /auth/logout` - Logout (client-side token removal)

### User Management
- `GET /user/profile` - Get current user profile
- `PUT /user/profile` - Update user profile
- `GET /user/credits` - Get user credit balance
- `GET /user/transactions` - Get credit transaction history

### File Management
- `POST /files/upload` - Upload a new file
- `GET /files/` - List all files (with pagination and search)
- `GET /files/{id}` - Get file details
- `POST /files/{id}/download` - Download file (requires credits)

### Credit System
- `POST /credits/purchase` - Purchase credits
- `POST /credits/redeem` - Redeem credits
- `GET /credits/balance` - Get credit balance
- `GET /credits/transactions` - Get transaction history

### Referral System
- `GET /referrals/` - Get referral stats and history
- `POST /referrals/invite` - Create referral invitation
- `POST /referrals/redeem` - Redeem referral code
- `GET /referrals/link` - Get referral link

## Database Schema

### Users Table
- User authentication and profile information
- Credit balance tracking
- Referral code generation

### Files Table
- File metadata and storage information
- Credit cost and download tracking
- Categorization and tagging

### Downloads Table
- Track user download history
- Credit transaction logging

### Credit Transactions Table
- Complete audit trail of all credit movements
- Support for various transaction types

### Referrals Table
- Referral relationship tracking
- Credit reward management

## File Upload

The API supports various file types:
- **Documents**: PDF, DOC, DOCX, TXT, PPT, PPTX
- **Videos**: MP4, AVI, MOV, MKV
- **Audio**: MP3, WAV, AAC
- **Images**: JPG, JPEG, PNG, GIF
- **Archives**: ZIP, RAR

Files are stored in the `uploads/` directory with unique filenames.

## Admin Features

Admin users can:
- View all users and their activities
- Grant or adjust user credits
- Delete files
- View system statistics

To create an admin user, use the `/auth/create-admin` endpoint.

## Development

### Project Structure

```
iconic_portal_backend/
├── main.py              # FastAPI application entry point
├── database.py          # Database configuration
├── models.py            # SQLAlchemy models
├── auth.py              # Authentication utilities
├── routes/              # API route handlers
│   ├── __init__.py
│   ├── auth.py          # Authentication endpoints
│   ├── users.py         # User management
│   ├── files.py         # File operations
│   ├── credits.py       # Credit system
│   └── referrals.py     # Referral system
├── uploads/             # File storage directory
├── requirements.txt     # Python dependencies
├── .env.example         # Environment configuration example
└── README.md           # This file
```

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests (if test files exist)
pytest
```

## Production Deployment

### Environment Variables

Make sure to set these in production:

```bash
SECRET_KEY=your-very-long-and-random-secret-key
DATABASE_URL=postgresql://user:password@localhost/dbname  # For PostgreSQL
```

### Database Migration

To switch to PostgreSQL:

1. Install PostgreSQL driver: `pip install psycopg2-binary`
2. Update `DATABASE_URL` in `.env`
3. Run the application to auto-create tables

### Security Considerations

- Change the default `SECRET_KEY`
- Use HTTPS in production
- Implement rate limiting
- Add input validation and sanitization
- Configure proper CORS origins
- Use environment variables for sensitive data

## Frontend Integration

This backend is designed to work with the React frontend. The API expects:

- JWT tokens in `Authorization: Bearer <token>` headers
- CORS is configured for `localhost:3000` and `localhost:5173`
- File uploads use multipart/form-data
- JSON responses with consistent error handling

## Support

For issues and questions:
1. Check the API documentation at `/docs`
2. Review the error responses for debugging information
3. Ensure all environment variables are properly set
4. Verify database connectivity and permissions