// components/ToggleTheme.jsx
import { useEffect, useState } from 'react';

const themes = ['light', 'dark', 'neon', 'retro'];

export function ToggleTheme() {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove all old theme classes
    themes.forEach(t => root.classList.remove(t, `theme-${t}`));

    // Add new theme class
    root.classList.add(theme === 'light' || theme === 'dark' ? theme : `theme-${theme}`);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="px-2 py-1 rounded dark:bg-zinc-800 dark:text-white text-sm"
    >
      {themes.map((t) => (
        <option key={t} value={t}>
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </option>
      ))}
    </select>
  );
}
