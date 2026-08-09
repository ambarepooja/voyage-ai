from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class TripBase(BaseModel):
    title: str
    destination: str
    start_date: date
    end_date: date
    description: Optional[str] = None
    budget: Optional[int] = 0
    cover_image: Optional[str] = None

class TripCreate(TripBase):
    pass

class TripUpdate(TripBase):
    title: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class Trip(TripBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
