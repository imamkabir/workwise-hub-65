from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List

from database import get_db
from models import User, Referral, CreditTransaction
from auth import get_current_user

router = APIRouter()

# Pydantic models
class ReferralCreate(BaseModel):
    referee_email: EmailStr

class ReferralResponse(BaseModel):
    id: str
    referee_email: str
    status: str
    credits_earned: int
    created_at: str

class ReferralStats(BaseModel):
    referral_code: str
    total_referrals: int
    successful_referrals: int
    pending_referrals: int
    total_credits_earned: int
    referrals: List[ReferralResponse]

@router.get("/", response_model=ReferralStats)
async def get_referral_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get all referrals made by this user
    referrals = db.query(Referral).filter(
        Referral.referrer_id == current_user.id
    ).order_by(Referral.created_at.desc()).all()
    
    # Calculate stats
    total_referrals = len(referrals)
    successful_referrals = len([r for r in referrals if r.status == "completed"])
    pending_referrals = len([r for r in referrals if r.status == "pending"])
    total_credits_earned = sum(r.credits_earned for r in referrals)
    
    return ReferralStats(
        referral_code=current_user.referral_code,
        total_referrals=total_referrals,
        successful_referrals=successful_referrals,
        pending_referrals=pending_referrals,
        total_credits_earned=total_credits_earned,
        referrals=[
            ReferralResponse(
                id=r.id,
                referee_email=r.referee_email,
                status=r.status,
                credits_earned=r.credits_earned,
                created_at=r.created_at.isoformat()
            )
            for r in referrals
        ]
    )

@router.post("/invite")
async def create_referral(
    referral: ReferralCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user is trying to refer themselves
    if referral.referee_email == current_user.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot refer yourself"
        )
    
    # Check if already referred this email
    existing_referral = db.query(Referral).filter(
        Referral.referrer_id == current_user.id,
        Referral.referee_email == referral.referee_email
    ).first()
    
    if existing_referral:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already referred"
        )
    
    # Check if email is already a user
    existing_user = db.query(User).filter(User.email == referral.referee_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    
    # Create referral record
    new_referral = Referral(
        referrer_id=current_user.id,
        referee_email=referral.referee_email,
        status="pending"
    )
    
    db.add(new_referral)
    db.commit()
    db.refresh(new_referral)
    
    return {
        "message": "Referral created successfully",
        "referral_id": new_referral.id,
        "referee_email": referral.referee_email
    }

@router.post("/redeem")
async def redeem_referral(
    referral_code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find the referrer by referral code
    referrer = db.query(User).filter(User.referral_code == referral_code).first()
    if not referrer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid referral code"
        )
    
    # Check if user is trying to use their own referral code
    if referrer.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot use your own referral code"
        )
    
    # Check if user was already referred
    if current_user.referred_by:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Referral code already used"
        )
    
    # Find pending referral
    referral = db.query(Referral).filter(
        Referral.referrer_id == referrer.id,
        Referral.referee_email == current_user.email,
        Referral.status == "pending"
    ).first()
    
    if not referral:
        # Create a new referral if it doesn't exist
        referral = Referral(
            referrer_id=referrer.id,
            referee_email=current_user.email,
            status="pending"
        )
        db.add(referral)
        db.flush()  # Get the ID
    
    # Referral bonus (10 credits for referrer, 5 for referee)
    referrer_bonus = 10
    referee_bonus = 5
    
    # Update referral
    referral.referee_id = current_user.id
    referral.status = "completed"
    referral.credits_earned = referrer_bonus
    
    # Update users
    current_user.referred_by = referrer.id
    referrer.credits += referrer_bonus
    current_user.credits += referee_bonus
    
    # Create transaction records
    referrer_transaction = CreditTransaction(
        user_id=referrer.id,
        amount=referrer_bonus,
        transaction_type="referral",
        description=f"Referral bonus for referring {current_user.name}",
        reference_id=referral.id
    )
    
    referee_transaction = CreditTransaction(
        user_id=current_user.id,
        amount=referee_bonus,
        transaction_type="referral",
        description=f"Referral bonus from {referrer.name}",
        reference_id=referral.id
    )
    
    db.add(referrer_transaction)
    db.add(referee_transaction)
    db.commit()
    
    return {
        "message": "Referral redeemed successfully",
        "referrer_bonus": referrer_bonus,
        "referee_bonus": referee_bonus,
        "your_new_balance": current_user.credits
    }

@router.get("/link")
async def get_referral_link(current_user: User = Depends(get_current_user)):
    # In a real app, this would be your frontend URL with the referral code
    base_url = "http://localhost:3000"  # Change to your frontend URL
    referral_link = f"{base_url}/signup?ref={current_user.referral_code}"
    
    return {
        "referral_code": current_user.referral_code,
        "referral_link": referral_link
    }