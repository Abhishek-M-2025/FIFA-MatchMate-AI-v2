import React from 'react';
import { TrendingUp } from 'lucide-react';
import { LiveData } from '../../types';

interface GateWaitTimesChartProps {
  liveData: LiveData;
}

export const GateWaitTimesChart: React.FC<GateWaitTimesChartProps> = ({ liveData }) => {
  return (
    <div className="glass-panel rounded-3xl p-5 border-slate-800 space-y-4 flex flex-col justify-between">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-400" />
        <h3 className="font-bold text-slate-200 text-sm">Gate Queues & Wait Times</h3>
      </div>

      <div className="flex-1 min-h-[160px] flex items-end justify-around border-b border-slate-850 pb-2 gap-4">
        {liveData.gates.map((gate) => {
          const pct = Math.min(100, (gate.wait_time_minutes / 30) * 100);
          const color = gate.wait_time_minutes > 20 ? '#ef4444' : gate.wait_time_minutes > 10 ? '#f59e0b' : '#10b981';
          return (
            <div key={gate.id} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-[10px] font-bold text-slate-350">{gate.wait_time_minutes}m</div>
              <div className="w-full bg-slate-950/60 rounded-t-lg border border-slate-850 h-28 flex items-end overflow-hidden">
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{ height: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <div className="text-[9px] font-bold text-slate-400 truncate max-w-[65px]">{gate.id}</div>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] text-slate-500 leading-normal flex items-center justify-between">
        <span>Critical Bottleneck Threshold: 20 mins</span>
        <span className="font-bold text-emerald-400">Updates every 5 seconds</span>
      </div>
    </div>
  );
};
