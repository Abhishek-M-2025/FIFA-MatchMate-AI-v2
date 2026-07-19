import os
from typing import List
from dotenv import load_dotenv

# Resolve root directory .env file relative to this file's location
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(base_dir, ".env")

if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Define secure origin defaults for API access
    CORS_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://fifa-match-mate-ai-v2-663q.vercel.app"
]

settings = Settings()
