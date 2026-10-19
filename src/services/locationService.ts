import { Coordinates } from '../types';
import { safeStorage } from '../utils/storage';

export type GeolocationStatus =
  | 'idle'
  | 'prompting'
  | 'locating'
  | 'success'
  | 'fallback_ip'
  | 'fallback_cache'
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

// Helper: Attempt browser position with specific options
function getPositionPromise(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return reject(new Error('Geolocation unsupported'));
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

// Helper: Fetch location estimate from IP geolocation
async function fetchIpGeolocation(): Promise<{ coords: Coordinates; cityName?: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    // Free, HTTPS, CORS-enabled IP geolocation
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
    // try fallback
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
 * 1. High Accuracy GPS (6s timeout)
 * 2. Low Accuracy Wi-Fi / Cell tower (5s timeout)
 * 3. IP-based Geolocation fallback
 * 4. Last Cached Location fallback
 * 5. Tamil Nadu default (Chennai)
 */
export async function requestCurrentPosition(): Promise<LocationResult> {
  // Step 1: High Accuracy GPS
  try {
    const pos = await getPositionPromise({
      enableHighAccuracy: true,
      timeout: 6000,
      maximumAge: 15000,
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
    console.warn('[LocationService] High accuracy GPS failed, falling back to network:', gpsError?.message);
  }

  // Step 2: Low-accuracy fast network/cell tower positioning
  try {
    const pos = await getPositionPromise({
      enableHighAccuracy: false,
      timeout: 5000,
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

  // Step 3: Fast IP-based Geolocation fallback
  try {
    const ipResult = await fetchIpGeolocation();
    if (ipResult) {
      safeStorage.setItem(STORAGE_KEY, JSON.stringify(ipResult.coords));
      return {
        status: 'fallback_ip',
        coordinates: ipResult.coords,
        cityName: ipResult.cityName,
        accuracyMeters: 5000,
        source: 'ip',
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
      status: 'fallback_cache',
      coordinates: cached,
      source: 'cache',
      accuracyMeters: 10000,
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
    timestamp: Date.now(),
  };
}
