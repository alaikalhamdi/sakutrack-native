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
      daysElapsedInCycle: 0,
      totalSpentInCycle: totalSpent,
      remainingAllowance: 0,
      brokeStatus: {
        level: 'cruising',
        title: 'No Active Budget',
        emoji: '🌱',
        description: 'Set an allowance cycle to activate your predictive runway & daily limits.',
        color: '#4EA8DE',
        burnRateRatio: 1.0,
      },
      isBurnoutEarly: false,
    };
  }

  // Parse dates with local calendar year/month/day to prevent UTC midnight shifts
  const [sYear, sMonth, sDay] = cycle.startDate.split('-').map(Number);
  const [eYear, eMonth, eDay] = cycle.endDate.split('-').map(Number);
  const startDate = new Date(sYear, sMonth - 1, sDay, 0, 0, 0, 0);
  const endDate = new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const msPerDay = 1000 * 60 * 60 * 24;

  const totalCycleDays = Math.max(
    1,
    Math.round(
      (new Date(eYear, eMonth - 1, eDay).getTime() -
        new Date(sYear, sMonth - 1, sDay).getTime()) /
        msPerDay
    ) + 1
  );

  let elapsedDays = 1;
  let daysRemainingInCycle = 0;

  if (today.getTime() < startDate.getTime()) {
    // Cycle starts in future
    elapsedDays = 0;
    daysRemainingInCycle = totalCycleDays;
  } else if (today.getTime() > endDate.getTime()) {
    // Cycle has ended
    elapsedDays = totalCycleDays;
    daysRemainingInCycle = 0;
  } else {
    // Currently within cycle
    const daysFromStart = Math.round((today.getTime() - startDate.getTime()) / msPerDay);
    elapsedDays = daysFromStart + 1; // e.g. Day 1 of 30, up to Day 30 of 30
    daysRemainingInCycle = Math.max(1, totalCycleDays - daysFromStart); // inclusive of today!
  }

  // Filter expenses belonging to this cycle (inclusive of start and end timestamps)
  const cycleExpenses = expenses.filter((e) => {
    const expenseDate = new Date(e.spentAt);
    return expenseDate >= startDate && expenseDate <= endDate;
  });

  const totalSpentInCycle = cycleExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingAllowance = Math.max(0, cycle.amount - totalSpentInCycle);

  // Committed savings buffer (e.g. 5% from goals)
  const committedSavings =
    savingsGoals.reduce((sum, g) => sum + (g.currentAmount || 0), 0) * 0.05;
  const effectiveRemaining = Math.max(0, remainingAllowance - committedSavings);

  // Daily Safe-to-Spend
  const safeDaysDivisor = Math.max(1, daysRemainingInCycle > 0 ? daysRemainingInCycle : 1);
  const dailySafeToSpend = Math.round(effectiveRemaining / safeDaysDivisor);

  // Daily Burn Rate: how much spent per elapsed day so far
  const burnRatePerDay = elapsedDays > 0 ? Math.round(totalSpentInCycle / elapsedDays) : 0;

  // Expected ideal burn rate per day
  const idealBurnRate = cycle.amount / totalCycleDays;
  const burnRatio =
    idealBurnRate > 0 && burnRatePerDay > 0
      ? burnRatePerDay / idealBurnRate
      : totalSpentInCycle === 0
      ? 0
      : 1.0;

  // Projected Runway Days:
  // If no expenses yet and allowance remaining: full remaining days in cycle!
  // If burn rate > 0: remainingAllowance / burnRatePerDay
  let projectedRunwayDays: number;
  if (remainingAllowance <= 0) {
    projectedRunwayDays = 0;
  } else if (burnRatePerDay === 0) {
    projectedRunwayDays = daysRemainingInCycle;
  } else {
    projectedRunwayDays = Math.max(0, Math.floor(remainingAllowance / burnRatePerDay));
  }

  const depletionDate = new Date(now);
  depletionDate.setDate(now.getDate() + projectedRunwayDays);
  const projectedDepletionDate = depletionDate.toISOString().split('T')[0];

  const isBurnoutEarly = daysRemainingInCycle > 0 && projectedRunwayDays < daysRemainingInCycle;

  // Broke Status evaluation
  let brokeStatus: BrokeStatus;
  if (remainingAllowance <= 0) {
    brokeStatus = {
      level: 'survival',
      title: 'Allowance Depleted',
      emoji: '🚨',
      description: 'You have reached your allowance limit. Campus water & survival mode!',
      color: '#EF4444',
      burnRateRatio: burnRatio,
    };
  } else if (isBurnoutEarly && projectedRunwayDays <= 3) {
    brokeStatus = {
      level: 'survival',
      title: 'Survival Protocol',
      emoji: '🚨',
      description: `Runway is nearly out! Only ${projectedRunwayDays} ${
        projectedRunwayDays === 1 ? 'day' : 'days'
      } left at current burn rate.`,
      color: '#EF4444',
      burnRateRatio: burnRatio,
    };
  } else if (isBurnoutEarly || burnRatio > 1.25) {
    brokeStatus = {
      level: 'indomie',
      title: 'Indomie Alert',
      emoji: '🍜',
      description: 'Spending faster than budgeted! Ease off unnecessary snacks and treats.',
      color: '#F59E0B',
      burnRateRatio: burnRatio,
    };
  } else if (burnRatio > 0.8) {
    brokeStatus = {
      level: 'cruising',
      title: 'Cruising Along',
      emoji: '🚀',
      description: 'Healthy rhythm! Your wallet will comfortably make it to the next allowance.',
      color: '#10B981',
      burnRateRatio: burnRatio,
    };
  } else {
    brokeStatus = {
      level: 'sultan',
      title: 'Sultan Mode',
      emoji: '💎',
      description: 'Master saver! You are well within budget and accumulating surplus.',
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
    daysRemainingInCycle,
    daysElapsedInCycle: elapsedDays,
    totalSpentInCycle,
    remainingAllowance,
    brokeStatus,
    isBurnoutEarly,
    topExpenseCategory: topCategory,
  };
}
