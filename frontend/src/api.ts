import { LiveData, WeatherInfo, AlertInfo } from './types';

export async function getLiveData(): Promise<LiveData> {
  const res = await fetch('/api/live-data');
  if (!res.ok) {
    throw new Error('Failed to fetch live data');
  }
  return res.json();
}

export async function getWeatherInfo(): Promise<WeatherInfo> {
  const res = await fetch('/api/weather');
  if (!res.ok) {
    throw new Error('Failed to fetch weather info');
  }
  return res.json();
}

export async function sendChatMessage(message: string, role: string): Promise<{ response: string; timestamp: string }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, role }),
  });
  if (!res.ok) {
    throw new Error('Failed to send chat message');
  }
  return res.json();
}

export async function triggerAlert(severity: string, title: string): Promise<{ message: string; alert: AlertInfo }> {
  const res = await fetch('/api/alerts/trigger', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ severity, title }),
  });
  if (!res.ok) {
    throw new Error('Failed to trigger alert');
  }
  return res.json();
}

