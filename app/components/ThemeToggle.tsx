'use client';

import { useEffect, useState } from 'react';
import { HiSun, HiMoon } from 'react-icons/hi2';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // İlk yüklemede temayı oku
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const currentTheme = isDark ? 'dark' : 'light';
    console.log('[ThemeToggle] İlk yükleme:', { isDark, currentTheme, classes: root.className });
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  if (!mounted) {
    return (
      <button
        className="fixed top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-black border border-black/10 dark:border-white/10"
        type="button"
        disabled
      >
        <div className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-black border border-black/10 dark:border-white/10 transition-all duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-95"
      aria-label={theme === 'light' ? 'Karanlık temaya geç' : 'Aydınlık temaya geç'}
      type="button"
    >
      {theme === 'light' ? (
        <HiMoon className="h-5 w-5 text-black dark:text-white" />
      ) : (
        <HiSun className="h-5 w-5 text-white" />
      )}
    </button>
  );
}
