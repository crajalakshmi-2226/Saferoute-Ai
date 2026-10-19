import { Coordinates, OfflineMapPack, DownloadProgress } from '../types';
import { safeStorage } from '../utils/storage';
import { getMapboxToken, reverseGeocode } from './mapboxService';

export const OFFLINE_TILE_CACHE_NAME = 'saferoute-offline-tiles-v1';
const OFFLINE_PACKS_STORAGE_KEY = 'saferoute_offline_map_packs';
const OFFLINE_SIMULATION_KEY = 'saferoute_simulate_offline_mode';

export interface CityPreset {
  id: string;
  name: string;
  region: string;
  country: string;
  center: Coordinates;
  recommendedRadiusKm: number;
}

export const POPULAR_CITIES: CityPreset[] = [
  {
    id: 'sf',
    name: 'San Francisco',
    region: 'California',
    country: 'United States',
    center: { lat: 37.7749, lng: -122.4194 },
    recommendedRadiusKm: 4.5,
  },
  {
    id: 'nyc',
    name: 'New York City',
    region: 'New York',
    country: 'United States',
    center: { lat: 40.7128, lng: -74.0060 },
    recommendedRadiusKm: 4.0,
  },
  {
    id: 'london',
    name: 'London',
    region: 'Greater London',
    country: 'United Kingdom',
    center: { lat: 51.5074, lng: -0.1278 },
    recommendedRadiusKm: 4.5,
  },
  {
    id: 'chennai',
    name: 'Chennai',
    region: 'Tamil Nadu',
    country: 'India',
    center: { lat: 13.0827, lng: 80.2707 },
    recommendedRadiusKm: 5.0,
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    region: 'Karnataka',
    country: 'India',
    center: { lat: 12.9716, lng: 77.5946 },
    recommendedRadiusKm: 5.0,
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    region: 'Kanto',
    country: 'Japan',
    center: { lat: 35.6762, lng: 139.6503 },
    recommendedRadiusKm: 4.5,
  },
  {
    id: 'paris',
    name: 'Paris',
    region: 'Île-de-France',
    country: 'France',
    center: { lat: 48.8566, lng: 2.3522 },
    recommendedRadiusKm: 4.0,
  },
  {
    id: 'berlin',
    name: 'Berlin',
    region: 'Berlin',
    country: 'Germany',
    center: { lat: 52.5200, lng: 13.4050 },
    recommendedRadiusKm: 4.5,
  },
  {
    id: 'toronto',
    name: 'Toronto',
    region: 'Ontario',
    country: 'Canada',
    center: { lat: 43.6532, lng: -79.3832 },
    recommendedRadiusKm: 4.5,
  },
  {
    id: 'sydney',
    name: 'Sydney',
    region: 'New South Wales',
    country: 'Australia',
    center: { lat: -33.8688, lng: 151.2093 },
    recommendedRadiusKm: 4.5,
  },
];

