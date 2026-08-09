import random
import string
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.flight_booking import FlightBooking
from app.models.expense import Expense
from app.models.trip import Trip
from app.models.user import User
from app.schemas.flight_booking import FlightBookingCreate, FlightBooking as FlightBookingSchema
from app.trips.router import get_current_user

router = APIRouter()

def generate_flight_reference() -> str:
    digits = ''.join(random.choices(string.digits, k=6))
    return f"VOY-FLT-{digits}"

GLOBAL_COUNTRIES_CATALOG = [
    {"country": "India", "flag": "🇮🇳", "code": "IN", "hub": "BOM", "popular_cities": ["Mumbai", "Delhi", "Goa", "Bengaluru", "Jaipur", "Kochi", "Kolkata"]},
    {"country": "United Arab Emirates", "short_country": "UAE", "flag": "🇦🇪", "code": "AE", "hub": "DXB", "popular_cities": ["Dubai", "Abu Dhabi", "Sharjah"]},
    {"country": "Japan", "flag": "🇯🇵", "code": "JP", "hub": "HND", "popular_cities": ["Tokyo", "Osaka", "Kyoto", "Sapporo", "Fukuoka"]},
    {"country": "France", "flag": "🇫🇷", "code": "FR", "hub": "CDG", "popular_cities": ["Paris", "Nice", "Lyon", "Marseille"]},
    {"country": "Switzerland", "flag": "🇨🇭", "code": "CH", "hub": "ZRH", "popular_cities": ["Zurich", "Geneva", "Basel", "Lucerne"]},
    {"country": "Greece", "flag": "🇬🇷", "code": "GR", "hub": "ATH", "popular_cities": ["Athens", "Santorini", "Mykonos", "Crete"]},
    {"country": "Indonesia", "flag": "🇮🇩", "code": "ID", "hub": "DPS", "popular_cities": ["Bali", "Jakarta", "Surabaya", "Lombok"]},
    {"country": "Maldives", "flag": "🇲🇻", "code": "MV", "hub": "MLE", "popular_cities": ["Malé", "Maafushi", "Baa Atoll"]},
    {"country": "Thailand", "flag": "🇹🇭", "code": "TH", "hub": "BKK", "popular_cities": ["Bangkok", "Phuket", "Chiang Mai", "Koh Samui", "Krabi"]},
    {"country": "USA", "flag": "🇺🇸", "code": "US", "hub": "JFK", "popular_cities": ["New York", "Los Angeles", "San Francisco", "Miami", "Chicago", "Hawaii"]},
    {"country": "United Kingdom", "short_country": "UK", "flag": "🇬🇧", "code": "GB", "hub": "LHR", "popular_cities": ["London", "Manchester", "Edinburgh"]},
    {"country": "Germany", "flag": "🇩🇪", "code": "DE", "hub": "FRA", "popular_cities": ["Frankfurt", "Munich", "Berlin", "Hamburg"]},
    {"country": "Italy", "flag": "🇮🇹", "code": "IT", "hub": "FCO", "popular_cities": ["Rome", "Milan", "Venice", "Florence", "Naples"]},
    {"country": "Spain", "flag": "🇪🇸", "code": "ES", "hub": "MAD", "popular_cities": ["Madrid", "Barcelona", "Seville", "Ibiza", "Malaga"]},
    {"country": "Singapore", "flag": "🇸🇬", "code": "SG", "hub": "SIN", "popular_cities": ["Singapore"]},
    {"country": "Morocco", "flag": "🇲🇦", "code": "MA", "hub": "CMN", "popular_cities": ["Casablanca", "Marrakech", "Tangier", "Fes", "Rabat"]},
    {"country": "Egypt", "flag": "🇪🇬", "code": "EG", "hub": "CAI", "popular_cities": ["Cairo", "Hurghada", "Sharm El Sheikh", "Luxor", "Alexandria"]},
    {"country": "Turkey", "flag": "🇹🇷", "code": "TR", "hub": "IST", "popular_cities": ["Istanbul", "Antalya", "Cappadocia", "Izmir", "Ankara"]},
    {"country": "Saudi Arabia", "flag": "🇸🇦", "code": "SA", "hub": "RUH", "popular_cities": ["Riyadh", "Jeddah", "Medina", "Dammam"]},
    {"country": "Qatar", "flag": "🇶🇦", "code": "QA", "hub": "DOH", "popular_cities": ["Doha"]},
    {"country": "Oman", "flag": "🇴🇲", "code": "OM", "hub": "MCT", "popular_cities": ["Muscat", "Salalah"]},
    {"country": "Kuwait", "flag": "🇰🇼", "code": "KW", "hub": "KWI", "popular_cities": ["Kuwait City"]},
    {"country": "Bahrain", "flag": "🇧🇭", "code": "BH", "hub": "BAH", "popular_cities": ["Manama"]},
    {"country": "Jordan", "flag": "🇯🇴", "code": "JO", "hub": "AMM", "popular_cities": ["Amman", "Petra", "Aqaba"]},
    {"country": "South Korea", "flag": "🇰🇷", "code": "KR", "hub": "ICN", "popular_cities": ["Seoul", "Busan", "Jeju"]},
    {"country": "Vietnam", "flag": "🇻🇳", "code": "VN", "hub": "HAN", "popular_cities": ["Hanoi", "Ho Chi Minh City", "Da Nang"]},
    {"country": "Malaysia", "flag": "🇲🇾", "code": "MY", "hub": "KUL", "popular_cities": ["Kuala Lumpur", "Penang", "Langkawi"]},
    {"country": "China", "flag": "🇨🇳", "code": "CN", "hub": "PEK", "popular_cities": ["Beijing", "Shanghai", "Hong Kong", "Guangzhou"]},
    {"country": "Sri Lanka", "flag": "🇱🇰", "code": "LK", "hub": "CMB", "popular_cities": ["Colombo", "Kandy", "Galle"]},
    {"country": "Nepal", "flag": "🇳🇵", "code": "NP", "hub": "KTM", "popular_cities": ["Kathmandu", "Pokhara"]},
    {"country": "Netherlands", "flag": "🇳🇱", "code": "NL", "hub": "AMS", "popular_cities": ["Amsterdam", "Rotterdam"]},
    {"country": "Czech Republic", "flag": "🇨🇿", "code": "CZ", "hub": "PRG", "popular_cities": ["Prague"]},
    {"country": "Hungary", "flag": "🇭🇺", "code": "HU", "hub": "BUD", "popular_cities": ["Budapest"]},
    {"country": "Poland", "flag": "🇵🇱", "code": "PL", "hub": "WAW", "popular_cities": ["Warsaw", "Krakow"]},
    {"country": "Norway", "flag": "🇳🇴", "code": "NO", "hub": "OSL", "popular_cities": ["Oslo", "Bergen", "Tromso"]},
    {"country": "Sweden", "flag": "🇸🇪", "code": "SE", "hub": "ARN", "popular_cities": ["Stockholm", "Gothenburg"]},
    {"country": "Denmark", "flag": "🇩🇰", "code": "DK", "hub": "CPH", "popular_cities": ["Copenhagen"]},
    {"country": "Austria", "flag": "🇦🇹", "code": "AT", "hub": "VIE", "popular_cities": ["Vienna", "Salzburg"]},
    {"country": "Portugal", "flag": "🇵🇹", "code": "PT", "hub": "LIS", "popular_cities": ["Lisbon", "Porto", "Faro"]},
    {"country": "Ireland", "flag": "🇮🇪", "code": "IE", "hub": "DUB", "popular_cities": ["Dublin"]},
    {"country": "Iceland", "flag": "🇮🇸", "code": "IS", "hub": "KEF", "popular_cities": ["Reykjavik"]},
    {"country": "Belgium", "flag": "🇧🇪", "code": "BE", "hub": "BRU", "popular_cities": ["Brussels"]},
    {"country": "Finland", "flag": "🇫🇮", "code": "FI", "hub": "HEL", "popular_cities": ["Helsinki", "Rovaniemi"]},
    {"country": "Canada", "flag": "🇨🇦", "code": "CA", "hub": "YYZ", "popular_cities": ["Toronto", "Vancouver", "Montreal", "Calgary"]},
    {"country": "Mexico", "flag": "🇲🇽", "code": "MX", "hub": "MEX", "popular_cities": ["Mexico City", "Cancun", "Guadalajara"]},
    {"country": "Brazil", "flag": "🇧🇷", "code": "BR", "hub": "GRU", "popular_cities": ["Sao Paulo", "Rio de Janeiro"]},
    {"country": "Australia", "flag": "🇦🇺", "code": "AU", "hub": "SYD", "popular_cities": ["Sydney", "Melbourne", "Brisbane", "Perth"]},
    {"country": "New Zealand", "flag": "🇳🇿", "code": "NZ", "hub": "AKL", "popular_cities": ["Auckland", "Queenstown", "Christchurch"]},
    {"country": "South Africa", "flag": "🇿🇦", "code": "ZA", "hub": "JNB", "popular_cities": ["Johannesburg", "Cape Town", "Durban"]},
    {"country": "Kenya", "flag": "🇰🇪", "code": "KE", "hub": "NBO", "popular_cities": ["Nairobi", "Mombasa"]},
    {"country": "Tanzania", "flag": "🇹🇿", "code": "TZ", "hub": "ZNZ", "popular_cities": ["Zanzibar", "Dar es Salaam", "Kilimanjaro"]},
    {"country": "Mauritius", "flag": "🇲🇺", "code": "MU", "hub": "MRU", "popular_cities": ["Mauritius", "Port Louis"]}
]

