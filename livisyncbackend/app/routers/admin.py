import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Admin, Student, Owner, Hostel, InviteToken, Report, MatchRequest
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
    status: str

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


def require_admin(current_user = Depends(get_current_user)):
    if not isinstance(current_user, Admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

@router.post("/invite")
def create_invite(req: InviteRequest, db: Session = Depends(get_db), admin: Admin = Depends(require_admin)):
    token = str(uuid.uuid4())
    db_invite = InviteToken(
        token=token,
        email=req.email,
        is_used=False
    )
    db.add(db_invite)
    db.commit()
    db.refresh(db_invite)
    
    invite_link = f"http://localhost:5173/register-owner/{token}"
    send_invitation_email(req.email, invite_link)
    
    return {
        "email": req.email,
        "token": token,
        "invite_link": invite_link
    }

@router.get("/users")
def get_all_users(db: Session = Depends(get_db), admin: Admin = Depends(require_admin)):
    students = db.query(Student).all()
    owners = db.query(Owner).all()
    results = []
    
    for s in students:
        results.append({
            "id": s.id,
            "email": s.email,
            "role": "student",
            "status": s.status,
            "name": s.name,
            "age": s.age,
            "gender": s.gender,
            "photo": s.photo or "",
            "bio": s.bio or "",
            "budget": s.budget,
            "location": s.location,
            "created_at": s.created_at,
            "occupation": s.occupation,
            "institution": s.institution,
            "company": s.company,
            "hostel_id": s.hostel_id
        })
        
    for o in owners:
        results.append({
            "id": o.id,
            "email": o.email,
            "role": "owner",
            "status": o.status,
            "name": o.name,
            "phone": o.phone,
            "age": 18,
            "gender": "male",
            "photo": "",
            "bio": "",
            "budget": 0,
            "location": "",
            "created_at": o.created_at,
            "occupation": None,
            "institution": None,
            "company": None,
            "hostel_id": None
        })
        
    return results

@router.delete("/users/{role}/{user_id}")
def delete_user(role: str, user_id: uuid.UUID, db: Session = Depends(get_db), admin: Admin = Depends(require_admin)):
    if role == "student":
        user = db.query(Student).filter(Student.id == user_id).first()
    elif role == "owner":
        user = db.query(Owner).filter(Owner.id == user_id).first()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )
        
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully."}

@router.put("/users/{role}/{user_id}/status")
def toggle_user_status(role: str, user_id: uuid.UUID, req: StatusToggleRequest, db: Session = Depends(get_db), admin: Admin = Depends(require_admin)):
    if role == "student":
        user = db.query(Student).filter(Student.id == user_id).first()
    elif role == "owner":
        user = db.query(Owner).filter(Owner.id == user_id).first()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )
        
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if req.status not in ["active", "suspended"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be 'active' or 'suspended'"
        )
        
    user.status = req.status
    db.commit()
    return {"message": f"User status updated to {req.status} successfully."}

@router.get("/hostels", response_model=List[HostelOut])
def get_all_hostels(db: Session = Depends(get_db), admin: Admin = Depends(require_admin)):
    return db.query(Hostel).all()

@router.put("/hostels/{hostel_id}/verify")
def verify_hostel(hostel_id: uuid.UUID, db: Session = Depends(get_db), admin: Admin = Depends(require_admin)):
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
def get_all_reports(db: Session = Depends(get_db), admin: Admin = Depends(require_admin)):
    return db.query(Report).all()

@router.put("/reports/{report_id}/resolve")
def resolve_report(report_id: uuid.UUID, db: Session = Depends(get_db), admin: Admin = Depends(require_admin)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    report.status = "resolved"
    db.commit()
    return {"message": "Report resolved successfully."}

@router.get("/invitations")
def get_all_invitations(db: Session = Depends(get_db), admin: Admin = Depends(require_admin)):
    return db.query(InviteToken).order_by(InviteToken.created_at.desc()).all()

@router.put("/invitations/{token}/revoke")
def revoke_invitation(token: str, db: Session = Depends(get_db), admin: Admin = Depends(require_admin)):
    invite = db.query(InviteToken).filter(InviteToken.token == token).first()
    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )
    invite.is_used = True
    db.commit()
    return {"message": "Invitation revoked successfully."}
