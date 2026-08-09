import random
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.core import security
from app.core.config import settings
from app.models.otp import OTP
from app.models.profile import Profile
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import OTPVerify, UserCreate, UserLogin, ProfileUpdate
from app.schemas.user import User as UserSchema
from app.utils.email import send_otp_email

router = APIRouter()

class OTPResendRequest(BaseModel):
    email: str

@router.post("/signup", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    clean_phone = user_in.phone_number.strip().replace('+', '').replace('-', '').replace(' ', '')
    if len(clean_phone) != 10 or not clean_phone.isdigit():
        raise HTTPException(status_code=400, detail="Mobile number must be exactly 10 digits.")

    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        if user.is_active:
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists in the system.",
            )
        else:
            # User registered previously but never completed OTP verification.
            user.hashed_password = security.get_password_hash(user_in.password)  # type: ignore
            profile = db.query(Profile).filter(Profile.user_id == user.id).first()
            if profile:
                profile.first_name = user_in.first_name  # type: ignore
                profile.last_name = user_in.last_name  # type: ignore
                profile.phone_number = user_in.phone_number  # type: ignore
    else:
        user = User(
            email=user_in.email,
            hashed_password=security.get_password_hash(user_in.password),
            is_active=False,
        )  # type: ignore
        db.add(user)
        db.flush() # flush to get user.id

        profile = Profile(
            user_id=user.id,
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            phone_number=user_in.phone_number
        )  # type: ignore
        db.add(profile)
    
    # Generate OTP (10-minute validity)
    otp_code = str(random.randint(100000, 999999))
    otp_entry = OTP(
        user_id=user.id,
        code=otp_code,
        otp_type='email',
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
    )  # type: ignore
    db.add(otp_entry)
    
    db.commit()
    db.refresh(user)
    
    # Dispatch OTP email to user
    background_tasks.add_task(send_otp_email, user.email, otp_code)
    
    user_response = UserSchema.model_validate(user).model_dump()
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if profile:
        user_response["first_name"] = profile.first_name
        user_response["last_name"] = profile.last_name
        user_response["phone_number"] = profile.phone_number
        user_response["avatar_url"] = profile.avatar_url

    return user_response

@router.post("/resend-otp")
def resend_otp(data: OTPResendRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_active:
        raise HTTPException(status_code=400, detail="Account is already verified")

    otp_code = str(random.randint(100000, 999999))
    otp_entry = OTP(
        user_id=user.id,
        code=otp_code,
        otp_type='email',
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
    )  # type: ignore
    db.add(otp_entry)
    db.commit()

    background_tasks.add_task(send_otp_email, user.email, otp_code)
    
    return {"message": "A new verification OTP code has been sent to your email."}

@router.post("/verify-otp")
def verify_otp(otp_data: OTPVerify, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == otp_data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")
        
    if user.is_active:
        raise HTTPException(status_code=400, detail="User account is already active and verified")
        
    otp_entry = db.query(OTP).filter(
        OTP.user_id == user.id,
        OTP.code == otp_data.code,
        OTP.is_used == False
    ).order_by(OTP.id.desc()).first()
    
    if not otp_entry:
        raise HTTPException(status_code=400, detail="Invalid OTP verification code entered.")
        
    now_utc = datetime.now(timezone.utc)
    
    if otp_entry.expires_at is not None:
        exp = otp_entry.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if now_utc > exp:
            raise HTTPException(status_code=400, detail="This verification OTP has expired. Please click 'Resend OTP' to receive a fresh code.")
            
    if otp_entry.created_at is not None:
        created = otp_entry.created_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        if (now_utc - created).total_seconds() > 600:
            raise HTTPException(status_code=400, detail="This verification OTP has expired (10-minute limit exceeded). Please click 'Resend OTP'.")
            
    otp_entry.is_used = True  # type: ignore
    user.is_active = True  # type: ignore
    db.commit()
    
    return {"message": "Account verified successfully"}

ADMIN_EMAILS = {"ambarepooja8003@gmail.com", "kokanerohit07@gmail.com"}

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not security.verify_password(user_in.password, user.hashed_password):  # type: ignore
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(
            status_code=400, 
            detail="Account is not verified yet. Please complete OTP verification or click Sign Up again to receive a fresh OTP."
        )
    
    # Ensure superuser privileges for designated admin accounts or first user
    if not user.is_superuser:
        if db.query(User).filter(User.is_superuser == True).count() == 0 or user.email.lower() in ADMIN_EMAILS:
            user.is_superuser = True
            db.commit()
            db.refresh(user)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user.id, expires_delta=access_token_expires
    )
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = security.create_refresh_token(
        user.id, expires_delta=refresh_token_expires
    )

    user_dict = UserSchema.model_validate(user).model_dump()
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if profile:
        user_dict["first_name"] = profile.first_name
        user_dict["last_name"] = profile.last_name
        user_dict["phone_number"] = profile.phone_number
        user_dict["avatar_url"] = profile.avatar_url

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_dict
    }

