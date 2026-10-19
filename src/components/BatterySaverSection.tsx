import React, { useState, useEffect } from 'react';
import {
  Battery,
  BatteryCharging,
  BatteryLow,
  Zap,
  Eye,
  Sliders,
  Moon,
  Sparkles,
  ShieldCheck,
  Check,
  Smartphone
} from 'lucide-react';
import {
  getBatterySaverSettings,
  saveBatterySaverSettings,
  getDeviceBatteryInfo,
  BatterySaverSettings,
  DeviceBatteryInfo
} from '../services/batterySaverService';

export const BatterySaverSection: React.FC = () => {
  const [settings, setSettings] = useState<BatterySaverSettings>(getBatterySaverSettings);
  const [batteryInfo, setBatteryInfo] = useState<DeviceBatteryInfo | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    getDeviceBatteryInfo().then((info) => {
      setBatteryInfo(info);
      // Auto-enable if below 20% and auto-activate is enabled
      if (info.supported && info.level <= 20 && !info.charging && settings.autoActivateOnLowBattery && !settings.enabled) {
        const updated = { ...settings, enabled: true };
        setSettings(updated);
        saveBatterySaverSettings(updated);
      }
    });

    // Also listen to battery updates if supported
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const update = () => {
          setBatteryInfo({
            supported: true,
            level: Math.round((battery.level || 1) * 100),
            charging: !!battery.charging,
          });
        };
        battery.addEventListener('levelchange', update);
        battery.addEventListener('chargingchange', update);
      }).catch(() => {});
    }
  }, []);

  const handleToggleMaster = () => {
    const updated = { ...settings, enabled: !settings.enabled };
    setSettings(updated);
    saveBatterySaverSettings(updated);
  };

  const handleUpdate = (partial: Partial<BatterySaverSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveBatterySaverSettings(updated);
  };

  const getBatteryIcon = () => {
    if (!batteryInfo || !batteryInfo.supported) return <Battery className="w-5 h-5 text-emerald-400" />;
    if (batteryInfo.charging) return <BatteryCharging className="w-5 h-5 text-emerald-400 animate-pulse" />;
    if (batteryInfo.level <= 20) return <BatteryLow className="w-5 h-5 text-rose-400 animate-bounce" />;
    return <Battery className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
      {/* Header with Title & Master Switch */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl border transition ${
            settings.enabled
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Battery Saver (Power Optimization)</h2>
              {settings.enabled && (
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-extrabold uppercase text-emerald-400 tracking-wider">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Reduces map refresh rates and dims the screen during navigation to extend battery life.
            </p>
          </div>
        </div>

        {/* Master Toggle Switch */}
        <button
          type="button"
          onClick={handleToggleMaster}
          role="switch"
          aria-checked={settings.enabled}
          className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            settings.enabled ? 'bg-emerald-500' : 'bg-slate-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              settings.enabled ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Device Battery Status Card */}
      {batteryInfo && batteryInfo.supported && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center gap-3">
            {getBatteryIcon()}
            <div>
              <span className="text-xs font-bold text-white">
                Device Battery: {batteryInfo.level}%
              </span>
              <span className="block text-[11px] text-slate-400">
                {batteryInfo.charging ? 'Charging via power source' : 'Operating on internal battery'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border ${
              batteryInfo.level <= 20
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              {batteryInfo.level <= 20 ? 'Low Battery' : 'Normal'}
            </span>
          </div>
        </div>
      )}

      {/* Detailed Configuration Options */}
      <div className={`space-y-4 transition ${settings.enabled ? 'opacity-100' : 'opacity-60 pointer-events-none'}`}>
        {/* 1. Reduce Map Refresh Rate & Disable 3D Animations */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80">
          <div className="flex items-start gap-3">
            <Sliders className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-white">Reduce Map Refresh & Disable 3D Tilt</h3>
              <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                Flattens the map to 2D and throttles GPU canvas re-renders from 60fps to static keyframe updates.
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.reduceFrameRate}
            onChange={(e) => handleUpdate({ reduceFrameRate: e.target.checked })}
            className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 bg-slate-900"
          />
        </div>

        {/* 2. Dim Screen During Navigation */}
        <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Moon className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-white">Dim Screen During Live Turn-by-Turn</h3>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  Applies an energy-saving OLED dark overlay while keeping vital navigation maneuvers clearly visible.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.dimScreen}
              onChange={(e) => handleUpdate({ dimScreen: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 bg-slate-900"
            />
          </div>

          {settings.dimScreen && (
            <div className="pt-2 pl-7">
              <span className="text-[11px] font-semibold text-slate-300 block mb-2">
                Dimming Intensity:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { level: 35, label: 'Mild (35%)', desc: 'Standard save' },
                  { level: 60, label: 'Balanced (60%)', desc: 'Recommended' },
                  { level: 80, label: 'Ultra (80%)', desc: 'Max OLED save' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => handleUpdate({ dimLevel: item.level })}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      settings.dimLevel === item.level
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{item.label}</span>
                      {settings.dimLevel === item.level && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Auto Activate Below 20% */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80">
          <div className="flex items-start gap-3">
            <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-white">Auto-Enable on Low Battery (&lt; 20%)</h3>
              <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                Automatically activates battery saver when your device battery reaches critical reserve levels.
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.autoActivateOnLowBattery}
            onChange={(e) => handleUpdate({ autoActivateOnLowBattery: e.target.checked })}
            className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 bg-slate-900"
          />
        </div>
      </div>

      {/* Feature summary / Quick Test */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Extends phone battery life by up to 45% during outdoor journeys</span>
        </span>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition"
        >
          <Eye className="w-3.5 h-3.5 text-blue-400" />
          <span>{showPreview ? 'Close Preview' : 'Preview Dim Effect'}</span>
        </button>
      </div>

      {/* Live Preview Overlay */}
      {showPreview && (
        <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 p-5 bg-slate-950">
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{ backgroundColor: `rgba(0, 0, 0, ${settings.dimLevel / 100})` }}
          />
          <div className="relative z-10 space-y-2 text-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Live Preview: Navigation Mode Dimmed ({settings.dimLevel}%)
              </span>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg"
              >
                Dismiss
              </button>
            </div>
            <p className="text-xs text-slate-200">
              During active walking navigation, the screen dims to this intensity. A simple tap anywhere instantly awakens normal brightness for 10 seconds.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
