from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_db
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, Expense as ExpenseSchema
from app.models.expense import Expense
from app.models.trip import Trip
from app.models.user import User
from app.models.flight_booking import FlightBooking
from app.models.hotel_booking import HotelBooking
from app.trips.router import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ExpenseSchema])
def read_expenses(
    trip_id: Optional[int] = None, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    query = db.query(Expense).filter(Expense.user_id == current_user.id)
    if trip_id is not None:
        query = query.filter(Expense.trip_id == trip_id)
    expenses = query.offset(skip).limit(limit).all()
    return expenses

@router.get("/{expense_id}", response_model=ExpenseSchema)
def read_expense(
    expense_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.post("/", response_model=ExpenseSchema, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_in: ExpenseCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if expense_in.trip_id:
        trip = db.query(Trip).filter(Trip.id == expense_in.trip_id, Trip.user_id == current_user.id).first()
        if not trip:
            raise HTTPException(status_code=404, detail="Associated trip not found or does not belong to user")

    expense = Expense(
        **expense_in.model_dump(),
        user_id=current_user.id
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.put("/{expense_id}", response_model=ExpenseSchema)
def update_expense(
    expense_id: int,
    expense_in: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    update_data = expense_in.model_dump(exclude_unset=True)
    if "trip_id" in update_data and update_data["trip_id"] is not None:
        trip = db.query(Trip).filter(Trip.id == update_data["trip_id"], Trip.user_id == current_user.id).first()
        if not trip:
            raise HTTPException(status_code=404, detail="Associated trip not found")

    for field, value in update_data.items():
        setattr(expense, field, value)

    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    # If linked to a flight or hotel booking, clean up booking record so it never respawns
    title = expense.title or ""
    if "[VOY-FLT-" in title:
        try:
            ref_match = title.split("[")[1].split("]")[0]
            db.query(FlightBooking).filter(
                FlightBooking.user_id == current_user.id,
                FlightBooking.booking_reference == ref_match
            ).delete()
        except Exception:
            pass
    elif "[VOY-HTL-" in title:
        try:
            ref_match = title.split("[")[1].split("]")[0]
            db.query(HotelBooking).filter(
                HotelBooking.user_id == current_user.id,
                HotelBooking.booking_reference == ref_match
            ).delete()
        except Exception:
            pass

    db.delete(expense)
    db.commit()
    return None

