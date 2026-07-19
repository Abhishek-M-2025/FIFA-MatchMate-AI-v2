import React from 'react';
import { Bath, Accessibility, ChevronDown, ChevronRight } from 'lucide-react';
import { LiveData } from '../../types';

interface WashroomsPanelProps {
  liveData: LiveData;
  isOpen: boolean;
  onToggle: () => void;
  t: any;
}

export const WashroomsPanel: React.FC<WashroomsPanelProps> = ({ liveData, isOpen, onToggle, t }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
      <button
        id="washrooms-panel-btn"
        aria-controls="washrooms-panel-content"
        aria-expanded={isOpen}
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-all text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        <div className="flex items-center gap-3">
          <Bath className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm text-slate-200">{t.restrooms}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {isOpen && (
        <div
          id="washrooms-panel-content"
          role="region"
          aria-labelledby="washrooms-panel-btn"
          className="px-5 pb-5 pt-2 border-t border-slate-900 text-sm space-y-3 bg-slate-950/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {liveData.washrooms.map((wc) => (
              <div key={wc.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-200">Restroom {wc.id}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{wc.location}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 font-semibold">{wc.gender}</span>
                    {wc.accessible && <Accessibility className="w-3.5 h-3.5 text-blue-400" aria-label="Accessible toilet" />}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-white">{wc.queue_wait_minutes} min wait</p>
                  <span className={`text-[10px] font-bold ${wc.status === 'Busy' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {wc.status}
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
