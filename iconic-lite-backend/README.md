# Iconic Lite - Laravel 11 Backend

A comprehensive Laravel 11 backend for the Iconic Lite educational platform with role-based authentication, credit system, file management, and payment integration.

## Features

- **Multi-Role Authentication**: Student, Lecturer, Admin, Super Admin portals
- **Email Verification**: Built-in email verification with Laravel Fortify
- **OAuth Integration**: Google OAuth (GitHub placeholder)
- **Credit System**: Earn credits through daily login, ads, referrals, purchases
- **Payment Integration**: Stripe (international) + Remita (Nigeria)
- **File Management**: Upload, approve, download with credit-based access
- **Private Sessions**: Lecturer-Student private tutoring sessions
- **Referral System**: Earn credits by referring friends
- **Ad Rewards**: Watch ads to earn credits
- **Notifications**: Real-time notification system
- **Admin Dashboard**: Comprehensive admin and super admin controls

## Tech Stack

- **Laravel 11** with PHP 8.2+
- **MySQL/PostgreSQL** database
- **Laravel Sanctum** for SPA authentication
- **Laravel Fortify** for authentication features
- **Spatie Laravel Permission** for roles and permissions
- **Laravel Cashier** for Stripe integration
- **Custom Remita integration** for Nigerian payments

## Quick Start

### 1. Installation

```bash
# Clone and setup
git clone <repository>
cd iconic-lite-backend

# Install dependencies
composer install

# Environment setup
cp .env.example .env
php artisan key:generate
```

### 2. Database Setup

**For MySQL:**
```bash
# Update .env with your MySQL credentials
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=iconic_lite
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

**For PostgreSQL:**
```bash
# Update .env with your PostgreSQL credentials
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=iconic_lite
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

### 3. Configure Services

**Email (Gmail):**
```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
```

**Google OAuth:**
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Stripe:**
```bash
STRIPE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Remita (Nigeria):**
```bash
REMITA_MERCHANT_ID=your_merchant_id
REMITA_SERVICE_TYPE_ID=your_service_type_id
REMITA_API_KEY=your_api_key
REMITA_WEBHOOK_HASH=your_webhook_hash
```

### 4. Run Migrations and Seeders

```bash
# Publish package configurations
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan vendor:publish --provider="Laravel\Fortify\FortifyServiceProvider"
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Run migrations
php artisan migrate

# Seed initial data
php artisan db:seed

# Link storage for file downloads
php artisan storage:link
```

### 5. Start Development Server

```bash
php artisan serve --port=8000
```

The API will be available at `http://localhost:8000/api`

## API Endpoints

### Authentication

**Registration:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "referral_code": "ABC12345"
}
```

**Role-Specific Login:**
```http
POST /api/auth/login/student
POST /api/auth/login/lecturer  
POST /api/auth/login/admin
POST /api/auth/login/super-admin

{
  "email": "user@example.com",
  "password": "password123"
}
```

**OAuth:**
```http
GET /api/auth/google/redirect
GET /api/auth/google/callback
```

### Files

**List Files:**
```http
GET /api/files?query=math&type=pdf&tags=2023&sort=created_at&order=desc
```

**Upload File:**
```http
POST /api/files
Content-Type: multipart/form-data

file: [binary]
title: "Mathematics Past Questions"
description: "Complete collection with solutions"
tags[]: "mathematics"
tags[]: "past-questions"
category: "Mathematics"
credit_cost: 5
visibility: "public"
```

**Download File:**
```http
POST /api/files/{id}/download
Authorization: Bearer {token}
```

### Credits

**Get Balance & Transactions:**
```http
GET /api/credits
Authorization: Bearer {token}
```

**Daily Claim:**
```http
POST /api/credits/daily-claim
Authorization: Bearer {token}
```

**Admin Grant Credits:**
```http
POST /api/admin/users/{id}/credits/grant
Authorization: Bearer {token}

{
  "amount": 100,
  "reason": "Bonus credits"
}
```

### Payments

**Stripe Checkout:**
```http
POST /api/payments/stripe/checkout
Authorization: Bearer {token}

{
  "credits": 100
}
```

**Remita Payment:**
```http
POST /api/payments/remita/initiate
Authorization: Bearer {token}

{
  "credits": 100
}
```

### Referrals

**Get Referral Link:**
```http
GET /api/referrals/link
Authorization: Bearer {token}
```

**Get Referral Stats:**
```http
GET /api/referrals/stats
Authorization: Bearer {token}
```

### Ad Rewards

**Complete Ad:**
```http
POST /api/ads/complete
Authorization: Bearer {token}

{
  "network": "admob",
  "placement": "rewarded",
  "proof_token": "ad_network_verification_token"
}
```

### Private Sessions

**Request Session (Student):**
```http
POST /api/sessions
Authorization: Bearer {token}

