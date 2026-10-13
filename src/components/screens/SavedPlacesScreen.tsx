import React, { useState } from 'react';
import { SavedPlace, JourneyHistoryItem, Coordinates } from '../../types';
import {
  Bookmark,
  MapPin,
  Clock,
  Plus,
  Navigation,
  Trash2,
  X,
  Footprints,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface Props {
  savedPlaces: SavedPlace[];
  recentJourneys: JourneyHistoryItem[];
  onSelectPlaceToRoute: (place: SavedPlace) => void;
  onAddSavedPlace: (place: Omit<SavedPlace, 'id'>) => void;
  onDeleteSavedPlace: (id: string) => void;
  currentLocation?: Coordinates;
}

export const SavedPlacesScreen: React.FC<Props> = ({
  savedPlaces,
  recentJourneys,
  onSelectPlaceToRoute,
  onAddSavedPlace,
  onDeleteSavedPlace,
  currentLocation,
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'recent'>('saved');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [icon, setIcon] = useState<SavedPlace['icon']>('bookmark');
  const [lat, setLat] = useState<string>(currentLocation ? currentLocation.lat.toString() : '37.779');
  const [lng, setLng] = useState<string>(currentLocation ? currentLocation.lng.toString() : '-122.416');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;

    onAddSavedPlace({
      name,
      address,
      icon,
      coordinates: {
        lat: parseFloat(lat) || 37.779,
        lng: parseFloat(lng) || -122.416,
      },
    });

    setName('');
    setAddress('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">Saved Places & Recent Journeys</h1>
            <p className="text-xs text-slate-400">
              One-tap accessible route planning to frequent destinations and history
            </p>
          </div>
        </div>

        {activeTab === 'saved' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 text-xs shadow-md transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Place</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'saved'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-rose-400" />
          <span>Saved Places ({savedPlaces.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recent')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'recent'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>Recent Journeys ({recentJourneys.length})</span>
        </button>
      </div>

      {/* Tab 1: Saved Places */}
      {activeTab === 'saved' && (
        <div className="space-y-3">
          {savedPlaces.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-slate-900 border border-slate-800">
              No saved places added yet. Click &quot;Add Place&quot; above to bookmark your home, clinic, or station.
            </div>
          ) : (
            savedPlaces.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3 shadow-md"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2.5 rounded-xl bg-slate-800 text-rose-400 border border-slate-700 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-white truncate">{p.name}</h3>
                    <p className="text-xs text-slate-400 truncate">{p.address}</p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {p.coordinates.lat.toFixed(4)}, {p.coordinates.lng.toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSelectPlaceToRoute(p)}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Route</span>
                  </button>

                  <button
                    onClick={() => onDeleteSavedPlace(p.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                    title="Delete saved place"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Recent Journeys */}
      {activeTab === 'recent' && (
        <div className="space-y-3">
          {recentJourneys.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-slate-900 border border-slate-800">
              No recent journeys recorded yet. Complete a navigation session to view your travel log.
            </div>
          ) : (
            recentJourneys.map((j) => (
              <div
                key={j.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                        {j.mobilityProfileUsed}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(j.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1">
                      {j.originName} → {j.destinationName}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Score: {j.suitabilityScore}/100
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 font-mono pt-1">
                  <span>{(j.distanceMeters / 1000).toFixed(2)} km</span>
                  <span>•</span>
                  <span>{j.durationMinutes} min walk</span>
                  <span>•</span>
                  <span>{j.barriersEncounteredCount} obstacles bypassed</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Place Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-rose-400" />
                <span>Bookmark Accessible Place</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Place Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Home, Physical Therapy Clinic, Central Library"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 100 Civic Center Plaza, Suite 200"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Latitude</label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Longitude</label>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-bold text-white shadow-md transition"
                >
                  Save Place
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
