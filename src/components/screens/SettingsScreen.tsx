import React, { useState, useEffect } from 'react';
import { ThemeMode, ScoringWeights, Coordinates } from '../../types';
import { getMapboxToken } from '../../services/mapboxService';
import { DEFAULT_SCORING_WEIGHTS } from '../../services/scoringService';
import { UserProfileData, isFirebaseConfigured, auth } from '../../services/firebase';
import { OfflineMapsSection } from '../OfflineMapsSection';
import { BatterySaverSection } from '../BatterySaverSection';
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
  ChevronRight,
  User,
  LogOut,
  LogIn,
  Accessibility,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface Props {
  theme: ThemeMode;
  onSetTheme: (theme: ThemeMode) => void;
  onOpenTokenModal: () => void;
  scoringWeights: ScoringWeights;
  onUpdateScoringWeights: (weights: ScoringWeights) => void;
  onNavigateToScreen: (screenId: string) => void;
  userProfile: UserProfileData | null;
  isGuest: boolean;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenOnboarding: () => void;
  currentLocation?: Coordinates;
  onUseCurrentLocation?: () => void;
  isLocating?: boolean;
}

export const SettingsScreen: React.FC<Props> = ({
  theme,
  onSetTheme,
  onOpenTokenModal,
  scoringWeights,
  onUpdateScoringWeights,
  onNavigateToScreen,
  userProfile,
  isGuest,
  onOpenAuth,
  onSignOut,
  onOpenOnboarding,
  currentLocation,
  onUseCurrentLocation,
  isLocating,
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
              User identity, scoring models, cloud credentials, and system architecture
            </p>
          </div>
        </div>
      </div>

      {/* 0. Dedicated Account & Cloud Sync Section */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white">User Account & Firebase Sync</h2>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
              userProfile
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}
          >
            {userProfile ? 'Cloud Synced' : 'Guest Mode'}
          </span>
        </div>

        {userProfile ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-lg font-extrabold text-white shadow-md">
                {userProfile.fullName?.charAt(0) || userProfile.email?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate">{userProfile.fullName}</h3>
                  <span className="text-[10px] font-medium bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">{userProfile.email}</p>
                {userProfile.currentLocationName && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Locality: {userProfile.currentLocationName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={onOpenOnboarding}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-bold border border-blue-500/30 transition cursor-pointer"
              >
                <Accessibility className="w-4 h-4 text-blue-400" />
                <span>Reconfigure Mobility Profile</span>
              </button>

              <button
                type="button"
                onClick={onSignOut}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-bold border border-rose-500/20 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              You are currently using SafeRoute AI in <strong>Guest Mode</strong>. Your custom preferences, saved bookmarks, and navigation history are stored locally in your browser.
            </p>
            <button
              type="button"
              onClick={onOpenAuth}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Google or Email</span>
            </button>
          </div>
        )}
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
                Impact & Future Roadmap
              </h3>
              <p className="text-[11px] text-slate-400">Societal benefits, IoT, & expansions</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
        </div>
      </div>

      {/* 1. Multi-Factor Scoring Weight Customizer */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Multi-Factor Scoring Weights</h2>
              <p className="text-[11px] text-slate-400">
                Customize how SafeRoute AI balances safety vs. distance (Total: {totalWeight}%)
              </p>
            </div>
          </div>
          <button
            onClick={handleResetWeights}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        <div className="space-y-4 pt-2">
          {/* Accessibility Weight */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-200">1. Accessibility Factor (Default: 40%)</span>
              <span className="font-mono text-blue-400 font-bold">{localWeights.accessibility}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              value={localWeights.accessibility}
              onChange={(e) => handleWeightSlider('accessibility', Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <p className="text-[10px] text-slate-400">
              Evaluates stairs, ramps, surface quality, and curb cut continuity along candidate path.
            </p>
          </div>

          {/* Safety Weight */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-200">2. Safety Factor (Default: 25%)</span>
              <span className="font-mono text-emerald-400 font-bold">{localWeights.safety}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={localWeights.safety}
              onChange={(e) => handleWeightSlider('safety', Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-[10px] text-slate-400">
              Prioritizes marked crosswalks, pedestrian signals, and avoidance of hazardous construction zones.
            </p>
          </div>

          {/* Personal Preferences Weight */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-200">3. User Mobility Preferences (Default: 25%)</span>
              <span className="font-mono text-cyan-400 font-bold">{localWeights.preference}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={localWeights.preference}
              onChange={(e) => handleWeightSlider('preference', Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <p className="text-[10px] text-slate-400">
              Direct alignment with your active profile constraints (e.g. strict stair avoidance).
            </p>
          </div>

          {/* Distance Weight */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-200">4. Distance & Travel Time (Default: 10%)</span>
              <span className="font-mono text-amber-400 font-bold">{localWeights.distance}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={localWeights.distance}
              onChange={(e) => handleWeightSlider('distance', Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <p className="text-[10px] text-slate-400">
              Standard geometric metric. SafeRoute deliberately dampens distance so that an inaccessible shortcut is never recommended over a safe path.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Mapbox Public Token Management */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Mapbox Integration (GIS & Directions)</h2>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
              hasMapboxToken
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {hasMapboxToken ? 'Token Configured' : 'Needs Token'}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          SafeRoute AI uses Mapbox GL JS for interactive vector mapping, the Geocoding API for place search, and the Directions API for real walking geometry and step-by-step maneuvers.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={onOpenTokenModal}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md transition"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Configure or Update Mapbox Token</span>
          </button>

          <a
            href="https://account.mapbox.com/access-tokens/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <span>Get Free Mapbox Token</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 2b. Battery Saver Mode */}
      <BatterySaverSection />

      {/* 2c. Download Offline Maps */}
      <OfflineMapsSection
        currentLocation={currentLocation}
        onUseCurrentLocation={onUseCurrentLocation}
        isLocating={isLocating}
      />

      {/* 3. Gemini AI Multimodal Barrier Scanner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-bold text-white">Multimodal Gemini AI Integration</h2>
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
            To activate live multimodal vision inspection, configure <code>GEMINI_API_KEY</code> in the Google AI Studio <strong>Settings &gt; Secrets</strong> panel. When unconfigured, the app offers structured fallback schemas.
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
          <h2 className="text-sm font-bold text-white">Data Architecture & Cloud Persistence</h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          User profiles and accessibility preferences are securely synchronized with Google Cloud Firestore database under strict Zero-Trust Attribute-Based Access Control (ABAC) rules. Sidewalk barriers, crowdsourced reports, and navigation cache are served via Express REST APIs.
        </p>
      </div>
    </div>
  );
};
