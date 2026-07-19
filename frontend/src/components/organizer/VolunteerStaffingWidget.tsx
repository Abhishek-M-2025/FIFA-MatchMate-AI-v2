import React from 'react';
import { Users } from 'lucide-react';
import { LiveData } from '../../types';

interface VolunteerStaffingWidgetProps {
  volunteerAlloc: Record<string, number>;
  liveData: LiveData;
  onReallocate: (fromZone: string, toZone: string) => void;
}

export const VolunteerStaffingWidget: React.FC<VolunteerStaffingWidgetProps> = ({
  volunteerAlloc,
  liveData,
  onReallocate
}) => {
  // Compute total volunteers in local state
  const totalLocalVolunteers = Object.values(volunteerAlloc).reduce((a, b) => a + b, 0);

  return (
    <div className="glass-panel rounded-3xl p-5 border-slate-800 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-emerald-400" />
        <h3 className="font-bold text-slate-200 text-sm">Volunteer Staffing</h3>
      </div>

      <div className="space-y-3.5">
        {Object.entries(volunteerAlloc).map(([zone, count]) => (
          <div key={zone} className="bg-slate-950/40 p-3 rounded-2xl border border-slate-900 flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-slate-200">{zone}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{count} Stewards allocated</p>
            </div>
            {/* Allocation control buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const otherZones = Object.keys(volunteerAlloc).filter(z => z !== zone);
                  if (otherZones.length > 0) {
                    const target = otherZones[Math.floor(Math.random() * otherZones.length)];
                    onReallocate(zone, target);
                  }
                }}
                className="w-7 h-7 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 font-black text-slate-400 hover:text-white"
                title="Transfer 5 out"
              >
                -
              </button>
              <button
                onClick={() => {
                  const otherZones = Object.keys(volunteerAlloc).filter(z => z !== zone && volunteerAlloc[z] > 5);
                  if (otherZones.length > 0) {
                    const source = otherZones[0];
                    onReallocate(source, zone);
                  }
                }}
                className="w-7 h-7 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 font-black text-slate-400 hover:text-white"
                title="Transfer 5 in"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-900 pt-3">
        <span>Total Staff: {totalLocalVolunteers}</span>
        <span>Pending Requests: {liveData.volunteers.assistance_requests_pending}</span>
      </div>
    </div>
  );
};
