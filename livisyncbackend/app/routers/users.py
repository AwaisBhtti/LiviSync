from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Profile, Preferences
from ..schemas import UserWithProfile
from ..auth import get_current_user
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

class ProfileUpdate(BaseModel):
    name: str
    age: int
    gender: str
    bio: Optional[str] = None
    budget: int
    location: str
    occupation: Optional[str] = None
    institution: Optional[str] = None
    company: Optional[str] = None
    sleep_schedule: str
    cleanliness: str
    smoking: str
    pets: str
    guest_tolerance: str
    hostel_id: Optional[UUID] = None

@router.put("/profile")
def update_profile(profile_in: ProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Update or create Profile
    profile = current_user.profile
    if not profile:
        profile = Profile(id=current_user.id)
        db.add(profile)
        
    profile.name = profile_in.name
    profile.age = profile_in.age
    profile.gender = profile_in.gender
    profile.bio = profile_in.bio
    profile.budget = profile_in.budget
    profile.location = profile_in.location
    profile.occupation = profile_in.occupation
    profile.institution = profile_in.institution
    profile.company = profile_in.company
    profile.hostel_id = profile_in.hostel_id
    
    # 2. Update or create Preferences
    prefs = current_user.preferences
    if not prefs:
        prefs = Preferences(user_id=current_user.id)
        db.add(prefs)
        
    prefs.sleep_schedule = profile_in.sleep_schedule
    prefs.cleanliness = profile_in.cleanliness
    prefs.smoking = profile_in.smoking
    prefs.pets = profile_in.pets
    prefs.guest_tolerance = profile_in.guest_tolerance
    
    db.commit()
    return {"message": "Profile updated successfully"}

@router.get("/roommates", response_model=List[UserWithProfile])
def get_roommates(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Fetch all users whose profile role is 'student' and status is 'active', excluding current user
    roommates = db.query(User).join(User.profile).filter(
        Profile.role == "student",
        Profile.status == "active",
        User.id != current_user.id
    ).all()
    return roommates
