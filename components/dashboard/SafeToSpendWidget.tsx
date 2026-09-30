import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Text } from '../common/AppText';
import { Card } from '../common/Card';

export const SafeToSpendWidget: React.FC = () => {
  const { theme } = useAppTheme();
  const { cycle, predictiveInsights, formatMoney } = useData();

  const safeAmount = predictiveInsights.dailySafeToSpend;

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Ionicons name="sparkles" size={13} color={theme.colors.accent} />
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.title, { color: theme.colors.textSecondary }]}
          >
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
            fontFamily: theme.fonts?.bold,
          },
        ]}
      >
        {cycle ? formatMoney(safeAmount) : '—'}
      </Text>

      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[styles.subtitle, { color: theme.colors.textMuted }]}
      >
        {cycle ? 'Safe daily limit to survive cycle' : 'Requires active allowance'}
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
    gap: 4,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    flexShrink: 1,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  emoji: {
    fontSize: 16,
    flexShrink: 0,
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
