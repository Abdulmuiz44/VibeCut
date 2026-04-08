'use client';

import { useEffect, useState } from 'react';
import { Moon, SunMedium } from 'lucide-react';

type Theme = 'light' | 'dark';

function applyTheme(nextTheme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = nextTheme;
  root.classList.toggle('dark', nextTheme === 'dark');
  root.style.colorScheme = nextTheme;
  window.localStorage.setItem('vibecut-theme', nextTheme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const rootTheme = document.documentElement.dataset.theme;
    const nextTheme: Theme = rootTheme === 'light' ? 'light' : 'dark';
    setTheme(nextTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme` : 'Toggle theme'}
      title={mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme` : 'Toggle theme'}
    >
      <SunMedium size={16} className={theme === 'light' ? 'text-amber-500' : 'text-[hsl(var(--muted-foreground))]'} />
      <span className="text-xs font-medium">{mounted ? (theme === 'dark' ? 'Dark' : 'Light') : 'Theme'}</span>
      <Moon size={16} className={theme === 'dark' ? 'text-sky-400' : 'text-[hsl(var(--muted-foreground))]'} />
    </button>
  );
}
