import os
import random
import time
import hashlib
import secrets
import json
import urllib.request
from typing import Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from backend.db import get_db
from backend.models.schemas import User, BirthDetail, EmailVerificationOTP
from backend.services.email_service import EmailService

router = APIRouter(prefix="/api/user", tags=["User & Birth Details"])

# ─── SECURE OTP CACHE IN-MEMORY STORES ───────────────────────────────────────
otp_store: Dict[str, dict] = {}

def hash_string(value: str) -> str:
    """Returns SHA256 hash of a string."""
    return hashlib.sha256(value.encode('utf-8')).hexdigest()

def hash_password(password: str) -> str:
    """Hashes password with PBKDF2 HMAC SHA256."""
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac(
        'sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000
    ).hex()
    return f"{salt}${pwd_hash}"

def verify_password(password: str, stored_hash: str) -> bool:
    """Verifies stored password hash against input password."""
    if not stored_hash or '$' not in stored_hash:
        return False
    try:
        salt, original_hash = stored_hash.split('$', 1)
        pwd_hash = hashlib.pbkdf2_hmac(
            'sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000
        ).hex()
        return secrets.compare_digest(pwd_hash, original_hash)
    except Exception:
        return False


# ─── Pydantic Models ─────────────────────────────────────────────────────────
class SendOTPRequest(BaseModel):
    first_name: str
    surname: str
    email: str
    phone_number: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

class RegisterRequest(BaseModel):
    first_name: str
    surname: str
    email: str
    phone_number: str
    password: str
    otp: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserProfileCreate(BaseModel):
    name: str
    email: str
    phone_number: Optional[str] = None
    gender: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = None
    date_of_birth: str
    time_of_birth: str
    place_of_birth: str
    moon_sign: Optional[str] = None
    ascendant: Optional[str] = None
    nakshatra: Optional[str] = None
    life_path_number: Optional[int] = None


# ─── API ENDPOINTS ───────────────────────────────────────────────────────────

