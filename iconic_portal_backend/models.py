from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")  # "user" or "admin"
    credits = Column(Integer, default=25)
    is_active = Column(Boolean, default=True)
    referral_code = Column(String, unique=True, index=True)
    referred_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    uploaded_files = relationship("File", back_populates="uploader")
    downloads = relationship("Download", back_populates="user")
    credit_transactions = relationship("CreditTransaction", back_populates="user")
    referrals = relationship("User", backref="referrer", remote_side=[id])

class File(Base):
    __tablename__ = "files"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf, video, audio, doc, etc.
    file_size = Column(Integer, nullable=False)  # in bytes
    credit_cost = Column(Integer, default=5)
    tags = Column(String)  # comma-separated tags
    uploader_id = Column(String, ForeignKey("users.id"))
    download_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    uploader = relationship("User", back_populates="uploaded_files")
    downloads = relationship("Download", back_populates="file")

class Download(Base):
    __tablename__ = "downloads"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    file_id = Column(String, ForeignKey("files.id"))
    credits_spent = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="downloads")
    file = relationship("File", back_populates="downloads")

class CreditTransaction(Base):
    __tablename__ = "credit_transactions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    amount = Column(Integer, nullable=False)  # positive for earning, negative for spending
    transaction_type = Column(String, nullable=False)  # "purchase", "download", "referral", "admin_bonus"
    description = Column(String)
    reference_id = Column(String)  # file_id for downloads, referral_id for referrals, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="credit_transactions")

class Referral(Base):
    __tablename__ = "referrals"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    referrer_id = Column(String, ForeignKey("users.id"))
    referee_email = Column(String, nullable=False)
    referee_id = Column(String, ForeignKey("users.id"), nullable=True)  # Set when they sign up
    credits_earned = Column(Integer, default=0)
    status = Column(String, default="pending")  # "pending", "completed", "failed"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())