import logging
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import Column, String, DateTime, Text, Integer
from sqlalchemy.sql import func
from database import Base
import json

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(__import__('uuid').uuid4()))
    user_id = Column(String, nullable=False)
    user_email = Column(String, nullable=False)
    user_role = Column(String, nullable=False)
    action = Column(String, nullable=False)  # e.g., "delete_file", "update_credits", "user_login"
    resource_type = Column(String, nullable=True)  # e.g., "file", "user", "credit"
    resource_id = Column(String, nullable=True)  # ID of affected resource
    details = Column(Text, nullable=True)  # JSON details
    ip_address = Column(String, nullable=False)
    user_agent = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class AuditLogger:
    def __init__(self):
        self.logger = logging.getLogger("audit")
        self.logger.setLevel(logging.INFO)
        
        # Create file handler for audit logs
        if not self.logger.handlers:
            handler = logging.FileHandler("audit.log")
            formatter = logging.Formatter(
                '%(asctime)s - AUDIT - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)

    def log_action(
        self,
        db: Session,
        user_id: str,
        user_email: str,
        user_role: str,
        action: str,
        ip_address: str,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        details: Optional[Dict[Any, Any]] = None,
        user_agent: Optional[str] = None
    ):
        """Log an audit event to both database and file"""
        try:
            # Create database record
            audit_entry = AuditLog(
                user_id=user_id,
                user_email=user_email,
                user_role=user_role,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                details=json.dumps(details) if details else None,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            db.add(audit_entry)
            db.commit()
            
            # Log to file as well
            log_message = f"User: {user_email} ({user_role}) | Action: {action} | IP: {ip_address}"
            if resource_type and resource_id:
                log_message += f" | Resource: {resource_type}:{resource_id}"
            if details:
                log_message += f" | Details: {json.dumps(details)}"
            
            self.logger.info(log_message)
            
        except Exception as e:
            self.logger.error(f"Failed to log audit event: {str(e)}")

    def get_audit_logs(
        self,
        db: Session,
        user_id: Optional[str] = None,
        action: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> list:
        """Retrieve audit logs with optional filtering"""
        try:
            query = db.query(AuditLog)
            
            if user_id:
                query = query.filter(AuditLog.user_id == user_id)
            
            if action:
                query = query.filter(AuditLog.action == action)
            
            logs = query.order_by(AuditLog.timestamp.desc()).offset(offset).limit(limit).all()
            
            return [
                {
                    "id": log.id,
                    "user_email": log.user_email,
                    "user_role": log.user_role,
                    "action": log.action,
                    "resource_type": log.resource_type,
                    "resource_id": log.resource_id,
                    "details": json.loads(log.details) if log.details else None,
                    "ip_address": log.ip_address,
                    "user_agent": log.user_agent,
                    "timestamp": log.timestamp.isoformat()
                }
                for log in logs
            ]
            
        except Exception as e:
            self.logger.error(f"Failed to retrieve audit logs: {str(e)}")
            return []

    def get_user_activity(self, db: Session, user_id: str, hours: int = 24) -> list:
        """Get recent activity for a specific user"""
        try:
            from datetime import timedelta
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            logs = db.query(AuditLog).filter(
                AuditLog.user_id == user_id,
                AuditLog.timestamp >= cutoff_time
            ).order_by(AuditLog.timestamp.desc()).all()
            
            return [
                {
                    "action": log.action,
                    "resource_type": log.resource_type,
                    "ip_address": log.ip_address,
                    "timestamp": log.timestamp.isoformat()
                }
                for log in logs
            ]
            
        except Exception as e:
            self.logger.error(f"Failed to get user activity: {str(e)}")
            return []

# Global audit logger instance
audit_logger = AuditLogger()