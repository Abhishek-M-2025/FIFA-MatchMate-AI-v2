import React, { useState, useEffect } from 'react';
import { LiveData } from '../types';
import { triggerAlert, sendChatMessage } from '../api';
import { sanitizeInput } from '../utils/sanitize';
import { RefreshCw } from 'lucide-react';

// Subcomponents import
import { TrafficDensityWidget } from './organizer/TrafficDensityWidget';
import { GateWaitTimesChart } from './organizer/GateWaitTimesChart';
import { EmergencyBroadcaster } from './organizer/EmergencyBroadcaster';
import { VolunteerStaffingWidget } from './organizer/VolunteerStaffingWidget';
import { SustainabilityMetricsWidget } from './organizer/SustainabilityMetricsWidget';

interface OrganizerDashboardProps {
  liveData: LiveData | null;
  onRefresh: () => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({ liveData, onRefresh }) => {
  const [alertTitle, setAlertTitle] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'Info' | 'Warning' | 'Critical'>('Warning');
  const [alertStatus, setAlertStatus] = useState<string | null>(null);

  // Volunteer state locally managed
  const [volunteerAlloc, setVolunteerAlloc] = useState<Record<string, number>>({});
  // AI summary state
  const [aiSummary, setAiSummary] = useState<string>('Click "Generate Summary" to run an automated Gemini stadium audit.');
  const [generatingAi, setGeneratingAi] = useState(false);

  useEffect(() => {
    if (liveData && Object.keys(volunteerAlloc).length === 0) {
      setVolunteerAlloc(liveData.volunteers.zones);
    }
  }, [liveData]);

  if (!liveData) return null;

  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedTitle = sanitizeInput(alertTitle);
    if (!sanitizedTitle) return;
    try {
      await triggerAlert(alertSeverity, sanitizedTitle);
      setAlertStatus('Alert broadcasted successfully. Fans are notified.');
      setAlertTitle('');
      onRefresh(); // Trigger update immediately
      setTimeout(() => setAlertStatus(null), 5000);
    } catch (err) {
      setAlertStatus('Error broadcasting alert.');
    }
  };

  const reallocateVolunteer = (fromZone: string, toZone: string) => {
    if ((volunteerAlloc[fromZone] || 0) <= 0) return;
    setVolunteerAlloc((prev) => ({
      ...prev,
      [fromZone]: (prev[fromZone] || 0) - 5,
      [toZone]: (prev[toZone] || 0) + 5,
    }));
  };

  const generateAISummary = async () => {
    setGeneratingAi(true);
    try {
      const prompt = "Perform a stadium logistics audit. Detail any high-occupancy stands, bottleneck gates (wait time > 15m), and recommend concrete volunteer or steward adjustments.";
      const res = await sendChatMessage(prompt, "organizer");
      setAiSummary(res.response);
    } catch (e) {
      setAiSummary("Unable to contact Gemini API. Offline fallback suggestion: Check Gate B wait times and consider shifting 10 volunteers from West Stand to Gate B to alleviate transit bottlenecks.");
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Organizer Control Room</h2>
          <p className="text-sm text-slate-400 font-medium">
            Real-time control room telemetry, incident triggers, and AI coordination audits.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          Force Sync
        </button>
      </div>

      {/* Top Section: AI Summary Audit */}
      <div className="glass-panel rounded-3xl p-6 border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <h3 className="font-bold text-slate-100 text-sm">Automated AI Operational Audit</h3>
          </div>
          <button
            onClick={generateAISummary}
            disabled={generatingAi}
            className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-600 transition-all shadow-md shadow-amber-500/10 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          >
            {generatingAi ? 'Analyzing Telemetry...' : 'Generate Gemini Audit'}
          </button>
        </div>
        <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-900/80 text-xs leading-relaxed text-slate-350 font-semibold font-mono">
          {aiSummary}
        </div>
      </div>

      {/* Middle Row: Visual Graphs & Heatmaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crowd Density Heatmap Representation */}
        <TrafficDensityWidget liveData={liveData} />

        {/* Gate Wait Times SVG Bar Chart */}
        <GateWaitTimesChart liveData={liveData} />
      </div>

      {/* Bottom Section: Operations, Volunteers, Sustainability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operations Emergency Alert Broadcaster */}
        <EmergencyBroadcaster
          alertSeverity={alertSeverity}
          setAlertSeverity={setAlertSeverity}
          alertTitle={alertTitle}
          setAlertTitle={setAlertTitle}
          alertStatus={alertStatus}
          onSubmit={handleBroadcastAlert}
        />

        {/* Volunteer Allocation Grid */}
        <VolunteerStaffingWidget
          volunteerAlloc={volunteerAlloc}
          liveData={liveData}
          onReallocate={reallocateVolunteer}
        />

        {/* Sustainability Dashboard */}
        <SustainabilityMetricsWidget liveData={liveData} />
      </div>
    </div>
  );
};
