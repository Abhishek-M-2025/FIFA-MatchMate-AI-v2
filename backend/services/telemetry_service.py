import html
from datetime import datetime
from mock_data import LIVE_DATA, update_live_data

class TelemetryService:
    @staticmethod
    def get_live_data() -> dict:
        """Returns the global LIVE_DATA structure."""
        return LIVE_DATA

    @staticmethod
    def update_data() -> None:
        """Invokes simulated telemetry fluctuation updates."""
        update_live_data()

    @staticmethod
    def sanitize_input(text: str) -> str:
        """Strips HTML tags and escapes content to protect against XSS."""
        if not text:
            return ""
        clean = html.escape(text.strip())
        return clean

    def trigger_new_alert(self, severity: str, title: str) -> dict:
        """Sanitizes inputs and appends a new emergency/ops notice to LIVE_DATA."""
        sanitized_title = self.sanitize_input(title)
        
        new_alert = {
            "id": str(len(LIVE_DATA["alerts"]) + 1),
            "severity": severity,
            "title": sanitized_title,
            "timestamp": datetime.utcnow().strftime("%H:%M")
        }
        
        LIVE_DATA["alerts"].insert(0, new_alert)
        LIVE_DATA["alerts"] = LIVE_DATA["alerts"][:10]
        
        return new_alert

telemetry_service = TelemetryService()
