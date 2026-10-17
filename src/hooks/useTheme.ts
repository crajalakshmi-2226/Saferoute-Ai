import { useState, useEffect } from 'react';
import { ThemeMode } from '../types';
import { safeStorage } from '../utils/storage';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = safeStorage.getItem('saferoute_theme') as ThemeMode | null;
    return saved || 'dark';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && (mediaQuery?.matches ?? true));
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    safeStorage.setItem('saferoute_theme', theme);

    if (mediaQuery) {
      const listener = () => {
        if (theme === 'system') {
          applyTheme();
        }
      };

      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  return { theme, setTheme };
}
