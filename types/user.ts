import { CurrencyCode } from './expense';
import { ThemeConfig } from './theme';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio: string;
  campus?: string;
  currencyCode: CurrencyCode;
  currentStreak: number;
  bestStreak: number;
  lastLoggedDate: string; // YYYY-MM-DD
  isPublic: boolean;
  themeConfig?: ThemeConfig;
}

export interface AuthUser {
  id: string;
  email: string;
  isGuest: boolean;
}
