import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_otp_email(email_to: str, otp_code: str) -> bool:
    """
    Sends an OTP verification email to the user via SMTP.
    If SMTP settings are not provided or error occurs, logs details.
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
    port = int(settings.SMTP_PORT or 587)
    use_tls = str(settings.SMTP_TLS).lower() in ['true', '1', 'yes', 't']

    if not host or not user or not password:
        logger.info(f"SMTP credentials missing. Host: '{host}', User: '{user}'. OTP for {email_to}: {otp_code}")
        print(f"\n[SMTP WARNING] Host/User/Pass missing. OTP for {email_to}: {otp_code}")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.EMAILS_FROM_NAME} <{from_email}>"
    msg["To"] = email_to

    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    try:
        if port == 465:
            with smtplib.SMTP_SSL(host, port, timeout=15) as server:
                server.login(user, password)
                server.sendmail(from_email, [email_to], msg.as_string())
        else:
            with smtplib.SMTP(host, port, timeout=15) as server:
                server.ehlo()
                if use_tls:
                    server.starttls()
                    server.ehlo()
                server.login(user, password)
                server.sendmail(from_email, [email_to], msg.as_string())
        
        logger.info(f"✅ OTP email successfully dispatched to {email_to}")
        print(f"✅ OTP email successfully dispatched to {email_to}")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to dispatch OTP email to {email_to}: {e}")
        print(f"❌ Failed to dispatch OTP email to {email_to}: {e}")
        print(f"🔑 Live Fallback OTP for {email_to}: {otp_code}")
        return False
