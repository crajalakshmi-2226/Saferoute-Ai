import React, { useState, useEffect } from 'react';
import {
  NavigationMode,
  MobilityProfile,
  MobilityPreferences,
  Coordinates,
  RouteAlternative,
  BarrierReport,
  SavedPlace,
  JourneyHistoryItem,
} from './types';
import { MOBILITY_PROFILES } from './data/mobilityProfiles';
import { useTheme } from './hooks/useTheme';
import { requestCurrentPosition } from './services/locationService';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { TokenSetupModal } from './components/TokenSetupModal';
import { WelcomeOnboardingModal } from './components/screens/WelcomeOnboardingModal';
import { HomeScreen } from './components/screens/HomeScreen';
import { SearchRouteScreen } from './components/screens/SearchRouteScreen';
import { RouteDetailsScreen } from './components/screens/RouteDetailsScreen';
import { LiveNavigationScreen } from './components/screens/LiveNavigationScreen';
import { MobilityProfileScreen } from './components/screens/MobilityProfileScreen';
import { BarrierIntelligenceScreen } from './components/screens/BarrierIntelligenceScreen';
import { AIVisionScreen } from './components/screens/AIVisionScreen';
import { AccessibilityHeatmapScreen } from './components/screens/AccessibilityHeatmapScreen';
import { PlaceIntelligenceScreen } from './components/screens/PlaceIntelligenceScreen';
import { MultiProfileSimulationScreen } from './components/screens/MultiProfileSimulationScreen';
import { JourneySummaryScreen } from './components/screens/JourneySummaryScreen';
import { SavedPlacesScreen } from './components/screens/SavedPlacesScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { Shield, Sparkles, Navigation, CheckCircle2 } from 'lucide-react';

