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
 * Robust multi-tier location requester with INSTANT response:
 * 1. Checks cached last-known position immediately (0ms).
 * 2. Asks native device GPS with 5-minute maximumAge cache allowance (10-50ms return on Android/iOS).
 * 3. 4-second timeout limit on cold GPS to prevent mobile hanging.
 * 4. Fast IP & preset fallbacks so the user is never stuck waiting.
 */
export async function requestCurrentPosition(options?: {
  onImmediateLocation?: (coords: Coordinates) => void;
  preferInstant?: boolean;
}): Promise<LocationResult> {
  // Step 0: If cached location exists, immediately notify caller
  const cached = getLastKnownLocation();
  if (cached && options?.onImmediateLocation) {
    options.onImmediateLocation(cached);
  }

  if (cached && options?.preferInstant) {
    return {
      status: 'success',
      coordinates: cached,
      source: 'cache',
      accuracyMeters: 50,
      timestamp: Date.now(),
    };
  }

  // Check permission state first if available
  const permState = await checkGeolocationPermission();
  let permissionNotice = '';
  if (permState === 'denied') {
    permissionNotice = 'Location access is blocked in site settings. Tap the lock icon in your address bar to enable GPS.';
  }

  // If permission is not blocked, attempt Native GPS with low latency options
  if (permState !== 'denied' && typeof window !== 'undefined' && navigator.geolocation) {
    // Step 1: Fast Device GPS with maximumAge: 300000 (5 minutes) and 4s timeout
    try {
      const pos = await getPositionPromise({
        enableHighAccuracy: true,
        timeout: 4000,
        maximumAge: 300000, // Reuse fresh device GPS fix if available
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
      console.warn('[LocationService] Fast high-accuracy GPS timed out or unavailable:', gpsError?.message);
      if (gpsError?.code === 1) {
        permissionNotice = 'Location access was denied. Tap lock icon in address bar to allow location.';
      }
    }

    // Step 2: Low-accuracy fast network/cell tower positioning (3s timeout)
    try {
      const pos = await getPositionPromise({
        enableHighAccuracy: false,
        timeout: 3000,
        maximumAge: 600000, // 10 minutes cache
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
      console.warn('[LocationService] Low-accuracy positioning failed:', netError?.message);
    }
  }

  // Step 3: Fast cached location if available
  if (cached) {
    return {
      status: 'success',
      coordinates: cached,
      source: 'cache',
      accuracyMeters: 100,
      errorMessage: permissionNotice || 'Using last known GPS location.',
      timestamp: Date.now(),
    };
  }

  // Step 4: Fast IP-based Geolocation fallback
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
        errorMessage: permissionNotice || 'Location estimated via network IP.',
        timestamp: Date.now(),
      };
    }
  } catch (ipErr) {
    console.warn('[LocationService] IP geolocation failed:', ipErr);
  }

  // Step 5: Default to Chennai Central preset so UI is never blank
  const defaultPreset = POPULAR_LOCATION_PRESETS[0];
  return {
    status: 'success',
    coordinates: defaultPreset.coords,
    cityName: defaultPreset.name,
    source: 'preset',
    accuracyMeters: 15000,
    errorMessage: permissionNotice || 'Defaulting to Chennai Central.',
    timestamp: Date.now(),
  };
}
