from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db
from app.schemas.trip import TripCreate, TripUpdate, Trip as TripSchema
from app.models.trip import Trip
from app.models.user import User
from app.core.config import settings
from jose import jwt

router = APIRouter()

# Note: In a real app, we'd have a get_current_user dependency 
# For simplicity, we are mocking it or we can quickly implement one.
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=List[TripSchema])
def read_trips(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trips = db.query(Trip).filter(Trip.user_id == current_user.id).offset(skip).limit(limit).all()
    return trips

@router.post("/", response_model=TripSchema, status_code=status.HTTP_201_CREATED)
def create_trip(trip_in: TripCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = Trip(
        **trip_in.model_dump(),
        user_id=current_user.id
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip

from app.models.expense import Expense
from app.models.flight_booking import FlightBooking
from app.models.hotel_booking import HotelBooking

@router.get("/{trip_id}", response_model=TripSchema)
def read_trip(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@router.put("/{trip_id}", response_model=TripSchema)
def update_trip(
    trip_id: int, 
    trip_in: TripUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    update_data = trip_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(trip, field, value)

    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(
    trip_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Delete associated expenses, flight bookings, and hotel bookings
    db.query(Expense).filter(Expense.trip_id == trip_id).delete(synchronize_session=False)
    db.query(FlightBooking).filter(FlightBooking.trip_id == trip_id).delete(synchronize_session=False)
    db.query(HotelBooking).filter(HotelBooking.trip_id == trip_id).delete(synchronize_session=False)
    db.delete(trip)
    db.commit()
    return None
