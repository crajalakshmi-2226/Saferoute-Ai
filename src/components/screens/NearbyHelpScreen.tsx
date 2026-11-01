import React, { useState } from 'react';
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
  List,
  Mail,
  Store,
  ShoppingBag,
  Footprints,
  Bike,
  Car,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { TRANSLATIONS, Language } from '../../utils/translations';
import { Coordinates } from '../../types';
import { requestCurrentPosition } from '../../services/locationService';
import {
  VERIFIED_HELP_PLACES,
  NearbyHelpPlace,
  formatDistance,
} from '../../data/nearbyHelpData';
import { enrichNearbyPlace, NearbyPlaceEnriched } from '../../services/nearbyPlacesService';
import { NearbyPlaceCard } from '../NearbyPlaceCard';

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
  const isTamil = language === 'ta';

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'all');
  const [maxDistanceMeters, setMaxDistanceMeters] = useState<number>(15000); // 15 km default
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Effective location: Live GPS or default reference
  const effectiveLocation: Coordinates = currentLocation || {
    lat: 13.0827,
    lng: 80.2707,
  };

  const categories = [
    { id: 'all', label: isTamil ? 'அனைத்து இடங்கள்' : 'All Places', icon: Compass },
    { id: 'hospital', label: isTamil ? 'மருத்துவமனை' : 'Hospitals', icon: HeartPulse },
    { id: 'pharmacy', label: isTamil ? 'மருந்தகம் (24x7)' : 'Medicals / Pharmacy', icon: Pill },
    { id: 'police', label: isTamil ? 'காவல் நிலையம்' : 'Police Station', icon: ShieldAlert },
    { id: 'women_police', label: isTamil ? 'மகளிர் காவல் நிலையம்' : 'Women Police (AWPS)', icon: Users },
    { id: 'post_office', label: isTamil ? 'அஞ்சல் நிலையம்' : 'Post Office', icon: Mail },
    { id: 'shop', label: isTamil ? 'அத்தியாவசிய கடைகள்' : 'Shops & Groceries', icon: Store },
    { id: 'market', label: isTamil ? 'தினசரி சந்தை' : 'Daily Market / Bazaar', icon: ShoppingBag },
    { id: 'hotel', label: isTamil ? 'தங்கும் விடுதி' : 'Safe Stay / Hotel', icon: Building2 },
    { id: 'legal_aid', label: t.legalAidFilter, icon: Scale },
    { id: 'civic_office', label: t.civicFilter, icon: Building2 },
  ];

  // Enrich all verified places with travel times (walk, bike, car), dynamic open hours status & shortcut analysis
  const enrichedPlaces: NearbyPlaceEnriched[] = VERIFIED_HELP_PLACES.map((place) =>
    enrichNearbyPlace(place, effectiveLocation)
  ).sort((a, b) => a.distanceMeters - b.distanceMeters);

  // Filter based on active category & search query
  let filteredPlaces = enrichedPlaces.filter((place) => {
    if (activeCategory !== 'all' && place.category !== activeCategory) {
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
  });

  // Apply distance filter, but if 0 results found (e.g. user is in another city),
  // automatically show closest verified state facilities so user is never left stranded!
  const withinRadius = filteredPlaces.filter((p) => p.distanceMeters <= maxDistanceMeters);
  if (withinRadius.length > 0) {
    filteredPlaces = withinRadius;
  } else {
    filteredPlaces = filteredPlaces.slice(0, 10);
  }

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
              {isTamil ? 'அருகிலுள்ள இடங்கள், அவசர சேவைகள் & குறுக்கு வழி ஆய்வு' : 'Nearby Places, Emergency Help & Shortcut Check'}
            </h1>
            <p className="text-xs text-slate-400">
              {isTamil
                ? 'மருத்துவமனை, மருந்தகம், காவல் நிலையம், அஞ்சல் நிலையம், கடைகள், சந்தை — செல்லும் நேரம், திறந்திருக்கும் நேரம் & குறுக்கு வழியில் படிகள் உள்ளதா என்ற உண்மை விவரங்கள்.'
                : 'Hospitals, medicals, police, post office, shops, markets — reach times, verified open hours & shortcut stair/narrow path analysis.'}
            </p>
          </div>
        </div>

        {/* Location Status & Instant Trigger */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-slate-300">
              {currentLocation
                ? `GPS: (${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}) — Live Location Active`
                : isTamil
                ? 'தமிழ்நாடு முதன்மை இருப்பிடம் (GPS இயக்க கீழே அழுத்தவும்)'
                : 'Using Tamil Nadu Reference (Tap below to activate live GPS)'}
            </span>
          </div>

          <button
            onClick={onUseCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Locate className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? (isTamil ? 'GPS தேடுகிறது...' : 'Acquiring GPS...') : t.useCurrentGps}</span>
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
              placeholder={
                isTamil
                  ? 'மருத்துவமனை, அஞ்சல் நிலையம், கடை, சந்தை, காவல் நிலையம் தேடுக...'
                  : 'Search hospital, pharmacy, post office, shops, market...'
              }
              className="w-full rounded-2xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
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
                <option value={2000} className="bg-slate-900">Within 2 km (2 கி.மீக்குள்)</option>
                <option value={5000} className="bg-slate-900">Within 5 km (5 கி.மீக்குள்)</option>
                <option value={10000} className="bg-slate-900">Within 10 km (10 கி.மீக்குள்)</option>
                <option value={25000} className="bg-slate-900">Within 25 km (25 கி.மீக்குள்)</option>
                <option value={100000} className="bg-slate-900">All Region (அனைத்தும்)</option>
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
                className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map View Mode (Preview representation with travel times & open badges) */}
      {viewMode === 'map' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              {isTamil ? `அருகிலுள்ள இடங்கள் வரைபடம் (${filteredPlaces.length})` : `Verified Map Points (${filteredPlaces.length})`}
            </span>
            <span className="text-[11px] text-blue-400">
              {isTamil ? 'சென்றடையும் நேரம் மற்றும் வேலை நேரத்துடன்' : 'With Reach Times & Live Hours'}
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
                    {isTamil ? place.nameTamil : place.name}
                  </span>
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full shrink-0">
                    {place.distanceFormatted}
                  </span>
                </div>

                {/* Live Open Status Badge */}
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${place.operatingStatus.badgeColor}`}>
                    {isTamil ? place.operatingStatus.statusBadgeTextTamil : place.operatingStatus.statusBadgeText}
                  </span>
                </div>

                {/* Reach Time by Walk, Bike, Car */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/80 p-1.5 rounded-lg font-mono">
                  <span className="flex items-center gap-1">
                    <Footprints className="w-3 h-3 text-blue-400" />
                    <span>{isTamil ? place.travelTimes.walkFormattedTamil : place.travelTimes.walkFormatted}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Bike className="w-3 h-3 text-emerald-400" />
                    <span>{isTamil ? place.travelTimes.bikeFormattedTamil : place.travelTimes.bikeFormatted}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Car className="w-3 h-3 text-cyan-400" />
                    <span>{isTamil ? place.travelTimes.carFormattedTamil : place.travelTimes.carFormatted}</span>
                  </span>
                </div>

                {/* Shortcut highlight */}
                {place.shortcut.hasShortcut && (
                  <div className="text-[10px] text-cyan-300 flex items-center gap-1 font-mono">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span>
                      {isTamil
                        ? `குறுக்கு வழி (-${place.shortcut.timeSavedMinutes} நிமிடம்) • ${place.shortcut.hasStairs ? 'படிகள் உண்டு' : 'படிகள் இல்லை'}`
                        : `Shortcut (-${place.shortcut.timeSavedMinutes}m) • ${place.shortcut.hasStairs ? 'Stairs' : 'Step-free'}`}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
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
                        isTamil ? place.nameTamil : place.name
                      )
                    }
                    className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isTamil ? 'வழி' : 'Route'}</span>
                    <Navigation className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View Mode with Full Card Details */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredPlaces.length === 0 ? (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center text-slate-400 text-xs space-y-2">
              <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-300">
                {isTamil
                  ? 'தேர்ந்தெடுக்கப்பட்ட தூரத்திற்குள் சேவைகள் எதுவும் காணப்படவில்லை.'
                  : 'No verified places found matching your filters.'}
              </p>
              <p className="text-[11px]">
                {isTamil
                  ? 'வடிப்பானை மாற்றவும் அல்லது அதிகபட்ச தூரத்தை அதிகரிக்கவும்.'
                  : 'Try selecting a larger distance radius or clear the search query.'}
              </p>
            </div>
          ) : (
            filteredPlaces.map((place) => (
              <NearbyPlaceCard
                key={place.id}
                place={place}
                language={language}
                onPlanRoute={onPlanRouteToDestination}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
