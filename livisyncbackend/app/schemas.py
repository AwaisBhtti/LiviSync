from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[UUID] = None
    role: Optional[str] = None

# Preferences Schema
class PreferencesOut(BaseModel):
    sleep_schedule: Optional[str] = None
    cleanliness: Optional[str] = None
    smoking: Optional[str] = None
    pets: Optional[str] = None
    guest_tolerance: Optional[str] = None
    noise_tolerance: Optional[str] = None

    class Config:
        from_attributes = True

# Student Schemas
class StudentCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=1)

class StudentOut(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    photo: Optional[str] = None
    bio: Optional[str] = None
    budget: Optional[int] = None
    location: Optional[str] = None
    status: str
    occupation: Optional[str] = None
    institution: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    hostel_id: Optional[UUID] = None
    created_at: datetime
    is_email_verified: bool = False
    is_profile_complete: bool = False
    preferences: Optional[PreferencesOut] = None

    class Config:
        from_attributes = True

class StudentUpdate(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    bio: Optional[str] = None
    budget: Optional[int] = None
    location: Optional[str] = None
    occupation: Optional[str] = None
    institution: Optional[str] = None
    company: Optional[str] = None
    sleep_schedule: Optional[str] = None
    cleanliness: Optional[str] = None
    smoking: Optional[str] = None
    pets: Optional[str] = None
    guest_tolerance: Optional[str] = None
    noise_tolerance: Optional[str] = None
    hostel_id: Optional[UUID] = None
    photo: Optional[str] = None

# Owner Schemas
class OwnerRegister(BaseModel):
    token: str
    name: str
    password: str = Field(..., min_length=6)
    phone: str

class OwnerOut(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    phone: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Admin Schemas
class AdminOut(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    created_at: datetime

    class Config:
        from_attributes = True
