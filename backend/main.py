from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import database & ORM models
from backend.db import Base, engine
from backend.models import schemas

# Create database tables automatically
try:
    Base.metadata.create_all(bind=engine)
    print("[DB] Database tables created/verified successfully.")
except Exception as e:
    print(f"[DB] Database table initialization error: {e}")

# Import our routes
from backend.api.routes import kundli
from backend.api.routes import numerology
from backend.api.routes import user
from backend.api.routes import admin
from backend.api.routes import articles
from backend.api.routes import payments

app = FastAPI(
    title="GrahGanit Spiritual Knowledge Engine",
    description="Deterministic backend for Vedic Kundli, Numerology, Palmistry & Content Management.",
    version="1.0.0"
)

import os

# Dynamic CORS origins configuration for production
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

# If wildcard origin is set, disable allow_credentials to prevent spec violations
is_wildcard = "*" in allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=not is_wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(kundli.router)
app.include_router(numerology.router)
app.include_router(user.router)
app.include_router(admin.router, prefix="/api")
app.include_router(articles.router, prefix="/api")
app.include_router(payments.router, prefix="/api")

@app.get("/health")
@app.get("/api/health")
def health_check():
    """Ultra-fast keep-alive health check."""
    return {"status": "online", "engine": "GrahGanit Precision Planetary Engine"}

