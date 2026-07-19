import React from 'react';
import { Car, ChevronDown, ChevronRight } from 'lucide-react';
import { LiveData } from '../../types';

interface ParkingPanelProps {
  liveData: LiveData;
  isOpen: boolean;
  onToggle: () => void;
  t: any;
}

export const ParkingPanel: React.FC<ParkingPanelProps> = ({ liveData, isOpen, onToggle, t }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
      <button
        id="parking-panel-btn"
        aria-controls="parking-panel-content"
        aria-expanded={isOpen}
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-all text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        <div className="flex items-center gap-3">
          <Car className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm text-slate-200">{t.parking}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {isOpen && (
        <div
          id="parking-panel-content"
          role="region"
          aria-labelledby="parking-panel-btn"
          className="px-5 pb-5 pt-2 border-t border-slate-900 text-sm space-y-3 bg-slate-950/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {Object.entries(liveData.parking).map(([name, zone]) => (
              <div key={name} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850">
                <p className="font-bold text-xs text-slate-200">{name}</p>
                <p className="text-lg font-black text-white mt-1">
                  {Math.round((zone.occupied / zone.capacity) * 100)}%
                </p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  {zone.occupied} / {zone.capacity} spaces
                </p>
                <span className={`inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-md ${
                  zone.status === 'Full' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  zone.status === 'Almost Full' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {zone.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
