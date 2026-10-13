import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, Info } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  variant?: 'banner' | 'button' | 'compact';
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'banner' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already installed in standalone mode
  if (isInstalled) {
    if (variant === 'compact') return null;
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 text-xs font-medium text-emerald-400">
        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>SafeRoute AI is installed on your device</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstalling(true);
      try {
        await install();
      } finally {
        setInstalling(false);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowManualGuide(true);
    }
  };

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          disabled={installing}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          title="Install SafeRoute AI app on your phone or desktop"
        >
          <Download className="w-4 h-4" />
          <span>{isInstallable ? 'Install App' : 'Add to Home Screen'}</span>
        </button>

        {showIOSGuide && <IOSGuideModal onClose={() => setShowIOSGuide(false)} />}
        {showManualGuide && <ManualGuideModal onClose={() => setShowManualGuide(false)} />}
      </>
    );
  }

  // Banner variant (for top of Home page)
  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900/90 to-cyan-950/70 border border-blue-500/30 p-4 shadow-lg backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-100">Install SafeRoute AI</span>
                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                  PWA Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Fast offline access, full-screen navigation, and instant barrier reporting on Android & iOS.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isInstallable ? 'Install Now' : 'How to Install'}</span>
            </button>
          </div>
        </div>
      </div>

      {showIOSGuide && <IOSGuideModal onClose={() => setShowIOSGuide(false)} />}
      {showManualGuide && <ManualGuideModal onClose={() => setShowManualGuide(false)} />}
    </>
  );
};

function IOSGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-bold text-[11px]">1</span>
            <span>Tap the <strong>Share</strong> icon in the Safari toolbar (square with upward arrow).</span>
          </div>
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-bold text-[11px]">2</span>
            <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
          </div>
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-bold text-[11px]">3</span>
            <span>Tap <strong>Add</strong> in the top-right corner to launch in standalone full-screen mode.</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-semibold text-white transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function ManualGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Browser Installation</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <p>
            If your browser does not trigger an automated install prompt, you can install SafeRoute AI directly from your browser menu:
          </p>
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-bold text-[11px]">1</span>
            <span>In Chrome / Edge / Brave: Click the <strong>three dots menu</strong> (⋮) in the top-right corner.</span>
          </div>
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-bold text-[11px]">2</span>
            <span>Select <strong>Install SafeRoute AI</strong> or <strong>Add to Home screen</strong>.</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-semibold text-white transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
