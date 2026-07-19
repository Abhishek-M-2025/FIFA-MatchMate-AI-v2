import os
import logging
from datetime import datetime
from config import settings

logger = logging.getLogger("FIFA_MatchMate_GeminiService")

# Configure the Gemini API client safely
genai_available = False
try:
    import google.generativeai as genai
    # Only configure if the key is provided and is not the default placeholder
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "YOUR_GEMINI_API_KEY":
        genai.configure(api_key=settings.GEMINI_API_KEY)
        genai_available = True
    else:
        logger.warning("GEMINI_API_KEY is not configured or uses default placeholder. Running in fallback mode.")
except ImportError:
    logger.error("google-generativeai package not found. Running in fallback mode.")

def generate_fallback_response(user_message: str, live_data: dict, role: str) -> str:
    """
    Intelligent context-aware rule-based fallback engine that uses live stadium
    telemetry to generate helpful responses when Gemini is offline or unavailable.
    """
    msg_lower = user_message.lower()
    
    # Simple language detection
    es_keywords = ["puerta", "cola", "espera", "estacionamiento", "parqueo", "comida", "clima", "tiempo", "ayuda", "baño", "salida", "emergencia", "sostenible"]
    fr_keywords = ["porte", "file", "attente", "parking", "nourriture", "météo", "aide", "toilette", "sortie", "urgence", "durable"]
    
    lang = "en"
    if any(k in msg_lower for k in es_keywords):
        lang = "es"
    elif any(k in msg_lower for k in fr_keywords):
        lang = "fr"

    # Telemetry extraction helper variables
    gates = live_data.get("gates", [])
    parking = live_data.get("parking", {})
    food = live_data.get("food", [])
    washrooms = live_data.get("washrooms", [])
    crowd = live_data.get("crowd", {})
    sustainability = live_data.get("sustainability", {})
    medical = live_data.get("medical", {})
    alerts = live_data.get("alerts", [])

    # 1. Organizer summary & Logistics Audit
    if role == "organizer" or "audit" in msg_lower or "summary" in msg_lower or "logistics" in msg_lower or "steward" in msg_lower or "reallocate" in msg_lower:
        busy_gates = [g for g in gates if g.get("wait_time_minutes", 0) > 15]
        high_stands = []
        if crowd and "zones" in crowd:
            for stand, z in crowd["zones"].items():
                if z.get("occupancy", 0) / z.get("capacity", 1) >= 0.9:
                    high_stands.append(stand)
        
        gate_bottlenecks = ", ".join([f"{g['name']} ({g['wait_time_minutes']} min wait)" for g in busy_gates]) if busy_gates else "None"
        stands_warning = ", ".join(high_stands) if high_stands else "None"
        
        # Recommendations
        realloc_advice = "All gates are flowing smoothly."
        if busy_gates:
            realloc_advice = f"Recommend shifting 5-10 volunteers to {busy_gates[0]['name']} to expedite crowd screening."
        
        if lang == "es":
            return (
                f"[Modo Fallido IA] Auditoría de Logística: Ocupación del estadio al {crowd.get('occupancy_percentage', 90)}%. "
                f"Cuellos de botella en puertas: {gate_bottlenecks}. Gradas de alta densidad (>90%): {stands_warning}. "
                f"Sugerencia: {realloc_advice}"
            )
        elif lang == "fr":
            return (
                f"[Mode Secours IA] Audit Logistique: Occupation du stade à {crowd.get('occupancy_percentage', 90)}%. "
                f"Goulots d'étranglement aux portes: {gate_bottlenecks}. Tribunes à haute densité (>90%): {stands_warning}. "
                f"Conseil de réallocation: {realloc_advice}"
            )
        else:
            return (
                f"[Offline AI Fallback] Logistics Audit Summary: Stadium occupancy is at {crowd.get('occupancy_percentage', 90)}%. "
                f"Gate Bottlenecks (>15m wait): {gate_bottlenecks}. High-density stands: {stands_warning}. "
                f"Actionable Advice: {realloc_advice}"
            )

    # 2. Gates status and queues
    if "gate" in msg_lower or "queue" in msg_lower or "wait" in msg_lower or "entrance" in msg_lower or "puerta" in msg_lower or "porte" in msg_lower:
        if gates:
            least_busy = min(gates, key=lambda g: g.get("wait_time_minutes", 99))
            most_busy = max(gates, key=lambda g: g.get("wait_time_minutes", 0))
            if lang == "es":
                return (
                    f"[Modo Fallido IA] La puerta menos transitada es {least_busy['name']} con un tiempo de espera de {least_busy['wait_time_minutes']} minutos. "
                    f"Evite {most_busy['name']} que reporta un tiempo de espera de {most_busy['wait_time_minutes']} minutos."
                )
            elif lang == "fr":
                return (
                    f"[Mode Secours IA] La porte la moins encombrée est {least_busy['name']} avec {least_busy['wait_time_minutes']} minutes d'attente. "
                    f"Évitez {most_busy['name']} qui signale {most_busy['wait_time_minutes']} minutes d'attente."
                )
            else:
                return (
                    f"[Offline AI Fallback] Live telemetry indicates that {least_busy['name']} has the shortest queue ({least_busy['wait_time_minutes']} min wait). "
                    f"Spectators should avoid {most_busy['name']} which currently has a wait of {most_busy['wait_time_minutes']} mins."
                )

    # 3. Parking zones status
    if "parking" in msg_lower or "car" in msg_lower or "spot" in msg_lower or "estacionamiento" in msg_lower or "parqueo" in msg_lower:
        available_zones = [name for name, zone in parking.items() if zone.get("status") == "Available"]
        if available_zones:
            zones_str = ", ".join(available_zones)
            if lang == "es":
                return f"[Modo Fallido IA] Las siguientes zonas de estacionamiento tienen espacios disponibles: {zones_str}. Las zonas VIP están casi llenas."
            elif lang == "fr":
                return f"[Mode Secours IA] Les zones de stationnement suivantes sont disponibles: {zones_str}. Les zones VIP sont presque complètes."
            else:
                return f"[Offline AI Fallback] Parking zones reporting space availability: {zones_str}. VIP parking zones are currently near maximum capacity."
        else:
            if lang == "es":
                return "[Modo Fallido IA] Todos los estacionamientos generales están llenos. Le recomendamos utilizar el transporte público o los autobuses de enlace."
            elif lang == "fr":
                return "[Mode Secours IA] Tous les parkings généraux sont pleins. Nous vous suggérons d'utiliser les transports en commun."
            else:
                return "[Offline AI Fallback] Stadium general parking zones are currently reporting full capacity. Public transit or express shuttles are advised."

    # 4. Food & Dining
    if "food" in msg_lower or "concessions" in msg_lower or "eat" in msg_lower or "dining" in msg_lower or "taco" in msg_lower or "burger" in msg_lower or "bbq" in msg_lower or "comida" in msg_lower or "nourriture" in msg_lower:
        if food:
            best_food = min(food, key=lambda f: f.get("queue_wait_minutes", 99))
            if lang == "es":
                return f"[Modo Fallido IA] Concesiones del estadio: '{best_food['name']}' ({best_food['location']}) tiene el tiempo de espera más corto de {best_food['queue_wait_minutes']} minutos."
            elif lang == "fr":
                return f"[Mode Secours IA] Restauration: '{best_food['name']}' ({best_food['location']}) a le temps d'attente le plus court de {best_food['queue_wait_minutes']} minutes."
            else:
                return f"[Offline AI Fallback] Concourse concessions: '{best_food['name']}' located at {best_food['location']} has the shortest queue wait time of {best_food['queue_wait_minutes']} mins."

    # 5. Restrooms
    if "toilet" in msg_lower or "restroom" in msg_lower or "washroom" in msg_lower or "wc" in msg_lower or "baño" in msg_lower or "toilette" in msg_lower:
        if washrooms:
            best_wc = min(washrooms, key=lambda w: w.get("queue_wait_minutes", 99))
            accessible_str = " (Accessible / ADA)" if best_wc.get("accessible") else ""
            if lang == "es":
                return f"[Modo Fallido IA] Los baños en {best_wc['location']} reportan la menor espera de {best_wc['queue_wait_minutes']} minutos{accessible_str}."
            elif lang == "fr":
                return f"[Mode Secours IA] Les toilettes de {best_wc['location']} affichent l'attente la plus courte de {best_wc['queue_wait_minutes']} minutes{accessible_str}."
            else:
                return f"[Offline AI Fallback] Clean restrooms with minimal wait: {best_wc['location']} has a wait of {best_wc['queue_wait_minutes']} mins{accessible_str}."

    # 6. Emergency / Safety / Medical
    if "emergency" in msg_lower or "exit" in msg_lower or "medical" in msg_lower or "doctor" in msg_lower or "first aid" in msg_lower or "salida" in msg_lower or "sortie" in msg_lower or "urgencia" in msg_lower or "emergencia" in msg_lower:
        med_stations = medical.get("stations", [])
        med_info = f"First Aid station {med_stations[0]['id']} is located at {med_stations[0]['location']}" if med_stations else "First Aid points are set in Level 1 & 2 concourses."
        if lang == "es":
            return (
                f"[Modo Fallido IA - EMERGENCIA] Rutas de evacuación activas vía Puertas A, B, C y D. "
                f"El puesto de primeros auxilios más cercano está en {med_info}. Siga las indicaciones de los oficiales de seguridad."
            )
        elif lang == "fr":
            return (
                f"[Mode Secours IA - URGENCE] Itinéraires d'évacuation actifs via les portes A, B, C et D. "
                f"Poste médical: {med_info}. Suivez les consignes de sécurité."
            )
        else:
            return (
                f"[Offline AI Fallback - SAFETY GUIDANCE] Active emergency routes are operational via Gates A, B, C, and D. "
                f"Medical assistance: {med_info}. Security stewards are stationed at all corridors."
            )

    # 7. Sustainability
    if "sustainability" in msg_lower or "green" in msg_lower or "recycle" in msg_lower or "solar" in msg_lower or "water" in msg_lower or "durable" in msg_lower or "sostenible" in msg_lower:
        waste = sustainability.get("waste_diverted_kg", 0)
        water = sustainability.get("water_saved_liters", 0)
        power = sustainability.get("renewable_energy_kwh", 0)
        if lang == "es":
            return (
                f"[Modo Fallido IA] Desempeño Ecológico del Estadio: {waste} kg de residuos reciclados, "
                f"{water} L de agua conservados y {power} kWh de energía solar limpia consumidos hoy."
            )
        elif lang == "fr":
            return (
                f"[Mode Secours IA] Performance Verte du Stade: {waste} kg de déchets recyclés, "
                f"{water} L d'eau économisés et {power} kWh d'énergie solaire consommés."
            )
        else:
            return (
                f"[Offline AI Fallback] Stadium Sustainability Update: We have diverted {waste} kg of waste from landfills, "
                f"saved {water} liters of water, and generated {power} kWh of solar power during this match."
            )

    # 8. Weather
    if "weather" in msg_lower or "rain" in msg_lower or "temp" in msg_lower or "clima" in msg_lower or "météo" in msg_lower:
        if lang == "es":
            return "[Modo Fallido IA] Informe del Clima: El estadio AT&T de Arlington está parcialmente nublado con vientos moderados. Revise la tarjeta del clima para ver la temperatura exacta."
        elif lang == "fr":
            return "[Mode Secours IA] Météo: Le stade AT&T d'Arlington est partiellement nuageux avec un vent léger. Consultez l'onglet météo."
        else:
            return "[Offline AI Fallback] Weather Forecast: Dallas Stadium is currently overcast with light winds. Please check the top weather widget for real-time temp."

    # 9. Accessibility
    if "accessible" in msg_lower or "accessibility" in msg_lower or "wheelchair" in msg_lower or "ada" in msg_lower or "sensory" in msg_lower:
        if lang == "es":
            return "[Modo Fallido IA] Información de Accesibilidad: Puerta D está equipada para sillas de ruedas. Salas de calma sensorial disponibles en la sección 132."
        elif lang == "fr":
            return "[Mode Secours IA] Accessibilité: La porte D est aménagée pour les fauteuils roulants. Un espace sensoriel calme est disponible section 132."
        else:
            return "[Offline AI Fallback] Accessibility Info: Gate D is configured for wheelchairs. Dedicated sensory calming rooms are available in Sector 132."

    # Default general fallback
    stadium_occ = crowd.get("occupancy_percentage", 90)
    alert_count = len(alerts)
    if lang == "es":
        return f"[Modo Fallido IA] Gracias por contactar a MatchMate. Ocupación actual: {stadium_occ}%. Alertas activas: {alert_count}. Todos los autobuses funcionan normalmente."
    elif lang == "fr":
        return f"[Mode Secours IA] Merci de contacter MatchMate. Occupation actuelle: {stadium_occ}%. Alertes actives: {alert_count}. Les navettes fonctionnent normalement."
    else:
        return (
            f"[Offline AI Fallback] Thank you for querying FIFA MatchMate AI. Stadium capacity is at {stadium_occ}%. "
            f"Active notices: {alert_count}. Express shuttle services and trains are running normal operational schedules."
        )

