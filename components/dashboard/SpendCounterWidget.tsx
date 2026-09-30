import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Card } from '../common/Card';

type Period = 'today' | 'week' | 'month';

export const SpendCounterWidget: React.FC = () => {
  const { theme } = useAppTheme();
  const { expenses, formatMoney } = useData();
  const [period, setPeriod] = useState<Period>('today');

  const totalSpent = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return expenses.reduce((sum, e) => {
      const expDate = new Date(e.spentAt);
      if (period === 'today') {
        const isToday = e.spentAt.startsWith(todayStr);
        return isToday ? sum + e.amount : sum;
      }
      if (period === 'week') {
        const diffTime = Math.abs(now.getTime() - expDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 ? sum + e.amount : sum;
      }
      if (period === 'month') {
        const isThisMonth =
          expDate.getMonth() === now.getMonth() &&
          expDate.getFullYear() === now.getFullYear();
        return isThisMonth ? sum + e.amount : sum;
      }
      return sum;
    }, 0);
  }, [expenses, period]);

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
          SPENT ({period.toUpperCase()})
        </Text>
        {/* Toggle Pills */}
        <View style={[styles.toggleBar, { backgroundColor: theme.colors.surfaceSubtle }]}>
          {(['today', 'week', 'month'] as Period[]).map((p) => {
            const isSelected = period === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                style={[
                  styles.pill,
                  isSelected && {
                    backgroundColor: theme.colors.primary,
                    borderRadius: 8,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.colors.textMuted,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {p[0].toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          styles.amount,
          {
            color: theme.colors.text,
            fontFamily: theme.fontStyle === 'mono' ? 'Courier' : undefined,
          },
        ]}
      >
        {formatMoney(totalSpent)}
      </Text>

      <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
        Tracked outgoings
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  toggleBar: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
  },
  pill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  pillText: {
    fontSize: 9,
  },
  amount: {
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 4,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
});
