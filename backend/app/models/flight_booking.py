from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Numeric, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class FlightBooking(Base):
    __tablename__ = "flight_booking"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    trip_id = Column(Integer, ForeignKey("trip.id"), nullable=True)

    airline_name = Column(String, nullable=False)
    airline_code = Column(String, nullable=False) # e.g. AI-802, 6E-541
    flight_number = Column(String, nullable=False)

    origin = Column(String, nullable=False) # e.g. Mumbai (BOM)
    origin_code = Column(String, nullable=False) # BOM
    destination = Column(String, nullable=False) # e.g. Goa (GOI)
    destination_code = Column(String, nullable=False) # GOI

    departure_date = Column(Date, nullable=False)
    departure_time = Column(String, nullable=False) # e.g. 06:45 AM
    arrival_time = Column(String, nullable=False) # e.g. 08:15 AM
    duration = Column(String, default="1h 30m")

    passenger_name = Column(String, nullable=False)
    passenger_email = Column(String, nullable=False)
    seat_number = Column(String, default="12A")
    cabin_class = Column(String, default="Economy") # Economy, Premium Economy, Business
    gate = Column(String, default="G4")
    terminal = Column(String, default="T2")

    ticket_price = Column(Numeric(10, 2), nullable=False)
    booking_reference = Column(String, nullable=False, unique=True) # e.g. VOY-FLT-847291
    status = Column(String, default="confirmed")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    trip = relationship("Trip")
