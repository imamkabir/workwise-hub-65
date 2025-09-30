#!/usr/bin/env python3
"""
Admin Setup Script - Creates the single admin account
Run this script to set up the admin account and clear any existing data
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add the current directory to path so we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import Base, get_db
from models import User, CreditTransaction
from auth import get_password_hash, generate_referral_code

load_dotenv()

def setup_admin():
    """Clear database and create single admin account"""
    
    # Database connection
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./iconic_portal.db")
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Drop and recreate all tables
    print("🗑️ Clearing existing database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # Create session
    db = SessionLocal()
    
    try:
        # Admin credentials
        admin_email = "imamkabir397@gmail.com"
        admin_password = "Imam.imam4321"
        admin_name = "Imam Kabir"
        
        # Hash password with high security
        hashed_password = get_password_hash(admin_password)
        referral_code = generate_referral_code(admin_email)
        
        # Create admin user
        admin_user = User(
            name=admin_name,
            email=admin_email,
            hashed_password=hashed_password,
            role="admin",
            referral_code=referral_code,
            credits=10000,  # Admin gets plenty of credits
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        # Add welcome transaction for admin
        admin_transaction = CreditTransaction(
            user_id=admin_user.id,
            amount=10000,
            transaction_type="admin_setup",
            description="Initial admin account setup"
        )
        db.add(admin_transaction)
        db.commit()
        
        print("✅ Database setup complete!")
        print(f"📧 Admin Email: {admin_email}")
        print(f"🔑 Admin Password: {admin_password}")
        print(f"👤 Admin ID: {admin_user.id}")
        print(f"🎫 Referral Code: {referral_code}")
        print(f"💰 Credits: {admin_user.credits}")
        print("\n⚠️  IMPORTANT: Change the admin password after first login!")
        print("🔒 Admin role is locked and cannot be changed via API calls.")
        
        return admin_user.id
        
    except Exception as e:
        print(f"❌ Error setting up admin: {str(e)}")
        db.rollback()
        return None
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Setting up Iconic Portal Admin Account...")
    admin_id = setup_admin()
    
    if admin_id:
        print(f"\n🎉 Setup successful! Admin ID: {admin_id}")
        print("\nNext steps:")
        print("1. Start the FastAPI server: uvicorn main:app --reload")
        print("2. Login with the admin credentials")
        print("3. Change the default password in settings")
    else:
        print("\n❌ Setup failed. Check the error messages above.")
        sys.exit(1)