// Helper: Convert degrees to radians
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Helper: Calculate Haversine distance in km
export function calculateDistanceKm(c1: Coordinates, c2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(c2.lat - c1.lat);
  const dLng = toRad(c2.lng - c1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(c1.lat)) * Math.cos(toRad(c2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Slippy map tile calculations
export function lon2tile(lon: number, zoom: number): number {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

export function lat2tile(lat: number, zoom: number): number {
  const latRad = toRad(lat);
  return Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, zoom)
  );
}

export function tile2lon(x: number, z: number): number {
  return (x / Math.pow(2, z)) * 360 - 180;
}

export function tile2lat(y: number, z: number): number {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

// Bounding box from center and radius
export function getBoundingBox(center: Coordinates, radiusKm: number) {
  const latDelta = radiusKm / 111.32;
  const lngDelta = radiusKm / (111.32 * Math.cos(toRad(center.lat)));

  return {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLng: center.lng - lngDelta,
    maxLng: center.lng + lngDelta,
  };
}

export interface TileTarget {
  z: number;
  x: number;
  y: number;
  urls: string[]; // List of URLs to cache (OSM + Mapbox if available)
}

// Generate tile targets for city area across pedestrian zoom levels (12 to 14)
export function generateTileTargets(
  center: Coordinates,
  radiusKm: number = 3.5,
  zoomLevels: number[] = [12, 13, 14]
): { tiles: TileTarget[]; bounds: ReturnType<typeof getBoundingBox> } {
  const bounds = getBoundingBox(center, radiusKm);
  const targets: TileTarget[] = [];
  const mapboxToken = getMapboxToken();

  for (const z of zoomLevels) {
    const minX = Math.max(0, lon2tile(bounds.minLng, z));
    const maxX = Math.max(0, lon2tile(bounds.maxLng, z));
    const minY = Math.max(0, lat2tile(bounds.maxLat, z)); // Y inverted in slippy tiles
    const maxY = Math.max(0, lat2tile(bounds.minLat, z));

    for (let x = Math.min(minX, maxX); x <= Math.max(minX, maxX); x++) {
      for (let y = Math.min(minY, maxY); y <= Math.max(minY, maxY); y++) {
        const urls: string[] = [
          // OpenStreetMap standard tile
          `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
          // Carto dark matter tile (great for dark theme)
          `https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`,
        ];

        if (mapboxToken) {
          // Mapbox raster tiles for dark and light
          urls.push(
            `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/${z}/${x}/${y}?access_token=${mapboxToken}`
          );
        }

        targets.push({ z, x, y, urls });
      }
    }
  }

  return { tiles: targets, bounds };
}

// Detect closest preset city or resolve city name
export async function detectCurrentCity(coords: Coordinates): Promise<{
  cityName: string;
  countryOrState: string;
  matchedPreset?: CityPreset;
}> {
  // Check closest known preset first
  let closest: CityPreset | null = null;
  let minDistance = Infinity;

  for (const preset of POPULAR_CITIES) {
    const dist = calculateDistanceKm(coords, preset.center);
    if (dist < minDistance) {
      minDistance = dist;
      closest = preset;
    }
  }

  // If within 40km of a known city preset, use that
  if (closest && minDistance <= 40) {
    return {
      cityName: closest.name,
      countryOrState: `${closest.region}, ${closest.country}`,
      matchedPreset: closest,
    };
  }

  // Otherwise reverse geocode via Mapbox or fallback to coordinates string
  try {
    const placeName = await reverseGeocode(coords.lng, coords.lat);
    const parts = placeName.split(',').map((p) => p.trim());
    if (parts.length >= 2) {
      return {
        cityName: parts[0],
        countryOrState: parts.slice(1).join(', '),
      };
    }
    return {
      cityName: placeName || 'Current Locality',
      countryOrState: `${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°`,
    };
  } catch {
    return {
      cityName: 'Current Location',
      countryOrState: `${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°`,
    };
  }
}

// Local Storage for Offline Packs
export function getStoredOfflinePacks(): OfflineMapPack[] {
  const raw = safeStorage.getItem(OFFLINE_PACKS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredOfflinePacks(packs: OfflineMapPack[]): void {
  safeStorage.setItem(OFFLINE_PACKS_STORAGE_KEY, JSON.stringify(packs));
}

// Check if a specific coordinate is covered by any downloaded offline pack
export function isCoordinateCoveredByOfflineMap(coords: Coordinates): {
  isCovered: boolean;
  pack?: OfflineMapPack;
} {
  const packs = getStoredOfflinePacks().filter((p) => p.status === 'ready');
  for (const pack of packs) {
    const dist = calculateDistanceKm(coords, pack.center);
    if (dist <= pack.radiusKm) {
      return { isCovered: true, pack };
    }
    if (
      pack.bounds &&
      coords.lat >= pack.bounds.minLat &&
      coords.lat <= pack.bounds.maxLat &&
      coords.lng >= pack.bounds.minLng &&
      coords.lng <= pack.bounds.maxLng
    ) {
      return { isCovered: true, pack };
    }
  }
  return { isCovered: false };
}

// Active download controller
let currentAbortController: AbortController | null = null;

export function cancelActiveDownload(): void {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
}

// Download and cache map tiles for a city
export async function downloadOfflineMapPack(
  cityName: string,
  countryOrState: string,
  center: Coordinates,
  radiusKm: number = 3.5,
  zoomLevels: number[] = [12, 13, 14],
  onProgress: (progress: DownloadProgress) => void
): Promise<OfflineMapPack> {
  const packId = `pack-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const { tiles, bounds } = generateTileTargets(center, radiusKm, zoomLevels);
  const totalTiles = tiles.length;

  cancelActiveDownload();
  const abortController = new AbortController();
  currentAbortController = abortController;

  // Initial progress
  onProgress({
    packId,
    cityName,
    totalTiles,
    completedTiles: 0,
    percent: 0,
    currentStage: `Preparing offline tile bundle for ${cityName} (${totalTiles} tiles)...`,
    bytesDownloaded: 0,
    isComplete: false,
  });

  let cache: Cache | null = null;
  if (typeof caches !== 'undefined') {
    try {
      cache = await caches.open(OFFLINE_TILE_CACHE_NAME);
    } catch (err) {
      console.warn('CacheStorage open warning:', err);
    }
  }

  let completedTiles = 0;
  let totalBytes = 0;

  // Also cache Mapbox Style JSON and Sprite if token is available
  const mapboxToken = getMapboxToken();
  if (cache && mapboxToken) {
    const styleUrls = [
      `https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=${mapboxToken}`,
      `https://api.mapbox.com/styles/v1/mapbox/light-v11?access_token=${mapboxToken}`,
    ];
    for (const url of styleUrls) {
      try {
        const resp = await fetch(url, { signal: abortController.signal, mode: 'cors' });
        if (resp.ok) {
          const clone = resp.clone();
          const buf = await resp.arrayBuffer();
          totalBytes += buf.byteLength;
          await cache.put(url, clone);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') throw err;
      }
    }
  }

  // Batch download tiles with concurrency limit
  const CONCURRENCY = 4;
  for (let i = 0; i < tiles.length; i += CONCURRENCY) {
    if (abortController.signal.aborted) {
      throw new Error('Download was cancelled by user.');
    }

    const batch = tiles.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (tileTarget) => {
        // Try each URL in the target list
        for (const url of tileTarget.urls) {
          if (abortController.signal.aborted) return;
          try {
            // Check if already in cache
            if (cache) {
              const matched = await cache.match(url);
              if (matched) {
                completedTiles++;
                totalBytes += 15000; // approximate cached tile size
                return;
              }
            }

            const response = await fetch(url, {
              signal: abortController.signal,
              mode: 'cors',
              headers: { Accept: 'image/png,image/*,*/*' },
            });

            if (response.ok) {
              const clone = response.clone();
              const buffer = await response.arrayBuffer();
              totalBytes += buffer.byteLength;
              if (cache) {
                await cache.put(url, clone);
              }
              break; // successfully cached one tile source
            }
          } catch (err: any) {
            if (err.name === 'AbortError') throw err;
            // Fallback continues to next tile source
          }
        }
        completedTiles++;
      })
    );

    const percent = Math.min(100, Math.round((completedTiles / totalTiles) * 100));
    onProgress({
      packId,
      cityName,
      totalTiles,
      completedTiles,
      percent,
      currentStage: `Downloading tile ${completedTiles} of ${totalTiles} (${(
        totalBytes /
        (1024 * 1024)
      ).toFixed(1)} MB cached)...`,
      bytesDownloaded: totalBytes,
      isComplete: false,
    });
  }

  currentAbortController = null;

  // Finalize pack
  const completedPack: OfflineMapPack = {
    id: packId,
    cityName,
    countryOrState,
    center,
    radiusKm,
    tileCount: totalTiles,
    sizeBytes: totalBytes > 0 ? totalBytes : totalTiles * 18000,
    downloadedAt: new Date().toISOString(),
    zoomLevels,
    status: 'ready',
    bounds,
  };

  // Save to stored packs
  const existing = getStoredOfflinePacks().filter((p) => p.cityName !== cityName);
  saveStoredOfflinePacks([completedPack, ...existing]);

  onProgress({
    packId,
    cityName,
    totalTiles,
    completedTiles: totalTiles,
    percent: 100,
    currentStage: `Offline map ready for ${cityName}! Zero-bandwidth navigation enabled.`,
    bytesDownloaded: completedPack.sizeBytes,
    isComplete: true,
  });

  return completedPack;
}

// Delete an offline pack
export async function deleteOfflineMapPack(packId: string): Promise<void> {
  const packs = getStoredOfflinePacks();
  const target = packs.find((p) => p.id === packId);
  const remaining = packs.filter((p) => p.id !== packId);
  saveStoredOfflinePacks(remaining);

  if (target && typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(OFFLINE_TILE_CACHE_NAME);
      const { tiles } = generateTileTargets(target.center, target.radiusKm, target.zoomLevels);
      for (const t of tiles) {
        for (const url of t.urls) {
          await cache.delete(url).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Cache deletion notice:', err);
    }
  }
}

// Delete all offline maps
export async function clearAllOfflineMaps(): Promise<void> {
  saveStoredOfflinePacks([]);
  if (typeof caches !== 'undefined') {
    try {
      await caches.delete(OFFLINE_TILE_CACHE_NAME);
    } catch (err) {
      console.warn('Clear all cache notice:', err);
    }
  }
}

// Storage estimate in MB
export async function getOfflineStorageEstimate(): Promise<{
  usageMB: number;
  totalPacks: number;
  quotaMB?: number;
}> {
  const packs = getStoredOfflinePacks();
  const totalSizeBytes = packs.reduce((acc, p) => acc + (p.sizeBytes || 0), 0);
  let quotaMB: number | undefined;

  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.quota) {
        quotaMB = Math.round(estimate.quota / (1024 * 1024));
      }
    } catch {}
  }

  return {
    usageMB: Number((totalSizeBytes / (1024 * 1024)).toFixed(1)),
    totalPacks: packs.length,
    quotaMB,
  };
}

// Simulated Offline Mode helper
export function isOfflineSimulated(): boolean {
  return safeStorage.getItem(OFFLINE_SIMULATION_KEY) === 'true';
}

export function setOfflineSimulated(enabled: boolean): void {
  if (enabled) {
    safeStorage.setItem(OFFLINE_SIMULATION_KEY, 'true');
  } else {
    safeStorage.removeItem(OFFLINE_SIMULATION_KEY);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('saferoute:offline-simulation-changed', {
        detail: { simulated: enabled },
      })
    );
  }
}
