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
  ScoringWeights,
} from './types';
import { MOBILITY_PROFILES } from './data/mobilityProfiles';
import { useTheme } from './hooks/useTheme';
import { requestCurrentPosition } from './services/locationService';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { TokenSetupModal } from './components/TokenSetupModal';
import { WelcomeOnboardingModal } from './components/screens/WelcomeOnboardingModal';
import { AuthAndOnboardingScreen } from './components/screens/AuthAndOnboardingScreen';
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
import { PipelineScreen } from './components/screens/PipelineScreen';
import { ImpactAndRoadmapScreen } from './components/screens/ImpactAndRoadmapScreen';
import { LegalAssistantScreen } from './components/screens/LegalAssistantScreen';
import { IncidentReportScreen } from './components/screens/IncidentReportScreen';
import { ComplaintDraftModal } from './components/screens/ComplaintDraftModal';
import { NearbyHelpScreen } from './components/screens/NearbyHelpScreen';
import { EmergencyAssistanceScreen } from './components/screens/EmergencyAssistanceScreen';
import { MyReportsScreen } from './components/screens/MyReportsScreen';
import { DEFAULT_SCORING_WEIGHTS } from './services/scoringService';
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
  const [showSplash, setShowSplash] = useState(true);
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

  // Geolocation state
  const [currentLocation, setCurrentLocation] = useState<Coordinates | undefined>(undefined);
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

  // Splash screen timeout
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 850);

    return () => clearTimeout(splashTimer);
  }, []);

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
        // Not signed in: if not marked guest, show Welcome & Auth screen
        const guestFlag = safeStorage.getItem('saferoute_is_guest');
        if (!guestFlag) {
          setIsAuthOpen(true);
          setAuthInitialMode('auth');
        }
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
    setIsAuthOpen(true);
    setAuthInitialMode('auth');
    setActiveScreen('home');
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
          />
        )}
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
