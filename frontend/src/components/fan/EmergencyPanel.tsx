import React from 'react';
import { AlertOctagon, ShieldAlert, ChevronDown, ChevronRight } from 'lucide-react';
import { LiveData } from '../../types';

interface EmergencyPanelProps {
  liveData: LiveData;
  isOpen: boolean;
  onToggle: () => void;
  t: any;
}

export const EmergencyPanel: React.FC<EmergencyPanelProps> = ({ liveData, isOpen, onToggle, t }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
      <button
        id="emergency-panel-btn"
        aria-controls="emergency-panel-content"
        aria-expanded={isOpen}
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-all text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        <div className="flex items-center gap-3">
          <AlertOctagon className="w-5 h-5 text-red-400" />
          <span className="font-bold text-sm text-slate-200">{t.emergency}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {isOpen && (
        <div
          id="emergency-panel-content"
          role="region"
          aria-labelledby="emergency-panel-btn"
          className="px-5 pb-5 pt-3 border-t border-slate-900 text-sm space-y-3 bg-slate-950/20 text-slate-350"
        >
          <p className="text-xs font-semibold leading-relaxed text-red-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
            Always check the active emergency broadcast guidelines during evac situations.
          </p>
          <ul className="space-y-1 text-xs list-decimal list-inside text-slate-400">
            <li>Locate the green glowing exit signs in your sector corridor.</li>
            <li>Move calmly towards the nearest gate (Gate A, B, C, or D) as directed by stewards.</li>
            <li>Do not use elevators; stairs are equipped with emergency battery power.</li>
          </ul>
        </div>
      )}
    </div>
  );
};
