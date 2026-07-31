import uuid
import boto3
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Owner, Hostel, HostelAmenity, HostelRoom
from ..auth import get_current_user
from ..config import settings
from pydantic import BaseModel
from typing import List, Optional

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

class RoomCreate(BaseModel):
    sharing_type: str
    price: int
    seats_available: int
    floor: str
    has_attached_bathroom: bool
    furniture: str
    images: List[str]
    description: Optional[str] = None

class HostelCreate(BaseModel):
    name: str
    location: str
    description: str
    photo: str
    photos: Optional[List[str]] = None
    electricity_bill_included: bool
    amenities: List[str]
    hostel_type: str
    has_curfew: bool
    curfew_time: Optional[str] = None

@router.get("/hostels")
def get_my_hostels(db: Session = Depends(get_db), current_user: Owner = Depends(require_owner)):
    return db.query(Hostel).filter(Hostel.owner_id == current_user.id).all()

@router.post("/hostels", status_code=status.HTTP_201_CREATED)
def create_hostel(hostel_in: HostelCreate, db: Session = Depends(get_db), current_user: Owner = Depends(require_owner)):
    new_hostel = Hostel(
        name=hostel_in.name,
        location=hostel_in.location,
        description=hostel_in.description,
        photo=hostel_in.photo,
        photos=hostel_in.photos,
        electricity_bill_included=hostel_in.electricity_bill_included,
        hostel_type=hostel_in.hostel_type,
        has_curfew=hostel_in.has_curfew,
        curfew_time=hostel_in.curfew_time,
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

    db.commit()
    db.refresh(new_hostel)
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
    hostel.description = hostel_in.description
    hostel.photo = hostel_in.photo
    hostel.photos = hostel_in.photos
    hostel.electricity_bill_included = hostel_in.electricity_bill_included
    hostel.hostel_type = hostel_in.hostel_type
    hostel.has_curfew = hostel_in.has_curfew
    hostel.curfew_time = hostel_in.curfew_time
    
    # Re-add amenities
    db.query(HostelAmenity).filter(HostelAmenity.hostel_id == hostel_id).delete()
    for amenity in hostel_in.amenities:
        db_amenity = HostelAmenity(hostel_id=hostel_id, amenity=amenity)
        db.add(db_amenity)

    db.commit()
    db.refresh(hostel)
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

@router.post("/hostels/{hostel_id}/rooms", status_code=status.HTTP_201_CREATED)
def create_room(hostel_id: uuid.UUID, room_in: RoomCreate, db: Session = Depends(get_db), current_user: Owner = Depends(require_owner)):
    hostel = db.query(Hostel).filter(Hostel.id == hostel_id, Hostel.owner_id == current_user.id).first()
    if not hostel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hostel listing not found or not owned by you"
        )
    
    # Enforce uploading at least 2 images
    if len(room_in.images) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must upload at least 2 pictures for the room (including room area and bathroom)."
        )

    # Validate sharing type and dynamic seats available capacity limit
    capacity_map = {
        "single": 1,
        "double": 2,
        "triple": 3,
        "quad": 4,
        "penta": 5
    }
    
    if room_in.sharing_type not in capacity_map:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid sharing type: {room_in.sharing_type}"
        )
        
    max_cap = capacity_map[room_in.sharing_type]
    if room_in.seats_available < 0 or room_in.seats_available > max_cap:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Seats available cannot exceed {max_cap} for a {room_in.sharing_type}-sharing room."
        )

    if room_in.furniture not in ["bed", "mattress", "nothing"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Furniture must be either 'bed', 'mattress', or 'nothing'."
        )
        
    db_room = HostelRoom(
        hostel_id=hostel_id,
        sharing_type=room_in.sharing_type,
        price=room_in.price,
        seats_available=room_in.seats_available,
        floor=room_in.floor,
        has_attached_bathroom=room_in.has_attached_bathroom,
        furniture=room_in.furniture,
        images=room_in.images,
        description=room_in.description
    )
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

@router.get("/hostels/{hostel_id}/rooms")
def get_hostel_rooms(hostel_id: uuid.UUID, db: Session = Depends(get_db), current_user: Owner = Depends(require_owner)):
    hostel = db.query(Hostel).filter(Hostel.id == hostel_id, Hostel.owner_id == current_user.id).first()
    if not hostel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hostel listing not found or not owned by you"
        )
    return db.query(HostelRoom).filter(HostelRoom.hostel_id == hostel_id).all()

@router.delete("/rooms/{room_id}")
def delete_room(room_id: uuid.UUID, db: Session = Depends(get_db), current_user: Owner = Depends(require_owner)):
    room = db.query(HostelRoom).join(Hostel).filter(HostelRoom.id == room_id, Hostel.owner_id == current_user.id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found or not owned by you"
        )
    db.delete(room)
    db.commit()
    return {"message": "Room deleted successfully"}

@router.put("/rooms/{room_id}")
def update_room(room_id: uuid.UUID, room_in: RoomCreate, db: Session = Depends(get_db), current_user: Owner = Depends(require_owner)):
    room = db.query(HostelRoom).join(Hostel).filter(HostelRoom.id == room_id, Hostel.owner_id == current_user.id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found or not owned by you"
        )
    
    # Enforce uploading at least 2 images
    if len(room_in.images) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must upload at least 2 pictures for the room (including room area and bathroom)."
        )

    capacity_map = {
        "single": 1,
        "double": 2,
        "triple": 3,
        "quad": 4,
        "penta": 5
    }
    
    if room_in.sharing_type not in capacity_map:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid sharing type: {room_in.sharing_type}"
        )
        
    max_cap = capacity_map[room_in.sharing_type]
    if room_in.seats_available < 0 or room_in.seats_available > max_cap:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Seats available cannot exceed {max_cap} for a {room_in.sharing_type}-sharing room."
        )

    if room_in.furniture not in ["bed", "mattress", "nothing"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Furniture must be either 'bed', 'mattress', or 'nothing'."
        )

    room.sharing_type = room_in.sharing_type
    room.price = room_in.price
    room.seats_available = room_in.seats_available
    room.floor = room_in.floor
    room.has_attached_bathroom = room_in.has_attached_bathroom
    room.furniture = room_in.furniture
    room.images = room_in.images
    room.description = room_in.description

    db.commit()
    db.refresh(room)
    return room

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), current_user: Owner = Depends(require_owner)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be an image."
        )

    r2_endpoint = f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{file_ext}"

    try:
        s3 = boto3.client(
            service_name="s3",
            endpoint_url=r2_endpoint,
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            region_name="auto"
        )

        file_content = await file.read()

        s3.put_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=unique_filename,
            Body=file_content,
            ContentType=file.content_type
        )

        base_domain = settings.R2_PUBLIC_CUSTOM_DOMAIN.rstrip("/")
        public_url = f"{base_domain}/{unique_filename}"

        return {"url": public_url}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image to Cloudflare R2: {str(e)}"
        )
