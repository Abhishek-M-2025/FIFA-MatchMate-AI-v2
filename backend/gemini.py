import os
from dotenv import load_dotenv

load_dotenv()

# Configure the Gemini API client safely
api_key = os.getenv("GEMINI_API_KEY")
genai_available = False

try:
    import google.generativeai as genai
    if api_key:
        genai.configure(api_key=api_key)
    genai_available = True
except ImportError:
    print("Warning: google-generativeai package not found. Running in Offline Mock mode.")

def get_gemini_response(user_message: str, live_data: dict, role: str = "fan") -> str:
    """
    Submits user message and current live dashboard context to Gemini API.
    Returns intelligent context-aware text responses.
    """
    if not genai_available:
        # High quality local heuristics fallback when SDK is not installed
        msg_lower = user_message.lower()
        if "gate" in msg_lower or "queue" in msg_lower:
            least_busy = min(live_data["gates"], key=lambda g: g["wait_time_minutes"])
            return f"[Offline AI Mode] Live telemetry indicates that {least_busy['name']} has the shortest queue ({least_busy['wait_time_minutes']} min wait). You should route your group there."
        if "parking" in msg_lower:
            available = [name for name, zone in live_data["parking"].items() if zone["status"] == "Available"]
            if available:
                return f"[Offline AI Mode] Parking zone '{available[0]}' is currently reporting availability. VIP zones are almost full."
            return "[Offline AI Mode] Stadium general parking zones are currently near maximum capacity. Public transit is advised."
        if "food" in msg_lower or "concessions" in msg_lower or "bbq" in msg_lower or "tacos" in msg_lower:
            available_food = min(live_data["food"], key=lambda f: f["queue_wait_minutes"])
            return f"[Offline AI Mode] Concourse concessions: '{available_food['name']}' has the shortest wait time of {available_food['queue_wait_minutes']} mins."
        if "weather" in msg_lower or "rain" in msg_lower:
            return "[Offline AI Mode] Live weather report: Dallas Arena is overcast with mild winds. Check the Weather card for current temperature."
        return f"[Offline AI Mode] Thank you for asking '{user_message}'. The stadium is currently at {live_data['crowd']['occupancy_percentage']}% capacity. Public shuttles are running normal service."

    if not api_key:
        return "Gemini API key is missing. Please set it in your .env file."

    try:
        # Build systemic operational context for the AI agent
        system_instructions = f"""
You are "FIFA MatchMate AI", the official smart assistant for the FIFA World Cup 2026 (hosted in North America, with this live dashboard set in Arlington/Dallas Stadium). 
You are speaking to a {role.upper()}.
Use the following real-time stadium operational telemetry to answer the user's questions. 

Current Telemetry Timestamp: {live_data.get('timestamp')}

--- Real-time Stadium Telemetry ---
1. Crowd Occupancy:
   - Total Occupancy: {live_data['crowd']['total_stadium_occupancy']} / 80,000 ({live_data['crowd']['occupancy_percentage']}%)
   - Zone Densities: {live_data['crowd']['zones']}

2. Gates status and queues:
   {live_data['gates']}

3. Parking zones status:
   {live_data['parking']}

4. Transit and transport status:
   {live_data['transport']}

5. Concourse Food & Dining:
   {live_data['food']}

6. Restroom/Washroom wait times:
   {live_data['washrooms']}

7. Volunteers active:
   - Total active: {live_data['volunteers']['active_now']}
   - Pending assistance requests: {live_data['volunteers']['assistance_requests_pending']}

8. Medical status:
   {live_data['medical']}

9. Active alerts:
   {live_data['alerts']}

10. Sustainability status:
   {live_data['sustainability']}

11. Lost & found:
   {live_data['lost_and_found']}

Guidelines:
- Keep your answers highly relevant to the provided live data.
- If a gate, parking zone, washroom, or food stall is crowded/busy (has high wait times or occupancy), suggest alternative gates/zones with shorter queues/less occupancy based on the live data above.
- Be concise, direct, helpful, and polite.
- For fans, be welcoming, emphasize safety, accessibility, and convenience.
- For organizers, focus on quick summaries, volunteer reallocation suggestions, safety mitigations, and crowd control recommendations.
- Keep responses under 4 sentences unless the user explicitly requests detailed instructions.
"""
        
        # Configure model
        # Using gemini-1.5-flash as requested and standard
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=system_instructions
        )

        response = model.generate_content(
            user_message,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=300
            )
        )
        return response.text.strip()
    except Exception as e:
        # Graceful fallback response in case of API issues
        print(f"Error querying Gemini: {e}")
        return f"[FIFA MatchMate AI - Offline Mode] I received your question: '{user_message}'. Currently experiencing issues communicating with Gemini. However, based on my local stadium logs, the stadium occupancy is at {live_data['crowd']['occupancy_percentage']}%."
