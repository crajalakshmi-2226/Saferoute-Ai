import React, { useState, useEffect } from 'react';
import { PlaceAccessibility } from '../../types';
import {
  Building2,
  CheckCircle,
  XCircle,
  HelpCircle,
  Navigation,
  MapPin,
  ShieldCheck,
  Search,
  Sliders,
  Check,
  ChevronRight
} from 'lucide-react';

interface Props {
  onRouteToPlace: (place: PlaceAccessibility) => void;
}

export const PlaceIntelligenceScreen: React.FC<Props> = ({ onRouteToPlace }) => {
  const [places, setPlaces] = useState<PlaceAccessibility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStepFreeOnly, setFilterStepFreeOnly] = useState(false);

  useEffect(() => {
    async function loadPlaces() {
      try {
        const res = await fetch('/api/places');
        if (res.ok) {
          const data = await res.json();
          setPlaces(data.places || []);
        }
      } catch (err) {
        console.warn('Failed to load places:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPlaces();
  }, []);

  const filtered = places.filter((p) => {
    const matchQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStepFree = !filterStepFreeOnly || p.stepFreeAccess;
    return matchQuery && matchStepFree;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Verified Facilities
              </span>
            </div>
            <h1 className="text-lg font-extrabold text-white mt-0.5">Place Accessibility Directory</h1>
            <p className="text-xs text-slate-400">
              Audit data on step-free access, ramps, elevators, door clearances, and accessible restrooms.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stations, libraries, civic buildings..."
            className="w-full rounded-2xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 pl-10"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        <button
          onClick={() => setFilterStepFreeOnly((prev) => !prev)}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold border transition ${
            filterStepFreeOnly
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>Step-Free Only</span>
        </button>
      </div>

      {/* Directory Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading verified facilities...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-slate-900 border border-slate-800">
            No facilities found matching your criteria.
          </div>
        ) : (
          filtered.map((place) => (
            <div
              key={place.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-md space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {place.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Verified: {place.verifiedDate}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-1">{place.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{place.address}</span>
                  </p>
                </div>

                <button
                  onClick={() => onRouteToPlace(place)}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 text-xs shadow-md transition shrink-0 active:scale-95"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Route Here</span>
                </button>
              </div>

              {/* Physical Accessibility Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2">
                  {place.stepFreeAccess ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-slate-200 text-[11px]">Step-Free Access</div>
                    <span className="text-[10px] text-slate-400">{place.stepFreeAccess ? 'Verified' : 'Steps Present'}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2">
                  {place.rampAvailable ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-slate-200 text-[11px]">Ramp Available</div>
                    <span className="text-[10px] text-slate-400">{place.rampAvailable ? 'ADA Standard' : 'No Ramp'}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2">
                  {place.elevatorAvailable ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-slate-200 text-[11px]">Elevator Lift</div>
                    <span className="text-[10px] text-slate-400">{place.elevatorAvailable ? 'Operational' : 'None'}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2">
                  {place.accessibleRestroom ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-slate-200 text-[11px]">ADA Restroom</div>
                    <span className="text-[10px] text-slate-400">{place.accessibleRestroom ? 'Equipped' : 'Not Accessible'}</span>
                  </div>
                </div>
              </div>

              {/* Extra specifications & Source */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-3">
                  <span>Door Width: <strong className="text-slate-200">{place.doorwayWidthCm}cm</strong></span>
                  <span>Tactile: <strong className="text-slate-200">{place.tactilePaving ? 'Yes' : 'No'}</strong></span>
                  <span>Braille: <strong className="text-slate-200">{place.brailleSignage ? 'Yes' : 'No'}</strong></span>
                </div>
                <span className="text-slate-500 font-mono text-[10px]">
                  Audit: {place.dataSource}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