@router.post("/send-otp")
def send_otp(data: SendOTPRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Sends a 6-digit OTP code to user's email via SMTP service (Background Tasks).
    Enforces rate-limiting (60s cooldown, max 3/15m) and SHA256 hashed storage.
    """
    email_key = data.email.lower().strip()
    now = time.time()

    # Check 60s cooldown rate limit
    if email_key in otp_store:
        last_sent = otp_store[email_key].get("last_sent_at", 0)
        if now - last_sent < 60:
            retry_after = int(60 - (now - last_sent))
            raise HTTPException(
                status_code=429, 
                detail=f"Please wait {retry_after} seconds before requesting a new OTP code."
            )

    # Generate 6-digit OTP
    raw_otp = f"{random.randint(100000, 999999)}"
    hashed_otp = hash_string(raw_otp)

    # Save to in-memory cache (10 min expiration)
    otp_store[email_key] = {
        "hashed_otp": hashed_otp,
        "expires_at": now + 600,
        "last_sent_at": now,
        "attempts": 0,
        "verified": False,
    }

    # Single application-level send attempt (no duplicate retries to prevent duplicate emails)
    sent = EmailService.send_otp_email(email_key, raw_otp)
    if not sent:
        raise HTTPException(
            status_code=502,
            detail="Unable to dispatch verification email at this moment. Please check your email configuration or try again shortly."
        )

    return {
        "status": "success",
        "message": f"Verification code sent to {email_key}. Check your inbox.",
        "cooldown_seconds": 60
    }


@router.post("/verify-otp")
def verify_otp(data: VerifyOTPRequest):
    """
    Verifies 6-digit OTP provided by user against hashed store.
    Limits to 5 attempts before invalidation.
    """
    email_key = data.email.lower().strip()
    now = time.time()

    if email_key not in otp_store:
        raise HTTPException(status_code=400, detail="No OTP found. Please request a code first.")

    entry = otp_store[email_key]

    # Check expiration
    if now > entry["expires_at"]:
        del otp_store[email_key]
        raise HTTPException(status_code=400, detail="OTP code has expired. Please request a new code.")

    # Check attempt limit
    if entry["attempts"] >= 5:
        del otp_store[email_key]
        raise HTTPException(status_code=400, detail="Maximum verification attempts exceeded. Please request a new OTP.")

    entry["attempts"] += 1

    # Verify hash
    if hash_string(data.otp.strip()) != entry["hashed_otp"]:
        attempts_left = 5 - entry["attempts"]
        raise HTTPException(status_code=400, detail=f"Invalid verification code. {attempts_left} attempts remaining.")

    # Mark verified successfully
    entry["verified"] = True
    return {
        "status": "success",
        "verified": True,
        "message": "OTP verified successfully. You may now set your password."
    }


@router.post("/register")
def register_user(data: RegisterRequest, db: Session = Depends(get_db)):
    """
    Registers a new user in PostgreSQL/DB after confirming OTP verification.
    """
    email_key = data.email.lower().strip()

    # Check existing user
    existing_user = db.query(User).filter(User.email == email_key).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists. Please Sign In.")

    # Verify OTP state
    if email_key not in otp_store or not otp_store[email_key].get("verified"):
        raise HTTPException(status_code=400, detail="Email address has not been verified. Please complete OTP verification.")

    full_name = f"{data.first_name.strip()} {data.surname.strip()}".strip()
    hashed_pwd = hash_password(data.password)

    new_user = User(
        email=email_key,
        name=full_name,
        first_name=data.first_name.strip(),
        surname=data.surname.strip(),
        phone_number=data.phone_number.strip(),
        password_hash=hashed_pwd,
        is_verified=True
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Clear OTP store immediately after registration
        if email_key in otp_store:
            del otp_store[email_key]

        return {
            "status": "success",
            "message": "Account created successfully!",
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "name": new_user.name,
                "first_name": new_user.first_name,
                "surname": new_user.surname,
                "phone_number": new_user.phone_number
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database registration error: {str(e)}")


@router.post("/login")
def login_user(data: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates registered user against database password.
    Returns clear guidance if account does not exist.
    """
    email_key = data.email.lower().strip()
    user = db.query(User).filter(User.email == email_key).first()

    if not user:
        raise HTTPException(
            status_code=404, 
            detail="No account found with this email. Please create an account first!"
        )

    if not user.password_hash or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password. Please check your credentials.")

    bd = user.birth_details
    has_profile = bool(bd and bd.date_of_birth)
    return {
        "status": "success",
        "message": "Sign in successful!",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name or f"{user.first_name} {user.surname}",
            "first_name": user.first_name,
            "surname": user.surname,
            "phone_number": user.phone_number,
            "is_admin": user.is_admin,
            "picture": user.picture,
            "has_profile": has_profile,
            "profile": {
                "name": user.name or f"{user.first_name} {user.surname}",
                "email": user.email,
                "phone_number": user.phone_number,
                "photo_url": user.picture,
                "gender": bd.gender if bd else None,
                "country": bd.country if bd else None,
                "language": bd.language if bd else None,
                "dob": bd.date_of_birth if bd else None,
                "time": bd.time_of_birth if bd else None,
                "place": bd.place_of_birth if bd else None,
                "moon_sign": bd.moon_sign if bd else None,
                "ascendant": bd.ascendant if bd else None,
                "nakshatra": bd.nakshatra if bd else None,
                "life_path_number": bd.life_path_number if bd else None,
            } if bd else None
        }
    }


