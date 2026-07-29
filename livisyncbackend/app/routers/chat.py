import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..database import get_db
from ..models import Student, MatchRequest, Message
from ..auth import get_current_user
from pydantic import BaseModel

router = APIRouter(
    prefix="/chat",
    tags=["Chat & Messaging"]
)

def require_student(current_user = Depends(get_current_user)):
    if not isinstance(current_user, Student):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student privileges required for chat operations"
        )
    return current_user

class SendMessageRequest(BaseModel):
    receiver_id: uuid.UUID
    text: str

@router.post("/messages")
def send_message(req: SendMessageRequest, db: Session = Depends(get_db), current_user: Student = Depends(require_student)):
    if req.receiver_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send message to yourself")
        
    # Validate connection status (must be accepted match roommates)
    connection = db.query(MatchRequest).filter(
        MatchRequest.status == "accepted",
        or_(
            ((MatchRequest.sender_id == current_user.id) & (MatchRequest.receiver_id == req.receiver_id)),
            ((MatchRequest.sender_id == req.receiver_id) & (MatchRequest.receiver_id == current_user.id))
        )
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only chat with accepted roommate connections"
        )

    new_msg = Message(
        sender_id=current_user.id,
        receiver_id=req.receiver_id,
        text=req.text
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)

    return {
        "id": str(new_msg.id),
        "senderId": str(new_msg.sender_id),
        "text": new_msg.text,
        "timestamp": new_msg.created_at.isoformat(),
        "read": new_msg.is_read
    }

@router.get("/history/{peer_id}")
def get_chat_history(peer_id: uuid.UUID, db: Session = Depends(get_db), current_user: Student = Depends(require_student)):
    # Validate connection status
    connection = db.query(MatchRequest).filter(
        MatchRequest.status == "accepted",
        or_(
            ((MatchRequest.sender_id == current_user.id) & (MatchRequest.receiver_id == peer_id)),
            ((MatchRequest.sender_id == peer_id) & (MatchRequest.receiver_id == current_user.id))
        )
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view chat history with accepted connections"
        )

    messages = db.query(Message).filter(
        or_(
            ((Message.sender_id == current_user.id) & (Message.receiver_id == peer_id)),
            ((Message.sender_id == peer_id) & (Message.receiver_id == current_user.id))
        )
    ).order_by(Message.created_at.asc()).all()

    return [
        {
            "id": str(m.id),
            "senderId": str(m.sender_id),
            "text": m.text,
            "timestamp": m.created_at.isoformat(),
            "read": m.is_read
        }
        for m in messages
    ]
