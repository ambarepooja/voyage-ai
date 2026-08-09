from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class SavedPlace(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    trip_id = Column(Integer, ForeignKey("trip.id"), nullable=True) # Optional, can save independently
    name = Column(String)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    place_id = Column(String) # Google Maps Place ID
    category = Column(String) # e.g., 'Restaurant', 'Hotel', 'Attraction'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    trip = relationship("Trip")
