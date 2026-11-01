import { Coordinates } from '../types';
import { NearbyHelpPlace, getDistanceMeters, formatDistance } from '../data/nearbyHelpData';

export interface ShortcutEvaluation {
  hasShortcut: boolean;
  shortcutName: string;
  shortcutNameTamil: string;
  shortcutDistanceMeters: number;
  shortcutDistanceFormatted: string;
  mainRoadDistanceMeters: number;
  mainRoadDistanceFormatted: string;
  timeSavedMinutes: number;
  
  // Physical Infrastructure on the Shortcut
  hasStairs: boolean;
  stairCount?: number;
  stairDescription: string;
  stairDescriptionTamil: string;
  
  isNarrowPath: boolean;
  pathWidthCm: number;
  pathWidthDescription: string;
  pathWidthDescriptionTamil: string;
  
  lightingCondition: 'well_lit' | 'moderate' | 'dim_dark';
  lightingConditionTamil: string;
  
  // "Ellaru antha path valiya pogalama?" (Can everyone use this path?)
  canEveryoneUse: boolean;
  verdictBadge: string;
  verdictBadgeTamil: string;
  
  profileSuitability: {
    wheelchair: {
      isPassable: boolean;
      reason: string;
      reasonTamil: string;
    };
    elderly: {
      isPassable: boolean;
      reason: string;
      reasonTamil: string;
    };
    womenNightSafety: {
      safetyLevel: 'safe' | 'moderate' | 'caution_avoid_night';
      advice: string;
      adviceTamil: string;
    };
  };
  
  recommendation: {
    recommendedPath: 'shortcut' | 'main_road';
    adviceEnglish: string;
    adviceTamil: string;
  };
}

export interface PlaceOperatingStatus {
  isOpenNow: boolean;
  statusBadge: 'open_now' | 'closing_soon' | 'closed_now' | 'open_24_7';
  statusBadgeText: string;
  statusBadgeTextTamil: string;
  badgeColor: string;
  scheduleSummary: string;
  scheduleSummaryTamil: string;
  timeNotice: string;
  timeNoticeTamil: string;
}

export interface NearbyPlaceEnriched extends NearbyHelpPlace {
  distanceMeters: number;
  distanceFormatted: string;
  
  // Travel Times
  travelTimes: {
    walkMinutes: number;
    walkFormatted: string;
    walkFormattedTamil: string;
    
    bikeMinutes: number;
    bikeFormatted: string;
    bikeFormattedTamil: string;
    
    carMinutes: number;
    carFormatted: string;
    carFormattedTamil: string;
  };
  
  // Real Dynamic Operating Hours Status
  operatingStatus: PlaceOperatingStatus;
  
  // Shortcut & Accessibility Evaluation
  shortcut: ShortcutEvaluation;
}

/**
 * Calculates dynamic operating hours status based on current time (hours and minutes)
 */
