import React from 'react';
import { Cloud, Sun, CloudRain, CloudSun, CloudDrizzle, CloudLightning, Wind } from 'lucide-react';
import { WeatherInfo } from '../types';

interface WeatherWidgetProps {
  weather: WeatherInfo | null;
  loading: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, loading }) => {
  const getWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun':
        return <Sun className="w-8 h-8 text-amber-400 animate-pulse-glow" />;
      case 'CloudSun':
        return <CloudSun className="w-8 h-8 text-slate-300" />;
      case 'Cloud':
        return <Cloud className="w-8 h-8 text-slate-400" />;
      case 'CloudDrizzle':
        return <CloudDrizzle className="w-8 h-8 text-blue-400" />;
      case 'CloudRain':
        return <CloudRain className="w-8 h-8 text-blue-500 animate-bounce" />;
      case 'CloudLightning':
        return <CloudLightning className="w-8 h-8 text-yellow-400 animate-pulse" />;
      default:
        return <CloudSun className="w-8 h-8 text-slate-300" />;
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-slate-800 rounded"></div>
          <div className="h-6 w-12 bg-slate-800 rounded"></div>
        </div>
        <div className="w-10 h-10 bg-slate-800 rounded-full"></div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border border-slate-800 hover:border-slate-700/80 transition-all duration-300">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span>Dallas Arena Weather</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold tracking-tight text-white">{weather.temp_f}°F</span>
          <span className="text-xs text-slate-400 font-semibold">/ {weather.temp_c}°C</span>
        </div>
        <p className="text-xs font-semibold text-emerald-400 mt-1">{weather.description}</p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
          {getWeatherIcon(weather.icon)}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Wind className="w-3.5 h-3.5 text-slate-500" />
          <span>{weather.wind_speed_kmh} km/h</span>
        </div>
      </div>
    </div>
  );
};
