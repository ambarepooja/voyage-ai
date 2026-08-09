import random
import string
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.hotel_booking import HotelBooking
from app.models.expense import Expense
from app.models.trip import Trip
from app.models.user import User
from app.schemas.hotel_booking import HotelBookingCreate, HotelBooking as HotelBookingSchema
from app.trips.router import get_current_user

router = APIRouter()

def generate_booking_ref() -> str:
    digits = ''.join(random.choices(string.digits, k=6))
    return f"VOY-HTL-{digits}"

@router.post("/book", response_model=HotelBookingSchema, status_code=status.HTTP_201_CREATED)
def create_hotel_booking(
    booking_in: HotelBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify trip if trip_id is provided
    trip_id = booking_in.trip_id
    if trip_id:
        trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
        if not trip:
            raise HTTPException(status_code=404, detail="Associated trip not found")
    else:
        # Create a default trip if user has no trip
        default_trip = Trip(
            user_id=current_user.id,
            title=f"Stay at {booking_in.hotel_name}",
            destination=booking_in.location,
            start_date=booking_in.check_in_date,
            end_date=booking_in.check_out_date,
            budget=int(booking_in.total_price + 20000)
        )
        db.add(default_trip)
        db.flush()
        trip_id = default_trip.id

    booking_ref = generate_booking_ref()
    
    # 1. Create Hotel Booking Record
    booking = HotelBooking(
        user_id=current_user.id,
        trip_id=trip_id,
        hotel_name=booking_in.hotel_name,
        location=booking_in.location,
        guest_name=booking_in.guest_name,
        guest_email=booking_in.guest_email,
        guest_phone=booking_in.guest_phone,
        check_in_date=booking_in.check_in_date,
        check_out_date=booking_in.check_out_date,
        guests_count=booking_in.guests_count,
        room_type=booking_in.room_type,
        special_requests=booking_in.special_requests,
        price_per_night=booking_in.price_per_night,
        total_price=booking_in.total_price,
        booking_reference=booking_ref,
        status="confirmed"
    )
    db.add(booking)

    # 2. Automatically Add Corresponding Expense with unique booking reference
    expense = Expense(
        user_id=current_user.id,
        trip_id=trip_id,
        title=f"Hotel: {booking_in.hotel_name} [{booking_ref}] ({booking_in.room_type})",
        amount=booking_in.total_price,
        category="Accommodation",
        date=booking_in.check_in_date
    )
    db.add(expense)

    db.commit()
    db.refresh(booking)
    return booking

@router.get("/my-bookings", response_model=List[HotelBookingSchema])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bookings = db.query(HotelBooking).filter(HotelBooking.user_id == current_user.id).order_by(HotelBooking.id.desc()).all()
    return bookings

@router.delete("/my-bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(HotelBooking).filter(HotelBooking.id == booking_id, HotelBooking.user_id == current_user.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Accurately delete ONLY this specific hotel reservation expense
    matching_expense = db.query(Expense).filter(
        Expense.user_id == current_user.id,
        (
            Expense.title.like(f"%{booking.booking_reference}%") |
            (
                Expense.title.like(f"Hotel: {booking.hotel_name}%") &
                (Expense.amount == booking.total_price) &
                (Expense.date == booking.check_in_date)
            )
        )
    ).first()

    if matching_expense:
        db.delete(matching_expense)

    db.delete(booking)
    db.commit()
    return None

