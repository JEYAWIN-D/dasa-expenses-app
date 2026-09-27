import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const DEFAULT_THEME = {
  primaryColor: '#2563eb', // Modern Tech Blue
  accentColor: '#3b82f6',
  fontFamily: 'Inter',
  fontSize: '14px',
  themeMode: 'light',
  currencySymbol: '₹',
  currencyCode: 'INR',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: 'IN', // IN = Lakhs (1,00,000), INTL = Millions (100,000)
};

export const AVAILABLE_FONTS = [
  { name: 'Inter', family: "'Inter', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap' },
  { name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap' },
  { name: 'Outfit', family: "'Outfit', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap' },
  { name: 'Roboto', family: "'Roboto', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap' },
  { name: 'Poppins', family: "'Poppins', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap' },
  { name: 'Fira Code', family: "'Fira Code', monospace", url: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap' },
  { name: 'System Default', family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", url: null },
];

export const COLOR_PRESETS = [
  { name: 'Tech Sapphire (Default)', primary: '#2563eb', accent: '#3b82f6' },
  { name: 'Cyber Emerald', primary: '#059669', accent: '#10b981' },
  { name: 'Royal Indigo', primary: '#4f46e5', accent: '#6366f1' },
  { name: 'Imperial Violet', primary: '#7c3aed', accent: '#8b5cf6' },
  { name: 'Midnight Slate', primary: '#0f172a', accent: '#334155' },
  { name: 'Ruby Crimson', primary: '#dc2626', accent: '#ef4444' },
  { name: 'Amber Sunset', primary: '#d97706', accent: '#f59e0b' },
  { name: 'Ocean Cyan', primary: '#0891b2', accent: '#06b6d4' },
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('bizfinance_theme_settings');
      return saved ? { ...DEFAULT_THEME, ...JSON.parse(saved) } : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  const applyThemeToDOM = (settings) => {
    const root = document.documentElement;

    // Apply Colors
    root.style.setProperty('--primary', settings.primaryColor);
    root.style.setProperty('--primary-hover', settings.primaryColor + 'ee');
    root.style.setProperty('--primary-light', settings.primaryColor + '18');
    root.style.setProperty('--primary-border', settings.primaryColor + '30');
    root.style.setProperty('--accent', settings.accentColor);

    // Apply Font Size
    root.style.fontSize = settings.fontSize;

    // Apply Font Family
    const fontObj = AVAILABLE_FONTS.find((f) => f.name === settings.fontFamily) || AVAILABLE_FONTS[0];
    root.style.setProperty('--font-sans', fontObj.family);
    document.body.style.fontFamily = fontObj.family;

    // Inject Google Font link if needed
    if (fontObj.url) {
      let fontLink = document.getElementById('dynamic-google-font');
      if (!fontLink) {
        fontLink = document.createElement('link');
        fontLink.id = 'dynamic-google-font';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
      }
      fontLink.href = fontObj.url;
    }
  };

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const updateTheme = (newValues) => {
    setTheme((prev) => {
      const updated = { ...prev, ...newValues };
      localStorage.setItem('bizfinance_theme_settings', JSON.stringify(updated));
      applyThemeToDOM(updated);
      return updated;
    });
  };

  const resetTheme = () => {
    setTheme(DEFAULT_THEME);
    localStorage.setItem('bizfinance_theme_settings', JSON.stringify(DEFAULT_THEME));
    applyThemeToDOM(DEFAULT_THEME);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
