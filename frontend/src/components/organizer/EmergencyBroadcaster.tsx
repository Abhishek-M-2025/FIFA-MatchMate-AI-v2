import React from 'react';
import { AlertTriangle, Send, CheckCircle2 } from 'lucide-react';

interface EmergencyBroadcasterProps {
  alertSeverity: 'Info' | 'Warning' | 'Critical';
  setAlertSeverity: (s: 'Info' | 'Warning' | 'Critical') => void;
  alertTitle: string;
  setAlertTitle: (t: string) => void;
  alertStatus: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export const EmergencyBroadcaster: React.FC<EmergencyBroadcasterProps> = ({
  alertSeverity,
  setAlertSeverity,
  alertTitle,
  setAlertTitle,
  alertStatus,
  onSubmit
}) => {
  return (
    <div className="glass-panel rounded-3xl p-5 border-slate-800 space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-400" />
        <h3 className="font-bold text-slate-200 text-sm">Broadcast Emergency Notice</h3>
      </div>

      {alertStatus && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{alertStatus}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Alert Level</label>
          <div className="grid grid-cols-3 gap-2">
            {(['Info', 'Warning', 'Critical'] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setAlertSeverity(sev)}
                className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  alertSeverity === sev
                    ? sev === 'Critical' ? 'bg-red-500/10 border-red-500/30 text-red-400 glow-red' :
                      sev === 'Warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 glow-gold' :
                      'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 glow-emerald'
                    : 'bg-slate-900/80 border-slate-850 text-slate-500'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="broadcast-input" className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Broadcast message</label>
          <textarea
            id="broadcast-input"
            required
            value={alertTitle}
            onChange={(e) => setAlertTitle(e.target.value)}
            placeholder="e.g. Shuttle Bus delay on Route 4 due to traffic. Route via Gate D..."
            className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-medium h-20 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 shadow-md shadow-red-500/10 border border-red-400/20 flex items-center justify-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          Transmit Live Alert
        </button>
      </form>
    </div>
  );
};
