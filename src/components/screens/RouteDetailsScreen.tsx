import React, { useState, useEffect } from 'react';
import { RouteAlternative, MobilityProfile, MobilityPreferences, BarrierReport, ScoringWeights } from '../../types';
import { DEFAULT_SCORING_WEIGHTS } from '../../services/scoringService';
import {
  ArrowLeft,
  Navigation,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Footprints,
  Clock,
  Layers,
  FileText
} from 'lucide-react';

interface Props {
  route: RouteAlternative;
  onBack: () => void;
  onStartNavigation: (route: RouteAlternative) => void;
  activeProfile: MobilityProfile;
  activePreferences: MobilityPreferences;
  knownBarriers: BarrierReport[];
  scoringWeights?: ScoringWeights;
}

export const RouteDetailsScreen: React.FC<Props> = ({
  route,
  onBack,
  onStartNavigation,
  activeProfile,
  activePreferences,
  knownBarriers,
  scoringWeights = DEFAULT_SCORING_WEIGHTS,
}) => {
  const [explanation, setExplanation] = useState<string>('');
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [explainEngine, setExplainEngine] = useState<string>('');

  useEffect(() => {
    async function fetchExplanation() {
      setLoadingExplain(true);
      try {
        const res = await fetch('/api/route-explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            routeData: {
              distanceMeters: route.distanceMeters,
              durationMinutes: route.durationMinutes,
              accessibilityScore: route.accessibilityScore,
              safetyScore: route.safetyScore,
              preferenceScore: route.preferenceScore,
              suitabilityScore: route.overallSuitabilityScore,
            },
            mobilityProfile: activeProfile,
            preferences: activePreferences,
            knownBarriers: route.detectedObstacles,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setExplanation(data.explanation || '');
          setExplainEngine(data.generatedBy || 'engine');
        } else {
          setExplanation(
            `This route achieved an overall suitability score of ${route.overallSuitabilityScore}/100. Based on your ${activeProfile.name} profile, Accessibility (40%) and Safety (25%) received prioritized weighting over walking distance (10%).`
          );
        }
      } catch (err) {
        setExplanation(
          `This route was evaluated with ${route.overallSuitabilityScore}/100 suitability. It minimizes identified physical barriers and optimizes smooth sidewalk transitions for ${activeProfile.name}.`
        );
      } finally {
        setLoadingExplain(false);
      }
    }

    fetchExplanation();
  }, [route, activeProfile, activePreferences]);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Alternatives</span>
        </button>

        <button
          onClick={() => onStartNavigation(route)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md transition active:scale-95"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Follow Route</span>
        </button>
      </div>

      {/* Main Scorecard */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
              Route Analysis & Explainability
            </span>
            <h1 className="text-xl font-extrabold text-white mt-0.5">{route.name}</h1>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
              <span className="flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-slate-400" />
                {(route.distanceMeters / 1000).toFixed(2)} km
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {route.durationMinutes} min estimated
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <div className="text-center">
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                {route.overallSuitabilityScore}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Suitability</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center">
              <div className="text-sm font-bold text-blue-400 font-mono">
                {route.dataConfidence}%
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Confidence</div>
            </div>
          </div>
        </div>

        {/* 4 Factor Score Breakdown with Weights */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Multi-Factor Evaluation Weights
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Accessibility</span>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded font-mono">{scoringWeights.accessibility}%</span>
              </div>
              <div className="text-lg font-bold font-mono text-white mt-2">
                {route.accessibilityScore}<span className="text-xs text-slate-400">/100</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Step-free, ramps, level crosswalks</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Safety</span>
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded font-mono">{scoringWeights.safety}%</span>
              </div>
              <div className="text-lg font-bold font-mono text-white mt-2">
                {route.safetyScore}<span className="text-xs text-slate-400">/100</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Controlled crossings, lighting, reports</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Preferences</span>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded font-mono">{scoringWeights.preference}%</span>
              </div>
              <div className="text-lg font-bold font-mono text-white mt-2">
                {route.preferenceScore}<span className="text-xs text-slate-400">/100</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Profile fit & walking endurance limits</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Distance</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">{scoringWeights.distance}%</span>
              </div>
              <div className="text-lg font-bold font-mono text-white mt-2">
                {route.distanceScore}<span className="text-xs text-slate-400">/100</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Controlled penalty vs detour ratio</p>
            </div>
          </div>
        </div>

        {/* "Why This Route?" Section */}
        <div className="rounded-2xl bg-blue-950/30 border border-blue-500/30 p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Why this route is recommended:
              </h3>
            </div>
            {explainEngine && (
              <span className="text-[10px] font-mono text-slate-400">
                Engine: {explainEngine}
              </span>
            )}
          </div>

          {loadingExplain ? (
            <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span>Synthesizing transparent explanation...</span>
            </div>
          ) : (
            <div className="text-xs text-slate-200 leading-relaxed space-y-2 whitespace-pre-line">
              {explanation}
            </div>
          )}
        </div>

        {/* Known Obstacles & Missing Data Declarations */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Verified Physical Conditions & Transparency
          </h3>

          <div className="space-y-2">
            {route.detectedObstacles.length > 0 ? (
              route.detectedObstacles.map((obs, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white uppercase text-[10px] tracking-wide">
                      {obs.type.replace('_', ' ')} (Severity: {obs.severity})
                    </strong>
                    <p className="text-amber-200/90 mt-0.5">{obs.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero verified physical obstacles or step flights intersecting this path.</span>
              </div>
            )}

            {/* Factual Transparency on Missing Info */}
            {route.missingInformationNotes.map((note, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Turn-by-Turn Steps Preview */}
        {route.steps.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Step Guidance Preview ({route.steps.length} Steps)
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {route.steps.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-slate-200 font-medium">{s.instruction}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span>{s.distanceMeters}m</span>
                      {s.accessibilityNote && (
                        <span className="text-blue-400 font-semibold">• {s.accessibilityNote}</span>
                      )}
                    </div>
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
