from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.router import router as auth_router
from app.trips.router import router as trips_router
from app.ai.router import router as ai_router
from app.expenses.router import router as expenses_router
from app.hotels.router import router as hotels_router
from app.flights.router import router as flights_router
from app.admin.router import router as admin_router

from app.database.base import Base
from app.database.session import engine
# Import all models to ensure they are registered with Base.metadata
import app.models.user
import app.models.profile
import app.models.otp
import app.models.trip
import app.models.expense
import app.models.hotel_booking
import app.models.flight_booking
import app.models.notification
import app.models.saved_place

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Voyage AI Backend",
    description="Backend for the AI Traveller Assistance application",
    version="0.1.0"
)

# Configure CORS for Local & Production Cloud Deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(trips_router, prefix="/api/v1/trips", tags=["trips"])
app.include_router(ai_router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(expenses_router, prefix="/api/v1/expenses", tags=["expenses"])
app.include_router(hotels_router, prefix="/api/v1/hotels", tags=["hotels"])
app.include_router(flights_router, prefix="/api/v1/flights", tags=["flights"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Voyage AI API"}

