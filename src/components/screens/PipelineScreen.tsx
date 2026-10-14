import React from 'react';
import {
  GitCommit,
  UserCheck,
  MapPin,
  AlertTriangle,
  Sliders,
  Sparkles,
  Navigation,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Eye,
  Camera,
  Layers,
  Compass
} from 'lucide-react';

interface Props {
  onGoToPlanner: () => void;
}

export const PipelineScreen: React.FC<Props> = ({ onGoToPlanner }) => {
  const pipelineSteps = [
    {
      num: 1,
      title: 'Step 1 — User Profile',
      icon: UserCheck,
      color: 'blue',
      description:
        'Collects the user’s mobility profile (wheelchair, elderly, visual assistance, cane/walking difficulty, temporary injury) and explicit constraints (avoid stairs, prefer ramps, max walking distance, spoken guidance).',
      outputs: 'Structured Mobility Preference Profile & Distance Threshold',
    },
    {
      num: 2,
      title: 'Step 2 — Spatial Data Acquisition',
      icon: MapPin,
      color: 'cyan',
      description:
        'Retrieves high-accuracy browser geolocation, Mapbox vector sidewalk geometries, pedestrian street networks, and locality data without storing intrusive position logs.',
      outputs: 'Real-time GPS Coordinate & Candidate Walking Network Corridors',
    },
    {
      num: 3,
      title: 'Step 3 — Barrier Detection & Classification',
      icon: AlertTriangle,
      color: 'amber',
      description:
        'Intersects spatial corridors against physical barrier intelligence. Classifies data into 4 distinct verification categories:',
      fourClasses: [
        { label: 'Verified Audits', note: 'Municipal surveys & certified field audits' },
        { label: 'Community Reports', note: 'Pedestrian reports with confirmation counts' },
        { label: 'AI-Predicted Obstacles', note: 'Gemini 3.8 Flash multimodal vision detections with confidence %' },
        { label: 'Unknown Conditions', note: 'Unsurveyed sidewalk segments explicitly flagged' },
      ],
      outputs: 'Spatial Barrier Matrix across Candidate Paths',
    },
    {
      num: 4,
      title: 'Step 4 — Accessibility Scoring',
      icon: Sliders,
      color: 'indigo',
      description:
        'Computes component scores normalized to a 0–100 scale using the configurable formula: Accessibility (40%), Safety (25%), User Preference Match (25%), and Travel Distance (10%). Distance penalty ensures the shortest path does not override safety.',
      outputs: 'Normalized Suitability Score (0–100) per Alternative',
    },
    {
      num: 5,
      title: 'Step 5 — Route Optimization & Ranking',
      icon: Sparkles,
      color: 'purple',
      description:
        'Ranks available walking candidates from highest to lowest suitability for the specific mobility profile. Synthesizes transparent reasons explaining why the primary corridor won.',
      outputs: 'Ranked Feasible Routes with Grounded Explainability',
    },
    {
      num: 6,
      title: 'Step 6 — Personalized Navigation',
      icon: Navigation,
      color: 'emerald',
      description:
        'Provides visual and voice guidance (Web Speech API) with step maneuvers, elevation awareness, obstacle proximity warnings, and dynamic rerouting if a blocked corridor is encountered.',
      outputs: 'Interactive Live Guidance, Auditory Turn Cues, & Post-Trip Survey',
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
            Technical Architecture
          </span>
        </div>
        <h1 className="text-lg font-extrabold text-white">End-to-End Technical Pipeline</h1>
        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
          SafeRoute AI replaces generic shortest-distance algorithms with a 6-stage human-centric routing pipeline. Every route recommendation is grounded in factual data and transparent weights.
        </p>
      </div>

      {/* Comparison: Conventional vs SafeRoute AI */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>Core Innovation: Conventional Navigation vs. SafeRoute AI</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Conventional */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-slate-400 font-bold">
              <span>Conventional Navigation</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded">Standard GPS</span>
            </div>
            <ul className="space-y-2 text-slate-400 text-[11px] list-disc list-inside">
              <li><strong className="text-slate-300">Distance-Focused:</strong> Solves for absolute shortest distance or fastest vehicle time.</li>
              <li><strong className="text-slate-300">Stair Ignorance:</strong> Frequently directs pedestrians down flights of steps or high curbs.</li>
              <li><strong className="text-slate-300">One-Size-Fits-All:</strong> Assumes all pedestrians possess identical physical mobility.</li>
              <li><strong className="text-slate-300">Black Box:</strong> Gives zero explanation for why a route was chosen over alternatives.</li>
              <li><strong className="text-slate-300">No Barrier Tracking:</strong> Blind to broken elevators, scaffolding, or missing curb cuts.</li>
            </ul>
          </div>

          {/* SafeRoute AI */}
          <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/40 space-y-2.5">
            <div className="flex items-center justify-between text-blue-300 font-bold">
              <span>SafeRoute AI System</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono">Person-First</span>
            </div>
            <ul className="space-y-2 text-slate-300 text-[11px] list-disc list-inside">
              <li><strong className="text-white">Human-Centric:</strong> &ldquo;The best route is not the shortest; it is the route that works for the person.&rdquo;</li>
              <li><strong className="text-white">Barrier-Aware:</strong> Identifies stairs, steep slopes, narrow paths, and uneven surfaces.</li>
              <li><strong className="text-white">Multi-Factor Scoring:</strong> 40% Access, 25% Safety, 25% Preference, 10% Distance.</li>
              <li><strong className="text-white">Explainable AI:</strong> Explains exactly which physical barriers were bypassed and why.</li>
              <li><strong className="text-white">Multimodal Vision:</strong> Inspects sidewalk obstacles with computer vision in real time.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 6 Pipeline Stages */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          The 6-Stage Routing Pipeline
        </h2>

        <div className="space-y-3">
          {pipelineSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600/15 text-blue-400 border border-blue-500/30 font-extrabold text-sm font-mono">
                      {step.num}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{step.title}</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4 Data classification pill box if step 3 */}
                {step.fourClasses && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {step.fourClasses.map((cls, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                        <div className="font-bold text-amber-400">{cls.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{cls.note}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Output tag */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-500 uppercase text-[10px]">Pipeline Output:</span>
                  <span className="text-blue-300 font-medium">{step.outputs}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onGoToPlanner}
          className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
        >
          <span>Try Pipeline on Live Route</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