export default function App() {
  const { theme, setTheme } = useTheme();

  // Screen router state
  const [activeScreen, setActiveScreen] = useState<string>('home');
  const [showSplash, setShowSplash] = useState(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  // Navigation mode & profile
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('accessibility');
  const [activeProfile, setActiveProfile] = useState<MobilityProfile>(() => {
    const saved = localStorage.getItem('saferoute_active_profile');
    if (saved) {
      const found = MOBILITY_PROFILES.find((p) => p.id === saved);
      if (found) return found;
    }
    return MOBILITY_PROFILES[0]; // Wheelchair default
  });

  const [activePreferences, setActivePreferences] = useState<MobilityPreferences>(() => {
    const saved = localStorage.getItem('saferoute_preferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return activeProfile.defaultPreferences;
  });

  // Geolocation state
  const [currentLocation, setCurrentLocation] = useState<Coordinates | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Barriers state
  const [knownBarriers, setKnownBarriers] = useState<BarrierReport[]>([]);

  // Saved places & Recent journeys
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(() => {
    const saved = localStorage.getItem('saferoute_saved_places');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'sp-1',
        name: 'Metro Civic Center Concourse',
        address: '100 Larkin Street, San Francisco',
        icon: 'transit',
        coordinates: { lat: 37.779, lng: -122.416 },
      },
      {
        id: 'sp-2',
        name: 'Physical Therapy & Wellness Center',
        address: '450 Sutter St, Suite 800',
        icon: 'clinic',
        coordinates: { lat: 37.789, lng: -122.407 },
      },
      {
        id: 'sp-3',
        name: 'Central Heritage Library',
        address: '100 Larkin St, Main Level',
        icon: 'bookmark',
        coordinates: { lat: 37.7792, lng: -122.4165 },
      },
    ];
  });

  const [recentJourneys, setRecentJourneys] = useState<JourneyHistoryItem[]>(() => {
    const saved = localStorage.getItem('saferoute_recent_journeys');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'j-1',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        originName: 'Market & 8th St',
        destinationName: 'Civic Center Plaza',
        distanceMeters: 650,
        durationMinutes: 9,
        mobilityProfileUsed: 'wheelchair',
        suitabilityScore: 92,
        barriersEncounteredCount: 1,
      },
    ];
  });

  // Selected route for details or live navigation
  const [selectedRouteDetails, setSelectedRouteDetails] = useState<RouteAlternative | null>(null);
  const [navSession, setNavSession] = useState<{
    route: RouteAlternative;
    allRoutes: RouteAlternative[];
    origin: Coordinates;
    destination: Coordinates;
    destName: string;
  } | null>(null);

  const [completedJourneyData, setCompletedJourneyData] = useState<{
    route: RouteAlternative;
    barriersAvoided: number;
  } | null>(null);

  const [targetDestinationPlace, setTargetDestinationPlace] = useState<SavedPlace | undefined>(undefined);

  // Splash screen timeout & first-visit onboarding check
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      const seenOnboarding = localStorage.getItem('saferoute_onboarding_seen');
      if (!seenOnboarding) {
        setIsOnboardingOpen(true);
      }
    }, 900);

    return () => clearTimeout(splashTimer);
  }, []);

  // Fetch verified barriers from full-stack API
  useEffect(() => {
    async function loadBarriers() {
      try {
        const res = await fetch('/api/barriers');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.barriers)) {
            setKnownBarriers(data.barriers);
          }
        }
      } catch (err) {
        console.warn('Could not load community barriers:', err);
      }
    }
    loadBarriers();
  }, []);

  // Handle GPS Current Location Request
  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const result = await requestCurrentPosition();
      if (result.status === 'success' && result.coordinates) {
        setCurrentLocation(result.coordinates);
      } else {
        setLocationError(result.errorMessage || 'Unable to retrieve location.');
      }
    } catch (err: any) {
      setLocationError(err.message || 'Geolocation failed.');
    } finally {
      setIsLocating(false);
    }
  };

  // Profile and Preferences Save
  const handleSaveProfileAndPreferences = (profile: MobilityProfile, prefs: MobilityPreferences) => {
    setActiveProfile(profile);
    setActivePreferences(prefs);
    localStorage.setItem('saferoute_active_profile', profile.id);
    localStorage.setItem('saferoute_preferences', JSON.stringify(prefs));
    setActiveScreen('home');
  };

  // Add new barrier report
  const handleAddBarrier = async (newBarrier: Partial<BarrierReport>) => {
    try {
      const res = await fetch('/api/barriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBarrier),
      });
      if (res.ok) {
        const data = await res.json();
        setKnownBarriers((prev) => [data.barrier, ...prev]);
      }
    } catch (err) {
      console.error('Failed to report barrier:', err);
    }
  };

  // Confirm existing barrier
  const handleConfirmBarrier = async (barrierId: string) => {
    try {
      const res = await fetch(`/api/barriers/${barrierId}/confirm`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setKnownBarriers((prev) =>
          prev.map((b) => (b.id === barrierId ? data.barrier : b))
        );
      }
    } catch (err) {
      console.error('Failed to confirm barrier:', err);
    }
  };

  // Saved places management
  const handleAddSavedPlace = (place: Omit<SavedPlace, 'id'>) => {
    const newPlace: SavedPlace = {
      ...place,
      id: `sp-${Date.now()}`,
    };
    const updated = [newPlace, ...savedPlaces];
    setSavedPlaces(updated);
    localStorage.setItem('saferoute_saved_places', JSON.stringify(updated));
  };

  const handleDeleteSavedPlace = (id: string) => {
    const updated = savedPlaces.filter((p) => p.id !== id);
    setSavedPlaces(updated);
    localStorage.setItem('saferoute_saved_places', JSON.stringify(updated));
  };

  // Route to saved place shortcut
  const handleRouteToSavedPlace = (place: SavedPlace) => {
    setTargetDestinationPlace(place);
    setActiveScreen('search');
  };

  // Complete journey handler
  const handleCompleteJourney = (route: RouteAlternative, barriersAvoided: number) => {
    setCompletedJourneyData({ route, barriersAvoided });
    // Add to journey log
    const newHistoryItem: JourneyHistoryItem = {
      id: `jh-${Date.now()}`,
      timestamp: new Date().toISOString(),
      originName: 'Starting Point',
      destinationName: navSession?.destName || 'Destination',
      distanceMeters: route.distanceMeters,
      durationMinutes: route.durationMinutes,
      mobilityProfileUsed: activeProfile.id,
      suitabilityScore: route.overallSuitabilityScore,
      barriersEncounteredCount: barriersAvoided,
    };
    const updatedHistory = [newHistoryItem, ...recentJourneys.slice(0, 19)];
    setRecentJourneys(updatedHistory);
    localStorage.setItem('saferoute_recent_journeys', JSON.stringify(updatedHistory));
    setNavSession(null);
    setActiveScreen('journey_summary');
  };

  // Screen 1: Splash Screen
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white p-6 selection:bg-blue-600">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-2xl shadow-blue-500/20 mb-6 animate-pulse">
          <Shield className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">
          SafeRoute<span className="text-blue-400"> AI</span>
        </h1>
        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Routes that understand you
        </p>
        <div className="mt-8 flex items-center gap-2 text-xs text-slate-500 font-mono">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
          <span>Initializing accessibility intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        navigationMode={navigationMode}
        onToggleNavigationMode={setNavigationMode}
        activeProfile={activeProfile}
        theme={theme}
        onSetTheme={setTheme}
        onOpenSettings={() => setActiveScreen('settings')}
        onOpenProfiles={() => setActiveScreen('profiles')}
        onGoHome={() => setActiveScreen('home')}
        activeScreen={activeScreen}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-5 sm:px-6">
        {activeScreen === 'home' && (
          <HomeScreen
            navigationMode={navigationMode}
            onSetNavigationMode={setNavigationMode}
            activeProfile={activeProfile}
            onSelectProfile={(p) => {
              setActiveProfile(p);
              setActivePreferences(p.defaultPreferences);
            }}
            currentLocation={currentLocation}
            onUseCurrentLocation={handleUseCurrentLocation}
            isLocating={isLocating}
            onNavigateToScreen={setActiveScreen}
            savedPlaces={savedPlaces}
            recentJourneys={recentJourneys}
            onSelectSavedPlace={handleRouteToSavedPlace}
          />
        )}

        {activeScreen === 'search' && (
          <SearchRouteScreen
            currentLocation={currentLocation}
            onUseCurrentLocation={handleUseCurrentLocation}
            isLocating={isLocating}
            activeProfile={activeProfile}
            activePreferences={activePreferences}
            knownBarriers={knownBarriers}
            onOpenTokenSetup={() => setIsTokenModalOpen(true)}
            onSelectRouteForNav={(route, allRoutes, origin, destination, destName) => {
              setNavSession({ route, allRoutes, origin, destination, destName });
              setActiveScreen('live_nav');
            }}
            onOpenRouteDetails={(route) => {
              setSelectedRouteDetails(route);
              setActiveScreen('route_details');
            }}
            savedPlaces={savedPlaces}
            initialDestination={targetDestinationPlace}
          />
        )}

        {activeScreen === 'route_details' && selectedRouteDetails && (
          <RouteDetailsScreen
            route={selectedRouteDetails}
            onBack={() => setActiveScreen('search')}
            onStartNavigation={(route) => {
              if (currentLocation) {
                setNavSession({
                  route,
                  allRoutes: [route],
                  origin: currentLocation,
                  destination: {
                    lat: route.geometry.coordinates[route.geometry.coordinates.length - 1][1],
                    lng: route.geometry.coordinates[route.geometry.coordinates.length - 1][0],
                  },
                  destName: 'Destination',
                });
                setActiveScreen('live_nav');
              } else {
                setActiveScreen('search');
              }
            }}
            activeProfile={activeProfile}
            activePreferences={activePreferences}
            knownBarriers={knownBarriers}
          />
        )}

        {activeScreen === 'live_nav' && navSession && (
          <LiveNavigationScreen
            route={navSession.route}
            allRoutes={navSession.allRoutes}
            originCoordinates={navSession.origin}
            destinationCoordinates={navSession.destination}
            destinationName={navSession.destName}
            onExitNavigation={() => {
              setNavSession(null);
              setActiveScreen('home');
            }}
            onCompleteJourney={handleCompleteJourney}
            onOpenTokenSetup={() => setIsTokenModalOpen(true)}
            knownBarriers={knownBarriers}
          />
        )}

        {activeScreen === 'profiles' && (
          <MobilityProfileScreen
            activeProfile={activeProfile}
            activePreferences={activePreferences}
            onSaveProfileAndPreferences={handleSaveProfileAndPreferences}
            onCancel={() => setActiveScreen('home')}
          />
        )}

        {activeScreen === 'barriers' && (
          <BarrierIntelligenceScreen
            barriers={knownBarriers}
            onAddBarrier={handleAddBarrier}
            onConfirmBarrier={handleConfirmBarrier}
            currentLocation={currentLocation}
          />
        )}

        {activeScreen === 'vision' && <AIVisionScreen />}

        {activeScreen === 'heatmap' && (
          <AccessibilityHeatmapScreen
            barriers={knownBarriers}
            onOpenMap={() => setActiveScreen('search')}
          />
        )}

        {activeScreen === 'places' && (
          <PlaceIntelligenceScreen
            onRouteToPlace={(place) => {
              handleRouteToSavedPlace({
                id: place.id,
                name: place.name,
                address: place.address,
                icon: 'transit',
                coordinates: { lat: place.lat, lng: place.lng },
              });
            }}
          />
        )}

        {activeScreen === 'simulation' && (
          <MultiProfileSimulationScreen
            sampleRoute={selectedRouteDetails || undefined}
            knownBarriers={knownBarriers}
            onOpenPlanner={() => setActiveScreen('search')}
          />
        )}

        {activeScreen === 'journey_summary' && completedJourneyData && (
          <JourneySummaryScreen
            completedRoute={completedJourneyData.route}
            barriersAvoidedCount={completedJourneyData.barriersAvoided}
            activeProfile={activeProfile}
            onFinish={() => setActiveScreen('home')}
            onReportBarrierTrigger={() => setActiveScreen('barriers')}
          />
        )}

        {activeScreen === 'saved' && (
          <SavedPlacesScreen
            savedPlaces={savedPlaces}
            recentJourneys={recentJourneys}
            onSelectPlaceToRoute={handleRouteToSavedPlace}
            onAddSavedPlace={handleAddSavedPlace}
            onDeleteSavedPlace={handleDeleteSavedPlace}
            currentLocation={currentLocation}
          />
        )}

        {activeScreen === 'settings' && (
          <SettingsScreen
            theme={theme}
            onSetTheme={setTheme}
            onOpenTokenModal={() => setIsTokenModalOpen(true)}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      {activeScreen !== 'live_nav' && (
        <BottomNav
          activeScreen={activeScreen}
          onSelectScreen={(s) => setActiveScreen(s)}
        />
      )}

      {/* Mapbox Token Setup Modal */}
      <TokenSetupModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onTokenSaved={() => {
          // Trigger re-render
        }}
      />

      {/* Welcome & Onboarding Modal */}
      <WelcomeOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}
