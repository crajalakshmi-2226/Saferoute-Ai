import React from 'react';
import {
  NavigationMode,
  MobilityProfile,
  Coordinates,
  SavedPlace,
  JourneyHistoryItem,
} from '../../types';
import { PWAInstallButton } from '../PWAInstallButton';
import {
  Search,
  Locate,
  Accessibility,
  Compass,
  AlertTriangle,
  Camera,
  Layers,
  Building2,
  Clock,
  Bookmark,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  Flame,
  Users,
  GitCommit,
  Globe2,
  Scale,
  PhoneCall,
  FileText,
  ShieldAlert,
  FolderHeart
} from 'lucide-react';
import { MOBILITY_PROFILES } from '../../data/mobilityProfiles';
import { TRANSLATIONS, Language } from '../../utils/translations';

interface Props {
  navigationMode: NavigationMode;
  onSetNavigationMode: (mode: NavigationMode) => void;
  activeProfile: MobilityProfile;
  onSelectProfile: (profile: MobilityProfile) => void;
  currentLocation?: Coordinates;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
  onNavigateToScreen: (screenId: string) => void;
  savedPlaces: SavedPlace[];
  recentJourneys: JourneyHistoryItem[];
  onSelectSavedPlace: (place: SavedPlace) => void;
  language: Language;
}

