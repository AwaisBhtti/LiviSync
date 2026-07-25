import uuid
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Table, Text, ARRAY, CheckConstraint, UniqueConstraint, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    preferences = relationship("Preferences", back_populates="user", uselist=False, cascade="all, delete-orphan")
    bookings = relationship("HostelOccupancy", back_populates="user", cascade="all, delete-orphan")
    owned_hostels = relationship("Hostel", back_populates="owner")


class Profile(Base):
    __tablename__ = 'profiles'

    id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(10), nullable=False)
    photo = Column(Text)
    bio = Column(Text)
    budget = Column(Integer, nullable=False)
    location = Column(String(100), nullable=False)
    role = Column(String(10), nullable=False, default='student')
    status = Column(String(10), nullable=False, default='active')
    
    # New student or job fields
    occupation = Column(String(10), nullable=True)  # 'student' or 'job'
    institution = Column(String(255), nullable=True)
    company = Column(String(255), nullable=True)

    __table_args__ = (
        CheckConstraint("age >= 16 AND age <= 100", name="age_check"),
        CheckConstraint("gender IN ('male', 'female', 'other')", name="gender_check"),
        CheckConstraint("role IN ('student', 'admin', 'owner')", name="role_check"),
        CheckConstraint("status IN ('active', 'suspended')", name="status_check"),
        CheckConstraint("occupation IN ('student', 'job')", name="occupation_check"),
    )

    user = relationship("User", back_populates="profile")


class Preferences(Base):
    __tablename__ = 'preferences'

    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    sleep_schedule = Column(String(20), nullable=False)
    cleanliness = Column(String(20), nullable=False)
    smoking = Column(String(20), nullable=False)
    pets = Column(String(20), nullable=False)
    guest_tolerance = Column(String(20), nullable=False)

    __table_args__ = (
        CheckConstraint("sleep_schedule IN ('early-bird', 'night-owl', 'flexible')", name="sleep_schedule_check"),
        CheckConstraint("cleanliness IN ('meticulous', 'moderate', 'relaxed')", name="cleanliness_check"),
        CheckConstraint("smoking IN ('no', 'yes', 'outside-only')", name="smoking_check"),
        CheckConstraint("pets IN ('no', 'yes', 'likes-but-no-own')", name="pets_check"),
        CheckConstraint("guest_tolerance IN ('rarely', 'weekends', 'anytime')", name="guest_tolerance_check"),
    )

    user = relationship("User", back_populates="preferences")


class Hostel(Base):
    __tablename__ = 'hostels'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    price = Column(Integer, nullable=False)
    description = Column(Text)
    images = Column(ARRAY(Text))
    owner_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    is_verified = Column(Boolean, nullable=False, default=False)

    __table_args__ = (
        CheckConstraint("price >= 0", name="price_check"),
    )

    # Relationships
    owner = relationship("User", back_populates="owned_hostels")
    amenities = relationship("HostelAmenity", back_populates="hostel", cascade="all, delete-orphan")
    rooms = relationship("HostelRoom", back_populates="hostel", cascade="all, delete-orphan")
    occupants = relationship("HostelOccupancy", back_populates="hostel", cascade="all, delete-orphan")


class HostelAmenity(Base):
    __tablename__ = 'hostel_amenities'

    hostel_id = Column(UUID(as_uuid=True), ForeignKey('hostels.id', ondelete='CASCADE'), primary_key=True)
    amenity = Column(String(100), primary_key=True)

    hostel = relationship("Hostel", back_populates="amenities")


class HostelRoom(Base):
    __tablename__ = 'hostel_rooms'

    hostel_id = Column(UUID(as_uuid=True), ForeignKey('hostels.id', ondelete='CASCADE'), primary_key=True)
    sharing_type = Column(String(20), primary_key=True)
    available = Column(Integer, nullable=False, default=0)

    __table_args__ = (
        CheckConstraint("sharing_type IN ('single', 'double', 'triple')", name="sharing_type_check"),
        CheckConstraint("available >= 0", name="available_check"),
    )

    hostel = relationship("Hostel", back_populates="rooms")


class HostelOccupancy(Base):
    __tablename__ = 'hostel_occupancy'

    hostel_id = Column(UUID(as_uuid=True), ForeignKey('hostels.id', ondelete='CASCADE'), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)

    hostel = relationship("Hostel", back_populates="occupants")
    user = relationship("User", back_populates="bookings")


class MatchRequest(Base):
    __tablename__ = 'match_requests'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    receiver_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    status = Column(String(10), nullable=False, default='pending')
    message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("status IN ('pending', 'accepted', 'declined')", name="match_status_check"),
        CheckConstraint("sender_id <> receiver_id", name="self_matching_check"),
        UniqueConstraint("sender_id", "receiver_id", name="unique_sender_receiver"),
    )


class Message(Base):
    __tablename__ = 'messages'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    receiver_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)


class BlockedUser(Base):
    __tablename__ = 'blocked_users'

    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    blocked_user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)

    __table_args__ = (
        CheckConstraint("user_id <> blocked_user_id", name="self_blocking_check"),
    )


class Report(Base):
    __tablename__ = 'reports'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    reported_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    reason = Column(String(20), nullable=False)
    description = Column(Text)
    status = Column(String(10), nullable=False, default='pending')
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("reason IN ('fake-profile', 'harassment', 'spam', 'other')", name="report_reason_check"),
        CheckConstraint("status IN ('pending', 'resolved')", name="report_status_check"),
    )


class InviteToken(Base):
    __tablename__ = 'invite_tokens'

    token = Column(String(255), primary_key=True)
    email = Column(String(255), nullable=False)
    is_used = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
