from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Any, Optional
from app.api.deps import get_db
from app.models.user import User
from app.models.trip import Trip
from app.models.expense import Expense
from app.models.profile import Profile
from app.models.otp import OTP
from app.models.notification import Notification
from app.models.saved_place import SavedPlace
from app.models.hotel_booking import HotelBooking
from app.models.flight_booking import FlightBooking
from app.trips.router import get_current_user
from pydantic import BaseModel

router = APIRouter()

def get_current_superuser(current_user: User = Depends(get_current_user)):
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

class AdminUserResponse(BaseModel):
    id: int
    email: str
    is_active: bool
    is_superuser: bool
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None
    
    class Config:
        from_attributes = True

@router.get("/users", response_model=List[AdminUserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    users = db.query(User).all()
    result = []
    for u in users:
        profile = db.query(Profile).filter(Profile.user_id == u.id).first()
        result.append({
            "id": u.id,
            "email": u.email,
            "is_active": u.is_active,
            "is_superuser": u.is_superuser,
            "first_name": profile.first_name if profile else None,
            "last_name": profile.last_name if profile else None,
            "phone_number": profile.phone_number if profile else None,
            "avatar_url": profile.avatar_url if profile else None
        })
    return result

# Can't use exact schemas if they don't have all fields, so we return Any or a dict for now.
class AdminTripCreate(BaseModel):
    user_id: int
    title: str
    destination: str
    start_date: Any
    end_date: Any
    budget: Optional[int] = 0

class AdminTripUpdate(BaseModel):
    title: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[Any] = None
    end_date: Optional[Any] = None
    budget: Optional[int] = None

@router.get("/trips")
def get_all_trips(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    query = db.query(Trip)
    if user_id is not None:
        query = query.filter(Trip.user_id == user_id)
    
    trips = query.order_by(Trip.id.desc()).all()
    
    result = []
    for t in trips:
        user = db.query(User).filter(User.id == t.user_id).first()
        profile = db.query(Profile).filter(Profile.user_id == t.user_id).first()
        user_name = f"{profile.first_name} {profile.last_name}".strip() if profile and (profile.first_name or profile.last_name) else "No Name"
        
        result.append({
            "id": t.id,
            "title": t.title,
            "destination": t.destination,
            "start_date": t.start_date,
            "end_date": t.end_date,
            "budget": t.budget,
            "user_id": t.user_id,
            "user_email": user.email if user else "Unknown",
            "user_name": user_name,
            "user_avatar": profile.avatar_url if profile else None
        })
    return result

def parse_date_safe(val):
    if not val:
        return None
    if isinstance(val, str):
        try:
            return datetime.strptime(val.split('T')[0], "%Y-%m-%d").date()
        except Exception:
            return None
    if isinstance(val, datetime):
        return val.date()
    return val

@router.post("/trips", status_code=status.HTTP_201_CREATED)
def create_trip_for_user(
    trip_in: AdminTripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    target_user = db.query(User).filter(User.id == trip_in.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")
        
    trip = Trip(
        user_id=trip_in.user_id,
        title=trip_in.title,
        destination=trip_in.destination,
        start_date=parse_date_safe(trip_in.start_date),
        end_date=parse_date_safe(trip_in.end_date),
        budget=trip_in.budget or 0
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip

@router.put("/trips/{trip_id}")
def update_trip_admin(
    trip_id: int,
    trip_in: AdminTripUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    if trip_in.title is not None:
        trip.title = trip_in.title  # type: ignore
    if trip_in.destination is not None:
        trip.destination = trip_in.destination  # type: ignore
    if trip_in.start_date is not None:
        trip.start_date = parse_date_safe(trip_in.start_date)  # type: ignore
    if trip_in.end_date is not None:
        trip.end_date = parse_date_safe(trip_in.end_date)  # type: ignore
    if trip_in.budget is not None:
        trip.budget = trip_in.budget  # type: ignore
        
    db.commit()
    db.refresh(trip)
    return trip

@router.delete("/trips/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip_admin(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    # Delete associated expenses
    db.query(Expense).filter(Expense.trip_id == trip_id).delete()
    db.delete(trip)
    db.commit()
    return None

class AdminExpenseCreate(BaseModel):
    user_id: int
    trip_id: Optional[int] = None
    title: str
    amount: float
    category: str = "General"
    date: Optional[Any] = None

class AdminExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[Any] = None
    trip_id: Optional[int] = None

@router.get("/expenses")
def get_all_expenses(
    user_id: Optional[int] = None,
    trip_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    query = db.query(Expense)
    if user_id is not None:
        query = query.filter(Expense.user_id == user_id)
    if trip_id is not None:
        query = query.filter(Expense.trip_id == trip_id)
    expenses = query.order_by(Expense.id.desc()).all()
    if user_id is not None:
        query = query.filter(Expense.user_id == user_id)
    if trip_id is not None:
        query = query.filter(Expense.trip_id == trip_id)
    expenses = query.order_by(Expense.id.desc()).all()

    result = []
    for e in expenses:
        user = db.query(User).filter(User.id == e.user_id).first()
        profile = db.query(Profile).filter(Profile.user_id == e.user_id).first()
        trip = db.query(Trip).filter(Trip.id == e.trip_id).first() if e.trip_id else None
        user_name = f"{profile.first_name} {profile.last_name}".strip() if profile and (profile.first_name or profile.last_name) else "No Name"

        result.append({
            "id": e.id,
            "user_id": e.user_id,
            "user_email": user.email if user else "Unknown",
            "user_name": user_name,
            "user_avatar": profile.avatar_url if profile else None,
            "trip_id": e.trip_id,
            "trip_title": trip.title if trip else "General User Expense",
            "title": e.title or getattr(e, 'description', 'Expense Item'),
            "amount": float(e.amount),
            "category": e.category or "General",
            "date": str(e.date) if e.date else None
        })
    return result

@router.post("/expenses", status_code=status.HTTP_201_CREATED)
def create_expense_admin(
    expense_in: AdminExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    user = db.query(User).filter(User.id == expense_in.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")
        
    if expense_in.trip_id:
        trip = db.query(Trip).filter(Trip.id == expense_in.trip_id).first()
        if not trip:
            raise HTTPException(status_code=404, detail="Selected trip not found")

    date_val = None
    if expense_in.date:
        try:
            if isinstance(expense_in.date, str):
                date_val = datetime.strptime(expense_in.date.split('T')[0], "%Y-%m-%d").date()
            else:
                date_val = expense_in.date
        except Exception:
            date_val = None

    expense = Expense(
        user_id=expense_in.user_id,
        trip_id=expense_in.trip_id if expense_in.trip_id else None,
        title=expense_in.title,
        amount=expense_in.amount,
        category=expense_in.category or "General",
        date=date_val
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.put("/expenses/{expense_id}")
def update_expense_admin(
    expense_id: int,
    expense_in: AdminExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    if expense_in.title is not None:
        expense.title = expense_in.title  # type: ignore
    if expense_in.amount is not None:
        expense.amount = expense_in.amount  # type: ignore
    if expense_in.category is not None:
        expense.category = expense_in.category  # type: ignore
    if expense_in.date is not None:
        expense.date = parse_date_safe(expense_in.date)  # type: ignore
    if expense_in.trip_id is not None:
        expense.trip_id = expense_in.trip_id  # type: ignore

    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense_admin(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    title = expense.title or ""
    if "[VOY-FLT-" in title:
        try:
            ref_match = title.split("[")[1].split("]")[0]
            db.query(FlightBooking).filter(
                FlightBooking.booking_reference == ref_match
            ).delete()
        except Exception:
            pass
    elif "[VOY-HTL-" in title:
        try:
            ref_match = title.split("[")[1].split("]")[0]
            db.query(HotelBooking).filter(
                HotelBooking.booking_reference == ref_match
            ).delete()
        except Exception:
            pass

    db.delete(expense)
    db.commit()
    return None

@router.get("/profiles")
def get_all_profiles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    profiles = db.query(Profile).all()
    result = []
    for p in profiles:
        user = db.query(User).filter(User.id == p.user_id).first()
        result.append({
            "id": p.id,
            "user_id": p.user_id,
            "user_email": user.email if user else "Unknown",
            "first_name": p.first_name,
            "last_name": p.last_name,
            "phone_number": p.phone_number,
            "avatar_url": p.avatar_url
        })
    return result

@router.get("/otps")
def get_all_otps(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    otps = db.query(OTP).order_by(OTP.id.desc()).all()
    now_utc = datetime.now(timezone.utc)
    
    result = []
    for o in otps:
        user = db.query(User).filter(User.id == o.user_id).first()
        profile = db.query(Profile).filter(Profile.user_id == o.user_id).first()
        user_name = f"{profile.first_name} {profile.last_name}".strip() if profile and (profile.first_name or profile.last_name) else "No Name"
        
        expires_at_dt = o.expires_at
        if expires_at_dt:
            if expires_at_dt.tzinfo is None:
                expires_at_dt = expires_at_dt.replace(tzinfo=timezone.utc)

        created_at_dt = o.created_at
        if created_at_dt:
            if created_at_dt.tzinfo is None:
                created_at_dt = created_at_dt.replace(tzinfo=timezone.utc)

        is_expired = False
        if expires_at_dt:
            is_expired = now_utc > expires_at_dt

        result.append({
            "id": o.id,
            "user_id": o.user_id,
            "user_email": user.email if user else "Unknown",
            "user_name": user_name,
            "user_avatar": profile.avatar_url if profile else None,
            "code": o.code,
            "is_used": o.is_used,
            "expires_at": expires_at_dt.isoformat() if expires_at_dt else None,
            "created_at": created_at_dt.isoformat() if created_at_dt else None,
            "is_expired": is_expired
        })
    return result

@router.get("/notifications")
def get_all_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    notifications = db.query(Notification).all()
    return [{"id": n.id, "user_id": n.user_id, "title": n.title, "message": n.message, "is_read": n.is_read} for n in notifications]

@router.get("/saved-places")
def get_all_saved_places(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    saved_places = db.query(SavedPlace).all()
    return [{"id": s.id, "user_id": s.user_id, "place_id": s.place_id, "name": s.name, "category": s.category} for s in saved_places]

@router.get("/hotels")
@router.get("/hotel-bookings")
def get_all_hotel_bookings(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    query = db.query(HotelBooking)
    if user_id is not None:
        query = query.filter(HotelBooking.user_id == user_id)
    bookings = query.order_by(HotelBooking.id.desc()).all()

    result = []
    for b in bookings:
        user = db.query(User).filter(User.id == b.user_id).first()
        trip = db.query(Trip).filter(Trip.id == b.trip_id).first() if b.trip_id else None
        profile = db.query(Profile).filter(Profile.user_id == b.user_id).first()
        user_name = f"{profile.first_name} {profile.last_name}".strip() if profile and (profile.first_name or profile.last_name) else (b.guest_name or "Unknown")

        result.append({
            "id": b.id,
            "user_id": b.user_id,
            "user_email": user.email if user else b.guest_email,
            "user_name": user_name,
            "user_avatar": profile.avatar_url if profile else None,
            "trip_id": b.trip_id,
            "trip_title": trip.title if trip else "Independent Stay",
            "hotel_name": b.hotel_name,
            "location": b.location,
            "guest_name": b.guest_name,
            "guest_email": b.guest_email,
            "guest_phone": b.guest_phone,
            "check_in_date": str(b.check_in_date) if b.check_in_date else None,
            "check_out_date": str(b.check_out_date) if b.check_out_date else None,
            "guests_count": b.guests_count,
            "room_type": b.room_type,
            "special_requests": b.special_requests,
            "price_per_night": float(b.price_per_night) if b.price_per_night is not None else 0.0,
            "total_price": float(b.total_price) if b.total_price is not None else 0.0,
            "booking_reference": b.booking_reference,
            "status": b.status,
            "created_at": str(b.created_at) if b.created_at else None
        })
    return result

@router.delete("/hotels/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/hotel-bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hotel_booking_admin(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    booking = db.query(HotelBooking).filter(HotelBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Hotel booking not found")
    db.delete(booking)
    db.commit()
    return None

@router.get("/flights")
@router.get("/flight-bookings")
def get_all_flight_bookings(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    query = db.query(FlightBooking)
    if user_id is not None:
        query = query.filter(FlightBooking.user_id == user_id)
    bookings = query.order_by(FlightBooking.id.desc()).all()

    result = []
    for b in bookings:
        user = db.query(User).filter(User.id == b.user_id).first()
        trip = db.query(Trip).filter(Trip.id == b.trip_id).first() if b.trip_id else None
        profile = db.query(Profile).filter(Profile.user_id == b.user_id).first()
        user_name = f"{profile.first_name} {profile.last_name}".strip() if profile and (profile.first_name or profile.last_name) else (b.passenger_name or "Unknown")

        result.append({
            "id": b.id,
            "user_id": b.user_id,
            "user_email": user.email if user else b.passenger_email,
            "user_name": user_name,
            "user_avatar": profile.avatar_url if profile else None,
            "trip_id": b.trip_id,
            "trip_title": trip.title if trip else "Independent Journey",
            "airline_name": b.airline_name,
            "airline_code": b.airline_code,
            "flight_number": b.flight_number,
            "origin": b.origin,
            "origin_code": b.origin_code,
            "destination": b.destination,
            "destination_code": b.destination_code,
            "departure_date": str(b.departure_date) if b.departure_date else None,
            "departure_time": b.departure_time,
            "arrival_time": b.arrival_time,
            "duration": b.duration,
            "passenger_name": b.passenger_name,
            "passenger_email": b.passenger_email,
            "seat_number": b.seat_number,
            "cabin_class": b.cabin_class,
            "gate": b.gate,
            "terminal": b.terminal,
            "ticket_price": float(b.ticket_price) if b.ticket_price is not None else 0.0,
            "booking_reference": b.booking_reference,
            "status": b.status,
            "created_at": str(b.created_at) if b.created_at else None
        })
    return result

@router.delete("/flights/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/flight-bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_flight_booking_admin(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    booking = db.query(FlightBooking).filter(FlightBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Flight booking not found")
    db.delete(booking)
    db.commit()
    return None

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account.")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Manual cascade delete
    db.query(OTP).filter(OTP.user_id == user_id).delete()
    db.query(Profile).filter(Profile.user_id == user_id).delete()
    db.query(HotelBooking).filter(HotelBooking.user_id == user_id).delete()
    db.query(FlightBooking).filter(FlightBooking.user_id == user_id).delete()
    
    # Delete expenses for trips owned by the user
    trips = db.query(Trip).filter(Trip.user_id == user_id).all()
    trip_ids = [t.id for t in trips]
    if trip_ids:
        db.query(Expense).filter(Expense.trip_id.in_(trip_ids)).delete(synchronize_session=False)
        
    db.query(Trip).filter(Trip.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    return None

@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    db.delete(expense)
    db.commit()
    return None

class UserStatusUpdate(BaseModel):
    is_active: bool

@router.patch("/users/{user_id}/status", response_model=AdminUserResponse)
def update_user_status(
    user_id: int,
    status_update: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own status.")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = status_update.is_active  # type: ignore
    db.commit()
    db.refresh(user)
    return user

class UserRoleUpdate(BaseModel):
    is_superuser: bool

@router.patch("/users/{user_id}/role", response_model=AdminUserResponse)
def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role.")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_superuser = role_update.is_superuser  # type: ignore
    db.commit()
    db.refresh(user)
    return user
