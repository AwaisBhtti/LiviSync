import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Hostel, Profile, PhoneViewLog
from ..auth import get_current_user
from typing import List

router = APIRouter(
    prefix="/hostels",
    tags=["Hostels"]
)

@router.get("")
def get_hostels(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Return verified hostels (and owned ones for owners)
    if current_user.profile and current_user.profile.role == "owner":
        return db.query(Hostel).filter((Hostel.is_verified == True) | (Hostel.owner_id == current_user.id)).all()
    elif current_user.profile and current_user.profile.role == "admin":
        return db.query(Hostel).all()
    else:
        return db.query(Hostel).filter(Hostel.is_verified == True).all()

@router.post("/{hostel_id}/view-phone")
def view_owner_phone(hostel_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Everyone can view/click except admins and owners
    if current_user.profile and current_user.profile.role in ["admin", "owner"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins and owners cannot view/log phone views"
        )
        
    hostel = db.query(Hostel).filter(Hostel.id == hostel_id).first()
    if not hostel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hostel not found"
        )
        
    if not hostel.owner_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hostel has no registered owner"
        )
        
    owner_profile = db.query(Profile).filter(Profile.id == hostel.owner_id).first()
    if not owner_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Owner profile not found"
        )
        
    # Log click in database
    log = PhoneViewLog(student_id=current_user.id, hostel_id=hostel_id)
    db.add(log)
    db.commit()
    
    return {"phone": owner_profile.phone or "Not provided"}
