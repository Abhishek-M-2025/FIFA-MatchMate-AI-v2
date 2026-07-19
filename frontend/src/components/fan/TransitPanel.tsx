import React from 'react';
import { Bus, ChevronDown, ChevronRight } from 'lucide-react';
import { LiveData } from '../../types';

interface TransitPanelProps {
  liveData: LiveData;
  isOpen: boolean;
  onToggle: () => void;
  t: any;
}

export const TransitPanel: React.FC<TransitPanelProps> = ({ liveData, isOpen, onToggle, t }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
      <button
        id="transit-panel-btn"
        aria-controls="transit-panel-content"
        aria-expanded={isOpen}
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-all text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        <div className="flex items-center gap-3">
          <Bus className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm text-slate-200">{t.transit}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold">
            {liveData.transport.metro_line_status}
          </span>
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {isOpen && (
        <div
          id="transit-panel-content"
          role="region"
          aria-labelledby="transit-panel-btn"
          className="px-5 pb-5 pt-2 border-t border-slate-900 text-sm space-y-3.5 bg-slate-950/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Metro Trains</p>
              <p className="text-sm font-extrabold text-slate-200 mt-1">Every {liveData.transport.metro_frequency_minutes} mins</p>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Transit Shuttle Buses</p>
              <p className="text-sm font-extrabold text-slate-200 mt-1">{liveData.transport.shuttle_buses.active} Active shuttles</p>
              <p className="text-xs text-slate-400 font-medium">Wait: ~{liveData.transport.shuttle_buses.waiting_time_minutes} mins</p>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Rideshare Delays</p>
              <p className="text-sm font-extrabold text-slate-200 mt-1">{liveData.transport.rideshare_delay_minutes} mins latency</p>
            </div>
          </div>

          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850">
            <h4 className="font-bold text-xs text-slate-300 mb-2">Next Departures from Stadium Station</h4>
            <div className="space-y-2">
              {liveData.transport.next_trains.map((train, idx) => (
                <div key={idx} className="flex justify-between text-xs font-semibold py-1 border-b border-slate-900 last:border-0 text-slate-350">
                  <span>{train.destination}</span>
                  <span className="text-emerald-400">in {train.minutes_away} mins</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
