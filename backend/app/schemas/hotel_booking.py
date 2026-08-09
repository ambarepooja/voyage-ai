from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

class HotelBookingBase(BaseModel):
    hotel_name: str
    location: str
    guest_name: str
    guest_email: EmailStr
    guest_phone: str
    check_in_date: date
    check_out_date: date
    guests_count: int = 1
    room_type: str = "Standard Room"
    special_requests: Optional[str] = None
    price_per_night: Decimal
    total_price: Decimal
    trip_id: Optional[int] = None

class HotelBookingCreate(HotelBookingBase):
    pass

class HotelBooking(HotelBookingBase):
    id: int
    user_id: int
    booking_reference: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
