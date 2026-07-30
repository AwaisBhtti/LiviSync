from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Student, Owner, Admin, Preferences, InviteToken
from ..schemas import StudentCreate, StudentOut, Token, OwnerRegister, OwnerOut, AdminOut
from ..auth import get_password_hash, verify_password, create_access_token, get_current_user, create_supabase_token
from pydantic import BaseModel, EmailStr
from typing import Optional, Union

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def register_student(student_in: StudentCreate, db: Session = Depends(get_db)):
    # Check if email exists in any table to prevent collision
    if db.query(Student).filter(Student.email == student_in.email).first() or \
       db.query(Owner).filter(Owner.email == student_in.email).first() or \
       db.query(Admin).filter(Admin.email == student_in.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_pwd = get_password_hash(student_in.password)
    db_student = Student(
        email=student_in.email,
        hashed_password=hashed_pwd,
        name=student_in.name,
        age=18,
        gender="male",
        photo="",
        bio="",
        budget=0,
        location="Unknown",
        status="active"
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)

    # Create preferences with defaults
    db_prefs = Preferences(
        student_id=db_student.id,
        sleep_schedule="flexible",
        cleanliness="moderate",
        smoking="no",
        pets="no",
        guest_tolerance="weekends",
        noise_tolerance="moderate"
    )
    db.add(db_prefs)
    db.commit()
    db.refresh(db_student)
    return db_student

@router.post("/login", response_model=Token)
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    # 1. Search in Student table
    student = db.query(Student).filter(Student.email == login_in.email).first()
    if student and verify_password(login_in.password, student.hashed_password):
        if student.status == "suspended":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been suspended by an administrator."
            )
        access_token = create_access_token(data={"sub": str(student.id), "role": "student"})
        return {"access_token": access_token, "token_type": "bearer"}

    # 2. Search in Owner table
    owner = db.query(Owner).filter(Owner.email == login_in.email).first()
    if owner and verify_password(login_in.password, owner.hashed_password):
        if owner.status == "suspended":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your profile is pending admin activation or has been suspended."
            )
        access_token = create_access_token(data={"sub": str(owner.id), "role": "owner"})
        return {"access_token": access_token, "token_type": "bearer"}

    # 3. Search in Admin table
    admin_user = db.query(Admin).filter(Admin.email == login_in.email).first()
    if admin_user and verify_password(login_in.password, admin_user.hashed_password):
        access_token = create_access_token(data={"sub": str(admin_user.id), "role": "admin"})
        return {"access_token": access_token, "token_type": "bearer"}

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

@router.get("/me")
def get_me(current_user: Union[Student, Owner, Admin] = Depends(get_current_user)):
    # Return formatted profile based on type
    if isinstance(current_user, Student):
        sb_token = create_supabase_token(str(current_user.id), current_user.email)
        return {
            "id": current_user.id,
            "email": current_user.email,
            "supabase_token": sb_token,
            "profile": {
                "id": current_user.id,
                "name": current_user.name,
                "age": current_user.age,
                "gender": current_user.gender,
                "photo": current_user.photo,
                "bio": current_user.bio,
                "budget": current_user.budget,
                "location": current_user.location,
                "role": "student",
                "status": current_user.status,
                "occupation": current_user.occupation,
                "institution": current_user.institution,
                "company": current_user.company,
                "phone": current_user.phone,
                "hostel_id": current_user.hostel_id
            },
            "preferences": {
                "sleep_schedule": current_user.preferences.sleep_schedule if current_user.preferences else "flexible",
                "cleanliness": current_user.preferences.cleanliness if current_user.preferences else "moderate",
                "smoking": current_user.preferences.smoking if current_user.preferences else "no",
                "pets": current_user.preferences.pets if current_user.preferences else "no",
                "guest_tolerance": current_user.preferences.guest_tolerance if current_user.preferences else "weekends",
                "noise_tolerance": current_user.preferences.noise_tolerance if current_user.preferences else "moderate"
            }
        }
    elif isinstance(current_user, Owner):
        return {
            "id": current_user.id,
            "email": current_user.email,
            "profile": {
                "id": current_user.id,
                "name": current_user.name,
                "role": "owner",
                "status": current_user.status,
                "phone": current_user.phone
            }
        }
    elif isinstance(current_user, Admin):
        return {
            "id": current_user.id,
            "email": current_user.email,
            "profile": {
                "id": current_user.id,
                "name": current_user.name,
                "role": "admin",
                "status": "active"
            }
        }

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
def register_owner(req: OwnerRegister, db: Session = Depends(get_db)):
    invite = db.query(InviteToken).filter(InviteToken.token == req.token, InviteToken.is_used == False).first()
    if not invite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired invite token"
        )
    
    # Check if email is already registered in any table
    if db.query(Student).filter(Student.email == invite.email).first() or \
       db.query(Owner).filter(Owner.email == invite.email).first() or \
       db.query(Admin).filter(Admin.email == invite.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_pwd = get_password_hash(req.password)
    db_owner = Owner(
        email=invite.email,
        hashed_password=hashed_pwd,
        name=req.name,
        phone=req.phone,
        status="unapproved"  # Starts unapproved pending admin activation
    )
    db.add(db_owner)
    invite.is_used = True
    
    db.commit()
    return {"message": "Owner registered successfully. Profile is pending admin activation."}

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

@router.put("/change-password")
def change_password(req: ChangePasswordRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Verify old password
    if not verify_password(req.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password"
        )
    
    current_user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
