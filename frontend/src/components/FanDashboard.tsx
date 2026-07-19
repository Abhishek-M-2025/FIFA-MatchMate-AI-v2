import React, { useState } from 'react';
import { LiveData, WeatherInfo } from '../types';
import { MockMap } from './MockMap';
import { AIChatVoice } from './AIChatVoice';
import { WeatherWidget } from './WeatherWidget';
import { Globe, Bell } from 'lucide-react';

// Subcomponents import
import { TransitPanel } from './fan/TransitPanel';
import { ParkingPanel } from './fan/ParkingPanel';
import { DiningPanel } from './fan/DiningPanel';
import { WashroomsPanel } from './fan/WashroomsPanel';
import { MedicalPanel } from './fan/MedicalPanel';
import { AccessibilityPanel } from './fan/AccessibilityPanel';
import { VolunteerPanel } from './fan/VolunteerPanel';
import { LostFoundPanel } from './fan/LostFoundPanel';
import { EmergencyPanel } from './fan/EmergencyPanel';

interface FanDashboardProps {
  liveData: LiveData | null;
  weather: WeatherInfo | null;
  weatherLoading: boolean;
}

const TRANSLATIONS = {
  en: {
    transit: "Transit & Shuttles",
    parking: "Parking Status",
    dining: "Concourse Dining",
    restrooms: "Restrooms",
    medical: "Medical Stations",
    accessibility: "Accessibility Info",
    volunteers: "Volunteer Support",
    lostFound: "Lost & Found Log",
    emergency: "Emergency Escape Guide",
    activeAlerts: "Live Security & Operations Alerts",
    langSelect: "Language",
    stadiumStatus: "Dallas Stadium Status",
    capacityLabel: "Capacity Occupied",
    assistReqSuccess: "Volunteer help requested successfully. A crew member in an emerald shirt will reach your sector shortly.",
    requestVolunteer: "Request Assistance"
  },
  es: {
    transit: "Tránsito y Lanzaderas",
    parking: "Estado del Estacionamiento",
    dining: "Comedor del Concurso",
    restrooms: "Servicios Higiénicos",
    medical: "Estaciones Médicas",
    accessibility: "Información de Accesibilidad",
    volunteers: "Soporte de Voluntarios",
    lostFound: "Registro de Objetos Perdidos",
    emergency: "Guía de Escape de Emergencia",
    activeAlerts: "Alertas de Seguridad y Operaciones",
    langSelect: "Idioma",
    stadiumStatus: "Estado del Estadio de Dallas",
    capacityLabel: "Capacidad Ocupada",
    assistReqSuccess: "Ayuda voluntaria solicitada con éxito. Un miembro del equipo en camisa esmeralda llegará a su sector en breve.",
    requestVolunteer: "Solicitar Asistencia"
  },
  fr: {
    transit: "Transports & Navettes",
    parking: "État du Parking",
    dining: "Restauration Hall",
    restrooms: "Toilettes",
    medical: "Postes Médicaux",
    accessibility: "Infos Accessibilité",
    volunteers: "Aide des Bénévoles",
    lostFound: "Objets Trouvés",
    emergency: "Directives d'Urgence",
    activeAlerts: "Flux d'Alertes Sécurité & Trafic",
    langSelect: "Langue",
    stadiumStatus: "Statut du Stade de Dallas",
    capacityLabel: "Capacité Occupée",
    assistReqSuccess: "Demande d'aide envoyée. Un bénévole portant un maillot émeraude arrivera à votre secteur sous peu.",
    requestVolunteer: "Demander de l'aide"
  }
};

type Language = 'en' | 'es' | 'fr';

