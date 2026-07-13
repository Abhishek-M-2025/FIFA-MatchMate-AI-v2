export interface ZoneInfo {
  occupancy: number;
  capacity: number;
  density: string;
}

export interface CrowdInfo {
  total_stadium_occupancy: number;
  occupancy_percentage: number;
  zones: {
    [key: string]: ZoneInfo;
  };
}

export interface GateInfo {
  id: string;
  name: string;
  occupancy: number;
  status: string;
  wait_time_minutes: number;
  flow_rate_per_min: number;
  latitude: number;
  longitude: number;
}

export interface ParkingZone {
  occupied: number;
  capacity: number;
  status: string;
  latitude: number;
  longitude: number;
}

export interface ParkingInfo {
  [key: string]: ParkingZone;
}

export interface TrainInfo {
  destination: string;
  minutes_away: number;
}

export interface TransportInfo {
  metro_line_status: string;
  metro_frequency_minutes: number;
  shuttle_buses: {
    active: number;
    waiting_time_minutes: number;
    status: string;
  };
  rideshare_delay_minutes: number;
  next_trains: TrainInfo[];
}

export interface FoodStand {
  name: string;
  location: string;
  queue_wait_minutes: number;
  status: string;
  latitude: number;
  longitude: number;
}

export interface WashroomInfo {
  id: string;
  location: string;
  gender: string;
  queue_wait_minutes: number;
  status: string;
  accessible: boolean;
  latitude: number;
  longitude: number;
}

export interface VolunteersInfo {
  total_assigned: number;
  active_now: number;
  zones: {
    [key: string]: number;
  };
  assistance_requests_pending: number;
}

export interface MedicalStation {
  id: string;
  location: string;
  status: string;
  cases_active: number;
  staff_count: number;
  latitude: number;
  longitude: number;
}

export interface MedicalInfo {
  stations: MedicalStation[];
  emergency_response_time_seconds: number;
}

export interface AlertInfo {
  id: string;
  severity: 'Info' | 'Warning' | 'Critical';
  title: string;
  timestamp: string;
}

export interface SustainabilityInfo {
  waste_diverted_kg: number;
  water_saved_liters: number;
  renewable_energy_kwh: number;
  carbon_offset_kg: number;
}

export interface LostItem {
  item: string;
  status: string;
  location: string;
  latitude: number;
  longitude: number;
}

export interface LiveData {
  timestamp: string;
  crowd: CrowdInfo;
  gates: GateInfo[];
  parking: ParkingInfo;
  transport: TransportInfo;
  food: FoodStand[];
  washrooms: WashroomInfo[];
  volunteers: VolunteersInfo;
  medical: MedicalInfo;
  alerts: AlertInfo[];
  sustainability: SustainabilityInfo;
  lost_and_found: LostItem[];
}

export interface WeatherInfo {
  temp_c: number;
  temp_f: number;
  description: string;
  icon: string;
  wind_speed_kmh: number;
  source: string;
}
