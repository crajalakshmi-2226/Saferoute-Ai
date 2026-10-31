import React, { useState } from 'react';
import {
  Car,
  Bike,
  Bus,
  Footprints,
  Train,
  Clock,
  Navigation,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Zap,
  Info,
  Layers,
  Sparkles,
  DollarSign
} from 'lucide-react';
import {
  MultiModalComparisonResult,
  TransitModeData,
} from '../services/multiModalService';
import { Language } from '../utils/translations';

interface Props {
  data: MultiModalComparisonResult;
  language: Language;
}

export const MultiModalComparisonCard: React.FC<Props> = ({ data, language }) => {
  const [selectedMode, setSelectedMode] = useState<'car' | 'bike' | 'bus' | 'walk' | 'train'>('car');
  const [isWhyOpen, setIsWhyOpen] = useState(true);

  const isTamil = language === 'ta';
  const modes = [data.modes.car, data.modes.bike, data.modes.bus, data.modes.walk, data.modes.train];
  const activeMode = data.modes[selectedMode];

  const getModeIcon = (id: string) => {
    switch (id) {
      case 'car':
        return <Car className="w-5 h-5" />;
      case 'bike':
        return <Bike className="w-5 h-5" />;
      case 'bus':
        return <Bus className="w-5 h-5" />;
      case 'walk':
        return <Footprints className="w-5 h-5" />;
      case 'train':
        return <Train className="w-5 h-5" />;
      default:
        return <Navigation className="w-5 h-5" />;
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
              {isTamil ? 'வாகன வழித்தட ஒப்பீடு' : 'Multi-Modal Travel Time Comparison'}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-white mt-1">
            {isTamil
              ? `${data.originName.split(',')[0]} ➔ ${data.destinationName.split(',')[0]}`
              : `${data.originName.split(',')[0]} ➔ ${data.destinationName.split(',')[0]}`}
          </h3>
          <p className="text-xs text-slate-400">
            {isTamil
              ? 'கார், பைக், பஸ், நடை மற்றும் ரயிலில் செல்ல எவ்வளவு நேரம் ஆகும்?'
              : 'Travel duration comparison across Car, Bike, Bus, Walk & Metro/Train'}
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs font-mono font-bold text-slate-200">
            {data.straightDistanceKm} km
          </div>
          <div className="text-[10px] text-slate-400">
            {isTamil ? 'நேரடி தூரம்' : 'Direct Distance'}
          </div>
        </div>
      </div>

      {/* 5-Mode Quick Select Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {modes.map((mode) => {
          const isSelected = selectedMode === mode.modeId;

          return (
            <button
              key={mode.modeId}
              type="button"
              onClick={() => setSelectedMode(mode.modeId)}
              className={`p-3 rounded-2xl border text-left transition relative cursor-pointer ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500/50 shadow-lg'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              {mode.modeId === 'bike' && (
                <span className="absolute -top-2 right-2 text-[9px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full uppercase">
                  {isTamil ? 'வேகம்' : 'Fastest'}
                </span>
              )}
              {mode.modeId === 'train' && (
                <span className="absolute -top-2 right-2 text-[9px] font-bold bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-full uppercase">
                  {isTamil ? 'நோ-ட்ராஃபிக்' : 'No Jam'}
                </span>
              )}

              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-xl ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {getModeIcon(mode.modeId)}
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-200 block truncate">
                    {isTamil ? mode.modeNameTamil.split('/')[0] : mode.modeName.split('/')[0]}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {mode.distanceKm} km
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                <div className="text-sm font-black font-mono text-white">
                  {isTamil ? mode.durationFormattedTamil : mode.durationFormatted}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  {mode.costEstimate.split('(')[0]}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Mode Detailed Breakdown Pill */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {getModeIcon(activeMode.modeId)}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{isTamil ? activeMode.modeNameTamil : activeMode.modeName}</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-cyan-300 font-mono">
                  {activeMode.speedKmh} km/h avg
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isTamil ? activeMode.delayNoticeTamil : activeMode.delayNotice}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {activeMode.costEstimate}
            </span>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800">
          {(isTamil ? activeMode.highlightsTamil : activeMode.highlights).map((hl, i) => (
            <div
              key={i}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/60 text-[11px] text-slate-300 flex items-start gap-1.5"
            >
              <span className="text-blue-400 font-bold shrink-0">•</span>
              <span>{hl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* "Why does it take this much time?" Accordion (Bridges, Speedbreakers, Traffic) */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsWhyOpen(!isWhyOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">
                {isTamil
                  ? 'ஏன் இவ்வளவு நேரம் ஆகிறது? (பாலங்கள், வேகத்தடை & டிராஃபிக்)'
                  : 'Why does it take this much time? (Bridges, Speedbreakers & Traffic)'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {isTamil
                  ? 'வழியில் உள்ள பாலங்கள், ஸ்பீட்பிரேக்கர்கள் மற்றும் நெரிசல் பகுப்பாய்வு'
                  : 'Detailed breakdown of delay factors along this specific route'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-blue-400 font-semibold hidden sm:inline">
              {isWhyOpen ? (isTamil ? 'மறைக்கவும்' : 'Collapse') : (isTamil ? 'விரிவாக்கு' : 'Expand')}
            </span>
            {isWhyOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {isWhyOpen && (
          <div className="p-4 pt-1 border-t border-slate-800 space-y-3.5 text-xs animate-in fade-in duration-200">
            {/* Quick Summary Pill */}
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-200 text-xs leading-relaxed">
              <span className="font-bold text-cyan-300 mr-1.5">⚡ {isTamil ? 'ஆய்வு சுருக்கம்:' : 'Route Analysis:'}</span>
              {isTamil ? data.summaryExplanationTamil : data.summaryExplanation}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Bridges & Flyovers */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    {isTamil ? 'பாலங்கள் / மேம்பாலம்' : 'Bridges & Flyovers'}
                  </span>
                  <span className="text-xs font-black font-mono text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/30">
                    {data.delayBreakdown.bridgesAndFlyovers.count} {isTamil ? 'பாலங்கள்' : 'Active'}
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-white">
                  {(isTamil
                    ? data.delayBreakdown.bridgesAndFlyovers.namesTamil
                    : data.delayBreakdown.bridgesAndFlyovers.names
                  ).join(', ')}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isTamil
                    ? data.delayBreakdown.bridgesAndFlyovers.notesTamil
                    : data.delayBreakdown.bridgesAndFlyovers.notes}
                </p>

                <div className="text-[10px] text-indigo-300 font-mono bg-indigo-950/40 p-1.5 rounded-lg border border-indigo-500/20">
                  ⏱️ {isTamil ? 'பாலம் ஏறும் தாமதம்:' : 'Ramp merge delay:'} +{data.delayBreakdown.bridgesAndFlyovers.delayMinutes} mins
                </div>
              </div>

              {/* 2. Speedbreakers & Road Bumps */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    {isTamil ? 'வேகத்தடைகள் (Bumps)' : 'Speedbreakers'}
                  </span>
                  <span className="text-xs font-black font-mono text-amber-400 px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500/30">
                    ~{data.delayBreakdown.speedBreakers.estimatedCount} {isTamil ? 'தடைகள்' : 'Bumps'}
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-white">
                  {isTamil
                    ? data.delayBreakdown.speedBreakers.locationsDescriptionTamil
                    : data.delayBreakdown.speedBreakers.locationsDescription}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isTamil
                    ? data.delayBreakdown.speedBreakers.impactDescriptionTamil
                    : data.delayBreakdown.speedBreakers.impactDescription}
                </p>

                <div className="text-[10px] text-amber-300 font-mono bg-amber-950/40 p-1.5 rounded-lg border border-amber-500/20">
                  🛑 {isTamil ? 'வேகத்தடை தாமதம்:' : 'Speed breaker delay:'} +{data.delayBreakdown.speedBreakers.delayMinutes} mins
                </div>
              </div>

              {/* 3. Traffic & Signals */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    {isTamil ? 'டிராஃபிக் & சிக்னல்கள்' : 'Traffic & Signals'}
                  </span>
                  <span className="text-xs font-black font-mono text-rose-400 px-2 py-0.5 rounded-full bg-rose-950 border border-rose-500/30">
                    {data.delayBreakdown.trafficAndBottlenecks.trafficSignalsCount} {isTamil ? 'சிக்னல்கள்' : 'Signals'}
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-white">
                  {isTamil
                    ? data.delayBreakdown.trafficAndBottlenecks.congestionLevelTamil
                    : `${data.delayBreakdown.trafficAndBottlenecks.congestionLevel} Congestion`}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isTamil
                    ? data.delayBreakdown.trafficAndBottlenecks.peakHourNoticeTamil
                    : data.delayBreakdown.trafficAndBottlenecks.peakHourNotice}
                </p>

                <div className="text-[10px] text-rose-300 font-mono bg-rose-950/40 p-1.5 rounded-lg border border-rose-500/20">
                  🚦 {isTamil ? 'சிக்னல் & நெரிசல் தாமதம்:' : 'Signal & Jam delay:'} +{data.delayBreakdown.trafficAndBottlenecks.trafficDelayMinutes} mins
                </div>
              </div>
            </div>

            {/* Road Quality and Bottlenecks */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300 font-semibold">
                  {isTamil ? 'சாலை வகை:' : 'Corridor Classification:'}
                </span>
                <span className="text-white font-mono">
                  {isTamil
                    ? data.delayBreakdown.roadInfrastructure.roadTypeTamil
                    : data.delayBreakdown.roadInfrastructure.roadType}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">{isTamil ? 'முக்கிய நெரிசல் பகுதிகள்:' : 'Bottlenecks:'}</span>
                <span className="text-cyan-400 font-medium">
                  {(isTamil
                    ? data.delayBreakdown.roadInfrastructure.bottlenecksTamil
                    : data.delayBreakdown.roadInfrastructure.bottlenecks
                  ).join(' • ')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
