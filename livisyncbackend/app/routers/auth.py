from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Profile, Preferences
from ..schemas import UserCreate, UserOut, Token, UserWithProfile
from ..auth import get_password_hash, verify_password, create_access_token, get_current_user
from pydantic import BaseModel, EmailStr

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
