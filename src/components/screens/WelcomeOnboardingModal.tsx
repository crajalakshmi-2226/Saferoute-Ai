import React, { useState } from 'react';
import {
  Shield,
  Accessibility,
  AlertTriangle,
  Compass,
  CheckCircle2,
  ArrowRight,
  X
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeOnboardingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Routes that understand you',
      subtitle: 'Welcome to SafeRoute AI',
      description:
        'Standard navigation apps prioritize the fastest path, ignoring stairs, steep inclines, uneven cobblestones, or broken curb ramps. SafeRoute AI changes that by putting your physical mobility needs first.',
      icon: <Shield className="w-8 h-8 text-blue-400" />,
      tag: 'Human-Centric Navigation',
    },
    {
      title: 'Transparent Multi-Factor Scoring',
      subtitle: 'Weighted for real-world safety',
      description:
        'Every route is mathematically scored using 4 explicit factors: Accessibility (40%), Safety (25%), Your Personal Preferences (25%), and Distance (10%). Shortest distance never wins if it leads you down a flight of stairs.',
      icon: <Accessibility className="w-8 h-8 text-cyan-400" />,
      tag: 'Explainable AI Routing',
    },
    {
      title: 'Crowdsourced & Computer Vision Intelligence',
      subtitle: 'Real-time urban barrier detection',
      description:
        'Discover verified lift outages, ongoing sidewalk construction, and narrow passageways. Use our multimodal camera scanner to inspect sidewalk conditions with Gemini in real time.',
      icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
      tag: 'Live Infrastructure Telemetry',
    },
  ];

  const current = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      localStorage.setItem('saferoute_onboarding_seen', 'true');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 text-slate-100 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            localStorage.setItem('saferoute_onboarding_seen', 'true');
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-8 bg-blue-500' : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700">
              {current.icon}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                {current.tag}
              </span>
              <h2 className="text-lg font-extrabold text-white mt-1">{current.title}</h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-normal bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            {current.description}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              localStorage.setItem('saferoute_onboarding_seen', 'true');
              onClose();
            }}
            className="text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Skip Intro
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
          >
            <span>{step === steps.length - 1 ? 'Get Started' : 'Next'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
