import React from 'react';
import {
  Shield,
  Moon,
  Sun,
  Laptop,
  Settings,
  Accessibility,
  Compass,
  Download,
  AlertTriangle
} from 'lucide-react';
import { NavigationMode, MobilityProfile, ThemeMode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface Props {
  navigationMode: NavigationMode;
  onToggleNavigationMode: (mode: NavigationMode) => void;
  activeProfile: MobilityProfile;
  theme: ThemeMode;
  onSetTheme: (theme: ThemeMode) => void;
  onOpenSettings: () => void;
  onOpenProfiles: () => void;
  onGoHome: () => void;
  activeScreen: string;
}

export const Navbar: React.FC<Props> = ({
  navigationMode,
  onToggleNavigationMode,
  activeProfile,
  theme,
  onSetTheme,
  onOpenSettings,
  onOpenProfiles,
  onGoHome,
  activeScreen,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-md group-hover:shadow-blue-500/20 transition">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base">
                SafeRoute<span className="text-blue-400"> AI</span>
              </span>
            </div>
            <p className="hidden xs:block text-[10px] text-slate-400 font-medium">
              Routes that understand you
            </p>
          </div>
        </div>

        {/* Center Mode Selector */}
        <div className="hidden sm:flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5">
          <button
            onClick={() => onToggleNavigationMode('general')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              navigationMode === 'general'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-slate-400" />
            <span>General Navigation</span>
          </button>
          <button
            onClick={() => onToggleNavigationMode('accessibility')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              navigationMode === 'accessibility'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Accessibility className="h-3.5 w-3.5" />
            <span>Accessibility Mode</span>
          </button>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {/* Active Profile Shortcut (in Accessibility Mode) */}
          {navigationMode === 'accessibility' && (
            <button
              onClick={onOpenProfiles}
              className="flex items-center gap-1.5 rounded-xl bg-blue-950/60 border border-blue-500/30 px-2.5 py-1.5 text-xs font-medium text-blue-300 hover:bg-blue-900/50 transition cursor-pointer"
              title="Change Mobility Profile"
            >
              <Accessibility className="h-3.5 w-3.5 text-blue-400" />
              <span className="hidden md:inline">{activeProfile.name}</span>
            </button>
          )}

          {/* Theme Toggle Dropdown / Cycle */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5">
            <button
              onClick={() => onSetTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              title={`Theme: ${theme}. Click to switch.`}
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-blue-400" />
              ) : theme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Laptop className="w-4 h-4 text-slate-300" />
              )}
            </button>
          </div>

          {/* Settings / API Key Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center h-8 w-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer"
            title="Settings & Mapbox Configuration"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
