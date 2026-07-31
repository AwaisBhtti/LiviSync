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
        hostels = db.query(Hostel).options(joinedload(Hostel.rooms), joinedload(Hostel.amenities), joinedload(Hostel.owner)).filter((Hostel.is_verified == True) | (Hostel.owner_id == current_user.id)).all()
    elif isinstance(current_user, Admin):
        hostels = db.query(Hostel).options(joinedload(Hostel.rooms), joinedload(Hostel.amenities), joinedload(Hostel.owner)).all()
    else:
        hostels = db.query(Hostel).options(joinedload(Hostel.rooms), joinedload(Hostel.amenities), joinedload(Hostel.owner)).filter(Hostel.is_verified == True).all()

    result = []
    for h in hostels:
        h_dict = {
            "id": str(h.id),
            "name": h.name,
            "location": h.location,
            "description": h.description,
            "photo": h.photo,
            "photos": h.photos,
            "electricity_bill_included": h.electricity_bill_included,
            "hostel_type": h.hostel_type,
            "owner_id": str(h.owner_id) if h.owner_id else None,
            "is_verified": h.is_verified,
            "owner_name": h.owner.name if h.owner else "Unknown Owner",
            "rooms": [{
                "id": str(r.id),
                "hostel_id": str(r.hostel_id),
                "sharing_type": r.sharing_type,
                "price": r.price,
                "seats_available": r.seats_available,
                "floor": r.floor,
                "has_attached_bathroom": r.has_attached_bathroom,
                "furniture": r.furniture,
                "images": r.images,
                "description": r.description
            } for r in h.rooms] if h.rooms else [],
            "amenities": [a.amenity for a in h.amenities] if h.amenities else []
        }
        result.append(h_dict)
    return result