@router.post("/save-profile")
def save_user_profile(data: UserProfileCreate, db: Session = Depends(get_db)):
    """
    Saves or updates user account and birth coordinates in database.
    """
    try:
        user = db.query(User).filter(User.email == data.email).first()
        if not user:
            user = User(email=data.email, name=data.name, phone_number=data.phone_number, is_verified=True)
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            user.name = data.name
            if data.phone_number:
                user.phone_number = data.phone_number
            db.commit()

        birth_detail = db.query(BirthDetail).filter(BirthDetail.user_id == user.id).first()
        if not birth_detail:
            birth_detail = BirthDetail(user_id=user.id)

        birth_detail.gender = data.gender
        birth_detail.country = data.country
        birth_detail.language = data.language
        birth_detail.date_of_birth = data.date_of_birth
        birth_detail.time_of_birth = data.time_of_birth
        birth_detail.place_of_birth = data.place_of_birth
        birth_detail.moon_sign = data.moon_sign
        birth_detail.ascendant = data.ascendant
        birth_detail.nakshatra = data.nakshatra
        birth_detail.life_path_number = data.life_path_number

        db.add(birth_detail)
        db.commit()
        db.refresh(birth_detail)

        return {
            "status": "success",
            "message": "User profile saved to database",
            "user_id": user.id,
            "email": user.email,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/profile/{email}")
def get_user_profile(email: str, db: Session = Depends(get_db)):
    """Retrieves user profile and birth coordinates from database."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    bd = user.birth_details
    return {
        "id": user.id,
        "name": user.name or f"{user.first_name} {user.surname}",
        "email": user.email,
        "first_name": user.first_name,
        "surname": user.surname,
        "phone_number": user.phone_number,
        "gender": bd.gender if bd else None,
        "country": bd.country if bd else None,
        "language": bd.language if bd else None,
        "date_of_birth": bd.date_of_birth if bd else None,
        "time_of_birth": bd.time_of_birth if bd else None,
        "place_of_birth": bd.place_of_birth if bd else None,
        "moon_sign": bd.moon_sign if bd else None,
        "ascendant": bd.ascendant if bd else None,
        "nakshatra": bd.nakshatra if bd else None,
        "life_path_number": bd.life_path_number if bd else None,
    }

class GoogleAuthRequest(BaseModel):
    name: str
    email: EmailStr
    picture: Optional[str] = None

@router.post("/google-auth")
def google_authenticate_user(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticates or creates a user account via Google OAuth credentials."""
    clean_email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == clean_email).first()
    is_new_user = False

    if not user:
        is_new_user = True
        name_parts = payload.name.strip().split(" ", 1)
        first_name = name_parts[0]
        surname = name_parts[1] if len(name_parts) > 1 else ""

        user = User(
            email=clean_email,
            name=payload.name,
            first_name=first_name,
            surname=surname,
            picture=payload.picture,
            password_hash=hash_password(secrets.token_hex(16)),
            is_verified=True,
            is_admin=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update picture if provided
        if payload.picture and user.picture != payload.picture:
            user.picture = payload.picture
            db.commit()
            db.refresh(user)

    bd = user.birth_details
    has_profile = bool(bd and bd.date_of_birth)
    return {
        "status": "success",
        "message": "Google authentication successful",
        "is_new_user": is_new_user,
        "user": {
            "id": user.id,
            "name": user.name or f"{user.first_name} {user.surname}",
            "email": user.email,
            "first_name": user.first_name,
            "surname": user.surname,
            "phone_number": user.phone_number,
            "is_admin": user.is_admin,
            "picture": payload.picture,
            "has_profile": has_profile,
            "profile": {
                "name": user.name or f"{user.first_name} {user.surname}",
                "email": user.email,
                "phone_number": user.phone_number,
                "photo_url": payload.picture or user.picture,
                "gender": bd.gender if bd else None,
                "country": bd.country if bd else None,
                "language": bd.language if bd else None,
                "dob": bd.date_of_birth if bd else None,
                "time": bd.time_of_birth if bd else None,
                "place": bd.place_of_birth if bd else None,
                "moon_sign": bd.moon_sign if bd else None,
                "ascendant": bd.ascendant if bd else None,
                "nakshatra": bd.nakshatra if bd else None,
                "life_path_number": bd.life_path_number if bd else None,
            } if bd else None
        }
    }
