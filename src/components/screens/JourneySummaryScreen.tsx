import React, { useState } from 'react';
import { RouteAlternative, MobilityProfile } from '../../types';
import {
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Star,
  Send,
  ArrowRight,
  ShieldCheck,
  Footprints,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';

interface Props {
  completedRoute: RouteAlternative;
  barriersAvoidedCount: number;
  activeProfile: MobilityProfile;
  onFinish: () => void;
  onReportBarrierTrigger: () => void;
}

export const JourneySummaryScreen: React.FC<Props> = ({
  completedRoute,
  barriersAvoidedCount,
  activeProfile,
  onFinish,
  onReportBarrierTrigger,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [smoothPavements, setSmoothPavements] = useState<boolean | null>(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onFinish();
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-20 max-w-xl mx-auto">
      {/* Celebration Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-xl text-center space-y-3 relative overflow-hidden">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto shadow-lg">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Journey Completed
        </span>
        <h1 className="text-xl font-extrabold text-white">Safe Arrival Confirmed!</h1>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          You successfully navigated this route optimized for your <strong>{activeProfile.name}</strong> profile.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-4 text-center">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400">Total Distance</span>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              {(completedRoute.distanceMeters / 1000).toFixed(2)} km
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400">Walk Duration</span>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              {completedRoute.durationMinutes} min
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400">Obstacles Bypassed</span>
            <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
              {barriersAvoidedCount} Verified
            </div>
          </div>
        </div>
      </div>

      {/* Community Feedback Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-bold text-white">Crowdsourced Route Verification</h2>
        </div>
        <p className="text-xs text-slate-400">
          Did you encounter any unmapped obstacles, steep curb lips, or damaged sidewalks on this path?
        </p>

        {submitted ? (
          <div className="py-6 text-center space-y-2 text-emerald-400">
            <CheckCircle2 className="w-8 h-8 mx-auto" />
            <div className="font-bold text-sm">Feedback Recorded!</div>
            <p className="text-xs text-slate-400">Thank you for helping keep accessibility intelligence accurate.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                Overall Route Accessibility Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                Were sidewalk curb cuts and pavement smooth?
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSmoothPavements(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border transition ${
                    smoothPavements === true
                      ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Yes, Smooth & Level</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSmoothPavements(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border transition ${
                    smoothPavements === false
                      ? 'bg-rose-600/30 text-rose-300 border-rose-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>Uneven / Obstacles Present</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Field Observation Notes (Optional)
              </label>
              <textarea
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="e.g. Curb cut near intersection was flush, but scaffolding narrowed path slightly..."
                rows={2}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onReportBarrierTrigger}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline"
              >
                Report Specific Barrier Here
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit & Close</span>
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onFinish}
          className="text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          Return to Home Dashboard
        </button>
      </div>
    </div>
  );
};