{
  "lecturer_id": 1,
  "topic": "Advanced Calculus",
  "description": "Need help with integration",
  "scheduled_at": "2024-02-01T14:00:00Z",
  "price_credits": 1000
}
```

**Confirm Session (Lecturer):**
```http
POST /api/sessions/{id}/confirm
Authorization: Bearer {token}
```

### Notifications

**Get Notifications:**
```http
GET /api/notifications?unread_only=true
Authorization: Bearer {token}
```

**Mark as Read:**
```http
POST /api/notifications/{id}/read
Authorization: Bearer {token}
```

## Default Accounts

After seeding, these accounts are available:

**Super Admin:**
- Email: `imamkabir397@gmail.com`
- Password: `Imam.imam4321`
- Role: `super_admin`
- Credits: 10,000

**Staff Admin:**
- Email: `admin@iconiclite.com`
- Password: `admin123`
- Role: `admin`
- Credits: 1,000

**Demo Lecturer:**
- Email: `lecturer@iconiclite.com`
- Password: `lecturer123`
- Role: `lecturer`
- Credits: 500

**Demo Student:**
- Email: `student@iconiclite.com`
- Password: `student123`
- Role: `student`
- Credits: 25

## Roles & Permissions

### Student
- Upload files
- Download files (with credits)
- Request private sessions
- Earn credits (daily, ads, referrals)
- Purchase credits

### Lecturer
- All student permissions
- Manage private sessions
- Upload teaching materials

### Admin
- All lecturer permissions
- Approve files
- View all users
- Manage users (limited)
- Grant credits
- View analytics

### Super Admin
- All admin permissions
- Create admins/lecturers
- Manage user roles
- System settings
- Full platform control

## Credit System

### Earning Credits
- **Daily Login**: 1 credit per day
- **Referrals**: 10 credits per successful referral
- **Ad Watching**: 2 credits per verified ad
- **Purchases**: Via Stripe or Remita

### Spending Credits
- **File Downloads**: Variable cost per file
- **Private Sessions**: 100-10,000 credits per session

### Exchange Rate
- **Nigeria**: ₦20 = 1 credit
- **International**: Converted via Stripe

## File Management

### Supported Types
- **Documents**: PDF, DOCX, DOC
- **Videos**: MP4, AVI, MOV
- **Audio**: MP3
- **Images**: PNG, JPG, JPEG, GIF

### Upload Process
1. User uploads file
2. Admin approval required (except for admin uploads)
3. File becomes available for download
4. Credits deducted on download

## Payment Integration

### Stripe (International)
- Automatic credit awarding via webhooks
- Secure checkout sessions
- Support for multiple currencies

### Remita (Nigeria)
- Local Nigerian payment gateway
- Naira-based transactions
- Webhook verification for credit awarding

## Security Features

- **Rate Limiting**: Login, registration, downloads
- **CORS**: Configured for frontend domains
- **Password Hashing**: Bcrypt with configurable rounds
- **Request Validation**: Comprehensive input validation
- **Role-Based Access**: Granular permission system
- **File Security**: MIME type validation, size limits

## Development Commands

```bash
# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Database operations
php artisan migrate:fresh --seed  # Reset database
php artisan migrate:status        # Check migration status

# Permission cache
php artisan permission:cache-reset

# Storage
php artisan storage:link          # Link public storage

# Queue workers (for background jobs)
php artisan queue:work
```

## Testing

```bash
# Run tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature
```

## Production Deployment

### Environment Configuration
1. Set `APP_ENV=production` and `APP_DEBUG=false`
2. Configure production database
3. Set up real email service
4. Configure OAuth credentials
5. Set up payment gateway credentials
6. Configure file storage (S3 recommended)

### Security Checklist
- [ ] Change default passwords
- [ ] Set strong `APP_KEY`
- [ ] Configure CORS for production domains
- [ ] Set up HTTPS
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

## API Response Format

### Success Response
```json
{
  "data": {...},
  "message": "Operation successful",
  "meta": {...}
}
```

### Error Response
```json
{
  "error": {
    "code": "error_code",
    "message": "Human readable message",
    "details": {...}
  }
}
```

## Frontend Integration

This backend is designed to work with React/Vue/Angular frontends. Key integration points:

- **Authentication**: Use Sanctum tokens in `Authorization: Bearer {token}` headers
- **CORS**: Configured for `localhost:8080` and production domains
- **File Uploads**: Use `multipart/form-data` for file uploads
- **Error Handling**: Consistent error response format
- **Real-time**: Ready for WebSocket integration (Pusher/Ably)

## Support

For issues and questions:
1. Check the API documentation
2. Review error responses for debugging
3. Ensure all environment variables are set
4. Verify database connectivity
5. Check Laravel logs in `storage/logs/`

## License

This project is proprietary software for Iconic Lite platform.