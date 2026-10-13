import React, { useState } from 'react';
import { MobilityProfile, MobilityPreferences } from '../../types';
import { MOBILITY_PROFILES } from '../../data/mobilityProfiles';
import {
  Accessibility,
  CheckCircle,
  Sliders,
  RotateCcw,
  Volume2,
  ShieldAlert,
  ArrowRight,
  Footprints,
  Eye,
  Activity,
  UserCheck,
  Compass,
  Check
} from 'lucide-react';

interface Props {
  activeProfile: MobilityProfile;
  activePreferences: MobilityPreferences;
  onSaveProfileAndPreferences: (profile: MobilityProfile, preferences: MobilityPreferences) => void;
  onCancel: () => void;
}

export const MobilityProfileScreen: React.FC<Props> = ({
  activeProfile,
  activePreferences,
  onSaveProfileAndPreferences,
  onCancel,
}) => {
  const [selectedProfile, setSelectedProfile] = useState<MobilityProfile>(activeProfile);
  const [prefs, setPrefs] = useState<MobilityPreferences>({ ...activePreferences });
  const [hasChanges, setHasChanges] = useState(false);

  const handleSelectProfile = (p: MobilityProfile) => {
    setSelectedProfile(p);
    setPrefs({ ...p.defaultPreferences });
    setHasChanges(true);
  };

  const handleTogglePref = (key: keyof MobilityPreferences) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  };

  const handleSliderChange = (distance: number) => {
    setPrefs((prev) => ({
      ...prev,
      maxWalkingDistanceMeters: distance,
    }));
    setHasChanges(true);
  };

  const handleResetDefaults = () => {
    setPrefs({ ...selectedProfile.defaultPreferences });
    setHasChanges(true);
  };

  const handleSave = () => {
    onSaveProfileAndPreferences(selectedProfile, prefs);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Accessibility className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white">Personalized Mobility Profile</h1>
              <p className="text-xs text-slate-400">
                Configure your physical accessibility needs, step restrictions, and endurance thresholds
              </p>
            </div>
          </div>
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Profile Selection Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          1. Choose Mobility Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MOBILITY_PROFILES.map((p) => {
            const isSelected = selectedProfile.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleSelectProfile(p)}
                className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                  isSelected
                    ? 'bg-blue-950/50 border-blue-500 shadow-md ring-1 ring-blue-500/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">{p.name}</h3>
                  {isSelected && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div className="text-[11px] font-semibold text-blue-400">{p.tagline}</div>
                <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Granular Preference Toggles */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>2. Pathway & Barrier Preferences</span>
          </h2>
          <span className="text-[11px] text-slate-400">
            Tailor SafeRoute AI scoring weights
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Avoid Stairs */}
          <div
            onClick={() => handleTogglePref('avoidStairs')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
              prefs.avoidStairs
                ? 'bg-blue-900/30 border-blue-500/60 text-white'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div>
              <div className="text-xs font-bold text-slate-200">Avoid Stairs & Step Flights</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Strictly penalize or filter routes containing steps</p>
            </div>
            <div className={`h-5 w-9 rounded-full transition-colors flex items-center p-0.5 ${prefs.avoidStairs ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'}`}>
              <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
            </div>
          </div>

          {/* Prefer Ramps */}
          <div
            onClick={() => handleTogglePref('preferRamps')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
              prefs.preferRamps
                ? 'bg-blue-900/30 border-blue-500/60 text-white'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div>
              <div className="text-xs font-bold text-slate-200">Prefer Ramps & Step-Free</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Prioritize ADA/level entrance ramps and curb ramps</p>
            </div>
            <div className={`h-5 w-9 rounded-full transition-colors flex items-center p-0.5 ${prefs.preferRamps ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'}`}>
              <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
            </div>
          </div>

          {/* Avoid Steep Slopes */}
          <div
            onClick={() => handleTogglePref('avoidSteepSlopes')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
              prefs.avoidSteepSlopes
                ? 'bg-blue-900/30 border-blue-500/60 text-white'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div>
              <div className="text-xs font-bold text-slate-200">Avoid Steep Incline Slopes</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Cap incline gradients to prevent wheel roll-back or strain</p>
            </div>
            <div className={`h-5 w-9 rounded-full transition-colors flex items-center p-0.5 ${prefs.avoidSteepSlopes ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'}`}>
              <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
            </div>
          </div>

          {/* Prefer Stable Surfaces */}
          <div
            onClick={() => handleTogglePref('preferStableSurfaces')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
              prefs.preferStableSurfaces
                ? 'bg-blue-900/30 border-blue-500/60 text-white'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div>
              <div className="text-xs font-bold text-slate-200">Prefer Stable, Even Surfaces</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Avoid cobblestones, deep gravel, cracked concrete</p>
            </div>
            <div className={`h-5 w-9 rounded-full transition-colors flex items-center p-0.5 ${prefs.preferStableSurfaces ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'}`}>
              <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
            </div>
          </div>

          {/* Prefer Safer Crossings */}
          <div
            onClick={() => handleTogglePref('preferSaferCrossings')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
              prefs.preferSaferCrossings
                ? 'bg-blue-900/30 border-blue-500/60 text-white'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div>
              <div className="text-xs font-bold text-slate-200">Prefer Safer Pedestrian Crossings</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Prioritize signalized crosswalks and pedestrian refuges</p>
            </div>
            <div className={`h-5 w-9 rounded-full transition-colors flex items-center p-0.5 ${prefs.preferSaferCrossings ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'}`}>
              <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
            </div>
          </div>

          {/* Avoid Narrow Passages */}
          <div
            onClick={() => handleTogglePref('avoidNarrowPassages')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
              prefs.avoidNarrowPassages
                ? 'bg-blue-900/30 border-blue-500/60 text-white'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div>
              <div className="text-xs font-bold text-slate-200">Avoid Narrow Passages (&lt; 90cm)</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Bypass scaffolding and tight sidewalk obstructions</p>
            </div>
            <div className={`h-5 w-9 rounded-full transition-colors flex items-center p-0.5 ${prefs.avoidNarrowPassages ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'}`}>
              <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
            </div>
          </div>

          {/* Spoken Guidance */}
          <div
            onClick={() => handleTogglePref('enableSpokenGuidance')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
              prefs.enableSpokenGuidance
                ? 'bg-blue-900/30 border-blue-500/60 text-white'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div>
              <div className="text-xs font-bold text-slate-200">Enable Spoken Audio Directions</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Speaks turns, maneuvers, and barrier proximity</p>
            </div>
            <div className={`h-5 w-9 rounded-full transition-colors flex items-center p-0.5 ${prefs.enableSpokenGuidance ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'}`}>
              <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
            </div>
          </div>
        </div>

        {/* Max Walking Distance Target Slider */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">Preferred Walking Distance Threshold</span>
            <span className="font-mono font-bold text-blue-400">
              {prefs.maxWalkingDistanceMeters} meters ({(prefs.maxWalkingDistanceMeters / 1000).toFixed(1)} km)
            </span>
          </div>
          <input
            type="range"
            min="300"
            max="5000"
            step="100"
            value={prefs.maxWalkingDistanceMeters}
            onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>300m (Low endurance)</span>
            <span>2.5 km (Standard)</span>
            <span>5.0 km (High range)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Apply Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
