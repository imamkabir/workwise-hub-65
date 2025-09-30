from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from database import get_db
from models import User, CreditTransaction
from auth import get_current_user, get_current_admin

router = APIRouter()

# Pydantic models
class CreditPurchase(BaseModel):
    amount: int
    payment_method: str = "demo"  # For now, just demo payments

class CreditTransactionResponse(BaseModel):
    id: str
    amount: int
    transaction_type: str
    description: str
    created_at: str

@router.post("/purchase")
async def purchase_credits(
    purchase: CreditPurchase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if purchase.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be positive"
        )
    
    if purchase.amount > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum purchase limit is 1000 credits"
        )
    
    # For demo purposes, we'll just add credits
    # In production, integrate with payment gateway
    current_user.credits += purchase.amount
    
    # Create transaction record
    transaction = CreditTransaction(
        user_id=current_user.id,
        amount=purchase.amount,
        transaction_type="purchase",
        description=f"Purchased {purchase.amount} credits via {purchase.payment_method}"
    )
    
    db.add(transaction)
    db.commit()
    
    return {
        "message": "Credits purchased successfully",
        "credits_added": purchase.amount,
        "new_balance": current_user.credits
    }

@router.post("/redeem")
async def redeem_credits(
    amount: int,
    reason: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be positive"
        )
    
    if current_user.credits < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient credits"
        )
    
    # Deduct credits
    current_user.credits -= amount
    
    # Create transaction record
    transaction = CreditTransaction(
        user_id=current_user.id,
        amount=-amount,
        transaction_type="redemption",
        description=f"Redeemed {amount} credits: {reason}"
    )
    
    db.add(transaction)
    db.commit()
    
    return {
        "message": "Credits redeemed successfully",
        "credits_redeemed": amount,
        "new_balance": current_user.credits
    }

@router.get("/balance")
async def get_credit_balance(current_user: User = Depends(get_current_user)):
    return {"credits": current_user.credits}

@router.get("/transactions", response_model=List[CreditTransactionResponse])
async def get_credit_transactions(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transactions = db.query(CreditTransaction).filter(
        CreditTransaction.user_id == current_user.id
    ).order_by(CreditTransaction.created_at.desc()).offset(skip).limit(limit).all()
    
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

# Admin routes
@router.post("/admin/grant")
async def grant_credits(
    user_id: str,
    amount: int,
    reason: str,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be positive"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Add credits
    user.credits += amount
    
    # Create transaction record
    transaction = CreditTransaction(
        user_id=user.id,
        amount=amount,
        transaction_type="admin_grant",
        description=f"Admin grant by {admin_user.name}: {reason}"
    )
    
    db.add(transaction)
    db.commit()
    
    return {
        "message": "Credits granted successfully",
        "user": user.name,
        "credits_granted": amount,
        "new_balance": user.credits
    }

@router.get("/admin/stats")
async def get_credit_stats(
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Total credits in circulation
    total_credits = db.query(User).with_entities(
        db.func.sum(User.credits)
    ).scalar() or 0
    
    # Total transactions
    total_transactions = db.query(CreditTransaction).count()
    
    # Credits purchased vs earned
    purchased = db.query(CreditTransaction).filter(
        CreditTransaction.transaction_type == "purchase"
    ).with_entities(db.func.sum(CreditTransaction.amount)).scalar() or 0
    
    earned = db.query(CreditTransaction).filter(
        CreditTransaction.transaction_type.in_(["referral", "welcome_bonus", "admin_grant"])
    ).with_entities(db.func.sum(CreditTransaction.amount)).scalar() or 0
    
    spent = db.query(CreditTransaction).filter(
        CreditTransaction.amount < 0
    ).with_entities(db.func.sum(CreditTransaction.amount)).scalar() or 0
    
    return {
        "total_credits_in_circulation": total_credits,
        "total_transactions": total_transactions,
        "credits_purchased": purchased,
        "credits_earned": earned,
        "credits_spent": abs(spent)
    }