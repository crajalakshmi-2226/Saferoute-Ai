import React from 'react';
import {
  Home,
  Navigation,
  Scale,
  FileText,
  ShieldAlert,
  Settings
} from 'lucide-react';
import { Language } from '../utils/translations';

interface Props {
  activeScreen: string;
  onSelectScreen: (screenId: string) => void;
  language: Language;
}

export const BottomNav: React.FC<Props> = ({ activeScreen, onSelectScreen, language }) => {
  const tabs = [
    {
      id: 'home',
      label: language === 'ta' ? 'முகப்பு' : 'Home',
      icon: Home
    },
    {
      id: 'search',
      label: language === 'ta' ? 'வழிகள்' : 'Routes',
      icon: Navigation
    },
    {
      id: 'legal_assist',
      label: language === 'ta' ? 'சட்ட உதவி' : 'Legal Help',
      icon: Scale
    },
    {
      id: 'report_incident',
      label: language === 'ta' ? 'புகார்' : 'Report',
      icon: FileText
    },
    {
      id: 'nearby_help',
      label: language === 'ta' ? 'உதவி மையம்' : 'Nearby',
      icon: ShieldAlert
    },
    {
      id: 'settings',
      label: language === 'ta' ? 'அமைப்புகள்' : 'Settings',
      icon: Settings
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectScreen(tab.id)}
              className={`flex flex-col items-center gap-1 rounded-xl py-1 px-2 transition cursor-pointer ${
                isActive
                  ? 'text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition ${isActive ? 'bg-blue-600/15' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
