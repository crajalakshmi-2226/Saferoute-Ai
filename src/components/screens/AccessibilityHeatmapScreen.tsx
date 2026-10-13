import React, { useState } from 'react';
import { Flame, ShieldCheck, MapPin, Layers, Info, Filter, ArrowUpRight } from 'lucide-react';
import { BarrierReport } from '../../types';

interface Props {
  barriers: BarrierReport[];
  onOpenMap: () => void;
}

interface ZoneMetric {
  id: string;
  name: string;
  district: string;
  curbCutDensityPercent: number;
  tactilePavingCoveragePercent: number;
  stairsWithoutRampsCount: number;
  overallRating: 'grade_a' | 'grade_b' | 'grade_c' | 'grade_d';
  lastSurveyed: string;
  auditAgency: string;
}

const ZONES: ZoneMetric[] = [
  {
    id: 'z-01',
    name: 'Civic Center & Transit Spine',
    district: 'Central Metro',
    curbCutDensityPercent: 94,
    tactilePavingCoveragePercent: 88,
    stairsWithoutRampsCount: 1,
    overallRating: 'grade_a',
    lastSurveyed: 'September 2026',
    auditAgency: 'Municipal Department of Pedestrian Access',
  },
  {
    id: 'z-02',
    name: 'Historic Financial East',
    district: 'Downtown District',
    curbCutDensityPercent: 78,
    tactilePavingCoveragePercent: 62,
    stairsWithoutRampsCount: 5,
    overallRating: 'grade_b',
    lastSurveyed: 'August 2026',
    auditAgency: 'Urban Accessibility Coalition Audit',
  },
  {
    id: 'z-03',
    name: 'Telegraph & South Slope',
    district: 'High Elevation District',
    curbCutDensityPercent: 42,
    tactilePavingCoveragePercent: 20,
    stairsWithoutRampsCount: 14,
    overallRating: 'grade_d',
    lastSurveyed: 'July 2026',
    auditAgency: 'Community Wheelchair Access Fieldwork',
  },
  {
    id: 'z-04',
    name: 'Bayside Promenade & Marina',
    district: 'Harbor Waterfront',
    curbCutDensityPercent: 98,
    tactilePavingCoveragePercent: 91,
    stairsWithoutRampsCount: 0,
    overallRating: 'grade_a',
    lastSurveyed: 'October 2026',
    auditAgency: 'State Coastal Access Commission',
  },
];

export const AccessibilityHeatmapScreen: React.FC<Props> = ({ barriers, onOpenMap }) => {
  const [selectedZone, setSelectedZone] = useState<ZoneMetric>(ZONES[0]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                Spatial Density & Coverage
              </span>
            </div>
            <h1 className="text-lg font-extrabold text-white mt-0.5">Accessibility Heatmap</h1>
            <p className="text-xs text-slate-400">
              Verified spatial distribution of curb cuts, tactile paving, and reported barrier concentrations.
            </p>
          </div>
        </div>
      </div>

      {/* Heatmap Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Flush Curb Cuts</span>
          <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">78.5%</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Citywide audited average</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Tactile Paving</span>
          <div className="text-xl font-extrabold text-blue-400 font-mono mt-1">65.2%</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Transit corridor coverage</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active Barriers</span>
          <div className="text-xl font-extrabold text-amber-400 font-mono mt-1">{barriers.length}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Current reported obstacles</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Step-Free Zones</span>
          <div className="text-xl font-extrabold text-cyan-400 font-mono mt-1">2 Districts</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Grade A compliance rating</p>
        </div>
      </div>

      {/* Zone Index Directory */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Audited Urban Sectors
          </h2>
          <span className="text-[11px] text-slate-400">Select sector to view breakdown</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ZONES.map((zone) => {
            const isSelected = selectedZone.id === zone.id;
            return (
              <div
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-md ring-1 ring-cyan-500/40'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white">{zone.name}</h3>
                    <span className="text-xs text-slate-400">{zone.district}</span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      zone.overallRating === 'grade_a'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : zone.overallRating === 'grade_b'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {zone.overallRating.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="bg-slate-900/80 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400">Curb Cuts</div>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5">
                      {zone.curbCutDensityPercent}%
                    </div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400">Tactile</div>
                    <div className="text-xs font-bold text-blue-400 mt-0.5">
                      {zone.tactilePavingCoveragePercent}%
                    </div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400">Step Risers</div>
                    <div className="text-xs font-bold text-amber-400 mt-0.5">
                      {zone.stairsWithoutRampsCount}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Sector Audit Detail Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Sector Audit Record: {selectedZone.name}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Surveyed: {selectedZone.lastSurveyed}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Ground inspection conducted by <strong>{selectedZone.auditAgency}</strong>. Features certified high-resolution pedestrian telemetry, slope inclinometer sweeps, and active crosswalk button audits.
        </p>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onOpenMap}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md transition"
          >
            <span>Explore on Map</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
