from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Profile, Preferences
from ..schemas import UserCreate, UserOut, Token, UserWithProfile
from ..auth import get_password_hash, verify_password, create_access_token, get_current_user
from pydantic import BaseModel, EmailStr
from typing import Optional, List

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create User
    hashed_pwd = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_pwd
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create profile with defaults
    db_profile = Profile(
        id=db_user.id,
        name=user_in.name,
        age=18,
        gender="male",
        photo="",
        bio="",
        budget=0,
        location="Unknown",
        role="student",
        status="active"
    )
    db.add(db_profile)

    # Create preferences with defaults
    db_prefs = Preferences(
        user_id=db_user.id,
        sleep_schedule="flexible",
        cleanliness="moderate",
        smoking="no",
        pets="no",
        guest_tolerance="weekends"
    )
    db.add(db_prefs)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token (store user id as string in the 'sub' claim)
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserWithProfile)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


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



from ..models import InviteToken

class OwnerRegisterRequest(BaseModel):
    token: str
    name: str
    password: str

@router.get("/verify-invite/{token}")
def verify_invite(token: str, db: Session = Depends(get_db)):
    invite = db.query(InviteToken).filter(InviteToken.token == token, InviteToken.is_used == False).first()
    if not invite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired invite token"
        )
    return {"email": invite.email}

@router.post("/register-owner")
def register_owner(req: OwnerRegisterRequest, db: Session = Depends(get_db)):
    # Verify token
    invite = db.query(InviteToken).filter(InviteToken.token == req.token, InviteToken.is_used == False).first()
    if not invite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired invite token"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == invite.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash password and create User
    hashed_pwd = get_password_hash(req.password)
    db_user = User(
        email=invite.email,
        hashed_password=hashed_pwd
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create profile with owner role and status suspended
    db_profile = Profile(
        id=db_user.id,
        name=req.name,
        age=18,
        gender="male",
        photo="",
        bio="",
        budget=0,
        location="Unknown",
        role="owner",
        status="suspended"  # Starts suspended pending admin activation
    )
    db.add(db_profile)

    # Create preferences with defaults
    db_prefs = Preferences(
        user_id=db_user.id,
        sleep_schedule="flexible",
        cleanliness="moderate",
        smoking="no",
        pets="no",
        guest_tolerance="weekends"
    )
    db.add(db_prefs)

    # Mark invite token as used
    invite.is_used = True
    
    db.commit()
    return {"message": "Owner registered successfully. Profile is pending admin activation."}


@router.get("/roommates", response_model=List[UserWithProfile])
def get_roommates(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from ..models import Profile
    # Fetch all users whose profile role is 'student' and status is 'active', excluding current user
    roommates = db.query(User).join(User.profile).filter(
        Profile.role == "student",
        Profile.status == "active",
        User.id != current_user.id
    ).all()
    return roommates


@router.get("/hostels")
def get_hostels(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from ..models import Hostel
    # Return verified hostels (and owned ones for owners)
    if current_user.profile and current_user.profile.role == "owner":
        return db.query(Hostel).filter((Hostel.is_verified == True) | (Hostel.owner_id == current_user.id)).all()
    elif current_user.profile and current_user.profile.role == "admin":
        return db.query(Hostel).all()
    else:
        return db.query(Hostel).filter(Hostel.is_verified == True).all()


@router.get("/matches")
def get_my_matches(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from ..models import MatchRequest
    return db.query(MatchRequest).filter(
        (MatchRequest.sender_id == current_user.id) | (MatchRequest.receiver_id == current_user.id)
    ).all()



