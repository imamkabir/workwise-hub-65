from datetime import datetime, timedelta
from typing import Dict, Set, Optional
from collections import defaultdict
import jwt
import os
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from models import User
from database import get_db
import logging

# Session tracking for admin timeout
admin_sessions: Dict[str, Dict] = {}  # user_id -> session_info
admin_activity: Dict[str, datetime] = {}  # user_id -> last_activity

# Admin session timeout (configurable)
ADMIN_SESSION_TIMEOUT_MINUTES = int(os.getenv("ADMIN_SESSION_TIMEOUT", 30))

security = HTTPBearer()

def track_admin_activity(user_id: str, user_role: str):
    """Track admin activity for session timeout"""
    if user_role == "admin":
        admin_activity[user_id] = datetime.utcnow()
        logging.info(f"Admin activity tracked for user {user_id}")

def check_admin_session_timeout(user_id: str, user_role: str) -> bool:
    """Check if admin session has timed out"""
    if user_role != "admin":
        return False  # Not an admin, no timeout check needed
    
    if user_id not in admin_activity:
        return True  # No activity recorded, consider timed out
    
    last_activity = admin_activity[user_id]
    timeout_threshold = datetime.utcnow() - timedelta(minutes=ADMIN_SESSION_TIMEOUT_MINUTES)
    
    if last_activity < timeout_threshold:
        # Session timed out, remove from tracking
        if user_id in admin_activity:
            del admin_activity[user_id]
        if user_id in admin_sessions:
            del admin_sessions[user_id]
        
        logging.warning(f"Admin session timed out for user {user_id}")
        return True
    
    return False

def create_admin_session(user_id: str, ip_address: str, user_agent: str):
    """Create admin session tracking"""
    admin_sessions[user_id] = {
        "created_at": datetime.utcnow(),
        "ip_address": ip_address,
        "user_agent": user_agent,
        "last_activity": datetime.utcnow()
    }
    admin_activity[user_id] = datetime.utcnow()

def get_current_user_with_session_check(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Enhanced user authentication with admin session timeout"""
    from auth import verify_token
    
    try:
        token = credentials.credentials
        email = verify_token(token)
        user = db.query(User).filter(User.email == email).first()
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check admin session timeout
        if check_admin_session_timeout(user.id, user.role):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Admin session expired due to inactivity. Please login again.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Track admin activity
        track_admin_activity(user.id, user.role)
        
        return user
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_admin_with_session_check(
    request: Request,
    current_user: User = Depends(get_current_user_with_session_check)
):
    """Enhanced admin check with additional security"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Additional security: ensure it's the correct admin
    if current_user.email != "imamkabir397@gmail.com":
        logging.warning(f"Unauthorized admin access attempt: {current_user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized admin account"
        )
    
    # Update session activity
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent", "Unknown")
    
    if current_user.id in admin_sessions:
        admin_sessions[current_user.id]["last_activity"] = datetime.utcnow()
        admin_sessions[current_user.id]["ip_address"] = client_ip
    else:
        create_admin_session(current_user.id, client_ip, user_agent)
    
    return current_user

def force_admin_logout(user_id: str):
    """Force logout an admin user"""
    if user_id in admin_activity:
        del admin_activity[user_id]
    if user_id in admin_sessions:
        del admin_sessions[user_id]
    
    logging.info(f"Forced admin logout for user {user_id}")

def get_active_admin_sessions() -> Dict:
    """Get information about active admin sessions"""
    active_sessions = {}
    current_time = datetime.utcnow()
    
    for user_id, session_info in admin_sessions.items():
        time_since_activity = current_time - session_info["last_activity"]
        
        active_sessions[user_id] = {
            "ip_address": session_info["ip_address"],
            "user_agent": session_info["user_agent"],
            "created_at": session_info["created_at"].isoformat(),
            "last_activity": session_info["last_activity"].isoformat(),
            "minutes_since_activity": int(time_since_activity.total_seconds() / 60),
            "expires_in_minutes": max(0, ADMIN_SESSION_TIMEOUT_MINUTES - int(time_since_activity.total_seconds() / 60))
        }
    
    return active_sessions

def cleanup_expired_sessions():
    """Clean up expired admin sessions"""
    current_time = datetime.utcnow()
    expired_users = []
    
    for user_id, last_activity in admin_activity.items():
        if current_time - last_activity > timedelta(minutes=ADMIN_SESSION_TIMEOUT_MINUTES):
            expired_users.append(user_id)
    
    for user_id in expired_users:
        force_admin_logout(user_id)
        logging.info(f"Cleaned up expired session for user {user_id}")
    
    return len(expired_users)