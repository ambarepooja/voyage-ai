from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class Expense(Base):
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trip.id"))
    user_id = Column(Integer, ForeignKey("user.id"))
    title = Column(String)
    amount = Column(Numeric(10, 2))
    category = Column(String) # e.g., 'Food', 'Transport', 'Accommodation', 'Activities'
    date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    trip = relationship("Trip", back_populates="expenses")
    user = relationship("User")
