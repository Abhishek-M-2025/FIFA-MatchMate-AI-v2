import React from 'react';
import { HeartPulse, ChevronDown, ChevronRight } from 'lucide-react';
import { LiveData } from '../../types';

interface MedicalPanelProps {
  liveData: LiveData;
  isOpen: boolean;
  onToggle: () => void;
  t: any;
}

export const MedicalPanel: React.FC<MedicalPanelProps> = ({ liveData, isOpen, onToggle, t }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
      <button
        id="medical-panel-btn"
        aria-controls="medical-panel-content"
        aria-expanded={isOpen}
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-all text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        <div className="flex items-center gap-3">
          <HeartPulse className="w-5 h-5 text-red-400" />
          <span className="font-bold text-sm text-slate-200">{t.medical}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {isOpen && (
        <div
          id="medical-panel-content"
          role="region"
          aria-labelledby="medical-panel-btn"
          className="px-5 pb-5 pt-2 border-t border-slate-900 text-sm space-y-3 bg-slate-950/20"
        >
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400">Average Incident Response Time</p>
            <p className="text-lg font-black text-red-400">{liveData.medical.emergency_response_time_seconds} seconds</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {liveData.medical.stations.map((st) => (
              <div key={st.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-200">First Aid {st.id}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${st.status === 'Busy' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {st.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">{st.location}</p>
                <p className="text-xs text-slate-500">Active incidents: {st.cases_active} | Staff: {st.staff_count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