export const HomeScreen: React.FC<Props> = ({
  navigationMode,
  onSetNavigationMode,
  activeProfile,
  onSelectProfile,
  currentLocation,
  onUseCurrentLocation,
  isLocating,
  onNavigateToScreen,
  savedPlaces,
  recentJourneys,
  onSelectSavedPlace,
  language,
}) => {
  const t = TRANSLATIONS[language];
  return (
    <div className="space-y-6 pb-20">
      {/* 1. Install App Option near top of Home page */}
      <PWAInstallButton variant="banner" />

      {/* 2. Hero Search Box */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-1 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              Human-Centric Wayfinding
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Where would you like to travel safely?
          </h1>
          <p className="text-xs text-slate-400">
            Routes verified for stairs, step-free access, surface smoothness and real physical barriers.
          </p>
        </div>

        {/* Search trigger card */}
        <div
          onClick={() => onNavigateToScreen('search')}
          className="group flex items-center justify-between gap-3 rounded-2xl bg-slate-950/80 hover:bg-slate-950 border border-slate-700/80 hover:border-blue-500/50 p-3.5 sm:p-4 cursor-pointer transition shadow-inner"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white transition">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition">
                Search address, landmark or transit hub...
              </span>
              <p className="text-[11px] text-slate-400">
                {currentLocation ? 'Origin: Your Current Real GPS Location' : 'Tap to select origin and destination'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
            <span className="hidden sm:inline">Plan Route</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        {/* Location Quick Button */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={onUseCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 px-3.5 py-2 text-xs font-semibold text-slate-200 transition active:scale-95 cursor-pointer"
          >
            <Locate className={`w-3.5 h-3.5 text-blue-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span>
              {isLocating
                ? 'Acquiring GPS location...'
                : currentLocation
                ? `Location Ready (${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)})`
                : 'Use My Current Location'}
            </span>
          </button>

          {currentLocation && (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> High-accuracy GPS active
            </span>
          )}
        </div>
      </div>

      {/* 3. Rights, Safety & Legal Help Section (New Primary Feature) */}
      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              {language === 'ta' ? 'அதிகாரப்பூர்வ சட்ட & பாதுகாப்பு மையம்' : 'Citizen Protection & Assistance'}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-white">
            {t.rightsSectionTitle}
          </h2>
          <p className="text-xs text-slate-400">
            {t.rightsSectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Card 1: Ask a Legal Question */}
          <div
            onClick={() => onNavigateToScreen('legal_assist')}
            className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/60 cursor-pointer transition shadow-md hover:shadow-blue-900/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition mb-2.5">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition">
                {t.askLegalQuestion}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {t.askLegalQuestionDesc}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-blue-400 group-hover:translate-x-0.5 transition">
              <span>{language === 'ta' ? 'கேள்வி கேளுங்கள்' : 'Consult Assistant'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Report an Incident */}
          <div
            onClick={() => onNavigateToScreen('report_incident')}
            className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 cursor-pointer transition shadow-md hover:shadow-amber-900/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20 group-hover:bg-amber-600 group-hover:text-white transition mb-2.5">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition">
                {t.reportIncident}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {t.reportIncidentDesc}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-amber-400 group-hover:translate-x-0.5 transition">
              <span>{language === 'ta' ? 'புகார் படிவம்' : 'File Report'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Find Nearby Help */}
          <div
            onClick={() => onNavigateToScreen('nearby_help')}
            className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 cursor-pointer transition shadow-md hover:shadow-emerald-900/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition mb-2.5">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition">
                {t.findNearbyHelp}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {t.findNearbyHelpDesc}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-400 group-hover:translate-x-0.5 transition">
              <span>{language === 'ta' ? 'நிலையங்கள் காண்க' : 'View Stations'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: Emergency Assistance */}
          <div
            onClick={() => onNavigateToScreen('emergency')}
            className="group p-4 rounded-2xl bg-rose-950/20 border border-rose-500/40 hover:border-rose-500 cursor-pointer transition shadow-md hover:shadow-rose-950/40 flex flex-col justify-between"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm mb-2.5">
                <PhoneCall className="w-4 h-4 animate-pulse" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-rose-400 transition flex items-center gap-1.5">
                {t.emergencyAssistance}
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-mono">112</span>
              </h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {t.emergencyAssistanceDesc}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-rose-400 group-hover:translate-x-0.5 transition">
              <span>{language === 'ta' ? 'அவசர உதவி எண்' : 'Direct Helpline'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 5: My Saved Reports */}
          <div
            onClick={() => onNavigateToScreen('my_reports')}
            className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/60 cursor-pointer transition shadow-md hover:shadow-purple-900/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition mb-2.5">
                <FolderHeart className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-400 transition">
                {t.mySavedReports}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {t.mySavedReportsDesc}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-purple-400 group-hover:translate-x-0.5 transition">
              <span>{language === 'ta' ? 'கோப்புகளைப் பார்' : 'View Records'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 6: Accessible Route Planner */}
          <div
            onClick={() => onNavigateToScreen('search')}
            className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/60 cursor-pointer transition shadow-md hover:shadow-cyan-900/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-600 group-hover:text-white transition mb-2.5">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-400 transition">
                {t.accessibleRoutePlanner}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {t.accessibleRoutePlannerDesc}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-cyan-400 group-hover:translate-x-0.5 transition">
              <span>{language === 'ta' ? 'வழித் திட்டமிடல்' : 'Plan Safe Route'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Navigation Mode Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
            Navigation Mode
          </h2>
          <span className="text-[11px] text-slate-400">
            Select your preferred routing engine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => onSetNavigationMode('general')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              navigationMode === 'general'
                ? 'bg-slate-900 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${navigationMode === 'general' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">General Navigation</h3>
                  <span className="text-[11px] text-slate-400">Standard walking routes</span>
                </div>
              </div>
              {navigationMode === 'general' && (
                <span className="h-2 w-2 rounded-full bg-blue-500" />
              )}
            </div>
            <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
              Standard directions without accessibility filtering. Follows quickest pedestrian pathways.
            </p>
          </div>

          <div
            onClick={() => onSetNavigationMode('accessibility')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              navigationMode === 'accessibility'
                ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${navigationMode === 'accessibility' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Accessibility className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Accessibility Navigation</h3>
                  <span className="text-[11px] text-blue-400">Barrier-aware multi-factor scoring</span>
                </div>
              </div>
              {navigationMode === 'accessibility' && (
                <span className="h-2 w-2 rounded-full bg-blue-500" />
              )}
            </div>
            <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
              Weights Accessibility (40%) and Safety (25%) over distance. Eliminates stairs and obstacles.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Mobility Profile Shortcuts (when in Accessibility Mode) */}
      {navigationMode === 'accessibility' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
              Active Mobility Profile
            </h2>
            <button
              onClick={() => onNavigateToScreen('profiles')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              Customize Preferences →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {MOBILITY_PROFILES.filter((p) => p.id !== 'general_pedestrian').map((p) => {
              const isSelected = activeProfile.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProfile(p)}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-900/40 border-blue-500 text-white ring-1 ring-blue-500/40'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs truncate">{p.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                    {p.tagline}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Core Feature Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
          Accessibility Intelligence Suite
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div
            onClick={() => onNavigateToScreen('vision')}
            className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition mb-2.5">
              <Camera className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition">
              AI Vision Scanner
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Detect stairs, curb lips & surface defects with Gemini
            </p>
          </div>

          <div
            onClick={() => onNavigateToScreen('barriers')}
            className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-600 group-hover:text-white transition mb-2.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition">
              Barrier Intelligence
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Live reported obstacles, missing curb cuts & lift outages
            </p>
          </div>

          <div
            onClick={() => onNavigateToScreen('heatmap')}
            className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-600 group-hover:text-white transition mb-2.5">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition">
              Accessibility Heatmap
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Density map of step-free pathways vs physical barriers
            </p>
          </div>

          <div
            onClick={() => onNavigateToScreen('places')}
            className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition mb-2.5">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition">
              Place Accessibility
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Step-free entrances, lifts & facilities directory
            </p>
          </div>

          <div
            onClick={() => onNavigateToScreen('simulation')}
            className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition mb-2.5">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition">
              Accessibility Twin
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Simulate route suitability across all mobility profiles
            </p>
          </div>

          <div
            onClick={() => onNavigateToScreen('saved')}
            className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:bg-rose-600 group-hover:text-white transition mb-2.5">
              <Bookmark className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition">
              Saved Places
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Frequent destinations and past verified journeys
            </p>
          </div>

          <div
            onClick={() => onNavigateToScreen('pipeline')}
            className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition mb-2.5">
              <GitCommit className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition">
              6-Stage Pipeline
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Technical pipeline from profile to live guidance
            </p>
          </div>

          <div
            onClick={() => onNavigateToScreen('impact')}
            className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition mb-2.5">
              <Globe2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition">
              Impact & Roadmap
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              SDG 10/11 alignment & 5-phase product roadmap
            </p>
          </div>
        </div>
      </div>

      {/* 6. Saved Places Quick List */}
      {savedPlaces.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
              Quick Bookmarks
            </h2>
            <button
              onClick={() => onNavigateToScreen('saved')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              View All ({savedPlaces.length})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {savedPlaces.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectSavedPlace(p)}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{p.name}</h4>
                    <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{p.address}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
