import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { DEFAULT_WIDGETS } from '../constants/defaultWidgets';
import { DEFAULT_THEME } from '../constants/themes';
import { DashboardWidgetConfig } from '../types/dashboard';
import { AllowanceCycle, Category, Expense, SavingsGoal } from '../types/expense';
import { ThemeConfig } from '../types/theme';
import { UserProfile } from '../types/user';

const KEYS = {
  THEME: '@sakutrack:theme_v1',
  CYCLE: '@sakutrack:cycle_v2',
  EXPENSES: '@sakutrack:expenses_v2',
  CATEGORIES: '@sakutrack:categories_v2',
  GOALS: '@sakutrack:goals_v2',
  WIDGETS: '@sakutrack:widgets_v1',
  PROFILE: '@sakutrack:profile_v2',
};

export function getInitialProfile(): UserProfile {
  return {
    id: 'guest-student-01',
    username: 'student',
    displayName: 'Student',
    bio: 'Tracking my daily allowance so I survive till finals!',
    campus: '',
    currencyCode: 'IDR',
    currentStreak: 0,
    bestStreak: 0,
    lastLoggedDate: '',
    isPublic: true,
    themeConfig: DEFAULT_THEME,
  };
}

export const StorageService = {
  async loadTheme(): Promise<ThemeConfig> {
    try {
      const data = await AsyncStorage.getItem(KEYS.THEME);
      return data ? JSON.parse(data) : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  },
  async saveTheme(theme: ThemeConfig): Promise<void> {
    await AsyncStorage.setItem(KEYS.THEME, JSON.stringify(theme));
  },

  async loadCycle(): Promise<AllowanceCycle | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CYCLE);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  async saveCycle(cycle: AllowanceCycle): Promise<void> {
    await AsyncStorage.setItem(KEYS.CYCLE, JSON.stringify(cycle));
  },

  async loadExpenses(): Promise<Expense[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.EXPENSES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  async saveExpenses(expenses: Expense[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  },

  async loadCategories(): Promise<Category[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CATEGORIES);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },
  async saveCategories(categories: Category[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  },

  async loadGoals(): Promise<SavingsGoal[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.GOALS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  async saveGoals(goals: SavingsGoal[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
  },

  async loadWidgets(): Promise<DashboardWidgetConfig[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.WIDGETS);
      return data ? JSON.parse(data) : DEFAULT_WIDGETS;
    } catch {
      return DEFAULT_WIDGETS;
    }
  },
  async saveWidgets(widgets: DashboardWidgetConfig[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.WIDGETS, JSON.stringify(widgets));
  },

  async loadProfile(): Promise<UserProfile> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PROFILE);
      return data ? JSON.parse(data) : getInitialProfile();
    } catch {
      return getInitialProfile();
    }
  },
  async saveProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },
};
