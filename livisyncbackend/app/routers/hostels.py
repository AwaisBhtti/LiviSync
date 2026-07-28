from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..models import Student, Owner, Admin, Hostel
from ..auth import get_current_user
from typing import List, Union

router = APIRouter(
    prefix="/hostels",
    tags=["Hostels"]
)

@router.get("")
def get_hostels(db: Session = Depends(get_db), current_user: Union[Student, Owner, Admin] = Depends(get_current_user)):
    # Return verified hostels (and owned ones for owners)
    if isinstance(current_user, Owner):
        return db.query(Hostel).options(joinedload(Hostel.rooms), joinedload(Hostel.amenities)).filter((Hostel.is_verified == True) | (Hostel.owner_id == current_user.id)).all()
    elif isinstance(current_user, Admin):
        return db.query(Hostel).options(joinedload(Hostel.rooms), joinedload(Hostel.amenities)).all()
    else:
        return db.query(Hostel).options(joinedload(Hostel.rooms), joinedload(Hostel.amenities)).filter(Hostel.is_verified == True).all()
