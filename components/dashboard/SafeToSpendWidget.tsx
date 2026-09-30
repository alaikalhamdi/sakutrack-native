import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Card } from '../common/Card';

export const SafeToSpendWidget: React.FC = () => {
  const { theme } = useAppTheme();
  const { predictiveInsights, formatMoney } = useData();

  const safeAmount = predictiveInsights.dailySafeToSpend;

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Ionicons name="sparkles" size={14} color={theme.colors.accent} />
          <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
            DAILY SAFE-TO-SPEND
          </Text>
        </View>
        <Text style={styles.emoji}>🛡️</Text>
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          styles.amount,
          {
            color: theme.colors.primary,
            fontFamily: theme.fontStyle === 'mono' ? 'Courier' : undefined,
          },
        ]}
      >
        {formatMoney(safeAmount)}
      </Text>

      <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
        Safe daily limit to survive cycle
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
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emoji: {
    fontSize: 16,
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
