from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class HotelBooking(Base):
    __tablename__ = "hotel_booking"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    trip_id = Column(Integer, ForeignKey("trip.id"), nullable=True)
    
    hotel_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    
    guest_name = Column(String, nullable=False)
    guest_email = Column(String, nullable=False)
    guest_phone = Column(String, nullable=False)
    
    check_in_date = Column(Date, nullable=False)
    check_out_date = Column(Date, nullable=False)
    guests_count = Column(Integer, default=1)
    room_type = Column(String, default="Standard Room")
    special_requests = Column(String, nullable=True)
    
    price_per_night = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    booking_reference = Column(String, nullable=False, unique=True)
    status = Column(String, default="confirmed")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    trip = relationship("Trip")
