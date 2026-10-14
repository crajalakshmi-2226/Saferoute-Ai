import React, { useState } from 'react';
import {
  HeartHandshake,
  GraduationCap,
  Bus,
  Building,
  TreePine,
  Globe2,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Milestone
} from 'lucide-react';

export const ImpactAndRoadmapScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'applications' | 'feasibility' | 'roadmap'>('applications');

  const applications = [
    {
      title: 'Healthcare & Hospital Campuses',
      icon: HeartHandshake,
      color: 'rose',
      description:
        'Safe navigation for patients with mobility aids, emergency triage drop-offs, step-free clinical department links, and accessible outpatient corridors.',
      targetBenefit: 'Independent patient arrival without unexpected stairs or high curbs.',
    },
    {
      title: 'Higher Education & School Campuses',
      icon: GraduationCap,
      color: 'blue',
      description:
        'Step-free classroom, laboratory, and library route planning for students, faculty, and visitors with temporary or permanent mobility challenges.',
      targetBenefit: 'Equal access to academic facilities and lecture halls.',
    },
    {
      title: 'Public Transit: First & Last Mile',
      icon: Bus,
      color: 'cyan',
      description:
        'Guiding commuters to working station elevators, ramped platform entries, and tactile-paved transfer hubs, reducing missed transit connections.',
      targetBenefit: 'Eliminates stranded wheelchair commuters caused by broken station lifts.',
    },
    {
      title: 'Smart Cities & Municipal Infrastructure',
      icon: Building,
      color: 'indigo',
      description:
        'Data-driven insights for urban planners identifying high-barrier density clusters, missing curb ramps, and prioritizing capital accessibility repairs.',
      targetBenefit: 'Targeted municipal infrastructure investments.',
    },
    {
      title: 'Public Buildings & Civic Centers',
      icon: Building,
      color: 'purple',
      description:
        'Step-free entrance verification, wide automatic door access, and accessible restroom identification for municipal halls and courthouses.',
      targetBenefit: 'Fosters civic participation without physical access discrimination.',
    },
    {
      title: 'Public Parks & Recreational Spaces',
      icon: TreePine,
      color: 'emerald',
      description:
        'Grade-conscious routing through urban green spaces, avoiding steep gravel tracks and recommending stable, paved waterfront promenades.',
      targetBenefit: 'Inclusive access to nature, exercise, and social gathering spaces.',
    },
  ];

  const challengesAndMitigations = [
    {
      challenge: 'Incomplete Global Sidewalk Data',
      impact: 'Standard commercial maps lack fine-grained sidewalk curb-cut and slope telemetry.',
      mitigation: 'Crowdsourced community reporting, open data partnerships, and municipal audit datasets.',
      status: 'Implemented in SafeRoute AI',
    },
    {
      challenge: 'Computer Vision Real-World Precision',
      impact: 'Varying weather, nighttime lighting, and visual angles can affect automatic obstacle detection.',
      mitigation: 'Ground-truth field verification, explicit confidence score reporting, and human-in-the-loop review.',
      status: 'Active Safeguard',
    },
    {
      challenge: 'Indoor Complex Wayfinding',
      impact: 'GPS signals degrade significantly inside subterranean stations and multi-story hospitals.',
      mitigation: 'Future integration with Indoor Positioning Systems (IPS), BLE beacons, and IMDF floorplans.',
      status: 'Roadmap Phase 4',
    },
    {
      challenge: 'Dynamic Obstacles & Ephemeral Work',
      impact: 'Unplanned utility construction or parked delivery vehicles can block a pathway within minutes.',
      mitigation: 'One-tap live obstacle reporting with community confirmation voting and dynamic rerouting.',
      status: 'Implemented in SafeRoute AI',
    },
    {
      challenge: 'Privacy & User Location Protection',
      impact: 'Precise location history of people with disabilities is highly sensitive personal data.',
      mitigation: 'Client-side ephemeral location handling, zero continuous tracking, and no location log persistence.',
      status: 'Enforced Architecture',
    },
  ];

  const roadmapPhases = [
    {
      phase: 'Phase 1',
      title: 'Outdoor Accessible Routing & Personalization',
      status: 'Implemented',
      isComplete: true,
      points: [
        'Mapbox GL JS vector rendering with Mapbox Directions and Geocoding APIs',
        'Personalized mobility profiles (Wheelchair, Elderly, Visual, Walking Difficulty)',
        'Multi-factor scoring formula: 40% Access, 25% Safety, 25% Preference, 10% Distance',
        'Transparent explainability engine ("Why this route?")',
      ],
    },
    {
      phase: 'Phase 2',
      title: 'Crowdsourced Intelligence & Multimodal Vision',
      status: 'Implemented',
      isComplete: true,
      points: [
        'Community barrier reporting with categories (stairs, narrow paths, construction, broken lifts)',
        'Community verification and confirmation voting mechanism',
        'Server-side Gemini 3.8 Flash multimodal computer-vision barrier scanner',
        'Place Accessibility intelligence directory for key public facilities',
      ],
    },
    {
      phase: 'Phase 3',
      title: 'Real-Time Telemetry & Accessibility Heatmaps',
      status: 'Active / In Progress',
      isComplete: true,
      points: [
        'Urban sector accessibility heatmap density metrics (curb-cut and tactile coverage)',
        'Dynamic live rerouting upon encountering unexpected obstructions during navigation',
        'Spoken audio directions via Web Speech API with turn-by-turn guidance',
        'Accessibility Twin simulation across multiple mobility profiles simultaneously',
      ],
    },
    {
      phase: 'Phase 4',
      title: 'Indoor Navigation & Transit Hub Deep Integration',
      status: 'Planned',
      isComplete: false,
      points: [
        'Indoor Mapping Data Format (IMDF) integration for multi-level metro stations',
        'Live transit elevator mechanical uptime telemetry via GTFS-Realtime',
        'Bluetooth Low Energy (BLE) beacon integration for subterranean guidance',
      ],
    },
    {
      phase: 'Phase 5',
      title: 'Smart-City API Ecosystem & Municipal Dispatch',
      status: 'Planned',
      isComplete: false,
      points: [
        'Direct automated barrier export to municipal 311 public works repair queues',
        'Autonomous wheelchair fleet routing API protocols',
        'National spatial accessibility data standard compliance',
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Societal Vision & Expansion
          </span>
        </div>
        <h1 className="text-lg font-extrabold text-white">Impact, Feasibility & Future Roadmap</h1>
        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
          Designed to advance UN Sustainable Development Goals (SDG 10 &amp; SDG 11) by dismantling physical urban barriers through intelligent, human-centered spatial computing.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'applications'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Applications & SDGs</span>
        </button>

        <button
          onClick={() => setActiveTab('feasibility')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'feasibility'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Challenges & Mitigations</span>
        </button>

        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'roadmap'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Milestone className="w-3.5 h-3.5 text-purple-400" />
          <span>5-Phase Roadmap</span>
        </button>
      </div>

      {/* Tab 1: Applications & SDGs */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          {/* SDG Alignment Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-emerald-950/60 border border-blue-500/30 p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-cyan-400" />
              <span>United Nations Sustainable Development Goals (SDGs)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-600 text-white font-extrabold text-xs">
                    10
                  </span>
                  <h3 className="font-bold text-white text-xs">SDG 10: Reduced Inequalities</h3>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Target 10.2: Empower and promote the social, economic, and political inclusion of all, irrespective of age, sex, or disability, by eliminating navigational barriers to education, jobs, and community life.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-600 text-white font-extrabold text-xs">
                    11
                  </span>
                  <h3 className="font-bold text-white text-xs">SDG 11: Sustainable Cities & Communities</h3>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Target 11.2: Provide access to safe, affordable, accessible and sustainable transport systems for all, expanding public transport, with special attention to persons with disabilities and older persons.
                </p>
              </div>
            </div>
          </div>

          {/* Applications Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Target Practical Applications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {applications.map((app, idx) => {
                const Icon = app.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-2 shadow-md"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/20">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm text-white">{app.title}</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{app.description}</p>
                    <div className="pt-1 text-[11px] text-emerald-400 font-medium">
                      ✓ Target Outcome: {app.targetBenefit}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Feasibility, Challenges & Mitigations */}
      {activeTab === 'feasibility' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-2 text-xs">
            <h3 className="font-bold text-sm text-white">Technical Feasibility Pillars</h3>
            <p className="text-slate-400 leading-relaxed">
              SafeRoute AI is technically grounded in existing, proven technological foundations: high-accuracy browser geolocation, Mapbox GL JS vector graph rendering, Directions APIs, and on-demand multimodal vision models.
            </p>
          </div>

          <div className="space-y-3">
            {challengesAndMitigations.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono">
                      !
                    </span>
                    <span>{item.challenge}</span>
                  </h4>
                  <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[10px] font-semibold text-blue-300 whitespace-nowrap">
                    {item.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400">
                  <strong className="text-slate-300">Challenge Impact:</strong> {item.impact}
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Applied Mitigation: </strong>
                    <span>{item.mitigation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: 5-Phase Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {roadmapPhases.map((phase, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition space-y-3 shadow-md ${
                  phase.isComplete
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-slate-900/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                      {phase.phase}
                    </span>
                    <h4 className="font-bold text-sm text-white">{phase.title}</h4>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      phase.status === 'Implemented'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : phase.status.includes('Active')
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {phase.status}
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {phase.points.map((pt, pIdx) => (
                    <li key={pIdx} className="leading-relaxed">
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
