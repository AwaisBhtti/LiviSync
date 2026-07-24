import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Profile, Hostel, InviteToken
from ..auth import get_current_user
from pydantic import BaseModel, EmailStr

router = APIRouter(
    prefix="/admin",
    tags=["Admin Controls"]
)

class InviteRequest(BaseModel):
    email: EmailStr

class StatusToggleRequest(BaseModel):
    status: str  # 'active' or 'suspended'

def require_admin(current_user: User = Depends(get_current_user)):
    if not current_user.profile or current_user.profile.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

@router.post("/invite")
def create_invite(req: InviteRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    # Generate unique token
    token = str(uuid.uuid4())
    
    # Store token in database
    db_invite = InviteToken(
        token=token,
        email=req.email,
        is_used=False
    )
    db.add(db_invite)
    db.commit()
    db.refresh(db_invite)
    
    return {
        "email": req.email,
        "token": token,
        "invite_link": f"http://localhost:5173/register-owner/{token}"
    }

@router.put("/users/{user_id}/status")
def toggle_user_status(user_id: uuid.UUID, req: StatusToggleRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    if req.status not in ["active", "suspended"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be 'active' or 'suspended'"
        )
        
    profile.status = req.status
    db.commit()
    return {"message": f"User status updated to {req.status} successfully."}

@router.put("/hostels/{hostel_id}/verify")
def verify_hostel(hostel_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    hostel = db.query(Hostel).filter(Hostel.id == hostel_id).first()
    if not hostel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hostel not found"
        )
        
    hostel.is_verified = True
    db.commit()
    return {"message": "Hostel verified successfully."}
