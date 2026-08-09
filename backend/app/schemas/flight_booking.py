from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel

class FlightBookingBase(BaseModel):
    trip_id: Optional[int] = None
    airline_name: str
    airline_code: str
    flight_number: str
    origin: str
    origin_code: str
    destination: str
    destination_code: str
    departure_date: date
    departure_time: str
    arrival_time: str
    duration: Optional[str] = "1h 30m"
    passenger_name: str
    passenger_email: str
    seat_number: Optional[str] = "12A"
    cabin_class: Optional[str] = "Economy"
    gate: Optional[str] = "G4"
    terminal: Optional[str] = "T2"
    ticket_price: float

class FlightBookingCreate(FlightBookingBase):
    pass

class FlightBooking(FlightBookingBase):
    id: int
    user_id: int
    booking_reference: str
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
