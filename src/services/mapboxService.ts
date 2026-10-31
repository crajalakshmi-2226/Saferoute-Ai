import { GeocodingResult, RouteAlternative, RouteStep, BarrierReport } from '../types';
import { safeStorage } from '../utils/storage';
import { findCachedRoute, recordVisitedArea } from './indexedDbCache';

const TOKEN_STORAGE_KEY = 'saferoute_mapbox_token';

export function getMapboxToken(): string {
  // Check localStorage safely first (user-configured in setup screen)
  const customToken = safeStorage.getItem(TOKEN_STORAGE_KEY);
  if (customToken && customToken.trim().startsWith('pk.')) {
    return customToken.trim();
  }

  // Fallback to Vite env var
  const envToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
  if (envToken && envToken !== 'YOUR_MAPBOX_PUBLIC_TOKEN' && envToken.trim().length > 10) {
    return envToken.trim();
  }

  return '';
}

export function setMapboxToken(token: string): void {
  if (token) {
    safeStorage.setItem(TOKEN_STORAGE_KEY, token.trim());
  } else {
    safeStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export async function validateMapboxToken(token: string): Promise<{ valid: boolean; message: string }> {
  if (!token || !token.trim()) {
    return { valid: false, message: 'No Mapbox public token provided.' };
  }

  const clean = token.trim();
  if (!clean.startsWith('pk.')) {
    return {
      valid: false,
      message: 'Mapbox public tokens usually start with "pk.". Please check that you copied a public token, not a secret token.'
    };
  }

  try {
    const testUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?limit=1&access_token=${encodeURIComponent(clean)}`;
    const res = await fetch(testUrl);

    if (res.status === 200) {
      return { valid: true, message: 'Token validated successfully! Mapbox API is accessible.' };
    } else if (res.status === 401) {
      return { valid: false, message: 'Mapbox returned 401 Unauthorized. The token is invalid or expired.' };
    } else if (res.status === 403) {
      return { valid: false, message: 'Mapbox returned 403 Forbidden. Check your token origin/URL restrictions on Mapbox.com.' };
    } else {
      return { valid: false, message: `Mapbox API returned status code ${res.status}.` };
    }
  } catch (err: any) {
    return { valid: false, message: `Network error connecting to Mapbox API: ${err.message || 'Check your internet connection.'}` };
  }
}

export async function searchPlaces(query: string, proximity?: [number, number]): Promise<GeocodingResult[]> {
  const token = getMapboxToken();
  if (!token) {
    throw new Error('Mapbox token is not configured. Please configure your public token in Settings.');
  }

  if (!query || query.trim().length < 2) {
    return [];
  }

  let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query.trim())}.json?access_token=${token}&autocomplete=true&types=poi,address,place,neighborhood,locality&limit=5`;
  if (proximity) {
    url += `&proximity=${proximity[0]},${proximity[1]}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Mapbox Geocoding failed with status ${res.status}`);
  }

  const data = await res.json();
  if (!data.features || !Array.isArray(data.features)) {
    return [];
  }

  return data.features.map((f: any) => ({
    id: f.id,
    placeName: f.place_name,
    text: f.text,
    center: f.center as [number, number],
    address: f.properties?.address,
    category: f.properties?.category || f.place_type?.[0]
  }));
}

export async function reverseGeocode(lng: number, lat: number): Promise<string> {
  const token = getMapboxToken();
  if (!token) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const data = await res.json();
    return data.features?.[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

export async function fetchWalkingRoutes(
  origin: [number, number], // [lng, lat]
  destination: [number, number] // [lng, lat]
): Promise<any[]> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // 1. If currently offline, immediately check local IndexedDB cache
  if (!isOnline) {
    const cached = await findCachedRoute(
      { lng: origin[0], lat: origin[1] },
      { lng: destination[0], lat: destination[1] }
    );
    if (cached && cached.routes && cached.routes.length > 0) {
      // Return cached routes converted to raw route geometry for scoring if needed
      return cached.routes.map((r) => ({
        distance: r.distanceMeters,
        duration: r.durationMinutes * 60,
        geometry: { coordinates: r.geometry.coordinates },
        legs: [
          {
            steps: r.steps.map((s) => ({
              distance: s.distanceMeters,
              duration: s.durationSeconds,
              name: s.name,
              maneuver: s.maneuver,
            })),
          },
        ],
        _isOfflineCached: true,
      }));
    }
    throw new Error('Device is offline and no matching route was found in IndexedDB local cache.');
  }

  const token = getMapboxToken();
  if (!token) {
    throw new Error('Mapbox token required to calculate walking directions.');
  }

  const coords = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coords}?geometries=geojson&steps=true&alternatives=true&overview=full&access_token=${token}`;

  // Use AbortController timeout for poor cellular connectivity (6.5s)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6500);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Directions API returned HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No walking routes found between these locations.');
    }

    // Auto-record visited area centers in IndexedDB in the background
    recordVisitedArea('Route Origin', { lng: origin[0], lat: origin[1] }, 2.0).catch(() => {});
    recordVisitedArea('Route Destination', { lng: destination[0], lat: destination[1] }, 2.0).catch(() => {});

    return data.routes;
  } catch (err: any) {
    clearTimeout(timeoutId);

    // Fallback to IndexedDB cache on timeout or network error (poor cellular connectivity)
    try {
      const cached = await findCachedRoute(
        { lng: origin[0], lat: origin[1] },
        { lng: destination[0], lat: destination[1] }
      );
      if (cached && cached.routes && cached.routes.length > 0) {
        return cached.routes.map((r) => ({
          distance: r.distanceMeters,
          duration: r.durationMinutes * 60,
          geometry: { coordinates: r.geometry.coordinates },
          legs: [
            {
              steps: r.steps.map((s) => ({
                distance: s.distanceMeters,
                duration: s.durationSeconds,
                name: s.name,
                maneuver: s.maneuver,
              })),
            },
          ],
          _isOfflineCached: true,
        }));
      }
    } catch {
      // Ignore cache lookup error and propagate main error
    }

    if (err.name === 'AbortError') {
      throw new Error('Poor cellular connectivity: Route calculation timed out. Try again or select an offline cached route.');
    }
    throw err;
  }
}

