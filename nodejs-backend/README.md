# Node.js Express Prisma Backend

A lightweight, production-ready backend API built with Node.js, Express, and Prisma ORM.

## Features

- 🔐 **JWT Authentication** - Secure login/registration with bcrypt password hashing
- 🛡️ **Role-based Authorization** - USER, ADMIN, SUPER_ADMIN roles
- 📊 **RESTful API** - CRUD operations for Users and Applications
- 🗄️ **Database Flexibility** - SQLite for development, PostgreSQL for production
- ⚡ **Modern Stack** - ES modules, async/await, latest Node.js features
- 🔒 **Security** - Helmet, CORS, rate limiting, input validation
- 📝 **Logging** - Request logging with Morgan
- 🐳 **Docker Ready** - Dockerfile and docker-compose for easy deployment
- 🧪 **Validation** - Joi schema validation for all endpoints
- 📚 **Well Documented** - Clean code with comprehensive documentation

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Prisma ORM (SQLite/PostgreSQL)
- **Authentication**: JWT + bcrypt
- **Validation**: Joi
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Morgan
- **Development**: Nodemon

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### 1. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd nodejs-backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### 2. Environment Setup

Edit `.env` file with your configuration:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/v1/auth/register` | Register new user | Public |
| POST | `/api/v1/auth/login` | Login user | Public |
| GET | `/api/v1/auth/profile` | Get current user | Private |
| PUT | `/api/v1/auth/profile` | Update profile | Private |
| POST | `/api/v1/auth/change-password` | Change password | Private |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/v1/users` | Get all users | Admin |
| GET | `/api/v1/users/:id` | Get user by ID | Admin |
| POST | `/api/v1/users` | Create new user | Admin |
| PUT | `/api/v1/users/:id` | Update user | Admin |
| DELETE | `/api/v1/users/:id` | Delete user | Admin |
| PATCH | `/api/v1/users/:id/toggle-status` | Toggle user status | Admin |

### Applications

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/v1/applications` | Get applications | Private |
| GET | `/api/v1/applications/stats` | Get statistics | Admin |
| GET | `/api/v1/applications/:id` | Get application by ID | Private |
| POST | `/api/v1/applications` | Create application | Private |
| PUT | `/api/v1/applications/:id` | Update application | Private |
| DELETE | `/api/v1/applications/:id` | Delete application | Private |

### Health Check

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/health` | Server health status | Public |

## Request/Response Examples

### Register User

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Create Application

```bash
POST /api/v1/applications
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "My New Application",
  "description": "Description of the application",
  "status": "PENDING"
}
```

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `username` - Unique username
- `firstName` - User's first name
- `lastName` - User's last name
- `password` - Hashed password
- `role` - USER, ADMIN, SUPER_ADMIN
- `isActive` - Account status
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Applications Table
- `id` - Primary key
- `name` - Application name
- `description` - Optional description
- `status` - PENDING, APPROVED, REJECTED, IN_REVIEW
- `userId` - Foreign key to users table
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable allowed origins
- **Helmet**: Security headers
- **Input Validation**: Joi schema validation
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **Role-based Access Control**: Granular permissions

## Production Deployment

### Using Docker

```bash
# Build and start with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Manual Deployment

1. **Set up PostgreSQL database**
2. **Update environment variables**:
   ```env
   NODE_ENV=production
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   JWT_SECRET=your-production-secret
   ```
3. **Deploy database schema**:
   ```bash
   npm run db:deploy
   ```
4. **Start the application**:
   ```bash
   npm start
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `DATABASE_URL` | Database connection string | file:./dev.db |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | Token expiration time | 7d |
| `ALLOWED_ORIGINS` | CORS allowed origins | localhost:3000 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Generate Prisma client
npm run db:generate

# Create and apply new migration
npm run db:migrate

# Deploy migrations to production
npm run db:deploy

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with sample data
npm run db:seed

# Start production server
npm start
```

## Error Handling

The API returns consistent error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "additional": "error details"
    }
  }
}
```

Common error codes:
- `VALIDATION_ERROR` - Request validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `USER_EXISTS` - User already exists
- `INVALID_CREDENTIALS` - Login failed
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Testing

```bash
# Run tests (when implemented)
npm test

# Test API endpoints with curl
curl -X GET http://localhost:3000/health
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","firstName":"Test","lastName":"User","password":"password123"}'
```

## Project Structure

```
nodejs-backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Prisma client configuration
│   │   └── jwt.js           # JWT utilities
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   ├── userController.js      # User CRUD operations
│   │   └── applicationController.js # Application CRUD operations
│   ├── middleware/
│   │   ├── auth.js          # Authentication & authorization
│   │   ├── validation.js    # Request validation
│   │   ├── errorHandler.js  # Global error handling
│   │   └── notFoundHandler.js # 404 handler
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── users.js         # User routes
│   │   └── applications.js  # Application routes
│   ├── utils/
│   │   └── seed.js          # Database seeding
│   └── server.js            # Main application entry point
├── prisma/
│   └── schema.prisma        # Database schema
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── .dockerignore           # Docker ignore rules
├── Dockerfile              # Docker container definition
├── docker-compose.yml      # Multi-container setup
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.