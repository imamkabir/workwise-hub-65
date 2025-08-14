import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Dict, Set
import os
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException, status
from collections import defaultdict
import magic
from dotenv import load_dotenv

load_dotenv()

# Rate limiting
limiter = Limiter(key_func=get_remote_address)

# IP tracking for suspicious activity
login_attempts: Dict[str, list] = defaultdict(list)
user_ips: Dict[str, Set[str]] = defaultdict(set)

# Admin email for notifications
ADMIN_EMAIL = "imamkabir397@gmail.com"

def log_ip_address(ip: str, email: str = None, action: str = "login_attempt"):
    """Log IP address for security monitoring"""
    timestamp = datetime.utcnow()
    
    # Log to file
    logging.basicConfig(
        filename='security.log',
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    
    if email:
        logging.info(f"IP: {ip} | Email: {email} | Action: {action}")
        
        # Track user IPs for suspicious activity detection
        user_ips[email].add(ip)
        
        # If user has logged in from more than 3 different IPs, flag as suspicious
        if len(user_ips[email]) > 3:
            logging.warning(f"SUSPICIOUS: User {email} logged in from {len(user_ips[email])} different IPs")
            return True  # Suspicious activity detected
    else:
        logging.info(f"IP: {ip} | Action: {action}")
    
    return False

def track_login_attempt(ip: str, success: bool):
    """Track login attempts for rate limiting"""
    now = datetime.utcnow()
    
    # Clean old attempts (older than 1 hour)
    login_attempts[ip] = [
        attempt for attempt in login_attempts[ip] 
        if now - attempt['time'] < timedelta(hours=1)
    ]
    
    # Add current attempt
    login_attempts[ip].append({
        'time': now,
        'success': success
    })
    
    # Check for too many failed attempts
    failed_attempts = [
        attempt for attempt in login_attempts[ip] 
        if not attempt['success'] and now - attempt['time'] < timedelta(minutes=15)
    ]
    
    if len(failed_attempts) >= 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please try again in 15 minutes."
        )

def send_admin_notification(user_email: str, ip: str):
    """Send email notification for admin login"""
    try:
        # Gmail SMTP configuration
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        sender_email = os.getenv("SMTP_EMAIL", "noreply@example.com")
        sender_password = os.getenv("SMTP_PASSWORD", "")
        
        if not sender_password:
            logging.warning("SMTP password not configured - admin notification skipped")
            return
        
        # Create message
        message = MIMEMultipart()
        message["From"] = sender_email
        message["To"] = ADMIN_EMAIL
        message["Subject"] = "🔐 Admin Login Alert - Iconic Portal"
        
        body = f"""
        <html>
        <body>
            <h2>🔐 Admin Login Notification</h2>
            <p><strong>Time:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
            <p><strong>User:</strong> {user_email}</p>
            <p><strong>IP Address:</strong> {ip}</p>
            <p><strong>Platform:</strong> Iconic Portal</p>
            
            <hr>
            <p><em>This is an automated security notification.</em></p>
        </body>
        </html>
        """
        
        message.attach(MIMEText(body, "html"))
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, ADMIN_EMAIL, message.as_string())
        
        logging.info(f"Admin notification sent for login: {user_email}")
        
    except Exception as e:
        logging.error(f"Failed to send admin notification: {str(e)}")

def verify_file_type(file_content: bytes, filename: str) -> bool:
    """Verify file MIME type matches extension"""
    try:
        # Get MIME type from file content
        mime_type = magic.from_buffer(file_content, mime=True)
        
        # Get expected MIME types based on file extension
        extension = filename.lower().split('.')[-1]
        
        allowed_types = {
            'pdf': ['application/pdf'],
            'mp4': ['video/mp4'],
            'mp3': ['audio/mpeg', 'audio/mp3'],
            'wav': ['audio/wav', 'audio/x-wav'],
            'doc': ['application/msword'],
            'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            'xls': ['application/vnd.ms-excel'],
            'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            'ppt': ['application/vnd.ms-powerpoint'],
            'pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
            'txt': ['text/plain'],
            'zip': ['application/zip'],
            'rar': ['application/x-rar-compressed'],
            'jpg': ['image/jpeg'],
            'jpeg': ['image/jpeg'],
            'png': ['image/png'],
            'gif': ['image/gif'],
        }
        
        if extension in allowed_types:
            return mime_type in allowed_types[extension]
        
        return False
        
    except Exception as e:
        logging.error(f"File type verification failed: {str(e)}")
        return False

def is_admin_locked(user_role: str, user_id: str) -> bool:
    """Check if admin role is locked (only allow the specific admin)"""
    # Only allow admin role for the specific admin user
    if user_role == "admin":
        # This should be the specific admin user ID
        return user_id != "admin-user-id"  # Will be updated with actual admin ID
    return False

def generate_csrf_token() -> str:
    """Generate CSRF token"""
    import secrets
    return secrets.token_urlsafe(32)

# Security headers middleware
def add_security_headers(response):
    """Add security headers to response"""
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response