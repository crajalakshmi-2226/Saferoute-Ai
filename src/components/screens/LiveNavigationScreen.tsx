import React, { useState, useEffect } from 'react';
import { RouteAlternative, RouteStep, Coordinates, BarrierReport } from '../../types';
import { speechService } from '../../services/speechService';
import { MapboxMap } from '../MapboxMap';
import {
  Volume2,
  VolumeX,
  Navigation,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  X,
  Compass,
  Footprints,
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface Props {
  route: RouteAlternative;
  allRoutes: RouteAlternative[];
  originCoordinates: Coordinates;
  destinationCoordinates: Coordinates;
  destinationName: string;
  onExitNavigation: () => void;
  onCompleteJourney: (route: RouteAlternative, barriersAvoided: number) => void;
  onOpenTokenSetup: () => void;
  knownBarriers: BarrierReport[];
}

export const LiveNavigationScreen: React.FC<Props> = ({
  route,
  allRoutes,
  originCoordinates,
  destinationCoordinates,
  destinationName,
  onExitNavigation,
  onCompleteJourney,
  onOpenTokenSetup,
  knownBarriers,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isRerouting, setIsRerouting] = useState(false);
  const [activeRoute, setActiveRoute] = useState<RouteAlternative>(route);
  const [simulatedDeviation, setSimulatedDeviation] = useState(false);

  const steps = activeRoute.steps;
  const currentStep: RouteStep | undefined = steps[currentStepIndex] || steps[0];

  // Speak initial instruction
  useEffect(() => {
    if (currentStep && !isMuted) {
      speechService.speak(currentStep.instruction);
    }
  }, [currentStepIndex, activeRoute, isMuted]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    speechService.setMuted(nextMuted);
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Arrived at destination
      speechService.speak('You have arrived at your destination.');
      onCompleteJourney(activeRoute, activeRoute.detectedObstacles.length);
    }
  };

  // Simulate dynamic rerouting when user encounters an unexpected obstacle
  const handleSimulateBarrierReroute = () => {
    setIsRerouting(true);
    speechService.speak('Barrier reported on forward pathway. Recalculating accessible bypass...');

    setTimeout(() => {
      // Switch to alternative route if available, or generate a safe bypass
      const nextAlt = allRoutes.find((r) => r.id !== activeRoute.id) || activeRoute;
      setActiveRoute(nextAlt);
      setCurrentStepIndex(0);
      setSimulatedDeviation(true);
      setIsRerouting(false);
      speechService.speak('Bypass route calculated. Turn right in 40 meters to take the level walkway.');
    }, 1500);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner Navigation Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                Live Walking Guidance
              </span>
              <h2 className="text-sm font-extrabold text-white truncate max-w-[200px] sm:max-w-md">
                {destinationName || 'Destination'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className={`p-2.5 rounded-xl border transition ${
                isMuted
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : 'bg-blue-600/20 text-blue-400 border-blue-500/30'
              }`}
              title={isMuted ? 'Unmute Voice Guidance' : 'Mute Voice Guidance'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onExitNavigation}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="End Navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Turn-by-Turn Maneuver Box */}
        <div className="mt-4 rounded-2xl bg-blue-950/60 border border-blue-500/40 p-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white mt-0.5">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-300 font-semibold">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
                <p className="text-base font-bold text-white mt-0.5 leading-snug">
                  {currentStep?.instruction || 'Continue straight along path'}
                </p>
                {currentStep?.accessibilityNote && (
                  <p className="text-xs text-cyan-300 font-medium mt-1">
                    ✓ {currentStep.accessibilityNote}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-base font-extrabold font-mono text-blue-400">
                {currentStep?.distanceMeters || 0}m
              </span>
              <span className="block text-[10px] text-slate-400">this leg</span>
            </div>
          </div>
        </div>

        {/* Progress & Quick Actions */}
        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3 font-mono text-slate-400 text-[11px]">
            <span>{(activeRoute.distanceMeters / 1000).toFixed(2)} km total</span>
            <span>•</span>
            <span>{activeRoute.durationMinutes} min ETA</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateBarrierReroute}
              disabled={isRerouting}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs text-amber-300 transition"
              title="Simulate encountering unexpected construction or steps"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRerouting ? 'animate-spin' : ''}`} />
              <span>Report Block / Reroute</span>
            </button>

            <button
              onClick={handleNextStep}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-bold text-white transition active:scale-95"
            >
              <span>{currentStepIndex === steps.length - 1 ? 'Arrive' : 'Next Step'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Rerouting feedback notice */}
        {simulatedDeviation && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Dynamic reroute active: Pathway verified to bypass detected obstacle.</span>
          </div>
        )}
      </div>

      {/* Live Mapbox Map Follower */}
      <MapboxMap
        currentLocation={originCoordinates}
        destinationCoordinates={destinationCoordinates}
        routes={[activeRoute]}
        selectedRouteIndex={0}
        barriers={knownBarriers}
        onOpenTokenSetup={onOpenTokenSetup}
        className="h-[420px] w-full"
      />
    </div>
  );
};
