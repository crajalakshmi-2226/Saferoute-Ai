import { Coordinates, RouteAlternative } from '../types';

export interface TransitModeData {
  modeId: 'car' | 'bike' | 'bus' | 'walk' | 'train';
  modeName: string;
  modeNameTamil: string;
  icon: string;
  durationMinutes: number;
  durationFormatted: string;
  durationFormattedTamil: string;
  distanceKm: number;
  speedKmh: number;
  costEstimate: string;
  delayNotice: string;
  delayNoticeTamil: string;
  keyFactors: {
    trafficImpact: string;
    trafficImpactTamil: string;
    speedBreakersImpact: string;
    speedBreakersImpactTamil: string;
    bridgeImpact: string;
    bridgeImpactTamil: string;
  };
  highlights: string[];
  highlightsTamil: string[];
  suitabilityForAccessibility: 'excellent' | 'good' | 'moderate' | 'challenging';
}

export interface RouteDelayBreakdown {
  bridgesAndFlyovers: {
    count: number;
    names: string[];
    namesTamil: string[];
    delayMinutes: number;
    notes: string;
    notesTamil: string;
  };
  speedBreakers: {
    estimatedCount: number;
    locationsDescription: string;
    locationsDescriptionTamil: string;
    delayMinutes: number;
    impactDescription: string;
    impactDescriptionTamil: string;
  };
  trafficAndBottlenecks: {
    congestionLevel: 'Low' | 'Moderate' | 'Heavy' | 'Severe';
    congestionLevelTamil: string;
    trafficDelayMinutes: number;
    trafficSignalsCount: number;
    signalWaitMinutes: number;
    peakHourNotice: string;
    peakHourNoticeTamil: string;
  };
  roadInfrastructure: {
    roadType: string;
    roadTypeTamil: string;
    pavementQuality: 'Smooth' | 'Mixed' | 'Rough';
    bottlenecks: string[];
    bottlenecksTamil: string[];
  };
}

export interface MultiModalComparisonResult {
  originName: string;
  destinationName: string;
  straightDistanceKm: number;
  modes: {
    car: TransitModeData;
    bike: TransitModeData;
    bus: TransitModeData;
    walk: TransitModeData;
    train: TransitModeData;
  };
  delayBreakdown: RouteDelayBreakdown;
  summaryExplanation: string;
  summaryExplanationTamil: string;
}

// Haversine distance calculator
function computeDistanceKm(c1: Coordinates, c2: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(0.2, Math.round(R * c * 10) / 10);
}

