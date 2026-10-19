import React, { useState, useEffect } from 'react';
import {
  Coordinates,
  GeocodingResult,
  RouteAlternative,
  MobilityProfile,
  MobilityPreferences,
  BarrierReport,
  SavedPlace,
  ScoringWeights,
} from '../../types';
import { searchPlaces, fetchWalkingRoutes } from '../../services/mapboxService';
import { evaluateRoute, DEFAULT_SCORING_WEIGHTS } from '../../services/scoringService';
import { POPULAR_LOCATION_PRESETS } from '../../services/locationService';
import { MapboxMap } from '../MapboxMap';
import {
  Search,
  MapPin,
  Locate,
  Navigation,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Eye,
  Sliders,
  RotateCcw,
  Footprints
} from 'lucide-react';

interface Props {
  currentLocation?: Coordinates;
  onUseCurrentLocation: () => Promise<void>;
  isLocating: boolean;
  activeProfile: MobilityProfile;
  activePreferences: MobilityPreferences;
  knownBarriers: BarrierReport[];
  onOpenTokenSetup: () => void;
  onSelectRouteForNav: (route: RouteAlternative, allRoutes: RouteAlternative[], origin: Coordinates, destination: Coordinates, destName: string) => void;
  onOpenRouteDetails: (route: RouteAlternative) => void;
  savedPlaces: SavedPlace[];
  initialDestination?: SavedPlace;
  scoringWeights?: ScoringWeights;
}

