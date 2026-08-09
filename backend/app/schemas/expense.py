from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

class ExpenseBase(BaseModel):
    trip_id: int
    title: str
    amount: Decimal = Field(..., max_digits=10, decimal_places=2)
    category: str
    date: date

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(ExpenseBase):
    trip_id: Optional[int] = None
    title: Optional[str] = None
    amount: Optional[Decimal] = None
    category: Optional[str] = None
    date: Optional[date] = None

class Expense(ExpenseBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
