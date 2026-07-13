import pytest
from fastapi.testclient import TestClient
from main import app
from mock_data import LIVE_DATA

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
    
    # Assert existence of essential metrics keys
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
    
    # Verify subfields
    assert "total_stadium_occupancy" in data["crowd"]
    assert len(data["gates"]) > 0
    assert "Zone A (VIP)" in data["parking"]

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
    
    # Confirm it got inserted into global alerts repository
    live_resp = client.get("/api/live-data")
    latest_alert = live_resp.json()["alerts"][0]
    assert latest_alert["severity"] == "Warning"
    assert latest_alert["title"] == "Drill test alert triggered from suite."

def test_chat_validation():
    """Validates payload validation on Chat endpoint."""
    response = client.post("/api/chat", json={"message": "", "role": "fan"})
    assert response.status_code == 422 # FastAPI validation or custom 400

    response = client.post("/api/chat", json={"message": " ", "role": "fan"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Message content cannot be empty."

def test_chat_response(monkeypatch):
    """Mocks the gemini.py dependency to test the FastAPI chat response handling."""
    # Monkeypatch get_gemini_response to prevent making real network requests
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
