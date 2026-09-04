from sqlalchemy import Column, Integer, String, DateTime, Float, Text, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=True)
    first_name = Column(String(255), nullable=True)
    surname = Column(String(255), nullable=True)
    phone_number = Column(String(50), nullable=True)
    password_hash = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    birth_details = relationship("BirthDetail", back_populates="user", uselist=False)
    kundlis = relationship("KundliRecord", back_populates="user")



class BirthDetail(Base):
    __tablename__ = "birth_details"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    gender = Column(String(50))
    country = Column(String(100))
    language = Column(String(50))
    date_of_birth = Column(String(20), nullable=False)  # YYYY-MM-DD
    time_of_birth = Column(String(20), nullable=False)  # HH:MM
    place_of_birth = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    timezone = Column(String(100), nullable=True)

    # Computed Astrological Attributes
    moon_sign = Column(String(50), nullable=True)
    ascendant = Column(String(50), nullable=True)
    nakshatra = Column(String(50), nullable=True)
    life_path_number = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="birth_details")


class KundliRecord(Base):
    __tablename__ = "kundli_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    chart_data = Column(JSON, nullable=False)  # Full ephemeris & interpretation JSON
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="kundlis")


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="Vedic Astrology")
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=False)  # Markdown or HTML format
    cover_image = Column(String(500), nullable=True)
    author_name = Column(String(255), default="GrahGanit Observatory")
    read_time = Column(String(50), default="5 min read")
    is_published = Column(Boolean, default=True)
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SiteAnnouncement(Base):
    __tablename__ = "site_announcements"

    id = Column(Integer, primary_key=True, index=True)
    badge_text = Column(String(100), default="COSMIC ALERT")
    message = Column(String(500), nullable=False)
    link_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ConsultationTier(Base):
    __tablename__ = "consultation_tiers"

    id = Column(Integer, primary_key=True, index=True)
    tier_key = Column(String(50), unique=True, index=True, nullable=False)  # silver, gold, platinum
    title = Column(String(100), nullable=False)
    price_inr = Column(Integer, nullable=False)
    duration = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    features = Column(JSON, nullable=True)  # List of strings
    is_popular = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    zodiac_sign = Column(String(100), default="Seeker")
    rating = Column(Integer, default=5)
    category = Column(String(100), default="General Experience")
    comment = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(100), nullable=True)
    subject = Column(String(255), nullable=False)
    dob = Column(String(50), nullable=True)
    tob = Column(String(50), nullable=True)
    pob = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class EmailVerificationOTP(Base):
    __tablename__ = "email_verification_otps"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), index=True, nullable=False)
    otp_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    attempts = Column(Integer, default=0)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ConsultationBooking(Base):
    __tablename__ = "consultation_bookings"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(255), unique=True, index=True, nullable=False)
    payment_id = Column(String(255), nullable=True)
    seeker_name = Column(String(255), nullable=False)
    seeker_email = Column(String(255), nullable=False)
    seeker_phone = Column(String(100), nullable=True)
    dob = Column(String(50), nullable=True)
    tob = Column(String(50), nullable=True)
    pob = Column(String(255), nullable=True)
    plan_id = Column(String(100), nullable=False)
    plan_name = Column(String(255), nullable=False)
    amount = Column(Integer, nullable=False)  # in INR
    currency = Column(String(10), default="INR")
    scheduled_date = Column(String(100), nullable=True)
    scheduled_time = Column(String(100), nullable=True)
    scheduled_start = Column(DateTime, nullable=True)
    scheduled_end = Column(DateTime, nullable=True)
    meeting_mode = Column(String(50), default="video_conference")
    meeting_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    include_recording = Column(Boolean, default=False)
    payment_status = Column(String(50), default="created")  # created, paid, failed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)




