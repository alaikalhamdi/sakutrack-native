import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CURRENCIES } from '../constants/currencies';
import { calculatePredictiveInsights } from '../services/insights';
import { getInitialProfile, StorageService } from '../services/storage';
import { isSupabaseConfigured, supabase } from '../services/supabase';
import { DashboardWidgetConfig, WidgetSlotSize, isSizeAllowed, getAllowedSizes } from '../types/dashboard';
import {
  AllowanceCycle,
  Category,
  CurrencyCode,
  Expense,
  PredictiveInsights,
  SavingsGoal,
} from '../types/expense';
import { UserProfile } from '../types/user';

interface DataContextType {
  isLoaded: boolean;
  cycle: AllowanceCycle | null;
  expenses: Expense[];
  categories: Category[];
  goals: SavingsGoal[];
  widgets: DashboardWidgetConfig[];
  isDashboardEditing: boolean;
  setIsDashboardEditing: (editing: boolean) => void;
  profile: UserProfile;
  predictiveInsights: PredictiveInsights;
  formatMoney: (amount: number) => string;
  currencyCode: CurrencyCode;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  updateCycle: (cycle: AllowanceCycle) => Promise<void>;
  addCategory: (cat: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => Promise<void>;
  updateGoalAmount: (id: string, delta: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  reorderWidgets: (newWidgets: DashboardWidgetConfig[]) => Promise<void>;
  toggleWidgetVisibility: (id: string) => Promise<void>;
  updateWidgetSlotSize: (id: string, slotSize: WidgetSlotSize) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  syncWithSupabase: () => Promise<{ success: boolean; message: string }>;
  isSyncing: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [cycle, setCycle] = useState<AllowanceCycle | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>([]);
  const [isDashboardEditing, setIsDashboardEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(getInitialProfile);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    async function loadAll() {
      const [c, e, cat, g, w, p] = await Promise.all([
        StorageService.loadCycle(),
        StorageService.loadExpenses(),
        StorageService.loadCategories(),
        StorageService.loadGoals(),
        StorageService.loadWidgets(),
        StorageService.loadProfile(),
      ]);

      const normalizedWidgets = (w || []).map((widget) => {
        if (!isSizeAllowed(widget.type, widget.slotSize)) {
          return { ...widget, slotSize: getAllowedSizes(widget.type)[0] };
        }
        return widget;
      });

      setCycle(c);
      setExpenses(e);
      setCategories(cat);
      setGoals(g);
      setWidgets(normalizedWidgets);
      setProfile(p);
      setIsLoaded(true);
    }
    loadAll();
  }, []);

  const formatMoney = (amount: number) => {
    const code = profile?.currencyCode || 'IDR';
    const cfg = CURRENCIES[code] || CURRENCIES.IDR;
    return cfg.format(amount);
  };

  const currencyCode = profile?.currencyCode || 'IDR';

  const predictiveInsights = useMemo(() => {
    return calculatePredictiveInsights(cycle, expenses, categories, goals);
  }, [cycle, expenses, categories, goals]);

  const addExpense = async (data: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...data,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    await StorageService.saveExpenses(updated);

    // Update streak logic
    const today = new Date().toISOString().split('T')[0];
    if (profile.lastLoggedDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const isConsecutive = profile.lastLoggedDate === yesterdayStr;
      const newStreak = isConsecutive ? (profile.currentStreak || 0) + 1 : 1;
      const best = Math.max(newStreak, profile.bestStreak || 0);

      const updatedProfile = {
        ...profile,
        currentStreak: newStreak,
        bestStreak: best,
        lastLoggedDate: today,
      };
      setProfile(updatedProfile);
      await StorageService.saveProfile(updatedProfile);
    }

    // Background sync to Supabase if authenticated
    if (isSupabaseConfigured) {
      supabase.auth.getUser().then(({ data: userRes }) => {
        if (userRes.user) {
          supabase
            .from('expenses')
            .insert({
              id: newExpense.id.startsWith('exp-') ? undefined : newExpense.id,
              user_id: userRes.user.id,
              cycle_id: cycle?.id.startsWith('cycle-') ? null : cycle?.id || null,
              category_id: newExpense.categoryId,
              title: newExpense.title,
              amount: newExpense.amount,
              spent_at: newExpense.spentAt,
              note: newExpense.note || null,
            })
            .then(() => {});
        }
      });
    }
  };

  const deleteExpense = async (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    await StorageService.saveExpenses(updated);

    if (isSupabaseConfigured) {
      supabase.auth.getUser().then(({ data: userRes }) => {
        if (userRes.user && !id.startsWith('exp-')) {
          supabase.from('expenses').delete().eq('id', id).then(() => {});
        }
      });
    }
  };

  const updateExpense = async (expense: Expense) => {
    const updated = expenses.map((e) => (e.id === expense.id ? expense : e));
    setExpenses(updated);
    await StorageService.saveExpenses(updated);

    if (isSupabaseConfigured) {
      supabase.auth.getUser().then(({ data: userRes }) => {
        if (userRes.user && !expense.id.startsWith('exp-')) {
          supabase
            .from('expenses')
            .update({
              title: expense.title,
              amount: expense.amount,
              category_id: expense.categoryId,
              note: expense.note || null,
            })
            .eq('id', expense.id)
            .then(() => {});
        }
      });
    }
  };

  const updateCycle = async (newCycle: AllowanceCycle) => {
    setCycle(newCycle);
    await StorageService.saveCycle(newCycle);

    if (isSupabaseConfigured) {
      supabase.auth.getUser().then(({ data: userRes }) => {
        if (userRes.user) {
          supabase
            .from('allowance_cycles')
            .upsert({
              id: newCycle.id.startsWith('cycle-') ? undefined : newCycle.id,
              user_id: userRes.user.id,
              amount: newCycle.amount,
              period: newCycle.period,
              start_date: newCycle.startDate,
              end_date: newCycle.endDate,
              is_active: newCycle.isActive,
            })
            .then(() => {});
        }
      });
    }
  };

  const addCategory = async (cat: Category) => {
    const updated = [...categories, cat];
    setCategories(updated);
    await StorageService.saveCategories(updated);

    if (isSupabaseConfigured) {
      supabase.auth.getUser().then(({ data: userRes }) => {
        if (userRes.user) {
          supabase
            .from('categories')
            .upsert({
              id: cat.id,
              user_id: userRes.user.id,
              name: cat.name,
              icon: cat.icon,
              color: cat.color,
            })
            .then(() => {});
        }
      });
    }
  };

  const deleteCategory = async (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    await StorageService.saveCategories(updated);

    if (isSupabaseConfigured) {
      supabase.auth.getUser().then(({ data: userRes }) => {
        if (userRes.user) {
          supabase.from('categories').delete().eq('id', id).then(() => {});
        }
      });
    }
  };

  const addGoal = async (goalData: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      currentAmount: 0,
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    await StorageService.saveGoals(updated);

    if (isSupabaseConfigured) {
      supabase.auth.getUser().then(({ data: userRes }) => {
        if (userRes.user) {
          supabase
            .from('savings_goals')
            .insert({
              id: newGoal.id.startsWith('goal-') ? undefined : newGoal.id,
              user_id: userRes.user.id,
              title: newGoal.title,
              target_amount: newGoal.targetAmount,
              current_amount: 0,
              icon: newGoal.icon,
              color: newGoal.color,
              is_public: newGoal.isPublic,
            })
            .then(() => {});
        }
      });
    }
  };

  const updateGoalAmount = async (id: string, delta: number) => {
    const updated = goals.map((g) => {
      if (g.id === id) {
        const nextAmt = Math.max(0, Math.min(g.targetAmount, (g.currentAmount || 0) + delta));
        return { ...g, currentAmount: nextAmt };
      }
      return g;
    });
    setGoals(updated);
    await StorageService.saveGoals(updated);
  };

  const deleteGoal = async (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    await StorageService.saveGoals(updated);
  };

  const reorderWidgets = async (newWidgets: DashboardWidgetConfig[]) => {
    const withOrder = newWidgets.map((w, idx) => ({ ...w, order: idx }));
    setWidgets(withOrder);
    await StorageService.saveWidgets(withOrder);
  };

  const toggleWidgetVisibility = async (id: string) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, isVisible: !w.isVisible } : w));
    setWidgets(updated);
    await StorageService.saveWidgets(updated);
  };

  const updateWidgetSlotSize = async (id: string, slotSize: WidgetSlotSize) => {
    const updated = widgets.map((w) => {
      if (w.id === id) {
        const finalSize = isSizeAllowed(w.type, slotSize) ? slotSize : w.slotSize;
        return { ...w, slotSize: finalSize };
      }
      return w;
    });
    setWidgets(updated);
    await StorageService.saveWidgets(updated);
  };

  const updateProfile = async (partial: Partial<UserProfile>) => {
    const updated = { ...profile, ...partial };
    setProfile(updated);
    await StorageService.saveProfile(updated);
  };

  const syncWithSupabase = async () => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        message: 'Supabase credentials not configured in .env yet. Running in offline-first mode!',
      };
    }

    setIsSyncing(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        setIsSyncing(false);
        return {
          success: false,
          message: 'Sign in to sync your expenses and profile to Supabase Cloud.',
        };
      }

      const userId = userRes.user.id;

      // 1. Upsert profile
      await supabase.from('profiles').upsert({
        id: userId,
        username: profile.username,
        display_name: profile.displayName,
        bio: profile.bio,
        currency_code: profile.currencyCode,
        current_streak: profile.currentStreak,
        best_streak: profile.bestStreak,
        is_public: profile.isPublic,
      });

      // 2. Upsert allowance cycle
      if (cycle) {
        await supabase.from('allowance_cycles').upsert({
          user_id: userId,
          amount: cycle.amount,
          period: cycle.period,
          start_date: cycle.startDate,
          end_date: cycle.endDate,
          is_active: cycle.isActive,
        });
      }

      // 3. Upsert custom categories
      const customCats = categories.filter((c) => c.isCustom);
      for (const cat of customCats) {
        await supabase.from('categories').upsert({
          id: cat.id,
          user_id: userId,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
        });
      }

      // 4. Upsert goals
      for (const goal of goals) {
        await supabase.from('savings_goals').upsert({
          user_id: userId,
          title: goal.title,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          icon: goal.icon,
          color: goal.color,
          is_public: goal.isPublic,
        });
      }

      setIsSyncing(false);
      return { success: true, message: 'Successfully synced all data with Supabase Cloud!' };
    } catch (err: any) {
      setIsSyncing(false);
      return { success: false, message: err.message || 'Sync failed.' };
    }
  };

  return (
    <DataContext.Provider
      value={{
        isLoaded,
        cycle,
        expenses,
        categories,
        goals,
        widgets,
        isDashboardEditing,
        setIsDashboardEditing,
        profile,
        predictiveInsights,
        formatMoney,
        currencyCode,
        addExpense,
        deleteExpense,
        updateExpense,
        updateCycle,
        addCategory,
        deleteCategory,
        addGoal,
        updateGoalAmount,
        deleteGoal,
        reorderWidgets,
        toggleWidgetVisibility,
        updateWidgetSlotSize,
        updateProfile,
        syncWithSupabase,
        isSyncing,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
