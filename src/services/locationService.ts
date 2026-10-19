import { Coordinates } from '../types';
import { safeStorage } from '../utils/storage';

export type GeolocationStatus =
  | 'idle'
  | 'prompting'
  | 'locating'
  | 'success'
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | 'unsupported';

export interface LocationResult {
  status: GeolocationStatus;
  coordinates?: Coordinates;
  accuracyMeters?: number;
  cityName?: string;
  errorMessage?: string;
  timestamp?: number;
  source?: 'gps' | 'network' | 'ip' | 'cache' | 'preset';
}

const STORAGE_KEY = 'saferoute_last_known_location';

// Popular Indian & Global Presets for quick-select when GPS is disabled
export const POPULAR_LOCATION_PRESETS: { name: string; nameTamil: string; coords: Coordinates }[] = [
  { name: 'Chennai Central, TN', nameTamil: 'சென்னை சென்ட்ரல்', coords: { lat: 13.0827, lng: 80.2707 } },
  { name: 'T. Nagar, Chennai', nameTamil: 'தி. நகர், சென்னை', coords: { lat: 13.0418, lng: 80.2341 } },
  { name: 'Guindy, Chennai', nameTamil: 'கிண்டி, சென்னை', coords: { lat: 13.0067, lng: 80.2023 } },
  { name: 'Coimbatore Junction', nameTamil: 'கோயம்புத்தூர் சந்திப்பு', coords: { lat: 11.0168, lng: 76.9558 } },
  { name: 'Madurai Meenakshi', nameTamil: 'மதுரை மீனாட்சி', coords: { lat: 9.9195, lng: 78.1193 } },
  { name: 'Bengaluru Majestic', nameTamil: 'பெங்களூரு மெஜஸ்டிக்', coords: { lat: 12.9774, lng: 77.5708 } },
  { name: 'San Francisco, CA', nameTamil: 'சான் பிரான்சிஸ்கோ', coords: { lat: 37.7749, lng: -122.4194 } },
];

// Helper to get last cached location
export function getLastKnownLocation(): Coordinates | null {
  const saved = safeStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        return parsed;
      }
    } catch {}
  }
  return null;
}

// Check browser permission status if supported
export async function checkGeolocationPermission(): Promise<PermissionState | 'unsupported'> {
  if (typeof navigator !== 'undefined' && 'permissions' in navigator && navigator.permissions.query) {
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      return status.state;
    } catch {
      return 'unsupported';
    }
  }
  return 'unsupported';
}

// Helper: Attempt browser position with specific options
function getPositionPromise(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser.'));
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

// Helper: Fetch location estimate from IP geolocation
async function fetchIpGeolocation(): Promise<{ coords: Coordinates; cityName?: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://get.geojs.io/v1/ip/geo.json', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        return {
          coords: { lat, lng },
          cityName: data.city ? `${data.city}, ${data.country_code || ''}` : undefined,
        };
      }
    }
  } catch {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          return {
            coords: { lat, lng },
            cityName: data.city ? `${data.city}, ${data.region_code || ''}` : undefined,
          };
        }
      }
    } catch {}
  }
  return null;
}

/**
 * Robust multi-tier location requester:
 * 1. Native High-Accuracy Device GPS (15s timeout to allow user to tap 'Allow' and GPS hardware to lock)
 * 2. Low-Accuracy Network/Cell/Wi-Fi positioning (10s timeout)
 * 3. IP-based Geolocation fallback
 * 4. Last Cached Location fallback
 * 5. Tamil Nadu default (Chennai Central)
 *
 * Always returns coordinates so caller is NEVER stranded with an empty state!
 */
export async function requestCurrentPosition(): Promise<LocationResult> {
  // Check permission state first if available
  const permState = await checkGeolocationPermission();
  let permissionNotice = '';
  if (permState === 'denied') {
    permissionNotice = 'Location access is blocked in your browser site settings. Tap the lock/tune icon in your address bar to enable high-accuracy GPS.';
  }

  // If permission is not blocked, attempt Native GPS
  if (permState !== 'denied') {
    // Step 1: High Accuracy Native GPS (15 seconds)
    try {
      const pos = await getPositionPromise({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      });

      const coords: Coordinates = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      safeStorage.setItem(STORAGE_KEY, JSON.stringify(coords));

      return {
        status: 'success',
        coordinates: coords,
        accuracyMeters: pos.coords.accuracy,
        source: 'gps',
        timestamp: pos.timestamp,
      };
    } catch (gpsError: any) {
      console.warn('[LocationService] High accuracy GPS failed or timed out:', gpsError?.message);
      if (gpsError?.code === 1) {
        // Permission denied by user during prompt
        permissionNotice = 'Location access was not granted. Tap the lock icon in your address bar to allow location.';
      }
    }

    // Step 2: Low-accuracy fast network/cell tower positioning (10 seconds)
    try {
      const pos = await getPositionPromise({
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      });

      const coords: Coordinates = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      safeStorage.setItem(STORAGE_KEY, JSON.stringify(coords));

      return {
        status: 'success',
        coordinates: coords,
        accuracyMeters: pos.coords.accuracy,
        source: 'network',
        timestamp: pos.timestamp,
      };
    } catch (netError: any) {
      console.warn('[LocationService] Low accuracy positioning failed:', netError?.message);
    }
  }

  // Step 3: Fast IP-based Geolocation fallback
  try {
    const ipResult = await fetchIpGeolocation();
    if (ipResult) {
      safeStorage.setItem(STORAGE_KEY, JSON.stringify(ipResult.coords));
      return {
        status: 'success',
        coordinates: ipResult.coords,
        cityName: ipResult.cityName,
        accuracyMeters: 5000,
        source: 'ip',
        errorMessage: permissionNotice || 'Location estimated via network IP. Enable device GPS for precise walking guidance.',
        timestamp: Date.now(),
      };
    }
  } catch (ipErr) {
    console.warn('[LocationService] IP geolocation failed:', ipErr);
  }

  // Step 4: Check cached location
  const cached = getLastKnownLocation();
  if (cached) {
    return {
      status: 'success',
      coordinates: cached,
      source: 'cache',
      accuracyMeters: 10000,
      errorMessage: permissionNotice || 'Using last known location while searching for GPS signal.',
      timestamp: Date.now(),
    };
  }

  // Step 5: Default to Chennai Central preset
  const defaultPreset = POPULAR_LOCATION_PRESETS[0];
  return {
    status: 'success',
    coordinates: defaultPreset.coords,
    cityName: defaultPreset.name,
    source: 'preset',
    accuracyMeters: 15000,
    errorMessage: permissionNotice || 'Defaulting to Chennai Central. Tap "Quick Pick" or enter your address manually.',
    timestamp: Date.now(),
  };
}
