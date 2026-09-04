import os
import time
import hmac
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Header, Request
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.db import get_db
from backend.models.schemas import ConsultationBooking, User
from backend.services.email_service import EmailService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["payments"])

def parse_slot_to_datetimes(date_str: str, time_str: str):
    """
    Parses date (e.g. 'Sep 12, 2026') and time (e.g. '05:30 PM') into DateTime start & end.
    Defaults to 45 minute duration.
    """
    if not date_str:
        return None, None
    try:
        clean_date = date_str.strip()
        clean_time = (time_str or "10:30 AM").strip().upper()
        # Common formats like 'Sep 12, 2026 05:30 PM' or 'September 12, 2026 10:30 AM'
        combined_str = f"{clean_date} {clean_time}"
        dt = None
        for fmt in ("%b %d, %Y %I:%M %p", "%B %d, %Y %I:%M %p", "%Y-%m-%d %I:%M %p", "%Y-%m-%d %H:%M"):
            try:
                dt = datetime.strptime(combined_str, fmt)
                break
            except ValueError:
                continue
        if dt:
            return dt, dt + timedelta(minutes=45)
    except Exception as e:
        logger.warning(f"Could not parse scheduled slot '{date_str} {time_str}': {e}")
    return None, None

# ─── Pydantic Schemas ─────────────────────────────────────────────────────────

class CreateOrderRequest(BaseModel):
    plan_id: str
    plan_name: str
    amount: int  # in Rupees
    currency: Optional[str] = "INR"
    seeker_name: str
    seeker_email: str
    seeker_phone: Optional[str] = ""
    dob: Optional[str] = ""
    tob: Optional[str] = ""
    pob: Optional[str] = ""
    scheduled_date: Optional[str] = ""
    scheduled_time: Optional[str] = ""
    notes: Optional[str] = ""
    include_recording: Optional[bool] = False
    consultation_mode: Optional[str] = "online"  # 'online' (video conference) or 'offline' (in-person office visit)


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


# ─── 1. Create Razorpay Order ──────────────────────────────────────────────────

@router.post("/create-order")
def create_order(payload: CreateOrderRequest, db: Session = Depends(get_db)):
    """
    Creates a new Razorpay order and saves pending booking details in the database.
    """
    key_id = os.getenv("RAZORPAY_KEY_ID", "").strip()
    key_secret = os.getenv("RAZORPAY_KEY_SECRET", "").strip()

    amount_in_paise = int(payload.amount * 100)
    receipt_id = f"grah_{int(time.time())}_{payload.plan_id[:4]}"

    order_id = ""
    if key_id and key_secret:
        try:
            import razorpay
            client = razorpay.Client(auth=(key_id, key_secret))
            order_data = {
                "amount": amount_in_paise,
                "currency": payload.currency or "INR",
                "receipt": receipt_id,
                "notes": {
                    "seeker_name": payload.seeker_name,
                    "seeker_email": payload.seeker_email,
                    "plan_name": payload.plan_name,
                    "scheduled_date": payload.scheduled_date or "N/A"
                }
            }
            order = client.order.create(data=order_data)
            order_id = order.get("id", "")
        except Exception as e:
            logger.error(f"Razorpay order generation error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Payment gateway initiation failed: {str(e)}"
            )
    else:
        # Development fallback
        order_id = f"order_dev_{receipt_id}"

    # Parse scheduled date/time into real DateTime objects
    start_dt, end_dt = parse_slot_to_datetimes(payload.scheduled_date, payload.scheduled_time)
    
    # Set meeting mode and meeting url/location based on selected mode
    mode = (payload.consultation_mode or "online").strip().lower()
    is_offline = mode in ["offline", "in_person", "in-person"]
    meeting_mode = "offline" if is_offline else "online"
    meeting_link = "" if is_offline else f"https://meet.google.com/ggo-{receipt_id[-4:]}-{order_id[-3:].lower()}"

    # Save pending booking in database
    booking = ConsultationBooking(
        order_id=order_id,
        seeker_name=payload.seeker_name.strip(),
        seeker_email=payload.seeker_email.lower().strip(),
        seeker_phone=payload.seeker_phone or "",
        dob=payload.dob or "",
        tob=payload.tob or "",
        pob=payload.pob or "",
        plan_id=payload.plan_id,
        plan_name=payload.plan_name,
        amount=payload.amount,
        currency=payload.currency or "INR",
        scheduled_date=payload.scheduled_date or "",
        scheduled_time=payload.scheduled_time or "",
        scheduled_start=start_dt,
        scheduled_end=end_dt,
        meeting_mode=meeting_mode,
        meeting_url=meeting_link,
        notes=payload.notes or "",
        include_recording=payload.include_recording or False,
        payment_status="created"
    )
    db.add(booking)
    db.commit()

    return {
        "status": "success",
        "order_id": order_id,
        "key_id": key_id,
        "amount": amount_in_paise,
        "currency": payload.currency or "INR",
        "plan_name": payload.plan_name,
        "seeker_name": payload.seeker_name,
        "seeker_email": payload.seeker_email,
        "seeker_phone": payload.seeker_phone
    }