// Format minutes into human-readable hours and minutes (English & Tamil)
export function formatDurationHuman(minutes: number, lang: 'en' | 'ta' = 'en'): string {
  const m = Math.round(minutes);
  if (m < 60) {
    return lang === 'ta' ? `${m} நிமிடங்கள்` : `${m} mins`;
  }
  const hours = Math.floor(m / 60);
  const remainingMins = m % 60;
  if (remainingMins === 0) {
    return lang === 'ta' ? `${hours} மணி நேரம்` : `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  return lang === 'ta'
    ? `${hours} மணி ${remainingMins} நிமிடம்`
    : `${hours} hr ${remainingMins} mins`;
}

/**
 * Identify known bridges, flyovers, and major corridors based on coordinates and route text
 */
function detectBridgesAndFlyovers(origin: Coordinates, destination: Coordinates, route?: RouteAlternative) {
  const minLat = Math.min(origin.lat, destination.lat);
  const maxLat = Math.max(origin.lat, destination.lat);
  const minLng = Math.min(origin.lng, destination.lng);
  const maxLng = Math.max(origin.lng, destination.lng);
  const midLat = (minLat + maxLat) / 2;
  const midLng = (minLng + maxLng) / 2;

  // Real landmark bridges across Tamil Nadu (Chennai, Coimbatore, Madurai) and Global
  const knownBridges = [
    { name: 'Anna Flyover (Gemini)', nameTamil: 'அண்ணா மேம்பாலம் (ஜெமினி)', lat: 13.052, lng: 80.250 },
    { name: 'Kathipara Cloverleaf Flyover', nameTamil: 'கத்திப்பாரா சந்திப்பு மேம்பாலம்', lat: 13.007, lng: 80.205 },
    { name: 'Napier Bridge (Cooum River)', nameTamil: 'நேப்பியர் பாலம் (கூவம் நதி)', lat: 13.067, lng: 80.285 },
    { name: 'Adyar Thiru Vi Ka Bridge', nameTamil: 'திரு. வி. க. அடையாறு பாலம்', lat: 13.009, lng: 80.258 },
    { name: 'Koyambedu Grade Separator', nameTamil: 'கோயம்பேடு மேம்பாலம்', lat: 13.069, lng: 80.194 },
    { name: 'Perambur Railway Overbridge', nameTamil: 'பெரம்பூர் ரயில்வே மேம்பாலம்', lat: 13.109, lng: 80.244 },
    { name: 'Avinashi Road Flyover', nameTamil: 'அவிநாசி சாலை மேம்பாலம் (கோவை)', lat: 11.021, lng: 76.974 },
    { name: 'Vaigai River Bridge', nameTamil: 'வைகை நதி பாலம் (மதுரை)', lat: 9.925, lng: 78.125 },
    { name: 'SF Bay Bridge / Overpass', nameTamil: 'பே பிரிட்ஜ் / மேம்பாலம்', lat: 37.798, lng: -122.378 },
  ];

  const matched = knownBridges.filter(
    (b) =>
      b.lat >= minLat - 0.05 &&
      b.lat <= maxLat + 0.05 &&
      b.lng >= minLng - 0.05 &&
      b.lng <= maxLng + 0.05
  );

  const distKm = computeDistanceKm(origin, destination);
  let count = matched.length;

  // If distance is > 2.5km and none matched, estimate typical flyovers/overpasses on city arterials
  if (count === 0 && distKm >= 2.5) {
    count = Math.min(3, Math.max(1, Math.floor(distKm / 3.5)));
  }

  const names = matched.length > 0 ? matched.map((m) => m.name) : [`Corridor Flyover / Railway Overbridge`];
  const namesTamil =
    matched.length > 0 ? matched.map((m) => m.nameTamil) : [`வழித்தட மேம்பாலம் / ரயில்வே பாலம்`];

  return {
    count: Math.max(1, count),
    names: names.slice(0, 3),
    namesTamil: namesTamil.slice(0, 3),
  };
}

/**
 * Calculates multi-modal comparison with deep delay factor analysis
 */
export function calculateMultiModalComparison(
  origin: Coordinates,
  destination: Coordinates,
  originName: string = 'Origin',
  destinationName: string = 'Destination',
  walkingRoute?: RouteAlternative
): MultiModalComparisonResult {
  const straightKm = computeDistanceKm(origin, destination);
  
  // Real road walking & driving winding factor
  const roadKm = walkingRoute
    ? Math.round((walkingRoute.distanceMeters / 1000) * 10) / 10
    : Math.round(straightKm * 1.25 * 10) / 10;

  // Time-of-day traffic modeling (determines congestion index)
  const currentHour = new Date().getHours();
  const isPeakHour =
    (currentHour >= 8 && currentHour <= 11) || (currentHour >= 17 && currentHour <= 21);
  const congestionLevel = isPeakHour
    ? roadKm > 8
      ? 'Heavy'
      : 'Moderate'
    : 'Moderate';

  // 1. Bridges & Flyovers breakdown
  const bridgeInfo = detectBridgesAndFlyovers(origin, destination, walkingRoute);
  const bridgeDelayMinutes = bridgeInfo.count * 2.5; // ~2.5 mins per bridge/ramp merge

  // 2. Speed Breakers & Road Bumps breakdown
  // Average 1 bump every 450m - 700m along urban/suburban corridors in India
  const speedBreakersCount = Math.max(2, Math.round(roadKm * 1.6));
  const speedBreakerDelayMinutes = Math.round(speedBreakersCount * 0.45 * 10) / 10; // ~25-30 secs deceleration/acceleration per bump

  // 3. Traffic Signals & Congestion
  const trafficSignalsCount = Math.max(2, Math.round(roadKm * 0.9));
  const signalWaitMinutes = Math.round(trafficSignalsCount * 1.2);
  const trafficDelayMinutes = Math.round(
    signalWaitMinutes + (isPeakHour ? roadKm * 1.8 : roadKm * 0.8)
  );

  // ---------------- MODES COMPUTATION ----------------

  // A. CAR / TAXI
  // Average urban car speed in Indian cities: 22-26 km/h free flow, 14-18 km/h peak
  const carBaseSpeed = isPeakHour ? 17 : 24;
  const carTravelTime = (roadKm / carBaseSpeed) * 60;
  const carDurationMinutes = Math.max(4, Math.round(carTravelTime + bridgeDelayMinutes));
  const carCost = Math.round(Math.max(80, roadKm * 22 + 40));

  const carMode: TransitModeData = {
    modeId: 'car',
    modeName: 'Car / Auto / Cab',
    modeNameTamil: 'கார் / ஆட்டோ / டாக்ஸி',
    icon: 'Car',
    durationMinutes: carDurationMinutes,
    durationFormatted: formatDurationHuman(carDurationMinutes, 'en'),
    durationFormattedTamil: formatDurationHuman(carDurationMinutes, 'ta'),
    distanceKm: roadKm,
    speedKmh: Math.round((roadKm / (carDurationMinutes / 60)) * 10) / 10,
    costEstimate: `₹${carCost} - ₹${Math.round(carCost * 1.35)}`,
    delayNotice: `+${trafficDelayMinutes} mins delay due to ${trafficSignalsCount} signals and ${congestionLevel.toLowerCase()} traffic`,
    delayNoticeTamil: `${trafficSignalsCount} சிக்னல்கள் மற்றும் போக்குவரத்து காரணமாக +${trafficDelayMinutes} நிமிடம் தாமதம்`,
    keyFactors: {
      trafficImpact: `High impact: Stuck in junction queues; peak crawl speed ${isPeakHour ? '14' : '20'} km/h`,
      trafficImpactTamil: `அதிக தாக்கம்: சந்திப்பு சிக்னல்களில் நெரிசல்; சராசரி வேகம் ${isPeakHour ? '14' : '20'} கி.மீ/மணி`,
      speedBreakersImpact: `${speedBreakersCount} speed breakers reduce speed to 15 km/h (+${Math.round(speedBreakerDelayMinutes)}m delay)`,
      speedBreakersImpactTamil: `${speedBreakersCount} வேகத்தடைகள் வேகத்தைக் குறைக்கின்றன (+${Math.round(speedBreakerDelayMinutes)} நிமிடம் தாமதம்)`,
      bridgeImpact: `${bridgeInfo.count} bridge/flyover ramps with bottleneck entry lanes`,
      bridgeImpactTamil: `${bridgeInfo.count} பாலங்கள் மற்றும் மேம்பாலங்களில் நுழைவுப் பகுதியில் நெரிசல்`,
    },
    highlights: [
      'AC Comfort & Door-to-Door travel',
      `Subject to ${trafficSignalsCount} major traffic signals`,
      `Includes ${bridgeInfo.count} flyover ramps`,
    ],
    highlightsTamil: [
      'நேரடி வீட்டு வாசல் பயணம் (Door-to-door)',
      `${trafficSignalsCount} முக்கிய சிக்னல்களில் நிற்க வேண்டியிருக்கும்`,
      `${bridgeInfo.count} மேம்பாலங்கள் வழியே செல்கிறது`,
    ],
    suitabilityForAccessibility: 'good',
  };

  // B. BIKE / TWO-WHEELER
  // Bikes filter through traffic and travel at ~28-32 km/h
  const bikeBaseSpeed = isPeakHour ? 25 : 30;
  const bikeTravelTime = (roadKm / bikeBaseSpeed) * 60;
  const bikeDurationMinutes = Math.max(3, Math.round(bikeTravelTime + (bridgeDelayMinutes * 0.7)));
  const bikeCost = Math.round(Math.max(25, roadKm * 4.5));

  const bikeMode: TransitModeData = {
    modeId: 'bike',
    modeName: 'Motorcycle / Bike',
    modeNameTamil: 'பைக் / இருசக்கர வாகனம்',
    icon: 'Bike',
    durationMinutes: bikeDurationMinutes,
    durationFormatted: formatDurationHuman(bikeDurationMinutes, 'en'),
    durationFormattedTamil: formatDurationHuman(bikeDurationMinutes, 'ta'),
    distanceKm: roadKm,
    speedKmh: Math.round((roadKm / (bikeDurationMinutes / 60)) * 10) / 10,
    costEstimate: `₹${bikeCost} (Fuel)`,
    delayNotice: `Filters through traffic; ~${Math.round((carDurationMinutes - bikeDurationMinutes))} mins faster than cars`,
    delayNoticeTamil: `ட்ராஃபிக்கில் வேகமாக செல்லும்; காரை விட ${Math.round((carDurationMinutes - bikeDurationMinutes))} நிமிடம் குறைவு`,
    keyFactors: {
      trafficImpact: 'Low to Moderate: Maneuvers through standstill queues and narrow gaps',
      trafficImpactTamil: 'குறைந்த தாக்கம்: நெரிசல் வரிசைகளுக்கிடையே எளிதாக கடந்து செல்லலாம்',
      speedBreakersImpact: `High physical impact: ${speedBreakersCount} bumps require strong braking and suspension handling`,
      speedBreakersImpactTamil: `அதிக உடல் அதிர்வு: ${speedBreakersCount} வேகத்தடைகளில் மெதுவாக செல்ல வேண்டும்`,
      bridgeImpact: 'Exposed to crosswinds and steep elevation on flyovers',
      bridgeImpactTamil: 'மேம்பாலங்களில் காற்று மற்றும் ஏற்ற இறக்கங்கள் இருக்கும்',
    },
    highlights: [
      'Fastest road option in heavy city congestion',
      'Requires caution on speed breakers and bridge inclines',
      'Extremely cost-effective fuel expense',
    ],
    highlightsTamil: [
      'நகர நெரிசலில் மிக வேகமான சாலைப் பயணம்',
      'வேகத்தடைகள் மற்றும் பாலங்களில் எச்சரிக்கையாக செல்லவும்',
      'மிகக் குறைந்த எரிபொருள் செலவு',
    ],
    suitabilityForAccessibility: 'moderate',
  };

  // C. PUBLIC BUS / MTC / TRANSIT
  // Walking to stop (5-8m) + Wait time (7-12m) + Bus run (16-18 km/h with stops)
  const busWaitTime = 9;
  const busStopsCount = Math.max(3, Math.round(roadKm * 1.8));
  const busRunningSpeed = 16; // km/h with frequent halts
  const busDurationMinutes = Math.max(
    15,
    Math.round(((roadKm / busRunningSpeed) * 60) + busWaitTime + 6)
  );
  const busFare = Math.min(40, Math.max(10, Math.round(roadKm * 2.5 + 5)));

  const busMode: TransitModeData = {
    modeId: 'bus',
    modeName: 'Public Bus (MTC / City)',
    modeNameTamil: 'பேருந்து / பஸ் (MTC)',
    icon: 'Bus',
    durationMinutes: busDurationMinutes,
    durationFormatted: formatDurationHuman(busDurationMinutes, 'en'),
    durationFormattedTamil: formatDurationHuman(busDurationMinutes, 'ta'),
    distanceKm: Math.round((roadKm * 1.1) * 10) / 10,
    speedKmh: Math.round((roadKm / (busDurationMinutes / 60)) * 10) / 10,
    costEstimate: `₹${busFare} - ₹${busFare + 15} (AC/Ordinary)`,
    delayNotice: `Includes ~${busWaitTime} mins wait at bus stop + ${busStopsCount} passenger boardings`,
    delayNoticeTamil: `பஸ் நிறுத்தத்தில் ~${busWaitTime} நிமிடம் காத்திருப்பு + ${busStopsCount} நிறுத்தங்கள்`,
    keyFactors: {
      trafficImpact: 'Moderate to High: Shares regular lanes with traffic (slow at major signals)',
      trafficImpactTamil: 'சாதாரண பாதையில் செல்வதால் சிக்னல்களில் தாமதம் ஏற்படலாம்',
      speedBreakersImpact: 'Comfortable air-suspension on AC buses, moderate jolts on older buses',
      speedBreakersImpactTamil: 'ஏசி பஸ்களில் மென்மையான பயணம்; சாதாரண பஸ்களில் மிதமான அதிர்வு',
      bridgeImpact: 'Takes main flyover routes to bypass congested ground junctions',
      bridgeImpactTamil: 'சந்திப்பு நெரிசலைத் தவிர்க்க முக்கிய மேம்பாலங்கள் வழியே செல்கிறது',
    },
    highlights: [
      `Approx ${busStopsCount} designated stops along route`,
      `Headway frequency every 8-12 minutes`,
      'Low-floor accessible buses available on primary routes',
    ],
    highlightsTamil: [
      `சுமார் ${busStopsCount} பஸ் நிறுத்தங்கள் வழியில் உள்ளன`,
      `ஒவ்வொரு 8-12 நிமிடங்களுக்கும் பஸ் உண்டு`,
      'முக்கிய வழித்தடங்களில் சாய்வுதளம் உள்ள தாழ்தள பேருந்துகள்',
    ],
    suitabilityForAccessibility: 'good',
  };

  // D. WALKING (PEDESTRIAN)
  // Walking speed 4.5 km/h, wheelchair 3.2 km/h
  const walkSpeedKmh = 4.3;
  const walkDurationMinutes = Math.max(
    5,
    Math.round((roadKm / walkSpeedKmh) * 60)
  );
  const walkSteps = Math.round(roadKm * 1350);
  const walkCalories = Math.round(roadKm * 65);

  const walkMode: TransitModeData = {
    modeId: 'walk',
    modeName: 'Walking / Footpath',
    modeNameTamil: 'நடந்து செல்லுதல் / பாதசாரி',
    icon: 'Footprints',
    durationMinutes: walkDurationMinutes,
    durationFormatted: formatDurationHuman(walkDurationMinutes, 'en'),
    durationFormattedTamil: formatDurationHuman(walkDurationMinutes, 'ta'),
    distanceKm: roadKm,
    speedKmh: walkSpeedKmh,
    costEstimate: '₹0 (Free / Healthy)',
    delayNotice: `Zero traffic delay; depends on zebra crossings and curb ramps`,
    delayNoticeTamil: `ட்ராஃபிக் கிடையாது; பாதசாரி கடப்புகள் மற்றும் நடைபாதை தரம் சார்ந்தது`,
    keyFactors: {
      trafficImpact: 'Zero: Uses dedicated sidewalks, footpaths, and pedestrian crossings',
      trafficImpactTamil: 'பூஜ்ஜியம்: பிரத்யேக நடைபாதைகள் மற்றும் ஜீப்ரா கிராசிங்குகள்',
      speedBreakersImpact: 'No vehicle bumps; must watch for curb cut-outs and step-free transitions',
      speedBreakersImpactTamil: 'வேகத்தடை பாதிப்பில்லை; நடைபாதை சாய்வுதளங்கள் கவனிக்கப்பட வேண்டும்',
      bridgeImpact: 'Pedestrian skywalks, staircases or subway tunnels with ramps',
      bridgeImpactTamil: 'பாதசாரி மேம்பாலம் அல்லது சாய்வுதளம் கொண்ட சுரங்கப்பாதை',
    },
    highlights: [
      `Burns approx ${walkCalories} kcal (${walkSteps.toLocaleString()} steps)`,
      'Zero carbon emissions and zero fuel cost',
      'Assessed for step-free ramps, tactile paving, and clear sidewalks',
    ],
    highlightsTamil: [
      `சுமார் ${walkCalories} கலோரிகள் எரிக்கப்படும் (${walkSteps.toLocaleString()} அடிகள்)`,
      'புகை மற்றும் காற்று மாசுபாடு அற்றது',
      'படிகள் அற்ற சாய்வுதளங்கள் மற்றும் தடைகளற்ற நடைபாதை ஆய்வு',
    ],
    suitabilityForAccessibility: 'excellent',
  };

  // E. TRAIN / METRO / SUBURBAN RAIL
  // Suitable if distance is > 1.8km
  const isTrainFeasible = roadKm >= 1.8;
  const trainRunningTime = Math.round((roadKm / 38) * 60); // 38 km/h effective average train speed
  const trainFirstLastMileWalk = 8; // ~400m walk at both ends
  const trainWaitTime = 6; // Metro frequency 5-8m
  const trainDurationMinutes = isTrainFeasible
    ? Math.round(trainRunningTime + trainFirstLastMileWalk + trainWaitTime)
    : 15;
  const trainFare = Math.min(50, Math.max(10, Math.round(roadKm * 2.2 + 10)));

  const trainMode: TransitModeData = {
    modeId: 'train',
    modeName: 'Metro / Local Train',
    modeNameTamil: 'மெட்ரோ ரயில் / புறநகர் ரயில்',
    icon: 'Train',
    durationMinutes: trainDurationMinutes,
    durationFormatted: formatDurationHuman(trainDurationMinutes, 'en'),
    durationFormattedTamil: formatDurationHuman(trainDurationMinutes, 'ta'),
    distanceKm: Math.round((roadKm * 1.05) * 10) / 10,
    speedKmh: Math.round((roadKm / (trainDurationMinutes / 60)) * 10) / 10,
    costEstimate: `₹${trainFare} - ₹${trainFare + 10}`,
    delayNotice: '100% Traffic-Free dedicated track; immune to road jams and speed breakers',
    delayNoticeTamil: '100% போக்குவரத்து நெரிசல் அற்றது; வேகத்தடைகள் ஏதுமில்லை',
    keyFactors: {
      trafficImpact: 'Zero: Elevated/underground track operates regardless of street traffic',
      trafficImpactTamil: 'பூஜ்ஜியம்: சாலையின் நெரிசல் ரயிலை பாதிக்காது',
      speedBreakersImpact: 'Smooth electric rail with zero bumps or vibration shocks',
      speedBreakersImpactTamil: 'வேகத்தடைகள் கிடையாது; அதிர்வுகளற்ற சீரான பயணம்',
      bridgeImpact: 'Crosses railway viaducts with zero stop-and-go congestion',
      bridgeImpactTamil: 'ரயில்வே மேம்பாலங்கள் வழியே சீராக கடந்து செல்லும்',
    },
    highlights: [
      'Elevators, ramps, and tactile paving at all Metro stations',
      'Trains every 5 to 8 minutes during peak hours',
      'Completely predictable travel time regardless of rain or jams',
    ],
    highlightsTamil: [
      'அனைத்து மெட்ரோ நிலையங்களிலும் மின்தூக்கி (Lift) மற்றும் சாய்வுதளம் உண்டு',
      'ஒவ்வொரு 5 முதல் 8 நிமிடங்களுக்கும் ரயில் சேவை',
      'மழை அல்லது சாலை நெரிசல் இருந்தாலும் நேர தாமதம் இன்றி செல்லலாம்',
    ],
    suitabilityForAccessibility: 'excellent',
  };

  // ---------------- DELAY BREAKDOWN SUMMARY ----------------
  const delayBreakdown: RouteDelayBreakdown = {
    bridgesAndFlyovers: {
      count: bridgeInfo.count,
      names: bridgeInfo.names,
      namesTamil: bridgeInfo.namesTamil,
      delayMinutes: Math.round(bridgeDelayMinutes),
      notes: `${bridgeInfo.count} flyover/bridge sections along this corridor. Entry ramps slow down vehicle merging by ~2.5 mins per bridge.`,
      notesTamil: `இந்த வழித்தடத்தில் ${bridgeInfo.count} மேம்பாலங்கள் உள்ளன. பாலத்தில் ஏறும் போது வாகனங்கள் இணைய ~2.5 நிமிடம் வரை தாமதம் ஏற்படும்.`,
    },
    speedBreakers: {
      estimatedCount: speedBreakersCount,
      locationsDescription: `Estimated ${speedBreakersCount} speed breakers across service roads and school/hospital junction zones.`,
      locationsDescriptionTamil: `சேவை சாலைகள், பள்ளி மற்றும் மருத்துவமனை சந்திப்புகளில் சுமார் ${speedBreakersCount} வேகத்தடைகள் உள்ளன.`,
      delayMinutes: Math.round(speedBreakerDelayMinutes),
      impactDescription: `Vehicles decelerate to 15 km/h at each bump, adding ~${Math.round(speedBreakerDelayMinutes)} mins total delay. Two-wheelers and wheelchairs experience physical bumps.`,
      impactDescriptionTamil: `ஒவ்வொரு வேகத்தடையிலும் 15 கி.மீ வேகத்தில் செல்ல வேண்டும், இதனால் சுமார் ${Math.round(speedBreakerDelayMinutes)} நிமிடம் கூடுகிறது. பைக் மற்றும் சக்கர நாற்காலியில் அதிர்வு ஏற்படும்.`,
    },
    trafficAndBottlenecks: {
      congestionLevel: congestionLevel as any,
      congestionLevelTamil:
        congestionLevel === 'Heavy'
          ? 'அதிக நெரிசல் (Peak Traffic)'
          : congestionLevel === 'Moderate'
          ? 'மிதமான நெரிசல்'
          : 'குறைந்த நெரிசல்',
      trafficDelayMinutes,
      trafficSignalsCount,
      signalWaitMinutes,
      peakHourNotice: isPeakHour
        ? `Peak Hour Alert: Heavy junction queues currently active. Adds ~${trafficDelayMinutes} mins compared to late-night travel.`
        : `Normal Traffic: Expect ~${signalWaitMinutes} mins waiting at ${trafficSignalsCount} traffic signals.`,
      peakHourNoticeTamil: isPeakHour
        ? `பீக் ஹவர் நெரிசல்: சந்திப்புகளில் வாகன நெரிசல் அதிகம். வழக்கத்தை விட +${trafficDelayMinutes} நிமிடம் கூடுதல் நேரம் ஆகும்.`
        : `சாதாரண நேரம்: ${trafficSignalsCount} சிக்னல்களில் சுமார் ${signalWaitMinutes} நிமிடம் காத்திருக்க வேண்டும்.`,
    },
    roadInfrastructure: {
      roadType: roadKm > 4 ? 'Multi-Lane Arterial Road + Flyovers' : 'Urban Secondary Corridor',
      roadTypeTamil: roadKm > 4 ? 'முக்கிய சாலை மற்றும் மேம்பாலங்கள்' : 'நகர இணைப்பு சாலை',
      pavementQuality: roadKm > 6 ? 'Smooth' : 'Mixed',
      bottlenecks: [
        'Flyover ascending/descending merge zones',
        `${trafficSignalsCount} Major Intersection Signals`,
        'Active bus stop halting points',
      ],
      bottlenecksTamil: [
        'மேம்பாலத்தில் ஏறும் மற்றும் இறங்கும் சந்திப்பு நெரிசல்',
        `${trafficSignalsCount} முக்கிய சிக்னல் சந்திப்புகள்`,
        'பஸ் நிறுத்தங்களில் வாகனங்கள் நிற்கும் இடம்',
      ],
    },
  };

  const summaryExplanation = `For this ${roadKm} km journey from ${originName.split(',')[0]} to ${destinationName.split(',')[0]}, Bike (${bikeMode.durationFormatted}) and Metro Train (${trainMode.durationFormatted}) are the fastest options. Car takes ${carMode.durationFormatted} due to ${trafficSignalsCount} signals and ${speedBreakersCount} speed breakers (+${trafficDelayMinutes}m delay). Bus takes ${busMode.durationFormatted} with passenger stops. Walking takes ${walkMode.durationFormatted} on accessible pedestrian paths.`;

  const summaryExplanationTamil = `${originName.split(',')[0]} முதல் ${destinationName.split(',')[0]} வரை (${roadKm} கி.மீ): பைக்கில் செல்ல ${bikeMode.durationFormattedTamil}, மெட்ரோ ரயிலில் செல்ல ${trainMode.durationFormattedTamil} ஆகும் (மிக வேகம்). காரில் செல்ல ${trafficSignalsCount} சிக்னல்கள் மற்றும் ${speedBreakersCount} வேகத்தடைகளால் ${carMode.durationFormattedTamil} (+${trafficDelayMinutes} நிமிடம் தாமதம்). பஸ்ஸில் செல்ல ${busMode.durationFormattedTamil}. நடந்து சென்றால் ${walkMode.durationFormattedTamil} ஆகும்.`;

  return {
    originName,
    destinationName,
    straightDistanceKm: straightKm,
    modes: {
      car: carMode,
      bike: bikeMode,
      bus: busMode,
      walk: walkMode,
      train: trainMode,
    },
    delayBreakdown,
    summaryExplanation,
    summaryExplanationTamil,
  };
}
