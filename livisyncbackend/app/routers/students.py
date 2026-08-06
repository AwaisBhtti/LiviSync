import uuid
import boto3
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Student, Owner, Hostel, PhoneViewLog, MatchRequest, Preferences, BlockedUser, Report, MessageReport
from ..schemas import StudentOut, StudentUpdate
from ..auth import get_current_user
from ..config import settings
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

class MessageReportCreate(BaseModel):
    reported_user_id: uuid.UUID
    message_id: str
    message_text: str
    reason: str

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
    # Validate provided fields
    if profile_in.name is not None and not profile_in.name.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Name cannot be empty.")
    if profile_in.age is not None and (profile_in.age < 16 or profile_in.age > 100):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Age must be between 16 and 100.")
    if profile_in.gender is not None and profile_in.gender not in ['male', 'female', 'other']:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid gender value.")
    if profile_in.budget is not None and profile_in.budget < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Budget cannot be negative.")

    # Apply updates for provided basic info
    if profile_in.name is not None:
        current_user.name = profile_in.name
    if profile_in.age is not None:
        current_user.age = profile_in.age
    if profile_in.gender is not None:
        current_user.gender = profile_in.gender
    if profile_in.bio is not None:
        current_user.bio = profile_in.bio
    if profile_in.budget is not None:
        current_user.budget = profile_in.budget
    if profile_in.location is not None:
        current_user.location = profile_in.location
    if profile_in.occupation is not None:
        current_user.occupation = profile_in.occupation
    if profile_in.institution is not None:
        current_user.institution = profile_in.institution
    if profile_in.company is not None:
        current_user.company = profile_in.company
    if profile_in.hostel_id is not None:
        current_user.hostel_id = profile_in.hostel_id
    if profile_in.photo is not None:
        current_user.photo = profile_in.photo

    # Update or create preferences
    pref_fields = [
        profile_in.sleep_schedule,
        profile_in.cleanliness,
        profile_in.smoking,
        profile_in.pets,
        profile_in.guest_tolerance,
        profile_in.noise_tolerance
    ]
    if any(f is not None for f in pref_fields):
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
            if profile_in.sleep_schedule is not None:
                current_user.preferences.sleep_schedule = profile_in.sleep_schedule
            if profile_in.cleanliness is not None:
                current_user.preferences.cleanliness = profile_in.cleanliness
            if profile_in.smoking is not None:
                current_user.preferences.smoking = profile_in.smoking
            if profile_in.pets is not None:
                current_user.preferences.pets = profile_in.pets
            if profile_in.guest_tolerance is not None:
                current_user.preferences.guest_tolerance = profile_in.guest_tolerance
            if profile_in.noise_tolerance is not None:
                current_user.preferences.noise_tolerance = profile_in.noise_tolerance

    # Recalculate is_profile_complete based on all required profile and preference fields
    has_basic = (
        bool(current_user.name and current_user.name.strip()) and
        (current_user.age is not None and current_user.age >= 16 and current_user.age <= 100) and
        bool(current_user.gender and current_user.gender in ['male', 'female', 'other']) and
        (current_user.budget is not None and current_user.budget > 0) and
        bool(current_user.location and current_user.location.strip())
    )
    has_prefs = (
        current_user.preferences is not None and
        bool(current_user.preferences.sleep_schedule) and
        bool(current_user.preferences.cleanliness) and
        bool(current_user.preferences.smoking) and
        bool(current_user.preferences.pets) and
        bool(current_user.preferences.guest_tolerance) and
        bool(current_user.preferences.noise_tolerance)
    )
    current_user.is_profile_complete = has_basic and has_prefs

    db.commit()
    return {"message": "Profile updated successfully", "is_profile_complete": current_user.is_profile_complete}

@router.post("/upload-avatar")
async def upload_avatar(file: UploadFile = File(...), current_user: Student = Depends(require_student)):
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
            detail=f"Failed to upload avatar to Cloudflare R2: {str(e)}"
        )

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

@router.post("/message-reports")
def submit_message_report(req: MessageReportCreate, db: Session = Depends(get_db), current_user: Student = Depends(require_student)):
    if req.reported_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot report your own message")
    new_report = MessageReport(
        reporter_id=current_user.id,
        reported_user_id=req.reported_user_id,
        message_id=req.message_id,
        message_text=req.message_text,
        reason=req.reason,
        status="pending"
    )
    db.add(new_report)
    db.commit()
    return {"message": "Message report submitted successfully"}

@router.post("/deactivate")
def deactivate_student_account(db: Session = Depends(get_db), current_user: Student = Depends(require_student)):
    current_user.status = "inactive"
    db.commit()
    return {"message": "Account deactivated successfully."}

@router.delete("/account")
def delete_student_account(db: Session = Depends(get_db), current_user: Student = Depends(require_student)):
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted permanently."}
