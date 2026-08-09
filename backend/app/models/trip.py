from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class Trip(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    title = Column(String, index=True)
    destination = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    description = Column(Text)
    budget = Column(Integer, default=0) # Storing in cents/smallest unit or float, integer is safer
    cover_image = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User")
    expenses = relationship("Expense", back_populates="trip", cascade="all, delete-orphan")
