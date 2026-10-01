import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useData } from "../../context/DataContext";
import { useAppTheme } from "../../context/ThemeContext";
import { Text } from "../common/AppText";
import { Badge } from "../common/Badge";
import { Card } from "../common/Card";

interface RunwayWidgetProps {
  onOpenCycleModal?: () => void;
}

export const RunwayWidget: React.FC<RunwayWidgetProps> = ({
  onOpenCycleModal,
}) => {
  const { theme } = useAppTheme();
  const { cycle, predictiveInsights, formatMoney } = useData();

  const {
    remainingAllowance,
    projectedRunwayDays,
    daysRemainingInCycle,
    brokeStatus,
    isBurnoutEarly,
  } = predictiveInsights;

  if (!cycle) {
    return (
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.titleWrap}>
            <Ionicons
              name="speedometer-outline"
              size={16}
              color={theme.colors.accent}
            />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.title, { color: theme.colors.textSecondary }]}
            >
              ALLOWANCE RUNWAY
            </Text>
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons
            name="wallet-outline"
            size={32}
            color={theme.colors.accent}
          />
          <Text
            style={[
              styles.emptyTitle,
              { color: theme.colors.text, fontFamily: theme.fonts?.bold },
            ]}
          >
            No Allowance Budget Set
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Set your weekly or monthly pocket money to activate the broke-meter
            and daily safe-to-spend forecast.
          </Text>

          {onOpenCycleModal && (
            <TouchableOpacity
              onPress={onOpenCycleModal}
              style={[
                styles.setupBtn,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Ionicons name="add-circle-outline" size={16} color="#FFF" />
              <Text style={styles.setupBtnText}>Set Allowance Plan</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  }

  const totalCycleAmount = cycle?.amount || 1;
  const percentRemaining = Math.max(
    0,
    Math.min(100, (remainingAllowance / totalCycleAmount) * 100),
  );

  return (
    <Card style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Ionicons
            name="speedometer-outline"
            size={16}
            color={theme.colors.accent}
          />
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.title, { color: theme.colors.textSecondary }]}
          >
            ALLOWANCE RUNWAY
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Badge
            label={brokeStatus.title}
            icon={<Text style={{ fontSize: 13 }}>{brokeStatus.emoji}</Text>}
            color={brokeStatus.color}
            backgroundColor={theme.colors.surfaceSubtle}
            size="sm"
            style={{ flexShrink: 0 }}
          />

          {onOpenCycleModal && (
            <TouchableOpacity
              onPress={onOpenCycleModal}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[
                styles.editIconBtn,
                { backgroundColor: theme.colors.surfaceSubtle },
              ]}
            >
              <Ionicons
                name="pencil"
                size={12}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Numbers Row */}
      <View style={styles.numbersRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>
            Allowance Left
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              styles.remainingAmount,
              {
                color: theme.colors.text,
                fontFamily: theme.fonts?.bold,
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
                  color: isBurnoutEarly
                    ? theme.colors.danger
                    : theme.colors.success,
                  fontFamily: theme.fonts?.bold,
                },
              ]}
            >
              {projectedRunwayDays} {projectedRunwayDays === 1 ? "day" : "days"}{" "}
              left
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
          <Text
            style={[styles.progressNote, { color: theme.colors.textMuted }]}
          >
            {percentRemaining.toFixed(0)}% of saku available
          </Text>
          <Text
            style={[styles.progressNote, { color: theme.colors.textMuted }]}
          >
            {daysRemainingInCycle} {daysRemainingInCycle === 1 ? "day" : "days"}{" "}
            left in cycle
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
    flex: 1,
    height: "100%",
    padding: 14,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    flexShrink: 1,
  },
  title: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  editIconBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 14,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  setupBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginTop: 4,
  },
  setupBtnText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  numbersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
    gap: 8,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  remainingAmount: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 2,
  },
  rightStat: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
  runwayTag: {
    marginTop: 2,
  },
  runwayDays: {
    fontSize: 16,
    fontWeight: "700",
  },
  progressWrap: {
    marginBottom: 10,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
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
