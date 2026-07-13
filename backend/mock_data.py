import random
import time
from datetime import datetime

# Global status repository, updated every 5 seconds in background task
LIVE_DATA = {
    "timestamp": datetime.utcnow().isoformat() + "Z",
    "crowd": {
        "total_stadium_occupancy": 72450,
        "occupancy_percentage": 90.5,
        "zones": {
            "North Stand": {"occupancy": 18200, "capacity": 20000, "density": "High"},
            "South Stand": {"occupancy": 17800, "capacity": 20000, "density": "Medium"},
            "East Stand": {"occupancy": 19100, "capacity": 20000, "density": "High"},
            "West Stand": {"occupancy": 17350, "capacity": 20000, "density": "Medium"}
        }
    },
    "gates": [
        {"id": "Gate-A", "name": "North Gate (Main Entry)", "occupancy": 85, "status": "Open", "wait_time_minutes": 12, "flow_rate_per_min": 45, "latitude": 32.7485, "longitude": -97.0845},
        {"id": "Gate-B", "name": "East Gate (Transit Hub)", "occupancy": 95, "status": "Open", "wait_time_minutes": 25, "flow_rate_per_min": 35, "latitude": 32.7475, "longitude": -97.0825},
        {"id": "Gate-C", "name": "South Gate (Parking Hub)", "occupancy": 40, "status": "Open", "wait_time_minutes": 5, "flow_rate_per_min": 50, "latitude": 32.7465, "longitude": -97.0845},
        {"id": "Gate-D", "name": "West Gate (VIP/Accessible)", "occupancy": 20, "status": "Open", "wait_time_minutes": 2, "flow_rate_per_min": 15, "latitude": 32.7475, "longitude": -97.0865}
    ],
    "parking": {
        "Zone A (VIP)": {"occupied": 480, "capacity": 500, "status": "Almost Full", "latitude": 32.7495, "longitude": -97.0865},
        "Zone B (General)": {"occupied": 2150, "capacity": 2500, "status": "Available", "latitude": 32.7455, "longitude": -97.0855},
        "Zone C (General)": {"occupied": 1980, "capacity": 2000, "status": "Almost Full", "latitude": 32.7465, "longitude": -97.0815},
        "Zone D (Bus & Shuttle)": {"occupied": 85, "capacity": 150, "status": "Available", "latitude": 32.7485, "longitude": -97.0805}
    },
    "transport": {
        "metro_line_status": "Normal Service",
        "metro_frequency_minutes": 3,
        "shuttle_buses": {"active": 45, "waiting_time_minutes": 4, "status": "Normal"},
        "rideshare_delay_minutes": 15,
        "next_trains": [
            {"destination": "Dallas Downtown", "minutes_away": 4},
            {"destination": "Fort Worth Center", "minutes_away": 7},
            {"destination": "Airport Express", "minutes_away": 2}
        ]
    },
    "food": [
        {"name": "Texas BBQ Pit", "location": "Concourse Section 105", "queue_wait_minutes": 14, "status": "Busy", "latitude": 32.7481, "longitude": -97.0841},
        {"name": "Copa Tacos", "location": "Concourse Section 212", "queue_wait_minutes": 8, "status": "Moderate", "latitude": 32.7471, "longitude": -97.0831},
        {"name": "World Cup Burgers", "location": "Concourse Section 118", "queue_wait_minutes": 22, "status": "Very Busy", "latitude": 32.7479, "longitude": -97.0851},
        {"name": "Vegan & Healthy Bowl", "location": "Concourse Section 130", "queue_wait_minutes": 3, "status": "Available", "latitude": 32.7469, "longitude": -97.0849}
    ],
    "washrooms": [
        {"id": "W1", "location": "Section 102 (North)", "gender": "All", "queue_wait_minutes": 2, "status": "Clean", "accessible": True, "latitude": 32.7483, "longitude": -97.0843},
        {"id": "W2", "location": "Section 122 (East)", "gender": "All", "queue_wait_minutes": 6, "status": "Moderate", "accessible": True, "latitude": 32.7473, "longitude": -97.0827},
        {"id": "W3", "location": "Section 204 (South)", "gender": "All", "queue_wait_minutes": 1, "status": "Clean", "accessible": True, "latitude": 32.7467, "longitude": -97.0843},
        {"id": "W4", "location": "Section 218 (West)", "gender": "All", "queue_wait_minutes": 9, "status": "Busy", "accessible": True, "latitude": 32.7477, "longitude": -97.0859}
    ],
    "volunteers": {
        "total_assigned": 350,
        "active_now": 310,
        "zones": {
            "North Stand": 80,
            "South Stand": 70,
            "East Stand": 90,
            "West Stand": 70
        },
        "assistance_requests_pending": 4
    },
    "medical": {
        "stations": [
            {"id": "Med-1", "location": "Level 1 Concourse North", "status": "Available", "cases_active": 2, "staff_count": 8, "latitude": 32.7484, "longitude": -97.0847},
            {"id": "Med-2", "location": "Level 2 Concourse South", "status": "Busy", "cases_active": 5, "staff_count": 6, "latitude": 32.7468, "longitude": -97.0841}
        ],
        "emergency_response_time_seconds": 120
    },
    "alerts": [
        {"id": "1", "severity": "Info", "title": "Transit Shuttle frequencies doubled for post-match dispersal.", "timestamp": "15:45"},
        {"id": "2", "severity": "Warning", "title": "High footfall at Gate B. Spectators advised to route via Gates C or D.", "timestamp": "15:52"}
    ],
    "sustainability": {
        "waste_diverted_kg": 4250,
        "water_saved_liters": 12500,
        "renewable_energy_kwh": 3820,
        "carbon_offset_kg": 850
    },
    "lost_and_found": [
        {"item": "Black leather wallet", "status": "Reported Found", "location": "Section 104", "latitude": 32.7482, "longitude": -97.0839},
        {"item": "iPhone 15 Pro", "status": "Reported Lost", "location": "Gate A Plaza", "latitude": 32.7486, "longitude": -97.0846}
    ]
}

