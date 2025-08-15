# Iconic Portal Laravel Backend

A complete Laravel backend for the Iconic Portal content-sharing platform with authentication, file management, credits system, and admin controls.

## Features

- **Authentication**: Laravel Sanctum SPA authentication
- **Role-Based Access Control**: Super Admin, Admin, and User roles with granular permissions
- **File Management**: Upload, download, and manage files with credit system
- **Credit System**: Track credits, transactions, and automatic deductions
- **Referral System**: Reward users for successful referrals
- **Admin Panel**: User management, analytics, and administrative controls
- **Security**: Rate limiting, validation, file type restrictions, and secure downloads

## Tech Stack

- **Laravel 11** with PHP 8.2+
- **MySQL** (with SQLite option for local development)
- **Laravel Sanctum** for SPA authentication
- **Spatie Laravel Permission** for roles and permissions
- **Rate Limiting** and comprehensive validation
- **File Storage** with secure download URLs

## Quick Start

### 1. Installation

```bash
# Clone and setup
git clone <repository>
cd laravel_backend

# Install dependencies
composer install

# Environment setup
cp .env.example .env
php artisan key:generate
```

### 2. Database Setup

**For MySQL (Production):**
```bash
# Update .env with your MySQL credentials
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=iconic_portal
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

**For SQLite (Local Development):**
```bash
# Uncomment in .env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

# Create SQLite database
touch database/database.sqlite
```

### 3. Run Migrations and Seeders

```bash
# Run migrations
php artisan migrate

# Seed initial data (roles, permissions, super admin)
php artisan db:seed

# Link storage for file downloads
php artisan storage:link
```

### 4. Start Development Server

```bash
php artisan serve --port=8000
```

The API will be available at `http://localhost:8000/api`

## Environment Configuration

### Required Environment Variables

```env
# Application
APP_NAME="Iconic Portal API"
APP_URL=http://localhost:8000

# Database (choose one)
DB_CONNECTION=mysql
# OR
DB_CONNECTION=sqlite

# CORS (Frontend URL)
FRONTEND_URL=http://localhost:5173

# File Upload Limits
MAX_FILE_SIZE=104857600  # 100MB in bytes
ALLOWED_FILE_TYPES=pdf,docx,doc,mp3,mp4,avi,mov,png,jpg,jpeg,gif

# Super Admin Account (for seeding)
SUPER_ADMIN_EMAIL=imamkabir397@gmail.com
SUPER_ADMIN_PASSWORD=Imam.imam4321
SUPER_ADMIN_NAME="Super Admin"

# Rate Limiting
RATE_LIMIT_LOGIN=5   # attempts per minute
RATE_LIMIT_API=60    # requests per minute

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
```

## API Endpoints

### Authentication
```
POST /api/auth/signup     - Create account
POST /api/auth/login      - Login
POST /api/auth/logout     - Logout (requires auth)
```

### User Management
```
GET  /api/user/profile    - Get user profile
PUT  /api/user/profile    - Update profile
```

### Files
```
GET    /api/files              - List files (with search/filter)
POST   /api/files              - Upload file
GET    /api/files/{id}         - Get file details
PUT    /api/files/{id}         - Update file metadata
DELETE /api/files/{id}         - Delete file
GET    /api/files/{id}/download - Download file (deducts credits)
```

### Credits
```
GET  /api/credits          - Get credit balance and transactions
POST /api/credits/redeem   - Redeem credits for file
POST /api/admin/credits/grant - Grant credits (admin only)
```

### Referrals
```
GET  /api/referrals        - Get referral stats
POST /api/referrals/redeem - Process referral
```

### Admin
```
GET  /api/admin/users           - List users (admin+)
GET  /api/admin/analytics       - Platform analytics (admin+)
POST /api/admin/users/create-admin - Create admin (super admin only)
PUT  /api/admin/users/{id}/role    - Change user role (super admin only)
```

## Roles & Permissions

### Roles
- **super_admin**: Full access, can create admins
- **admin**: File management, user viewing, no credit granting
- **user**: Basic file access and uploads

### Permissions
- `files.upload` - Upload files
- `files.manage` - Edit/delete any files
- `users.view` - View user list
- `users.manage_limited` - Basic user management
- `credits.view` - View credit information
- `credits.grant` - Grant credits to users
- `admin.create` - Create admin accounts

## Security Features

- **Rate Limiting**: 5 login attempts/minute, 60 API requests/minute
- **File Validation**: MIME type checking, size limits
- **Secure Downloads**: Temporary signed URLs
- **Role Protection**: Middleware enforcement
- **Input Validation**: Comprehensive FormRequest validation
- **CORS**: Configured for frontend origin only

## File Upload

Files are uploaded to `storage/app/uploads/` with:
- Unique UUID filenames
- MIME type validation
- Size restrictions (configurable)
- Automatic metadata storage

## Default Accounts

After seeding, these accounts are available:

**Super Admin:**
- Email: `imamkabir397@gmail.com`
- Password: `Imam.imam4321`
- Credits: 1000

**Demo Admin:**
- Email: `admin@example.com`
- Password: `password123`
- Credits: 500

**Demo User:**
- Email: `user@example.com`
- Password: `password123`
- Credits: 25

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
```

## Frontend Integration

### Authentication Headers
```javascript
// Include in API requests
headers: {
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}
```

### Expected Response Formats

**Login/Signup:**
```json
{
  "token": "1|abc123...",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "role": "user",
    "credits": 25
  }
}
```

**File List:**
```json
{
  "files": [...],
  "pagination": {
    "current_page": 1,
    "per_page": 15,
    "total": 100,
    "last_page": 7
  }
}
```

## Production Deployment

1. **Environment**: Set `APP_ENV=production` and `APP_DEBUG=false`
2. **Database**: Use MySQL/PostgreSQL, not SQLite
3. **Storage**: Configure cloud storage if needed
4. **HTTPS**: Ensure SSL certificates
5. **Caching**: Enable Redis/Memcached
6. **Queue**: Set up queue workers for background jobs

## Troubleshooting

### Common Issues

**CORS Errors:**
- Verify `FRONTEND_URL` in `.env`
- Check `config/cors.php` configuration

**Permission Denied:**
- Run `php artisan permission:cache-reset`
- Verify role assignments in database

**File Upload Issues:**
- Check `storage/app/uploads/` permissions
- Verify `MAX_FILE_SIZE` setting
- Ensure `php artisan storage:link` was run

**Database Connection:**
- Verify database credentials in `.env`
- For SQLite, ensure file exists and is writable

### Logs

Check Laravel logs for detailed error information:
```bash
tail -f storage/logs/laravel.log
```