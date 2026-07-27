import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Owner, Hostel, HostelAmenity, HostelRoom
from ..auth import get_current_user
from pydantic import BaseModel
from typing import List

router = APIRouter(
    prefix="/owners",
    tags=["Owners"]
)

def require_owner(current_user = Depends(get_current_user)):
    if not isinstance(current_user, Owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Owner privileges required"
        )
    return current_user

class RoomSchema(BaseModel):
    sharingType: str
    available: int

class HostelCreate(BaseModel):
    name: str
    location: str
    price: int
    description: str
    images: List[str]
    amenities: List[str]
    rooms: List[RoomSchema]

@router.get("/hostels")
def get_my_hostels(db: Session = Depends(get_db), current_user: Owner = Depends(require_owner)):
    return db.query(Hostel).filter(Hostel.owner_id == current_user.id).all()

@router.post("/hostels", status_code=status.HTTP_201_CREATED)
def create_hostel(hostel_in: HostelCreate, db: Session = Depends(get_db), current_user: Owner = Depends(require_owner)):
    new_hostel = Hostel(
        name=hostel_in.name,
        location=hostel_in.location,
        price=hostel_in.price,
        description=hostel_in.description,
        images=hostel_in.images,
        owner_id=current_user.id,
        is_verified=False  # Must be verified by admin
    )
    db.add(new_hostel)
    db.commit()
    db.refresh(new_hostel)

    # Add amenities
    for amenity in hostel_in.amenities:
        db_amenity = HostelAmenity(hostel_id=new_hostel.id, amenity=amenity)
        db.add(db_amenity)

    # Add rooms
    for room in hostel_in.rooms:
        db_room = HostelRoom(hostel_id=new_hostel.id, sharing_type=room.sharingType, available=room.available)
        db.add(db_room)

    db.commit()
    return new_hostel

@router.put("/hostels/{hostel_id}")
def update_hostel(hostel_id: uuid.UUID, hostel_in: HostelCreate, db: Session = Depends(get_db), current_user: Owner = Depends(require_owner)):
    hostel = db.query(Hostel).filter(Hostel.id == hostel_id, Hostel.owner_id == current_user.id).first()
    if not hostel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hostel listing not found or not owned by you"
        )
    
    hostel.name = hostel_in.name
    hostel.location = hostel_in.location
    hostel.price = hostel_in.price
    hostel.description = hostel_in.description
    hostel.images = hostel_in.images
    
    # Re-add amenities
    db.query(HostelAmenity).filter(HostelAmenity.hostel_id == hostel_id).delete()
    for amenity in hostel_in.amenities:
        db_amenity = HostelAmenity(hostel_id=hostel_id, amenity=amenity)
        db.add(db_amenity)

    # Re-add rooms
    db.query(HostelRoom).filter(HostelRoom.hostel_id == hostel_id).delete()
    for room in hostel_in.rooms:
        db_room = HostelRoom(hostel_id=hostel_id, sharing_type=room.sharingType, available=room.available)
        db.add(db_room)

    db.commit()
    return hostel

@router.delete("/hostels/{hostel_id}")
def delete_hostel(hostel_id: uuid.UUID, db: Session = Depends(get_db), current_user: Owner = Depends(require_owner)):
    hostel = db.query(Hostel).filter(Hostel.id == hostel_id, Hostel.owner_id == current_user.id).first()
    if not hostel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hostel listing not found or not owned by you"
        )
    
    db.delete(hostel)
    db.commit()
    return {"message": "Hostel listing deleted successfully"}
