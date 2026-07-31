import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Student, Owner, Hostel, PhoneViewLog, MatchRequest, Preferences, BlockedUser, Report
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

class BlockRequest(BaseModel):
    blocked_user_id: uuid.UUID

class ReportCreate(BaseModel):
    reported_id: uuid.UUID
    reason: str
    description: str

@router.get("/roommates", response_model=List[StudentOut])
def get_roommates(db: Session = Depends(get_db), current_user: Student = Depends(require_student)):
    # Exclude only people who blocked current_user (blockers) so they cannot see current_user
    blockers_ids_query = db.query(BlockedUser.user_id).filter(BlockedUser.blocked_user_id == current_user.id).all()
    
    exclude_ids = [current_user.id]
    exclude_ids.extend([b[0] for b in blockers_ids_query])
    
    return db.query(Student).filter(
        Student.status == "active",
        Student.is_profile_complete == True,
        ~Student.id.in_(exclude_ids)
    ).all()

@router.put("/profile")
def update_profile(profile_in: StudentUpdate, db: Session = Depends(get_db), current_user: Student = Depends(require_student)):
    # Validate that none of the required fields are null or empty
    if (
        not profile_in.name or not profile_in.name.strip() or
        profile_in.age is None or profile_in.age < 16 or profile_in.age > 100 or
        not profile_in.gender or profile_in.gender not in ['male', 'female', 'other'] or
        profile_in.budget is None or profile_in.budget <= 0 or
        not profile_in.location or not profile_in.location.strip() or
        not profile_in.sleep_schedule or
        not profile_in.cleanliness or
        not profile_in.smoking or
        not profile_in.pets or
        not profile_in.guest_tolerance or
        not profile_in.noise_tolerance
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All profile and preference fields must be completed with valid data."
        )

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
            guest_tolerance=profile_in.guest_tolerance,
            noise_tolerance=profile_in.noise_tolerance
        )
        db.add(prefs)
    else:
        current_user.preferences.sleep_schedule = profile_in.sleep_schedule
        current_user.preferences.cleanliness = profile_in.cleanliness
        current_user.preferences.smoking = profile_in.smoking
        current_user.preferences.pets = profile_in.pets
        current_user.preferences.guest_tolerance = profile_in.guest_tolerance
        current_user.preferences.noise_tolerance = profile_in.noise_tolerance

    current_user.is_profile_complete = True
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
    # Check if sender has completed their profile
    if not current_user.is_profile_complete:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must complete your profile (age, gender, location, budget, and lifestyle preferences) before connecting with other roommates."
        )

    # Check if a block exists between these two users
    block_exists = db.query(BlockedUser).filter(
        ((BlockedUser.user_id == current_user.id) & (BlockedUser.blocked_user_id == req_in.receiver_id)) |
        ((BlockedUser.user_id == req_in.receiver_id) & (BlockedUser.blocked_user_id == current_user.id))
    ).first()
    if block_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot send connection request. You have blocked this user or they have blocked you."
        )

    receiver = db.query(Student).filter(Student.id == req_in.receiver_id).first()
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiver student not found"
        )
    
    # Check if receiver profile is complete
    if not receiver.is_profile_complete:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The recipient has not completed their profile yet."
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
    # Check if responder has completed their profile
    if not current_user.is_profile_complete:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must complete your profile (age, gender, location, budget, and lifestyle preferences) before connecting with other roommates."
        )

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

@router.get("/blocks")
def get_blocked_users(db: Session = Depends(get_db), current_user: Student = Depends(require_student)):
    blocks = db.query(BlockedUser).filter(BlockedUser.user_id == current_user.id).all()
    return [str(b.blocked_user_id) for b in blocks]

@router.post("/blocks")
def block_user(req: BlockRequest, db: Session = Depends(get_db), current_user: Student = Depends(require_student)):
    if req.blocked_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot block yourself")
    
    # Check if already blocked
    existing = db.query(BlockedUser).filter(
        BlockedUser.user_id == current_user.id,
        BlockedUser.blocked_user_id == req.blocked_user_id
    ).first()
    if existing:
        return {"message": "User is already blocked"}
    
    new_block = BlockedUser(user_id=current_user.id, blocked_user_id=req.blocked_user_id)
    db.add(new_block)
    
    # Delete any existing match requests between them
    db.query(MatchRequest).filter(
        ((MatchRequest.sender_id == current_user.id) & (MatchRequest.receiver_id == req.blocked_user_id)) |
        ((MatchRequest.sender_id == req.blocked_user_id) & (MatchRequest.receiver_id == current_user.id))
    ).delete()
    
    db.commit()
    return {"message": "User blocked successfully"}

@router.delete("/blocks/{blocked_user_id}")
def unblock_user(blocked_user_id: uuid.UUID, db: Session = Depends(get_db), current_user: Student = Depends(require_student)):
    block = db.query(BlockedUser).filter(
        BlockedUser.user_id == current_user.id,
        BlockedUser.blocked_user_id == blocked_user_id
    ).first()
    if not block:
        raise HTTPException(status_code=404, detail="Block record not found")
    
    db.delete(block)
    db.commit()
    return {"message": "User unblocked successfully"}

@router.post("/reports")
def submit_report(req: ReportCreate, db: Session = Depends(get_db), current_user: Student = Depends(require_student)):
    reported_user = db.query(Student).filter(Student.id == req.reported_id).first()
    if not reported_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reported user not found")
        
    new_report = Report(
        reporter_id=current_user.id,
        reported_id=req.reported_id,
        reason=req.reason,
        description=req.description,
        status="pending"
    )
    db.add(new_report)
    db.commit()
    return {"message": "Report submitted successfully"}
