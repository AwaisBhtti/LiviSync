import uuid
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Table, Text, ARRAY, CheckConstraint, UniqueConstraint, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base

class Student(Base):
    __tablename__ = 'students'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(10), nullable=True)
    photo = Column(Text)
    bio = Column(Text)
    budget = Column(Integer, nullable=True)
    location = Column(String(100), nullable=True)
    status = Column(String(10), nullable=False, default='active')
    is_email_verified = Column(Boolean, nullable=False, default=False)
    is_profile_complete = Column(Boolean, nullable=False, default=False)
    
    # Student specific fields
    occupation = Column(String(10), nullable=True)  # 'student' or 'job'
    institution = Column(String(255), nullable=True)
    company = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    hostel_id = Column(UUID(as_uuid=True), ForeignKey('hostels.id', ondelete='SET NULL'), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("age >= 16 AND age <= 100", name="student_age_check"),
        CheckConstraint("gender IN ('male', 'female', 'other')", name="student_gender_check"),
        CheckConstraint("status IN ('active', 'suspended')", name="student_status_check"),
        CheckConstraint("occupation IN ('student', 'job')", name="student_occupation_check"),
    )

    preferences = relationship("Preferences", back_populates="student", uselist=False, cascade="all, delete-orphan")
    hostel = relationship("Hostel", back_populates="occupants")


class Owner(Base):
    __tablename__ = 'owners'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    status = Column(String(10), nullable=False, default='unapproved')
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("status IN ('active', 'suspended', 'unapproved')", name="owner_status_check"),
    )

    owned_hostels = relationship("Hostel", back_populates="owner")


class Admin(Base):
    __tablename__ = 'admins'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Preferences(Base):
    __tablename__ = 'preferences'

    student_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), primary_key=True)
    sleep_schedule = Column(String(20), nullable=True)
    cleanliness = Column(String(20), nullable=True)
    smoking = Column(String(20), nullable=True)
    pets = Column(String(20), nullable=True)
    guest_tolerance = Column(String(20), nullable=True)
    noise_tolerance = Column(String(20), nullable=True, default=None)

    __table_args__ = (
        CheckConstraint("sleep_schedule IN ('early-bird', 'night-owl', 'flexible')", name="sleep_schedule_check"),
        CheckConstraint("cleanliness IN ('meticulous', 'moderate', 'relaxed')", name="cleanliness_check"),
        CheckConstraint("smoking IN ('no', 'yes', 'outside-only')", name="smoking_check"),
        CheckConstraint("pets IN ('no', 'yes', 'likes-but-no-own')", name="pets_check"),
        CheckConstraint("guest_tolerance IN ('rarely', 'weekends', 'anytime')", name="guest_tolerance_check"),
        CheckConstraint("noise_tolerance IN ('silent', 'moderate', 'lively')", name="noise_tolerance_check"),
    )

    student = relationship("Student", back_populates="preferences")


class Hostel(Base):
    __tablename__ = 'hostels'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    description = Column(Text)
    photo = Column(Text, nullable=True)
    electricity_bill_included = Column(Boolean, nullable=False, default=False)
    owner_id = Column(UUID(as_uuid=True), ForeignKey('owners.id', ondelete='SET NULL'), nullable=True)
    is_verified = Column(Boolean, nullable=False, default=False)

    owner = relationship("Owner", back_populates="owned_hostels")
    amenities = relationship("HostelAmenity", back_populates="hostel", cascade="all, delete-orphan")
    rooms = relationship("HostelRoom", back_populates="hostel", cascade="all, delete-orphan")
    occupants = relationship("Student", back_populates="hostel")


class HostelAmenity(Base):
    __tablename__ = 'hostel_amenities'

    hostel_id = Column(UUID(as_uuid=True), ForeignKey('hostels.id', ondelete='CASCADE'), primary_key=True)
    amenity = Column(String(100), primary_key=True)

    hostel = relationship("Hostel", back_populates="amenities")


class HostelRoom(Base):
    __tablename__ = 'hostel_rooms'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hostel_id = Column(UUID(as_uuid=True), ForeignKey('hostels.id', ondelete='CASCADE'), nullable=False)
    sharing_type = Column(String(20), nullable=False)
    price = Column(Integer, nullable=False)
    seats_available = Column(Integer, nullable=False, default=1)
    floor = Column(String(50), nullable=False)
    has_attached_bathroom = Column(Boolean, nullable=False, default=False)
    furniture = Column(String(20), nullable=False, default='nothing')
    images = Column(ARRAY(Text), nullable=False)
    description = Column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint("sharing_type IN ('single', 'double', 'triple', 'quad', 'penta')", name="sharing_type_check"),
        CheckConstraint("price >= 0", name="room_price_check"),
        CheckConstraint("seats_available >= 0", name="seats_available_check"),
        CheckConstraint("furniture IN ('bed', 'mattress', 'nothing')", name="furniture_check"),
    )

    hostel = relationship("Hostel", back_populates="rooms")


class MatchRequest(Base):
    __tablename__ = 'match_requests'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    receiver_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
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
    sender_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    receiver_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)


class BlockedUser(Base):
    __tablename__ = 'blocked_users'

    user_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), primary_key=True)
    blocked_user_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), primary_key=True)

    __table_args__ = (
        CheckConstraint("user_id <> blocked_user_id", name="self_blocking_check"),
    )


class Report(Base):
    __tablename__ = 'reports'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    reported_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
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


class PhoneViewLog(Base):
    __tablename__ = 'phone_view_logs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    hostel_id = Column(UUID(as_uuid=True), ForeignKey('hostels.id', ondelete='CASCADE'), nullable=False)
    viewed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
