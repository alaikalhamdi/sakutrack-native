import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useData } from "../../context/DataContext";
import { useAppTheme } from "../../context/ThemeContext";
import { Text } from "../common/AppText";
import { Card } from "../common/Card";

interface SavingsProps {
  onOpenGoalsTab: () => void;
}

export const SavingsGoalsWidget: React.FC<SavingsProps> = ({
  onOpenGoalsTab,
}) => {
  const { theme } = useAppTheme();
  const { goals, updateGoalAmount, formatMoney, currencyCode } = useData();

  const isUSD = currencyCode === "USD";
  const quickDepositAmount = isUSD ? 10 : 50000;

  const handleDeposit = async (goalId: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore
    }
    await updateGoalAmount(goalId, quickDepositAmount);
  };

  const topGoals = goals.slice(0, 2);

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Ionicons
            name="trophy-outline"
            size={16}
            color={theme.colors.accent}
          />
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.title, { color: theme.colors.textSecondary }]}
          >
            SAVINGS GOALS
          </Text>
        </View>

        <TouchableOpacity onPress={onOpenGoalsTab} style={{ flexShrink: 0 }}>
          <Text style={[styles.viewAll, { color: theme.colors.primary }]}>
            View All →
          </Text>
        </TouchableOpacity>
      </View>

      {topGoals.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
          No goals yet. Add one in the Goals tab!
        </Text>
      ) : (
        <View style={styles.goalsList}>
          {topGoals.map((goal) => {
            const percent = Math.min(
              100,
              Math.round(
                ((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100,
              ),
            );
            const isCompleted = percent >= 100;

            return (
              <View
                key={goal.id}
                style={[
                  styles.goalItem,
                  {
                    backgroundColor: theme.colors.surfaceSubtle,
                    borderColor: isCompleted ? "#FFD700" : theme.colors.border,
                    borderWidth: isCompleted ? 1.5 : 1,
                    borderRadius: Math.min(theme.borderRadius, 14),
                  },
                ]}
              >
                <View style={styles.goalInfoRow}>
                  <View style={styles.goalLeft}>
                    <Text style={styles.goalIcon}>
                      {isCompleted
                        ? "🎉"
                        : goal.icon === "musical-notes"
                          ? "🎸"
                          : "💻"}
                    </Text>
                    <View style={{ flex: 1, marginRight: 6 }}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[styles.goalTitle, { color: theme.colors.text }]}
                      >
                        {goal.title}
                      </Text>
                      <Text
                        style={[
                          styles.goalAmounts,
                          { color: theme.colors.textMuted },
                        ]}
                      >
                        {formatMoney(goal.currentAmount || 0)} /{" "}
                        {formatMoney(goal.targetAmount)}
                      </Text>
                    </View>
                  </View>

                  {!isCompleted && (
                    <TouchableOpacity
                      onPress={() => handleDeposit(goal.id)}
                      style={[
                        styles.quickAddBtn,
                        { backgroundColor: theme.colors.primaryLight },
                      ]}
                    >
                      <Text
                        style={[
                          styles.quickAddBtnText,
                          { color: theme.colors.primary },
                        ]}
                      >
                        +{isUSD ? "$10" : "50k"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Progress bar */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${percent}%`,
                        backgroundColor: isCompleted
                          ? "#FFD700"
                          : goal.color || theme.colors.accent,
                        borderRadius: 3,
                      },
                    ]}
                  />
                </View>

                <View style={styles.progressPercentRow}>
                  <Text
                    style={[
                      styles.percentText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {percent}% funded
                  </Text>
                  {isCompleted && (
                    <Text style={styles.completedBadge}>COMPLETED! ✨</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: "100%",
    padding: 14,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    flexShrink: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 12,
    fontStyle: "italic",
    paddingVertical: 10,
  },
  goalsList: {
    gap: 10,
  },
  goalItem: {
    padding: 10,
  },
  goalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  goalLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  goalIcon: {
    fontSize: 20,
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  goalAmounts: {
    fontSize: 11,
    marginTop: 2,
  },
  quickAddBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  quickAddBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
  },
  progressPercentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  percentText: {
    fontSize: 10,
    fontWeight: "600",
  },
  completedBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#D97706",
  },
});
