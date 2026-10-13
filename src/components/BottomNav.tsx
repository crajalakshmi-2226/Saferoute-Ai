import React from 'react';
import {
  Home,
  Navigation,
  AlertTriangle,
  Camera,
  Layers,
  Settings,
  Flame,
  Bookmark,
  Users
} from 'lucide-react';

interface Props {
  activeScreen: string;
  onSelectScreen: (screenId: string) => void;
}

export const BottomNav: React.FC<Props> = ({ activeScreen, onSelectScreen }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Routes', icon: Navigation },
    { id: 'barriers', label: 'Barriers', icon: AlertTriangle },
    { id: 'vision', label: 'AI Vision', icon: Camera },
    { id: 'heatmap', label: 'Heatmap', icon: Flame },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectScreen(tab.id)}
              className={`flex flex-col items-center gap-1 rounded-xl py-1 px-2.5 transition cursor-pointer ${
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
