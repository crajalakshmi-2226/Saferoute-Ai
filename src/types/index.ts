export type NavigationMode = 'general' | 'accessibility';

export type MobilityProfileType =
  | 'wheelchair'
  | 'elderly'
  | 'visual_assistance'
  | 'walking_difficulty'
  | 'temporary_injury'
  | 'general_pedestrian';

export interface MobilityPreferences {
  avoidStairs: boolean;
  preferRamps: boolean;
  avoidSteepSlopes: boolean;
  preferStableSurfaces: boolean;
  preferSaferCrossings: boolean;
  avoidNarrowPassages: boolean;
  preferAccessibleEntrances: boolean;
  enableSpokenGuidance: boolean;
  maxWalkingDistanceMeters: number; // e.g. 800m
}

export interface ScoringWeights {
  accessibility: number; // default 40%
  safety: number;        // default 25%
  preference: number;    // default 25%
  distance: number;      // default 10%
}

export type DataCategory = 'verified' | 'community' | 'ai_predicted' | 'unknown';

export interface MobilityProfile {
  id: MobilityProfileType;
  name: string;
  tagline: string;
  icon: string;
  description: string;
  defaultPreferences: MobilityPreferences;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  id: string;
  placeName: string;
  text: string;
  center: [number, number]; // [lng, lat]
  address?: string;
  category?: string;
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  name: string;
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number];
  };
  accessibilityNote?: string;
  barrierRisk?: 'none' | 'low' | 'medium' | 'high';
}

export interface RouteAlternative {
  id: string;
  name: string;
  distanceMeters: number;
  durationMinutes: number;
  geometry: {
    type: 'LineString';
    coordinates: [number, number][]; // [lng, lat]
  };
  steps: RouteStep[];
  
  // Transparent multi-factor scores (0 - 100)
  overallSuitabilityScore: number;
  accessibilityScore: number; // 40% weight
  safetyScore: number;        // 25% weight
  preferenceScore: number;    // 25% weight
  distanceScore: number;      // 10% weight

  // Obstacle & safety breakdown
  detectedObstacles: {
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical' | 'impassable';
    location: [number, number];
  }[];
  positiveSignals: string[];
  rankingReasons: string[];
  dataConfidence: number; // e.g. 85%
  missingInformationNotes: string[];

  // Offline caching metadata
  isOfflineCached?: boolean;
  cachedAt?: string;
  offlineNotice?: string;
}

export interface BarrierReport {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: 'stairs' | 'steep_slope' | 'uneven_surface' | 'narrow_path' | 'construction' | 'missing_curb_cut' | 'broken_lift';
  severity: 'low' | 'medium' | 'high' | 'impassable';
  description: string;
  address?: string;
  reportedAt: string;
  verificationStatus: 'verified' | 'community_reported' | 'unverified';
  confirmations: number;
  photoUrl?: string;
}

export interface PlaceAccessibility {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  stepFreeAccess: boolean;
  rampAvailable: boolean;
  elevatorAvailable: boolean;
  accessibleRestroom: boolean;
  doorwayWidthCm: number;
  tactilePaving: boolean;
  visualGuidanceAssistance: boolean;
  brailleSignage: boolean;
  auditorySignals: boolean;
  verifiedDate: string;
  dataSource: string;
}

export interface SavedPlace {
  id: string;
  name: string;
  address: string;
  icon: 'home' | 'work' | 'clinic' | 'transit' | 'bookmark';
  coordinates: Coordinates;
}

export interface JourneyHistoryItem {
  id: string;
  timestamp: string;
  originName: string;
  destinationName: string;
  distanceMeters: number;
  durationMinutes: number;
  mobilityProfileUsed: MobilityProfileType;
  suitabilityScore: number;
  barriersEncounteredCount: number;
  feedbackGiven?: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface OfflineMapPack {
  id: string;
  cityName: string;
  countryOrState?: string;
  center: Coordinates;
  radiusKm: number;
  tileCount: number;
  sizeBytes: number;
  downloadedAt: string;
  zoomLevels: number[];
  status: 'ready' | 'downloading' | 'failed';
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

export interface DownloadProgress {
  packId: string;
  cityName: string;
  totalTiles: number;
  completedTiles: number;
  percent: number;
  currentStage: string;
  bytesDownloaded: number;
  isComplete: boolean;
  error?: string;
}

// ================= IndexedDB Local Caching Strategy Types =================

export interface CachedVisitedArea {
  id: string; // e.g. "area_chennai_central" or geo-hash
  name: string;
  center: Coordinates;
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  radiusKm: number;
  lastVisitedAt: string;
  visitCount: number;
  cachedTileCount: number;
  hasOfflineTiles: boolean;
  totalSizeEstimatedBytes: number;
}

export interface CachedRouteSummary {
  id: string; // unique hash or key
  originCoords: Coordinates;
  destinationCoords: Coordinates;
  originName: string;
  destinationName: string;
  routes: RouteAlternative[];
  mobilityProfileId: string;
  cachedAt: string;
  lastUsedAt: string;
  distanceMeters: number;
  durationMinutes: number;
  suitabilityScore: number;
  isOfflineCached: boolean;
}

export interface CachedMapTileRecord {
  key: string; // e.g. "14/11843/7504"
  z: number;
  x: number;
  y: number;
  blob: Blob;
  contentType: string;
  cachedAt: number;
  areaId?: string;
}

export interface OfflineCacheStats {
  visitedAreasCount: number;
  cachedRoutesCount: number;
  cachedTilesCount: number;
  estimatedStorageBytes: number;
  lastSyncTimestamp: number;
}