export const FanDashboard: React.FC<FanDashboardProps> = ({ liveData, weather, weatherLoading }) => {
  const [lang, setLang] = useState<Language>('en');
  const [activeWidget, setActiveWidget] = useState<string | null>('transit');
  const [volunteerSubmitted, setVolunteerSubmitted] = useState(false);
  const [volSector, setVolSector] = useState('');
  const [volIssue, setVolIssue] = useState('');

  const t = TRANSLATIONS[lang];

  if (!liveData) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 font-medium">Synchronizing live fan dashboard telemetry...</p>
        </div>
      </div>
    );
  }

  const toggleWidget = (widget: string) => {
    setActiveWidget(activeWidget === widget ? null : widget);
  };

  const handleVolunteerRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volSector || !volIssue) return;
    setVolunteerSubmitted(true);
    setTimeout(() => {
      setVolunteerSubmitted(false);
      setVolSector('');
      setVolIssue('');
    }, 6000);
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            {t.stadiumStatus}
          </h2>
          <p className="text-sm text-slate-400 font-medium">
            Welcome back! Monitor live crowd, navigation routes, and ask our AI anything.
          </p>
        </div>

        {/* Global Selectors */}
        <div className="flex items-center gap-4">
          {/* Weather Widget */}
          <div className="w-64">
            <WeatherWidget weather={weather} loading={weatherLoading} />
          </div>

          {/* Lang Widget */}
          <div className="glass-panel p-2 rounded-2xl flex items-center gap-2 border-slate-800">
            <Globe className="w-4 h-4 text-emerald-400 ml-2" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              className="bg-slate-900 border-none outline-none text-xs font-bold text-slate-200 cursor-pointer pr-4"
              aria-label={t.langSelect}
            >
              <option value="en">English (EN)</option>
              <option value="es">Español (ES)</option>
              <option value="fr">Français (FR)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Layout: Map and Controls on Left, AI Assistant & Alerts on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Map + Widgets */}
        <div className="lg:col-span-8 space-y-6">
          <MockMap liveData={liveData} />

          {/* Collapsible Info Panels */}
          <div className="space-y-3" role="presentation">
            {/* Widget 1: Transport */}
            <TransitPanel
              liveData={liveData}
              isOpen={activeWidget === 'transit'}
              onToggle={() => toggleWidget('transit')}
              t={t}
            />

            {/* Widget 2: Parking */}
            <ParkingPanel
              liveData={liveData}
              isOpen={activeWidget === 'parking'}
              onToggle={() => toggleWidget('parking')}
              t={t}
            />

            {/* Widget 3: Dining */}
            <DiningPanel
              liveData={liveData}
              isOpen={activeWidget === 'dining'}
              onToggle={() => toggleWidget('dining')}
              t={t}
            />

            {/* Widget 4: Washrooms */}
            <WashroomsPanel
              liveData={liveData}
              isOpen={activeWidget === 'restrooms'}
              onToggle={() => toggleWidget('restrooms')}
              t={t}
            />

            {/* Widget 5: Medical & Safety */}
            <MedicalPanel
              liveData={liveData}
              isOpen={activeWidget === 'medical'}
              onToggle={() => toggleWidget('medical')}
              t={t}
            />

            {/* Widget 6: Accessibility */}
            <AccessibilityPanel
              liveData={liveData}
              isOpen={activeWidget === 'accessibility'}
              onToggle={() => toggleWidget('accessibility')}
              t={t}
            />

            {/* Widget 7: Volunteer Help */}
            <VolunteerPanel
              liveData={liveData}
              isOpen={activeWidget === 'volunteer-help'}
              onToggle={() => toggleWidget('volunteer-help')}
              t={t}
              volunteerSubmitted={volunteerSubmitted}
              volSector={volSector}
              setVolSector={setVolSector}
              volIssue={volIssue}
              setVolIssue={setVolIssue}
              onSubmit={handleVolunteerRequest}
            />

            {/* Widget 8: Lost and Found */}
            <LostFoundPanel
              liveData={liveData}
              isOpen={activeWidget === 'lost-found'}
              onToggle={() => toggleWidget('lost-found')}
              t={t}
            />

            {/* Widget 9: Emergency exit */}
            <EmergencyPanel
              liveData={liveData}
              isOpen={activeWidget === 'emergency'}
              onToggle={() => toggleWidget('emergency')}
              t={t}
            />
          </div>
        </div>

        {/* Right Column: AI Assistant + Notifications */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Chatbot */}
          <AIChatVoice role="fan" />

          {/* Active Alerts List */}
          <div className="glass-panel rounded-3xl p-5 border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-slate-200 text-sm">{t.activeAlerts}</h3>
              </div>
              <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full font-bold border border-slate-800">
                {liveData.alerts.length} alerts
              </span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1.5 custom-scrollbar">
              {liveData.alerts.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium text-center py-4">No active notices at this time.</p>
              ) : (
                liveData.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-2xl border text-xs leading-relaxed flex gap-2.5 ${
                      alert.severity === 'Critical' ? 'bg-red-500/10 border-red-500/30 text-red-200' :
                      alert.severity === 'Warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' :
                      'bg-slate-900/60 border-slate-850 text-slate-300'
                    }`}
                  >
                    <span className="font-black text-[10px] text-slate-500 shrink-0">{alert.timestamp}</span>
                    <div>
                      <p className="font-bold">{alert.severity === 'Critical' ? '⚠️ Critical' : alert.severity === 'Warning' ? '⚠️ Notice' : 'ℹ️ Info'}</p>
                      <p className="mt-0.5 text-slate-300 font-medium">{alert.title}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
