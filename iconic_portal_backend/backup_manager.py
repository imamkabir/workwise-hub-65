import os
import shutil
import sqlite3
from datetime import datetime
from typing import Optional
import logging

def create_database_backup(db_path: str = "iconic_portal.db", backup_dir: str = "backups") -> str:
    """Create a timestamped backup of the database"""
    try:
        # Create backup directory if it doesn't exist
        os.makedirs(backup_dir, exist_ok=True)
        
        # Generate timestamped backup filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"iconic_portal_backup_{timestamp}.db"
        backup_path = os.path.join(backup_dir, backup_filename)
        
        # Copy database file
        if os.path.exists(db_path):
            shutil.copy2(db_path, backup_path)
            logging.info(f"✅ Database backup created: {backup_path}")
            
            # Keep only last 10 backups to save space
            cleanup_old_backups(backup_dir, keep_count=10)
            
            return backup_path
        else:
            logging.warning(f"⚠️ Database file not found: {db_path}")
            return None
            
    except Exception as e:
        logging.error(f"❌ Database backup failed: {str(e)}")
        return None

def cleanup_old_backups(backup_dir: str, keep_count: int = 10):
    """Remove old backups, keeping only the most recent ones"""
    try:
        # Get all backup files
        backup_files = [f for f in os.listdir(backup_dir) if f.startswith("iconic_portal_backup_") and f.endswith(".db")]
        
        # Sort by modification time (newest first)
        backup_files.sort(key=lambda x: os.path.getmtime(os.path.join(backup_dir, x)), reverse=True)
        
        # Remove old backups
        for old_backup in backup_files[keep_count:]:
            old_path = os.path.join(backup_dir, old_backup)
            os.remove(old_path)
            logging.info(f"🗑️ Removed old backup: {old_backup}")
            
    except Exception as e:
        logging.error(f"❌ Backup cleanup failed: {str(e)}")

def restore_database_from_backup(backup_path: str, db_path: str = "iconic_portal.db") -> bool:
    """Restore database from a backup file"""
    try:
        if os.path.exists(backup_path):
            shutil.copy2(backup_path, db_path)
            logging.info(f"✅ Database restored from: {backup_path}")
            return True
        else:
            logging.error(f"❌ Backup file not found: {backup_path}")
            return False
            
    except Exception as e:
        logging.error(f"❌ Database restore failed: {str(e)}")
        return False

def list_available_backups(backup_dir: str = "backups") -> list:
    """List all available backup files"""
    try:
        if not os.path.exists(backup_dir):
            return []
            
        backup_files = [f for f in os.listdir(backup_dir) if f.startswith("iconic_portal_backup_") and f.endswith(".db")]
        backup_files.sort(key=lambda x: os.path.getmtime(os.path.join(backup_dir, x)), reverse=True)
        
        backups = []
        for backup_file in backup_files:
            backup_path = os.path.join(backup_dir, backup_file)
            stat = os.stat(backup_path)
            backups.append({
                "filename": backup_file,
                "path": backup_path,
                "size": stat.st_size,
                "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
            })
            
        return backups
        
    except Exception as e:
        logging.error(f"❌ Failed to list backups: {str(e)}")
        return []