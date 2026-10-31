import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  NavigationMode,
  MobilityProfile,
  MobilityPreferences,
  Coordinates,
  RouteAlternative,
  BarrierReport,
  SavedPlace,
  JourneyHistoryItem,
  ScoringWeights,
} from './types';
import { MOBILITY_PROFILES } from './data/mobilityProfiles';
import { useTheme } from './hooks/useTheme';
import { requestCurrentPosition, getLastKnownLocation } from './services/locationService';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { TokenSetupModal } from './components/TokenSetupModal';
import { WelcomeOnboardingModal } from './components/screens/WelcomeOnboardingModal';
import { AuthAndOnboardingScreen } from './components/screens/AuthAndOnboardingScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { DEFAULT_SCORING_WEIGHTS } from './services/scoringService';
import { Loader2 } from 'lucide-react';

// Code-split heavy screens so initial load is under 200ms
const SearchRouteScreen = lazy(() =>
  import('./components/screens/SearchRouteScreen').then((m) => ({ default: m.SearchRouteScreen }))
);
const RouteDetailsScreen = lazy(() =>
  import('./components/screens/RouteDetailsScreen').then((m) => ({ default: m.RouteDetailsScreen }))
);
const LiveNavigationScreen = lazy(() =>
  import('./components/screens/LiveNavigationScreen').then((m) => ({ default: m.LiveNavigationScreen }))
);
const MobilityProfileScreen = lazy(() =>
  import('./components/screens/MobilityProfileScreen').then((m) => ({ default: m.MobilityProfileScreen }))
);
const BarrierIntelligenceScreen = lazy(() =>
  import('./components/screens/BarrierIntelligenceScreen').then((m) => ({ default: m.BarrierIntelligenceScreen }))
);
const AIVisionScreen = lazy(() =>
  import('./components/screens/AIVisionScreen').then((m) => ({ default: m.AIVisionScreen }))
);
const AccessibilityHeatmapScreen = lazy(() =>
  import('./components/screens/AccessibilityHeatmapScreen').then((m) => ({ default: m.AccessibilityHeatmapScreen }))
);
const PlaceIntelligenceScreen = lazy(() =>
  import('./components/screens/PlaceIntelligenceScreen').then((m) => ({ default: m.PlaceIntelligenceScreen }))
);
const MultiProfileSimulationScreen = lazy(() =>
  import('./components/screens/MultiProfileSimulationScreen').then((m) => ({ default: m.MultiProfileSimulationScreen }))
);
const JourneySummaryScreen = lazy(() =>
  import('./components/screens/JourneySummaryScreen').then((m) => ({ default: m.JourneySummaryScreen }))
);
const SavedPlacesScreen = lazy(() =>
  import('./components/screens/SavedPlacesScreen').then((m) => ({ default: m.SavedPlacesScreen }))
);
const SettingsScreen = lazy(() =>
  import('./components/screens/SettingsScreen').then((m) => ({ default: m.SettingsScreen }))
);
const PipelineScreen = lazy(() =>
  import('./components/screens/PipelineScreen').then((m) => ({ default: m.PipelineScreen }))
);
const ImpactAndRoadmapScreen = lazy(() =>
  import('./components/screens/ImpactAndRoadmapScreen').then((m) => ({ default: m.ImpactAndRoadmapScreen }))
);
const LegalAssistantScreen = lazy(() =>
  import('./components/screens/LegalAssistantScreen').then((m) => ({ default: m.LegalAssistantScreen }))
);
const IncidentReportScreen = lazy(() =>
  import('./components/screens/IncidentReportScreen').then((m) => ({ default: m.IncidentReportScreen }))
);
const ComplaintDraftModal = lazy(() =>
  import('./components/screens/ComplaintDraftModal').then((m) => ({ default: m.ComplaintDraftModal }))
);
const NearbyHelpScreen = lazy(() =>
  import('./components/screens/NearbyHelpScreen').then((m) => ({ default: m.NearbyHelpScreen }))
);
const EmergencyAssistanceScreen = lazy(() =>
  import('./components/screens/EmergencyAssistanceScreen').then((m) => ({ default: m.EmergencyAssistanceScreen }))
);
const MyReportsScreen = lazy(() =>
  import('./components/screens/MyReportsScreen').then((m) => ({ default: m.MyReportsScreen }))
);
import {
  auth,
  onAuthStateChanged,
  getUserProfile,
  logoutUser,
  UserProfileData,
  IncidentReportData,
} from './services/firebase';
import { safeStorage } from './utils/storage';
import { Language } from './utils/translations';
import { Shield } from 'lucide-react';

