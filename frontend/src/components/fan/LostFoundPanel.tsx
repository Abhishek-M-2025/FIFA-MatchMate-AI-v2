import React from 'react';
import { HelpCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { LiveData } from '../../types';

interface LostFoundPanelProps {
  liveData: LiveData;
  isOpen: boolean;
  onToggle: () => void;
  t: any;
}

export const LostFoundPanel: React.FC<LostFoundPanelProps> = ({ liveData, isOpen, onToggle, t }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
      <button
        id="lostfound-panel-btn"
        aria-controls="lostfound-panel-content"
        aria-expanded={isOpen}
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-all text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        <div className="flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-purple-400" />
          <span className="font-bold text-sm text-slate-200">{t.lostFound}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {isOpen && (
        <div
          id="lostfound-panel-content"
          role="region"
          aria-labelledby="lostfound-panel-btn"
          className="px-5 pb-5 pt-2 border-t border-slate-900 text-sm space-y-3 bg-slate-950/20"
        >
          <div className="space-y-2">
            {liveData.lost_and_found.map((item, idx) => (
              <div key={idx} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-200">{item.item}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Location: {item.location}</p>
                </div>
                <span className={`font-bold px-2 py-0.5 rounded text-[9px] ${
                  item.status === 'Reported Found' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