def get_gemini_response(user_message: str, live_data: dict, role: str = "fan") -> str:
    """
    Submits user message and current live dashboard context to Gemini API.
    Gracefully falls back to rule-based recommendations on API key absence, invalid keys, or exceptions.
    """
    if not genai_available:
        return generate_fallback_response(user_message, live_data, role)

    try:
        # Build systemic operational context for the AI agent
        system_instructions = f"""
You are "FIFA MatchMate AI", the official smart assistant for the FIFA World Cup 2026 (hosted in North America, with this live dashboard set in Arlington/Dallas Stadium). 
You are speaking to a {role.upper()}.
Use the following real-time stadium operational telemetry to answer the user's questions. 

Current Telemetry Timestamp: {live_data.get('timestamp')}

--- Real-time Stadium Telemetry ---
1. Crowd Occupancy:
   - Total Occupancy: {live_data.get('crowd', {}).get('total_stadium_occupancy', 72000)} / 80,000 ({live_data.get('crowd', {}).get('occupancy_percentage', 90)}%)
   - Zone Densities: {live_data.get('crowd', {}).get('zones', {})}

2. Gates status and queues:
   {live_data.get('gates', [])}

3. Parking zones status:
   {live_data.get('parking', {})}

4. Transit and transport status:
   {live_data.get('transport', {})}

5. Concourse Food & Dining:
   {live_data.get('food', [])}

6. Restroom/Washroom wait times:
   {live_data.get('washrooms', [])}

7. Volunteers active:
   - Total active: {live_data.get('volunteers', {}).get('active_now', 300)}
   - Pending assistance requests: {live_data.get('volunteers', {}).get('assistance_requests_pending', 0)}

8. Medical status:
   {live_data.get('medical', {})}

9. Active alerts:
   {live_data.get('alerts', [])}

10. Sustainability status:
   {live_data.get('sustainability', {})}

11. Lost & found:
   {live_data.get('lost_and_found', [])}

Guidelines:
- Keep your answers highly relevant to the provided live data.
- If a gate, parking zone, washroom, or food stall is crowded/busy (has high wait times or occupancy), suggest alternative gates/zones with shorter queues/less occupancy based on the live data above.
- Be concise, direct, helpful, and polite.
- For fans, be welcoming, emphasize safety, accessibility, and convenience.
- For organizers, focus on quick summaries, volunteer reallocation suggestions, safety mitigations, and crowd control recommendations.
- Keep responses under 4 sentences unless the user explicitly requests detailed instructions.
"""
        
        # Configure model using standard generation settings
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
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
        logger.error(f"Error querying Gemini API: {e}. Switching to context fallback.")
        return generate_fallback_response(user_message, live_data, role)
