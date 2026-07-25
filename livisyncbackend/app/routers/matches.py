from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, MatchRequest
from ..auth import get_current_user
from typing import List

router = APIRouter(
    prefix="/matches",
    tags=["Matches"]
)

@router.get("")
def get_my_matches(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(MatchRequest).filter(
        (MatchRequest.sender_id == current_user.id) | (MatchRequest.receiver_id == current_user.id)
    ).all()