@router.get("/me", response_model=UserSchema)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_superuser:
        if db.query(User).filter(User.is_superuser == True).count() == 0 or current_user.email.lower() in ADMIN_EMAILS:
            current_user.is_superuser = True
            db.commit()
            db.refresh(current_user)

    user_data = UserSchema.model_validate(current_user).model_dump()
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile:
        user_data["first_name"] = profile.first_name
        user_data["last_name"] = profile.last_name
        user_data["phone_number"] = profile.phone_number
        user_data["avatar_url"] = profile.avatar_url
    return user_data

@router.put("/profile", response_model=UserSchema)
def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Update email if modified
    if profile_in.email and profile_in.email.strip().lower() != current_user.email.lower():
        new_email = profile_in.email.strip().lower()
        existing = db.query(User).filter(User.email == new_email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="This email address is already in use by another account.")
        current_user.email = new_email

    # 2. Update password if requested
    if profile_in.new_password:
        if not profile_in.current_password:
            raise HTTPException(status_code=400, detail="Current password is required to set a new password.")
        if not security.verify_password(profile_in.current_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="The current password you entered is incorrect.")
        if len(profile_in.new_password) < 6:
            raise HTTPException(status_code=400, detail="New password must be at least 6 characters long.")
        current_user.hashed_password = security.get_password_hash(profile_in.new_password)

    # 3. Update profile fields
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    if profile_in.first_name is not None:
        profile.first_name = profile_in.first_name.strip()
    if profile_in.last_name is not None:
        profile.last_name = profile_in.last_name.strip()
    if profile_in.phone_number is not None:
        clean_phone = profile_in.phone_number.strip().replace('+', '').replace('-', '').replace(' ', '')
        if clean_phone and (len(clean_phone) != 10 or not clean_phone.isdigit()):
            raise HTTPException(status_code=400, detail="Phone number must be exactly 10 digits.")
        profile.phone_number = clean_phone
    if profile_in.avatar_url is not None:
        profile.avatar_url = profile_in.avatar_url.strip()

    db.commit()
    db.refresh(current_user)
    if profile:
        db.refresh(profile)

    user_data = UserSchema.model_validate(current_user).model_dump()
    if profile:
        user_data["first_name"] = profile.first_name
        user_data["last_name"] = profile.last_name
        user_data["phone_number"] = profile.phone_number
        user_data["avatar_url"] = profile.avatar_url
    return user_data

@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    import base64
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image (PNG, JPG, JPEG, WebP, GIF).")
    
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image file size must be less than 5MB.")
    
    encoded = base64.b64encode(contents).decode("utf-8")
    data_url = f"data:{file.content_type};base64,{encoded}"
    
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        
    profile.avatar_url = data_url
    db.commit()
    db.refresh(profile)
    
    return {
        "avatar_url": data_url,
        "message": "Profile photo uploaded successfully! ✨"
    }

