from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[UUID] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=1)

class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

# Profile Schemas
class ProfileOut(BaseModel):
    id: UUID
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

class UserWithProfile(BaseModel):
    id: UUID
    email: EmailStr
    profile: Optional[ProfileOut] = None

    class Config:
        from_attributes = True
