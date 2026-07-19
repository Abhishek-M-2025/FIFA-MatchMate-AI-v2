import time
import httpx
import logging

logger = logging.getLogger("FIFA_MatchMate_WeatherService")

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

class WeatherService:
    def __init__(self):
        self.weather_cache = {
            "data": None,
            "last_updated": 0
        }
        self.lat = 32.7473
        self.lon = -97.0945

    def map_weather_code(self, code: int) -> dict:
        description, icon = WEATHER_CODES.get(code, ("Unknown Weather", "Cloud"))
        return {"code": code, "description": description, "icon": icon}

    async def get_weather(self) -> dict:
        current_time = time.time()
        # Cache for 5 minutes (300 seconds)
        if self.weather_cache["data"] and (current_time - self.weather_cache["last_updated"]) < 300:
            return self.weather_cache["data"]

        url = f"https://api.open-meteo.com/v1/forecast?latitude={self.lat}&longitude={self.lon}&current=temperature_2m,weather_code,wind_speed_10m"
        
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    current = data.get("current", {})
                    temp_c = current.get("temperature_2m", 25.0)
                    temp_f = round((temp_c * 9/5) + 32, 1)
                    weather_code = current.get("weather_code", 0)
                    mapped = self.map_weather_code(weather_code)
                    
                    weather_info = {
                        "temp_c": temp_c,
                        "temp_f": temp_f,
                        "description": mapped["description"],
                        "icon": mapped["icon"],
                        "wind_speed_kmh": current.get("wind_speed_10m", 10.0),
                        "source": "Open-Meteo API"
                    }
                    
                    self.weather_cache["data"] = weather_info
                    self.weather_cache["last_updated"] = current_time
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

weather_service = WeatherService()
