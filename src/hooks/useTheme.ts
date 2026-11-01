import { useState, useEffect } from 'react';
import { ThemeMode } from '../types';
import { safeStorage } from '../utils/storage';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    // Always preserve dark cybersecurity theme
    root.classList.add('dark');
    root.style.backgroundColor = '#020617';
    root.style.color = '#f8fafc';
    root.style.colorScheme = 'dark';
    safeStorage.setItem('saferoute_theme', 'dark');
  }, [theme]);

  return { theme, setTheme };
}

