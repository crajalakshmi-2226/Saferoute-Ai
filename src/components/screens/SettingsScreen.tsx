import React, { useState, useEffect } from 'react';
import { ThemeMode, ScoringWeights } from '../../types';
import { getMapboxToken } from '../../services/mapboxService';
import { DEFAULT_SCORING_WEIGHTS } from '../../services/scoringService';
import {
  Settings,
  Key,
  Sparkles,
  Locate,
  Moon,
  Sun,
  Laptop,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  Info,
  Database,
  ExternalLink,
  HelpCircle,
  CheckCircle2,
  RefreshCw,
  Sliders,
  RotateCcw,
  GitCommit,
  Globe2,
  ChevronRight
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface Props {
  theme: ThemeMode;
  onSetTheme: (theme: ThemeMode) => void;
  onOpenTokenModal: () => void;
  scoringWeights: ScoringWeights;
  onUpdateScoringWeights: (weights: ScoringWeights) => void;
  onNavigateToScreen: (screenId: string) => void;
}

export const SettingsScreen: React.FC<Props> = ({
  theme,
  onSetTheme,
  onOpenTokenModal,
  scoringWeights,
  onUpdateScoringWeights,
  onNavigateToScreen,
}) => {
  const [hasMapboxToken, setHasMapboxToken] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean | null>(null);
  const [checkingBackend, setCheckingBackend] = useState(false);
  const { isInstalled, isInstallable, isIOS } = usePWAInstall();

  // Local weights state
  const [localWeights, setLocalWeights] = useState<ScoringWeights>(scoringWeights);

  useEffect(() => {
    setLocalWeights(scoringWeights);
  }, [scoringWeights]);

  useEffect(() => {
    const t = getMapboxToken();
    setHasMapboxToken(!!t);

    async function checkHealth() {
      setCheckingBackend(true);
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setHasGeminiKey(data.capabilities?.serverSideGemini ?? false);
        } else {
          setHasGeminiKey(false);
        }
      } catch {
        setHasGeminiKey(false);
      } finally {
        setCheckingBackend(false);
      }
    }

    checkHealth();
  }, []);

  const handleWeightSlider = (key: keyof ScoringWeights, val: number) => {
    const next = { ...localWeights, [key]: val };
    setLocalWeights(next);
    onUpdateScoringWeights(next);
  };

  const handleResetWeights = () => {
    setLocalWeights(DEFAULT_SCORING_WEIGHTS);
    onUpdateScoringWeights(DEFAULT_SCORING_WEIGHTS);
  };

  const totalWeight =
    localWeights.accessibility + localWeights.safety + localWeights.preference + localWeights.distance;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">Application Settings & Configuration</h1>
            <p className="text-xs text-slate-400">
              Scoring models, Mapbox credentials, AI status, and system specifications
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access to Architecture & Roadmap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          onClick={() => onNavigateToScreen('pipeline')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition flex items-center justify-between group shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition">
              <GitCommit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white group-hover:text-blue-400 transition">
                6-Stage Routing Pipeline
              </h3>
              <p className="text-[11px] text-slate-400">Inspect the end-to-end algorithmic flow</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition" />
        </div>

        <div
          onClick={() => onNavigateToScreen('impact')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition flex items-center justify-between group shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white group-hover:text-emerald-400 transition">
                Impact, SDGs & 5-Phase Roadmap
              </h3>
              <p className="text-[11px] text-slate-400">UN SDG 10/11 alignment & expansion roadmap</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
        </div>
      </div>

      {/* 1. Configurable Scoring Model Weights */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Configurable Route Scoring Formula</h2>
              <p className="text-[11px] text-slate-400">Adjust the multi-factor optimization balance</p>
            </div>
          </div>

          <button
            onClick={handleResetWeights}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset (40/25/25/10)</span>
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
          The baseline scoring model is an implementation starting point calibrated for inclusive pedestrian safety. Weights are automatically normalized before calculating the final suitability score.
        </div>

        {/* Sliders Grid */}
        <div className="space-y-3.5 pt-1">
          {/* Accessibility Weight */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Accessibility (Ramps, step-free, surface)</span>
              <span className="font-mono font-bold text-blue-400">{localWeights.accessibility}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              step="5"
              value={localWeights.accessibility}
              onChange={(e) => handleWeightSlider('accessibility', parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Safety Weight */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Safety (Controlled crossings, lighting, reports)</span>
              <span className="font-mono font-bold text-cyan-400">{localWeights.safety}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={localWeights.safety}
              onChange={(e) => handleWeightSlider('safety', parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Preference Match Weight */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">User Preference Match (Profile endurance limits)</span>
              <span className="font-mono font-bold text-indigo-400">{localWeights.preference}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={localWeights.preference}
              onChange={(e) => handleWeightSlider('preference', parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Distance Weight */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Distance Factor (Shortest route penalty)</span>
              <span className="font-mono font-bold text-emerald-400">{localWeights.distance}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="5"
              value={localWeights.distance}
              onChange={(e) => handleWeightSlider('distance', parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
          <span>Active Weight Sum: <strong className="font-mono text-white">{totalWeight}%</strong> (Normalized)</span>
          <span className="text-emerald-400 font-medium">Auto-applied to live routing engine</span>
        </div>
      </div>

      {/* 2. Mapbox API Token Configuration */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white">Mapbox GL JS & Routing Configuration</h2>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
              hasMapboxToken
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {hasMapboxToken ? 'Configured' : 'Token Required'}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Mapbox provides interactive vector tile rendering, geocoding autocomplete, and real walking route geometry. A public token is required to load interactive map tiles.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-slate-400 font-mono">
            Key: <code>VITE_MAPBOX_PUBLIC_TOKEN</code> or session token
          </div>
          <button
            onClick={onOpenTokenModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md transition active:scale-95"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Manage Mapbox Token</span>
          </button>
        </div>
      </div>

      {/* 3. Server-side Gemini AI Status */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-bold text-white">Server-Side Gemini AI Engine</h2>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
              hasGeminiKey
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {checkingBackend ? 'Checking...' : hasGeminiKey ? 'Active (Gemini 3.8 Flash)' : 'Unconfigured'}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The backend runs <code>@google/genai</code> with <code>gemini-3.8-flash</code> for computer-vision sidewalk obstacle analysis and grounded route explainability. In accordance with security best practices, the API key is strictly maintained server-side and is never exposed in browser bundles.
        </p>

        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <span>
            To activate live multimodal vision inspection, configure <code>GEMINI_API_KEY</code> in the Google AI Studio <strong>Settings &gt; Secrets</strong> panel. When unconfigured, the app offers structured demo schemas.
          </span>
        </div>
      </div>

      {/* 4. Theme Mode Selection */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Moon className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Visual Theme & Contrast</h2>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
            Active: {theme}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onSetTheme('light')}
            className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-800 text-white border-blue-500 shadow-md ring-1 ring-blue-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold">Light Mode</span>
          </button>

          <button
            onClick={() => onSetTheme('dark')}
            className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-800 text-white border-blue-500 shadow-md ring-1 ring-blue-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Moon className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-bold">Dark Mode</span>
          </button>

          <button
            onClick={() => onSetTheme('system')}
            className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition cursor-pointer ${
              theme === 'system'
                ? 'bg-slate-800 text-white border-blue-500 shadow-md ring-1 ring-blue-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Laptop className="w-5 h-5 text-slate-300" />
            <span className="text-xs font-bold">System Default</span>
          </button>
        </div>
      </div>

      {/* 5. Browser Permissions & Geolocation */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Locate className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Location Permissions (GPS)</h2>
          </div>
          <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 uppercase">
            User-Controlled
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          SafeRoute AI requests location access strictly when you tap &quot;Use My Current Location&quot;. We use high-accuracy browser geolocation with GPS fallback and timeout safeguards. Precise location coordinates are never permanently logged or tracked without explicit consent.
        </p>

        <div className="text-[11px] text-slate-400 bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>If location permission is denied, the application gracefully provides manual origin address entry.</span>
        </div>
      </div>

      {/* 6. Data Architecture & Honest Transparency */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <Database className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold text-white">Data Architecture & Persistence Transparency</h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          In this runtime environment, community barrier reports, facility audits, and user bookmarks are managed via full-stack Express REST APIs with in-memory persistence and client <code>localStorage</code> synchronization. If PostgreSQL + PostGIS is provisioned in the future, the backend seamlessly routes to relational Prisma migrations.
        </p>
      </div>
    </div>
  );
};
