import React, { useState } from 'react';
import {
  Shield,
  Accessibility,
  CheckCircle2,
  AlertCircle,
  Locate,
  Loader2,
  ChevronRight,
  X,
  MapPin,
  Sliders
} from 'lucide-react';
import { MOBILITY_PROFILES } from '../../data/mobilityProfiles';
import { MobilityProfile, MobilityPreferences, Coordinates } from '../../types';
import { requestCurrentPosition, POPULAR_LOCATION_PRESETS } from '../../services/locationService';
import { safeStorage } from '../../utils/storage';
import { UserProfileData } from '../../services/firebase';

interface Props {
  onAuthSuccess: (userProfile: UserProfileData) => void;
  onContinueAsGuest?: () => void;
  onClose?: () => void;
  initialMode?: 'auth' | 'onboarding';
}

export const AuthAndOnboardingScreen: React.FC<Props> = ({
  onAuthSuccess,
  onClose,
}) => {
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState<string>(() => {
    const saved = safeStorage.getItem('saferoute_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.fullName) return parsed.fullName;
      } catch {}
    }
    return 'SafeRoute Member';
  });

  const [locationName, setLocationName] = useState<string>('Chennai Central, TN');
  const [locationCoords, setLocationCoords] = useState<Coordinates | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>(() => {
    return safeStorage.getItem('saferoute_active_profile') || 'wheelchair';
  });

  const [preferences, setPreferences] = useState<MobilityPreferences>(() => {
    const saved = safeStorage.getItem('saferoute_preferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    const matched = MOBILITY_PROFILES.find((p) => p.id === selectedProfileId);
    return matched ? matched.defaultPreferences : MOBILITY_PROFILES[0].defaultPreferences;
  });

  const [loading, setLoading] = useState(false);

  // When selectedProfileId changes, sync default preferences
  const handleSelectProfile = (profile: MobilityProfile) => {
    setSelectedProfileId(profile.id);
    setPreferences(profile.defaultPreferences);
  };

  // Location detection
  const handleDetectLocation = async () => {
    setIsLocating(true);
    try {
      const res = await requestCurrentPosition();
      if (res.coordinates) {
        setLocationCoords(res.coordinates);
        setLocationName(res.cityName || 'Detected Location');
      }
    } catch (err) {
      console.warn('Location detection notice:', err);
    } finally {
      setIsLocating(false);
    }
  };

  // Finalize mobility profile save
  const handleCompleteSetup = () => {
    setLoading(true);

    const profilePayload: UserProfileData = {
      uid: 'local_user',
      fullName: fullName.trim() || 'SafeRoute Member',
      email: 'member@saferoute.local',
      currentLocationName: locationName,
      currentLocationLat: locationCoords?.lat,
      currentLocationLng: locationCoords?.lng,
      mobilityProfile: selectedProfileId,
      mobilityPreferences: preferences,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    };

    // Save local backup safely
    safeStorage.setItem('saferoute_user_profile', JSON.stringify(profilePayload));
    safeStorage.setItem('saferoute_active_profile', selectedProfileId);
    safeStorage.setItem('saferoute_preferences', JSON.stringify(preferences));
    safeStorage.setItem('saferoute_onboarding_seen', 'true');

    setLoading(false);
    onAuthSuccess(profilePayload);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-xl my-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100 relative">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-md">
                <Accessibility className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Mobility & Accessibility Setup</h2>
                <p className="text-xs text-slate-400">Step {onboardingStep} of 2 — Personalized Navigation</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {[1, 2].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`h-2 rounded-full transition-all ${
                    onboardingStep === stepNum
                      ? 'w-6 bg-blue-500'
                      : onboardingStep > stepNum
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: Select Mobility Profile */}
          {onboardingStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Choose your primary mobility needs:
                </h3>
                <p className="text-xs text-slate-400">
                  SafeRoute AI scores pathways specifically for stairs, curb cuts, surface texture, and ramps based on your choice.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                {MOBILITY_PROFILES.map((prof) => {
                  const isSelected = selectedProfileId === prof.id;
                  return (
                    <div
                      key={prof.id}
                      onClick={() => handleSelectProfile(prof)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                        isSelected
                          ? 'bg-blue-600/15 border-blue-500 shadow-md ring-1 ring-blue-500/40'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl mt-0.5 ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Accessibility className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate">{prof.name}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug mt-1">
                          {prof.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setOnboardingStep(2)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                >
                  <span>Next: Fine-tune Preferences</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Preferences & Home Base */}
          {onboardingStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Adjust Pathway Constraints
                </h3>
                <p className="text-xs text-slate-400">
                  Customize the specific sidewalk parameters you want our algorithm to prioritize.
                </p>
              </div>

              {/* Toggles */}
              <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span className="text-slate-200 font-medium">Require Step-Free / No Stairs</span>
                  <input
                    type="checkbox"
                    checked={preferences.avoidStairs}
                    onChange={(e) =>
                      setPreferences({ ...preferences, avoidStairs: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span className="text-slate-200 font-medium">Require Wheelchair Ramps & Curb Cuts</span>
                  <input
                    type="checkbox"
                    checked={preferences.preferRamps}
                    onChange={(e) =>
                      setPreferences({ ...preferences, preferRamps: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span className="text-slate-200 font-medium">Prefer Smooth, Stable Surfaces</span>
                  <input
                    type="checkbox"
                    checked={preferences.preferStableSurfaces}
                    onChange={(e) =>
                      setPreferences({ ...preferences, preferStableSurfaces: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span className="text-slate-200 font-medium">Prioritize Accessible Crossings & Entrances</span>
                  <input
                    type="checkbox"
                    checked={preferences.preferAccessibleEntrances}
                    onChange={(e) =>
                      setPreferences({ ...preferences, preferAccessibleEntrances: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900"
                  />
                </label>
              </div>

              {/* Location Quick Pick */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Location / City
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g. Chennai Central, TN"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold shrink-0 transition"
                    title="Detect GPS"
                  >
                    <Locate className={`w-3.5 h-3.5 text-blue-400 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Locating...' : 'GPS'}</span>
                  </button>
                </div>

                {/* Popular City Presets */}
                <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                  <span className="text-slate-400 shrink-0">Quick Pick:</span>
                  {POPULAR_LOCATION_PRESETS.slice(0, 4).map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setLocationName(preset.name);
                        setLocationCoords(preset.coords);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white shrink-0 text-[11px]"
                    >
                      📍 {preset.name.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setOnboardingStep(1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleCompleteSetup}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Save Profile & Start Navigation</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