export function calculateOperatingStatus(
  place: NearbyHelpPlace,
  nowDate: Date = new Date()
): PlaceOperatingStatus {
  if (place.is24Hours || (place.openHour === 0 && place.closeHour >= 24)) {
    return {
      isOpenNow: true,
      statusBadge: 'open_24_7',
      statusBadgeText: 'Open 24/7',
      statusBadgeTextTamil: '24 மணி நேரமும் திறந்திருக்கும்',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      scheduleSummary: 'Round-the-clock emergency public service',
      scheduleSummaryTamil: '24 மணி நேரமும் பொதுச் சேவை செயல்படுகிறது',
      timeNotice: 'Open now • No closing time',
      timeNoticeTamil: 'இப்போது திறந்துள்ளது • எப்போதும் அணுகலாம்',
    };
  }

  const currentHour = nowDate.getHours();
  const currentMinute = nowDate.getMinutes();
  const currentTimeDecimal = currentHour + currentMinute / 60;

  const openTime = place.openHour ?? 8.5;
  const closeTime = place.closeHour ?? 20;

  const isOpen = currentTimeDecimal >= openTime && currentTimeDecimal < closeTime;

  // Format hours into 12-hour AM/PM string
  const formatHour12 = (h: number) => {
    const wholeH = Math.floor(h);
    const mins = Math.round((h - wholeH) * 60);
    const period = wholeH >= 12 ? 'PM' : 'AM';
    const displayH = wholeH % 12 === 0 ? 12 : wholeH % 12;
    const minsStr = mins > 0 ? `:${mins.toString().padStart(2, '0')}` : ':00';
    return `${displayH}${minsStr} ${period}`;
  };

  const openStr = formatHour12(openTime);
  const closeStr = formatHour12(closeTime);

  if (isOpen) {
    const hoursLeft = closeTime - currentTimeDecimal;
    const minsLeft = Math.round(hoursLeft * 60);

    if (minsLeft <= 45) {
      return {
        isOpenNow: true,
        statusBadge: 'closing_soon',
        statusBadgeText: `Closing soon (${minsLeft}m left)`,
        statusBadgeTextTamil: `விரைவில் மூடப்படும் (${minsLeft} நிமிடத்தில்)`,
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        scheduleSummary: `${openStr} - ${closeStr}`,
        scheduleSummaryTamil: `${openStr} முதல் ${closeStr} வரை`,
        timeNotice: `Closes at ${closeStr} (Hurry, ${minsLeft} mins left)`,
        timeNoticeTamil: `இன்று ${closeStr} மணிக்கு மூடப்படும் (${minsLeft} நிமிடங்களே உள்ளன)`,
      };
    }

    const hoursDisplay = Math.floor(minsLeft / 60);
    const remainingMins = minsLeft % 60;
    const timeRemainingStr = hoursDisplay > 0
      ? `${hoursDisplay}h ${remainingMins}m`
      : `${remainingMins} mins`;

    return {
      isOpenNow: true,
      statusBadge: 'open_now',
      statusBadgeText: `Open Now (until ${closeStr})`,
      statusBadgeTextTamil: `இப்போது திறந்துள்ளது (${closeStr} வரை)`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      scheduleSummary: `${openStr} - ${closeStr}`,
      scheduleSummaryTamil: `${openStr} முதல் ${closeStr} வரை`,
      timeNotice: `Open now • Closes at ${closeStr} (Open for next ${timeRemainingStr})`,
      timeNoticeTamil: `இப்போது திறந்துள்ளது • ${closeStr} வரை (${timeRemainingStr} நேரம் திறந்திருக்கும்)`,
    };
  }

  // Place is currently closed
  return {
    isOpenNow: false,
    statusBadge: 'closed_now',
    statusBadgeText: `Closed Now (Opens ${openStr})`,
    statusBadgeTextTamil: `இப்போது மூடப்பட்டுள்ளது (நாளை காலை ${openStr} திறக்கும்)`,
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    scheduleSummary: `${openStr} - ${closeStr}`,
    scheduleSummaryTamil: `${openStr} முதல் ${closeStr} வரை`,
    timeNotice: `Closed now • Opens at ${openStr}`,
    timeNoticeTamil: `இப்போது மூடப்பட்டுள்ளது • அடுத்த வேலை நேரம்: ${openStr}`,
  };
}

/**
 * Evaluates shortcut presence, stairs, narrow alleys, and physical accessibility
 */