MOCK_ROUTES = [
    # ── 1. INDIA (Domestic & Regional) ──────────────────────────────────────────
    {
        "id": 1,
        "airline_name": "Air India",
        "airline_code": "AI",
        "flight_number": "AI-802",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Goa, India",
        "destination_code": "GOI",
        "destination_country": "India",
        "country": "India",
        "departure_time": "06:15 AM",
        "arrival_time": "07:35 AM",
        "duration": "1h 20m",
        "price_economy": 4850,
        "price_business": 14200,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Airbus A321neo"
    },
    {
        "id": 2,
        "airline_name": "IndiGo",
        "airline_code": "6E",
        "flight_number": "6E-541",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Goa, India",
        "destination_code": "GOI",
        "destination_country": "India",
        "country": "India",
        "departure_time": "09:30 AM",
        "arrival_time": "12:15 PM",
        "duration": "2h 45m",
        "price_economy": 5990,
        "price_business": 16500,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Airbus A320neo"
    },
    {
        "id": 3,
        "airline_name": "Vistara",
        "airline_code": "UK",
        "flight_number": "UK-945",
        "origin": "Bengaluru, India",
        "origin_code": "BLR",
        "origin_country": "India",
        "destination": "Mumbai, India",
        "destination_code": "BOM",
        "destination_country": "India",
        "country": "India",
        "departure_time": "07:00 AM",
        "arrival_time": "08:40 AM",
        "duration": "1h 40m",
        "price_economy": 4200,
        "price_business": 13900,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 737 Max"
    },
    {
        "id": 4,
        "airline_name": "Akasa Air",
        "airline_code": "QP",
        "flight_number": "QP-1382",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Jaipur, India",
        "destination_code": "JAI",
        "destination_country": "India",
        "country": "India",
        "departure_time": "10:15 AM",
        "arrival_time": "12:05 PM",
        "duration": "1h 50m",
        "price_economy": 3950,
        "price_business": 11500,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 737 Max 8"
    },
    {
        "id": 5,
        "airline_name": "Air India Express",
        "airline_code": "IX",
        "flight_number": "IX-684",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Kochi, India",
        "destination_code": "COK",
        "destination_country": "India",
        "country": "India",
        "departure_time": "11:20 AM",
        "arrival_time": "02:35 PM",
        "duration": "3h 15m",
        "price_economy": 6200,
        "price_business": 17800,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 737-800"
    },

    # ── 2. UAE (Dubai, Abu Dhabi, Sharjah) ──────────────────────────────────────
    {
        "id": 6,
        "airline_name": "Emirates",
        "airline_code": "EK",
        "flight_number": "EK-501",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Dubai, UAE",
        "destination_code": "DXB",
        "destination_country": "UAE",
        "country": "UAE",
        "departure_time": "04:30 AM",
        "arrival_time": "06:15 AM",
        "duration": "3h 15m",
        "price_economy": 24500,
        "price_business": 68000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 777-300ER"
    },
    {
        "id": 7,
        "airline_name": "Etihad Airways",
        "airline_code": "EY",
        "flight_number": "EY-205",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Abu Dhabi, UAE",
        "destination_code": "AUH",
        "destination_country": "UAE",
        "country": "UAE",
        "departure_time": "08:45 AM",
        "arrival_time": "11:25 AM",
        "duration": "4h 10m",
        "price_economy": 22800,
        "price_business": 64500,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Airbus A350-1000"
    },
    {
        "id": 8,
        "airline_name": "FlyDubai (Transit Connection)",
        "airline_code": "FZ",
        "flight_number": "FZ-436",
        "origin": "Bengaluru, India",
        "origin_code": "BLR",
        "origin_country": "India",
        "destination": "Sharjah, UAE",
        "destination_code": "SHJ",
        "destination_country": "UAE",
        "country": "UAE",
        "departure_time": "02:15 PM",
        "arrival_time": "07:30 PM",
        "duration": "6h 45m",
        "price_economy": 18500,
        "price_business": 49000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "DXB (Dubai)",
        "layover_duration": "1h 40m transit at DXB",
        "aircraft": "Boeing 737 Max 9"
    },

    # ── 3. JAPAN (Tokyo, Osaka, Kyoto) ──────────────────────────────────────────
    {
        "id": 9,
        "airline_name": "Japan Airlines",
        "airline_code": "JL",
        "flight_number": "JL-750",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Tokyo, Japan",
        "destination_code": "HND",
        "destination_country": "Japan",
        "country": "Japan",
        "departure_time": "08:15 PM",
        "arrival_time": "07:30 AM (+1)",
        "duration": "8h 45m",
        "price_economy": 48900,
        "price_business": 135000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 787-9 Dreamliner"
    },
    {
        "id": 10,
        "airline_name": "ANA All Nippon Airways",
        "airline_code": "NH",
        "flight_number": "NH-830",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Tokyo, Japan",
        "destination_code": "NRT",
        "destination_country": "Japan",
        "country": "Japan",
        "departure_time": "07:55 PM",
        "arrival_time": "07:20 AM (+1)",
        "duration": "8h 55m",
        "price_economy": 51200,
        "price_business": 142000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 787-8"
    },
    {
        "id": 11,
        "airline_name": "Singapore Airlines (Transit Connection)",
        "airline_code": "SQ",
        "flight_number": "SQ-421 / SQ-618",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Osaka (Kyoto), Japan",
        "destination_code": "KIX",
        "destination_country": "Japan",
        "country": "Japan",
        "departure_time": "11:45 PM",
        "arrival_time": "03:15 PM (+1)",
        "duration": "12h 00m",
        "price_economy": 44800,
        "price_business": 128000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "SIN (Singapore)",
        "layover_duration": "2h 05m transit at Changi (SIN)",
        "aircraft": "Airbus A350-900"
    },

    # ── 4. FRANCE (Paris, Nice, Lyon) ───────────────────────────────────────────
    {
        "id": 12,
        "airline_name": "Air France",
        "airline_code": "AF",
        "flight_number": "AF-225",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Paris, France",
        "destination_code": "CDG",
        "destination_country": "France",
        "country": "France",
        "departure_time": "01:25 AM",
        "arrival_time": "06:50 AM",
        "duration": "8h 55m",
        "price_economy": 54000,
        "price_business": 149000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 787-9"
    },
    {
        "id": 13,
        "airline_name": "Emirates (Transit Connection)",
        "airline_code": "EK",
        "flight_number": "EK-505 / EK-077",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Nice (Côte d'Azur), France",
        "destination_code": "NCE",
        "destination_country": "France",
        "country": "France",
        "departure_time": "09:50 AM",
        "arrival_time": "07:45 PM",
        "duration": "12h 25m",
        "price_economy": 49500,
        "price_business": 138000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "DXB (Dubai)",
        "layover_duration": "2h 15m layover in DXB",
        "aircraft": "Boeing 777-300ER"
    },

    # ── 5. SWITZERLAND (Zurich, Geneva, Basel) ─────────────────────────────────
    {
        "id": 14,
        "airline_name": "SWISS International Air Lines",
        "airline_code": "LX",
        "flight_number": "LX-155",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Zurich, Switzerland",
        "destination_code": "ZRH",
        "destination_country": "Switzerland",
        "country": "Switzerland",
        "departure_time": "01:10 AM",
        "arrival_time": "06:30 AM",
        "duration": "8h 50m",
        "price_economy": 58500,
        "price_business": 158000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 777-300ER"
    },
    {
        "id": 15,
        "airline_name": "Lufthansa (Transit Connection)",
        "airline_code": "LH",
        "flight_number": "LH-761 / LH-1224",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Geneva, Switzerland",
        "destination_code": "GVA",
        "destination_country": "Switzerland",
        "country": "Switzerland",
        "departure_time": "03:30 AM",
        "arrival_time": "11:45 AM",
        "duration": "11h 45m",
        "price_economy": 53200,
        "price_business": 145000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "FRA (Frankfurt)",
        "layover_duration": "1h 50m transit at FRA",
        "aircraft": "Airbus A350-900"
    },

    # ── 6. GREECE (Santorini, Athens, Mykonos) ──────────────────────────────────
    {
        "id": 16,
        "airline_name": "Qatar Airways (Transit Connection)",
        "airline_code": "QR",
        "flight_number": "QR-557 / QR-211",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Santorini, Greece",
        "destination_code": "JTR",
        "destination_country": "Greece",
        "country": "Greece",
        "departure_time": "04:10 AM",
        "arrival_time": "01:20 PM",
        "duration": "11h 40m",
        "price_economy": 52000,
        "price_business": 142000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "DOH (Doha)",
        "layover_duration": "1h 55m transit at Hamad (DOH)",
        "aircraft": "Boeing 787-8 Dreamliner"
    },
    {
        "id": 17,
        "airline_name": "Gulf Air (Transit Connection)",
        "airline_code": "GF",
        "flight_number": "GF-065 / GF-041",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Athens, Greece",
        "destination_code": "ATH",
        "destination_country": "Greece",
        "country": "Greece",
        "departure_time": "05:40 AM",
        "arrival_time": "02:15 PM",
        "duration": "11h 05m",
        "price_economy": 46500,
        "price_business": 126000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "BAH (Bahrain)",
        "layover_duration": "2h 10m transit at BAH",
        "aircraft": "Airbus A321neo"
    },

    # ── 7. INDONESIA (Bali, Jakarta) ────────────────────────────────────────────
    {
        "id": 18,
        "airline_name": "IndiGo / Batik Air",
        "airline_code": "6E",
        "flight_number": "6E-1605",
        "origin": "Bengaluru, India",
        "origin_code": "BLR",
        "origin_country": "India",
        "destination": "Bali (Denpasar), Indonesia",
        "destination_code": "DPS",
        "destination_country": "Indonesia",
        "country": "Indonesia",
        "departure_time": "01:05 AM",
        "arrival_time": "09:40 AM",
        "duration": "6h 05m",
        "price_economy": 27800,
        "price_business": 76000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Airbus A321neo"
    },
    {
        "id": 19,
        "airline_name": "Malaysia Airlines (Transit Connection)",
        "airline_code": "MH",
        "flight_number": "MH-195 / MH-715",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Jakarta, Indonesia",
        "destination_code": "CGK",
        "destination_country": "Indonesia",
        "country": "Indonesia",
        "departure_time": "11:25 PM",
        "arrival_time": "10:45 AM (+1)",
        "duration": "8h 50m",
        "price_economy": 24900,
        "price_business": 68000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "KUL (Kuala Lumpur)",
        "layover_duration": "1h 35m transit at KLIA",
        "aircraft": "Boeing 737-800"
    },

    # ── 8. MALDIVES (Malé) ──────────────────────────────────────────────────────
    {
        "id": 20,
        "airline_name": "Air India",
        "airline_code": "AI",
        "flight_number": "AI-267",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Malé, Maldives",
        "destination_code": "MLE",
        "destination_country": "Maldives",
        "country": "Maldives",
        "departure_time": "10:00 AM",
        "arrival_time": "12:45 PM",
        "duration": "2h 45m",
        "price_economy": 19500,
        "price_business": 52000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Airbus A320neo"
    },
    {
        "id": 21,
        "airline_name": "IndiGo",
        "airline_code": "6E",
        "flight_number": "6E-1793",
        "origin": "Kochi, India",
        "origin_code": "COK",
        "origin_country": "India",
        "destination": "Malé, Maldives",
        "destination_code": "MLE",
        "destination_country": "Maldives",
        "country": "Maldives",
        "departure_time": "01:30 PM",
        "arrival_time": "03:10 PM",
        "duration": "1h 40m",
        "price_economy": 13900,
        "price_business": 38000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "ATR 72-600"
    },

    # ── 9. THAILAND (Bangkok, Phuket, Chiang Mai) ───────────────────────────────
    {
        "id": 22,
        "airline_name": "Thai Airways",
        "airline_code": "TG",
        "flight_number": "TG-318",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Bangkok, Thailand",
        "destination_code": "BKK",
        "destination_country": "Thailand",
        "country": "Thailand",
        "departure_time": "11:35 PM",
        "arrival_time": "05:30 AM (+1)",
        "duration": "4h 25m",
        "price_economy": 21500,
        "price_business": 59000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 777-300ER"
    },
    {
        "id": 23,
        "airline_name": "IndiGo",
        "airline_code": "6E",
        "flight_number": "6E-1073",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Phuket, Thailand",
        "destination_code": "HKT",
        "destination_country": "Thailand",
        "country": "Thailand",
        "departure_time": "06:20 AM",
        "arrival_time": "12:40 PM",
        "duration": "4h 50m",
        "price_economy": 23800,
        "price_business": 62000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Airbus A321neo"
    },

    # ── 10. USA (New York, Los Angeles, San Francisco, Miami, Hawaii) ───────────
    {
        "id": 24,
        "airline_name": "Air India",
        "airline_code": "AI",
        "flight_number": "AI-101",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "New York (JFK), USA",
        "destination_code": "JFK",
        "destination_country": "USA",
        "country": "USA",
        "departure_time": "02:20 AM",
        "arrival_time": "07:35 AM",
        "duration": "14h 45m",
        "price_economy": 78900,
        "price_business": 235000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 777-200LR"
    },
    {
        "id": 25,
        "airline_name": "United Airlines",
        "airline_code": "UA",
        "flight_number": "UA-868",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "San Francisco, USA",
        "destination_code": "SFO",
        "destination_country": "USA",
        "country": "USA",
        "departure_time": "04:00 AM",
        "arrival_time": "06:30 AM",
        "duration": "15h 30m",
        "price_economy": 84500,
        "price_business": 249000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 787-9 Dreamliner"
    },
    {
        "id": 26,
        "airline_name": "Qatar Airways (Transit Connection)",
        "airline_code": "QR",
        "flight_number": "QR-556 / QR-739",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Los Angeles, USA",
        "destination_code": "LAX",
        "destination_country": "USA",
        "country": "USA",
        "departure_time": "04:10 AM",
        "arrival_time": "02:40 PM",
        "duration": "20h 00m",
        "price_economy": 76000,
        "price_business": 220000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "DOH (Doha)",
        "layover_duration": "2h 30m transit at Hamad (DOH)",
        "aircraft": "Airbus A350-1000"
    },
    {
        "id": 27,
        "airline_name": "British Airways (Transit Connection)",
        "airline_code": "BA",
        "flight_number": "BA-198 / BA-207",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Miami, USA",
        "destination_code": "MIA",
        "destination_country": "USA",
        "country": "USA",
        "departure_time": "01:15 PM",
        "arrival_time": "08:15 PM",
        "duration": "17h 30m",
        "price_economy": 73500,
        "price_business": 215000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "LHR (London Heathrow)",
        "layover_duration": "2h 20m layover at LHR T5",
        "aircraft": "Boeing 777-300ER"
    },

    # ── 11. UNITED KINGDOM (London, Manchester, Edinburgh) ──────────────────────
    {
        "id": 28,
        "airline_name": "British Airways",
        "airline_code": "BA",
        "flight_number": "BA-138",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "London (Heathrow), UK",
        "destination_code": "LHR",
        "destination_country": "UK",
        "country": "UK",
        "departure_time": "02:15 AM",
        "arrival_time": "07:20 AM",
        "duration": "9h 35m",
        "price_economy": 56000,
        "price_business": 162000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 787-10"
    },
    {
        "id": 29,
        "airline_name": "Virgin Atlantic",
        "airline_code": "VS",
        "flight_number": "VS-355",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "London (Heathrow), UK",
        "destination_code": "LHR",
        "destination_country": "UK",
        "country": "UK",
        "departure_time": "10:30 AM",
        "arrival_time": "03:45 PM",
        "duration": "9h 45m",
        "price_economy": 54800,
        "price_business": 158000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Airbus A350-1000"
    },
    {
        "id": 30,
        "airline_name": "Emirates (Transit Connection)",
        "airline_code": "EK",
        "flight_number": "EK-507 / EK-017",
        "origin": "Bengaluru, India",
        "origin_code": "BLR",
        "origin_country": "India",
        "destination": "Manchester, UK",
        "destination_code": "MAN",
        "destination_country": "UK",
        "country": "UK",
        "departure_time": "04:30 AM",
        "arrival_time": "12:45 PM",
        "duration": "12h 45m",
        "price_economy": 52000,
        "price_business": 148000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "DXB (Dubai)",
        "layover_duration": "2h 00m transit at DXB",
        "aircraft": "Airbus A380-800"
    },

    # ── 12. GERMANY (Frankfurt, Munich, Berlin) ─────────────────────────────────
    {
        "id": 31,
        "airline_name": "Lufthansa",
        "airline_code": "LH",
        "flight_number": "LH-757",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Frankfurt, Germany",
        "destination_code": "FRA",
        "destination_country": "Germany",
        "country": "Germany",
        "departure_time": "03:05 AM",
        "arrival_time": "08:15 AM",
        "duration": "8h 40m",
        "price_economy": 54500,
        "price_business": 152000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 747-8 Intercontinental"
    },
    {
        "id": 32,
        "airline_name": "Lufthansa",
        "airline_code": "LH",
        "flight_number": "LH-763",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Munich, Germany",
        "destination_code": "MUC",
        "destination_country": "Germany",
        "country": "Germany",
        "departure_time": "01:50 AM",
        "arrival_time": "06:40 AM",
        "duration": "8h 20m",
        "price_economy": 53000,
        "price_business": 148000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Airbus A350-900"
    },

    # ── 13. ITALY (Rome, Milan, Venice, Florence) ───────────────────────────────
    {
        "id": 33,
        "airline_name": "ITA Airways",
        "airline_code": "AZ",
        "flight_number": "AZ-771",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Rome, Italy",
        "destination_code": "FCO",
        "destination_country": "Italy",
        "country": "Italy",
        "departure_time": "03:50 AM",
        "arrival_time": "08:55 AM",
        "duration": "8h 35m",
        "price_economy": 52500,
        "price_business": 146000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Airbus A330neo"
    },
    {
        "id": 34,
        "airline_name": "Qatar Airways (Transit Connection)",
        "airline_code": "QR",
        "flight_number": "QR-557 / QR-127",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Milan, Italy",
        "destination_code": "MXP",
        "destination_country": "Italy",
        "country": "Italy",
        "departure_time": "04:10 AM",
        "arrival_time": "01:10 PM",
        "duration": "12h 30m",
        "price_economy": 48900,
        "price_business": 139000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "DOH (Doha)",
        "layover_duration": "1h 45m transit at DOH",
        "aircraft": "Boeing 787-9"
    },
    {
        "id": 35,
        "airline_name": "Emirates (Transit Connection)",
        "airline_code": "EK",
        "flight_number": "EK-505 / EK-135",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Venice, Italy",
        "destination_code": "VCE",
        "destination_country": "Italy",
        "country": "Italy",
        "departure_time": "09:50 AM",
        "arrival_time": "06:40 PM",
        "duration": "12h 20m",
        "price_economy": 51000,
        "price_business": 142000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "DXB (Dubai)",
        "layover_duration": "2h 10m transit at DXB",
        "aircraft": "Boeing 777-300ER"
    },

    # ── 14. SPAIN (Madrid, Barcelona, Seville, Ibiza) ───────────────────────────
    {
        "id": 36,
        "airline_name": "Etihad Airways (Transit Connection)",
        "airline_code": "EY",
        "flight_number": "EY-203 / EY-075",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Madrid, Spain",
        "destination_code": "MAD",
        "destination_country": "Spain",
        "country": "Spain",
        "departure_time": "04:45 AM",
        "arrival_time": "02:15 PM",
        "duration": "13h 00m",
        "price_economy": 49000,
        "price_business": 138000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "AUH (Abu Dhabi)",
        "layover_duration": "2h 00m layover in Abu Dhabi",
        "aircraft": "Boeing 787-9"
    },
    {
        "id": 37,
        "airline_name": "Qatar Airways (Transit Connection)",
        "airline_code": "QR",
        "flight_number": "QR-571 / QR-145",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Barcelona, Spain",
        "destination_code": "BCN",
        "destination_country": "Spain",
        "country": "Spain",
        "departure_time": "03:45 AM",
        "arrival_time": "01:25 PM",
        "duration": "13h 10m",
        "price_economy": 51500,
        "price_business": 144000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "DOH (Doha)",
        "layover_duration": "2h 15m transit at DOH",
        "aircraft": "Airbus A350-900"
    },

    # ── 15. MOROCCO (Casablanca, Marrakech, Tangier) ────────────────────────────
    {
        "id": 38,
        "airline_name": "Royal Air Maroc / Saudia (Transit Connection)",
        "airline_code": "AT",
        "flight_number": "AT-271",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Casablanca, Morocco",
        "destination_code": "CMN",
        "destination_country": "Morocco",
        "country": "Morocco",
        "departure_time": "06:30 AM",
        "arrival_time": "03:45 PM",
        "duration": "13h 45m",
        "price_economy": 56000,
        "price_business": 154000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "JED (Jeddah)",
        "layover_duration": "2h 30m transit at Jeddah (JED)",
        "aircraft": "Boeing 787-8 Dreamliner"
    },
    {
        "id": 39,
        "airline_name": "Air France (Transit Connection)",
        "airline_code": "AF",
        "flight_number": "AF-217 / AF-1076",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Marrakech, Morocco",
        "destination_code": "RAK",
        "destination_country": "Morocco",
        "country": "Morocco",
        "departure_time": "01:25 AM",
        "arrival_time": "11:40 AM",
        "duration": "14h 45m",
        "price_economy": 58900,
        "price_business": 162000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "CDG (Paris Charles de Gaulle)",
        "layover_duration": "2h 45m transit at Paris CDG",
        "aircraft": "Boeing 787-9"
    },

    # ── 16. EGYPT (Cairo, Hurghada, Sharm El Sheikh) ────────────────────────────
    {
        "id": 40,
        "airline_name": "EgyptAir",
        "airline_code": "MS",
        "flight_number": "MS-969",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Cairo, Egypt",
        "destination_code": "CAI",
        "destination_country": "Egypt",
        "country": "Egypt",
        "departure_time": "02:30 AM",
        "arrival_time": "06:15 AM",
        "duration": "6h 15m",
        "price_economy": 34500,
        "price_business": 92000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Airbus A321neo"
    },
    {
        "id": 41,
        "airline_name": "EgyptAir (Transit Connection)",
        "airline_code": "MS",
        "flight_number": "MS-969 / MS-044",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Hurghada (Red Sea), Egypt",
        "destination_code": "HRG",
        "destination_country": "Egypt",
        "country": "Egypt",
        "departure_time": "02:30 AM",
        "arrival_time": "09:30 AM",
        "duration": "9h 30m",
        "price_economy": 39800,
        "price_business": 105000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "CAI (Cairo)",
        "layover_duration": "1h 45m transit at Cairo",
        "aircraft": "Airbus A220-300"
    },

    # ── 17. TURKEY (Istanbul, Antalya, Cappadocia) ──────────────────────────────
    {
        "id": 42,
        "airline_name": "Turkish Airlines",
        "airline_code": "TK",
        "flight_number": "TK-721",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Istanbul, Turkey",
        "destination_code": "IST",
        "destination_country": "Turkey",
        "country": "Turkey",
        "departure_time": "06:50 AM",
        "arrival_time": "11:30 AM",
        "duration": "7h 10m",
        "price_economy": 43500,
        "price_business": 118000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 777-300ER"
    },
    {
        "id": 43,
        "airline_name": "Turkish Airlines (Transit Connection)",
        "airline_code": "TK",
        "flight_number": "TK-717 / TK-2006",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Cappadocia (Nevsehir), Turkey",
        "destination_code": "NAV",
        "destination_country": "Turkey",
        "country": "Turkey",
        "departure_time": "06:15 AM",
        "arrival_time": "02:30 PM",
        "duration": "10h 45m",
        "price_economy": 48200,
        "price_business": 128000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "IST (Istanbul)",
        "layover_duration": "2h 00m transit at IST",
        "aircraft": "Airbus A330-300"
    },

    # ── 18. SAUDI ARABIA (Riyadh, Jeddah, Medina) ───────────────────────────────
    {
        "id": 44,
        "airline_name": "Saudia",
        "airline_code": "SV",
        "flight_number": "SV-741",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Riyadh, Saudi Arabia",
        "destination_code": "RUH",
        "destination_country": "Saudi Arabia",
        "country": "Saudi Arabia",
        "departure_time": "08:15 AM",
        "arrival_time": "10:35 AM",
        "duration": "4h 50m",
        "price_economy": 26500,
        "price_business": 72000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 787-9"
    },
    {
        "id": 45,
        "airline_name": "Saudia",
        "airline_code": "SV",
        "flight_number": "SV-759",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Jeddah, Saudi Arabia",
        "destination_code": "JED",
        "destination_country": "Saudi Arabia",
        "country": "Saudi Arabia",
        "departure_time": "02:00 PM",
        "arrival_time": "05:40 PM",
        "duration": "6h 10m",
        "price_economy": 28900,
        "price_business": 78000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 777-300ER"
    },

    # ── 19. QATAR (Doha) ────────────────────────────────────────────────────────
    {
        "id": 46,
        "airline_name": "Qatar Airways",
        "airline_code": "QR",
        "flight_number": "QR-557",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Doha, Qatar",
        "destination_code": "DOH",
        "destination_country": "Qatar",
        "country": "Qatar",
        "departure_time": "04:10 AM",
        "arrival_time": "05:45 AM",
        "duration": "4h 05m",
        "price_economy": 25500,
        "price_business": 69000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 787-9 Dreamliner"
    },

    # ── 20. SOUTH KOREA (Seoul, Busan, Jeju) ────────────────────────────────────
    {
        "id": 47,
        "airline_name": "Korean Air",
        "airline_code": "KE",
        "flight_number": "KE-656",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Seoul (Incheon), South Korea",
        "destination_code": "ICN",
        "destination_country": "South Korea",
        "country": "South Korea",
        "departure_time": "07:40 PM",
        "arrival_time": "06:15 AM (+1)",
        "duration": "7h 05m",
        "price_economy": 46800,
        "price_business": 132000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 787-9"
    },
    {
        "id": 48,
        "airline_name": "Asiana Airlines (Transit Connection)",
        "airline_code": "OZ",
        "flight_number": "OZ-768 / OZ-8041",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Jeju Island, South Korea",
        "destination_code": "CJU",
        "destination_country": "South Korea",
        "country": "South Korea",
        "departure_time": "08:15 PM",
        "arrival_time": "10:30 AM (+1)",
        "duration": "10h 45m",
        "price_economy": 49900,
        "price_business": 138000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "ICN (Seoul Incheon)",
        "layover_duration": "2h 00m transit at Incheon",
        "aircraft": "Airbus A350-900"
    },

    # ── 21. VIETNAM (Hanoi, Ho Chi Minh City, Da Nang) ──────────────────────────
    {
        "id": 49,
        "airline_name": "Vietnam Airlines",
        "airline_code": "VN",
        "flight_number": "VN-970",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Hanoi, Vietnam",
        "destination_code": "HAN",
        "destination_country": "Vietnam",
        "country": "Vietnam",
        "departure_time": "11:35 PM",
        "arrival_time": "05:15 AM (+1)",
        "duration": "4h 10m",
        "price_economy": 22500,
        "price_business": 62000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Airbus A321neo"
    },
    {
        "id": 50,
        "airline_name": "VietJet Air",
        "airline_code": "VJ",
        "flight_number": "VJ-894",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Ho Chi Minh City, Vietnam",
        "destination_code": "SGN",
        "destination_country": "Vietnam",
        "country": "Vietnam",
        "departure_time": "01:10 AM",
        "arrival_time": "07:25 AM",
        "duration": "4h 45m",
        "price_economy": 19800,
        "price_business": 54000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Airbus A330-300"
    },

    # ── 22. MALAYSIA (Kuala Lumpur, Penang) ─────────────────────────────────────
    {
        "id": 51,
        "airline_name": "Malaysia Airlines",
        "airline_code": "MH",
        "flight_number": "MH-187",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Kuala Lumpur, Malaysia",
        "destination_code": "KUL",
        "destination_country": "Malaysia",
        "country": "Malaysia",
        "departure_time": "01:25 AM",
        "arrival_time": "09:00 AM",
        "duration": "5h 05m",
        "price_economy": 23500,
        "price_business": 64000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 737-800"
    },

    # ── 23. SINGAPORE ───────────────────────────────────────────────────────────
    {
        "id": 52,
        "airline_name": "Singapore Airlines",
        "airline_code": "SQ",
        "flight_number": "SQ-421",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Singapore",
        "destination_code": "SIN",
        "destination_country": "Singapore",
        "country": "Singapore",
        "departure_time": "11:45 PM",
        "arrival_time": "07:40 AM (+1)",
        "duration": "5h 25m",
        "price_economy": 28500,
        "price_business": 79000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Airbus A350-900"
    },

    # ── 24. AUSTRALIA (Sydney, Melbourne, Brisbane, Perth) ──────────────────────
    {
        "id": 53,
        "airline_name": "Qantas",
        "airline_code": "QF",
        "flight_number": "QF-68",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Melbourne, Australia",
        "destination_code": "MEL",
        "destination_country": "Australia",
        "country": "Australia",
        "departure_time": "06:10 PM",
        "arrival_time": "11:55 AM (+1)",
        "duration": "12h 15m",
        "price_economy": 64500,
        "price_business": 182000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Airbus A330-200"
    },
    {
        "id": 54,
        "airline_name": "Singapore Airlines (Transit Connection)",
        "airline_code": "SQ",
        "flight_number": "SQ-423 / SQ-211",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Sydney, Australia",
        "destination_code": "SYD",
        "destination_country": "Australia",
        "country": "Australia",
        "departure_time": "11:45 PM",
        "arrival_time": "07:15 PM (+1)",
        "duration": "15h 00m",
        "price_economy": 62800,
        "price_business": 178000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "SIN (Singapore)",
        "layover_duration": "2h 15m transit at Changi (SIN)",
        "aircraft": "Airbus A380-800"
    },

    # ── 25. NEW ZEALAND (Auckland, Queenstown) ──────────────────────────────────
    {
        "id": 55,
        "airline_name": "Air New Zealand (Transit Connection)",
        "airline_code": "NZ",
        "flight_number": "SQ-421 / NZ-281",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Auckland, New Zealand",
        "destination_code": "AKL",
        "destination_country": "New Zealand",
        "country": "New Zealand",
        "departure_time": "11:45 PM",
        "arrival_time": "11:30 PM (+1)",
        "duration": "18h 15m",
        "price_economy": 76500,
        "price_business": 218000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "SIN (Singapore)",
        "layover_duration": "2h 45m transit at SIN",
        "aircraft": "Boeing 787-9 Dreamliner"
    },

    # ── 26. CANADA (Toronto, Vancouver, Montreal) ───────────────────────────────
    {
        "id": 56,
        "airline_name": "Air Canada",
        "airline_code": "AC",
        "flight_number": "AC-043",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Toronto, Canada",
        "destination_code": "YYZ",
        "destination_country": "Canada",
        "country": "Canada",
        "departure_time": "11:15 PM",
        "arrival_time": "05:40 AM (+1)",
        "duration": "14h 55m",
        "price_economy": 79500,
        "price_business": 238000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 777-200LR"
    },
    {
        "id": 57,
        "airline_name": "Lufthansa (Transit Connection)",
        "airline_code": "LH",
        "flight_number": "LH-757 / LH-492",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Vancouver, Canada",
        "destination_code": "YVR",
        "destination_country": "Canada",
        "country": "Canada",
        "departure_time": "03:05 AM",
        "arrival_time": "02:15 PM",
        "duration": "18h 40m",
        "price_economy": 82000,
        "price_business": 242000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "FRA (Frankfurt)",
        "layover_duration": "2h 20m transit at FRA",
        "aircraft": "Boeing 747-8"
    },

    # ── 27. SOUTH AFRICA (Johannesburg, Cape Town) ──────────────────────────────
    {
        "id": 58,
        "airline_name": "Emirates (Transit Connection)",
        "airline_code": "EK",
        "flight_number": "EK-501 / EK-772",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Cape Town, South Africa",
        "destination_code": "CPT",
        "destination_country": "South Africa",
        "country": "South Africa",
        "departure_time": "04:30 AM",
        "arrival_time": "04:25 PM",
        "duration": "15h 25m",
        "price_economy": 58000,
        "price_business": 164000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "DXB (Dubai)",
        "layover_duration": "2h 15m transit at DXB",
        "aircraft": "Boeing 777-300ER"
    },
    {
        "id": 59,
        "airline_name": "Qatar Airways (Transit Connection)",
        "airline_code": "QR",
        "flight_number": "QR-571 / QR-1363",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Johannesburg, South Africa",
        "destination_code": "JNB",
        "destination_country": "South Africa",
        "country": "South Africa",
        "departure_time": "03:45 AM",
        "arrival_time": "03:10 PM",
        "duration": "14h 55m",
        "price_economy": 54000,
        "price_business": 156000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "DOH (Doha)",
        "layover_duration": "2h 00m transit at DOH",
        "aircraft": "Airbus A350-900"
    },

    # ── 28. KENYA & TANZANIA (Nairobi, Zanzibar, Kilimanjaro) ───────────────────
    {
        "id": 60,
        "airline_name": "Kenya Airways",
        "airline_code": "KQ",
        "flight_number": "KQ-205",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Nairobi, Kenya",
        "destination_code": "NBO",
        "destination_country": "Kenya",
        "country": "Kenya",
        "departure_time": "06:15 AM",
        "arrival_time": "09:55 AM",
        "duration": "6h 10m",
        "price_economy": 36500,
        "price_business": 98000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 787-8 Dreamliner"
    },
    {
        "id": 61,
        "airline_name": "Ethiopian Airlines (Transit Connection)",
        "airline_code": "ET",
        "flight_number": "ET-641 / ET-815",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Zanzibar, Tanzania",
        "destination_code": "ZNZ",
        "destination_country": "Tanzania",
        "country": "Tanzania",
        "departure_time": "04:40 AM",
        "arrival_time": "12:30 PM",
        "duration": "10h 20m",
        "price_economy": 42000,
        "price_business": 114000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "ADD (Addis Ababa)",
        "layover_duration": "1h 50m transit at ADD",
        "aircraft": "Boeing 787-9"
    },

    # ── 29. MAURITIUS ───────────────────────────────────────────────────────────
    {
        "id": 62,
        "airline_name": "Air Mauritius",
        "airline_code": "MK",
        "flight_number": "MK-749",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Mauritius (Port Louis)",
        "destination_code": "MRU",
        "destination_country": "Mauritius",
        "country": "Mauritius",
        "departure_time": "02:45 AM",
        "arrival_time": "07:15 AM",
        "duration": "6h 00m",
        "price_economy": 38900,
        "price_business": 105000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Airbus A330-900neo"
    },

    # ── 30. NETHERLANDS (Amsterdam) ─────────────────────────────────────────────
    {
        "id": 63,
        "airline_name": "KLM Royal Dutch Airlines",
        "airline_code": "KL",
        "flight_number": "KL-878",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Amsterdam, Netherlands",
        "destination_code": "AMS",
        "destination_country": "Netherlands",
        "country": "Netherlands",
        "departure_time": "03:30 AM",
        "arrival_time": "08:50 AM",
        "duration": "8h 50m",
        "price_economy": 55800,
        "price_business": 154000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 787-10 Dreamliner"
    },

    # ── 31. AUSTRIA, PORTUGAL, IRELAND, ICELAND, NORDICS ────────────────────────
    {
        "id": 64,
        "airline_name": "Austrian Airlines",
        "airline_code": "OS",
        "flight_number": "OS-034",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Vienna, Austria",
        "destination_code": "VIE",
        "destination_country": "Austria",
        "country": "Austria",
        "departure_time": "01:45 AM",
        "arrival_time": "06:10 AM",
        "duration": "7h 55m",
        "price_economy": 51000,
        "price_business": 142000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 777-200ER"
    },
    {
        "id": 65,
        "airline_name": "TAP Air Portugal (Transit Connection)",
        "airline_code": "TP",
        "flight_number": "LH-757 / TP-573",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Lisbon, Portugal",
        "destination_code": "LIS",
        "destination_country": "Portugal",
        "country": "Portugal",
        "departure_time": "03:05 AM",
        "arrival_time": "01:30 PM",
        "duration": "14h 55m",
        "price_economy": 53500,
        "price_business": 148000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "FRA (Frankfurt)",
        "layover_duration": "2h 15m transit at FRA",
        "aircraft": "Airbus A321neo"
    },
    {
        "id": 66,
        "airline_name": "Finnair (Transit Connection)",
        "airline_code": "AY",
        "flight_number": "AY-122 / AY-951",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Stockholm, Sweden",
        "destination_code": "ARN",
        "destination_country": "Sweden",
        "country": "Sweden",
        "departure_time": "09:30 AM",
        "arrival_time": "05:40 PM",
        "duration": "11h 40m",
        "price_economy": 52000,
        "price_business": 144000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "HEL (Helsinki)",
        "layover_duration": "1h 40m transit at HEL",
        "aircraft": "Airbus A350-900"
    },
    {
        "id": 67,
        "airline_name": "Qatar Airways (Transit Connection)",
        "airline_code": "QR",
        "flight_number": "QR-557 / QR-175",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Oslo, Norway",
        "destination_code": "OSL",
        "destination_country": "Norway",
        "country": "Norway",
        "departure_time": "04:10 AM",
        "arrival_time": "01:50 PM",
        "duration": "13h 10m",
        "price_economy": 54500,
        "price_business": 149000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "DOH (Doha)",
        "layover_duration": "2h 10m transit at DOH",
        "aircraft": "Boeing 787-9"
    },
    {
        "id": 68,
        "airline_name": "Lufthansa (Transit Connection)",
        "airline_code": "LH",
        "flight_number": "LH-761 / LH-844",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Copenhagen, Denmark",
        "destination_code": "CPH",
        "destination_country": "Denmark",
        "country": "Denmark",
        "departure_time": "03:30 AM",
        "arrival_time": "12:15 PM",
        "duration": "12h 15m",
        "price_economy": 51500,
        "price_business": 142000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "FRA (Frankfurt)",
        "layover_duration": "1h 55m transit at FRA",
        "aircraft": "Airbus A350-900"
    },

    # ── 32. BRAZIL & MEXICO ─────────────────────────────────────────────────────
    {
        "id": 69,
        "airline_name": "LATAM / Qatar Airways (Transit Connection)",
        "airline_code": "LA",
        "flight_number": "QR-557 / QR-779",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "São Paulo, Brazil",
        "destination_code": "GRU",
        "destination_country": "Brazil",
        "country": "Brazil",
        "departure_time": "04:10 AM",
        "arrival_time": "05:40 PM",
        "duration": "22h 00m",
        "price_economy": 92000,
        "price_business": 275000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "DOH (Doha)",
        "layover_duration": "2h 45m transit at DOH",
        "aircraft": "Boeing 777-300ER"
    },
    {
        "id": 70,
        "airline_name": "Aeromexico / Air France (Transit Connection)",
        "airline_code": "AM",
        "flight_number": "AF-225 / AM-004",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Mexico City, Mexico",
        "destination_code": "MEX",
        "destination_country": "Mexico",
        "country": "Mexico",
        "departure_time": "01:25 AM",
        "arrival_time": "06:15 PM",
        "duration": "24h 20m",
        "price_economy": 88500,
        "price_business": 260000,
        "stops": "1 Stop (Transit)",
        "transit_hub": "CDG (Paris Charles de Gaulle)",
        "layover_duration": "3h 10m transit at CDG",
        "aircraft": "Boeing 787-9 Dreamliner"
    },

    # ── 33. OMAN, JORDAN, KUWAIT, BAHRAIN, SRI LANKA, NEPAL ─────────────────────
    {
        "id": 71,
        "airline_name": "Oman Air",
        "airline_code": "WY",
        "flight_number": "WY-204",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Muscat, Oman",
        "destination_code": "MCT",
        "destination_country": "Oman",
        "country": "Oman",
        "departure_time": "04:15 PM",
        "arrival_time": "06:05 PM",
        "duration": "3h 20m",
        "price_economy": 19500,
        "price_business": 52000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 737 Max 8"
    },
    {
        "id": 72,
        "airline_name": "Royal Jordanian",
        "airline_code": "RJ",
        "flight_number": "RJ-183",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Amman, Jordan",
        "destination_code": "AMM",
        "destination_country": "Jordan",
        "country": "Jordan",
        "departure_time": "05:20 AM",
        "arrival_time": "09:10 AM",
        "duration": "6h 20m",
        "price_economy": 32000,
        "price_business": 86000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Airbus A320neo"
    },
    {
        "id": 73,
        "airline_name": "SriLankan Airlines",
        "airline_code": "UL",
        "flight_number": "UL-142",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Colombo, Sri Lanka",
        "destination_code": "CMB",
        "destination_country": "Sri Lanka",
        "country": "Sri Lanka",
        "departure_time": "03:10 AM",
        "arrival_time": "05:45 AM",
        "duration": "2h 35m",
        "price_economy": 16500,
        "price_business": 44000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Airbus A330-300"
    },
    {
        "id": 74,
        "airline_name": "Nepal Airlines",
        "airline_code": "RA",
        "flight_number": "RA-206",
        "origin": "Delhi, India",
        "origin_code": "DEL",
        "origin_country": "India",
        "destination": "Kathmandu, Nepal",
        "destination_code": "KTM",
        "destination_country": "Nepal",
        "country": "Nepal",
        "departure_time": "10:40 AM",
        "arrival_time": "12:30 PM",
        "duration": "1h 35m",
        "price_economy": 9500,
        "price_business": 26000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Airbus A320-200"
    },
    {
        "id": 75,
        "airline_name": "Kuwait Airways",
        "airline_code": "KU",
        "flight_number": "KU-384",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Kuwait City, Kuwait",
        "destination_code": "KWI",
        "destination_country": "Kuwait",
        "country": "Kuwait",
        "departure_time": "06:00 AM",
        "arrival_time": "08:15 AM",
        "duration": "4h 45m",
        "price_economy": 22000,
        "price_business": 59000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Airbus A330-800neo"
    },
    {
        "id": 76,
        "airline_name": "Gulf Air",
        "airline_code": "GF",
        "flight_number": "GF-057",
        "origin": "Mumbai, India",
        "origin_code": "BOM",
        "origin_country": "India",
        "destination": "Manama, Bahrain",
        "destination_code": "BAH",
        "destination_country": "Bahrain",
        "country": "Bahrain",
        "departure_time": "09:15 AM",
        "arrival_time": "11:05 AM",
        "duration": "4h 20m",
        "price_economy": 21000,
        "price_business": 57000,
        "stops": "Non-stop",
        "transit_hub": None,
        "layover_duration": None,
        "aircraft": "Boeing 787-9"
    }
]

def synthesize_dynamic_flights(origin_query: Optional[str], dest_query: Optional[str]) -> List[dict]:
    """
    Intelligently generates authentic realistic flight & transit routes if a user
    searches for any country/city not directly in static seed data.
    """
    target = (dest_query or "Worldwide Destination").strip().title()
    orig = (origin_query or "Mumbai, India").strip().title()
    
    # Extract code or guess
    dest_code = "".join([c for c in target if c.isupper()])[:3] or target[:3].upper()
    orig_code = "".join([c for c in orig if c.isupper()])[:3] or orig[:3].upper()
    if len(dest_code) < 3:
        dest_code = (target[:3] + "XX")[:3].upper()
    if len(orig_code) < 3:
        orig_code = (orig[:3] + "XX")[:3].upper()

    dest_country = target.split(',')[-1].strip() if ',' in target else target

    synthesized = [
        {
            "id": 9000 + random.randint(100, 999),
            "airline_name": "Emirates (Express Transit)",
            "airline_code": "EK",
            "flight_number": f"EK-{random.randint(500, 990)}",
            "origin": orig,
            "origin_code": orig_code,
            "origin_country": "India" if "India" in orig else "International",
            "destination": target,
            "destination_code": dest_code,
            "destination_country": dest_country,
            "country": dest_country,
            "departure_time": "04:30 AM",
            "arrival_time": "02:15 PM",
            "duration": "11h 45m",
            "price_economy": 48500,
            "price_business": 138000,
            "stops": "1 Stop (Transit)",
            "transit_hub": "DXB (Dubai)",
            "layover_duration": "1h 50m transit at Dubai (DXB)",
            "aircraft": "Boeing 777-300ER"
        },
        {
            "id": 9000 + random.randint(100, 999),
            "airline_name": "Qatar Airways (Hub Connection)",
            "airline_code": "QR",
            "flight_number": f"QR-{random.randint(400, 890)}",
            "origin": orig,
            "origin_code": orig_code,
            "origin_country": "India" if "India" in orig else "International",
            "destination": target,
            "destination_code": dest_code,
            "destination_country": dest_country,
            "country": dest_country,
            "departure_time": "03:45 AM",
            "arrival_time": "01:30 PM",
            "duration": "12h 15m",
            "price_economy": 51200,
            "price_business": 145000,
            "stops": "1 Stop (Transit)",
            "transit_hub": "DOH (Doha)",
            "layover_duration": "2h 10m transit at Hamad (DOH)",
            "aircraft": "Airbus A350-900"
        },
        {
            "id": 9000 + random.randint(100, 999),
            "airline_name": "Air India / Global Partner",
            "airline_code": "AI",
            "flight_number": f"AI-{random.randint(100, 499)}",
            "origin": orig,
            "origin_code": orig_code,
            "origin_country": "India" if "India" in orig else "International",
            "destination": target,
            "destination_code": dest_code,
            "destination_country": dest_country,
            "country": dest_country,
            "departure_time": "08:15 PM",
            "arrival_time": "07:45 AM (+1)",
            "duration": "9h 30m",
            "price_economy": 54000,
            "price_business": 152000,
            "stops": "Non-stop",
            "transit_hub": None,
            "layover_duration": None,
            "aircraft": "Boeing 787-9 Dreamliner"
        }
    ]
    return synthesized

@router.get("/countries")
def get_flight_countries():
    """
    Returns the comprehensive directory of all world countries and regions
    with flight availability and active routes count.
    """
    results = []
    for item in GLOBAL_COUNTRIES_CATALOG:
        country_name = item["country"]
        short_c = item.get("short_country", country_name)
        count = sum(1 for r in MOCK_ROUTES if country_name.lower() in r["destination_country"].lower() or short_c.lower() in r["destination_country"].lower() or country_name.lower() in r["country"].lower())
        results.append({
            **item,
            "flight_count": count if count > 0 else 3
        })
    return results

@router.get("/search")
def search_flights(
    origin: Optional[str] = None,
    destination: Optional[str] = None,
    cabin_class: Optional[str] = "Economy",
    country: Optional[str] = None,
    stops: Optional[str] = None,
    airline: Optional[str] = None,
    max_price: Optional[float] = None
):
    results = list(MOCK_ROUTES)

    if origin:
        orig_clean = origin.lower().strip()
        results = [
            r for r in results 
            if orig_clean in r["origin"].lower() 
            or orig_clean in r["origin_code"].lower()
            or orig_clean in r.get("origin_country", "").lower()
        ]

    if destination:
        dest_clean = destination.lower().strip()
        results = [
            r for r in results 
            if dest_clean in r["destination"].lower() 
            or dest_clean in r["destination_code"].lower() 
            or dest_clean in r.get("destination_country", "").lower()
            or dest_clean in r.get("country", "").lower()
        ]

    if country and country.lower() != 'all':
        c_clean = country.lower().strip()
        results = [
            r for r in results 
            if c_clean in r.get("destination_country", "").lower() 
            or c_clean in r.get("country", "").lower()
            or c_clean in r["destination"].lower()
        ]

    if stops and stops.lower() != 'all':
        s_clean = stops.lower().strip()
        if "non" in s_clean or "direct" in s_clean:
            results = [r for r in results if "non" in r["stops"].lower() or "direct" in r["stops"].lower()]
        elif "stop" in s_clean or "transit" in s_clean or "layover" in s_clean:
            results = [r for r in results if "stop" in r["stops"].lower() or r.get("transit_hub") is not None]

    if airline and airline.lower() != 'all':
        a_clean = airline.lower().strip()
        results = [r for r in results if a_clean in r["airline_name"].lower() or a_clean in r["airline_code"].lower()]

    if max_price:
        price_field = "price_business" if cabin_class == "Business" else "price_economy"
        results = [r for r in results if r[price_field] <= max_price]

    # If user searched for a specific destination/country that yielded 0 static results, synthesize authentic flights!
    if len(results) == 0 and (destination or country):
        target_dest = destination or country
        results = synthesize_dynamic_flights(origin, target_dest)
        if stops and stops.lower() != 'all':
            s_clean = stops.lower().strip()
            if "non" in s_clean:
                results = [r for r in results if "non" in r["stops"].lower()]
            elif "stop" in s_clean or "transit" in s_clean:
                results = [r for r in results if "stop" in r["stops"].lower()]

    return results

@router.post("/book", response_model=FlightBookingSchema, status_code=status.HTTP_201_CREATED)
def create_flight_booking(
    booking_in: FlightBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip_id = booking_in.trip_id
    dest_keyword = booking_in.destination.split(',')[0].strip()

    if trip_id:
        trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
        # If the trip destination is completely mismatched, find or create the right trip
        if trip and not (dest_keyword.lower() in trip.destination.lower() or trip.destination.lower() in booking_in.destination.lower()):
            matching_trip = db.query(Trip).filter(
                Trip.user_id == current_user.id,
                Trip.destination.ilike(f"%{dest_keyword}%")
            ).first()
            if matching_trip:
                trip_id = matching_trip.id
            else:
                new_trip = Trip(
                    user_id=current_user.id,
                    title=f"Trip to {booking_in.destination}",
                    destination=booking_in.destination,
                    start_date=booking_in.departure_date,
                    end_date=booking_in.departure_date,
                    budget=int(booking_in.ticket_price * 2 + 20000)
                )
                db.add(new_trip)
                db.flush()
                trip_id = new_trip.id
        elif not trip:
            trip_id = None

    if not trip_id:
        matching_trip = db.query(Trip).filter(
            Trip.user_id == current_user.id,
            Trip.destination.ilike(f"%{dest_keyword}%")
        ).first()
        if matching_trip:
            trip_id = matching_trip.id
        else:
            default_trip = Trip(
                user_id=current_user.id,
                title=f"Trip to {booking_in.destination}",
                destination=booking_in.destination,
                start_date=booking_in.departure_date,
                end_date=booking_in.departure_date,
                budget=int(booking_in.ticket_price * 2 + 20000)
            )
            db.add(default_trip)
            db.flush()
            trip_id = default_trip.id

    booking_ref = generate_flight_reference()
    gates = ["G2", "G4", "G9", "B12", "C18", "A04", "D11"]
    terminals = ["T1", "T2", "T3", "T4"]

    booking = FlightBooking(
        user_id=current_user.id,
        trip_id=trip_id,
        airline_name=booking_in.airline_name,
        airline_code=booking_in.airline_code,
        flight_number=booking_in.flight_number,
        origin=booking_in.origin,
        origin_code=booking_in.origin_code,
        destination=booking_in.destination,
        destination_code=booking_in.destination_code,
        departure_date=booking_in.departure_date,
        departure_time=booking_in.departure_time,
        arrival_time=booking_in.arrival_time,
        duration=booking_in.duration or "1h 45m",
        passenger_name=booking_in.passenger_name,
        passenger_email=booking_in.passenger_email,
        seat_number=booking_in.seat_number or f"{random.randint(4, 28)}{random.choice(['A', 'B', 'C', 'D', 'F'])}",
        cabin_class=booking_in.cabin_class or "Economy",
        gate=booking_in.gate or random.choice(gates),
        terminal=booking_in.terminal or random.choice(terminals),
        ticket_price=booking_in.ticket_price,
        booking_reference=booking_ref,
        status="confirmed"
    )
    db.add(booking)

    # Automatically add flight expense to ledger with unique reference tag
    expense = Expense(
        user_id=current_user.id,
        trip_id=trip_id,
        title=f"Flight: {booking_in.airline_name} ({booking_in.flight_number}) [{booking_ref}] {booking_in.origin_code}→{booking_in.destination_code}",
        amount=booking_in.ticket_price,
        category="Transportation",
        date=booking_in.departure_date
    )
    db.add(expense)

    db.commit()
    db.refresh(booking)
    return booking

@router.get("/my-bookings", response_model=List[FlightBookingSchema])
def get_my_flight_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bookings = db.query(FlightBooking).filter(FlightBooking.user_id == current_user.id).order_by(FlightBooking.id.desc()).all()
    return bookings

@router.delete("/my-bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_flight_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(FlightBooking).filter(FlightBooking.id == booking_id, FlightBooking.user_id == current_user.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Accurately delete ONLY this specific flight's expense using booking reference or exact flight details
    matching_expense = db.query(Expense).filter(
        Expense.user_id == current_user.id,
        (
            Expense.title.like(f"%{booking.booking_reference}%") |
            (
                Expense.title.like(f"%{booking.flight_number}%") &
                (Expense.amount == booking.ticket_price) &
                (Expense.date == booking.departure_date)
            )
        )
    ).first()

    if matching_expense:
        db.delete(matching_expense)

    db.delete(booking)
    db.commit()
    return None
