import React from 'react';
import { Users, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { LiveData } from '../../types';

interface VolunteerPanelProps {
  liveData: LiveData;
  isOpen: boolean;
  onToggle: () => void;
  t: any;
  volunteerSubmitted: boolean;
  volSector: string;
  setVolSector: (v: string) => void;
  volIssue: string;
  setVolIssue: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const VolunteerPanel: React.FC<VolunteerPanelProps> = ({
  liveData,
  isOpen,
  onToggle,
  t,
  volunteerSubmitted,
  volSector,
  setVolSector,
  volIssue,
  setVolIssue,
  onSubmit
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
      <button
        id="volunteer-panel-btn"
        aria-controls="volunteer-panel-content"
        aria-expanded={isOpen}
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-all text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm text-slate-200">{t.volunteers}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {isOpen && (
        <div
          id="volunteer-panel-content"
          role="region"
          aria-labelledby="volunteer-panel-btn"
          className="px-5 pb-5 pt-3 border-t border-slate-900 text-sm space-y-4 bg-slate-950/20"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active Volunteers inside Arena</span>
            <span className="font-extrabold text-white">{liveData.volunteers.active_now} active</span>
          </div>

          {volunteerSubmitted ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
              <span>{t.assistReqSuccess}</span>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label htmlFor="vol-sector-input" className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Your Sector / Seat Location</label>
                <input
                  id="vol-sector-input"
                  type="text"
                  required
                  value={volSector}
                  onChange={(e) => setVolSector(e.target.value)}
                  placeholder="e.g. Section 104, Row G, Seat 12"
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
              <div>
                <label htmlFor="vol-issue-input" className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">What do you need help with?</label>
                <textarea
                  id="vol-issue-input"
                  required
                  value={volIssue}
                  onChange={(e) => setVolIssue(e.target.value)}
                  placeholder="e.g. Wheelchair assistance, lost child, medical query, water spill..."
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium h-16 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10 border border-emerald-400/20"
              >
                {t.requestVolunteer}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