export function evaluateShortcutAndAccessibility(
  place: NearbyHelpPlace,
  distanceMeters: number
): ShortcutEvaluation {
  // If specific shortcut info is already recorded in the place object, use it
  if (place.shortcutInfo) {
    const s = place.shortcutInfo;
    const shortcutDist = Math.round(distanceMeters * 0.72);
    return {
      hasShortcut: s.hasShortcut,
      shortcutName: 'Residential Cut-Through / Footbridge Alley',
      shortcutNameTamil: 'குடியிருப்பு குறுக்கு சந்து / நடைபாதை',
      shortcutDistanceMeters: shortcutDist,
      shortcutDistanceFormatted: formatDistance(shortcutDist),
      mainRoadDistanceMeters: distanceMeters,
      mainRoadDistanceFormatted: formatDistance(distanceMeters),
      timeSavedMinutes: s.shortcutSavedMinutes || Math.max(3, Math.round(distanceMeters / 150)),
      hasStairs: s.hasStairs,
      stairCount: s.stairCount || (s.hasStairs ? 14 : 0),
      stairDescription: s.hasStairs ? `Includes flight of ${s.stairCount || 14} steps without ramp` : 'Step-free level walking pathway',
      stairDescriptionTamil: s.hasStairs ? `${s.stairCount || 14} படிக்கட்டுகள் உள்ளன (சாய்வுதளம் இல்லை)` : 'படிகள் இல்லாத தரைமட்ட நடைபாதை',
      isNarrowPath: s.isNarrowPath,
      pathWidthCm: s.isNarrowPath ? 70 : 180,
      pathWidthDescription: s.pathWidthDesc || (s.isNarrowPath ? 'Narrow passage (< 75 cm)' : 'Standard width (1.8m)'),
      pathWidthDescriptionTamil: s.pathWidthDescTamil || (s.isNarrowPath ? 'குறுகிய சந்து (75 செ.மீ-க்கும் குறைவு)' : 'அகலமான நடைபாதை (1.8 மீ)'),
      lightingCondition: s.lightingCondition || 'moderate',
      lightingConditionTamil: s.lightingCondition === 'well_lit' ? 'நல்ல வெளிச்சம் உள்ளது' : s.lightingCondition === 'dim_dark' ? 'இருட்டான பகுதி (வெளிச்சம் குறைவு)' : 'மிதமான வெளிச்சம்',
      canEveryoneUse: s.canEveryoneUse,
      verdictBadge: s.canEveryoneUse ? 'Accessible to All' : 'Restricted (Not for Everyone)',
      verdictBadgeTamil: s.canEveryoneUse ? 'அனைவரும் செல்லலாம்' : 'அனைவருக்கும் உகந்ததல்ல (கட்டுப்பாடு)',
      profileSuitability: {
        wheelchair: {
          isPassable: !s.hasStairs && !s.isNarrowPath,
          reason: s.wheelchairReason || (!s.hasStairs ? 'Step-free and wide enough' : 'Blocked by stairs / narrow steps'),
          reasonTamil: s.wheelchairReasonTamil || (!s.hasStairs ? 'படிகள் இல்லை, சக்கர நாற்காலி செல்லலாம்' : 'படிக்கட்டுகள் உள்ளதால் சக்கர நாற்காலி செல்ல முடியாது'),
        },
        elderly: {
          isPassable: !s.hasStairs || (s.stairCount ? s.stairCount <= 5 : false),
          reason: s.elderlyReason || (s.hasStairs ? 'Steep stairs pose fall risk' : 'Smooth surface, safe for walking'),
          reasonTamil: s.elderlyReasonTamil || (s.hasStairs ? 'செங்குத்தான படிகள் உள்ளதால் முதியவர்களுக்கு மூட்டு வலி அல்லது தடுமாற்றம் ஏற்படலாம்' : 'சமமான தரை, மெதுவாக நடந்து செல்லலாம்'),
        },
        womenNightSafety: {
          safetyLevel: s.lightingCondition === 'dim_dark' ? 'caution_avoid_night' : 'safe',
          advice: s.womenNightAdvice || (s.lightingCondition === 'dim_dark' ? 'Secluded dark lane; avoid after dark, take main arterial road' : 'Open street with normal footfall'),
          adviceTamil: s.womenNightAdviceTamil || (s.lightingCondition === 'dim_dark' ? 'இரவு நேரத்தில் ஆள்நடமாட்டம் மற்றும் வெளிச்சம் குறைவாக இருக்கும்; இரவு 7 மணிக்குப் பிறகு பிரதான சாலையைப் பயன்படுத்தவும்' : 'வெளிச்சம் உள்ள பாதுகாப்பான பகுதி'),
        },
      },
      recommendation: {
        recommendedPath: s.recommendedPath || (s.canEveryoneUse ? 'shortcut' : 'main_road'),
        adviceEnglish: s.recommendationNote || (s.canEveryoneUse ? 'Shortcut is safe and saves time' : 'Stick to main public road for step-free access and better lighting'),
        adviceTamil: s.recommendationNoteTamil || (s.canEveryoneUse ? 'குறுக்கு வழி பாதுகாப்பானது, நேரம் மிச்சமாகும்' : 'படிகள் மற்றும் இருட்டைத் தவிர்க்க பிரதான சாலையிலேயே செல்லவும்'),
      },
    };
  }

  // Deterministic realistic evaluation based on category and distance
  // Markets and old bazaars usually have narrow lanes and steps; hospitals & police usually have clear arterial roads
  const isMarketOrBazaar = place.category === 'market' || place.category === 'shop';
  const hasShortcut = distanceMeters >= 400; // Only relevant if distance is > 400m
  const shortcutDist = Math.round(distanceMeters * 0.75);
  const timeSaved = Math.max(2, Math.round((distanceMeters - shortcutDist) / 70));

  const hasStairs = isMarketOrBazaar ? distanceMeters > 700 : false;
  const isNarrow = isMarketOrBazaar;
  const canEveryoneUse = !hasStairs && !isNarrow;

  return {
    hasShortcut,
    shortcutName: isMarketOrBazaar ? 'Market Lane Cut-Through' : 'Service Lane Through-way',
    shortcutNameTamil: isMarketOrBazaar ? 'சந்தை உள் சந்து குறுக்கு வழி' : 'இணைப்புச் சாலை குறுக்கு வழி',
    shortcutDistanceMeters: shortcutDist,
    shortcutDistanceFormatted: formatDistance(shortcutDist),
    mainRoadDistanceMeters: distanceMeters,
    mainRoadDistanceFormatted: formatDistance(distanceMeters),
    timeSavedMinutes: timeSaved,
    hasStairs,
    stairCount: hasStairs ? 12 : 0,
    stairDescription: hasStairs ? 'Pedestrian footbridge with 12 steps (no ramp)' : 'Smooth step-free pedestrian pathway',
    stairDescriptionTamil: hasStairs ? '12 படிக்கட்டுகள் கொண்ட நடைபாதை மேம்பாலம் (சாய்வுதளம் இல்லை)' : 'படிகள் இல்லாத சமமான நடைபாதை',
    isNarrowPath: isNarrow,
    pathWidthCm: isNarrow ? 75 : 180,
    pathWidthDescription: isNarrow ? 'Narrow market passage (< 80 cm)' : 'Wide standard pavement (1.8m)',
    pathWidthDescriptionTamil: isNarrow ? 'நெரிசலான குறுகிய சந்து (80 செ.மீ அகலம்)' : 'அகலமான நடைபாதை (1.8 மீ)',
    lightingCondition: isMarketOrBazaar ? 'dim_dark' : 'well_lit',
    lightingConditionTamil: isMarketOrBazaar ? 'இரவில் குறைந்த வெளிச்சம்' : 'நல்ல தெருவிளக்கு வெளிச்சம்',
    canEveryoneUse,
    verdictBadge: canEveryoneUse ? 'Safe for All' : 'Not for Everyone (Physical Barriers)',
    verdictBadgeTamil: canEveryoneUse ? 'அனைவரும் செல்லலாம்' : 'அனைவருக்கும் உகந்ததல்ல (தடைகள் உண்டு)',
    profileSuitability: {
      wheelchair: {
        isPassable: !hasStairs && !isNarrow,
        reason: hasStairs ? 'Cannot pass: Flight of 12 steps without ramp' : isNarrow ? 'Passage under 80cm blocks standard wheelchair' : 'Step-free and wide path',
        reasonTamil: hasStairs ? 'செல்ல முடியாது: 12 படிக்கட்டுகள் உள்ளன, சாய்வுதளம் இல்லை' : isNarrow ? '80 செ.மீ குறைவான குறுகிய வழி சக்கர நாற்காலியைத் தடுக்கும்' : 'படிகள் இல்லாத அகலமான பாதை',
      },
      elderly: {
        isPassable: !hasStairs,
        reason: hasStairs ? 'Knee strain and tripping risk on uneven stairs' : 'Level ground, easy walking pace',
        reasonTamil: hasStairs ? 'படிக்கட்டுகள் உள்ளதால் முதியவர்களுக்கு மூட்டு வலி அல்லது தடுமாற்றம் ஏற்படும்' : 'சமமான தரை, எளிதாக நடந்து செல்லலாம்',
      },
      womenNightSafety: {
        safetyLevel: isMarketOrBazaar ? 'caution_avoid_night' : 'safe',
        advice: isMarketOrBazaar ? 'Low visibility and closed shutters after 8 PM; use well-lit main road' : 'Arterial street with regular traffic and lighting',
        adviceTamil: isMarketOrBazaar ? 'இரவு 8 மணிக்கு மேல் கடைகள் அடைக்கப்பட்டு இருட்டாக இருக்கும்; பிரதான சாலையை மட்டுமே பயன்படுத்தவும்' : 'நல்ல வெளிச்சம் மற்றும் ஆட்கள் நடமாட்டம் உள்ள பாதுகாப்பான சாலை',
      },
    },
    recommendation: {
      recommendedPath: canEveryoneUse ? 'shortcut' : 'main_road',
      adviceEnglish: canEveryoneUse
        ? `Shortcut saves ~${timeSaved} mins and has step-free wide pavement.`
        : `Avoid shortcut: Take main road (${formatDistance(distanceMeters)}) for safety, lighting, and step-free access.`,
      adviceTamil: canEveryoneUse
        ? `குறுக்கு வழி ~${timeSaved} நிமிடம் மிச்சப்படுத்தும்; படிகள் இல்லாத நல்ல பாதை.`
        : `குறுக்கு வழியைத் தவிர்க்கவும்: படிகள் மற்றும் இருட்டைத் தவிர்க்க பிரதான சாலை வழியே செல்லவும் (${formatDistance(distanceMeters)}).`,
    },
  };
}

