import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  ExternalLink,
  ShieldAlert,
  Footprints,
  Bike,
  Car,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Building2,
  HeartPulse,
  Pill,
  Mail,
  ShoppingBag,
  Store,
  Users,
  Shield,
  Layers,
  Octagon,
  Moon,
  Sun,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { Language } from '../utils/translations';
import { Coordinates } from '../types';
import { NearbyPlaceEnriched } from '../services/nearbyPlacesService';

interface Props {
  place: NearbyPlaceEnriched;
  language: Language;
  onPlanRoute: (coords: Coordinates, name: string) => void;
}

export const NearbyPlaceCard: React.FC<Props> = ({
  place,
  language,
  onPlanRoute,
}) => {
  const isTamil = language === 'ta';
  const [showShortcutDetails, setShowShortcutDetails] = useState<boolean>(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hospital':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'pharmacy':
        return <Pill className="w-4 h-4 text-emerald-400" />;
      case 'police':
        return <ShieldAlert className="w-4 h-4 text-blue-400" />;
      case 'women_police':
        return <Users className="w-4 h-4 text-pink-400" />;
      case 'post_office':
        return <Mail className="w-4 h-4 text-amber-400" />;
      case 'shop':
        return <Store className="w-4 h-4 text-cyan-400" />;
      case 'market':
        return <ShoppingBag className="w-4 h-4 text-yellow-400" />;
      case 'hotel':
        return <Building2 className="w-4 h-4 text-indigo-400" />;
      default:
        return <Building2 className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'hospital':
        return isTamil ? 'மருத்துவமனை' : 'Hospital & Emergency';
      case 'pharmacy':
        return isTamil ? 'மருந்தகம் (24/7 Pharmacy)' : 'Medical Store';
      case 'police':
        return isTamil ? 'காவல் நிலையம்' : 'Police Station';
      case 'women_police':
        return isTamil ? 'அனைத்து மகளிர் காவல் நிலையம்' : 'All Women Police (AWPS)';
      case 'post_office':
        return isTamil ? 'அஞ்சல் நிலையம் (Post Office)' : 'Post Office';
      case 'shop':
        return isTamil ? 'அத்தியாவசிய கடை / அங்காடி' : 'Store & Groceries';
      case 'market':
        return isTamil ? 'சந்தை (Daily Fresh Market)' : 'Daily Market';
      case 'hotel':
        return isTamil ? 'தங்கும் விடுதி (Safe Stay)' : 'Safe Stay / Hotel';
      default:
        return category.replace('_', ' ');
    }
  };

  const s = place.shortcut;
  const op = place.operatingStatus;

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-5 hover:border-slate-700 transition shadow-lg space-y-4">
      {/* 1. Header & Live Category + Distance */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800 text-slate-200">
              {getCategoryIcon(place.category)}
              <span>{getCategoryLabel(place.category)}</span>
            </span>

            {/* REAL-TIME OPERATING HOURS BADGE */}
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${op.badgeColor}`}
            >
              <Clock className="w-3 h-3" />
              <span>{isTamil ? op.statusBadgeTextTamil : op.statusBadgeText}</span>
            </span>

            {place.verifiedStatus === 'official_registry' && (
              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                Official
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
            {isTamil ? place.nameTamil : place.name}
          </h3>

          <p className="text-xs text-slate-400 flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
            <span>{isTamil ? place.addressTamil : place.address}</span>
          </p>
        </div>

        {/* Straight Distance & Total Distance */}
        <div className="sm:text-right shrink-0">
          <div className="inline-block px-3 py-1.5 rounded-2xl bg-slate-950 border border-blue-500/30 text-xs font-mono font-bold text-blue-300 shadow-sm">
            📍 {place.distanceFormatted} {isTamil ? 'தொலைவில்' : 'away'}
          </div>
        </div>
      </div>

      {/* 2. REACH TIME FROM CURRENT LOCATION (Walk, Bike, Car) */}
      <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span>{isTamil ? 'இப்போதைய இருப்பிடத்திலிருந்து சென்றடையும் நேரம்:' : 'Travel Time From Your Location:'}</span>
          <span className="text-slate-500 font-mono">{place.distanceFormatted}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Walking */}
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-center space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
              <Footprints className="w-3 h-3 text-blue-400" />
              <span>{isTamil ? 'நடந்து' : 'Walking'}</span>
            </div>
            <div className="text-xs font-bold font-mono text-white">
              {isTamil ? place.travelTimes.walkFormattedTamil : place.travelTimes.walkFormatted}
            </div>
          </div>

          {/* Bike */}
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-center space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
              <Bike className="w-3 h-3 text-emerald-400" />
              <span>{isTamil ? 'பைக்' : 'Bike'}</span>
            </div>
            <div className="text-xs font-bold font-mono text-emerald-400">
              {isTamil ? place.travelTimes.bikeFormattedTamil : place.travelTimes.bikeFormatted}
            </div>
          </div>

          {/* Car / Auto */}
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-center space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
              <Car className="w-3 h-3 text-cyan-400" />
              <span>{isTamil ? 'கார் / ஆட்டோ' : 'Car/Cab'}</span>
            </div>
            <div className="text-xs font-bold font-mono text-cyan-300">
              {isTamil ? place.travelTimes.carFormattedTamil : place.travelTimes.carFormatted}
            </div>
          </div>
        </div>
      </div>

      {/* 3. OPERATING HOURS & TIME REMAINING (Pora place evlo neram open la irukum) */}
      <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[11px]">
              {isTamil ? 'வேலை நேரம் & நிலைமை:' : 'Operating Schedule & Status:'}
            </span>
            <span className="font-semibold text-slate-200">
              {isTamil ? op.timeNoticeTamil : op.timeNotice}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right text-[11px] text-slate-400 font-mono">
          <span>{isTamil ? place.operatingHoursTamil : place.operatingHours}</span>
        </div>
      </div>

      {/* 4. SHORTCUT & ACCESSIBILITY SECTION (User Request: "shortcut irukaa , oruvela shortcut iruntha anga stairs Iruka , narrow path ah , Ellaru antha path valiya pogalama nu kamikanum with path details") */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-blue-500/25 p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-xl border ${s.hasShortcut ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{isTamil ? 'குறுக்கு வழி (Shortcut) & பாதை ஆய்வு' : 'Shortcut & Pathway Accessibility Check'}</span>
                {s.hasShortcut && (
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 font-mono font-bold px-2 py-0.5 rounded-full border border-cyan-500/40">
                    {isTamil ? `-${s.timeSavedMinutes} நிமிடம் மிச்சம்` : `Saves ~${s.timeSavedMinutes}m`}
                  </span>
                )}
              </span>
              <span className="text-[11px] text-slate-400 block">
                {s.hasShortcut
                  ? isTamil
                    ? `குறுக்கு வழி: ${s.shortcutDistanceFormatted} (பிரதான சாலை: ${s.mainRoadDistanceFormatted})`
                    : `Shortcut: ${s.shortcutDistanceFormatted} vs Main Road: ${s.mainRoadDistanceFormatted}`
                  : isTamil
                  ? 'நேரடி பிரதான சாலை வழி மட்டுமே உள்ளது'
                  : 'Direct public arterial street'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowShortcutDetails(!showShortcutDetails)}
            className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition cursor-pointer active:scale-95 shadow-sm"
          >
            <span>{showShortcutDetails ? (isTamil ? 'பாதை விவரங்களை மறை' : 'Hide Path Details') : (isTamil ? 'முழு பாதை விவரங்கள்' : 'Full Path Details')}</span>
            {showShortcutDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Quick Highlights Summary Bar (Always Visible) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
          {/* Stairs / Steps */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide block">
              {isTamil ? 'படிகள் (Stairs)' : 'Stairs / Steps'}
            </span>
            <span className={`font-bold flex items-center gap-1 ${s.hasStairs ? 'text-amber-400' : 'text-emerald-400'}`}>
              {s.hasStairs ? (
                <>
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>{isTamil ? `${s.stairCount || 12} படிகள் உள்ளன` : `Yes: ${s.stairCount || 12} steps`}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>{isTamil ? 'படிகள் இல்லை (சமம்)' : 'No Stairs (Step-Free)'}</span>
                </>
              )}
            </span>
          </div>

          {/* Narrow Path */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide block">
              {isTamil ? 'பாதை அகலம்' : 'Path Width'}
            </span>
            <span className={`font-bold flex items-center gap-1 ${s.isNarrowPath ? 'text-amber-400' : 'text-emerald-400'}`}>
              {s.isNarrowPath ? (
                <>
                  <Octagon className="w-3 h-3 shrink-0" />
                  <span>{isTamil ? `குறுகியது (${s.pathWidthCm || 75}cm)` : `Narrow (${s.pathWidthCm || 75}cm)`}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>{isTamil ? 'அகலமானது (1.8m)' : 'Wide Standard'}</span>
                </>
              )}
            </span>
          </div>

          {/* Lighting */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide block">
              {isTamil ? 'தெரு வெளிச்சம்' : 'Street Lighting'}
            </span>
            <span className={`font-bold flex items-center gap-1 ${s.lightingCondition === 'dim_dark' ? 'text-rose-400' : 'text-emerald-400'}`}>
              {s.lightingCondition === 'dim_dark' ? (
                <>
                  <Moon className="w-3 h-3 shrink-0" />
                  <span>{isTamil ? 'இருட்டு / மங்கலானது' : 'Dim / Dark Lane'}</span>
                </>
              ) : (
                <>
                  <Sun className="w-3 h-3 shrink-0" />
                  <span>{isTamil ? 'நல்ல வெளிச்சம்' : 'Well Lit'}</span>
                </>
              )}
            </span>
          </div>

          {/* CAN EVERYONE USE THIS PATH? */}
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide block">
              {isTamil ? 'யார் போகலாம்?' : 'Who Can Use?'}
            </span>
            <span className={`font-bold text-[11px] flex items-center gap-1 ${s.canEveryoneUse ? 'text-emerald-400' : 'text-amber-300'}`}>
              {s.canEveryoneUse ? (
                <>
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>{isTamil ? 'அனைவரும் செல்லலாம்' : 'Safe for All'}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>{isTamil ? 'கட்டுப்பாடு உண்டு' : 'Not for All'}</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Detailed Turn-by-Turn Path Comparison & Profile Evaluation Section */}
        {showShortcutDetails && (
          <div className="pt-3 border-t border-slate-800/80 space-y-3.5 animate-in fade-in duration-200">
            {/* Side-by-side or stacked Path Comparison: Main Road vs Shortcut */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Option A: Main Road Path (Standard, Step-Free) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🛣️</span>
                    <span className="font-extrabold text-white text-xs">
                      {isTamil ? s.mainRoadPath?.titleTamil || 'பிரதான பொதுச் சாலை' : s.mainRoadPath?.title || 'Main Public Arterial Road'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20">
                    {s.mainRoadPath?.distanceFormatted || s.mainRoadDistanceFormatted} • {isTamil ? s.mainRoadPath?.durationFormattedTamil || '7 நிமிடம்' : s.mainRoadPath?.durationFormatted || '7 mins'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/70">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    {isTamil ? 'படி படியான வழித்தடம் (Turn-by-Turn Steps):' : 'Turn-by-Turn Directions:'}
                  </span>
                  {(isTamil ? s.mainRoadPath?.stepByStepDirectionsTamil : s.mainRoadPath?.stepByStepDirections)?.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                      <span className="text-blue-400 font-bold font-mono text-[10px] mt-0.5">{idx + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400">
                  <div className="bg-slate-900 p-1.5 rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{isTamil ? 'படிகள் இல்லை (சமம்)' : 'Zero stairs (flat)'}</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded-lg flex items-center gap-1">
                    <Sun className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{isTamil ? 'தெருவிளக்குகள் உண்டு' : 'Well-lit street'}</span>
                  </div>
                </div>
              </div>

              {/* Option B: Shortcut Path */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-extrabold text-cyan-200 text-xs">
                      {isTamil ? s.shortcutPath?.titleTamil || 'குறுக்கு வழிப் பாதை' : s.shortcutPath?.title || 'Shortcut Lane Passage'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40">
                    {s.shortcutPath?.distanceFormatted || s.shortcutDistanceFormatted} • {isTamil ? `-${s.timeSavedMinutes} நிமிடம் மிச்சம்` : `Saves ${s.timeSavedMinutes}m`}
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/70">
                  <span className="text-[10px] uppercase font-bold text-cyan-300 block tracking-wider">
                    {isTamil ? 'குறுக்கு வழி படியான வழித்தடம்:' : 'Shortcut Step-by-Step Directions:'}
                  </span>
                  {(isTamil ? s.shortcutPath?.stepByStepDirectionsTamil : s.shortcutPath?.stepByStepDirections)?.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                      <span className="text-cyan-400 font-bold font-mono text-[10px] mt-0.5">{idx + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="bg-slate-900 p-1.5 rounded-lg flex items-center gap-1">
                    {s.hasStairs ? (
                      <>
                        <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="text-amber-300">{isTamil ? `${s.stairCount || 9} படிகள் உண்டு` : `${s.stairCount || 9} stairs`}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="text-emerald-300">{isTamil ? 'படிகள் இல்லை' : 'Step-free'}</span>
                      </>
                    )}
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded-lg flex items-center gap-1">
                    {s.isNarrowPath ? (
                      <>
                        <Octagon className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="text-amber-300">{isTamil ? `குறுகியது (${s.pathWidthCm || 75}cm)` : `Narrow (${s.pathWidthCm || 75}cm)`}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="text-emerald-300">{isTamil ? 'அகலமான பாதை' : 'Wide path'}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* "Ellaru antha path valiya pogalama?" Verdict Card */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-blue-500/30 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>
                    {isTamil
                      ? 'அனைவரும் இந்த குறுக்கு வழி வழியே போகலாமா? (விவர அறிக்கை)'
                      : 'Can Everyone Use This Pathway? (Profile Evaluation)'}
                  </span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.canEveryoneUse ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>
                  {isTamil ? s.verdictBadgeTamil : s.verdictBadge}
                </span>
              </div>

              {/* Profile by Profile Breakdown */}
              <div className="space-y-1.5 pt-1 text-[11px]">
                {/* Wheelchair / Strollers */}
                <div className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-base leading-none">♿</span>
                  <div className="flex-1">
                    <span className="font-bold text-slate-200 block">
                      {isTamil ? 'சக்கர நாற்காலி & குழந்தைத் தள்ளுவண்டி (Wheelchair / Pram):' : 'Wheelchair & Prams:'}
                    </span>
                    <span className={s.profileSuitability.wheelchair.isPassable ? 'text-emerald-400' : 'text-rose-400 font-semibold'}>
                      {isTamil ? s.profileSuitability.wheelchair.reasonTamil : s.profileSuitability.wheelchair.reason}
                    </span>
                  </div>
                </div>

                {/* Elderly */}
                <div className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-base leading-none">👴</span>
                  <div className="flex-1">
                    <span className="font-bold text-slate-200 block">
                      {isTamil ? 'முதியவர்கள் (Elderly / Walking Assistance):' : 'Elderly / Seniors:'}
                    </span>
                    <span className={s.profileSuitability.elderly.isPassable ? 'text-emerald-400' : 'text-amber-400 font-semibold'}>
                      {isTamil ? s.profileSuitability.elderly.reasonTamil : s.profileSuitability.elderly.reason}
                    </span>
                  </div>
                </div>

                {/* Women Night Safety */}
                <div className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-base leading-none">👩</span>
                  <div className="flex-1">
                    <span className="font-bold text-slate-200 block">
                      {isTamil ? 'பெண்கள் & மாணவிகள் இரவுப் பாதுகாப்பு (Women Night Safety):' : 'Women & Girls Night Safety:'}
                    </span>
                    <span className={s.profileSuitability.womenNightSafety.safetyLevel === 'safe' ? 'text-emerald-400' : 'text-rose-300 font-semibold'}>
                      {isTamil ? s.profileSuitability.womenNightSafety.adviceTamil : s.profileSuitability.womenNightSafety.advice}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clear Final Recommendation */}
              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/40 text-[11px] text-blue-200 flex items-start gap-2">
                <span className="font-bold text-cyan-300 shrink-0">
                  {isTamil ? 'இறுதி பரிந்துரை:' : 'Final Advice:'}
                </span>
                <span>
                  {isTamil ? s.recommendation.adviceTamil : s.recommendation.adviceEnglish}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Actions (Get Directions, Google Maps, Call) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-2">
          {place.phone && (
            <a
              href={`tel:${place.phone.replace(/[^0-9]/g, '')}`}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{isTamil ? 'அழைக்க' : 'Call'}: {place.phone}</span>
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
              onPlanRoute(
                { lat: place.lat, lng: place.lng },
                isTamil ? place.nameTamil : place.name
              )
            }
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer active:scale-95 shadow-md"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{isTamil ? 'வழித்தடம் & வழிகாட்டல்' : 'Plan & Navigate Route'}</span>
          </button>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              place.googleMapsQuery
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-3 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <span>Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