# Seed initial admin user and sample articles if fresh
@app.on_event("startup")
def seed_admin_and_content():
    try:
        from backend.db import SessionLocal
        from backend.models.schemas import User, Article, SiteAnnouncement
        from backend.api.routes.user import hash_password

        db = SessionLocal()
        
        # 1. Seed Admin User
        admin_email = os.getenv("ADMIN_EMAIL", "admin@grahganit.in").lower().strip()
        admin_pass = os.getenv("ADMIN_PASSWORD", "Admin@12345")
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if not existing_admin:
            new_admin = User(
                email=admin_email,
                name="GrahGanit Master Admin",
                first_name="Admin",
                surname="GrahGanit",
                password_hash=hash_password(admin_pass),
                is_verified=True,
                is_admin=True
            )
            db.add(new_admin)
            db.commit()
            print(f"[SEED] Default Admin created: {admin_email} / Admin@12345")
        elif not existing_admin.is_admin:
            existing_admin.is_admin = True
            db.commit()
            print(f"[SEED] Promoted {admin_email} to Admin.")

        # 2. Seed Sample Articles if none exist
        if db.query(Article).count() == 0:
            sample_articles = [
                Article(
                    title="Saturn Transit 2026: Planetary Shift & Karmic Realignment",
                    slug="saturn-transit-2026-planetary-shift",
                    category="Vedic Astrology",
                    excerpt="Discover how Shani's major sidereal transition impacts career, relationships, and spiritual growth across all 12 moon signs.",
                    content="""# Saturn Transit 2026: Planetary Shift & Karmic Realignment

Saturn (*Shani Dev*) is the cosmic taskmaster of Vedic astrology, representing discipline, Karma, perseverance, and structural foundation. When Saturn transitions between zodiacal constellations, its energetic wave reverberates through every birth chart.

## Key Transits & Nakshatra Movements

During this transit, Saturn influences key natal houses. Depending on your **Moon Sign (Rashi)** and **Ascendant (Lagna)**, this period invites deep self-reflection and structural organization:

1. **Fire Signs (Aries, Leo, Sagittarius)**: Focus shifts toward foundational discipline in career, long-term investments, and health routines.
2. **Earth Signs (Taurus, Virgo, Capricorn)**: High potential for professional elevation, provided effort is aligned with ethics and delayed gratification.
3. **Air Signs (Gemini, Libra, Aquarius)**: Communication networks and creative endeavors receive grounding focus.
4. **Water Signs (Cancer, Scorpio, Pisces)**: Emotional maturity and inner spiritual synthesis take center stage.

## Remediations & Spiritual Alignment

- **Mantra Recitation**: Recite the *Mahamrityunjaya Mantra* or *Om Sham Shanaishcharaya Namah* 108 times on Saturdays.
- **Charity**: Offer black sesame seeds, mustard oil, or warm garments to those in need.
- **Mindful Action**: Avoid impulsive contractual agreements during retrograde intervals.

*Calculated with mathematical precision by the GrahGanit Engine.*""",
                    cover_image="https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200",
                    author_name="Acharya Gurudev",
                    read_time="6 min read",
                    is_published=True
                ),
                Article(
                    title="Pythagorean vs. Chaldean Numerology: Finding Your True Life Path",
                    slug="pythagorean-vs-chaldean-numerology-guide",
                    category="Numerology",
                    excerpt="Unravel the key differences between ancient Babylonian Chaldean vibrations and Pythagorean number mathematics.",
                    content="""# Pythagorean vs. Chaldean Numerology: Finding Your True Life Path

Numbers are not merely symbols for counting — in sacred geometry, numbers carry distinct vibrational frequencies that mirror cosmic patterns.

## The Pythagorean System

Developed by the Greek philosopher Pythagoras, this system assigns numbers 1 through 9 sequentially across the Western alphabet:
- **Focus**: Life Path Number (calculated from complete Date of Birth) and Expression Number.
- **Methodology**: Base-9 reduction system.

## The Chaldean System

Originating in ancient Babylonia, the Chaldean system is often considered more mystic and precise for personal names:
- **Key Difference**: Assigns numerical values based on sound vibrations rather than strict alphabet ordering.
- **Number 8**: Associated with Saturn and high responsibility.

## Integrating Both for Complete Clarity

At **GrahGanit**, our dual numerology engine combines the structural clarity of the Pythagorean Life Path with the subtle vibrational resonance of Chaldean name numbers to provide a comprehensive profile.""",
                    cover_image="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200",
                    author_name="Kenji Okafor",
                    read_time="4 min read",
                    is_published=True
                )
            ]
            db.add_all(sample_articles)
            db.commit()
            print("[SEED] Sample articles populated successfully.")

        # 3. Seed Initial Announcement if none exist
        if db.query(SiteAnnouncement).count() == 0:
            initial_announcement = SiteAnnouncement(
                badge_text="NEW FEATURE",
                message="GrahGanit Admin CMS Engine is now live! Explore cosmic articles and planetary transits.",
                link_url="/blog",
                is_active=True
            )
            db.add(initial_announcement)
            db.commit()
            print("[SEED] Initial site announcement populated.")

        # 4. Seed / Synchronize Consultation Tiers
        from backend.models.schemas import ConsultationTier
        live_tiers = [
            {
                "tier_key": "career",
                "title": "Career Guidance",
                "price_inr": 999,
                "duration": "45 Minutes",
                "description": "Plot planetary positions governing Tenth house structures, job switches & promotions.",
                "features": ["Tenth House Karma & Profession Analysis", "Job Switch & Promotion Timing", "Office Politics & Boss Dynamics", "Custom Gemstone & Remedy Guide"],
                "is_popular": False,
                "is_active": True
            },
            {
                "tier_key": "marriage",
                "title": "Marriage & Relationship",
                "price_inr": 1499,
                "duration": "60 Minutes",
                "description": "Review Venus, Moon, and Seventh house marriage dynamics & synastry compatibility.",
                "features": ["Seventh House Synastry Compatibility", "Marriage Timing & Partner Characteristics", "Venus & Mangal Dosha Assessment", "Relationship Dispute Remediation"],
                "is_popular": False,
                "is_active": True
            },
            {
                "tier_key": "finance",
                "title": "Business & Finance",
                "price_inr": 1499,
                "duration": "60 Minutes",
                "description": "Identify auspicious periods for financial launches, investments & partnerships.",
                "features": ["Second & Eleventh House Wealth Yogas", "Business Launch & Partnership Timing", "Financial Investment Risk Windows", "Lakshmi & Kubera Mantras"],
                "is_popular": False,
                "is_active": True
            },
            {
                "tier_key": "health",
                "title": "Health & Spiritual Guidance",
                "price_inr": 999,
                "duration": "45 Minutes",
                "description": "Analyze Sixth house transits and design karmic adjustments & energetic remedies.",
                "features": ["Sixth & Eighth House Transit Analysis", "Chakra Alignment & Energetic Remedies", "Ayurvedic & Mindful Routines", "Mahamrityunjaya Mantra Guide"],
                "is_popular": False,
                "is_active": True
            },
            {
                "tier_key": "life",
                "title": "Complete Life Reading",
                "price_inr": 2499,
                "duration": "90 Minutes",
                "description": "Full 360° birth chart transit briefing, Vimshottari Dasha, Sade Sati & 5-year outlook.",
                "features": ["Full 12-House Kundali & Lagna Analysis", "Sade Sati, Rahu-Ketu & Dasha Breakdown", "Career, Wealth & Marriage Synchronization", "Custom Gemstone, Yantra & Remedy Plan", "Unlimited Q&A & Session Audio Notes"],
                "is_popular": True,
                "is_active": True
            }
        ]

        for t_data in live_tiers:
            existing = db.query(ConsultationTier).filter(ConsultationTier.tier_key == t_data["tier_key"]).first()
            if not existing:
                new_tier = ConsultationTier(**t_data)
                db.add(new_tier)
            # Do NOT overwrite existing.price_inr, duration or details so Admin customizations persist permanently!
        db.commit()
        print("[SEED] Consultation tiers synchronized successfully.")

        # 5. Seed Testimonials if none exist
        from backend.models.schemas import Testimonial
        if db.query(Testimonial).count() == 0:
            sample_testimonials = [
                Testimonial(name="Aarav Sharma", zodiac_sign="Cancer Moon", rating=5, category="Kundali Reading", comment="The Kundali reading felt deeply considered and beautifully rendered. It's rare to see this much care and precision in a modern astrology application."),
                Testimonial(name="Meera Patel", zodiac_sign="Libra Ascendant", rating=5, category="Numerology", comment="Numerology finally clicked for me. The charts, calculators, and detailed breakdowns are a stroke of genius. Highly recommended!"),
                Testimonial(name="Vikram Malhotra", zodiac_sign="Scorpio Sun", rating=5, category="Astrology Consultation", comment="GrahGanit reads like a love letter to ancient Vedic traditions — built with the clean polish and responsiveness of a top-tier modern product."),
                Testimonial(name="Sarah Jenkins", zodiac_sign="Taurus Moon", rating=5, category="Kundali Reading", comment="I was blown away by the accuracy and the aesthetics of the birth chart explorer. It's both a tool for reflection and a work of art."),
                Testimonial(name="Rajesh Kumar", zodiac_sign="Leo Lagna", rating=5, category="Daily Horoscope", comment="The consultation and daily horoscopes have become a vital part of my morning routine. Accurate calculations and thoughtful guidance.")
            ]
            db.add_all(sample_testimonials)
            db.commit()
            print("[SEED] Initial testimonials populated successfully.")

        db.close()
    except Exception as err:
        print(f"[SEED ERROR]: {err}")

@app.get("/health")
def health_check():
    return {"status": "ok", "engine": "Spiritual Knowledge Engine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
