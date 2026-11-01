import React, { useState } from 'react';
import {
  ShieldAlert,
  Building2,
  HeartPulse,
  Pill,
  Bus,
  Layers,
  Octagon,
  Phone,
  PhoneCall,
  MapPin,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Users,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { Language } from '../utils/translations';
import { CorridorInfrastructureSummary, CorridorPoiItem } from '../services/corridorPoiService';

interface Props {
  corridorData: CorridorInfrastructureSummary;
  language: Language;
}

export const RouteCorridorAmenitiesCard: React.FC<Props> = ({
  corridorData,
  language,
}) => {
  const isTamil = language === 'ta';

  // Active sub-tab filter
  const [activeTab, setActiveTab] = useState<
    'all' | 'women_police' | 'bridges' | 'speed_breakers' | 'bus_stands' | 'medical' | 'police'
  >('women_police'); // Default to women police / safety as user explicitly requested

  const tabs = [
    {
      id: 'women_police' as const,
      label: isTamil ? 'மகளிர் காவல் நிலையம் (Girls Safety)' : 'All Women Police (AWPS)',
      count: corridorData.womenPoliceStations.totalCount,
      icon: Users,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      isSpecial: true,
    },
    {
      id: 'bridges' as const,
      label: isTamil ? 'பாலங்கள் / மேம்பாலங்கள்' : 'Bridges & Flyovers',
      count: corridorData.bridges.totalCount,
      icon: Layers,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    },
    {
      id: 'speed_breakers' as const,
      label: isTamil ? 'வேகத்தடைகள்' : 'Speed Breakers',
      count: corridorData.speedBreakers.totalCount,
      icon: Octagon,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'bus_stands' as const,
      label: isTamil ? 'பேருந்து நிறுத்தங்கள்' : 'Bus Stops / Stands',
      count: corridorData.busStands.totalCount,
      icon: Bus,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'medical' as const,
      label: isTamil ? 'மருந்தகம் & மருத்துவமனை' : 'Hospitals & Medical',
      count: corridorData.pharmacies.totalCount + corridorData.hospitals.totalCount,
      icon: HeartPulse,
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    },
    {
      id: 'police' as const,
      label: isTamil ? 'காவல் நிலையங்கள்' : 'Police Stations',
      count: corridorData.policeStations.totalCount,
      icon: ShieldAlert,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    },
    {
      id: 'all' as const,
      label: isTamil ? 'அனைத்து விவரங்கள்' : 'All Infrastructure',
      count:
        corridorData.bridges.totalCount +
        corridorData.speedBreakers.totalCount +
        corridorData.busStands.totalCount +
        corridorData.pharmacies.totalCount +
        corridorData.hospitals.totalCount +
        corridorData.policeStations.totalCount +
        corridorData.womenPoliceStations.totalCount,
      icon: Compass,
      badgeColor: 'bg-slate-700/50 text-slate-300 border-slate-600',
    },
  ];

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md">
              <Compass className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-white">
              {isTamil
                ? 'வழித்தட உள்கட்டமைப்பு & பாதுகாப்பு இடங்கள் (Km விவரங்களுடன்)'
                : 'Corridor Infrastructure & Safety POIs (With Exact Km Markers)'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil
              ? `${corridorData.originName.split(',')[0]} முதல் ${corridorData.destinationName.split(',')[0]} வரை (${corridorData.corridorDistanceKm} கி.மீ வழியில் உள்ள பாலங்கள், வேகத்தடைகள், பேருந்து நிறுத்தங்கள், மருத்துவமனைகள் & மகளிர் காவல் நிலையங்கள்)`
              : `Bridges, speed breakers, bus stops, medical clinics, and police stations along this ${corridorData.corridorDistanceKm} km journey`}
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[11px] font-mono font-bold bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl text-cyan-300">
            {corridorData.corridorDistanceKm} km Corridor
          </span>
        </div>
      </div>

      {/* SPECIAL GIRLS / WOMEN SAFETY BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-950/70 via-pink-950/40 to-slate-950 border border-rose-500/40 p-4 space-y-2.5 shadow-lg">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-rose-600/30 text-rose-300 border border-rose-500/40 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-rose-300 uppercase tracking-wider block">
                {isTamil ? 'பெண்கள் & மாணவிகள் உடனடி பாதுகாப்பு மையம்' : 'Dedicated Women & Girls Safety Center'}
              </span>
              <span className="text-[11px] text-slate-300 font-semibold">
                {isTamil ? 'அருகிலுள்ள மகளிர் காவல் நிலையம்:' : 'Nearest All Women Police Station (AWPS):'}{' '}
                <strong className="text-white">
                  {isTamil
                    ? corridorData.womenPoliceStations.items[0]?.nameTamil
                    : corridorData.womenPoliceStations.items[0]?.name}
                </strong>{' '}
                ({corridorData.womenPoliceStations.nearestKm} km)
              </span>
            </div>
          </div>

          <span className="text-[10px] bg-rose-600 text-white font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
            {isTamil ? 'அவசர உதவி 1091' : 'SOS 1091'}
          </span>
        </div>

        <p className="text-xs text-rose-200/90 leading-relaxed">
          {isTamil
            ? corridorData.womenPoliceStations.emergencyAdviceTamil
            : corridorData.womenPoliceStations.emergencyAdvice}
        </p>

        {/* Instant Action SOS buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <a
            href="tel:1091"
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer shadow-md active:scale-95"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{isTamil ? 'மகளிர் உதவி எண்: 1091' : 'Women Helpline: 1091'}</span>
          </a>

          <a
            href="tel:112"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3.5 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-blue-400" />
            <span>{isTamil ? 'தேசிய அவசர எண்: 112' : 'National Emergency: 112'}</span>
          </a>

          <a
            href="tel:181"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <span>{isTamil ? 'பாதிப்பு உதவி: 181' : 'Toll-Free: 181'}</span>
          </a>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer border ${
                isSelected
                  ? tab.isSpecial
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                    : 'bg-blue-600 text-white border-blue-500 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-white/20 text-white' : tab.badgeColor
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Section based on selected tab */}
      <div className="space-y-3 pt-1">
        {/* TAB 1: ALL WOMEN POLICE STATIONS (மகளிர் காவல் நிலையம்) */}
        {(activeTab === 'women_police' || activeTab === 'all') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-rose-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-rose-400" />
                <span>{isTamil ? 'அனைத்து மகளிர் காவல் நிலையங்கள் (AWPS)' : 'All Women Police Stations (AWPS)'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {corridorData.womenPoliceStations.items.length} {isTamil ? 'நிலையங்கள்' : 'stations'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {corridorData.womenPoliceStations.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-rose-500/30 hover:border-rose-500/60 transition space-y-2 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30 inline-block">
                        {isTamil ? item.badgeTamil || 'மகளிர் நிலையம்' : item.badge || 'AWPS'}
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-white">
                        {isTamil ? item.nameTamil : item.name}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 border border-cyan-500/30 px-2 py-0.5 rounded-lg">
                        {item.kmFromOrigin} km
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    <MapPin className="w-3 h-3 text-slate-500 inline mr-1" />
                    {isTamil ? item.locationDescriptionTamil : item.locationDescription}
                  </p>

                  {item.notes && (
                    <div className="text-[10px] text-rose-200/80 bg-rose-950/40 p-2 rounded-xl border border-rose-500/20">
                      🛡️ {isTamil ? item.notesTamil : item.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      {item.phone && (
                        <a
                          href={`tel:${item.phone.replace(/[^0-9]/g, '')}`}
                          className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{item.phone}</span>
                        </a>
                      )}
                    </div>

                    <a
                      href="tel:1091"
                      className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <span>{isTamil ? 'உடனடி SOS: 1091' : 'Call SOS: 1091'}</span>
                      <PhoneCall className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: BRIDGES & FLYOVERS (பாலங்கள்) */}
        {(activeTab === 'bridges' || activeTab === 'all') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>{isTamil ? 'பாலங்கள் மற்றும் மேம்பாலங்கள்' : 'Bridges & Flyovers'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {corridorData.bridges.items.length} {isTamil ? 'பாலங்கள்' : 'bridges'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {corridorData.bridges.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 transition space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 inline-block mb-1">
                        {isTamil ? item.badgeTamil || 'பாலம்' : item.badge || 'Bridge'}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {isTamil ? item.nameTamil : item.name}
                      </h4>
                    </div>

                    <span className="text-xs font-mono font-bold text-blue-300 bg-blue-950 border border-blue-500/30 px-2 py-0.5 rounded-lg shrink-0">
                      {item.kmFromOrigin} km
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {isTamil ? item.locationDescriptionTamil : item.locationDescription}
                  </p>

                  {item.notes && (
                    <div className="text-[10px] text-slate-300 bg-slate-900 p-2 rounded-xl border border-slate-800 font-mono">
                      ℹ️ {isTamil ? item.notesTamil : item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SPEED BREAKERS (வேகத்தடைகள்) */}
        {(activeTab === 'speed_breakers' || activeTab === 'all') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Octagon className="w-4 h-4 text-amber-400" />
                <span>{isTamil ? 'வேகத்தடைகள் (Speed Breakers)' : 'Speed Breakers & Road Bumps'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {corridorData.speedBreakers.totalCount} {isTamil ? 'தடைகள்' : 'total bumps'}
              </span>
            </div>

            <p className="text-xs text-slate-400 bg-amber-950/30 border border-amber-500/20 p-2.5 rounded-xl">
              {isTamil
                ? corridorData.speedBreakers.locationsSummaryTamil
                : corridorData.speedBreakers.locationsSummary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {corridorData.speedBreakers.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">
                      {isTamil ? item.nameTamil : item.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded-lg border border-amber-500/30">
                      Km {item.kmFromOrigin}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {isTamil ? item.locationDescriptionTamil : item.locationDescription}
                  </p>

                  <p className="text-[10px] text-amber-300/80 font-mono">
                    {isTamil ? item.notesTamil : item.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BUS STANDS & STOPS (பேருந்து நிறுத்தங்கள்) */}
        {(activeTab === 'bus_stands' || activeTab === 'all') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-emerald-400" />
                <span>{isTamil ? 'பேருந்து நிறுத்தங்கள் & முனையங்கள்' : 'Bus Stands & Designated Stops'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {corridorData.busStands.items.length} {isTamil ? 'நிறுத்தங்கள்' : 'stops'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {corridorData.busStands.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 inline-block mb-0.5">
                        {isTamil ? item.badgeTamil || 'பேருந்து நிறுத்தம்' : item.badge || 'Bus Stop'}
                      </span>
                      <h4 className="text-xs font-bold text-white">
                        {isTamil ? item.nameTamil : item.name}
                      </h4>
                    </div>

                    <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950 border border-emerald-500/30 px-2 py-0.5 rounded-lg shrink-0">
                      {item.kmFromOrigin} km
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {isTamil ? item.locationDescriptionTamil : item.locationDescription}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: MEDICAL SHOPS & HOSPITALS (மருந்தகங்கள் & மருத்துவமனைகள்) */}
        {(activeTab === 'medical' || activeTab === 'all') && (
          <div className="space-y-3">
            {/* Hospitals */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-teal-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-teal-400" />
                  <span>{isTamil ? 'மருத்துவமனைகள் & அவசர பிரிவு' : 'Hospitals & Emergency Trauma Wings'}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {corridorData.hospitals.items.length} {isTamil ? 'மருத்துவமனைகள்' : 'hospitals'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {corridorData.hospitals.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-teal-500/40 transition space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20 inline-block mb-1">
                          {isTamil ? item.badgeTamil || 'மருத்துவமனை' : item.badge || 'Hospital'}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          {isTamil ? item.nameTamil : item.name}
                        </h4>
                      </div>

                      <span className="text-xs font-mono font-bold text-teal-300 bg-teal-950 border border-teal-500/30 px-2 py-0.5 rounded-lg shrink-0">
                        {item.kmFromOrigin} km
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      {isTamil ? item.locationDescriptionTamil : item.locationDescription}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                      {item.phone && (
                        <a
                          href={`tel:${item.phone.replace(/[^0-9]/g, '')}`}
                          className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{item.phone}</span>
                        </a>
                      )}
                      <a
                        href="tel:108"
                        className="text-rose-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>SOS: 108</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pharmacies */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-cyan-400" />
                  <span>{isTamil ? '24/7 மருந்தகங்கள் (Pharmacies)' : '24x7 Medical Shops & Pharmacies'}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {corridorData.pharmacies.items.length} {isTamil ? 'மருந்தகங்கள்' : 'pharmacies'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {corridorData.pharmacies.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 inline-block mb-0.5">
                          {isTamil ? item.badgeTamil || '24 மணி நேர மருந்தகம்' : item.badge || '24/7 Open'}
                        </span>
                        <h4 className="text-xs font-bold text-white">
                          {isTamil ? item.nameTamil : item.name}
                        </h4>
                      </div>

                      <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 border border-cyan-500/30 px-2 py-0.5 rounded-lg shrink-0">
                        {item.kmFromOrigin} km
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      {isTamil ? item.locationDescriptionTamil : item.locationDescription}
                    </p>

                    {item.phone && (
                      <div className="pt-1">
                        <a
                          href={`tel:${item.phone.replace(/[^0-9]/g, '')}`}
                          className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{item.phone}</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: GENERAL POLICE STATIONS (காவல் நிலையங்கள்) */}
        {(activeTab === 'police' || activeTab === 'all') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                <span>{isTamil ? 'காவல் நிலையங்கள் (Police Stations)' : 'General Police Stations'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {corridorData.policeStations.items.length} {isTamil ? 'நிலையங்கள்' : 'stations'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {corridorData.policeStations.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 inline-block mb-1">
                        {isTamil ? item.badgeTamil || 'காவல் நிலையம்' : item.badge || 'Police Station'}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {isTamil ? item.nameTamil : item.name}
                      </h4>
                    </div>

                    <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950 border border-indigo-500/30 px-2 py-0.5 rounded-lg shrink-0">
                      {item.kmFromOrigin} km
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {isTamil ? item.locationDescriptionTamil : item.locationDescription}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                    {item.phone && (
                      <a
                        href={`tel:${item.phone.replace(/[^0-9]/g, '')}`}
                        className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{item.phone}</span>
                      </a>
                    )}
                    <a
                      href="tel:112"
                      className="text-blue-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>{isTamil ? 'அவசர எண் 112' : 'Dial 112'}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
