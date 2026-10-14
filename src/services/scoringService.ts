import {
  MobilityProfile,
  MobilityPreferences,
  RouteAlternative,
  RouteStep,
  BarrierReport,
  ScoringWeights,
} from '../types';

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  accessibility: 40,
  safety: 25,
  preference: 25,
  distance: 10,
};

// Haversine formula to compute distance in meters between two [lng, lat] points
export function distanceBetweenCoordsMeters(
  c1: [number, number],
  c2: [number, number]
): number {
  const R = 6371e3; // Earth radius in meters
  const dLat = ((c2[1] - c1[1]) * Math.PI) / 180;
  const dLng = ((c2[0] - c1[0]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1[1] * Math.PI) / 180) *
      Math.cos((c2[1] * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Check if a barrier is within threshold meters of any segment of a route line
export function findIntersectingBarriers(
  coordinates: [number, number][],
  barriers: BarrierReport[],
  thresholdMeters: number = 35
): { barrier: BarrierReport; minDistance: number }[] {
  const hits: { barrier: BarrierReport; minDistance: number }[] = [];

  for (const b of barriers) {
    let minD = Infinity;
    // Sample along the route coordinates
    for (let i = 0; i < coordinates.length; i++) {
      const d = distanceBetweenCoordsMeters(coordinates[i], [b.lng, b.lat]);
      if (d < minD) {
        minD = d;
      }
    }
    if (minD <= thresholdMeters) {
      hits.push({ barrier: b, minDistance: minD });
    }
  }

  return hits;
}

export function evaluateRoute(
  rawRoute: any,
  index: number,
  profile: MobilityProfile,
  preferences: MobilityPreferences,
  knownBarriers: BarrierReport[],
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): RouteAlternative {
  const distanceMeters = Math.round(rawRoute.distance);
  const durationMinutes = Math.round((rawRoute.duration / 60) * 10) / 10;
  const coordinates: [number, number][] = rawRoute.geometry?.coordinates || [];

  // Parse raw steps from Directions API
  const steps: RouteStep[] = (rawRoute.legs?.[0]?.steps || []).map((s: any) => {
    const instruction = s.maneuver?.instruction || s.name || 'Walk along pathway';
    let accessibilityNote: string | undefined = undefined;
    let barrierRisk: 'none' | 'low' | 'medium' | 'high' = 'none';

    // Scan step instructions for keywords
    const lower = instruction.toLowerCase();
    if (lower.includes('step') || lower.includes('stair')) {
      accessibilityNote = 'Potential steps or flight of stairs detected in pathway instruction.';
      barrierRisk = 'high';
    } else if (lower.includes('ramp')) {
      accessibilityNote = 'Ramp transition indicated.';
      barrierRisk = 'none';
    } else if (lower.includes('cross') || lower.includes('crosswalk')) {
      accessibilityNote = 'Pedestrian street crossing.';
      barrierRisk = 'low';
    }

    return {
      instruction,
      distanceMeters: Math.round(s.distance),
      durationSeconds: Math.round(s.duration),
      name: s.name || '',
      maneuver: {
        type: s.maneuver?.type || 'turn',
        modifier: s.maneuver?.modifier,
        location: s.maneuver?.location || [0, 0],
      },
      accessibilityNote,
      barrierRisk,
    };
  });

  // Find physical barriers intersecting this route
  const intersecting = findIntersectingBarriers(coordinates, knownBarriers, 40);

  // 1. Accessibility Score (Base 100, penalized by known barriers and obstacles)
  let accessibilityScore = 95;
  const detectedObstacles: RouteAlternative['detectedObstacles'] = [];
  const rankingReasons: string[] = [];
  const positiveSignals: string[] = [];

  for (const item of intersecting) {
    const b = item.barrier;
    let penalty = 0;
    if (b.severity === 'impassable') penalty = 40;
    else if (b.severity === 'high') penalty = 25;
    else if (b.severity === 'medium') penalty = 15;
    else penalty = 8;

    // Severity amplification based on profile
    if (profile.id === 'wheelchair' && (b.type === 'stairs' || b.type === 'missing_curb_cut' || b.type === 'broken_lift')) {
      penalty = Math.min(penalty * 1.5, 50);
      rankingReasons.push(`Intersected known severe barrier for wheelchair users: ${b.title}`);
    } else if (profile.id === 'elderly' && (b.type === 'stairs' || b.type === 'steep_slope' || b.type === 'uneven_surface')) {
      penalty = Math.min(penalty * 1.3, 40);
      rankingReasons.push(`Intersected fall-risk barrier for seniors: ${b.title}`);
    } else if (profile.id === 'visual_assistance' && (b.type === 'construction' || b.type === 'narrow_path')) {
      penalty = Math.min(penalty * 1.4, 40);
      rankingReasons.push(`Intersected low-visibility barrier: ${b.title}`);
    }

    accessibilityScore -= penalty;
    detectedObstacles.push({
      type: b.type,
      description: b.title,
      severity: b.severity,
      location: [b.lng, b.lat],
    });
  }

  // Check step instruction stairs
  const hasStepStairs = steps.some((s) => s.barrierRisk === 'high');
  if (hasStepStairs && preferences.avoidStairs) {
    accessibilityScore -= 30;
    rankingReasons.push('Standard walking directions contain steps or stair flight.');
  }

  accessibilityScore = Math.max(10, Math.min(100, Math.round(accessibilityScore)));

  // 2. Safety Score (Pedestrian crossings, lighting, reports)
  let safetyScore = 90;
  const crossingSteps = steps.filter((s) => s.instruction.toLowerCase().includes('cross'));
  if (crossingSteps.length > 3) {
    safetyScore -= (crossingSteps.length - 3) * 5;
    rankingReasons.push(`Route contains ${crossingSteps.length} road crossings.`);
  } else {
    positiveSignals.push('Minimal road crossings along trajectory.');
  }
  safetyScore = Math.max(20, Math.min(100, Math.round(safetyScore)));

  // 3. User Preferences Score
  let preferenceScore = 95;
  if (preferences.avoidStairs && hasStepStairs) {
    preferenceScore -= 35;
  }
  if (preferences.maxWalkingDistanceMeters && distanceMeters > preferences.maxWalkingDistanceMeters) {
    const overageKm = (distanceMeters - preferences.maxWalkingDistanceMeters) / 1000;
    preferenceScore -= Math.min(30, Math.round(overageKm * 20));
    rankingReasons.push(`Distance exceeds user preferred walk target of ${preferences.maxWalkingDistanceMeters}m.`);
  } else {
    positiveSignals.push('Within configured walking endurance target.');
  }
  preferenceScore = Math.max(15, Math.min(100, Math.round(preferenceScore)));

  // 4. Distance Score (Normalized 0 - 100 based on standard pedestrian scale)
  // Distance penalty applied consistently so shortest does not override accessibility
  const baseIdealDist = 600; // 600m baseline
  let distanceScore = Math.max(20, Math.min(100, Math.round(100 - (Math.max(0, distanceMeters - baseIdealDist) / 100))));

  // Overall Suitability Score with normalized weights:
  // Default: Accessibility 40%, Safety 25%, Preferences 25%, Distance 10%
  const totalWeight =
    (weights.accessibility + weights.safety + weights.preference + weights.distance) || 100;
  const normAccess = weights.accessibility / totalWeight;
  const normSafety = weights.safety / totalWeight;
  const normPref = weights.preference / totalWeight;
  const normDist = weights.distance / totalWeight;

  const overallSuitabilityScore = Math.max(
    5,
    Math.min(
      100,
      Math.round(
        accessibilityScore * normAccess +
        safetyScore * normSafety +
        preferenceScore * normPref +
        distanceScore * normDist
      )
    )
  );

  if (detectedObstacles.length === 0) {
    positiveSignals.push('Zero active community barriers reported along corridor.');
  }

  const missingInformationNotes: string[] = [
    'Sidewalk surface slope gradient and real-time curb-cut flushness not provided by standard walking API.',
    'Elevator real-time mechanical uptime subject to transit agency operations.'
  ];

  return {
    id: `route-opt-${index + 1}`,
    name: index === 0 ? 'Primary Safe Corridor' : `Alternative Route ${index + 1}`,
    distanceMeters,
    durationMinutes,
    geometry: {
      type: 'LineString',
      coordinates,
    },
    steps,
    overallSuitabilityScore,
    accessibilityScore,
    safetyScore,
    preferenceScore,
    distanceScore,
    detectedObstacles,
    positiveSignals,
    rankingReasons,
    dataConfidence: 85,
    missingInformationNotes,
  };
}
