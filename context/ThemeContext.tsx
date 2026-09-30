import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_THEME, THEME_PRESETS } from '../constants/themes';
import { StorageService } from '../services/storage';
import { BorderStyleId, FontStyleId, ThemeConfig, ThemePresetId } from '../types/theme';

interface ThemeContextType {
  theme: ThemeConfig;
  setPreset: (presetId: ThemePresetId) => Promise<void>;
  updateCustomTheme: (updates: Partial<ThemeConfig>) => Promise<void>;
  updateBorderRadius: (radius: number, style: BorderStyleId) => Promise<void>;
  updateFontStyle: (fontStyle: FontStyleId) => Promise<void>;
  resetToPreset: (presetId: ThemePresetId) => Promise<void>;
  isReady: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    StorageService.loadTheme().then((saved) => {
      if (saved) setTheme(saved);
      setIsReady(true);
    });
  }, []);

  const setPreset = async (presetId: ThemePresetId) => {
    const selected = THEME_PRESETS[presetId] || DEFAULT_THEME;
    setTheme(selected);
    await StorageService.saveTheme(selected);
  };

  const updateCustomTheme = async (updates: Partial<ThemeConfig>) => {
    const updated: ThemeConfig = {
      ...theme,
      ...updates,
      id: 'custom',
      colors: {
        ...theme.colors,
        ...(updates.colors || {}),
      },
    };
    setTheme(updated);
    await StorageService.saveTheme(updated);
  };

  const updateBorderRadius = async (borderRadius: number, borderStyle: BorderStyleId) => {
    const updated: ThemeConfig = {
      ...theme,
      id: 'custom',
      borderRadius,
      borderStyle,
    };
    setTheme(updated);
    await StorageService.saveTheme(updated);
  };

  const updateFontStyle = async (fontStyle: FontStyleId) => {
    const updated: ThemeConfig = {
      ...theme,
      id: 'custom',
      fontStyle,
    };
    setTheme(updated);
    await StorageService.saveTheme(updated);
  };

  const resetToPreset = async (presetId: ThemePresetId) => {
    await setPreset(presetId);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setPreset,
        updateCustomTheme,
        updateBorderRadius,
        updateFontStyle,
        resetToPreset,
        isReady,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}