def update_live_data():
    """Simulates fluctuations in values every 5 seconds to represent real-time updates."""
    LIVE_DATA["timestamp"] = datetime.utcnow().isoformat() + "Z"
    
    # 1. Update overall crowd occupancy slightly
    change = random.randint(-15, 20)
    new_occ = LIVE_DATA["crowd"]["total_stadium_occupancy"] + change
    new_occ = max(60000, min(new_occ, 80000))
    LIVE_DATA["crowd"]["total_stadium_occupancy"] = new_occ
    LIVE_DATA["crowd"]["occupancy_percentage"] = round((new_occ / 80000) * 100, 1)

    # Update stand zones slightly
    for stand, info in LIVE_DATA["crowd"]["zones"].items():
        occ_change = random.randint(-10, 15)
        new_stand_occ = max(15000, min(info["occupancy"] + occ_change, info["capacity"]))
        info["occupancy"] = new_stand_occ
        if new_stand_occ > 18500:
            info["density"] = "High"
        elif new_stand_occ > 16500:
            info["density"] = "Medium"
        else:
            info["density"] = "Low"
            
    # 2. Update gate queues
    for gate in LIVE_DATA["gates"]:
        gate_occ_change = random.randint(-3, 3)
        gate["occupancy"] = max(5, min(gate["occupancy"] + gate_occ_change, 100))
        
        # Recalculate wait time based on occupancy and flow rate
        gate["wait_time_minutes"] = max(1, int((gate["occupancy"] * 10) / gate["flow_rate_per_min"]))
    
    # 3. Update parking
    for name, zone in LIVE_DATA["parking"].items():
        park_change = random.randint(-2, 3)
        zone["occupied"] = max(0, min(zone["occupied"] + park_change, zone["capacity"]))
        ratio = zone["occupied"] / zone["capacity"]
        if ratio >= 0.95:
            zone["status"] = "Full"
        elif ratio >= 0.85:
            zone["status"] = "Almost Full"
        else:
            zone["status"] = "Available"
            
    # 4. Update transport shuttle times
    LIVE_DATA["transport"]["shuttle_buses"]["waiting_time_minutes"] = max(2, min(8, LIVE_DATA["transport"]["shuttle_buses"]["waiting_time_minutes"] + random.choice([-1, 0, 1])))
    for train in LIVE_DATA["transport"]["next_trains"]:
        train["minutes_away"] = train["minutes_away"] - 1
        if train["minutes_away"] <= 0:
            train["minutes_away"] = random.randint(5, 10)

    # 5. Update food queues
    for stand in LIVE_DATA["food"]:
        food_change = random.choice([-1, 0, 1])
        stand["queue_wait_minutes"] = max(1, min(40, stand["queue_wait_minutes"] + food_change))
        if stand["queue_wait_minutes"] > 20:
            stand["status"] = "Very Busy"
        elif stand["queue_wait_minutes"] > 10:
            stand["status"] = "Busy"
        elif stand["queue_wait_minutes"] > 5:
            stand["status"] = "Moderate"
        else:
            stand["status"] = "Available"

    # 6. Update washroom queues
    for wc in LIVE_DATA["washrooms"]:
        wc_change = random.choice([-1, 0, 1])
        wc["queue_wait_minutes"] = max(0, min(15, wc["queue_wait_minutes"] + wc_change))
        if wc["queue_wait_minutes"] > 8:
            wc["status"] = "Busy"
        elif wc["queue_wait_minutes"] > 4:
            wc["status"] = "Moderate"
        else:
            wc["status"] = "Clean"
            
    # 7. Update sustainability numbers positively
    LIVE_DATA["sustainability"]["waste_diverted_kg"] += random.randint(2, 6)
    LIVE_DATA["sustainability"]["water_saved_liters"] += random.randint(5, 15)
    LIVE_DATA["sustainability"]["renewable_energy_kwh"] += random.randint(1, 4)
    LIVE_DATA["sustainability"]["carbon_offset_kg"] += random.randint(1, 3)

    # 8. Update volunteer pending requests
    LIVE_DATA["volunteers"]["assistance_requests_pending"] = max(0, min(10, LIVE_DATA["volunteers"]["assistance_requests_pending"] + random.choice([-1, 0, 1])))
