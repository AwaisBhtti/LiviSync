import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Student, Owner, Hostel, PhoneViewLog, MatchRequest, Preferences
from ..schemas import StudentOut, StudentUpdate
from ..auth import get_current_user
from pydantic import BaseModel
from typing import List

router = APIRouter(
    prefix="/students",
    tags=["Students"]
)

def require_student(current_user = Depends(get_current_user)):
    if not isinstance(current_user, Student):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student privileges required"
        )
    return current_user

class MatchRequestCreate(BaseModel):
    receiver_id: uuid.UUID
    message: str

class MatchStatusUpdate(BaseModel):
    status: str

@router.get("/roommates", response_model=List[StudentOut])
def get_roommates(db: Session = Depends(get_db), current_user: Student = Depends(require_student)):
    return db.query(Student).filter(
        Student.status == "active",
        Student.id != current_user.id
    ).all()

@router.put("/profile")
def update_profile(profile_in: StudentUpdate, db: Session = Depends(get_db), current_user: Student = Depends(require_student)):
    current_user.name = profile_in.name
    current_user.age = profile_in.age
    current_user.gender = profile_in.gender
    current_user.bio = profile_in.bio
    current_user.budget = profile_in.budget
    current_user.location = profile_in.location
    current_user.occupation = profile_in.occupation
    current_user.institution = profile_in.institution
    current_user.company = profile_in.company
    current_user.hostel_id = profile_in.hostel_id

    # Update or create preferences
    if not current_user.preferences:
        prefs = Preferences(
            student_id=current_user.id,
            sleep_schedule=profile_in.sleep_schedule,
            cleanliness=profile_in.cleanliness,
            smoking=profile_in.smoking,
            pets=profile_in.pets,
            guest_tolerance=profile_in.guest_tolerance
        )
        db.add(prefs)
    else:
        current_user.preferences.sleep_schedule = profile_in.sleep_schedule
        current_user.preferences.cleanliness = profile_in.cleanliness
        current_user.preferences.smoking = profile_in.smoking
        current_user.preferences.pets = profile_in.pets
        current_user.preferences.guest_tolerance = profile_in.guest_tolerance

    db.commit()
    return {"message": "Profile updated successfully"}

@router.post("/view-phone/{hostel_id}")
def view_owner_phone(hostel_id: uuid.UUID, db: Session = Depends(get_db), current_user: Student = Depends(require_student)):
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
    owner = db.query(Owner).filter(Owner.id == hostel.owner_id).first()
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Owner profile not found"
        )

    # Log phone view click
    log = PhoneViewLog(student_id=current_user.id, hostel_id=hostel_id)
    db.add(log)
    db.commit()

    return {"phone": owner.phone or "Not provided"}

@router.get("/matches")
def get_my_matches(db: Session = Depends(get_db), current_user: Student = Depends(require_student)):
    return db.query(MatchRequest).filter(
        (MatchRequest.sender_id == current_user.id) | (MatchRequest.receiver_id == current_user.id)
    ).all()

@router.post("/matches")
def send_match_request(req_in: MatchRequestCreate, db: Session = Depends(get_db), current_user: Student = Depends(require_student)):
    receiver = db.query(Student).filter(Student.id == req_in.receiver_id).first()
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiver student not found"
        )
    
    # Check if request already exists
    existing = db.query(MatchRequest).filter(
        ((MatchRequest.sender_id == current_user.id) & (MatchRequest.receiver_id == req_in.receiver_id)) |
        ((MatchRequest.sender_id == req_in.receiver_id) & (MatchRequest.receiver_id == current_user.id))
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Match request already exists"
        )

    new_req = MatchRequest(
        sender_id=current_user.id,
        receiver_id=req_in.receiver_id,
        message=req_in.message
    )
    db.add(new_req)
    db.commit()
    return {"message": "Match request sent successfully"}

@router.put("/matches/{request_id}")
def respond_match_request(request_id: uuid.UUID, req_in: MatchStatusUpdate, db: Session = Depends(get_db), current_user: Student = Depends(require_student)):
    req = db.query(MatchRequest).filter(MatchRequest.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match request not found"
        )
    if req.receiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to respond to this request"
        )
    if req_in.status not in ["accepted", "declined"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status"
        )
    
    req.status = req_in.status
    db.commit()
    return {"message": f"Match request {req_in.status} successfully"}

@router.delete("/matches/{request_id}")
def cancel_match_request(request_id: uuid.UUID, db: Session = Depends(get_db), current_user: Student = Depends(require_student)):
    req = db.query(MatchRequest).filter(MatchRequest.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match request not found"
        )
    if req.sender_id != current_user.id and req.receiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete/cancel this request"
        )
    db.delete(req)
    db.commit()
    return {"message": "Match request cancelled/deleted successfully"}
