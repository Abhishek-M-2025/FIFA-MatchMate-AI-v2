import asyncio
import logging
import time
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

# Import services
from config import settings
from services.telemetry_service import telemetry_service
from services.weather_service import weather_service
from services.gemini_service import get_gemini_response

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FIFA_MatchMate_Backend")

app = FastAPI(
    title="FIFA MatchMate AI API",
    description="Real-time stadium orchestration backend for the FIFA World Cup 2026",
    version="1.0.0"
)

# CORS configuration restricted to settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input models with validation
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    role: str = Field("fan")

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        role_val = v.strip().lower()
        if role_val not in ["fan", "organizer"]:
            raise ValueError("Role must be 'fan' or 'organizer'.")
        return role_val

class ChatResponse(BaseModel):
    response: str
    timestamp: str

class AlertTriggerRequest(BaseModel):
    severity: str
    title: str = Field(..., min_length=1, max_length=200)

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        sev_val = v.strip().title()
        if sev_val not in ["Info", "Warning", "Critical"]:
            raise ValueError("Severity must be 'Info', 'Warning', or 'Critical'.")
        return sev_val

# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.warning(f"Request validation failed for {request.url.path}: {exc}")
    # Return 422 for structural errors
    return JSONResponse(
        status_code=422,
        content={"detail": "Input validation error.", "errors": exc.errors()}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    logger.error(f"Internal error for {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."}
    )

async def update_data_loop():
    """Background task running to update mock data every 5 seconds."""
    while True:
        try:
            telemetry_service.update_data()
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
    return telemetry_service.get_live_data()

@app.post("/api/chat", response_model=ChatResponse)
def post_chat(payload: ChatRequest):
    """Answers queries using current mock data context + Google Gemini."""
    sanitized_message = telemetry_service.sanitize_input(payload.message)
    if not sanitized_message:
        raise HTTPException(status_code=400, detail="Message content cannot be empty.")
    
    live_data = telemetry_service.get_live_data()
    response_text = get_gemini_response(sanitized_message, live_data, payload.role)
    
    return ChatResponse(
        response=response_text,
        timestamp=datetime.utcnow().isoformat() + "Z"
    )

@app.post("/api/alerts/trigger")
def trigger_alert(payload: AlertTriggerRequest):
    """Enables organizers to push custom critical emergency alerts dynamically."""
    if payload.severity not in ["Info", "Warning", "Critical"]:
        raise HTTPException(status_code=400, detail="Severity must be 'Info', 'Warning', or 'Critical'")
    
    sanitized_title = telemetry_service.sanitize_input(payload.title)
    if not sanitized_title:
        raise HTTPException(status_code=400, detail="Alert title cannot be empty.")
        
    new_alert = telemetry_service.trigger_new_alert(payload.severity, sanitized_title)
    return {"message": "Alert triggered successfully", "alert": new_alert}

@app.get("/api/weather")
async def get_weather():
    """Proxies Open-Meteo API dynamically to fetch weather info for Arlington (AT&T Stadium)."""
    return await weather_service.get_weather()
