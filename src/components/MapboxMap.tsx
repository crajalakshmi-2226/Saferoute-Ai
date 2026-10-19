import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { RouteAlternative, Coordinates, BarrierReport } from '../types';
import { getMapboxToken } from '../services/mapboxService';
import { AlertCircle, Key, Locate, Layers, ShieldAlert, HardDrive, WifiOff, Zap } from 'lucide-react';
import { isCoordinateCoveredByOfflineMap, isOfflineSimulated } from '../services/offlineMapService';
import { OfflineMapPack } from '../types';

interface Props {
  currentLocation?: Coordinates;
  destinationCoordinates?: Coordinates;
  routes: RouteAlternative[];
  selectedRouteIndex: number;
  onSelectRouteIndex?: (index: number) => void;
  barriers?: BarrierReport[];
  onOpenTokenSetup: () => void;
  className?: string;
  theme?: 'light' | 'dark' | 'system';
  batterySaver?: boolean;
}

export const MapboxMap: React.FC<Props> = ({
  currentLocation,
  destinationCoordinates,
  routes,
  selectedRouteIndex,
  onSelectRouteIndex,
  barriers = [],
  onOpenTokenSetup,
  className = 'h-[400px] w-full',
  theme = 'dark',
  batterySaver = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [activeOfflinePack, setActiveOfflinePack] = useState<OfflineMapPack | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const token = getMapboxToken();

  useEffect(() => {
    if (!token) {
      setTokenError('Mapbox access token is missing. Please configure your public token to view the interactive map.');
      return;
    }

    setTokenError(null);
    mapboxgl.accessToken = token;

    if (!mapContainerRef.current) return;

    // Choose map style based on theme
    const styleUri = theme === 'light'
      ? 'mapbox://styles/mapbox/light-v11'
      : 'mapbox://styles/mapbox/dark-v11';

    const defaultCenter: [number, number] = currentLocation
      ? [currentLocation.lng, currentLocation.lat]
      : [-122.4194, 37.7749]; // San Francisco baseline

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: styleUri,
      center: defaultCenter,
      zoom: 14,
      pitch: batterySaver ? 0 : 30,
      fadeDuration: batterySaver ? 0 : 300,
      attributionControl: true,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

    map.on('load', () => {
      setIsMapLoaded(true);
    });

    map.on('error', (e: any) => {
      if (e?.error?.status === 401 || e?.error?.message?.includes('Forbidden')) {
        setTokenError('Invalid Mapbox access token or unauthorized URL origin. Please check your token settings.');
      }
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      setIsMapLoaded(false);
    };
  }, [token, theme]);

  // Update Markers & Layers when routes, location, or barriers change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // 1. Current Location Marker
    if (currentLocation) {
      const el = document.createElement('div');
      el.className = 'user-location-marker relative flex items-center justify-center';
      el.innerHTML = `
        <div class="h-6 w-6 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center user-beacon">
          <div class="h-2 w-2 rounded-full bg-white"></div>
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([currentLocation.lng, currentLocation.lat])
        .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML('<strong>Your Real Location</strong>'))
        .addTo(map);

      markersRef.current.push(marker);
    }

    // 2. Destination Marker
    if (destinationCoordinates) {
      const el = document.createElement('div');
      el.className = 'dest-marker relative flex items-center justify-center';
      el.innerHTML = `
        <div class="h-7 w-7 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          </svg>
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([destinationCoordinates.lng, destinationCoordinates.lat])
        .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML('<strong>Destination</strong>'))
        .addTo(map);

      markersRef.current.push(marker);
    }

    // 3. Known Barrier Markers
    barriers.forEach((b) => {
      const el = document.createElement('div');
      el.className = 'barrier-marker relative cursor-pointer';
      const bgColor = b.severity === 'impassable' ? '#ef4444' : b.severity === 'high' ? '#f97316' : '#eab308';
      el.innerHTML = `
        <div style="background-color: ${bgColor}" class="h-6 w-6 rounded-full border border-white/80 shadow-md flex items-center justify-center text-white text-[10px] font-bold">
          !
        </div>
      `;

      const popupHtml = `
        <div class="text-xs">
          <div class="font-bold text-slate-100 flex items-center gap-1">
            <span>${b.title}</span>
          </div>
          <p class="text-slate-300 mt-1">${b.description}</p>
          <div class="mt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>Severity: <strong class="uppercase text-amber-400">${b.severity}</strong></span>
            <span>${b.confirmations} confirmations</span>
          </div>
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([b.lng, b.lat])
        .setPopup(new mapboxgl.Popup({ offset: 12 }).setHTML(popupHtml))
        .addTo(map);

      markersRef.current.push(marker);
    });

    // 4. Draw Route Polylines
    // Clean up existing route layers
    for (let i = 0; i < 5; i++) {
      if (map.getLayer(`route-layer-${i}`)) map.removeLayer(`route-layer-${i}`);
      if (map.getSource(`route-source-${i}`)) map.removeSource(`route-source-${i}`);
    }

    if (routes && routes.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();

      routes.forEach((route, idx) => {
        const isSelected = idx === selectedRouteIndex;
        const sourceId = `route-source-${idx}`;
        const layerId = `route-layer-${idx}`;

        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: { index: idx },
            geometry: route.geometry,
          },
        });

        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': isSelected ? '#2563eb' : '#64748b',
            'line-width': isSelected ? 6 : 4,
            'line-opacity': isSelected ? 0.95 : 0.6,
          },
        });

        // Add bounds
        route.geometry.coordinates.forEach((coord) => {
          bounds.extend(coord as [number, number]);
        });

        // Click on route polyline to select
        map.on('click', layerId, () => {
          if (onSelectRouteIndex) {
            onSelectRouteIndex(idx);
          }
        });
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 16 });
      }
    } else if (currentLocation && destinationCoordinates) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([currentLocation.lng, currentLocation.lat]);
      bounds.extend([destinationCoordinates.lng, destinationCoordinates.lat]);
      map.fitBounds(bounds, { padding: 70, maxZoom: 16 });
    } else if (currentLocation) {
      map.flyTo({ center: [currentLocation.lng, currentLocation.lat], zoom: 15 });
    }
  }, [routes, selectedRouteIndex, currentLocation, destinationCoordinates, barriers, isMapLoaded]);

  const handleCenterOnUser = () => {
    if (mapRef.current && currentLocation) {
      mapRef.current.flyTo({
        center: [currentLocation.lng, currentLocation.lat],
        zoom: 16,
        essential: true,
      });
    }
  };

  // Listen to network status and offline coverage
  useEffect(() => {
    const updateOfflineState = () => {
      const simulated = isOfflineSimulated();
      const offline = !navigator.onLine || simulated;
      setIsOfflineMode(offline);

      const targetCoord = currentLocation || (routes[0]?.geometry?.coordinates[0] ? {
        lng: routes[0].geometry.coordinates[0][0],
        lat: routes[0].geometry.coordinates[0][1],
      } : undefined);

      if (targetCoord) {
        const coverage = isCoordinateCoveredByOfflineMap(targetCoord);
        setActiveOfflinePack(coverage.isCovered && coverage.pack ? coverage.pack : null);
      }
    };

    updateOfflineState();
    window.addEventListener('online', updateOfflineState);
    window.addEventListener('offline', updateOfflineState);
    window.addEventListener('saferoute:offline-simulation-changed', updateOfflineState);

    return () => {
      window.removeEventListener('online', updateOfflineState);
      window.removeEventListener('offline', updateOfflineState);
      window.removeEventListener('saferoute:offline-simulation-changed', updateOfflineState);
    };
  }, [currentLocation, routes]);

  // Dynamically ease pitch to flat 0 in battery saver mode to reduce WebGL rendering
  useEffect(() => {
    if (mapRef.current && isMapLoaded) {
      try {
        mapRef.current.easeTo({
          pitch: batterySaver ? 0 : 30,
          duration: 350,
        });
      } catch {}
    }
  }, [batterySaver, isMapLoaded]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 ${className}`}>
      {/* Mapbox Canvas */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Floating Center On Location Button */}
      {currentLocation && isMapLoaded && (
        <button
          onClick={handleCenterOnUser}
          className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/90 text-slate-200 border border-slate-700 shadow-lg hover:bg-slate-800 active:scale-95 transition"
          title="Center on my location"
        >
          <Locate className="h-5 w-5 text-blue-400" />
        </button>
      )}

      {/* Floating Offline Map Badge */}
      {(activeOfflinePack || isOfflineMode) && (
        <div className="absolute bottom-4 left-4 z-10 rounded-xl bg-slate-900/95 border border-cyan-500/40 px-3 py-1.5 backdrop-blur-md shadow-lg flex items-center gap-2 text-[11px]">
          {isOfflineMode ? (
            <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          ) : (
            <HardDrive className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          )}
          <span className="text-slate-200 font-medium">
            {activeOfflinePack
              ? `Offline Ready (${activeOfflinePack.cityName})`
              : 'Offline Map Cache Active'}
          </span>
        </div>
      )}

      {/* Active Route Floating Badge */}
      {routes.length > 0 && routes[selectedRouteIndex] && (
        <div className="absolute top-3 left-3 z-10 rounded-xl bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 backdrop-blur-md shadow-lg flex items-center gap-2 text-xs">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="font-semibold text-slate-100">{routes[selectedRouteIndex].name}</span>
          <span className="text-slate-400 font-mono">
            {routes[selectedRouteIndex].distanceMeters}m · {routes[selectedRouteIndex].durationMinutes} min
          </span>
        </div>
      )}

      {/* Battery Saver Eco Mode Badge */}
      {batterySaver && (
        <div className="absolute top-3 right-14 z-10 rounded-xl bg-emerald-950/90 border border-emerald-500/40 px-2.5 py-1 backdrop-blur-md shadow-lg flex items-center gap-1.5 text-[11px] text-emerald-300">
          <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="font-semibold">Eco 2D Mode</span>
        </div>
      )}

      {/* Missing or Invalid Token Overlay Banner */}
      {tokenError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 p-6 text-center backdrop-blur-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-3">
            <Key className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Mapbox Token Required</h3>
          <p className="max-w-md text-xs text-slate-300 leading-relaxed mb-4">
            {tokenError}
          </p>
          <button
            onClick={onOpenTokenSetup}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 px-5 py-2.5 text-xs font-semibold text-white shadow-md transition"
          >
            <Key className="w-4 h-4" />
            <span>Configure Mapbox Token</span>
          </button>
        </div>
      )}
    </div>
  );
};
