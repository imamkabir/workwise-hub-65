# 🔐 Enhanced Iconic Portal - Advanced Security Setup

## 🚀 Quick Setup & Testing

### 1. Backend Setup
```bash
cd iconic_portal_backend
pip install -r requirements.txt
cp .env.example .env
```

### 2. Configure Environment (.env)
```bash
# Required Configuration
SECRET_KEY=8f9a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7
TOKEN_EXPIRE_HOURS=2
ADMIN_SESSION_TIMEOUT=30
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Optional: Email Notifications
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Optional: Discord Webhook for Alerts
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL

# Optional: Slack Webhook for Alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR_WEBHOOK_URL
```

### 3. Initialize Database & Admin
```bash
python admin_setup.py
```

### 4. Start Backend Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Test Login
- **Frontend:** http://localhost:3000
- **Admin Email:** imamkabir397@gmail.com
- **Admin Password:** Imam.imam4321

## 🛡️ New Security Features

### 🔄 Database Backup on Startup
- ✅ Automatic timestamped backup every server start
- ✅ Keeps last 10 backups (auto-cleanup)
- ✅ Webhook alerts for backup status
- 📍 **Location:** `backups/` folder
- 🧪 **Test:** Check `backups/` folder after server start

### ⏰ Admin Session Timeout
- ✅ Configurable timeout (default: 30 minutes)
- ✅ Activity tracking for admin users
- ✅ Automatic session cleanup
- ✅ Force logout on inactivity
- 🧪 **Test:** Login as admin, wait 30+ minutes, try admin action

### 📝 Audit Logging
- ✅ Database + file logging for all admin actions
- ✅ Tracks: user, action, IP, timestamp, details
- ✅ Admin endpoint to view logs
- 📍 **Files:** `audit.log`, database `audit_logs` table
- 🧪 **Test:** Perform admin actions, check logs

### 🚨 Webhook Alerts
- ✅ Discord webhook integration
- ✅ Slack webhook integration
- ✅ Email notifications
- ✅ Alerts for: failed logins, admin logins, suspicious uploads
- 🧪 **Test:** Use `/admin/test-webhooks` endpoint

## 🧪 Testing Guide

### 1. Test Database Backup
```bash
# Start server and check
ls backups/
# Should see: iconic_portal_backup_YYYYMMDD_HHMMSS.db
```

### 2. Test Admin Session Timeout
```bash
# 1. Login as admin
# 2. Wait 31 minutes (or change timeout to 1 minute for testing)
# 3. Try to access admin endpoint
# Expected: 401 Unauthorized - session expired
```

### 3. Test Audit Logging
```bash
# 1. Login as admin
# 2. Perform actions: view users, update credits
# 3. Check logs:
curl http://localhost:8000/user/admin/audit-logs
# Or check audit.log file
tail -f audit.log
```

### 4. Test Webhook Alerts

#### Discord Setup:
1. Create Discord server
2. Go to Server Settings → Integrations → Webhooks
3. Create webhook, copy URL
4. Add to .env: `DISCORD_WEBHOOK_URL=your_webhook_url`

#### Slack Setup:
1. Go to Slack App Directory
2. Create Incoming Webhook app
3. Copy webhook URL
4. Add to .env: `SLACK_WEBHOOK_URL=your_webhook_url`

#### Test Webhooks:
```bash
# Test endpoint
curl -X POST http://localhost:8000/admin/test-webhooks

# Trigger real alerts:
# - Failed login (wrong password)
# - Admin login
# - File upload with suspicious extension
```

## 📊 Monitoring Endpoints

### Health Check with Session Cleanup
```bash
GET /health
# Returns: status, expired_sessions_cleaned, uptime
```

### Admin Session Information
```bash
GET /admin/sessions
# Returns: active sessions, timeout settings
```

### Audit Logs
```bash
GET /user/admin/audit-logs?limit=50&action=user_login
# Returns: filtered audit logs
```

### Test Webhooks
```bash
POST /admin/test-webhooks
# Tests all configured webhook endpoints
```

## 🔍 Log Files Generated

1. **server.log** - General server logs
2. **security.log** - Security events (IP tracking, login attempts)
3. **audit.log** - Admin action audit trail
4. **backups/** - Database backup files

## 📱 Alert Types

### Discord/Slack Webhook Alerts:
- 🚫 Failed login attempts
- ⚠️ Suspicious file uploads
- 🔐 Admin login from new IP
- 👑 Admin login (all)
- 💾 Database backup status

### Email Notifications:
- 🔐 Admin login alerts (to imamkabir397@gmail.com)
- ⚠️ Critical security events

## 🛠️ Advanced Configuration

### Adjust Admin Session Timeout
```bash
# In .env file
ADMIN_SESSION_TIMEOUT=15  # 15 minutes instead of 30
```

### Custom Backup Schedule
```bash
# Currently runs on server startup
# For production: set up cron job for regular backups
0 2 * * * cd /path/to/backend && python -c "from backup_manager import create_database_backup; create_database_backup()"
```

### Webhook Customization
Edit `webhook_alerts.py` to:
- Add new alert types
- Customize message formats
- Add additional webhook services

## 🚨 Security Checklist

- [x] Database backups automated
- [x] Admin session timeout enforced
- [x] All admin actions logged
- [x] Webhook alerts configured
- [x] Rate limiting active
- [x] IP tracking enabled
- [x] MIME type verification
- [x] CORS restrictions applied
- [x] JWT tokens expire
- [x] Password hashing (bcrypt 14 rounds)

## 🎯 Production Deployment

1. **Environment Variables:**
   - Set strong SECRET_KEY
   - Configure real email SMTP
   - Set production CORS origins
   - Configure webhook URLs

2. **Database:**
   - Switch to PostgreSQL for production
   - Set up regular backup schedule
   - Monitor disk space for backups

3. **Monitoring:**
   - Set up log rotation
   - Monitor webhook delivery
   - Set up alerting for failed backups

4. **Security:**
   - Use HTTPS
   - Set up firewall rules
   - Regular security updates
   - Monitor audit logs regularly

## 📞 Support

Check logs for troubleshooting:
```bash
tail -f server.log        # General server issues
tail -f security.log      # Security events
tail -f audit.log         # Admin actions
```

Test webhook connectivity:
```bash
curl -X POST http://localhost:8000/admin/test-webhooks
```