/**
 * Enriches a place with live travel times (walk, bike, car), operating hours status, and shortcut analysis
 */
export function enrichNearbyPlace(
  place: NearbyHelpPlace,
  userCoords: Coordinates
): NearbyPlaceEnriched {
  const distMeters = getDistanceMeters(userCoords.lat, userCoords.lng, place.lat, place.lng);
  const distKm = distMeters / 1000;

  // Travel time calculations:
  // Walking: ~4.5 km/h -> ~13.3 mins per km
  const walkMins = Math.max(1, Math.round((distKm / 4.5) * 60));
  
  // Bike / Two Wheeler: ~24 km/h in city traffic -> ~2.5 mins per km + 1 min start
  const bikeMins = Math.max(1, Math.round((distKm / 24) * 60 + 1));
  
  // Car / Auto / Cab: ~18 km/h with traffic & signals -> ~3.3 mins per km + 2 mins wait/turn
  const carMins = Math.max(2, Math.round((distKm / 18) * 60 + 2));

  const formatMins = (mins: number, lang: 'en' | 'ta') => {
    if (mins < 60) {
      return lang === 'ta' ? `${mins} நிமிடம்` : `${mins} min${mins > 1 ? 's' : ''}`;
    }
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (m === 0) {
      return lang === 'ta' ? `${h} மணி நேரம்` : `${h} hr${h > 1 ? 's' : ''}`;
    }
    return lang === 'ta' ? `${h} மணி ${m} நிமிடம்` : `${h}h ${m}m`;
  };

  return {
    ...place,
    distanceMeters: Math.round(distMeters),
    distanceFormatted: formatDistance(distMeters),
    travelTimes: {
      walkMinutes: walkMins,
      walkFormatted: formatMins(walkMins, 'en'),
      walkFormattedTamil: formatMins(walkMins, 'ta'),
      bikeMinutes: bikeMins,
      bikeFormatted: formatMins(bikeMins, 'en'),
      bikeFormattedTamil: formatMins(bikeMins, 'ta'),
      carMinutes: carMins,
      carFormatted: formatMins(carMins, 'en'),
      carFormattedTamil: formatMins(carMins, 'ta'),
    },
    operatingStatus: calculateOperatingStatus(place),
    shortcut: evaluateShortcutAndAccessibility(place, distMeters),
  };
}
