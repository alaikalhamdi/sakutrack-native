import {
  AllowanceCycle,
  BrokeStatus,
  Category,
  Expense,
  PredictiveInsights,
  SavingsGoal,
} from '../types/expense';

export function calculatePredictiveInsights(
  cycle: AllowanceCycle | null,
  expenses: Expense[],
  categories: Category[],
  savingsGoals: SavingsGoal[] = []
): PredictiveInsights {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Default fallback if no cycle is set
  if (!cycle) {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      dailySafeToSpend: 0,
      burnRatePerDay: 0,
      projectedRunwayDays: 0,
      projectedDepletionDate: todayStr,
      daysRemainingInCycle: 0,
      daysElapsedInCycle: 1,
      totalSpentInCycle: totalSpent,
      remainingAllowance: 0,
      brokeStatus: {
        level: 'cruising',
        title: 'Cruising Along',
        emoji: '🌱',
        description: 'Set an allowance cycle to activate predictive runway & safe-to-spend limits.',
        color: '#4EA8DE',
        burnRateRatio: 1.0,
      },
      isBurnoutEarly: false,
    };
  }

  const start = new Date(cycle.startDate);
  const end = new Date(cycle.endDate);
  const totalCycleDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  // Calculate elapsed days
  const elapsedDays = Math.max(
    1,
    Math.min(
      totalCycleDays,
      Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    )
  );

  const remainingDays = Math.max(0, totalCycleDays - elapsedDays);

  // Filter expenses belonging to this cycle
  const cycleExpenses = expenses.filter((e) => {
    const expenseDate = new Date(e.spentAt);
    return expenseDate >= start && expenseDate <= end;
  });

  const totalSpentInCycle = cycleExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingAllowance = Math.max(0, cycle.amount - totalSpentInCycle);

  // Committed savings buffer (e.g. 10% or from goals)
  const committedSavings = savingsGoals.reduce((sum, g) => sum + (g.currentAmount || 0), 0) * 0.05;
  const effectiveRemaining = Math.max(0, remainingAllowance - committedSavings);

  // Daily Safe-to-Spend
  const safeDaysDivisor = Math.max(1, remainingDays === 0 ? 1 : remainingDays);
  const dailySafeToSpend = Math.round(effectiveRemaining / safeDaysDivisor);

  // Daily Burn Rate
  const burnRatePerDay = totalSpentInCycle / elapsedDays;

  // Expected ideal burn rate per day
  const idealBurnRate = cycle.amount / totalCycleDays;
  const burnRatio = idealBurnRate > 0 ? burnRatePerDay / idealBurnRate : 1.0;

  // Runway days remaining at current burn rate
  const projectedRunwayDays =
    burnRatePerDay > 0
      ? Math.max(0, Math.floor(remainingAllowance / burnRatePerDay))
      : remainingDays;

  const depletionDate = new Date(now);
  depletionDate.setDate(now.getDate() + projectedRunwayDays);
  const projectedDepletionDate = depletionDate.toISOString().split('T')[0];

  const isBurnoutEarly = remainingDays > 0 && projectedRunwayDays < remainingDays;

  // Broke Status evaluation
  let brokeStatus: BrokeStatus;
  if (remainingAllowance <= 0 || (isBurnoutEarly && projectedRunwayDays <= 3)) {
    brokeStatus = {
      level: 'survival',
      title: 'Survival Protocol',
      emoji: '🚨',
      description: 'Runway is nearly out! Free campus water & instant noodles only.',
      color: '#EF4444',
      burnRateRatio: burnRatio,
    };
  } else if (burnRatio > 1.25 || isBurnoutEarly) {
    brokeStatus = {
      level: 'indomie',
      title: 'Indomie Alert',
      emoji: '🍜',
      description: 'Spending faster than expected. Ease off the extra boba and snack runs!',
      color: '#F59E0B',
      burnRateRatio: burnRatio,
    };
  } else if (burnRatio > 0.8) {
    brokeStatus = {
      level: 'cruising',
      title: 'Cruising Along',
      emoji: '🚀',
      description: 'Healthy rhythm. Your wallet will comfortably make it to the next allowance.',
      color: '#10B981',
      burnRateRatio: burnRatio,
    };
  } else {
    brokeStatus = {
      level: 'sultan',
      title: 'Sultan Mode',
      emoji: '💎',
      description: 'Master saver! You are way under budget and accumulating surplus.',
      color: '#8A2BE2',
      burnRateRatio: burnRatio,
    };
  }

  // Find top spending category
  const categoryTotals: Record<string, number> = {};
  cycleExpenses.forEach((e) => {
    categoryTotals[e.categoryId] = (categoryTotals[e.categoryId] || 0) + e.amount;
  });

  let topCategory: { name: string; amount: number; percentage: number } | undefined;
  let maxCatAmount = 0;
  let topCatId = '';

  Object.entries(categoryTotals).forEach(([catId, amt]) => {
    if (amt > maxCatAmount) {
      maxCatAmount = amt;
      topCatId = catId;
    }
  });

  if (topCatId && totalSpentInCycle > 0) {
    const cat = categories.find((c) => c.id === topCatId);
    topCategory = {
      name: cat ? cat.name : 'Other',
      amount: maxCatAmount,
      percentage: Math.round((maxCatAmount / totalSpentInCycle) * 100),
    };
  }

  return {
    dailySafeToSpend,
    burnRatePerDay,
    projectedRunwayDays,
    projectedDepletionDate,
    daysRemainingInCycle: remainingDays,
    daysElapsedInCycle: elapsedDays,
    totalSpentInCycle,
    remainingAllowance,
    brokeStatus,
    isBurnoutEarly,
    topExpenseCategory: topCategory,
  };
}
