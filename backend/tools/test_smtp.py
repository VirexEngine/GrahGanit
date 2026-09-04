"""
Manual SMTP Diagnostic Tool for GrahGanit
Tests DNS resolution, TCP connectivity, TLS handshake, SMTP authentication,
and optionally transmits a test email when --send-test is specified.

Usage:
  python -m backend.tools.test_smtp --to user@example.com
  python -m backend.tools.test_smtp --to user@example.com --send-test
  python -m backend.tools.test_smtp --to user@example.com --host smtp3.netcore.co.in --port 587
"""

import sys
import os
import socket
import time
import argparse
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load local environment if present
load_dotenv()


def redact_email(email_address: str) -> str:
    if not email_address or "@" not in email_address:
        return "[REDACTED_EMAIL]"
    parts = email_address.split("@", 1)
    user_part, domain_part = parts[0], parts[1]
    if len(user_part) <= 2:
        masked = user_part[0] + "*"
    else:
        masked = user_part[0] + ("*" * (len(user_part) - 2)) + user_part[-1]
    return f"{masked}@{domain_part}"


def main():
    parser = argparse.ArgumentParser(description="GrahGanit SMTP Diagnostic Tool")
    parser.add_argument("--to", required=True, help="Recipient email address for diagnostics")
    parser.add_argument("--host", default=os.getenv("SMTP_HOST", ""), help="SMTP host (default: from env)")
    parser.add_argument("--port", type=int, default=int(os.getenv("SMTP_PORT", 587)), help="SMTP port (default: from env or 587)")
    parser.add_argument("--user", default=os.getenv("SMTP_USERNAME", ""), help="SMTP username (default: from env)")
    parser.add_argument("--from-addr", default=os.getenv("EMAIL_FROM", ""), help="Sender address (default: from env)")
    parser.add_argument("--timeout", type=float, default=float(os.getenv("SMTP_TIMEOUT", 15)), help="Timeout in seconds (default: 15)")
    parser.add_argument("--send-test", action="store_true", help="Send actual test email. If omitted, stops after authentication.")

    args = parser.parse_args()

    host = args.host.strip()
    port = args.port
    user = args.user.strip()
    password = os.getenv("SMTP_PASSWORD", "").strip()
    timeout = args.timeout if args.timeout > 0 else 15.0
    recipient = args.to.strip()
    redacted_to = redact_email(recipient)

    print("=" * 65)
    print("       GRAHGANIT SMTP DIAGNOSTIC ENGINE")
    print("=" * 65)
    print(f"Target Recipient (Redacted): {redacted_to}")
    print(f"Configured Host            : {host or '[NOT SET]'}")
    print(f"Configured Port            : {port}")
    print(f"Configured User            : {user or '[NOT SET / ANONYMOUS]'}")
    print(f"Password Provided          : {'[YES]' if password else '[NO]'}")
    print(f"Socket Timeout             : {timeout}s")
    print(f"Send Live Message          : {'YES (--send-test enabled)' if args.send_test else 'NO (Connection & Auth test only)'}")
    print("-" * 65)

    if not host:
        print("[FAIL] DNS resolution failed: SMTP_HOST is not configured.")
        sys.exit(1)

    # 1. DNS Resolution
    print("[1/5] Testing DNS / Hostname resolution...")
    t0 = time.time()
    try:
        ip_list = socket.gethostbyname_ex(host)[2]
        dns_time = (time.time() - t0) * 1000
        print(f"      [OK] Host resolved to {len(ip_list)} IP(s) in {dns_time:.1f}ms: {ip_list[0]}")
    except socket.gaierror as e:
        print(f"      [FAIL] DNS resolution failed: Could not resolve hostname '{host}': {e}")
        sys.exit(1)

    # 2. TCP Connection & Latency
    print(f"[2/5] Testing TCP connection to {host}:{port}...")
    t0 = time.time()
    try:
        sock = socket.create_connection((host, port), timeout=timeout)
        tcp_time = (time.time() - t0) * 1000
        sock.close()
        print(f"      [OK] TCP socket connected successfully in {tcp_time:.1f}ms.")
    except socket.timeout:
        print(f"      [FAIL] TCP connection timed out after {timeout}s. Verify firewalls and port status.")
        sys.exit(1)
    except Exception as e:
        print(f"      [FAIL] TCP connection failed: {e}")
        sys.exit(1)

    # 3. Protocol Selection & TLS Handshake
    protocol = "SSL" if port == 465 else "STARTTLS"
    print(f"[3/5] Negotiating SMTP handshake & {protocol} encryption...")
    t0 = time.time()
    server = None
    try:
        if port == 465:
            server = smtplib.SMTP_SSL(host, port, timeout=timeout)
            tls_time = (time.time() - t0) * 1000
            print(f"      [OK] SSL/TLS tunnel established on port 465 in {tls_time:.1f}ms.")
        else:
            server = smtplib.SMTP(host, port, timeout=timeout)
            server.ehlo()
            if port in (587, 25) or server.has_extn("starttls"):
                server.starttls()
                server.ehlo()
                tls_time = (time.time() - t0) * 1000
                print(f"      [OK] STARTTLS handshake completed in {tls_time:.1f}ms.")
            else:
                print("      [NOTE] STARTTLS not supported or advertised; using plain SMTP.")
    except Exception as e:
        print(f"      [FAIL] TLS negotiation failed: {e.__class__.__name__}: {e}")
        if server:
            try:
                server.close()
            except Exception:
                pass
        sys.exit(1)

    # 4. Authentication
    print("[4/5] Verifying SMTP authentication...")
    if user and password:
        try:
            server.login(user, password)
            print("      [OK] SMTP authentication successful with provided credentials.")
        except smtplib.SMTPAuthenticationError as e:
            print(f"      [FAIL] SMTP authentication failed: Server rejected credentials ({e.smtp_code}).")
            server.close()
            sys.exit(1)
        except Exception as e:
            print(f"      [FAIL] SMTP authentication failed: {e.__class__.__name__}: {e}")
            server.close()
            sys.exit(1)
    elif user or password:
        print("      [WARNING] Partial credentials specified (only user or password). Skipping login.")
    else:
        print("      [INFO] No credentials configured. Continuing unauthenticated.")

    # 5. Optional Email Transmission
    if not args.send_test:
        print("[5/5] Skipping email transmission (use --send-test to send an actual message).")
        server.quit()
        print("-" * 65)
        print("SUCCESS: SMTP server connection, encryption, and authentication verified.")
        sys.exit(0)

    print(f"[5/5] Sending test diagnostic email to {redacted_to}...")
    sender = args.from_addr.strip()
    if not sender:
        sender = f"GrahGanit Observatory <{user}>" if user else f"noreply@{host}"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "GrahGanit SMTP Diagnostic Test"
    msg["From"] = sender
    msg["To"] = recipient

    plain_content = (
        "GrahGanit SMTP Diagnostic Test\n"
        "This is an automated diagnostic verification message to confirm SMTP transmission.\n"
        f"Server: {host}:{port} ({protocol})\n"
        f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}\n"
    )
    html_content = f"""
    <html>
      <body style="font-family: sans-serif; background: #0b0c1b; color: #ffffff; padding: 20px;">
        <h2 style="color: #f59e0b;">✦ GrahGanit SMTP Diagnostic Test</h2>
        <p>This automated message confirms that the GrahGanit SMTP transport is working properly.</p>
        <ul>
          <li><strong>Host:</strong> {host}:{port}</li>
          <li><strong>Protocol:</strong> {protocol}</li>
          <li><strong>Timestamp:</strong> {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}</li>
        </ul>
      </body>
    </html>
    """
    msg.attach(MIMEText(plain_content, "plain", "utf-8"))
    msg.attach(MIMEText(html_content, "html", "utf-8"))

    try:
        server.sendmail(sender, recipient, msg.as_string())
        server.quit()
        print(f"      [OK] Test email successfully accepted by {host} for {redacted_to}.")
        print("-" * 65)
        print("SUCCESS: Full SMTP round-trip test passed successfully.")
        sys.exit(0)
    except smtplib.SMTPSenderRefused as e:
        print(f"      [FAIL] SMTP server rejected sender address: {e.smtp_code} {e.smtp_error}")
        server.close()
        sys.exit(1)
    except smtplib.SMTPRecipientsRefused as e:
        print(f"      [FAIL] SMTP server rejected recipient: {e.smtp_code} {e.smtp_error}")
        server.close()
        sys.exit(1)
    except smtplib.SMTPDataError as e:
        print(f"      [FAIL] SMTP server rejected message data: {e.smtp_code} {e.smtp_error}")
        server.close()
        sys.exit(1)
    except Exception as e:
        print(f"      [FAIL] SMTP delivery failed: {e.__class__.__name__}: {e}")
        try:
            server.close()
        except Exception:
            pass
        sys.exit(1)


if __name__ == "__main__":
    main()
