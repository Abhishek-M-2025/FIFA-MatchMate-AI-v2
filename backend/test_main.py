import pytest
from fastapi.testclient import TestClient
from main import app
from mock_data import LIVE_DATA
from config import settings
from services.gemini_service import generate_fallback_response, get_gemini_response

client = TestClient(app)

def test_status():
    """Validates simple API status health check."""
    response = client.get("/api/status")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_live_data():
    """Validates presence and format of required stadium telemetry structures."""
    response = client.get("/api/live-data")
    assert response.status_code == 200
    data = response.json()
    
    assert "crowd" in data
    assert "gates" in data
    assert "parking" in data
    assert "transport" in data
    assert "food" in data
    assert "washrooms" in data
    assert "volunteers" in data
    assert "medical" in data
    assert "alerts" in data
    assert "sustainability" in data
    assert "lost_and_found" in data

def test_weather():
    """Validates proxy or fallback weather response format."""
    response = client.get("/api/weather")
    assert response.status_code == 200
    data = response.json()
    assert "temp_c" in data
    assert "temp_f" in data
    assert "description" in data
    assert "icon" in data
    assert "wind_speed_kmh" in data
    assert "source" in data

def test_trigger_alert():
    """Validates custom alerts injection endpoint."""
    payload = {
        "severity": "Warning",
        "title": "Drill test alert triggered from suite."
    }
    response = client.post("/api/alerts/trigger", json=payload)
    assert response.status_code == 200
    assert response.json()["message"] == "Alert triggered successfully"

def test_chat_validation():
    """Validates payload validation on Chat endpoint."""
    # Structural validation (empty string triggers 422 or handled via validator)
    response = client.post("/api/chat", json={"message": "", "role": "fan"})
    assert response.status_code == 422

    # Whitespace validation triggers 400
    response = client.post("/api/chat", json={"message": " ", "role": "fan"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Message content cannot be empty."

    # Invalid role validation
    response = client.post("/api/chat", json={"message": "hello", "role": "hacker"})
    assert response.status_code == 422

def test_alert_validation():
    """Validates payload validation on trigger alert endpoint."""
    # Invalid severity
    response = client.post("/api/alerts/trigger", json={"severity": "Emergency", "title": "Help"})
    assert response.status_code == 422

    # Empty title
    response = client.post("/api/alerts/trigger", json={"severity": "Warning", "title": ""})
    assert response.status_code == 422

def test_chat_response(monkeypatch):
    """Mocks the gemini.py dependency to test the FastAPI chat response handling."""
    import main
    def mock_gemini(message, data, role):
        return f"Mocked Response for: {message}"
        
    monkeypatch.setattr(main, "get_gemini_response", mock_gemini)
    
    payload = {
        "message": "Where is the nearest toilet?",
        "role": "fan"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "timestamp" in data
    assert "Where is the nearest toilet?" in data["response"]

# ----------------- NEW SECURITY & GRACEFUL FALLBACK TEST CASES -----------------

def test_fallback_response_generation():
    """Tests the fallback response rules across various queries (gate, parking, food, language)."""
    # 1. Gate query
    res = generate_fallback_response("Which gate has shortest wait time?", LIVE_DATA, "fan")
    assert "gate" in res.lower()
    
    # 2. Parking query
    res = generate_fallback_response("Where is available parking?", LIVE_DATA, "fan")
    assert "parking" in res.lower() or "zone" in res.lower()
    
    # 3. Concessions query
    res = generate_fallback_response("I want to find BBQ food", LIVE_DATA, "fan")
    assert "concessions" in res.lower() or "bbq" in res.lower() or "taco" in res.lower()

    # 4. Spanish translation check
    res_es = generate_fallback_response("¿Dónde está la puerta?", LIVE_DATA, "fan")
    assert "puerta" in res_es.lower() or "modo fallido ia" in res_es.lower()

    # 5. French translation check
    res_fr = generate_fallback_response("Où est la porte?", LIVE_DATA, "fan")
    assert "porte" in res_fr.lower() or "mode secours" in res_fr.lower()

    # 6. Logistics summary audit (organizer role)
    res_org = generate_fallback_response("Run stadium logistics audit", LIVE_DATA, "organizer")
    assert "logistics" in res_org.lower() or "volunteers" in res_org.lower() or "steward" in res_org.lower()

def test_missing_gemini_api_key(monkeypatch):
    """Verifies that API key absence invokes fallback mode and does not crash."""
    import services.gemini_service as gs
    monkeypatch.setattr(gs, "genai_available", False)
    
    response = client.post("/api/chat", json={"message": "Where is Gate C?", "role": "fan"})
    assert response.status_code == 200
    assert "fallback" in response.json()["response"].lower() or "modo" in response.json()["response"].lower() or "secours" in response.json()["response"].lower()

def test_invalid_gemini_api_key(monkeypatch):
    """Simulates an invalid API key error raising an exception and triggering fallback."""
    import services.gemini_service as gs
    monkeypatch.setattr(gs, "genai_available", True)
    
    # Mock generative model to raise Exception on generate_content
    class MockModel:
        def __init__(self, *args, **kwargs):
            pass
        def generate_content(self, *args, **kwargs):
            raise Exception("API key expired or invalid.")
            
    monkeypatch.setattr(gs.genai, "GenerativeModel", MockModel)
    
    response = client.post("/api/chat", json={"message": "Check parking spots", "role": "fan"})
    assert response.status_code == 200
    assert "fallback" in response.json()["response"].lower() or "parking" in response.json()["response"].lower()

def test_gemini_api_failure(monkeypatch):
    """Simulates a generic Gemini server-side or resource exhausted error."""
    import services.gemini_service as gs
    monkeypatch.setattr(gs, "genai_available", True)
    
    def mock_generate_content(*args, **kwargs):
        raise Exception("Resource exhausted (503 Service Unavailable)")
        
    class MockModel:
        def __init__(self, *args, **kwargs):
            pass
        def generate_content(self, *args, **kwargs):
            mock_generate_content()
            
    monkeypatch.setattr(gs.genai, "GenerativeModel", MockModel)
    
    response = client.post("/api/chat", json={"message": "Emergency exit route", "role": "fan"})
    assert response.status_code == 200
    assert "safety guidance" in response.json()["response"].lower() or "evacuation" in response.json()["response"].lower() or "emergency" in response.json()["response"].lower()

def test_network_timeout(monkeypatch):
    """Simulates a connection timeout during Gemini API calling."""
    import services.gemini_service as gs
    monkeypatch.setattr(gs, "genai_available", True)
    
    class MockModel:
        def __init__(self, *args, **kwargs):
            pass
        def generate_content(self, *args, **kwargs):
            raise TimeoutError("Connection to API gateway timed out.")
            
    monkeypatch.setattr(gs.genai, "GenerativeModel", MockModel)
    
    response = client.post("/api/chat", json={"message": "Weather forecast", "role": "fan"})
    assert response.status_code == 200
    assert "weather" in response.json()["response"].lower() or "dallas" in response.json()["response"].lower() or "overcast" in response.json()["response"].lower()

def test_empty_telemetry():
    """Validates that fallback engine handles empty/incomplete telemetry safely without raising KeyError."""
    empty_data = {}
    res = generate_fallback_response("Find least busy gate", empty_data, "fan")
    assert "stadium" in res.lower() or "transport" in res.lower() or "shuttle" in res.lower()
