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
  CYCLE: '@sakutrack:cycle_v1',
  EXPENSES: '@sakutrack:expenses_v1',
  CATEGORIES: '@sakutrack:categories_v1',
  GOALS: '@sakutrack:goals_v1',
  WIDGETS: '@sakutrack:widgets_v1',
  PROFILE: '@sakutrack:profile_v1',
};

// Seed demo data for instant delight upon first launch
export function getInitialCycle(): AllowanceCycle {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    id: 'cycle-initial',
    amount: 2500000, // Rp 2.500.000 (typical student pocket money)
    period: 'monthly',
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    isActive: true,
  };
}

export function getInitialExpenses(): Expense[] {
  const now = new Date();
  const d1 = new Date(now);
  const d2 = new Date(now);
  d2.setDate(now.getDate() - 1);
  const d3 = new Date(now);
  d3.setDate(now.getDate() - 2);
  const d4 = new Date(now);
  d4.setDate(now.getDate() - 4);

  return [
    {
      id: 'exp-1',
      categoryId: 'food_boba',
      title: 'Boba Brown Sugar & Snacks',
      amount: 38000,
      spentAt: d1.toISOString(),
      note: 'Treat with study buddy after exam',
      isImpulse: true,
    },
    {
      id: 'exp-2',
      categoryId: 'campus_books',
      title: 'Photocopy Lecture Slides',
      amount: 25000,
      spentAt: d2.toISOString(),
      note: 'Calculus cheat sheet bind',
      isImpulse: false,
    },
    {
      id: 'exp-3',
      categoryId: 'transport',
      title: 'Campus Shuttle / Ojek',
      amount: 18000,
      spentAt: d2.toISOString(),
      isImpulse: false,
    },
    {
      id: 'exp-4',
      categoryId: 'food_boba',
      title: 'Campus Canteen Lunch (Ayam Geprek)',
      amount: 28000,
      spentAt: d3.toISOString(),
      isImpulse: false,
    },
    {
      id: 'exp-5',
      categoryId: 'subscriptions',
      title: 'Music Streaming Student Plan',
      amount: 35000,
      spentAt: d4.toISOString(),
      isImpulse: false,
    },
    {
      id: 'exp-6',
      categoryId: 'hangout',
      title: 'Late Night Coffee & Fries',
      amount: 45000,
      spentAt: d4.toISOString(),
      note: 'Assignment grinding with squad',
      isImpulse: true,
    },
  ];
}

export function getInitialGoals(): SavingsGoal[] {
  return [
    {
      id: 'goal-1',
      title: 'Music Festival Ticket',
      targetAmount: 850000,
      currentAmount: 520000,
      icon: 'musical-notes',
      color: '#FF70A6',
      isPublic: true,
    },
    {
      id: 'goal-2',
      title: 'New Mechanical Keyboard',
      targetAmount: 600000,
      currentAmount: 240000,
      icon: 'hardware-chip',
      color: '#4EA8DE',
      isPublic: true,
    },
    {
      id: 'goal-3',
      title: 'Emergency Savings Fund',
      targetAmount: 1000000,
      currentAmount: 700000,
      icon: 'shield-checkmark',
      color: '#06D6A0',
      isPublic: false,
    },
  ];
}

export function getInitialProfile(): UserProfile {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: 'guest-student-01',
    username: 'sakufan_student',
    displayName: 'Aria Saku',
    bio: 'CS Student & Boba enthusiast ☕️ | Tracking my daily allowance so I survive till finals!',
    campus: 'Tech University',
    currencyCode: 'IDR',
    currentStreak: 5,
    bestStreak: 12,
    lastLoggedDate: today,
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

  async loadCycle(): Promise<AllowanceCycle> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CYCLE);
      return data ? JSON.parse(data) : getInitialCycle();
    } catch {
      return getInitialCycle();
    }
  },
  async saveCycle(cycle: AllowanceCycle): Promise<void> {
    await AsyncStorage.setItem(KEYS.CYCLE, JSON.stringify(cycle));
  },

  async loadExpenses(): Promise<Expense[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.EXPENSES);
      return data ? JSON.parse(data) : getInitialExpenses();
    } catch {
      return getInitialExpenses();
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
      return data ? JSON.parse(data) : getInitialGoals();
    } catch {
      return getInitialGoals();
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
