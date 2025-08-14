from fastapi import APIRouter, Depends, HTTPException, status
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
async def signup(user_data: UserSignup, db: Session = Depends(get_db)):
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
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
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

# Admin route to create admin users
@router.post("/create-admin")
async def create_admin(admin_data: UserSignup, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == admin_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create admin user
    hashed_password = get_password_hash(admin_data.password)
    referral_code = generate_referral_code(admin_data.email)
    
    admin_user = User(
        name=admin_data.name,
        email=admin_data.email,
        hashed_password=hashed_password,
        role="admin",
        referral_code=referral_code,
        credits=1000  # Admins get more credits
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    return {
        "message": "Admin account created successfully",
        "user_id": admin_user.id
    }