export default function App() {
  const { theme, setTheme } = useTheme();

  // Screen router state
  const [activeScreen, setActiveScreen] = useState<string>('home');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  // User Authentication & Profile state
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return safeStorage.getItem('saferoute_is_guest') === 'true';
  });
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'auth' | 'onboarding'>('auth');

  // Bilingual Language State ('en' | 'ta')
  const [language, setLanguage] = useState<Language>(() => {
    const saved = safeStorage.getItem('saferoute_language');
    return saved === 'ta' ? 'ta' : 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    safeStorage.setItem('saferoute_language', lang);
  };

  // Legal Complaint Draft Modal State
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [activeDraftData, setActiveDraftData] = useState<any>(null);
  const [activeReportData, setActiveReportData] = useState<IncidentReportData | null>(null);

  // Pre-filled incident context from legal chat to reporting form
  const [prefilledReportText, setPrefilledReportText] = useState('');
  const [prefilledReportCategory, setPrefilledReportCategory] = useState('');

  // Configurable multi-factor scoring weights
  const [scoringWeights, setScoringWeights] = useState<ScoringWeights>(() => {
    const saved = safeStorage.getItem('saferoute_scoring_weights');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_SCORING_WEIGHTS;
  });

  const handleUpdateScoringWeights = (weights: ScoringWeights) => {
    setScoringWeights(weights);
    safeStorage.setItem('saferoute_scoring_weights', JSON.stringify(weights));
  };

  // Navigation mode & profile
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('accessibility');
  const [activeProfile, setActiveProfile] = useState<MobilityProfile>(() => {
    const saved = safeStorage.getItem('saferoute_active_profile');
    if (saved) {
      const found = MOBILITY_PROFILES.find((p) => p.id === saved);
      if (found) return found;
    }
    return MOBILITY_PROFILES[0]; // Wheelchair default
  });

  const [activePreferences, setActivePreferences] = useState<MobilityPreferences>(() => {
    const saved = safeStorage.getItem('saferoute_preferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return activeProfile.defaultPreferences;
  });

  // Geolocation state (pre-initialized with last known location for zero-latency start)
  const [currentLocation, setCurrentLocation] = useState<Coordinates | undefined>(() => {
    return getLastKnownLocation() || undefined;
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Barriers state
  const [knownBarriers, setKnownBarriers] = useState<BarrierReport[]>([]);

  // Saved places & Recent journeys
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(() => {
    const saved = safeStorage.getItem('saferoute_saved_places');
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
    const saved = safeStorage.getItem('saferoute_recent_journeys');
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

  // Firebase auth state listener on app launch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile) {
            setUserProfile(profile);
            setIsGuest(false);
            safeStorage.removeItem('saferoute_is_guest');
            if (profile.mobilityProfile) {
              const matched = MOBILITY_PROFILES.find((p) => p.id === profile.mobilityProfile);
              if (matched) {
                setActiveProfile(matched);
              }
            }
            if (profile.mobilityPreferences) {
              setActivePreferences(profile.mobilityPreferences as MobilityPreferences);
            }
          } else {
            // Logged in but profile record incomplete: open onboarding
            setIsAuthOpen(true);
            setAuthInitialMode('onboarding');
          }
        } catch (err) {
          console.warn('Profile fetch notice:', err);
        }
      } else {
        // App is fully accessible with zero login barriers
        setIsGuest(false);
      }
    });

    return () => unsubscribe();
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

  // Handle GPS Current Location Request with INSTANT response
  const handleUseCurrentLocation = async (): Promise<Coordinates | undefined> => {
    // 1. Immediately provide cached location if available
    const cached = getLastKnownLocation();
    if (cached) {
      setCurrentLocation(cached);
    }

    setIsLocating(true);
    setLocationError(null);
    try {
      const result = await requestCurrentPosition({
        onImmediateLocation: (c) => {
          setCurrentLocation(c);
        },
      });

      if (result.coordinates) {
        setCurrentLocation(result.coordinates);
        if (result.errorMessage && result.source !== 'gps') {
          setLocationError(result.errorMessage);
        }
        return result.coordinates;
      } else if (cached) {
        return cached;
      } else {
        setLocationError(result.errorMessage || 'Unable to retrieve location.');
      }
    } catch (err: any) {
      if (cached) return cached;
      setLocationError(err.message || 'Geolocation failed.');
    } finally {
      setIsLocating(false);
    }
    return cached || undefined;
  };

  // Profile and Preferences Save
  const handleSaveProfileAndPreferences = (profile: MobilityProfile, prefs: MobilityPreferences) => {
    setActiveProfile(profile);
    setActivePreferences(prefs);
    safeStorage.setItem('saferoute_active_profile', profile.id);
    safeStorage.setItem('saferoute_preferences', JSON.stringify(prefs));
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
    safeStorage.setItem('saferoute_saved_places', JSON.stringify(updated));
  };

  const handleDeleteSavedPlace = (id: string) => {
    const updated = savedPlaces.filter((p) => p.id !== id);
    setSavedPlaces(updated);
    safeStorage.setItem('saferoute_saved_places', JSON.stringify(updated));
  };

  // Route to saved place shortcut
  const handleRouteToSavedPlace = (place: SavedPlace) => {
    setTargetDestinationPlace(place);
    setActiveScreen('search');
  };

  // Complete journey handler
  const handleCompleteJourney = (route: RouteAlternative, barriersAvoided: number) => {
    setCompletedJourneyData({ route, barriersAvoided });
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
    safeStorage.setItem('saferoute_recent_journeys', JSON.stringify(updatedHistory));
    setNavSession(null);
    setActiveScreen('journey_summary');
  };

  // Auth flow callbacks
  const handleAuthSuccess = (profile: UserProfileData) => {
    setUserProfile(profile);
    setIsGuest(false);
    safeStorage.removeItem('saferoute_is_guest');
    if (profile.mobilityProfile) {
      const matched = MOBILITY_PROFILES.find((p) => p.id === profile.mobilityProfile);
      if (matched) {
        setActiveProfile(matched);
      }
    }
    if (profile.mobilityPreferences) {
      setActivePreferences(profile.mobilityPreferences as MobilityPreferences);
    }
    setIsAuthOpen(false);
  };

  const handleContinueAsGuest = () => {
    setIsGuest(true);
    safeStorage.setItem('saferoute_is_guest', 'true');
    setIsAuthOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
    setUserProfile(null);
    setIsGuest(false);
    safeStorage.removeItem('saferoute_is_guest');
    safeStorage.removeItem('saferoute_demo_profile');
    setIsAuthOpen(true);
    setAuthInitialMode('auth');
    setActiveScreen('home');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-150">
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
        userProfile={userProfile}
        isGuest={isGuest}
        onOpenAuth={() => {
          setAuthInitialMode('auth');
          setIsAuthOpen(true);
        }}
        language={language}
        onToggleLanguage={handleSetLanguage}
        onOpenEmergency={() => setActiveScreen('emergency')}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-5 sm:px-6">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-xs font-medium">Loading safe route intelligence...</span>
            </div>
          }
        >
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
            language={language}
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
            scoringWeights={scoringWeights}
            language={language}
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
            scoringWeights={scoringWeights}
            language={language}
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

        {activeScreen === 'pipeline' && (
          <PipelineScreen onGoToPlanner={() => setActiveScreen('search')} />
        )}

        {activeScreen === 'impact' && (
          <ImpactAndRoadmapScreen />
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

        {/* Rights, Safety & Legal Help Screens */}
        {activeScreen === 'legal_assist' && (
          <LegalAssistantScreen
            language={language}
            onOpenReportWithIncident={(text, cat) => {
              setPrefilledReportText(text);
              setPrefilledReportCategory(cat || '');
              setActiveScreen('report_incident');
            }}
            onOpenNearbyHelp={(helpType) => {
              setActiveScreen('nearby_help');
            }}
          />
        )}

        {activeScreen === 'report_incident' && (
          <IncidentReportScreen
            language={language}
            userProfile={userProfile}
            isGuest={isGuest}
            initialDescription={prefilledReportText}
            initialCategory={prefilledReportCategory}
            onOpenDraftModal={(draft, report) => {
              setActiveDraftData(draft);
              setActiveReportData(report);
              setIsDraftModalOpen(true);
            }}
            onGoToMyReports={() => setActiveScreen('my_reports')}
          />
        )}

        {activeScreen === 'nearby_help' && (
          <NearbyHelpScreen
            language={language}
            currentLocation={currentLocation}
            onUseCurrentLocation={handleUseCurrentLocation}
            isLocating={isLocating}
            onPlanRouteToDestination={(destCoords, destName) => {
              handleRouteToSavedPlace({
                id: `help-dst-${Date.now()}`,
                name: destName,
                address: destName,
                icon: 'transit',
                coordinates: destCoords,
              });
            }}
          />
        )}

        {activeScreen === 'emergency' && (
          <EmergencyAssistanceScreen
            language={language}
            onNavigateToScreen={setActiveScreen}
          />
        )}

        {activeScreen === 'my_reports' && (
          <MyReportsScreen
            language={language}
            userProfile={userProfile}
            isGuest={isGuest}
            onOpenReportForm={() => {
              setPrefilledReportText('');
              setPrefilledReportCategory('');
              setActiveScreen('report_incident');
            }}
            onViewDraft={(report) => {
              setActiveReportData(report);
              setActiveDraftData({
                subject: `${report.category} - ${report.location || 'Reported Incident'}`,
                addressedTo: report.receivingAuthority || 'Concerned Station House Officer',
                addressedToTamil: 'காவல் நிலைய பொறுப்பு அதிகாரி',
                fullFormattedDraft: report.complaintDraft || report.description,
                fullFormattedDraftTamil: report.complaintDraft || report.description,
                officialPortalUrl: report.officialPortalUrl || 'https://eservices.tnpolice.gov.in/',
                applicableLegalProvisions: ['Verified Statutory Provisions under Indian Law'],
              });
              setIsDraftModalOpen(true);
            }}
            onOpenAuth={() => {
              setAuthInitialMode('auth');
              setIsAuthOpen(true);
            }}
          />
        )}

        {activeScreen === 'settings' && (
          <SettingsScreen
            theme={theme}
            onSetTheme={setTheme}
            onOpenTokenModal={() => setIsTokenModalOpen(true)}
            scoringWeights={scoringWeights}
            onUpdateScoringWeights={handleUpdateScoringWeights}
            onNavigateToScreen={setActiveScreen}
            userProfile={userProfile}
            isGuest={isGuest}
            onOpenAuth={() => {
              setAuthInitialMode('auth');
              setIsAuthOpen(true);
            }}
            onSignOut={handleSignOut}
            onOpenOnboarding={() => {
              setAuthInitialMode('onboarding');
              setIsAuthOpen(true);
            }}
            currentLocation={currentLocation}
            onUseCurrentLocation={handleUseCurrentLocation}
            isLocating={isLocating}
          />
        )}
        </Suspense>
      </main>

      {/* Bottom Navigation */}
      {activeScreen !== 'live_nav' && (
        <BottomNav
          activeScreen={activeScreen}
          onSelectScreen={(s) => setActiveScreen(s)}
          language={language}
        />
      )}

      {/* Mapbox Token Setup Modal */}
      <TokenSetupModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onTokenSaved={() => {
          // Re-render
        }}
      />

      {/* Welcome & Info Modal */}
      <WelcomeOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* AI-Assisted Complaint Draft Modal */}
      {activeDraftData && activeReportData && (
        <ComplaintDraftModal
          isOpen={isDraftModalOpen}
          onClose={() => setIsDraftModalOpen(false)}
          draftData={activeDraftData}
          reportData={activeReportData}
          language={language}
          onReportUpdated={(updated) => {
            setActiveReportData(updated);
          }}
        />
      )}

      {/* Full Modern Welcome & Authentication and Onboarding Flow */}
      {isAuthOpen && (
        <AuthAndOnboardingScreen
          initialMode={authInitialMode}
          onAuthSuccess={handleAuthSuccess}
          onContinueAsGuest={handleContinueAsGuest}
          onClose={userProfile || isGuest ? () => setIsAuthOpen(false) : undefined}
        />
      )}
    </div>
  );
}
