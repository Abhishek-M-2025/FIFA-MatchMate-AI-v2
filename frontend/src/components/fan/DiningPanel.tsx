import React from 'react';
import { Utensils, ChevronDown, ChevronRight } from 'lucide-react';
import { LiveData } from '../../types';

interface DiningPanelProps {
  liveData: LiveData;
  isOpen: boolean;
  onToggle: () => void;
  t: any;
}

export const DiningPanel: React.FC<DiningPanelProps> = ({ liveData, isOpen, onToggle, t }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
      <button
        id="dining-panel-btn"
        aria-controls="dining-panel-content"
        aria-expanded={isOpen}
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-all text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        <div className="flex items-center gap-3">
          <Utensils className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm text-slate-200">{t.dining}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {isOpen && (
        <div
          id="dining-panel-content"
          role="region"
          aria-labelledby="dining-panel-btn"
          className="px-5 pb-5 pt-2 border-t border-slate-900 text-sm space-y-3 bg-slate-950/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {liveData.food.map((stall) => (
              <div key={stall.name} className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-200">{stall.name}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{stall.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-white">{stall.queue_wait_minutes} mins</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    stall.status === 'Very Busy' ? 'bg-red-500/10 text-red-400' :
                    stall.status === 'Busy' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {stall.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
