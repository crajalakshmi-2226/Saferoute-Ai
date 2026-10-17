import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  ExternalLink,
  ShieldAlert,
  Search,
  Filter,
  Locate,
  CheckCircle2,
  Building2,
  HeartPulse,
  Pill,
  Scale,
  Users,
  Compass,
  Map as MapIcon,
  List
} from 'lucide-react';
import { TRANSLATIONS, Language } from '../../utils/translations';
import { Coordinates } from '../../types';
import { requestCurrentPosition } from '../../services/locationService';
import {
  VERIFIED_HELP_PLACES,
  NearbyHelpPlace,
  getDistanceMeters,
  formatDistance,
} from '../../data/nearbyHelpData';

interface Props {
  language: Language;
  currentLocation?: Coordinates;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
  onPlanRouteToDestination: (destCoords: Coordinates, destName: string) => void;
  initialCategory?: string;
}

export const NearbyHelpScreen: React.FC<Props> = ({
  language,
  currentLocation,
  onUseCurrentLocation,
  isLocating,
  onPlanRouteToDestination,
  initialCategory,
}) => {
  const t = TRANSLATIONS[language];

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'all');
  const [maxDistanceMeters, setMaxDistanceMeters] = useState<number>(15000); // 15 km default
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Manual city reference if user denies GPS (defaults to Chennai Central / Tamil Nadu hub)
  const effectiveLocation: Coordinates = currentLocation || {
    lat: 13.0827,
    lng: 80.2707,
  };

  const categories = [
    { id: 'all', label: t.allFilter, icon: Compass },
    { id: 'police', label: t.policeFilter, icon: ShieldAlert },
    { id: 'women_police', label: t.awpsFilter, icon: Users },
    { id: 'hospital', label: t.hospitalFilter, icon: HeartPulse },
    { id: 'pharmacy', label: t.pharmacyFilter, icon: Pill },
    { id: 'legal_aid', label: t.legalAidFilter, icon: Scale },
    { id: 'civic_office', label: t.civicFilter, icon: Building2 },
  ];

  // Filter and sort verified places
  const filteredPlaces = VERIFIED_HELP_PLACES.map((place) => {
    const dist = getDistanceMeters(
      effectiveLocation.lat,
      effectiveLocation.lng,
      place.lat,
      place.lng
    );
    return {
      ...place,
      distanceMeters: dist,
    };
  })
    .filter((place) => {
      if (activeCategory !== 'all' && place.category !== activeCategory) {
        return false;
      }
      if (place.distanceMeters > maxDistanceMeters) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName =
          place.name.toLowerCase().includes(q) ||
          place.nameTamil.toLowerCase().includes(q);
        const matchesAddr =
          place.address.toLowerCase().includes(q) ||
          place.addressTamil.toLowerCase().includes(q);
        const matchesServ = place.servicesAvailable.some((s) =>
          s.toLowerCase().includes(q)
        );
        return matchesName || matchesAddr || matchesServ;
      }
      return true;
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white">
              {t.nearbyHelpTitle}
            </h1>
            <p className="text-xs text-slate-400">
              {t.nearbyHelpSubtitle}
            </p>
          </div>
        </div>

        {/* Location Status & Trigger */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-slate-300">
              {currentLocation
                ? `Using Your Live GPS (${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)})`
                : 'Using Tamil Nadu Central Reference (Tap below to activate GPS)'}
            </span>
          </div>

          <button
            onClick={onUseCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Locate className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Acquiring GPS...' : t.useCurrentGps}</span>
          </button>
        </div>
      </div>

      {/* Search & Distance Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchNearbyPlaceholder}
              className="w-full rounded-2xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-1.5 text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={maxDistanceMeters}
                onChange={(e) => setMaxDistanceMeters(Number(e.target.value))}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value={2000} className="bg-slate-900">Within 2 km</option>
                <option value={5000} className="bg-slate-900">Within 5 km</option>
                <option value={10000} className="bg-slate-900">Within 10 km</option>
                <option value={25000} className="bg-slate-900">Within 25 km</option>
                <option value={100000} className="bg-slate-900">All Region</option>
              </select>
            </div>

            {/* View toggle */}
            <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'map' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
                title="Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map View Mode (Preview representation) */}
      {viewMode === 'map' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Verified Map Points ({filteredPlaces.length})
            </span>
            <span className="text-[11px] text-blue-400">
              Pins reflect actual verified station and hospital coordinates
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredPlaces.map((place) => (
              <div
                key={place.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2 hover:border-blue-500/50 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-white text-xs truncate">
                    {language === 'ta' ? place.nameTamil : place.name}
                  </span>
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full shrink-0">
                    {formatDistance(place.distanceMeters)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {language === 'ta' ? place.addressTamil : place.address}
                </p>
                <div className="flex items-center justify-between pt-1">
                  {place.phone ? (
                    <a
                      href={`tel:${place.phone.replace(/[^0-9]/g, '')}`}
                      className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{place.phone}</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-500">Phone not listed</span>
                  )}
                  <button
                    onClick={() =>
                      onPlanRouteToDestination(
                        { lat: place.lat, lng: place.lng },
                        language === 'ta' ? place.nameTamil : place.name
                      )
                    }
                    className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Route</span>
                    <Navigation className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View Mode */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredPlaces.length === 0 ? (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center text-slate-400 text-xs space-y-2">
              <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-300">
                {language === 'ta'
                  ? 'தேர்ந்தெடுக்கப்பட்ட தூரத்திற்குள் சேவைகள் எதுவும் காணப்படவில்லை.'
                  : 'No verified emergency or public help centers found matching your filters.'}
              </p>
              <p className="text-[11px]">
                {language === 'ta'
                  ? 'வடிப்பானை மாற்றவும் அல்லது அதிகபட்ச தூரத்தை அதிகரிக்கவும்.'
                  : 'Try selecting a larger distance radius or clear the search query.'}
              </p>
            </div>
          ) : (
            filteredPlaces.map((place) => (
              <div
                key={place.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-5 hover:border-slate-700 transition shadow-md space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                        {place.category.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Verified Official
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      {language === 'ta' ? place.nameTamil : place.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{language === 'ta' ? place.addressTamil : place.address}</span>
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="inline-block px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-blue-300">
                      {formatDistance(place.distanceMeters)} away
                    </span>
                  </div>
                </div>

                {/* Hours and Services */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {t.operatingHours}:{' '}
                      <strong className="text-slate-200">
                        {language === 'ta' ? place.operatingHoursTamil : place.operatingHours}
                      </strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {place.servicesAvailable.slice(0, 3).map((serv, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800"
                      >
                        {serv}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions: Call & Directions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    {place.phone && (
                      <a
                        href={`tel:${place.phone.replace(/[^0-9]/g, '')}`}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer active:scale-95"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{t.callNow}: {place.phone}</span>
                      </a>
                    )}

                    {place.emergencyPhone && (
                      <a
                        href={`tel:${place.emergencyPhone}`}
                        className="flex items-center gap-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-xs px-3 py-2 rounded-xl border border-rose-500/30 transition cursor-pointer"
                      >
                        <span>SOS: {place.emergencyPhone}</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        onPlanRouteToDestination(
                          { lat: place.lat, lng: place.lng },
                          language === 'ta' ? place.nameTamil : place.name
                        )
                      }
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer active:scale-95"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{t.getDirections}</span>
                    </button>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        place.googleMapsQuery
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-3 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
                    >
                      <span>{t.openGoogleMaps}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
