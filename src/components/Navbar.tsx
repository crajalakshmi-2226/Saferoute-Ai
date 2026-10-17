import React from 'react';
import {
  Shield,
  Moon,
  Sun,
  Laptop,
  Settings,
  Accessibility,
  Compass,
  User,
  LogIn,
  Globe,
  PhoneCall,
} from 'lucide-react';
import { NavigationMode, MobilityProfile, ThemeMode } from '../types';
import { UserProfileData } from '../services/firebase';
import { Language } from '../utils/translations';

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
  userProfile: UserProfileData | null;
  isGuest: boolean;
  onOpenAuth: () => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  onOpenEmergency: () => void;
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
  userProfile,
  isGuest,
  onOpenAuth,
  language,
  onToggleLanguage,
  onOpenEmergency,
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

          {/* User Account / Guest Chip */}
          {userProfile ? (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:border-slate-700 transition cursor-pointer"
              title={`Logged in as ${userProfile.fullName || userProfile.email || 'User'}`}
            >
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                {userProfile.fullName?.charAt(0) || userProfile.email?.charAt(0) || 'U'}
              </div>
              <span className="hidden lg:inline max-w-[100px] truncate">
                {userProfile.fullName || (userProfile.email ? userProfile.email.split('@')[0] : 'User')}
              </span>
            </button>
          ) : isGuest ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
              title="You are in Guest Mode. Click to sign in and save your profile."
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          ) : null}

          {/* Quick Emergency SOS button */}
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 px-2.5 py-1.5 text-xs font-extrabold text-rose-300 hover:text-white transition cursor-pointer active:scale-95"
            title="Immediate Emergency Assistance (112 SOS)"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span className="font-mono text-xs">112 SOS</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => onToggleLanguage(language === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
            title={language === 'en' ? 'தமிழுக்கு மாறவும் (Switch to Tamil)' : 'Switch to English'}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* Theme Toggle Cycle */}
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

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center justify-center h-8 w-8 rounded-xl border transition cursor-pointer ${
              activeScreen === 'settings'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
            title="Settings & Mapbox Configuration"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
