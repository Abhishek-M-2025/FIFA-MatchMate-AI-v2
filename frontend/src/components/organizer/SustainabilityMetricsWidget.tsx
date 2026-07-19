import React from 'react';
import { Leaf } from 'lucide-react';
import { LiveData } from '../../types';

interface SustainabilityMetricsWidgetProps {
  liveData: LiveData;
}

export const SustainabilityMetricsWidget: React.FC<SustainabilityMetricsWidgetProps> = ({ liveData }) => {
  return (
    <div className="glass-panel rounded-3xl p-5 border-slate-800 space-y-4">
      <div className="flex items-center gap-2">
        <Leaf className="w-5 h-5 text-emerald-400" />
        <h3 className="font-bold text-slate-200 text-sm">Sustainability Metrics</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Waste Recycled</span>
          <span className="text-sm font-extrabold text-slate-200 mt-1">{liveData.sustainability.waste_diverted_kg} kg</span>
        </div>
        <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Water Conserved</span>
          <span className="text-sm font-extrabold text-slate-200 mt-1">{liveData.sustainability.water_saved_liters} L</span>
        </div>
        <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Solar/Green Power</span>
          <span className="text-sm font-extrabold text-slate-200 mt-1">{liveData.sustainability.renewable_energy_kwh} kWh</span>
        </div>
        <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Carbon Offset</span>
          <span className="text-sm font-extrabold text-slate-200 mt-1">{liveData.sustainability.carbon_offset_kg} kg</span>
        </div>
      </div>

      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold rounded-xl text-emerald-400 text-center">
        🏟️ Stadium operating on 100% clean grid offset
      </div>
    </div>
  );
};
