import React from 'react';
import { Activity } from 'lucide-react';
import { LiveData } from '../../types';

interface TrafficDensityWidgetProps {
  liveData: LiveData;
}

export const TrafficDensityWidget: React.FC<TrafficDensityWidgetProps> = ({ liveData }) => {
  return (
    <div className="glass-panel rounded-3xl p-5 border-slate-800 space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-slate-200 text-sm">Zone Traffic Densities</h3>
        </div>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
          {liveData.crowd.occupancy_percentage}% Stadium Occupied
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 py-4">
        {Object.entries(liveData.crowd.zones).map(([name, info]) => {
          const capRatio = info.occupancy / info.capacity;
          return (
            <div key={name} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-900 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-slate-200">{name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  info.density === 'High' ? 'bg-red-500/10 text-red-400' :
                  info.density === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {info.density}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-850">
                <div
                  className={`h-full transition-all duration-500 ${
                    capRatio > 0.9 ? 'bg-red-500' : capRatio > 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${capRatio * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 font-semibold">
                {info.occupancy.toLocaleString()} / {info.capacity.toLocaleString()} spectators
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
