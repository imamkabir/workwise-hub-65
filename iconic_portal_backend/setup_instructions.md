# 🔐 Secure Iconic Portal Setup Instructions

## 🚀 Quick Setup

1. **Install Dependencies**
   ```bash
   cd iconic_portal_backend
   pip install -r requirements.txt
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize Database & Admin Account**
   ```bash
   python admin_setup.py
   ```

4. **Start Backend Server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Access Login**
   - Frontend: http://localhost:3000
   - Admin Email: imamkabir397@gmail.com
   - Admin Password: Imam.imam4321

## 🛡️ Security Features Implemented

### Authentication & Authorization
- ✅ Bcrypt password hashing (14 rounds)
- ✅ JWT tokens with configurable expiration
- ✅ Rate limiting (5 login attempts per minute per IP)
- ✅ IP address logging for all login attempts
- ✅ Admin role locked (cannot be changed via API)
- ✅ Email notifications for admin logins

### File Security
- ✅ MIME type verification vs file extension
- ✅ File upload restricted to authenticated users only
- ✅ Allowed file types whitelist
- ✅ File size validation

### API Security
- ✅ CORS restricted to allowed origins
- ✅ Security headers (XSS, CSRF, etc.)
- ✅ Rate limiting on authentication endpoints
- ✅ Admin routes require extra verification

### Frontend Security
- ✅ Removed all hardcoded demo credentials
- ✅ Admin UI hidden unless user is admin
- ✅ Proper role-based access control

## 📧 Email Configuration

For admin login notifications, configure in `.env`:
```bash
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Gmail App Password
```

## 🔧 Configuration Options

### Token Expiration
```bash
TOKEN_EXPIRE_HOURS=2  # Default: 2 hours
```

### CORS Origins
```bash
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Database
```bash
DATABASE_URL=sqlite:///./iconic_portal.db  # Default SQLite
# For PostgreSQL: postgresql://user:password@localhost/dbname
```

## 🚨 Important Security Notes

1. **Admin Account**: Only one admin account exists (imamkabir397@gmail.com)
2. **Admin Role**: Cannot be granted or changed via API calls
3. **Password**: Change default admin password after first login
4. **Secret Key**: Use a secure random key in production
5. **CORS**: Restrict to your actual domain in production
6. **HTTPS**: Use HTTPS in production environment

## 📝 API Endpoints

### Authentication
- `POST /auth/signup` - Create user account (rate limited: 3/min)
- `POST /auth/login` - Login (rate limited: 5/min)
- `POST /auth/logout` - Logout

### Users
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update profile
- `GET /user/credits` - Get credits
- `GET /user/transactions` - Get transaction history

### Files
- `POST /files/upload` - Upload file (auth required)
- `GET /files/` - List files
- `GET /files/{id}` - Get file details
- `POST /files/{id}/download` - Download file

### Admin Only
- `GET /user/admin/users` - List all users
- `PUT /user/admin/users/{id}/credits` - Update user credits
- `DELETE /files/{id}` - Delete file
- `GET /files/admin/stats` - File statistics

## 🔍 Monitoring & Logs

- Security events logged to `security.log`
- IP tracking for suspicious activity
- Failed login attempt monitoring
- Admin login email notifications

## 🛠️ Troubleshooting

1. **Cannot connect to backend**: Ensure server is running on port 8000
2. **Admin login fails**: Check credentials and ensure admin account exists
3. **File upload fails**: Check file type and authentication
4. **Email notifications not working**: Configure SMTP settings in .env

## 🎯 Next Steps

1. Change admin password after first login
2. Configure email notifications
3. Set up production environment variables
4. Deploy with HTTPS
5. Set up database backups
6. Monitor security logs regularly