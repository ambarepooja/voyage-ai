import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_otp_email(email_to: str, otp_code: str) -> bool:
    """
    Sends an OTP verification email to the user via SMTP.
    If SMTP settings are not provided in settings/env, logs the OTP code for local dev/testing.
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
                Enter this 6-digit code on the verification screen. This code will expire in <strong>15 minutes</strong>.
            </p>
            
            <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 24px 0;" />
            <p style="color: #71717a; font-size: 12px; margin: 0;">
                If you did not create an account with Voyage AI, you can safely ignore this email.
            </p>
        </div>
    </body>
    </html>
    """
    
    text_content = f"Your Voyage AI verification code is: {otp_code}. This code expires in 15 minutes."

    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.info(f"SMTP not fully configured. Console OTP for {email_to}: {otp_code}")
        print(f"\n==================================================")
        print(f"📧 EMAIL SENDER [To: {email_to}]")
        print(f"Subject: {subject}")
        print(f"OTP Code: {otp_code}")
        print(f"Notice: Configure SMTP_HOST, SMTP_USER, SMTP_PASSWORD in .env for live email delivery.")
        print(f"==================================================\n")
        return False

    sender_email = settings.EMAILS_FROM_EMAIL or settings.SMTP_USER
    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.EMAILS_FROM_NAME} <{sender_email}>"
    msg["To"] = email_to

    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    try:
        if settings.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(sender_email, [email_to], msg.as_string())
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                if settings.SMTP_TLS:
                    server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(sender_email, [email_to], msg.as_string())
        
        logger.info(f"OTP email sent successfully to {email_to}")
        print(f"✅ OTP email sent successfully to {email_to}")
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email_to}: {e}")
        print(f"❌ Failed to send OTP email to {email_to}: {e}")
        print(f"Console fallback OTP for {email_to}: {otp_code}")
        return False
