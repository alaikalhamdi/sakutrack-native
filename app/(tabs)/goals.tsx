import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/common/Card';
import { AddGoalModal } from '../../components/goals/AddGoalModal';
import { GoalCelebrationModal } from '../../components/goals/GoalCelebrationModal';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { SavingsGoal } from '../../types/expense';

export default function GoalsScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { goals, updateGoalAmount, deleteGoal, formatMoney, currencyCode } = useData();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [celebratedGoal, setCelebratedGoal] = useState<SavingsGoal | null>(null);

  const isUSD = currencyCode === 'USD';
  const deposits = isUSD ? [5, 20, 50] : [20000, 50000, 100000];

  const totalSaved = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const totalTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  const overallPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleDeposit = async (id: string, delta: number) => {
    const goal = goals.find((g) => g.id === id);
    if (goal) {
      const prevAmt = goal.currentAmount || 0;
      const newAmt = prevAmt + delta;
      if (newAmt >= goal.targetAmount && prevAmt < goal.targetAmount) {
        setCelebratedGoal({ ...goal, currentAmount: goal.targetAmount });
      }
    }
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore
    }
    await updateGoalAmount(id, delta);
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      {/* Screen Header */}
      <View style={styles.topHeader}>
        <View>
          <Text
            style={[
              styles.screenTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.fontStyle === 'mono' ? 'Courier' : undefined,
              },
            ]}
          >
            Savings Goals 🎯
          </Text>
          <Text style={[styles.screenSubtitle, { color: theme.colors.textSecondary }]}>
            Stash cash for student wishes, gadgets & experiences
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setAddModalVisible(true)}
          style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.addBtnText}>New Goal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Overall Goals Progress Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                TOTAL SAVED FOR GOALS
              </Text>
              <Text
                style={[
                  styles.summaryTotal,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.fontStyle === 'mono' ? 'Courier' : undefined,
                  },
                ]}
              >
                {formatMoney(totalSaved)}
              </Text>
            </View>

            <View
              style={[
                styles.overallBadge,
                { backgroundColor: theme.colors.primaryLight },
              ]}
            >
              <Text style={[styles.overallBadgeText, { color: theme.colors.primary }]}>
                {overallPercent}% Reached
              </Text>
            </View>
          </View>

          <View style={styles.summaryProgressTrack}>
            <View
              style={[
                styles.summaryProgressFill,
                {
                  width: `${overallPercent}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>

          <Text style={[styles.summarySub, { color: theme.colors.textMuted }]}>
            Target: {formatMoney(totalTarget)} across {goals.length} goals
          </Text>
        </Card>

        {/* Goals List */}
        {goals.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No savings goals yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textMuted }]}>
              Create your first student goal like concert tickets, a laptop, or an emergency fund!
            </Text>
          </View>
        ) : (
          <View style={styles.goalsList}>
            {goals.map((g) => {
              const current = g.currentAmount || 0;
              const target = g.targetAmount || 1;
              const percent = Math.min(100, Math.round((current / target) * 100));
              const isCompleted = percent >= 100;

              return (
                <Card key={g.id} style={styles.goalCard}>
                  <View style={styles.goalTopRow}>
                    <View style={styles.goalTitleWrap}>
                      <View
                        style={[
                          styles.iconBox,
                          {
                            backgroundColor: (g.color || theme.colors.primary) + '22',
                            borderColor: g.color || theme.colors.primary,
                            borderWidth: theme.borderWidth > 0 ? 1 : 0,
                          },
                        ]}
                      >
                        <Ionicons
                          name={(g.icon as any) || 'trophy'}
                          size={20}
                          color={g.color || theme.colors.primary}
                        />
                      </View>

                      <View>
                        <Text style={[styles.goalTitle, { color: theme.colors.text }]}>
                          {g.title}
                        </Text>
                        <View style={styles.badgeRow}>
                          {g.isPublic && (
                            <View
                              style={[
                                styles.publicBadge,
                                { backgroundColor: theme.colors.surfaceSubtle },
                              ]}
                            >
                              <Ionicons
                                name="globe-outline"
                                size={10}
                                color={theme.colors.textMuted}
                              />
                              <Text
                                style={[styles.publicText, { color: theme.colors.textMuted }]}
                              >
                                Public on profile
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity onPress={() => deleteGoal(g.id)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={16} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {/* Amounts */}
                  <View style={styles.amountRow}>
                    <Text
                      style={[
                        styles.currentAmount,
                        {
                          color: isCompleted ? '#D97706' : theme.colors.text,
                          fontFamily: theme.fontStyle === 'mono' ? 'Courier' : undefined,
                        },
                      ]}
                    >
                      {formatMoney(current)}
                    </Text>
                    <Text style={[styles.targetAmount, { color: theme.colors.textMuted }]}>
                      of {formatMoney(target)}
                    </Text>
                  </View>

                  {/* Progress bar */}
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${percent}%`,
                          backgroundColor: isCompleted ? '#FFD700' : g.color || theme.colors.accent,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.percentRow}>
                    <Text style={[styles.percentLabel, { color: theme.colors.textSecondary }]}>
                      {percent}% completed
                    </Text>
                    {isCompleted && (
                      <TouchableOpacity
                        onPress={() => setCelebratedGoal(g)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.completedText}>GOAL REACHED! 🎉</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Quick deposit chips */}
                  {!isCompleted && (
                    <View style={styles.depositRow}>
                      <Text style={[styles.depositLabel, { color: theme.colors.textMuted }]}>
                        Add funds:
                      </Text>
                      {deposits.map((d) => (
                        <TouchableOpacity
                          key={d}
                          onPress={() => handleDeposit(g.id, d)}
                          style={[
                            styles.depositChip,
                            {
                              backgroundColor: theme.colors.surfaceSubtle,
                              borderColor: theme.colors.border,
                              borderWidth: 1,
                              borderRadius: 12,
                            },
                          ]}
                        >
                          <Text style={[styles.depositChipText, { color: theme.colors.primary }]}>
                            +{isUSD ? `$${d}` : `${d / 1000}k`}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Goal Modal */}
      <AddGoalModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
      />

      {/* Goal Celebration Modal */}
      <GoalCelebrationModal
        visible={Boolean(celebratedGoal)}
        goal={celebratedGoal}
        onClose={() => setCelebratedGoal(null)}
        onShareProfile={() => router.push('/(tabs)/profile')}
        formatMoney={formatMoney}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  summaryCard: {
    marginTop: 10,
    marginBottom: 16,
    padding: 16,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  summaryTotal: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  overallBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  overallBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryProgressTrack: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  summaryProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  summarySub: {
    fontSize: 11,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 240,
  },
  goalsList: {
    gap: 12,
  },
  goalCard: {
    padding: 16,
  },
  goalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  goalTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  publicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  publicText: {
    fontSize: 10,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 8,
  },
  currentAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  targetAmount: {
    fontSize: 13,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  percentLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  completedText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '800',
  },
  depositRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingTop: 10,
  },
  depositLabel: {
    fontSize: 11,
  },
  depositChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  depositChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
