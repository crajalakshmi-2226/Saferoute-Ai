import {
  Coordinates,
  RouteAlternative,
  CachedVisitedArea,
  CachedRouteSummary,
  CachedMapTileRecord,
  OfflineCacheStats,
} from '../types';
import { calculateDistanceKm, getBoundingBox, lon2tile, lat2tile } from './offlineMapService';

const DB_NAME = 'SafeRouteIndexedDB';
const DB_VERSION = 2;

const STORE_AREAS = 'visited_areas';
const STORE_ROUTES = 'route_summaries';
const STORE_TILES = 'map_tiles';
const STORE_GEOCODING = 'geocoding_cache';

let dbInstance: IDBDatabase | null = null;
let dbOpenPromise: Promise<IDBDatabase> | null = null;

/**
 * Initializes and upgrades the IndexedDB database
 */
export function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbOpenPromise) return dbOpenPromise;

  dbOpenPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this browser environment.'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Visited Areas Store
      if (!db.objectStoreNames.contains(STORE_AREAS)) {
        const areaStore = db.createObjectStore(STORE_AREAS, { keyPath: 'id' });
        areaStore.createIndex('lastVisitedAt', 'lastVisitedAt', { unique: false });
        areaStore.createIndex('name', 'name', { unique: false });
      }

      // 2. Route Summaries Store
      if (!db.objectStoreNames.contains(STORE_ROUTES)) {
        const routeStore = db.createObjectStore(STORE_ROUTES, { keyPath: 'id' });
        routeStore.createIndex('lastUsedAt', 'lastUsedAt', { unique: false });
        routeStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        routeStore.createIndex('originName', 'originName', { unique: false });
        routeStore.createIndex('destinationName', 'destinationName', { unique: false });
      }

      // 3. Map Tiles Store (Key: "z/x/y")
      if (!db.objectStoreNames.contains(STORE_TILES)) {
        const tileStore = db.createObjectStore(STORE_TILES, { keyPath: 'key' });
        tileStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        tileStore.createIndex('areaId', 'areaId', { unique: false });
      }

      // 4. Geocoding & Addresses Store
      if (!db.objectStoreNames.contains(STORE_GEOCODING)) {
        const geoStore = db.createObjectStore(STORE_GEOCODING, { keyPath: 'query' });
        geoStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open SafeRoute IndexedDB.'));
    };
  });

  return dbOpenPromise;
}

// Helper: Run an IndexedDB transaction promise
async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<T> | T
): Promise<T> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);

    let result: any;
    try {
      result = callback(store);
    } catch (err) {
      reject(err);
      return;
    }

    tx.oncomplete = () => {
      resolve(result);
    };

    tx.onerror = () => {
      reject(tx.error || new Error(`Transaction failed on ${storeName}`));
    };
  });
}

// ================= 1. VISITED AREAS MANAGEMENT =================

/**
 * Register or update a recently visited geographical area
 */
export async function recordVisitedArea(
  name: string,
  center: Coordinates,
  radiusKm: number = 2.5
): Promise<CachedVisitedArea> {
  const bounds = getBoundingBox(center, radiusKm);
  const existingAreas = await getRecentlyVisitedAreas(20);

  // Check if coordinates fall within an existing nearby area
  let matchedArea = existingAreas.find((a) => {
    const dist = calculateDistanceKm(center, a.center);
    return dist <= a.radiusKm * 0.8;
  });

  const now = new Date().toISOString();

  if (matchedArea) {
    matchedArea.lastVisitedAt = now;
    matchedArea.visitCount += 1;
    if (name && name.length > matchedArea.name.length && !name.includes('°')) {
      matchedArea.name = name;
    }

    await withStore(STORE_AREAS, 'readwrite', (store) => {
      store.put(matchedArea);
    });

    // Background pre-cache basic tiles if not already present
    if (!matchedArea.hasOfflineTiles) {
      triggerBackgroundTileCaching(matchedArea).catch((e) =>
        console.warn('Background tile cache error:', e)
      );
    }

    return matchedArea;
  }

  const areaId = `area_${Math.round(center.lat * 100)}_${Math.round(center.lng * 100)}_${Date.now()
    .toString(36)
    .slice(-4)}`;

  const newArea: CachedVisitedArea = {
    id: areaId,
    name: name || `Area (${center.lat.toFixed(2)}°, ${center.lng.toFixed(2)}°)`,
    center,
    bounds,
    radiusKm,
    lastVisitedAt: now,
    visitCount: 1,
    cachedTileCount: 0,
    hasOfflineTiles: false,
    totalSizeEstimatedBytes: 0,
  };

  await withStore(STORE_AREAS, 'readwrite', (store) => {
    store.put(newArea);
  });

  // Background fetch basic zoom 12-14 map tiles for offline availability
  triggerBackgroundTileCaching(newArea).catch((e) =>
    console.warn('Background tile cache error:', e)
  );

  return newArea;
}

