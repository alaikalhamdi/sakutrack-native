import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Card } from '../common/Card';

export const CategoryDonutWidget: React.FC = () => {
  const { theme } = useAppTheme();
  const { expenses, categories, formatMoney } = useData();

  const categoryStats = useMemo(() => {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const catMap: Record<string, number> = {};

    expenses.forEach((e) => {
      catMap[e.categoryId] = (catMap[e.categoryId] || 0) + e.amount;
    });

    return categories
      .map((cat) => {
        const spent = catMap[cat.id] || 0;
        const percent = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;
        return {
          ...cat,
          spent,
          percent,
        };
      })
      .filter((c) => c.spent > 0)
      .sort((a, b) => b.spent - a.spent);
  }, [expenses, categories]);

  const impulseCount = useMemo(() => {
    return expenses.filter((e) => e.isImpulse).length;
  }, [expenses]);

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Ionicons name="pie-chart-outline" size={16} color={theme.colors.accent} />
          <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
            WHERE MONEY GOES
          </Text>
        </View>

        {impulseCount > 0 && (
          <View style={[styles.impulseBadge, { backgroundColor: '#FFEBE5' }]}>
            <Text style={styles.impulseText}>⚡ {impulseCount} Impulse</Text>
          </View>
        )}
      </View>

      {categoryStats.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
          Log expenses to see your spending breakdown.
        </Text>
      ) : (
        <View style={styles.categoryList}>
          {categoryStats.slice(0, 4).map((cat) => (
            <View key={cat.id} style={styles.catRow}>
              <View style={styles.catHeader}>
                <View style={styles.catNameWrap}>
                  <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
                  <Text style={[styles.catName, { color: theme.colors.text }]}>
                    {cat.name}
                  </Text>
                </View>
                <View style={styles.catValues}>
                  <Text style={[styles.catSpent, { color: theme.colors.text }]}>
                    {formatMoney(cat.spent)}
                  </Text>
                  <Text style={[styles.catPercent, { color: theme.colors.textSecondary }]}>
                    {cat.percent}%
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.barBg,
                  { backgroundColor: theme.colors.surfaceSubtle },
                ]}
              >
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${cat.percent}%`,
                      backgroundColor: cat.color,
                      borderRadius: 3,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  impulseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  impulseText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D90429',
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  categoryList: {
    gap: 12,
  },
  catRow: {
    gap: 4,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catName: {
    fontSize: 12,
    fontWeight: '600',
  },
  catValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catSpent: {
    fontSize: 12,
    fontWeight: '700',
  },
  catPercent: {
    fontSize: 11,
  },
  barBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
});
