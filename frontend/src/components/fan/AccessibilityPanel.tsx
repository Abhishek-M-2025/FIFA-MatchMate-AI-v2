import React from 'react';
import { Accessibility, ChevronDown, ChevronRight } from 'lucide-react';
import { LiveData } from '../../types';

interface AccessibilityPanelProps {
  liveData: LiveData;
  isOpen: boolean;
  onToggle: () => void;
  t: any;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ liveData, isOpen, onToggle, t }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
      <button
        id="accessibility-panel-btn"
        aria-controls="accessibility-panel-content"
        aria-expanded={isOpen}
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-all text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        <div className="flex items-center gap-3">
          <Accessibility className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-sm text-slate-200">{t.accessibility}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {isOpen && (
        <div
          id="accessibility-panel-content"
          role="region"
          aria-labelledby="accessibility-panel-btn"
          className="px-5 pb-5 pt-4 border-t border-slate-900 text-sm space-y-3 bg-slate-950/20 text-slate-300"
        >
          <p className="text-xs leading-relaxed font-semibold">
            Dallas Arena is fully ADA compliant. We support wheelchairs, service animals, sensory rooms, and accessible restrooms in all sections.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
            <li>Accessible entry gates are equipped with wider ticket stiles (Gate D).</li>
            <li>Wheelchair loan points are available at guest services in Concourse 102 & 218.</li>
            <li>Sensory calming room is open in Sector 132 for sensory-sensitive visitors.</li>
          </ul>
        </div>
      )}
    </div>
  );
};