/**
 * Retrieve recently visited areas sorted by recency
 */
export async function getRecentlyVisitedAreas(limit: number = 10): Promise<CachedVisitedArea[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_AREAS, 'readonly');
      const store = tx.objectStore(STORE_AREAS);
      const req = store.getAll();

      req.onsuccess = () => {
        const list: CachedVisitedArea[] = req.result || [];
        list.sort(
          (a, b) => new Date(b.lastVisitedAt).getTime() - new Date(a.lastVisitedAt).getTime()
        );
        resolve(list.slice(0, limit));
      };

      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

// ================= 2. ROUTE SUMMARIES LOCAL CACHE =================

/**
 * Generate a deterministic key for an origin/destination pair and mobility profile
 */
export function getRouteCacheKey(
  origin: Coordinates,
  destination: Coordinates,
  profileId: string = 'general'
): string {
  // Round to ~30 meters precision for cache hits even if GPS drifted slightly
  const oLat = (Math.round(origin.lat * 300) / 300).toFixed(4);
  const oLng = (Math.round(origin.lng * 300) / 300).toFixed(4);
  const dLat = (Math.round(destination.lat * 300) / 300).toFixed(4);
  const dLng = (Math.round(destination.lng * 300) / 300).toFixed(4);

  return `route_${oLat}_${oLng}_to_${dLat}_${dLng}_${profileId}`;
}

/**
 * Store calculated route alternatives in IndexedDB
 */
export async function cacheRouteSummary(
  originCoords: Coordinates,
  destCoords: Coordinates,
  originName: string,
  destName: string,
  routes: RouteAlternative[],
  mobilityProfileId: string = 'general'
): Promise<CachedRouteSummary> {
  const id = getRouteCacheKey(originCoords, destCoords, mobilityProfileId);
  const now = new Date().toISOString();

  // Mark all cached route alternatives with offline metadata
  const enrichedRoutes: RouteAlternative[] = routes.map((r) => ({
    ...r,
    isOfflineCached: true,
    cachedAt: now,
    offlineNotice: '⚡ Loaded from IndexedDB offline storage (low connectivity mode)',
  }));

  const primary = routes[0];

  const record: CachedRouteSummary = {
    id,
    originCoords,
    destinationCoords: destCoords,
    originName: originName || 'Origin Location',
    destinationName: destName || 'Destination Location',
    routes: enrichedRoutes,
    mobilityProfileId,
    cachedAt: now,
    lastUsedAt: now,
    distanceMeters: primary ? primary.distanceMeters : 0,
    durationMinutes: primary ? primary.durationMinutes : 0,
    suitabilityScore: primary ? primary.overallSuitabilityScore : 85,
    isOfflineCached: true,
  };

  try {
    await withStore(STORE_ROUTES, 'readwrite', (store) => {
      store.put(record);
    });

    // Also register origin and destination as recently visited areas in IndexedDB
    recordVisitedArea(originName, originCoords, 2.0).catch(() => {});
    recordVisitedArea(destName, destCoords, 2.0).catch(() => {});
  } catch (err) {
    console.warn('Failed to cache route summary in IndexedDB:', err);
  }

  return record;
}

