import React, { useState, useEffect, useMemo } from 'react';
import { Coordinates, OfflineMapPack, DownloadProgress } from '../types';
import {
  Download,
  CloudDownload,
  HardDrive,
  Wifi,
  WifiOff,
  CheckCircle2,
  Trash2,
  RefreshCw,
  MapPin,
  Layers,
  ShieldCheck,
  AlertCircle,
  X,
  Sliders,
  Locate,
  Info,
  Radio,
  FileCheck,
  Eye,
} from 'lucide-react';
import {
  POPULAR_CITIES,
  CityPreset,
  detectCurrentCity,
  generateTileTargets,
  getStoredOfflinePacks,
  downloadOfflineMapPack,
  deleteOfflineMapPack,
  clearAllOfflineMaps,
  getOfflineStorageEstimate,
  cancelActiveDownload,
  isOfflineSimulated,
  setOfflineSimulated,
} from '../services/offlineMapService';

interface Props {
  currentLocation?: Coordinates;
  onUseCurrentLocation?: () => void;
  isLocating?: boolean;
}

export const OfflineMapsSection: React.FC<Props> = ({
  currentLocation,
  onUseCurrentLocation,
  isLocating = false,
}) => {
  const [offlinePacks, setOfflinePacks] = useState<OfflineMapPack[]>([]);
  const [selectedCityPreset, setSelectedCityPreset] = useState<CityPreset>(POPULAR_CITIES[0]);
  const [customCityName, setCustomCityName] = useState('');
  const [customCountry, setCustomCountry] = useState('');
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(4.0);
  const [storageStats, setStorageStats] = useState<{ usageMB: number; totalPacks: number }>({
    usageMB: 0,
    totalPacks: 0,
  });

  // Offline status & simulation
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);

  // Active download state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Preview pack modal
  const [previewPack, setPreviewPack] = useState<OfflineMapPack | null>(null);

  // Initial load
  useEffect(() => {
    refreshPacks();
    setSimulatedOffline(isOfflineSimulated());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshPacks = async () => {
    const packs = getStoredOfflinePacks();
    setOfflinePacks(packs);
    const stats = await getOfflineStorageEstimate();
    setStorageStats(stats);
  };

  // When GPS location updates or arrives, detect city
  useEffect(() => {
    if (currentLocation) {
      detectCurrentCity(currentLocation).then((res) => {
        if (res.matchedPreset) {
          setSelectedCityPreset(res.matchedPreset);
          setSelectedRadiusKm(res.matchedPreset.recommendedRadiusKm);
        } else {
          setCustomCityName(res.cityName);
          setCustomCountry(res.countryOrState);
        }
      });
    }
  }, [currentLocation]);

  // Active target center & name for download
  const targetConfig = useMemo(() => {
    if (customCityName.trim() && currentLocation) {
      return {
        name: customCityName.trim(),
        countryOrState: customCountry || 'Detected Location',
        center: currentLocation,
        isGps: true,
      };
    }
    return {
      name: selectedCityPreset.name,
      countryOrState: `${selectedCityPreset.region}, ${selectedCityPreset.country}`,
      center: selectedCityPreset.center,
      isGps: false,
    };
  }, [selectedCityPreset, customCityName, customCountry, currentLocation]);

  // Calculate estimated tiles and size
  const tileEstimates = useMemo(() => {
    const { tiles } = generateTileTargets(targetConfig.center, selectedRadiusKm, [12, 13, 14]);
    const tileCount = tiles.length;
    const estimatedSizeBytes = tileCount * 17000; // ~17KB per tile average
    const estimatedMB = (estimatedSizeBytes / (1024 * 1024)).toFixed(1);
    return { tileCount, estimatedMB };
  }, [targetConfig.center, selectedRadiusKm]);

  // Check if current target is already downloaded
  const existingPackForTarget = offlinePacks.find(
    (p) => p.cityName.toLowerCase() === targetConfig.name.toLowerCase() && p.status === 'ready'
  );

  // Handle Download trigger
  const handleStartDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    setSuccessMessage(null);

    try {
      const pack = await downloadOfflineMapPack(
        targetConfig.name,
        targetConfig.countryOrState,
        targetConfig.center,
        selectedRadiusKm,
        [12, 13, 14],
        (progress) => {
          setDownloadProgress(progress);
        }
      );

      setSuccessMessage(
        `Offline map pack for ${pack.cityName} downloaded successfully (${(
          pack.sizeBytes /
          (1024 * 1024)
        ).toFixed(1)} MB, ${pack.tileCount} tiles).`
      );
      await refreshPacks();
    } catch (err: any) {
      if (err.message?.includes('cancelled')) {
        setDownloadError('Download was cancelled.');
      } else {
        setDownloadError(
          err.message || 'Failed to download offline tiles. Please check your connection.'
        );
      }
    } finally {
      setIsDownloading(false);
      setTimeout(() => {
        setDownloadProgress(null);
      }, 3500);
    }
  };

  const handleCancelDownload = () => {
    cancelActiveDownload();
    setIsDownloading(false);
    setDownloadProgress(null);
    setDownloadError('Download cancelled.');
  };

  const handleDeletePack = async (packId: string) => {
    await deleteOfflineMapPack(packId);
    await refreshPacks();
  };

  const handleClearAll = async () => {
    if (window.confirm('Delete all downloaded offline map packages? This will free cached space.')) {
      await clearAllOfflineMaps();
      await refreshPacks();
      setSuccessMessage('All offline map caches cleared.');
    }
  };

  const handleToggleSimulatedOffline = () => {
    const next = !simulatedOffline;
    setSimulatedOffline(next);
    setOfflineSimulated(next);
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-600/15 text-cyan-400 border border-cyan-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Download Offline Maps</h2>
              <span className="rounded-full bg-cyan-500/15 text-cyan-300 text-[10px] font-bold px-2 py-0.5 border border-cyan-500/30">
                PWA Local Cache
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cache street geometry & vector tiles to maintain turn-by-turn navigation without cellular connectivity
            </p>
          </div>
        </div>

        {/* Real-time Network Indicator & Offline Test Switch */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              simulatedOffline || !isOnline
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {simulatedOffline || !isOnline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>{simulatedOffline ? 'Simulated Offline' : 'Offline'}</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Online (4G/WiFi)</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleToggleSimulatedOffline}
            title="Toggle offline test mode"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 border border-slate-700 transition cursor-pointer"
          >
            <Radio className="w-3 h-3 text-cyan-400" />
            <span>{simulatedOffline ? 'Disable Sim' : 'Test Offline'}</span>
          </button>
        </div>
      </div>

      {/* Target City Selector & GPS Detection */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Select Target Region or Current City</span>
          </label>

          {onUseCurrentLocation && (
            <button
              type="button"
              onClick={onUseCurrentLocation}
              disabled={isLocating}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition font-semibold cursor-pointer disabled:opacity-50"
            >
              <Locate className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting GPS...' : 'Detect My City (GPS)'}</span>
            </button>
          )}
        </div>

        {/* Quick Popular City Pills */}
        <div className="flex flex-wrap gap-2">
          {POPULAR_CITIES.map((city) => {
            const isSelected =
              !customCityName && selectedCityPreset.id === city.id;
            const isDownloaded = offlinePacks.some(
              (p) => p.cityName.toLowerCase() === city.name.toLowerCase() && p.status === 'ready'
            );

            return (
              <button
                key={city.id}
                type="button"
                onClick={() => {
                  setSelectedCityPreset(city);
                  setCustomCityName('');
                  setSelectedRadiusKm(city.recommendedRadiusKm);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                    : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{city.name}</span>
                {isDownloaded && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected City Details & Coverage Radius */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{targetConfig.name}</h3>
                <span className="text-[11px] text-slate-400">({targetConfig.countryOrState})</span>
                {existingPackForTarget && (
                  <span className="rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold px-2 py-0.5 border border-emerald-500/30">
                    Offline Ready
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Center: {targetConfig.center.lat.toFixed(4)}°N, {targetConfig.center.lng.toFixed(4)}°E
              </p>
            </div>

            {/* Estimated Size & Tile Metric */}
            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Est. Tiles</span>
                <span className="font-mono text-cyan-400 font-bold">{tileEstimates.tileCount}</span>
              </div>
              <div className="text-right border-l border-slate-800 pl-4">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Storage Size</span>
                <span className="font-mono text-white font-bold">~{tileEstimates.estimatedMB} MB</span>
              </div>
            </div>
          </div>

          {/* Coverage Radius Slider */}
          <div className="space-y-1.5 pt-1 border-t border-slate-900">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Coverage Radius</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">{selectedRadiusKm.toFixed(1)} km</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="7.0"
              step="0.5"
              value={selectedRadiusKm}
              disabled={isDownloading}
              onChange={(e) => setSelectedRadiusKm(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>2 km (Downtown Core)</span>
              <span>4.5 km (Metropolitan Grid)</span>
              <span>7 km (Extended Suburbs)</span>
            </div>
          </div>

          {/* Download Action Button */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {!isDownloading ? (
              <button
                type="button"
                onClick={handleStartDownload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>
                  {existingPackForTarget
                    ? `Update Offline Map for ${targetConfig.name}`
                    : `Download Offline Map for ${targetConfig.name}`}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelDownload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Cancel Download</span>
              </button>
            )}

            {existingPackForTarget && (
              <button
                type="button"
                onClick={() => setPreviewPack(existingPackForTarget)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Inspect Cached Boundaries</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Download Progress Bar */}
      {isDownloading && downloadProgress && (
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="font-bold text-white">
                Downloading {downloadProgress.cityName}...
              </span>
            </div>
            <span className="font-mono text-cyan-300 font-bold">{downloadProgress.percent}%</span>
          </div>

          {/* Visual Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-cyan-900/50">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full transition-all duration-200"
              style={{ width: `${downloadProgress.percent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>{downloadProgress.currentStage}</span>
            <span>
              {downloadProgress.completedTiles} / {downloadProgress.totalTiles} tiles
            </span>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && !isDownloading && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Cache Synchronized</p>
            <p className="text-[11px] text-emerald-400/90">{successMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error Notification */}
      {downloadError && !isDownloading && (
        <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Download Notice</p>
            <p className="text-[11px] text-rose-400/90">{downloadError}</p>
          </div>
          <button
            type="button"
            onClick={() => setDownloadError(null)}
            className="text-rose-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Downloaded Packages Inventory */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Downloaded Regions ({offlinePacks.length})
            </h3>
          </div>

          {offlinePacks.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-rose-400 hover:text-rose-300 transition flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear All Maps</span>
            </button>
          )}
        </div>

        {offlinePacks.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-2">
            <CloudDownload className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-xs font-bold text-slate-300">No Offline Map Packs Cached</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Select your city above and click &quot;Download Offline Map&quot; to enable full navigation in low-signal areas, underground concourses, or offline transit stations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {offlinePacks.map((pack) => (
              <div
                key={pack.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-600/15 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{pack.cityName}</h4>
                      <p className="text-[10px] text-slate-400">{pack.countryOrState}</p>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-500/15 text-emerald-400 text-[9px] font-bold px-2 py-0.5 border border-emerald-500/30 shrink-0">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1 border-y border-slate-900 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-500 block">Radius</span>
                    <span className="text-slate-300 font-bold">{pack.radiusKm} km</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tiles</span>
                    <span className="text-cyan-400 font-bold">{pack.tileCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Size</span>
                    <span className="text-white font-bold">
                      {(pack.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>Downloaded: {new Date(pack.downloadedAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewPack(pack)}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                    >
                      Inspect
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePack(pack.id)}
                      className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Storage & Architecture Transparency */}
      <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-300">
            Offline Storage: {storageStats.usageMB} MB cached locally
          </p>
          <p className="text-slate-500 leading-relaxed">
            All map tiles and vector geometry are saved in browser CacheStorage under{' '}
            <code>saferoute-offline-tiles-v1</code>. Our Service Worker automatically intercepts GIS requests to serve cached tiles with zero cellular data latency.
          </p>
        </div>
      </div>

      {/* Modal: Inspect Cached Boundaries */}
      {previewPack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  Offline Package Details: {previewPack.cityName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPack(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Coverage Radius:</span>
                  <span className="font-mono text-white font-bold">{previewPack.radiusKm} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tile Count:</span>
                  <span className="font-mono text-cyan-400 font-bold">{previewPack.tileCount} tiles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cache Size:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {(previewPack.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Zoom Levels:</span>
                  <span className="font-mono text-white">
                    {previewPack.zoomLevels.join(', ')} (Walking & Street)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Download Date:</span>
                  <span className="text-slate-300">
                    {new Date(previewPack.downloadedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {previewPack.bounds && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-[11px] font-mono">
                  <span className="text-slate-400 font-sans block text-xs font-bold mb-1">
                    Geographic Bounding Box:
                  </span>
                  <div className="text-slate-300">
                    Lat: {previewPack.bounds.minLat.toFixed(4)}° to {previewPack.bounds.maxLat.toFixed(4)}°
                  </div>
                  <div className="text-slate-300">
                    Lng: {previewPack.bounds.minLng.toFixed(4)}° to {previewPack.bounds.maxLng.toFixed(4)}°
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewPack(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
