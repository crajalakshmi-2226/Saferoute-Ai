import React, { useState, useEffect } from 'react';
import {
  Key,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  RefreshCw,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { getMapboxToken, setMapboxToken, validateMapboxToken } from '../services/mapboxService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTokenSaved?: () => void;
}

export const TokenSetupModal: React.FC<Props> = ({ isOpen, onClose, onTokenSaved }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [validating, setValidating] = useState(false);
  const [statusResult, setStatusResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [copiedEnv, setCopiedEnv] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getMapboxToken();
      setTokenInput(current);
      if (current) {
        // Auto validate existing token
        handleTestToken(current);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestToken = async (candidateToken?: string) => {
    const t = (candidateToken !== undefined ? candidateToken : tokenInput).trim();
    if (!t) {
      setStatusResult({ valid: false, message: 'Please paste a token before testing.' });
      return;
    }

    setValidating(true);
    try {
      const res = await validateMapboxToken(t);
      setStatusResult(res);
      if (res.valid) {
        setMapboxToken(t);
        if (onTokenSaved) onTokenSaved();
      }
    } catch (err: any) {
      setStatusResult({ valid: false, message: err.message || 'Validation failed.' });
    } finally {
      setValidating(false);
    }
  };

  const handleSave = () => {
    setMapboxToken(tokenInput.trim());
    if (onTokenSaved) onTokenSaved();
    onClose();
  };

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(`VITE_MAPBOX_PUBLIC_TOKEN=${tokenInput.trim() || 'YOUR_MAPBOX_PUBLIC_TOKEN'}`);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Mapbox API Configuration</h2>
              <p className="text-xs text-slate-400">Step-by-step setup for interactive maps and routing</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Token Input & Live Test */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Public Mapbox Access Token (Starts with "pk.")
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value);
                  setStatusResult(null);
                }}
                placeholder="pk.eyJ1IjoieW91cm5hbWUiLCJhIjoi..."
                className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleTestToken()}
                disabled={validating || !tokenInput.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2.5 text-xs font-semibold text-slate-200 border border-slate-700 disabled:opacity-50 transition"
              >
                {validating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>Test</span>
              </button>
            </div>
          </div>

          {/* Validation Feedback */}
          {statusResult && (
            <div
              className={`flex items-start gap-2.5 p-3 rounded-xl text-xs border ${
                statusResult.valid
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}
            >
              {statusResult.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-semibold">{statusResult.valid ? 'Active: ' : 'Configuration Notice: '}</span>
                <span>{statusResult.message}</span>
              </div>
            </div>
          )}

          {/* Step-by-Step Instructions */}
          <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <HelpCircle className="w-4 h-4" />
              <span>How to get your Mapbox Access Token:</span>
            </div>

            <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside">
              <li>
                <span>Create or log into your account at </span>
                <a
                  href="https://account.mapbox.com/access-tokens/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 underline hover:text-blue-300 inline-flex items-center gap-1 font-mono"
                >
                  account.mapbox.com/access-tokens/ <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <span>Copy your <strong>Default public token</strong> (or create a token with <code>styles:read</code>, <code>fonts:read</code>, and <code>geocoding</code> scopes).</span>
              </li>
              <li>
                <span>Paste the token into the field above and click <strong>Test & Save</strong> for immediate in-session activation.</span>
              </li>
              <li>
                <span>To persist permanently in your development environment, add it to your <code>.env</code> file:</span>
                <div className="mt-1.5 flex items-center justify-between rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 font-mono text-[11px] text-slate-300">
                  <code>VITE_MAPBOX_PUBLIC_TOKEN=pk.eyJ1...</code>
                  <button
                    onClick={handleCopyEnv}
                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedEnv ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </li>
              <li>
                <span>Restart the development server if using <code>.env</code>. (When saved in the UI above, the map updates immediately without restart).</span>
              </li>
            </ol>
          </div>

          {/* Pricing & Usage Note */}
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed">
            <strong>Plan & Usage Limits:</strong> Mapbox provides a generous free tier for developers, but usage beyond monthly request allowances is subject to your Mapbox account tier and pricing. Please review your account limits on Mapbox.com.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-semibold text-white shadow-sm transition"
          >
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
