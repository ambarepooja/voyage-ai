import smtplib
import logging
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_otp_email(email_to: str, otp_code: str) -> bool:
    """
    Sends an OTP verification email to the user.
    Uses HTTPS API (Port 443) for Brevo/SendGrid to bypass cloud port 587 blocks,
    and falls back to SMTPS (Port 465) and SMTP (Port 587).
    """
    subject = f"{otp_code} is your Voyage AI verification code"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Verify your Voyage AI Account</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #09090b; color: #ffffff; padding: 40px 20px; margin: 0;">
        <div style="max-width: 480px; margin: 0 auto; background: linear-gradient(135deg, #18181b 0%, #09090b 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
            <div style="display: inline-block; background: rgba(99, 102, 241, 0.2); padding: 12px; border-radius: 16px; margin-bottom: 16px;">
                <span style="font-size: 32px;">✈️</span>
            </div>
            <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.5px;">Voyage AI</h1>
            <p style="color: #a1a1aa; font-size: 15px; margin: 0 0 28px 0;">Verify your email address to activate your account</p>
            
            <div style="background: rgba(255, 255, 255, 0.05); border: 1px dashed rgba(99, 102, 241, 0.4); border-radius: 16px; padding: 20px; margin-bottom: 28px;">
                <span style="font-family: monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #818cf8; text-shadow: 0 0 10px rgba(129, 140, 248, 0.3);">{otp_code}</span>
            </div>
            
            <p style="color: #a1a1aa; font-size: 13px; line-height: 1.6; margin-bottom: 24px;">
                Enter this 6-digit code on the verification screen. This code will expire in <strong>10 minutes</strong>.
            </p>
            
            <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 24px 0;" />
            <p style="color: #71717a; font-size: 12px; margin: 0;">
                If you did not create an account with Voyage AI, you can safely ignore this email.
            </p>
        </div>
    </body>
    </html>
    """
    
    text_content = f"Your Voyage AI verification code is: {otp_code}. This code expires in 10 minutes."

    host = str(settings.SMTP_HOST or '').strip()
    user = str(settings.SMTP_USER or '').strip()
    password = str(settings.SMTP_PASSWORD or '').strip()
    from_email = str(settings.EMAILS_FROM_EMAIL or user).strip()
    from_name = str(settings.EMAILS_FROM_NAME or 'Voyage AI').strip()
    port = int(settings.SMTP_PORT or 587)

    if not host or not user or not password:
        logger.info(f"SMTP credentials missing. Host: '{host}', User: '{user}'. OTP for {email_to}: {otp_code}")
        print(f"\n[SMTP WARNING] Credentials missing. OTP for {email_to}: {otp_code}")
        return False

    # Method 1: Try Brevo REST API over HTTPS (Port 443 - Never blocked on Render)
    api_key = settings.BREVO_API_KEY or (password if (password.startswith("xkeysib-") or "brevo" in host.lower()) else None)
    if api_key:
        try:
            headers = {
                "accept": "application/json",
                "api-key": api_key,
                "content-type": "application/json"
            }
            payload = {
                "sender": {"name": from_name, "email": from_email},
                "to": [{"email": email_to}],
                "subject": subject,
                "htmlContent": html_content,
                "textContent": text_content
            }
            response = requests.post("https://api.brevo.com/v3/smtp/email", json=payload, headers=headers, timeout=10)
            if response.status_code in [200, 201, 202]:
                logger.info(f"✅ OTP email delivered via Brevo HTTPS API to {email_to}")
                print(f"✅ OTP email delivered via Brevo HTTPS API to {email_to}")
                return True
            else:
                logger.warning(f"Brevo API response {response.status_code}: {response.text}")
                print(f"⚠️ Brevo API response {response.status_code}: {response.text}")
        except Exception as api_err:
            logger.warning(f"Brevo API attempt failed: {api_err}. Trying SMTP SSL fallback...")

    # Method 2: Standard SMTPS / SMTP
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = email_to
    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    # Try Port 465 (SSL) first if Render blocks 587
    for target_port, is_ssl in [(465, True), (port, port == 465)]:
        try:
            if is_ssl:
                with smtplib.SMTP_SSL(host, target_port, timeout=10) as server:
                    server.login(user, password)
                    server.sendmail(from_email, [email_to], msg.as_string())
            else:
                with smtplib.SMTP(host, target_port, timeout=10) as server:
                    server.ehlo()
                    server.starttls()
                    server.ehlo()
                    server.login(user, password)
                    server.sendmail(from_email, [email_to], msg.as_string())
            
            logger.info(f"✅ OTP email delivered via SMTP (port {target_port}) to {email_to}")
            print(f"✅ OTP email delivered via SMTP (port {target_port}) to {email_to}")
            return True
        except Exception as smtp_err:
            logger.warning(f"SMTP port {target_port} failed: {smtp_err}")

    print(f"❌ Failed to dispatch OTP email to {email_to}")
    print(f"🔑 Live Fallback OTP for {email_to}: {otp_code}")
    return False
