export type CurrencyCode = 'IDR' | 'USD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  decimals: number;
  format: (amount: number) => string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Ionicons / MaterialCommunityIcons key
  color: string;
  isCustom?: boolean;
}

export interface AllowanceCycle {
  id: string;
  amount: number; // e.g. 2,000,000 IDR or 400 USD
  period: 'monthly' | 'weekly' | 'biweekly';
  startDate: string; // ISO date YYYY-MM-DD
  endDate: string; // ISO date YYYY-MM-DD
  isActive: boolean;
}

export interface Expense {
  id: string;
  cycleId?: string;
  categoryId: string;
  title: string;
  amount: number;
  spentAt: string; // ISO date timestamp
  note?: string;
  isImpulse?: boolean;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  icon: string;
  color: string;
  isPublic: boolean;
}

export type BrokeLevel = 'sultan' | 'cruising' | 'indomie' | 'survival';

export interface BrokeStatus {
  level: BrokeLevel;
  title: string;
  emoji: string;
  description: string;
  color: string;
  burnRateRatio: number; // e.g., 0.8 = spending at 80% of max allowed pace
}

export interface PredictiveInsights {
  dailySafeToSpend: number;
  burnRatePerDay: number;
  projectedRunwayDays: number;
  projectedDepletionDate: string;
  daysRemainingInCycle: number;
  daysElapsedInCycle: number;
  totalSpentInCycle: number;
  remainingAllowance: number;
  brokeStatus: BrokeStatus;
  isBurnoutEarly: boolean;
  topExpenseCategory?: {
    name: string;
    amount: number;
    percentage: number;
  };
}
