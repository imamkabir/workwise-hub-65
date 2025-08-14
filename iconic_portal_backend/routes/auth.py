from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import timedelta

from database import get_db
from models import User, CreditTransaction
from auth import (
    authenticate_user, 
    create_access_token, 
    get_password_hash, 
    ACCESS_TOKEN_EXPIRE_MINUTES,
    generate_referral_code
)
from security import (
    limiter, 
    log_ip_address, 
    track_login_attempt, 
    send_admin_notification
)
from audit_logger import audit_logger
from webhook_alerts import alert_admin_login, alert_failed_login
from session_manager import create_admin_session, track_admin_activity

router = APIRouter()

# Pydantic models
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

@router.post("/signup", response_model=dict)
@limiter.limit("3/minute")
async def signup(request: Request, user_data: UserSignup, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    referral_code = generate_referral_code(user_data.email)
    
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password,
        referral_code=referral_code,
        credits=25  # Starting credits
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Add welcome credit transaction
    welcome_transaction = CreditTransaction(
        user_id=new_user.id,
        amount=25,
        transaction_type="welcome_bonus",
        description="Welcome bonus credits"
    )
    db.add(welcome_transaction)
    db.commit()
    
    return {
        "message": "Account created successfully",
        "user_id": new_user.id
    }

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, user_data: UserLogin, db: Session = Depends(get_db)):
    # Get client IP
    client_ip = request.client.host
    
    # Check rate limiting and track attempt
    try:
        user = authenticate_user(db, user_data.email, user_data.password)
        if not user:
            # Log failed attempt
            log_ip_address(client_ip, user_data.email, "failed_login")
            track_login_attempt(client_ip, False)
            
            # Send webhook alert for failed login
            alert_failed_login(user_data.email, client_ip, 1)  # Track failed attempts in future
            
            # Log failed login in audit
            audit_logger.log_action(
                db=db,
                user_id="unknown",
                user_email=user_data.email,
                user_role="unknown",
                action="failed_login",
                ip_address=client_ip,
                details={"login_method": "password", "success": False, "reason": "invalid_credentials"}
            )
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Log successful attempt
        log_ip_address(client_ip, user_data.email, "successful_login")
        track_login_attempt(client_ip, True)
        
    # Check for suspicious activity and send alerts
    suspicious = log_ip_address(client_ip, user_data.email, "login_tracking")
    
    # Send admin notification and webhook alert if admin login
    if user.role == "admin":
        send_admin_notification(user.email, client_ip)
        alert_admin_login(user.email, client_ip, new_ip=suspicious)
        
        # Create admin session for timeout tracking
        user_agent = request.headers.get("user-agent", "Unknown")
        create_admin_session(user.id, client_ip, user_agent)
    
    # Log successful login in audit
    audit_logger.log_action(
        db=db,
        user_id=user.id,
        user_email=user.email,
        user_role=user.role,
        action="user_login",
        ip_address=client_ip,
        details={"login_method": "password", "success": True}
    )
    except HTTPException as e:
        # Re-raise HTTP exceptions (like rate limit)
        raise e
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Send admin notification if admin login
    if user.role == "admin":
        send_admin_notification(user.email, client_ip)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "credits": user.credits
        }
    }

@router.post("/logout")
async def logout():
    # For JWT tokens, logout is handled on the frontend by removing the token
    return {"message": "Successfully logged out"}

# Admin route removed - admin can only be created via setup script
# This prevents any API-based admin creation for security