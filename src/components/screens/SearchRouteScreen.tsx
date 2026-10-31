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
  Footprints,
  Database,
  Wifi,
  WifiOff,
  HardDrive,
  Trash2,
  Zap,
} from 'lucide-react';
import {
  cacheRouteSummary,
  findCachedRoute,
  getRecentRouteSummaries,
  getRecentlyVisitedAreas,
  recordVisitedArea,
  deleteCachedRoute,
} from '../../services/indexedDbCache';
import { CachedRouteSummary, CachedVisitedArea } from '../../types';
import { getLastKnownLocation } from '../../services/locationService';
import { calculateMultiModalComparison } from '../../services/multiModalService';
import { MultiModalComparisonCard } from '../MultiModalComparisonCard';
import { Language } from '../../utils/translations';

interface Props {
  currentLocation?: Coordinates;
  onUseCurrentLocation: () => Promise<Coordinates | undefined>;
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
  language?: Language;
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
  language = 'en',
}) => {
  // Instant Origin Location check (0ms response)
  const initialLoc = currentLocation || getLastKnownLocation() || undefined;

  // Origin State
  const [originMode, setOriginMode] = useState<'current_location' | 'manual'>(
    initialLoc ? 'current_location' : 'manual'
  );
  const [originQuery, setOriginQuery] = useState(initialLoc ? 'My Current Location' : '');
  const [originCoords, setOriginCoords] = useState<Coordinates | undefined>(initialLoc);
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

  // Multi-Modal Comparison across Car, Bike, Bus, Walk, Train + Delay Breakdown
  const multiModalData = React.useMemo(() => {
    if (!originCoords || !destCoords) return null;
    return calculateMultiModalComparison(
      originCoords,
      destCoords,
      originQuery || 'Origin Location',
      destQuery || 'Destination Location',
      routes[selectedRouteIndex]
    );
  }, [originCoords, destCoords, originQuery, destQuery, routes, selectedRouteIndex]);

  // IndexedDB offline resilience states
  const [recentCachedRoutes, setRecentCachedRoutes] = useState<CachedRouteSummary[]>([]);
  const [visitedAreas, setVisitedAreas] = useState<CachedVisitedArea[]>([]);
  const [isOfflineServed, setIsOfflineServed] = useState<boolean>(false);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showOfflineSection, setShowOfflineSection] = useState<boolean>(true);

  // Load IndexedDB cached routes & visited areas on mount
  const refreshCacheData = async () => {
    try {
      const [rRoutes, vAreas] = await Promise.all([
        getRecentRouteSummaries(6),
        getRecentlyVisitedAreas(6),
      ]);
      setRecentCachedRoutes(rRoutes);
      setVisitedAreas(vAreas);
    } catch (e) {
      console.warn('Error loading IndexedDB cache:', e);
    }
  };

  useEffect(() => {
    refreshCacheData();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
    setIsOfflineServed(false);
    setOfflineNotice(null);

    // 1. Fast path if device is offline: check IndexedDB
    if (!navigator.onLine) {
      try {
        const cached = await findCachedRoute(originCoords, destCoords, activeProfile.id);
        if (cached && cached.routes && cached.routes.length > 0) {
          setRoutes(cached.routes);
          setSelectedRouteIndex(0);
          setIsOfflineServed(true);
          setOfflineNotice(
            `⚡ Offline Mode: Loaded from IndexedDB storage (Recorded on ${new Date(
              cached.cachedAt
            ).toLocaleDateString()})`
          );
          setIsCalculating(false);
          return;
        }
      } catch (e) {
        console.warn('Error reading from IndexedDB:', e);
      }
    }

    // 2. Fetch walking directions online
    try {
      const rawRoutes = await fetchWalkingRoutes(
        [originCoords.lng, originCoords.lat],
        [destCoords.lng, destCoords.lat]
      );

      // Check if the response was already fulfilled by IndexedDB fallback inside mapboxService
      const isFromCache = rawRoutes.some((r: any) => r._isOfflineCached);

      // Evaluate and score all alternatives using our multi-factor scoring formula
      const scored: RouteAlternative[] = rawRoutes.map((r: any, idx: number) =>
        evaluateRoute(r, idx, activeProfile, activePreferences, knownBarriers, scoringWeights)
      );

      // Sort by suitability score descending
      scored.sort((a, b) => b.overallSuitabilityScore - a.overallSuitabilityScore);

      setRoutes(scored);
      setSelectedRouteIndex(0);

      if (isFromCache) {
        setIsOfflineServed(true);
        setOfflineNotice('⚡ Loaded from local IndexedDB cache (Low connectivity mode).');
      } else {
        // Automatically persist successfully scored routes to IndexedDB for offline access
        try {
          await cacheRouteSummary(
            originCoords,
            destCoords,
            originQuery || 'Origin Location',
            destQuery || 'Destination Location',
            scored,
            activeProfile.id
          );
          // Register both endpoints as recently visited areas in IndexedDB
          await recordVisitedArea(originQuery || 'Origin Location', originCoords, 2.0);
          await recordVisitedArea(destQuery || 'Destination Location', destCoords, 2.0);
          await refreshCacheData();
        } catch (storageErr) {
          console.warn('Could not cache route in IndexedDB:', storageErr);
        }
      }
    } catch (err: any) {
      // 3. Fallback on network failure or timeout: check IndexedDB
      try {
        const cached = await findCachedRoute(originCoords, destCoords, activeProfile.id);
        if (cached && cached.routes && cached.routes.length > 0) {
          setRoutes(cached.routes);
          setSelectedRouteIndex(0);
          setIsOfflineServed(true);
          setOfflineNotice(
            '⚡ Cellular connection weak: Seamlessly served route from IndexedDB local storage.'
          );
          return;
        }
      } catch {}

      setCalcError(err.message || 'Failed to calculate route directions.');
    } finally {
      setIsCalculating(false);
    }
  };

  // Quick select an IndexedDB cached route
  const handleSelectCachedRoute = (summary: CachedRouteSummary) => {
    setOriginCoords(summary.originCoords);
    setOriginQuery(summary.originName);
    setOriginMode('manual');
    setDestCoords(summary.destinationCoords);
    setDestQuery(summary.destinationName);
    setRoutes(summary.routes);
    setSelectedRouteIndex(0);
    setIsOfflineServed(true);
    setOfflineNotice(
      `⚡ Loaded route from IndexedDB (${new Date(summary.cachedAt).toLocaleDateString()} ${new Date(
        summary.cachedAt
      ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
    );
    setCalcError(null);
  };

  // Delete an IndexedDB cached route
  const handleDeleteCachedRoute = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteCachedRoute(id);
      await refreshCacheData();
    } catch (err) {
      console.warn('Failed to delete cached route:', err);
    }
  };

  // Quick select a visited area as origin or destination
  const handleSelectVisitedArea = (area: CachedVisitedArea, target: 'origin' | 'dest') => {
    if (target === 'origin') {
      setOriginCoords(area.center);
      setOriginQuery(area.name);
      setOriginMode('manual');
    } else {
      setDestCoords(area.center);
      setDestQuery(area.name);
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
                // Immediate 0ms assignment from memory or localStorage
                const fastLoc = currentLocation || getLastKnownLocation();
                if (fastLoc) {
                  setOriginCoords(fastLoc);
                  setOriginQuery('My Current Location');
                }
                const coords = await onUseCurrentLocation();
                if (coords) {
                  setOriginCoords(coords);
                  setOriginQuery('My Current Location');
                }
              }}
              disabled={isLocating}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border transition ${
                originMode === 'current_location' && (originCoords || currentLocation)
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Use current real device location (Instant)"
            >
              <Locate className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-cyan-400' : 'text-blue-400'}`} />
              <span className="font-bold">{isLocating ? 'Locating...' : 'My Location (GPS)'}</span>
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

        {/* Offline Notice Banner */}
        {offlineNotice && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs shadow-lg animate-fadeIn">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="flex-1 font-medium">{offlineNotice}</span>
            <span className="text-[10px] bg-cyan-900/80 px-2 py-0.5 rounded-full border border-cyan-600/50 uppercase tracking-wider font-bold">
              IndexedDB
            </span>
          </div>
        )}

        {/* Recently Visited Areas (IndexedDB) */}
        {visitedAreas.length > 0 && (
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>Recently Visited Areas (Offline Cache)</span>
              </span>
              <span className="text-[10px] text-slate-500">Tap to set as Dest</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
              {visitedAreas.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => handleSelectVisitedArea(area, 'dest')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 text-slate-200 transition shrink-0"
                >
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span className="font-medium truncate max-w-[140px]">{area.name.split(',')[0]}</span>
                  {area.hasOfflineTiles && (
                    <span className="text-[9px] bg-blue-900/60 text-blue-300 px-1 py-0.2 rounded font-mono" title="Offline tiles cached in IndexedDB">
                      Tiles
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recently Cached Routes (IndexedDB) */}
        {recentCachedRoutes.length > 0 && (
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setShowOfflineSection(!showOfflineSection)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white"
              >
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span>Offline Cached Routes ({recentCachedRoutes.length})</span>
                <span className="text-[10px] font-normal text-slate-400">
                  {showOfflineSection ? '(Hide)' : '(Show)'}
                </span>
              </button>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Zero Network Latency</span>
              </div>
            </div>

            {showOfflineSection && (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                {recentCachedRoutes.map((summary) => (
                  <div
                    key={summary.id}
                    onClick={() => handleSelectCachedRoute(summary)}
                    className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/60 transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100 truncate">
                        <span className="text-blue-400">⚡</span>
                        <span className="truncate">{summary.originName.split(',')[0]}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="text-cyan-300 truncate">{summary.destinationName.split(',')[0]}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                        <span>{summary.distanceMeters}m</span>
                        <span>·</span>
                        <span>{summary.durationMinutes} min</span>
                        <span>·</span>
                        <span className="text-emerald-400 font-semibold">{summary.suitabilityScore}% Match</span>
                        <span>·</span>
                        <span className="text-slate-500">
                          {new Date(summary.cachedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-semibold text-blue-400 group-hover:underline">
                        Load
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCachedRoute(e, summary.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                        title="Delete from local cache"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

      {/* Multi-Modal Travel Time Comparison across Car, Bike, Bus, Walk, Train + Why / Delay Breakdown */}
      {multiModalData && (
        <MultiModalComparisonCard
          data={multiModalData}
          language={language}
        />
      )}

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