/**
 * Find cached routes for origin and destination within proximity threshold
 */
export async function findCachedRoute(
  originCoords: Coordinates,
  destCoords: Coordinates,
  mobilityProfileId: string = 'general',
  toleranceMeters: number = 250
): Promise<CachedRouteSummary | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_ROUTES, 'readonly');
      const store = tx.objectStore(STORE_ROUTES);
      const req = store.getAll();

      req.onsuccess = () => {
        const list: CachedRouteSummary[] = req.result || [];
        const toleranceKm = toleranceMeters / 1000;

        for (const record of list) {
          const originDist = calculateDistanceKm(originCoords, record.originCoords);
          const destDist = calculateDistanceKm(destCoords, record.destinationCoords);

          if (originDist <= toleranceKm && destDist <= toleranceKm) {
            // Update last used timestamp in background
            updateRouteLastUsed(record.id).catch(() => {});
            return resolve(record);
          }
        }

        resolve(null);
      };

      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Get all recent route summaries stored in IndexedDB
 */
export async function getRecentRouteSummaries(limit: number = 10): Promise<CachedRouteSummary[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_ROUTES, 'readonly');
      const store = tx.objectStore(STORE_ROUTES);
      const req = store.getAll();

      req.onsuccess = () => {
        const list: CachedRouteSummary[] = req.result || [];
        list.sort(
          (a, b) => new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()
        );
        resolve(list.slice(0, limit));
      };

      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/**
 * Delete a specific cached route
 */
export async function deleteCachedRoute(id: string): Promise<void> {
  await withStore(STORE_ROUTES, 'readwrite', (store) => {
    store.delete(id);
  });
}

async function updateRouteLastUsed(id: string): Promise<void> {
  try {
    await withStore(STORE_ROUTES, 'readwrite', (store) => {
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        if (getReq.result) {
          const updated = {
            ...getReq.result,
            lastUsedAt: new Date().toISOString(),
          };
          store.put(updated);
        }
      };
    });
  } catch {}
}

// ================= 3. MAP TILES LOCAL CACHING (INDEXEDDB) =================

/**
 * Store a basic raster map tile in IndexedDB
 */
export async function storeMapTile(
  z: number,
  x: number,
  y: number,
  blob: Blob,
  areaId?: string
): Promise<void> {
  const key = `${z}/${x}/${y}`;
  const record: CachedMapTileRecord = {
    key,
    z,
    x,
    y,
    blob,
    contentType: blob.type || 'image/png',
    cachedAt: Date.now(),
    areaId,
  };

  await withStore(STORE_TILES, 'readwrite', (store) => {
    store.put(record);
  });
}

/**
 * Retrieve a map tile from IndexedDB
 */
