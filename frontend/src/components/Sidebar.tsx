import React from 'react';
import { Trophy, User, Shield, RefreshCw } from 'lucide-react';

interface SidebarProps {
  role: 'fan' | 'organizer';
  setRole: (role: 'fan' | 'organizer') => void;
  isUpdating: boolean;
  status: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, setRole, isUpdating, status }) => {
  return (
    <aside className="w-80 glass-panel border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 z-50 p-6">
      {/* Header & Logo */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20 border border-emerald-400/20">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
              FIFA MatchMate AI
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              World Cup 2026 Assistant
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Dashboard Mode</h2>
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setRole('fan')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                role === 'fan'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <User className="w-4 h-4" />
              Fan
            </button>
            <button
              onClick={() => setRole('organizer')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                role === 'organizer'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <Shield className="w-4 h-4" />
              Organizer
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info & Pulse Updates */}
      <div className="space-y-6">
        {/* System telemetry status indicator */}
        <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-850 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Telemetry Hub</span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${status === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 animate-ping'}`} />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                {status === 'Critical' ? 'Alert Active' : 'Live Sync'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin text-emerald-400' : 'text-slate-500'}`} />
            <span>Refreshes every 5 seconds</span>
          </div>
        </div>

        {/* Branding Footer */}
        <div className="text-center">
          <p className="text-[10px] text-slate-500 font-medium">
            FIFA MatchMate AI © 2026
          </p>
          <p className="text-[9px] text-slate-600 mt-1">
            Dallas Stadium • Live Operations
          </p>
        </div>
      </div>
    </aside>
  );
};
