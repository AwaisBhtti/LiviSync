import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..models import User, Profile, Hostel, InviteToken, Report, MatchRequest
from ..auth import get_current_user
from ..email_utils import send_invitation_email
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

router = APIRouter(
    prefix="/admin",
    tags=["Admin Controls"]
)

class InviteRequest(BaseModel):
    email: EmailStr

class StatusToggleRequest(BaseModel):
    status: str  # 'active' or 'suspended'

# Pydantic schemas for response serialization
class UserPreferencesOut(BaseModel):
    sleep_schedule: str
    cleanliness: str
    smoking: str
    pets: str
    guest_tolerance: str

    class Config:
        from_attributes = True

class ProfileOut(BaseModel):
    name: str
    age: int
    gender: str
    photo: Optional[str] = None
    bio: Optional[str] = None
    budget: int
    location: str
    role: str
    status: str

    class Config:
        from_attributes = True

class UserAdminOut(BaseModel):
    id: uuid.UUID
    email: str
    role: str
    status: str
    name: str
    age: int
    gender: str
    photo: Optional[str] = None
    bio: Optional[str] = None
    budget: int
    location: str
    created_at: datetime
    occupation: Optional[str] = None
    institution: Optional[str] = None
    company: Optional[str] = None

    class Config:
        from_attributes = True

class ReportOut(BaseModel):
    id: uuid.UUID
    reporter_id: uuid.UUID
    reported_id: uuid.UUID
    reason: str
    description: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class HostelOut(BaseModel):
    id: uuid.UUID
    name: str
    location: str
    price: int
    description: Optional[str] = None
    images: Optional[List[str]] = None
    owner_id: Optional[uuid.UUID] = None
    is_verified: bool

    class Config:
        from_attributes = True

class MatchRequestOut(BaseModel):
    id: uuid.UUID
    sender_id: uuid.UUID
    receiver_id: uuid.UUID
    status: str
    message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


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
    
    invite_link = f"http://localhost:5173/register-owner/{token}"
    
    # Send email asynchronously via background thread
    send_invitation_email(req.email, invite_link)
    
    return {
        "email": req.email,
        "token": token,
        "invite_link": invite_link
    }

@router.get("/users", response_model=List[UserAdminOut])
def get_all_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    # Join users with profiles to return flattened data
    users = db.query(User).options(joinedload(User.profile)).all()
    results = []
    for u in users:
        # Default fallback values if profile doesn't exist
        profile_name = u.profile.name if u.profile else "New User"
        profile_age = u.profile.age if u.profile else 18
        profile_gender = u.profile.gender if u.profile else "male"
        profile_photo = u.profile.photo if u.profile else ""
        profile_bio = u.profile.bio if u.profile else ""
        profile_budget = u.profile.budget if u.profile else 0
        profile_location = u.profile.location if u.profile else ""
        profile_role = u.profile.role if u.profile else "student"
        profile_status = u.profile.status if u.profile else "active"
        profile_occupation = u.profile.occupation if u.profile else None
        profile_institution = u.profile.institution if u.profile else None
        profile_company = u.profile.company if u.profile else None

        results.append({
            "id": u.id,
            "email": u.email,
            "role": profile_role,
            "status": profile_status,
            "name": profile_name,
            "age": profile_age,
            "gender": profile_gender,
            "photo": profile_photo,
            "bio": profile_bio,
            "budget": profile_budget,
            "location": profile_location,
            "created_at": u.created_at,
            "occupation": profile_occupation,
            "institution": profile_institution,
            "company": profile_company
        })
    return results

@router.delete("/users/{user_id}")
def delete_user(user_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully."}

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

@router.get("/hostels", response_model=List[HostelOut])
def get_all_hostels(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(Hostel).all()

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

@router.get("/reports", response_model=List[ReportOut])
def get_all_reports(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(Report).all()

@router.put("/reports/{report_id}/resolve")
def resolve_report(report_id: uuid.UUID, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    report.status = "resolved"
    db.commit()
    return {"message": "Report resolved successfully."}

@router.get("/matches", response_model=List[MatchRequestOut])
def get_all_matches(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(MatchRequest).all()
