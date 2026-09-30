import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';

export const RunwayWidget: React.FC = () => {
  const { theme } = useAppTheme();
  const { cycle, predictiveInsights, formatMoney } = useData();

  const {
    remainingAllowance,
    projectedRunwayDays,
    daysRemainingInCycle,
    brokeStatus,
    isBurnoutEarly,
  } = predictiveInsights;

  const totalCycleAmount = cycle?.amount || 1;
  const percentRemaining = Math.max(0, Math.min(100, (remainingAllowance / totalCycleAmount) * 100));

  return (
    <Card style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Ionicons name="speedometer-outline" size={16} color={theme.colors.accent} />
          <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
            ALLOWANCE RUNWAY & BROKE-METER
          </Text>
        </View>

        <Badge
          label={brokeStatus.title}
          icon={<Text style={{ fontSize: 13 }}>{brokeStatus.emoji}</Text>}
          color={brokeStatus.color}
          backgroundColor={theme.colors.surfaceSubtle}
          size="sm"
        />
      </View>

      {/* Main Numbers Row */}
      <View style={styles.numbersRow}>
        <View>
          <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
            Allowance Left
          </Text>
          <Text
            style={[
              styles.remainingAmount,
              {
                color: theme.colors.text,
                fontFamily: theme.fontStyle === 'mono' ? 'Courier' : undefined,
              },
            ]}
          >
            {formatMoney(remainingAllowance)}
          </Text>
        </View>

        <View style={styles.rightStat}>
          <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
            Forecast Runway
          </Text>
          <View style={styles.runwayTag}>
            <Text
              style={[
                styles.runwayDays,
                {
                  color: isBurnoutEarly ? theme.colors.danger : theme.colors.success,
                  fontFamily: theme.fontStyle === 'mono' ? 'Courier' : undefined,
                },
              ]}
            >
              {projectedRunwayDays} days left
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressWrap}>
        <View
          style={[
            styles.progressBarBg,
            { backgroundColor: theme.colors.surfaceSubtle },
          ]}
        >
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${percentRemaining}%`,
                backgroundColor:
                  percentRemaining < 20
                    ? theme.colors.danger
                    : percentRemaining < 50
                    ? theme.colors.warning
                    : theme.colors.primary,
                borderRadius: theme.borderRadius,
              },
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressNote, { color: theme.colors.textMuted }]}>
            {percentRemaining.toFixed(0)}% of saku available
          </Text>
          <Text style={[styles.progressNote, { color: theme.colors.textMuted }]}>
            {daysRemainingInCycle} days left in cycle
          </Text>
        </View>
      </View>

      {/* Relatable Insight Note */}
      <View
        style={[
          styles.noteBox,
          {
            backgroundColor: theme.colors.surfaceSubtle,
            borderLeftColor: brokeStatus.color,
            borderLeftWidth: 3,
          },
        ]}
      >
        <Text style={[styles.noteText, { color: theme.colors.textSecondary }]}>
          💡 {brokeStatus.description}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  numbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  remainingAmount: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  rightStat: {
    alignItems: 'flex-end',
  },
  runwayTag: {
    marginTop: 2,
  },
  runwayDays: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressWrap: {
    marginBottom: 10,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressNote: {
    fontSize: 10,
  },
  noteBox: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  noteText: {
    fontSize: 11,
    lineHeight: 15,
  },
});