export const SearchRouteScreen: React.FC<Props> = ({
  currentLocation,
  onUseCurrentLocation,
  isLocating,
  activeProfile,
  activePreferences,
  knownBarriers,
  onOpenTokenSetup,
  onSelectRouteForNav,
  onOpenRouteDetails,
  savedPlaces,
  initialDestination,
  scoringWeights = DEFAULT_SCORING_WEIGHTS,
}) => {
  // Origin State
  const [originMode, setOriginMode] = useState<'current_location' | 'manual'>(
    currentLocation ? 'current_location' : 'manual'
  );
  const [originQuery, setOriginQuery] = useState(currentLocation ? 'My Current Location' : '');
  const [originCoords, setOriginCoords] = useState<Coordinates | undefined>(currentLocation);
  const [originSuggestions, setOriginSuggestions] = useState<GeocodingResult[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);

  // Destination State
  const [destQuery, setDestQuery] = useState(initialDestination ? initialDestination.name : '');
  const [destCoords, setDestCoords] = useState<Coordinates | undefined>(
    initialDestination ? initialDestination.coordinates : undefined
  );
  const [destSuggestions, setDestSuggestions] = useState<GeocodingResult[]>([]);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  // Route calculation states
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [routes, setRoutes] = useState<RouteAlternative[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  // Update origin if currentLocation arrives and mode is current_location
  useEffect(() => {
    if (currentLocation && originMode === 'current_location') {
      setOriginCoords(currentLocation);
      setOriginQuery('My Current Location');
    }
  }, [currentLocation, originMode]);

  // Handle origin autocomplete
  useEffect(() => {
    if (originMode !== 'manual' || originQuery.length < 3) {
      setOriginSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingOrigin(true);
      try {
        const results = await searchPlaces(originQuery);
        setOriginSuggestions(results);
      } catch (err: any) {
        console.warn('Origin search error:', err);
      } finally {
        setIsSearchingOrigin(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [originQuery, originMode]);

  // Handle destination autocomplete
  useEffect(() => {
    if (destQuery.length < 3 || (destCoords && destQuery === destCoords.lat.toString())) {
      setDestSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDest(true);
      try {
        const proximity = originCoords ? [originCoords.lng, originCoords.lat] as [number, number] : undefined;
        const results = await searchPlaces(destQuery, proximity);
        setDestSuggestions(results);
      } catch (err: any) {
        console.warn('Destination search error:', err);
      } finally {
        setIsSearchingDest(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [destQuery, originCoords]);

  // Trigger calculation when both coordinates are available
  const handleCalculateRoutes = async () => {
    if (!originCoords) {
      setCalcError('Please select or enable your origin location.');
      return;
    }
    if (!destCoords) {
      setCalcError('Please select a destination from the search results.');
      return;
    }

    setIsCalculating(true);
    setCalcError(null);
    setRoutes([]);

    try {
      const rawRoutes = await fetchWalkingRoutes(
        [originCoords.lng, originCoords.lat],
        [destCoords.lng, destCoords.lat]
      );

      // Evaluate and score all alternatives using our multi-factor scoring formula
      const scored: RouteAlternative[] = rawRoutes.map((r: any, idx: number) =>
        evaluateRoute(r, idx, activeProfile, activePreferences, knownBarriers, scoringWeights)
      );

      // Sort by suitability score descending
      scored.sort((a, b) => b.overallSuitabilityScore - a.overallSuitabilityScore);

      setRoutes(scored);
      setSelectedRouteIndex(0);
    } catch (err: any) {
      setCalcError(err.message || 'Failed to calculate route directions.');
    } finally {
      setIsCalculating(false);
    }
  };

  // Auto-calculate if initialDestination was passed and origin is set
  useEffect(() => {
    if (originCoords && destCoords && routes.length === 0) {
      handleCalculateRoutes();
    }
  }, [originCoords, destCoords]);

  return (
    <div className="space-y-5 pb-20">
      {/* Search & Input Panel */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-400" />
            <span>Accessible Route Planner</span>
          </h2>
          <div className="text-[11px] text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-semibold">
            {activeProfile.name}
          </div>
        </div>

        {/* 1. Origin Input */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Origin (Starting Point)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={originQuery}
                onChange={(e) => {
                  setOriginMode('manual');
                  setOriginQuery(e.target.value);
                  setOriginCoords(undefined);
                }}
                placeholder="Enter starting address or landmark..."
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 pl-9"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            <button
              onClick={async () => {
                setOriginMode('current_location');
                await onUseCurrentLocation();
              }}
              disabled={isLocating}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border transition ${
                originMode === 'current_location' && currentLocation
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Use current real device location"
            >
              <Locate className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">GPS</span>
            </button>
          </div>

          {/* Origin Autocomplete Dropdown */}
          {originSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 space-y-1">
              {originSuggestions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setOriginQuery(s.placeName);
                    setOriginCoords({ lng: s.center[0], lat: s.center[1] });
                    setOriginSuggestions([]);
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-800 cursor-pointer transition text-xs"
                >
                  <div className="font-semibold text-white">{s.text}</div>
                  <div className="text-[11px] text-slate-400 truncate">{s.placeName}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Origin Location Pickers */}
          <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            <span className="text-slate-400 shrink-0 font-medium">Quick Pick:</span>
            {POPULAR_LOCATION_PRESETS.slice(0, 5).map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setOriginMode('manual');
                  setOriginQuery(preset.name);
                  setOriginCoords(preset.coords);
                  setOriginSuggestions([]);
                }}
                className={`px-2 py-0.5 rounded-lg border shrink-0 transition ${
                  originCoords && Math.abs(originCoords.lat - preset.coords.lat) < 0.005
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-bold'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                📍 {preset.name.split(',')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Destination Input */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Destination
          </label>
          <div className="relative">
            <input
              type="text"
              value={destQuery}
              onChange={(e) => {
                setDestQuery(e.target.value);
                setDestCoords(undefined);
              }}
              placeholder="Search destination, station or address..."
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 pl-9"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Destination Autocomplete Dropdown */}
          {destSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 space-y-1">
              {destSuggestions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setDestQuery(s.placeName);
                    setDestCoords({ lng: s.center[0], lat: s.center[1] });
                    setDestSuggestions([]);
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-800 cursor-pointer transition text-xs"
                >
                  <div className="font-semibold text-white">{s.text}</div>
                  <div className="text-[11px] text-slate-400 truncate">{s.placeName}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calculate Route CTA */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleCalculateRoutes}
            disabled={isCalculating || !originCoords || !destCoords}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 active:scale-95 py-3 text-xs font-bold text-white shadow-md transition cursor-pointer"
          >
            {isCalculating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Analyzing Pedestrian Pathways & Barriers...</span>
              </>
            ) : (
              <>
                <Footprints className="w-4 h-4" />
                <span>Calculate Accessible Routes</span>
              </>
            )}
          </button>
        </div>

        {/* Error Feedback */}
        {calcError && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{calcError}</span>
              {calcError.includes('token') && (
                <button
                  onClick={onOpenTokenSetup}
                  className="ml-2 font-bold underline hover:text-white"
                >
                  Open Setup
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Mapbox Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Interactive Corridor Preview</span>
          {knownBarriers.length > 0 && (
            <span className="flex items-center gap-1 text-amber-400 text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5" />
              {knownBarriers.length} verified physical barriers loaded
            </span>
          )}
        </div>
        <MapboxMap
          currentLocation={originCoords}
          destinationCoordinates={destCoords}
          routes={routes}
          selectedRouteIndex={selectedRouteIndex}
          onSelectRouteIndex={setSelectedRouteIndex}
          barriers={knownBarriers}
          onOpenTokenSetup={onOpenTokenSetup}
          className="h-[360px] w-full"
        />
      </div>

      {/* Route Alternatives List & Suitability Scoring */}
      {routes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              Scored Route Alternatives ({routes.length})
            </h3>
            <span className="text-[11px] text-slate-400">
              Ranked for {activeProfile.name}
            </span>
          </div>

          <div className="space-y-3">
            {routes.map((route, idx) => {
              const isSelected = idx === selectedRouteIndex;
              const isTop = idx === 0;

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRouteIndex(idx)}
                  className={`p-4 rounded-2xl border cursor-pointer transition space-y-3 ${
                    isSelected
                      ? 'bg-slate-900 border-blue-500 shadow-xl ring-1 ring-blue-500/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Bar with Scores */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{route.name}</span>
                        {isTop && (
                          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                        <span>{(route.distanceMeters / 1000).toFixed(2)} km</span>
                        <span>•</span>
                        <span>{route.durationMinutes} min walk</span>
                      </div>
                    </div>

                    {/* Suitability Score Gauge */}
                    <div className="text-right">
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className={`text-xl font-extrabold font-mono ${
                          route.overallSuitabilityScore >= 80
                            ? 'text-emerald-400'
                            : route.overallSuitabilityScore >= 60
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}>
                          {route.overallSuitabilityScore}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">/100</span>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Suitability
                      </span>
                    </div>
                  </div>

                  {/* Multi-Factor Weight Breakdown Pills */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <div className="rounded-xl bg-slate-950/70 p-2 text-center border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-medium">Access (40%)</div>
                      <div className="text-xs font-bold text-blue-400 font-mono mt-0.5">
                        {route.accessibilityScore}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-950/70 p-2 text-center border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-medium">Safety (25%)</div>
                      <div className="text-xs font-bold text-cyan-400 font-mono mt-0.5">
                        {route.safetyScore}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-950/70 p-2 text-center border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-medium">Match (25%)</div>
                      <div className="text-xs font-bold text-indigo-400 font-mono mt-0.5">
                        {route.preferenceScore}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-950/70 p-2 text-center border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-medium">Dist (10%)</div>
                      <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                        {route.distanceScore}
                      </div>
                    </div>
                  </div>

                  {/* Obstacle warnings */}
                  {route.detectedObstacles.length > 0 ? (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-300">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        Intersects {route.detectedObstacles.length} known barrier(s): {route.detectedObstacles.map((o) => o.description).join('; ')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>No active reported barriers intersecting this corridor</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRouteDetails(route);
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Analysis & Why</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (originCoords && destCoords) {
                          onSelectRouteForNav(route, routes, originCoords, destCoords, destQuery);
                        }
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md transition active:scale-95"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Start Navigation</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
