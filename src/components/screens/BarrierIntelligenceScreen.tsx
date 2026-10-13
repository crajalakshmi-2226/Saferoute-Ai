import React, { useState } from 'react';
import { BarrierReport, Coordinates } from '../../types';
import {
  AlertTriangle,
  Plus,
  ThumbsUp,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  Send,
  Camera,
  AlertCircle
} from 'lucide-react';

interface Props {
  barriers: BarrierReport[];
  onAddBarrier: (barrier: Partial<BarrierReport>) => Promise<void>;
  onConfirmBarrier: (barrierId: string) => Promise<void>;
  currentLocation?: Coordinates;
}

export const BarrierIntelligenceScreen: React.FC<Props> = ({
  barriers,
  onAddBarrier,
  onConfirmBarrier,
  currentLocation,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [showReportModal, setShowReportModal] = useState(false);

  // New report form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<BarrierReport['type']>('stairs');
  const [severity, setSeverity] = useState<BarrierReport['severity']>('high');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const filtered = filterType === 'all'
    ? barriers
    : barriers.filter((b) => b.type === filterType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    try {
      const lat = currentLocation ? currentLocation.lat : 37.777;
      const lng = currentLocation ? currentLocation.lng : -122.417;

      await onAddBarrier({
        title,
        type,
        severity,
        description,
        address: address || 'Reported from current area',
        lat,
        lng,
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowReportModal(false);
        setTitle('');
        setDescription('');
        setAddress('');
      }, 1200);
    } catch (err) {
      console.error('Failed to submit barrier:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Verified Urban Obstacles
            </span>
          </div>
          <h1 className="text-lg font-extrabold text-white mt-1">Barrier Intelligence</h1>
          <p className="text-xs text-slate-400">
            Real-time physical obstacles, construction zones, and lift outages recorded by audits and certified pedestrians.
          </p>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2.5 text-xs shadow-md transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report a Barrier</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Obstacles' },
          { id: 'stairs', label: 'Stairs & Steps' },
          { id: 'steep_slope', label: 'Steep Slopes' },
          { id: 'narrow_path', label: 'Narrow Paths' },
          { id: 'construction', label: 'Construction' },
          { id: 'missing_curb_cut', label: 'Missing Curb Cuts' },
          { id: 'broken_lift', label: 'Broken Lifts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer ${
              filterType === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Barrier Cards List */}
      <div className="space-y-3">
        {filtered.map((b) => (
          <div
            key={b.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                      b.severity === 'impassable'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : b.severity === 'high'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {b.severity} Severity
                  </span>

                  <span className="text-[11px] font-semibold text-slate-400">
                    Type: <strong className="text-white capitalize">{b.type.replace('_', ' ')}</strong>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1.5">{b.title}</h3>
                {b.address && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{b.address}</span>
                  </p>
                )}
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-xl ${
                    b.verificationStatus === 'verified'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="capitalize">{b.verificationStatus.replace('_', ' ')}</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              {b.description}
            </p>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Reported {new Date(b.reportedAt).toLocaleDateString()}</span>
              </span>

              <button
                onClick={() => onConfirmBarrier(b.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95 cursor-pointer"
                title="Confirm this barrier still exists"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-semibold text-xs">{b.confirmations} Confirmations</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Report Physical Barrier</h2>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Report Submitted Successfully</h3>
                <p className="text-xs text-slate-400">Thank you for contributing to safer, step-free pedestrian routing!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Barrier Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Broken elevator or 12 steep steps without ramp"
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Obstacle Category</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="stairs">Stairs / Steps</option>
                      <option value="steep_slope">Steep Slope</option>
                      <option value="uneven_surface">Uneven / Cobblestone</option>
                      <option value="narrow_path">Narrow Passage (&lt; 90cm)</option>
                      <option value="construction">Active Construction</option>
                      <option value="missing_curb_cut">Missing Curb Cut</option>
                      <option value="broken_lift">Broken Lift / Elevator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Severity</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as any)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="low">Low (Minor inconvenience)</option>
                      <option value="medium">Medium (Requires care)</option>
                      <option value="high">High (Difficult without aid)</option>
                      <option value="impassable">Impassable for wheelchairs</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Detailed Description & Bypass Advice</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Describe specific physical conditions, step count, or where the nearest accessible ramp is located..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Street Address or Landmark Note</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Market St north entrance near 5th"
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 px-5 py-2 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
