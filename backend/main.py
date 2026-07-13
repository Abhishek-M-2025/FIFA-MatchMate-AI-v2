import asyncio
import logging
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from datetime import datetime

# Import services
from mock_data import LIVE_DATA, update_live_data
from gemini import get_gemini_response

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FIFA_MatchMate_Backend")

app = FastAPI(
    title="FIFA MatchMate AI API",
    description="Real-time stadium orchestration backend for the FIFA World Cup 2026",
    version="1.0.0"
)

# CORS configuration to allow local React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input models
class ChatRequest(BaseModel):
    message: str
    role: str = "fan"  # "fan" or "organizer"

class ChatResponse(BaseModel):
    response: str
    timestamp: str

class AlertTriggerRequest(BaseModel):
    severity: str  # "Info", "Warning", "Critical"
    title: str

# Weather cache to avoid spamming Open-Meteo API
weather_cache = {
    "data": None,
    "last_updated": 0
}

# Mapping Open-Meteo weather codes to descriptors & icons
WEATHER_CODES = {
    0: ("Clear Sky", "Sun"),
    1: ("Mainly Clear", "CloudSun"),
    2: ("Partly Cloudy", "CloudSun"),
    3: ("Overcast", "Cloud"),
    45: ("Foggy", "CloudFog"),
    48: ("Depositing Rime Fog", "CloudFog"),
    51: ("Light Drizzle", "CloudDrizzle"),
    53: ("Moderate Drizzle", "CloudDrizzle"),
    55: ("Dense Drizzle", "CloudDrizzle"),
    61: ("Slight Rain", "CloudRain"),
    63: ("Moderate Rain", "CloudRain"),
    65: ("Heavy Rain", "CloudRain"),
    80: ("Slight Rain Showers", "CloudRain"),
    81: ("Moderate Rain Showers", "CloudRain"),
    82: ("Violent Rain Showers", "CloudRain"),
    95: ("Thunderstorm", "CloudLightning"),
    96: ("Thunderstorm with Hail", "CloudLightning"),
    99: ("Thunderstorm with Heavy Hail", "CloudLightning"),
}

def map_weather_code(code: int) -> dict:
    description, icon = WEATHER_CODES.get(code, ("Unknown Weather", "Cloud"))
    return {"code": code, "description": description, "icon": icon}

async def update_data_loop():
    """Background task running to update mock data every 5 seconds."""
    while True:
        try:
            update_live_data()
            logger.debug("Live data values updated.")
        except Exception as e:
            logger.error(f"Error in background update task: {e}")
        await asyncio.sleep(5)

@app.on_event("startup")
async def startup_event():
    """Starts the background updater task on application startup."""
    asyncio.create_task(update_data_loop())
    logger.info("Background update task started.")

@app.get("/api/status")
def get_status():
    return {"status": "healthy", "service": "FIFA MatchMate AI Service"}

@app.get("/api/live-data")
def get_live_data():
    """Returns the current simulated stadium state."""
    return LIVE_DATA

@app.post("/api/chat", response_model=ChatResponse)
def post_chat(payload: ChatRequest):
    """Answers queries using current mock data context + Google Gemini."""
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty.")
    
    response_text = get_gemini_response(payload.message, LIVE_DATA, payload.role)
    return ChatResponse(
        response=response_text,
        timestamp=datetime.utcnow().isoformat() + "Z"
    )

@app.post("/api/alerts/trigger")
def trigger_alert(payload: AlertTriggerRequest):
    """Enables organizers to push custom critical emergency alerts dynamically."""
    if payload.severity not in ["Info", "Warning", "Critical"]:
        raise HTTPException(status_code=400, detail="Severity must be 'Info', 'Warning', or 'Critical'")
    
    new_alert = {
        "id": str(len(LIVE_DATA["alerts"]) + 1),
        "severity": payload.severity,
        "title": payload.title,
        "timestamp": datetime.utcnow().strftime("%H:%M")
    }
    
    # Prepend new alerts to be displayed first
    LIVE_DATA["alerts"].insert(0, new_alert)
    # Cap alerts at 10 to prevent memory growth
    LIVE_DATA["alerts"] = LIVE_DATA["alerts"][:10]
    
    return {"message": "Alert triggered successfully", "alert": new_alert}

@app.get("/api/weather")
async def get_weather():
    """Proxies Open-Meteo API dynamically to fetch weather info for Arlington (AT&T Stadium)."""
    current_time = time.time()
    # Cache for 5 minutes (300 seconds)
    if weather_cache["data"] and (current_time - weather_cache["last_updated"]) < 300:
        return weather_cache["data"]

    # Dallas, TX (Arlington AT&T Stadium) coordinates
    lat = 32.7473
    lon = -97.0945
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,weather_code,wind_speed_10m"
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                current = data.get("current", {})
                temp_c = current.get("temperature_2m", 25.0)
                temp_f = round((temp_c * 9/5) + 32, 1)
                weather_code = current.get("weather_code", 0)
                mapped = map_weather_code(weather_code)
                
                weather_info = {
                    "temp_c": temp_c,
                    "temp_f": temp_f,
                    "description": mapped["description"],
                    "icon": mapped["icon"],
                    "wind_speed_kmh": current.get("wind_speed_10m", 10.0),
                    "source": "Open-Meteo API"
                }
                
                weather_cache["data"] = weather_info
                weather_cache["last_updated"] = current_time
                return weather_info
            
            else:
                logger.warning(f"Open-Meteo returned status {response.status_code}. Using fallback.")
    except Exception as e:
        logger.error(f"Error fetching from Open-Meteo: {e}")

    # Fallback/Mock weather in case network/API fails
    fallback_temp_c = 28.5
    return {
        "temp_c": fallback_temp_c,
        "temp_f": round((fallback_temp_c * 9/5) + 32, 1),
        "description": "Partly Cloudy",
        "icon": "CloudSun",
        "wind_speed_kmh": 12.0,
        "source": "Mock Live Weather"
    }

import time
