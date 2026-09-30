export type ThemePresetId = 'matcha' | 'retro' | 'cyber' | 'campus';

export type FontStyleId = 'modern' | 'playful' | 'mono' | 'serif';

export type BorderStyleId = 'sharp' | 'rounded' | 'pill';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  accent: string;
  background: string;
  surface: string;
  surfaceSubtle: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
  cardGlow?: string;
}

export interface ThemeFonts {
  regular: string;
  medium: string;
  semiBold: string;
  bold: string;
}

export interface ThemeConfig {
  id: ThemePresetId | 'custom';
  name: string;
  colors: ThemeColors;
  fontStyle: FontStyleId;
  borderStyle: BorderStyleId;
  borderRadius: number; // e.g. 4 for sharp, 16 for rounded, 28 for pill
  borderWidth: number; // e.g. 0, 1, or 2 (retro)
  isDark: boolean;
  fonts?: ThemeFonts;
}
