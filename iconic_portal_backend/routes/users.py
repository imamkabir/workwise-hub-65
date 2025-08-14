from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List

from database import get_db
from models import User, CreditTransaction, Download, File
from auth import get_current_user, get_current_admin
from audit_logger import audit_logger
from session_manager import get_current_admin_with_session_check

router = APIRouter()

# Pydantic models
class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    role: str
    credits: int
    referral_code: str
    created_at: str

class UserUpdate(BaseModel):
    name: str
    email: EmailStr

class CreditTransactionResponse(BaseModel):
    id: str
    amount: int
    transaction_type: str
    description: str
    created_at: str

@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: User = Depends(get_current_user)):
    return UserProfile(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        credits=current_user.credits,
        referral_code=current_user.referral_code,
        created_at=current_user.created_at.isoformat()
    )

@router.put("/profile", response_model=UserProfile)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Prevent admin role changes
    if current_user.role == "admin" and current_user.email != "imamkabir397@gmail.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized admin account"
        )
    
    # Check if email is already taken by another user
    existing_user = db.query(User).filter(
        User.email == user_update.email,
        User.id != current_user.id
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already taken"
        )
    
    # Prevent email change for the main admin
    if current_user.email == "imamkabir397@gmail.com" and user_update.email != "imamkabir397@gmail.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot change admin email address"
        )
    
    # Update user
    current_user.name = user_update.name
    current_user.email = user_update.email
    
    db.commit()
    db.refresh(current_user)
    
    return UserProfile(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        credits=current_user.credits,
        referral_code=current_user.referral_code,
        created_at=current_user.created_at.isoformat()
    )

@router.get("/credits")
async def get_credits(current_user: User = Depends(get_current_user)):
    return {"credits": current_user.credits}

@router.get("/transactions", response_model=List[CreditTransactionResponse])
async def get_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transactions = db.query(CreditTransaction).filter(
        CreditTransaction.user_id == current_user.id
    ).order_by(CreditTransaction.created_at.desc()).limit(50).all()
    
    return [
        CreditTransactionResponse(
            id=t.id,
            amount=t.amount,
            transaction_type=t.transaction_type,
            description=t.description or "",
            created_at=t.created_at.isoformat()
        )
        for t in transactions
    ]

@router.get("/downloads")
async def get_user_downloads(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    downloads = db.query(Download).filter(
        Download.user_id == current_user.id
    ).join(File).order_by(Download.created_at.desc()).limit(50).all()
    
    return [
        {
            "id": d.id,
            "file": {
                "id": d.file.id,
                "title": d.file.title,
                "file_type": d.file.file_type,
                "file_size": d.file.file_size
            },
            "credits_spent": d.credits_spent,
            "download_date": d.created_at.isoformat()
        }
        for d in downloads
    ]

# Admin routes with enhanced security
@router.get("/admin/users")
async def get_all_users(
    request: Request,
    admin_user: User = Depends(get_current_admin_with_session_check),
    db: Session = Depends(get_db)
):
    # Log admin action
    client_ip = request.client.host
    audit_logger.log_action(
        db=db,
        user_id=admin_user.id,
        user_email=admin_user.email,
        user_role=admin_user.role,
        action="view_all_users",
        ip_address=client_ip,
        resource_type="user",
        details={"action": "list_users"}
    )
    
    users = db.query(User).all()
    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "credits": user.credits,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat()
        }
        for user in users
    ]

@router.put("/admin/users/{user_id}/credits")
async def update_user_credits(
    user_id: str,
    credits: int,
    request: Request,
    admin_user: User = Depends(get_current_admin_with_session_check),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    old_credits = user.credits
    user.credits = credits
    
    # Create transaction record
    transaction = CreditTransaction(
        user_id=user.id,
        amount=credits - old_credits,
        transaction_type="admin_adjustment",
        description=f"Credit adjustment by admin {admin_user.name}"
    )
    
    # Log admin action
    client_ip = request.client.host
    audit_logger.log_action(
        db=db,
        user_id=admin_user.id,
        user_email=admin_user.email,
        user_role=admin_user.role,
        action="update_user_credits",
        ip_address=client_ip,
        resource_type="user",
        resource_id=user_id,
        details={
            "target_user_email": user.email,
            "old_credits": old_credits,
            "new_credits": credits,
            "credit_change": credits - old_credits
        }
    )
    
    db.add(transaction)
    db.commit()
    
    return {"message": "Credits updated successfully", "new_credits": credits}