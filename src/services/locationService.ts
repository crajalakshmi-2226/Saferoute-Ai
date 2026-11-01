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

// Comprehensive Tamil Nadu & National Regional Presets for instant multi-district selection
export const POPULAR_LOCATION_PRESETS: { name: string; nameTamil: string; district: string; coords: Coordinates }[] = [
  { name: 'Madurai Meenakshi / Periyar Bus Stand', nameTamil: 'மதுரை மீனாட்சி / பெரியார் பேருந்து நிலையம்', district: 'Madurai', coords: { lat: 9.9195, lng: 78.1193 } },
  { name: 'Coimbatore Gandhipuram / RS Puram', nameTamil: 'கோவை காந்திபுரம் / ஆர்.எஸ்.புரம்', district: 'Coimbatore', coords: { lat: 11.0168, lng: 76.9558 } },
  { name: 'Tiruchirappalli Thillai Nagar / Central', nameTamil: 'திருச்சிராப்பள்ளி தில்லை நகர் / சென்ட்ரல்', district: 'Tiruchirappalli', coords: { lat: 10.7905, lng: 78.7047 } },
  { name: 'Salem Junction / Hasthampatti', nameTamil: 'சேலம் சந்திப்பு / அஸ்தம்பட்டி', district: 'Salem', coords: { lat: 11.6643, lng: 78.1460 } },
  { name: 'Tirunelveli Junction / Palayamkottai', nameTamil: 'திருநெல்வேலி சந்திப்பு / பாளையங்கோட்டை', district: 'Tirunelveli', coords: { lat: 8.7139, lng: 77.7567 } },
  { name: 'Erode Municipal Hub / Bus Stand', nameTamil: 'ஈரோடு நகராட்சி மையம் / பேருந்து நிலையம்', district: 'Erode', coords: { lat: 11.3410, lng: 77.7172 } },
  { name: 'Tiruppur City / Kumaran Road', nameTamil: 'திருப்பூர் குமரன் சாலை', district: 'Tiruppur', coords: { lat: 11.1085, lng: 77.3411 } },
  { name: 'Vellore Fort / CMC Hospital Area', nameTamil: 'வேலூர் கோட்டை / சி.எம்.சி பகுதி', district: 'Vellore', coords: { lat: 12.9165, lng: 79.1325 } },
  { name: 'Thanjavur Old Town / Big Temple', nameTamil: 'தஞ்சாவூர் பழைய நகரம் / பெரிய கோவில்', district: 'Thanjavur', coords: { lat: 10.7870, lng: 79.1378 } },
  { name: 'Dindigul Clock Tower / Rock Fort', nameTamil: 'திண்டுக்கல் மணிக்கூண்டு / மலைக்கோட்டை', district: 'Dindigul', coords: { lat: 10.3673, lng: 77.9803 } },
  { name: 'Kanchipuram Temple Concourse', nameTamil: 'காஞ்சிபுரம் கோவில் பகுதி', district: 'Kanchipuram', coords: { lat: 12.8342, lng: 79.7036 } },
  { name: 'Kanyakumari Beach & Cape Town', nameTamil: 'கன்னியாகுமரி கடற்கரை & டவுன்', district: 'Kanyakumari', coords: { lat: 8.0883, lng: 77.5385 } },
  { name: 'Nagercoil Vadasery Bus Stand', nameTamil: 'நாகர்கோவில் வடசேரி பேருந்து நிலையம்', district: 'Kanyakumari', coords: { lat: 8.1833, lng: 77.4119 } },
  { name: 'Thoothukudi Old Bus Stand', nameTamil: 'தூத்துக்குடி பழைய பேருந்து நிலையம்', district: 'Thoothukudi', coords: { lat: 8.7642, lng: 78.1348 } },
  { name: 'Cuddalore Port & Town', nameTamil: 'கடலூர் துறைமுகம் & டவுன்', district: 'Cuddalore', coords: { lat: 11.7480, lng: 79.7714 } },
  { name: 'Karur Bus Stand / Roundana', nameTamil: 'கரூர் பேருந்து நிலையம் / ரவுண்டானா', district: 'Karur', coords: { lat: 10.9601, lng: 78.0766 } },
  { name: 'Namakkal Bus Stand / Fort Area', nameTamil: 'நாமக்கல் பேருந்து நிலையம் / கோட்டை பகுதி', district: 'Namakkal', coords: { lat: 11.2189, lng: 78.1674 } },
  { name: 'Dharmapuri Town Hub', nameTamil: 'தர்மபுரி டவுன் மையம்', district: 'Dharmapuri', coords: { lat: 12.1211, lng: 78.1582 } },
  { name: 'Krishnagiri Roundana', nameTamil: 'கிருஷ்ணகிரி ரவுண்டானா', district: 'Krishnagiri', coords: { lat: 12.5186, lng: 78.2137 } },
  { name: 'Udhagamandalam (Ooty) Charing Cross', nameTamil: 'ஊட்டி சேரிங் கிராஸ்', district: 'Nilgiris', coords: { lat: 11.4102, lng: 76.6950 } },
  { name: 'Puducherry Promenade & White Town', nameTamil: 'புதுச்சேரி கடற்கரை & வெள்ளை நகரம்', district: 'Puducherry', coords: { lat: 11.9416, lng: 79.8083 } },
  { name: 'Chennai Central Station', nameTamil: 'சென்னை சென்ட்ரல் ரயில் நிலையம்', district: 'Chennai', coords: { lat: 13.0827, lng: 80.2707 } },
  { name: 'T. Nagar Panagal Park, Chennai', nameTamil: 'தி. நகர் பனகல் பார்க், சென்னை', district: 'Chennai', coords: { lat: 13.0418, lng: 80.2341 } },
  { name: 'Guindy Industrial Estate, Chennai', nameTamil: 'கிண்டி தொழிற்பேட்டை, சென்னை', district: 'Chennai', coords: { lat: 13.0067, lng: 80.2023 } },
  { name: 'Tambaram Railway Concourse', nameTamil: 'தாம்பரம் ரயில் நிலையம்', district: 'Chengalpattu', coords: { lat: 12.9249, lng: 80.1000 } },
  { name: 'Bengaluru Central / Majestic', nameTamil: 'பெங்களூரு சென்ட்ரல் / மெஜஸ்டிக்', district: 'Bengaluru', coords: { lat: 12.9774, lng: 77.5708 } },
  { name: 'Hyderabad Charminar / Secunderabad', nameTamil: 'ஹைதராபாத் சார்மினார் / செகந்திராபாத்', district: 'Hyderabad', coords: { lat: 17.3616, lng: 78.4747 } },
  { name: 'Kochi Marine Drive / Ernakulam', nameTamil: 'கொச்சி மெரைன் டிரைவ் / எர்ணாகுளம்', district: 'Kochi', coords: { lat: 9.9816, lng: 76.2798 } },
  { name: 'Mumbai CST / Nariman Point', nameTamil: 'மும்பை சி.எஸ்.டி / நரிமன் பாயிண்ட்', district: 'Mumbai', coords: { lat: 18.9401, lng: 72.8347 } },
  { name: 'New Delhi Connaught Place', nameTamil: 'புது தில்லி கன்னாட் பிளேஸ்', district: 'Delhi', coords: { lat: 28.6315, lng: 77.2167 } },
];

export function searchLocationPresets(query: string): typeof POPULAR_LOCATION_PRESETS {
  if (!query || query.trim().length === 0) return POPULAR_LOCATION_PRESETS.slice(0, 10);
  const q = query.toLowerCase().trim();
  return POPULAR_LOCATION_PRESETS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.nameTamil.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q)
  );
}

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
