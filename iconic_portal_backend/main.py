from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response
import os
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import engine, SessionLocal, Base, get_db
from routes import auth, users, files, credits, referrals
from security import limiter, add_security_headers
from backup_manager import create_database_backup
from audit_logger import AuditLog
from webhook_alerts import webhook_notifier, alert_database_backup
from session_manager import cleanup_expired_sessions
import asyncio
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server.log'),
        logging.StreamHandler()
    ]
)

# Create database backup on startup
print("🔄 Starting Iconic Portal...")
backup_path = create_database_backup()
if backup_path:
    print(f"✅ Database backup created: {backup_path}")
    alert_database_backup(backup_path, True)
else:
    print("⚠️ Database backup failed or no database found")
    alert_database_backup("N/A", False)

# Create database tables (including new audit log table)
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Iconic Portal API",
    description="Content sharing platform with credit system",
    version="1.0.0"
)

# Enhanced CORS middleware - Restrictive for production
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization", "X-CSRF-Token"],
)

# Rate limiting middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security headers middleware
@app.middleware("http")
async def add_security_middleware(request: Request, call_next):
    response = await call_next(request)
    return add_security_headers(response)

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

# Mount static files for file downloads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/user", tags=["Users"])
app.include_router(files.router, prefix="/files", tags=["Files"])
app.include_router(credits.router, prefix="/credits", tags=["Credits"])
app.include_router(referrals.router, prefix="/referrals", tags=["Referrals"])

@app.get("/")
async def root():
    return {
        "message": "Iconic Portal API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    from datetime import datetime
    # Cleanup expired sessions on health check
    expired_count = cleanup_expired_sessions()
    return {
        "status": "healthy",
        "expired_sessions_cleaned": expired_count,
        "uptime": datetime.now().isoformat()
    }

# Add admin session management endpoints
@app.get("/admin/sessions")
async def get_admin_sessions():
    """Get active admin sessions - for monitoring"""
    from session_manager import get_active_admin_sessions
    return {
        "active_sessions": get_active_admin_sessions(),
        "session_timeout_minutes": int(os.getenv("ADMIN_SESSION_TIMEOUT", 30))
    }

@app.post("/admin/test-webhooks")
async def test_webhooks():
    from datetime import datetime
    """Test webhook configurations"""
    results = webhook_notifier.test_webhooks()
    return {
        "webhook_test_results": results,
        "timestamp": datetime.now().isoformat()
    }

# Scheduled cleanup task
async def periodic_cleanup():
    """Run periodic cleanup tasks"""
    while True:
        try:
            expired_count = cleanup_expired_sessions()
            if expired_count > 0:
                logging.info(f"Cleaned up {expired_count} expired admin sessions")
            await asyncio.sleep(300)  # Run every 5 minutes
        except Exception as e:
            logging.error(f"Periodic cleanup error: {str(e)}")
            await asyncio.sleep(60)  # Wait 1 minute before retrying

# Start background tasks
@app.on_event("startup")
async def startup_event():
    """Start background tasks on server startup"""
    asyncio.create_task(periodic_cleanup())
    logging.info("🚀 Iconic Portal started successfully with enhanced security features")
    print("🚀 Server started with:")
    print("   💾 Automatic database backups")
    print("   🔐 Admin session timeout")
    print("   📝 Audit logging")
    print("   🚨 Webhook alerts")
    print("   ⏰ Periodic cleanup tasks")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)