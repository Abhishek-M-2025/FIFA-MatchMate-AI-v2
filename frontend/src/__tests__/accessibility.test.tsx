
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FanDashboard } from '../components/FanDashboard';
import { LiveData, WeatherInfo } from '../types';

vi.mock('../components/MockMap', () => ({
  MockMap: () => <div data-testid="mock-map">Mock Map</div>
}));

vi.mock('../components/AIChatVoice', () => ({
  AIChatVoice: () => <div data-testid="mock-chat">Mock Chat</div>
}));

const mockLiveData: LiveData = {
  timestamp: "2026-07-12T12:00:00Z",
  crowd: {
    total_stadium_occupancy: 70000,
    occupancy_percentage: 87.5,
    zones: {
      "North Stand": { occupancy: 18000, capacity: 20000, density: "High" }
    }
  },
  gates: [
    { id: "Gate-A", name: "Gate A", occupancy: 40, status: "Open", wait_time_minutes: 5, flow_rate_per_min: 40, latitude: 1, longitude: 1 }
  ],
  parking: {
    "Zone B (General)": { occupied: 100, capacity: 200, status: "Available", latitude: 1, longitude: 1 }
  },
  transport: {
    metro_line_status: "Normal Service",
    metro_frequency_minutes: 4,
    shuttle_buses: { active: 10, waiting_time_minutes: 5, status: "Normal" },
    rideshare_delay_minutes: 10,
    next_trains: []
  },
  food: [],
  washrooms: [],
  volunteers: { total_assigned: 10, active_now: 10, zones: {}, assistance_requests_pending: 0 },
  medical: { stations: [], emergency_response_time_seconds: 120 },
  alerts: [],
  sustainability: { waste_diverted_kg: 0, water_saved_liters: 0, renewable_energy_kwh: 0, carbon_offset_kg: 0 },
  lost_and_found: []
};

const mockWeather: WeatherInfo = {
  temp_c: 25,
  temp_f: 77,
  description: "Clear",
  icon: "Sun",
  wind_speed_kmh: 10,
  source: "Mock API"
};

describe('FanDashboard Accessibility', () => {
  it('defines accessibility tags and keyboard event triggers', () => {
    render(
      <FanDashboard liveData={mockLiveData} weather={mockWeather} weatherLoading={false} />
    );

    const transitButton = screen.getByRole('button', { name: /Transit & Shuttles/i });
    expect(transitButton).toBeInTheDocument();
    
    // Check initial state (should be open by default based on state initialized to 'transit')
    expect(transitButton).toHaveAttribute('aria-expanded', 'true');

    // Simulate keydown Enter to toggle collapse
    fireEvent.keyDown(transitButton, { key: 'Enter', code: 'Enter' });
    expect(transitButton).toHaveAttribute('aria-expanded', 'false');

    // Hitting Space should expand it again
    fireEvent.keyDown(transitButton, { key: ' ', code: 'Space' });
    expect(transitButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('has semantic landmarks and labels', () => {
    render(
      <FanDashboard liveData={mockLiveData} weather={mockWeather} weatherLoading={false} />
    );
    
    // Select element has correct label
    const selectElement = screen.getByLabelText(/Language/i);
    expect(selectElement).toBeInTheDocument();
  });
});
