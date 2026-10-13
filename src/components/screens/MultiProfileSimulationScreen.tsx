import React, { useState } from 'react';
import { RouteAlternative, BarrierReport } from '../../types';
import { MOBILITY_PROFILES } from '../../data/mobilityProfiles';
import { evaluateRoute } from '../../services/scoringService';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Info,
  Footprints,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface Props {
  sampleRoute?: RouteAlternative;
  knownBarriers: BarrierReport[];
  onOpenPlanner: () => void;
}

export const MultiProfileSimulationScreen: React.FC<Props> = ({
  sampleRoute,
  knownBarriers,
  onOpenPlanner,
}) => {
  // Benchmark mock / current corridor
  const mockGeo = sampleRoute?.geometry || {
    type: 'LineString',
    coordinates: [
      [-122.4194, 37.7749],
      [-122.4180, 37.7760],
      [-122.4165, 37.7780],
    ],
  };

  const rawRouteData = {
    distance: sampleRoute?.distanceMeters || 1200,
    duration: (sampleRoute?.durationMinutes || 15) * 60,
    geometry: mockGeo,
    legs: [
      {
        steps: [
          {
            instruction: 'Head north on Market St toward 8th St',
            distance: 400,
            duration: 300,
            maneuver: { type: 'depart', location: [-122.4194, 37.7749] },
          },
          {
            instruction: 'Cross pedestrian crossing with audible signal',
            distance: 50,
            duration: 60,
            maneuver: { type: 'turn', location: [-122.4180, 37.7760] },
          },
          {
            instruction: 'Ascend 4 stone steps or use adjacent 1:12 ramp to plaza',
            distance: 350,
            duration: 250,
            maneuver: { type: 'turn', location: [-122.4165, 37.7780] },
          },
        ],
      },
    ],
  };

  // Simulate scoring across all 4 key mobility profiles
  const profilesToSimulate = MOBILITY_PROFILES.filter((p) => p.id !== 'general_pedestrian');

  const simulatedResults = profilesToSimulate.map((profile) => {
    const scored = evaluateRoute(rawRouteData, 0, profile, profile.defaultPreferences, knownBarriers);
    return {
      profile,
      scored,
    };
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                Accessibility Twin & Simulation
              </span>
            </div>
            <h1 className="text-lg font-extrabold text-white mt-0.5">Multi-Profile Route Comparison</h1>
            <p className="text-xs text-slate-400">
              Evaluates identical corridor geometry across diverse mobility profiles to uncover differential barriers.
            </p>
          </div>
        </div>
      </div>

      {/* Corridor Benchmark Overview */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Tested Corridor</span>
          <h3 className="font-bold text-white text-sm">{sampleRoute?.name || 'Standard Urban Transit Corridor'}</h3>
          <p className="text-slate-400 font-mono text-[11px] mt-0.5">
            Distance: {((sampleRoute?.distanceMeters || 1200) / 1000).toFixed(2)} km · Duration: {sampleRoute?.durationMinutes || 15} min
          </p>
        </div>

        <button
          onClick={onOpenPlanner}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white transition active:scale-95 shrink-0"
        >
          <span>Plan Custom Route</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Side-by-Side Simulation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {simulatedResults.map(({ profile, scored }) => (
          <div
            key={profile.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  {profile.name}
                </span>
                <p className="text-xs text-slate-400 mt-1">{profile.tagline}</p>
              </div>

              {/* Suitability score badge */}
              <div className="text-right">
                <div className="text-xl font-extrabold font-mono text-emerald-400">
                  {scored.overallSuitabilityScore}
                  <span className="text-xs text-slate-500">/100</span>
                </div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Suitability</span>
              </div>
            </div>

            {/* Score Breakdown Bar */}
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <div className="text-slate-400">Access (40%)</div>
                <div className="text-xs font-bold text-blue-400 mt-0.5">{scored.accessibilityScore}</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <div className="text-slate-400">Safety (25%)</div>
                <div className="text-xs font-bold text-cyan-400 mt-0.5">{scored.safetyScore}</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <div className="text-slate-400">Match (25%)</div>
                <div className="text-xs font-bold text-indigo-400 mt-0.5">{scored.preferenceScore}</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <div className="text-slate-400">Dist (10%)</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">{scored.distanceScore}</div>
              </div>
            </div>

            {/* Profile-Specific Considerations */}
            <div className="space-y-1.5 pt-1">
              <div className="text-xs font-semibold text-slate-300">Profile-Specific Verdict:</div>
              {scored.rankingReasons.length > 0 ? (
                <div className="space-y-1 text-xs">
                  {scored.rankingReasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-amber-300 bg-amber-950/20 p-2 rounded-xl border border-amber-500/20">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-300 text-xs bg-emerald-950/20 p-2 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Excellent alignment with {profile.name} requirements.</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Accessibility Twin Disclaimer:</strong> Numerical suitability comparisons reflect algorithmic weighting and verified physical obstacle data. They are designed for comparative planning and do not purport to replicate the full lived physical experience of any individual.
        </p>
      </div>
    </div>
  );
};
