from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File as FastAPIFile, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
import uuid
from pathlib import Path

from database import get_db
from models import User, File, Download, CreditTransaction
from auth import get_current_user, get_current_admin

router = APIRouter()

# Pydantic models
class FileResponse(BaseModel):
    id: str
    title: str
    description: str
    file_type: str
    file_size: int
    credit_cost: int
    tags: List[str]
    uploader_name: str
    download_count: int
    created_at: str

class FileUpload(BaseModel):
    title: str
    description: str
    credit_cost: int
    tags: str

UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {
    'pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx',
    'mp4', 'avi', 'mov', 'mkv', 'mp3', 'wav', 'aac',
    'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar'
}

def allowed_file(filename: str) -> bool:
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_type(filename: str) -> str:
    extension = filename.rsplit('.', 1)[1].lower()
    
    if extension in ['pdf']:
        return 'document'
    elif extension in ['doc', 'docx', 'txt', 'ppt', 'pptx']:
        return 'document'
    elif extension in ['mp4', 'avi', 'mov', 'mkv']:
        return 'video'
    elif extension in ['mp3', 'wav', 'aac']:
        return 'audio'
    elif extension in ['jpg', 'jpeg', 'png', 'gif']:
        return 'image'
    elif extension in ['zip', 'rar']:
        return 'archive'
    else:
        return 'other'

@router.post("/upload")
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    title: str = Form(...),
    description: str = Form(""),
    credit_cost: int = Form(5),
    tags: str = Form(""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if file is allowed
    if not allowed_file(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type not allowed"
        )
    
    # Generate unique filename
    file_extension = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not save file"
        )
    
    # Get file size
    file_size = os.path.getsize(file_path)
    
    # Create file record
    new_file = File(
        title=title,
        description=description,
        filename=file.filename,
        file_path=file_path,
        file_type=get_file_type(file.filename),
        file_size=file_size,
        credit_cost=credit_cost,
        tags=tags,
        uploader_id=current_user.id
    )
    
    db.add(new_file)
    db.commit()
    db.refresh(new_file)
    
    return {
        "message": "File uploaded successfully",
        "file_id": new_file.id,
        "filename": new_file.filename
    }

@router.get("/", response_model=List[FileResponse])
async def get_files(
    skip: int = 0,
    limit: int = 50,
    file_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(File).filter(File.is_active == True)
    
    # Filter by file type
    if file_type:
        query = query.filter(File.file_type == file_type)
    
    # Search in title and description
    if search:
        query = query.filter(
            (File.title.contains(search)) | 
            (File.description.contains(search)) |
            (File.tags.contains(search))
        )
    
    files = query.offset(skip).limit(limit).all()
    
    return [
        FileResponse(
            id=f.id,
            title=f.title,
            description=f.description or "",
            file_type=f.file_type,
            file_size=f.file_size,
            credit_cost=f.credit_cost,
            tags=f.tags.split(',') if f.tags else [],
            uploader_name=f.uploader.name,
            download_count=f.download_count,
            created_at=f.created_at.isoformat()
        )
        for f in files
    ]

@router.get("/{file_id}")
async def get_file_details(file_id: str, db: Session = Depends(get_db)):
    file = db.query(File).filter(File.id == file_id, File.is_active == True).first()
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return FileResponse(
        id=file.id,
        title=file.title,
        description=file.description or "",
        file_type=file.file_type,
        file_size=file.file_size,
        credit_cost=file.credit_cost,
        tags=file.tags.split(',') if file.tags else [],
        uploader_name=file.uploader.name,
        download_count=file.download_count,
        created_at=file.created_at.isoformat()
    )

@router.post("/{file_id}/download")
async def download_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get file
    file = db.query(File).filter(File.id == file_id, File.is_active == True).first()
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Check if user has enough credits
    if current_user.credits < file.credit_cost:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient credits"
        )
    
    # Deduct credits
    current_user.credits -= file.credit_cost
    
    # Create download record
    download = Download(
        user_id=current_user.id,
        file_id=file.id,
        credits_spent=file.credit_cost
    )
    
    # Create credit transaction
    transaction = CreditTransaction(
        user_id=current_user.id,
        amount=-file.credit_cost,
        transaction_type="download",
        description=f"Downloaded: {file.title}",
        reference_id=file.id
    )
    
    # Update download count
    file.download_count += 1
    
    db.add(download)
    db.add(transaction)
    db.commit()
    
    # Return file
    if not os.path.exists(file.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server"
        )
    
    return FileResponse(
        path=file.file_path,
        filename=file.filename,
        media_type='application/octet-stream'
    )

# Admin routes
@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Soft delete
    file.is_active = False
    db.commit()
    
    return {"message": "File deleted successfully"}

@router.get("/admin/stats")
async def get_file_stats(
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_files = db.query(File).filter(File.is_active == True).count()
    total_downloads = db.query(Download).count()
    
    # Most downloaded files
    most_downloaded = db.query(File).filter(File.is_active == True)\
        .order_by(File.download_count.desc()).limit(10).all()
    
    return {
        "total_files": total_files,
        "total_downloads": total_downloads,
        "most_downloaded": [
            {
                "id": f.id,
                "title": f.title,
                "download_count": f.download_count
            }
            for f in most_downloaded
        ]
    }