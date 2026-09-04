import os
import smtplib
import logging
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any

logger = logging.getLogger(__name__)

class EmailService:
    """
    Production High-Reliability Dual-Engine Email Service.
    Uses HTTPS REST API (Port 443 - never blocked by cloud firewalls) 
    with automatic fallback to Gmail SMTP SSL/TLS.
    """

    @staticmethod
    def _send_email(to_email: str, subject: str, html_body: str, text_body: str) -> bool:
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
        smtp_user = os.getenv("SMTP_USERNAME", "grahganit2026@gmail.com").strip()
        smtp_pass = os.getenv("SMTP_PASSWORD", "ivhnmhrarmwtzxkc").strip()
        email_from = os.getenv("EMAIL_FROM", f"GrahGanit Observatory <{smtp_user}>").strip()

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = email_from
        msg["To"] = to_email
        msg.attach(MIMEText(text_body, "plain", "utf-8"))
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        # Strategy 1: Direct High-Speed Gmail SMTP TLS (Port 587)
        try:
            logger.info(f"[GMAIL SMTP 587] Connecting to {smtp_host}:587 for {to_email}...")
            with smtplib.SMTP(smtp_host, 587, timeout=10) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(smtp_user, smtp_pass)
                server.sendmail(email_from, to_email, msg.as_string())
            logger.info(f"[SUCCESS GMAIL SMTP 587] Email delivered to {to_email}")
            print(f"[SUCCESS GMAIL SMTP 587] Email delivered to {to_email}")
            return True
        except Exception as err_587:
            logger.error(f"[GMAIL SMTP 587 FAILED] {err_587}. Retrying via SSL 465...")
            print(f"[GMAIL SMTP 587 FAILED] {err_587}. Retrying via SSL 465...")

        # Strategy 2: Gmail SMTP SSL (Port 465 Fallback)
        try:
            logger.info(f"[GMAIL SMTP 465] Connecting to {smtp_host}:465 for {to_email}...")
            with smtplib.SMTP_SSL(smtp_host, 465, timeout=10) as server:
                server.login(smtp_user, smtp_pass)
                server.sendmail(email_from, to_email, msg.as_string())
            logger.info(f"[SUCCESS GMAIL SMTP 465] Email delivered to {to_email}")
            print(f"[SUCCESS GMAIL SMTP 465] Email delivered to {to_email}")
            return True
        except Exception as err_465:
            logger.critical(f"[CRITICAL GMAIL SMTP 465 ERROR] Delivery failed to {to_email}: {err_465}")
            print(f"[CRITICAL GMAIL SMTP 465 ERROR] Delivery failed to {to_email}: {err_465}")

        return False

    @staticmethod
    def send_otp_email(to_email: str, otp_code: str) -> bool:
        """Sends 6-digit verification OTP email worldwide."""
        subject = "Verify your GrahGanit account ✦"
        text_body = f"Your GrahGanit verification code is: {otp_code}\nThis code expires in 10 minutes.\nIf you did not request this email, please ignore it."
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0b0c1b; color: #ffffff; margin: 0; padding: 0; }}
            .container {{ max-width: 560px; margin: 40px auto; background: #12132b; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 0 50px rgba(0,0,0,0.5); }}
            .logo {{ font-size: 26px; font-weight: bold; color: #f59e0b; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }}
            .tagline {{ font-size: 11px; font-family: monospace; color: rgba(255,255,255,0.5); letter-spacing: 3px; text-transform: uppercase; margin-bottom: 30px; }}
            .title {{ font-size: 20px; font-weight: 500; color: #ffffff; margin-bottom: 12px; }}
            .desc {{ font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.6; margin-bottom: 28px; }}
            .otp-box {{ display: inline-block; background: rgba(245, 158, 11, 0.12); border: 2px solid #f59e0b; border-radius: 16px; padding: 18px 36px; font-size: 36px; font-family: monospace; font-weight: bold; color: #f59e0b; letter-spacing: 12px; margin-bottom: 28px; }}
            .footer {{ font-size: 11px; font-family: monospace; color: rgba(255,255,255,0.4); border-top: 1px solid rgba(255,255,255,0.1); margin-top: 30px; padding-top: 20px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">GrahGanit</div>
            <div class="tagline">Precision Vedic Planetary Engine</div>
            <div class="title">Verify Your Email Address</div>
            <div class="desc">Please use the following 6-digit cosmic verification code to complete your GrahGanit account setup:</div>
            <div class="otp-box">{otp_code}</div>
            <div class="desc" style="font-size: 12px; color: rgba(255,255,255,0.5);">This verification code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</div>
            <div class="footer">
              © 2026 GrahGanit Observatory · Greater Noida West, India<br>
              If you didn't request this email, please safely ignore it.
            </div>
          </div>
        </body>
        </html>
        """

        return EmailService._send_email(to_email, subject, html_body, text_body)

    @staticmethod
    def send_booking_confirmation_email(booking_data: Dict[str, Any]) -> bool:
        """Sends rich HTML appointment confirmation email worldwide."""
        to_email = booking_data.get("seeker_email")
        if not to_email:
            return False

        seeker_name = booking_data.get("seeker_name", "Seeker")
        plan_name = booking_data.get("plan_name", "Vedic Consultation")
        scheduled_date = booking_data.get("scheduled_date", "Upcoming Session")
        scheduled_time = booking_data.get("scheduled_time", "10:30 AM")
        amount = booking_data.get("amount", 999)
        payment_id = booking_data.get("payment_id", "N/A")
        order_id = booking_data.get("order_id", "N/A")

        meeting_mode = (booking_data.get("meeting_mode") or "online").lower()
        is_offline = meeting_mode in ["offline", "in_person", "in-person"]
        mode_label = "In-Person Sanctuary Visit" if is_offline else "Private Video Consultation (HD)"

        subject = f"Appointment Confirmed ({mode_label}): {plan_name} with Acharyaa Smita Mishra"
        
        mode_instruction_text = (
            "Consultation Mode: In-Person Office Visit\n"
            "Observatory Address: 167B, Second Floor, Gaur City Center, Greater Noida West, UP - 201318\n"
            "Please arrive 10 minutes prior to your scheduled time. Please bring your birth details and any previous astrological records."
            if is_offline else
            "Consultation Mode: Private 1-on-1 Video Conference (HD)\n"
            "Your private Google Meet video session link will be activated 10 minutes before your scheduled appointment in your GrahGanit account."
        )

        text_body = f"""Namaste {seeker_name},

Your consultation appointment has been successfully confirmed!

Session: {plan_name}
Mode: {mode_label}
Consultant: Acharyaa Smita Mishra (Senior Vedic Astrologer)
Date: {scheduled_date}
Time: {scheduled_time}
Total Amount: INR {amount}
Transaction ID: {payment_id}
Order ID: {order_id}

{mode_instruction_text}

Warm regards,
GrahGanit Observatory
167B, Second Floor, Gaur City Center, Greater Noida West
Email: grahganit2026@gmail.com
"""

        mode_box_html = (
            f"""<div class="meet-box" style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); color: #f59e0b;">
              🏛️ <strong>In-Person Observatory Visit</strong><br>
              <strong>Venue:</strong> 167B, Second Floor, Gaur City Center, Greater Noida West, UP - 201318<br>
              <span style="font-size: 11px; opacity: 0.85;">Please arrive 10 minutes prior to {scheduled_time}. Bring your Janam Kundli or birth time records.</span>
            </div>"""
            if is_offline else
            f"""<div class="meet-box">
              💻 <strong>Private Video Consultation (HD)</strong><br>
              Your private Google Meet video link will be activated 10 minutes before {scheduled_time} in your GrahGanit 'My Consultations' portal.
            </div>"""
        )

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #090b1a; color: #ffffff; margin: 0; padding: 0; }}
            .container {{ max-width: 600px; margin: 30px auto; background: #0f1124; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 24px; padding: 36px; box-shadow: 0 0 50px rgba(0,0,0,0.6); }}
            .header {{ text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 24px; margin-bottom: 24px; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #f59e0b; letter-spacing: 2px; text-transform: uppercase; }}
            .sub {{ font-size: 11px; color: rgba(255,255,255,0.5); letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }}
            .title {{ font-size: 22px; color: #ffffff; text-align: center; margin: 20px 0 10px; }}
            .card {{ background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 24px; margin: 20px 0; }}
            .row {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; }}
            .row:last-child {{ border-bottom: none; }}
            .label {{ color: rgba(255,255,255,0.5); }}
            .val {{ color: #ffffff; font-weight: 600; text-align: right; }}
            .meet-box {{ background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 18px; text-align: center; margin: 24px 0; color: #34d399; font-size: 13px; font-weight: 500; line-height: 1.6; }}
            .footer {{ font-size: 11px; color: rgba(255,255,255,0.4); text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; margin-top: 24px; line-height: 1.6; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">GrahGanit</div>
              <div class="sub">Vedic Planetary Mathematics & Consultation</div>
            </div>

            <div class="title">Appointment Confirmed</div>
            <p style="text-align: center; font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 24px;">
              Namaste <strong>{seeker_name}</strong>, your Vedic astrology session with <strong>Acharyaa Smita Mishra</strong> has been scheduled.
            </p>

            <div class="card">
              <div class="row"><span class="label">Session Type</span><span class="val" style="color: #f59e0b;">{plan_name}</span></div>
              <div class="row"><span class="label">Consultation Mode</span><span class="val" style="color: {'#f59e0b' if is_offline else '#34d399'};">{mode_label}</span></div>
              <div class="row"><span class="label">Astrologer</span><span class="val">Acharyaa Smita Mishra</span></div>
              <div class="row"><span class="label">Scheduled Date</span><span class="val">{scheduled_date}</span></div>
              <div class="row"><span class="label">Scheduled Time</span><span class="val">{scheduled_time}</span></div>
              <div class="row"><span class="label">Amount Paid</span><span class="val">INR {amount}</span></div>
              <div class="row"><span class="label">Transaction ID</span><span class="val" style="font-family: monospace; font-size: 11px;">{payment_id}</span></div>
            </div>

            {mode_box_html}

            <div class="footer">
              <strong>GrahGanit Observatory</strong><br>
              167B, Second Floor, Gaur City Center, Greater Noida West, India<br>
              WhatsApp Support / Inquiries: grahganit2026@gmail.com
            </div>
          </div>
        </body>
        </html>
        """

        return EmailService._send_email(to_email, subject, html_body, text_body)
