import os
import random
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
import google.generativeai as genai
from app.core.config import settings
from app.models.user import User
from app.trips.router import get_current_user

router = APIRouter()

VOYAGE_SYSTEM_INSTRUCTION = (
    "You are Voyage AI, an elite, charming, and deeply knowledgeable AI travel concierge, "
    "itinerary architect, and global trip planner. "
    "Your goal is to provide realistic, exciting, and structured travel recommendations, "
    "day-by-day itineraries (Morning/Afternoon/Evening), budget breakdowns in Indian Rupees (₹ INR) and USD ($), "
    "hotel & flight strategies, packing checklists, local foodie hotspots, and safety advice. "
    "Always format your responses with clean Markdown, bold headers, emoji bullet points, and tables when breaking down costs."
)

class ChatMessage(BaseModel):
    role: str # "user" or "model"
    parts: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: str

def generate_smart_fallback(message: str) -> str:
    msg = message.lower()
    
    if "manali" in msg or "himachal" in msg or "kasol" in msg or "spiti" in msg:
        return (
            "### 🏔️ **Curated Himachal Mountain Getaway**\n\n"
            "* **Best Time to Visit:** October to February (for snow) or March to June (pleasant mountain breeze).\n"
            "* **Estimated Budget:** **₹12,000 – ₹18,000 per person** (3–4 days).\n\n"
            "#### 🗓️ **Recommended 3-Day Plan:**\n"
            "* **Day 1 (Old Manali & Culture):** Check in, visit **Hadimba Temple**, and stroll down the vibrant lanes of Old Manali with wood-fired pizza at *Café 1947*.\n"
            "* **Day 2 (Adventure & Vistas):** Take a scenic drive through **Atal Tunnel** to **Sissu**, then enjoy paragliding or ATV rides in **Solang Valley**.\n"
            "* **Day 3 (Waterfalls & Hot Springs):** Hike to the stunning **Jogini Waterfalls** and relax in the natural sulfur springs at **Vashisht**.\n\n"
            "💡 *Pro-Tip: Rent a local two-wheeler or Himalayan bike for the best mobility!*"
        )
    elif "goa" in msg:
        return (
            "### 🌴 **Sun, Sand & Heritage: Goa Itinerary**\n\n"
            "* **Best Season:** November to March.\n"
            "* **Estimated Budget:** **₹15,000 – ₹25,000 per person** (4 days).\n\n"
            "#### 🗓️ **4-Day Highlights:**\n"
            "* **Day 1 (North Goa Beaches):** Relax at Anjuna or Vagator Beach and enjoy sunset cocktails at *Curlies* or *Thalassa*.\n"
            "* **Day 2 (Water Sports & Forts):** Jet ski & parasailing at Calangute/Baga, followed by a visit to **Chapora Fort**.\n"
            "* **Day 3 (Heritage & Architecture):** Explore the colorful Latin Quarter of **Fontainhas** in Panaji and visit the historic churches of Old Goa.\n"
            "* **Day 4 (South Goa Serenity):** Unwind at Palolem Beach and take a scenic river cruise.\n\n"
            "💡 *Foodie Tip: Try authentic Goan Fish Curry and Bebinca at a local Portuguese-style bistro!*"
        )
    elif "japan" in msg or "tokyo" in msg or "kyoto" in msg:
        return (
            "### ⛩️ **The Ultimate Japan Discovery (Tokyo & Kyoto)**\n\n"
            "* **Ideal Duration:** 7–10 Days.\n"
            "* **Estimated Budget:** **₹1,40,000 – ₹2,20,000 per person** (including flights & JR Pass).\n\n"
            "#### 🌸 **Top Experiences:**\n"
            "* **Tokyo:** Shibuya Crossing, teamLab Planets digital art museum, historic Asakusa Senso-ji temple, and Akihabara.\n"
            "* **Kyoto:** Walk through the mesmerizing 10,000 vermilion torii gates at **Fushimi Inari-Taisha**, explore Arashiyama Bamboo Grove, and visit the Golden Pavilion (Kinkaku-ji).\n"
            "* **Culinary Checklist:** Authentic Tonkotsu Ramen in Shinjuku, Fresh Sushi at Tsukiji Outer Market, and Matcha soft serve in Uji.\n\n"
            "💡 *Tip: Purchase a 7-day JR Rail Pass and pick up an eSIM before you land!*"
        )
    elif "budget" in msg or "cheap" in msg or "under" in msg:
        return (
            "### 💰 **Top Budget-Friendly Travel Destinations**\n\n"
            "Here are top-tier international and domestic destinations where you get incredible value:\n\n"
            "1. **Vietnam 🇻🇳 (₹45,000 – ₹65,000 all-in):** Hanoi, Ha Long Bay cruises, and Hoi An lanterns. Street food costs as low as ₹150/meal!\n"
            "2. **Bali, Indonesia 🇮🇩 (₹50,000 – ₹70,000):** Luxury private pool villas starting at ₹3,500/night, surf beaches, and lush Ubud waterfalls.\n"
            "3. **Thailand 🇹🇭 (₹40,000 – ₹60,000):** Bangkok street markets, Phuket beaches, and Chiang Mai temples.\n"
            "4. **Rajasthan, India 🇮🇳 (₹15,000 – ₹25,000):** Jaipur, Udaipur lake palaces, and Jaisalmer desert camps.\n\n"
            "Tell me your target budget and departure city, and I'll build a tailored financial breakdown!"
        )
    elif "packing" in msg or "pack" in msg or "checklist" in msg:
        return (
            "### 🎒 **Smart Travel Packing Checklist**\n\n"
            "#### 📄 **Essentials & Documents:**\n"
            "* [ ] Passport / ID Proof & Visa copies\n"
            "* [ ] Flight & Hotel booking confirmations\n"
            "* [ ] International Forex/Credit cards & local cash\n\n"
            "#### 🔌 **Electronics:**\n"
            "* [ ] Universal travel adapter & 20,000mAh Power bank\n"
            "* [ ] Noise-canceling headphones & charging cables\n\n"
            "#### 💊 **Health & Comfort:**\n"
            "* [ ] Basic first aid, motion sickness pills & electrolytes\n"
            "* [ ] Sunscreen (SPF 50+), lip balm & hand sanitizer\n\n"
            "Where are you heading? I can customize this checklist for summer, snow, or hiking!"
        )
    else:
        return (
            "### ✨ **Welcome to Voyage AI Travel Concierge!**\n\n"
            "I can assist you with:\n"
            "* 🗓️ **Custom Day-by-Day Itineraries** (with morning, afternoon & night schedules)\n"
            "* 💰 **Realistic Cost Breakdowns** in INR (₹) and USD ($)\n"
            "* 🏨 **Hotel & Neighborhood Recommendations**\n"
            "* 🎒 **Smart Packing Lists & Travel Prep**\n"
            "* ✈️ **Flight Tips & Best Time to Travel**\n\n"
            "Tell me where you would like to go, your travel duration, and who you're traveling with!"
        )

@router.post("/chat", response_model=ChatResponse)
def ai_chat(request: ChatRequest, current_user: User = Depends(get_current_user)):
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    
    if not api_key or len(api_key.strip()) < 10:
        return {"reply": generate_smart_fallback(request.message)}

    # List of candidate models in order of capability
    candidate_models = [
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-2.0-flash",
        "gemini-flash-latest",
        "gemini-2.5-flash-lite"
    ]

    for model_name in candidate_models:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=VOYAGE_SYSTEM_INSTRUCTION
            )

            # Format history for Google Generative AI
            gemini_history = []
            for h in request.history[-10:]: # keep last 10 turns for context
                role = "user" if h.role == "user" else "model"
                if h.parts and h.parts.strip():
                    gemini_history.append({"role": role, "parts": [h.parts]})

            chat = model.start_chat(history=gemini_history)
            response = chat.send_message(request.message)
            if response and response.text:
                return {"reply": response.text}
        except Exception as e:
            # Try next model in candidate list
            continue

    # If all API calls fail, return smart dynamic fallback
    return {"reply": generate_smart_fallback(request.message)}