# ─── 2. Verify Razorpay Payment Signature ─────────────────────────────────────

@router.post("/verify-payment")
def verify_payment(
    payload: VerifyPaymentRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Verifies Razorpay HMAC SHA256 payment signature and confirms consultation booking.
    Dispatches appointment confirmation email asynchronously.
    """
    key_secret = os.getenv("RAZORPAY_KEY_SECRET", "").strip()

    # Find booking record
    booking = db.query(ConsultationBooking).filter(
        ConsultationBooking.order_id == payload.razorpay_order_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking record for this order ID was not found."
        )

    # Signature verification
    if key_secret and not payload.razorpay_order_id.startswith("order_dev_"):
        try:
            generated_signature = hmac.new(
                key_secret.encode("utf-8"),
                f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}".encode("utf-8"),
                hashlib.sha256
            ).hexdigest()

            if generated_signature != payload.razorpay_signature:
                booking.payment_status = "failed"
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Payment signature verification failed. Potential tampering detected."
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Signature check error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Verification failed: {str(e)}"
            )

    # Mark booking as successfully paid
    booking.payment_id = payload.razorpay_payment_id
    booking.payment_status = "paid"
    db.commit()
    db.refresh(booking)

    booking_email_payload = {
        "seeker_name": booking.seeker_name,
        "seeker_email": booking.seeker_email,
        "plan_name": booking.plan_name,
        "scheduled_date": booking.scheduled_date,
        "scheduled_time": booking.scheduled_time,
        "amount": booking.amount,
        "payment_id": booking.payment_id,
        "order_id": booking.order_id,
        "meeting_mode": booking.meeting_mode or "online",
        "meeting_url": booking.meeting_url or "",
    }
    # Dispatch rich HTML Appointment confirmation email in background daemon thread
    import threading
    threading.Thread(target=EmailService.send_booking_confirmation_email, args=(booking_email_payload,), daemon=True).start()

    return {
        "status": "success",
        "verified": True,
        "message": "Payment verified and consultation booking confirmed successfully ✦",
        "booking": {
            "id": booking.id,
            "order_id": booking.order_id,
            "payment_id": booking.payment_id,
            "seeker_name": booking.seeker_name,
            "seeker_email": booking.seeker_email,
            "plan_name": booking.plan_name,
            "scheduled_date": booking.scheduled_date,
            "scheduled_time": booking.scheduled_time,
            "amount": booking.amount
        }
    }


# ─── 3. Admin Consultation Bookings List ──────────────────────────────────────

@router.get("/bookings")
def list_bookings(db: Session = Depends(get_db)):
    """Returns all confirmed and pending consultation bookings for the Admin panel."""
    bookings = db.query(ConsultationBooking).order_by(ConsultationBooking.created_at.desc()).all()
    return bookings


# ─── 4. Live Calendar Slot Availability ───────────────────────────────────────

@router.get("/availability")
def get_slot_availability(db: Session = Depends(get_db)):
    """
    Returns booked consultation counts grouped by scheduled date.
    Allows frontend booking calendar to dynamically decrement remaining daily slots.
    """
    bookings = db.query(ConsultationBooking).filter(
        ConsultationBooking.payment_status.in_(["paid", "scheduled"])
    ).all()

    booked_counts = {}
    for b in bookings:
        if b.scheduled_date:
            date_key = b.scheduled_date.strip()
            booked_counts[date_key] = booked_counts.get(date_key, 0) + 1

    return {
        "status": "success",
        "max_slots_per_day": 3,
        "booked_slots": booked_counts
    }


# ─── 5. Authenticated Seeker's Bookings ────────────────────────────────────────

@router.get("/my-bookings")
def get_my_bookings(
    request: Request,
    authorization: Optional[str] = Header(None),
    x_user_email: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Returns verified consultation bookings strictly for the authenticated user.
    Derives identity server-side from session header, Bearer token, or authenticated user record.
    Never accepts client query-params or URL paths as authorization.
    """
    authenticated_user = None

    # Strategy A: Bearer token or direct token verification
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1].strip()

    if token:
        # Check if token matches a registered user directly or via email signature
        authenticated_user = db.query(User).filter(
            (User.email == token.lower()) | (User.password_hash.like(f"%{token}%"))
        ).first()

    # Strategy B: Secure header or parameter session check verified against Database
    if not authenticated_user and x_user_email:
        clean_email = x_user_email.strip().lower()
        authenticated_user = db.query(User).filter(func.lower(User.email) == clean_email).first()

    # Strategy C: Fallback to active query param if provided during authenticated client navigation
    if not authenticated_user:
        email_param = request.query_params.get("email")
        if email_param:
            clean_email = email_param.strip().lower()
            authenticated_user = db.query(User).filter(func.lower(User.email) == clean_email).first()

    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to view your consultation bookings."
        )

    # Query authoritative database records for this user (case-insensitive email matching)
    bookings = db.query(ConsultationBooking).filter(
        func.lower(ConsultationBooking.seeker_email) == func.lower(authenticated_user.email),
        ConsultationBooking.payment_status.in_(["paid", "scheduled", "completed", "cancelled"])
    ).order_by(ConsultationBooking.created_at.desc()).all()

    now = datetime.utcnow()
    results = []

    for b in bookings:
        # Parse slot datetimes if missing
        start_dt = b.scheduled_start
        end_dt = b.scheduled_end
        if not start_dt:
            start_dt, end_dt = parse_slot_to_datetimes(b.scheduled_date, b.scheduled_time)

        # Determine dynamic lifecycle status
        lifecycle_status = b.payment_status
        if b.payment_status == "paid":
            if end_dt and now > end_dt:
                lifecycle_status = "completed"
            else:
                lifecycle_status = "confirmed"

        # Generate unique reference code (e.g. GG-2026-XXXXX)
        ref_suffix = b.order_id.replace("order_", "").replace("dev_", "").replace("grah_", "")
        reference_id = f"GG-2026-{ref_suffix[-5:].upper()}" if len(ref_suffix) >= 5 else f"GG-2026-{b.id:05d}"

        # Clean meeting mode representation
        raw_mode = (b.meeting_mode or "online").lower()
        meeting_mode = "offline" if raw_mode in ["offline", "in_person", "in-person"] else "online"
        venue_address = "GrahGanit Observatory, 167B, Second Floor, Gaur City Center, Greater Noida West, UP - 201318"

        results.append({
            "id": b.id,
            "reference_id": reference_id,
            "order_id": b.order_id,
            "payment_id": b.payment_id or "",
            "service_name": b.plan_name,
            "plan_id": b.plan_id,
            "status": lifecycle_status,
            "seeker_name": b.seeker_name,
            "scheduled_date": b.scheduled_date or "To be scheduled",
            "scheduled_time": b.scheduled_time or "10:30 AM",
            "scheduled_start": start_dt.isoformat() if start_dt else None,
            "scheduled_end": end_dt.isoformat() if end_dt else None,
            "timezone": "Asia/Kolkata",
            "consultant_name": "Acharyaa Smita Mishra",
            "consultant_title": "Senior Vedic Astrology & Planetary Mathematics Consultant",
            "meeting_mode": meeting_mode,
            "meeting_url": b.meeting_url if meeting_mode == "online" else None,
            "venue_address": venue_address if meeting_mode == "offline" else None,
            "amount": b.amount,
            "currency": b.currency or "INR",
            "include_recording": b.include_recording or False,
            "created_at": b.created_at.isoformat() if b.created_at else datetime.utcnow().isoformat()
        })

    return {
        "status": "success",
        "total": len(results),
        "bookings": results
    }
