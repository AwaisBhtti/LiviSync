from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Hostel
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