export async function getMapTile(z: number, x: number, y: number): Promise<Blob | null> {
  try {
    const key = `${z}/${x}/${y}`;
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_TILES, 'readonly');
      const store = tx.objectStore(STORE_TILES);
      const req = store.get(key);

      req.onsuccess = () => {
        const res = req.result as CachedMapTileRecord | undefined;
        resolve(res ? res.blob : null);
      };

      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Return an ObjectURL for a cached tile in IndexedDB
 */
export async function getMapTileObjectUrl(
  z: number,
  x: number,
  y: number
): Promise<string | null> {
  const blob = await getMapTile(z, x, y);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

/**
 * Pre-cache basic map tiles (zoom 12-14) for a visited area in IndexedDB
 */
export async function triggerBackgroundTileCaching(
  area: CachedVisitedArea,
  onProgress?: (cached: number, total: number) => void
): Promise<number> {
  const zoomLevels = [12, 13, 14];
  const bounds = area.bounds;
  const tileCoords: { z: number; x: number; y: number }[] = [];

  for (const z of zoomLevels) {
    const minX = Math.max(0, lon2tile(bounds.minLng, z));
    const maxX = Math.max(0, lon2tile(bounds.maxLng, z));
    const minY = Math.max(0, lat2tile(bounds.maxLat, z));
    const maxY = Math.max(0, lat2tile(bounds.minLat, z));

    for (let x = Math.min(minX, maxX); x <= Math.max(minX, maxX); x++) {
      for (let y = Math.min(minY, maxY); y <= Math.max(minY, maxY); y++) {
        tileCoords.push({ z, x, y });
      }
    }
  }

  // Cap background tiles to prevent network overload (max 35 tiles per auto-cached area)
  const cappedTiles = tileCoords.slice(0, 35);
  let savedCount = 0;
  let totalBytes = 0;

  for (const { z, x, y } of cappedTiles) {
    // Check if tile already exists in IndexedDB
    const existing = await getMapTile(z, x, y);
    if (existing) {
      savedCount++;
      continue;
    }

    try {
      // Fetch open, public raster tile
      const tileUrl = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
      const res = await fetch(tileUrl, {
        mode: 'cors',
        headers: { Accept: 'image/png,image/*,*/*' },
      });

      if (res.ok) {
        const blob = await res.blob();
        totalBytes += blob.size;
        await storeMapTile(z, x, y, blob, area.id);
        savedCount++;
        if (onProgress) onProgress(savedCount, cappedTiles.length);
      }
    } catch {
      // Continue on intermittent network
    }
  }

  // Update area record in IndexedDB with tile count and size
  try {
    area.cachedTileCount = savedCount;
    area.hasOfflineTiles = savedCount > 0;
    area.totalSizeEstimatedBytes = totalBytes > 0 ? totalBytes : savedCount * 14000;

    await withStore(STORE_AREAS, 'readwrite', (store) => {
      store.put(area);
    });
  } catch {}

  return savedCount;
}

// ================= 4. STORAGE STATISTICS & CLEANUP =================

/**
 * Get detailed statistics about IndexedDB offline data
 */
export async function getOfflineCacheStats(): Promise<OfflineCacheStats> {
  try {
    const db = await getDB();
    const countStore = (name: string): Promise<number> =>
      new Promise((resolve) => {
        const tx = db.transaction(name, 'readonly');
        const req = tx.objectStore(name).count();
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => resolve(0);
      });

    const [areas, routes, tiles] = await Promise.all([
      countStore(STORE_AREAS),
      countStore(STORE_ROUTES),
      countStore(STORE_TILES),
    ]);

    // Estimate: tiles ~ 16KB each, routes ~ 12KB each
    const estimatedBytes = tiles * 16384 + routes * 12288 + areas * 2048;

    return {
      visitedAreasCount: areas,
      cachedRoutesCount: routes,
      cachedTilesCount: tiles,
      estimatedStorageBytes: estimatedBytes,
      lastSyncTimestamp: Date.now(),
    };
  } catch {
    return {
      visitedAreasCount: 0,
      cachedRoutesCount: 0,
      cachedTilesCount: 0,
      estimatedStorageBytes: 0,
      lastSyncTimestamp: Date.now(),
    };
  }
}

/**
 * Clear cached data from IndexedDB
 */
export async function clearIndexedDBCache(target: 'tiles' | 'routes' | 'all' = 'all'): Promise<void> {
  const db = await getDB();

  if (target === 'tiles' || target === 'all') {
    await withStore(STORE_TILES, 'readwrite', (store) => store.clear());
  }
  if (target === 'routes' || target === 'all') {
    await withStore(STORE_ROUTES, 'readwrite', (store) => store.clear());
  }
  if (target === 'all') {
    await withStore(STORE_AREAS, 'readwrite', (store) => store.clear());
    await withStore(STORE_GEOCODING, 'readwrite', (store) => store.clear());
  }
}
