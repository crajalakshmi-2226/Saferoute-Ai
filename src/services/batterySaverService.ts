import { safeStorage } from '../utils/storage';

export interface BatterySaverSettings {
  enabled: boolean;
  dimScreen: boolean;
  dimLevel: number; // 35, 60, or 80 (%)
  reduceFrameRate: boolean;
  autoActivateOnLowBattery: boolean;
}

export interface DeviceBatteryInfo {
  supported: boolean;
  level: number; // 0 to 100
  charging: boolean;
}

export const DEFAULT_BATTERY_SETTINGS: BatterySaverSettings = {
  enabled: false,
  dimScreen: true,
  dimLevel: 60,
  reduceFrameRate: true,
  autoActivateOnLowBattery: true,
};

const STORAGE_KEY = 'saferoute_battery_saver_settings';
const EVENT_NAME = 'saferoute_battery_saver_update';

export function getBatterySaverSettings(): BatterySaverSettings {
  const saved = safeStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return { ...DEFAULT_BATTERY_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // return defaults
    }
  }
  return DEFAULT_BATTERY_SETTINGS;
}

export function saveBatterySaverSettings(settings: BatterySaverSettings): void {
  safeStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: settings }));
  }
}

export function subscribeToBatterySaver(callback: (settings: BatterySaverSettings) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const custom = e as CustomEvent<BatterySaverSettings>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getBatterySaverSettings());
    }
  };

  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

// Inspect Web Battery Status API if available
export async function getDeviceBatteryInfo(): Promise<DeviceBatteryInfo> {
  if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
    try {
      const battery: any = await (navigator as any).getBattery();
      return {
        supported: true,
        level: Math.round((battery.level || 1) * 100),
        charging: !!battery.charging,
      };
    } catch {
      return { supported: false, level: 100, charging: false };
    }
  }
  return { supported: false, level: 100, charging: false };
}
