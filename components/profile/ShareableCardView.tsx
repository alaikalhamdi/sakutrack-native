import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Badge } from '../common/Badge';

export const ShareableCardView: React.FC = () => {
  const { theme } = useAppTheme();
  const { profile, goals, predictiveInsights, formatMoney } = useData();

  const publicGoals = goals.filter((g) => g.isPublic).slice(0, 2);

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.primary,
          borderWidth: 2,
          borderRadius: Math.min(theme.borderRadius, 24),
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 6,
        },
      ]}
    >
      {/* Brand Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <Text style={styles.brandEmoji}>🎒</Text>
          <Text
            style={[
              styles.brandTitle,
              {
                color: theme.colors.primary,
                fontFamily: theme.fontStyle === 'mono' ? 'Courier' : undefined,
              },
            ]}
          >
            SakuTrack
          </Text>
        </View>

        <Badge
          label={`${profile.currentStreak || 0}d streak 🔥`}
          color="#FF5722"
          backgroundColor={theme.isDark ? '#3D2214' : '#FFEBE5'}
          size="sm"
        />
      </View>

      {/* Student Profile Info */}
      <View style={styles.studentInfo}>
        <View
          style={[
            styles.avatarCircle,
            { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
          ]}
        >
          <Text style={styles.avatarEmoji}>🎓</Text>
        </View>

        <View style={styles.nameWrap}>
          <Text style={[styles.displayName, { color: theme.colors.text }]}>
            {profile.displayName || 'Student Track'}
          </Text>
          <Text style={[styles.username, { color: theme.colors.accent }]}>
            @{profile.username || 'student'}
          </Text>
          {profile.campus && (
            <Text style={[styles.campusText, { color: theme.colors.textMuted }]}>
              🏫 {profile.campus}
            </Text>
          )}
        </View>
      </View>

      {/* Broke Status Banner */}
      <View
        style={[
          styles.statusBox,
          {
            backgroundColor: theme.colors.surfaceSubtle,
            borderColor: predictiveInsights.brokeStatus.color,
            borderLeftWidth: 4,
          },
        ]}
      >
        <View style={styles.statusTop}>
          <Text style={styles.statusEmoji}>{predictiveInsights.brokeStatus.emoji}</Text>
          <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
            Status: {predictiveInsights.brokeStatus.title}
          </Text>
        </View>
        <Text style={[styles.statusDesc, { color: theme.colors.textSecondary }]}>
          {predictiveInsights.brokeStatus.description}
        </Text>
      </View>

      {/* Public Savings Goals */}
      {publicGoals.length > 0 && (
        <View style={styles.goalsWrap}>
          <Text style={[styles.goalsSectionTitle, { color: theme.colors.textSecondary }]}>
            CURRENT SAVINGS TARGETS 🎯
          </Text>
          {publicGoals.map((g) => {
            const percent = Math.min(
              100,
              Math.round(((g.currentAmount || 0) / (g.targetAmount || 1)) * 100)
            );
            return (
              <View key={g.id} style={styles.goalRow}>
                <View style={styles.goalTitleRow}>
                  <Text style={[styles.goalName, { color: theme.colors.text }]}>
                    {g.icon === 'musical-notes' ? '🎸 ' : '🎯 '}
                    {g.title}
                  </Text>
                  <Text style={[styles.goalAmountText, { color: theme.colors.textSecondary }]}>
                    {formatMoney(g.currentAmount || 0)} ({percent}%)
                  </Text>
                </View>
                <View
                  style={[
                    styles.goalTrack,
                    { backgroundColor: theme.colors.surfaceSubtle },
                  ]}
                >
                  <View
                    style={[
                      styles.goalFill,
                      {
                        width: `${percent}%`,
                        backgroundColor: g.color || theme.colors.accent,
                        borderRadius: 3,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Card Footer */}
      <View style={[styles.cardFooter, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
          sakutrack.app/p/{profile.username}
        </Text>
        <Text style={[styles.footerVibe, { color: theme.colors.accent }]}>
          Student Pocket Money Tracker
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: 20,
    width: '100%',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandEmoji: {
    fontSize: 22,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  avatarEmoji: {
    fontSize: 26,
  },
  nameWrap: {
    flex: 1,
  },
  displayName: {
    fontSize: 18,
    fontWeight: '800',
  },
  username: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  campusText: {
    fontSize: 11,
    marginTop: 2,
  },
  statusBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  statusTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusEmoji: {
    fontSize: 16,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  goalsWrap: {
    marginBottom: 16,
  },
  goalsSectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  goalRow: {
    marginBottom: 10,
  },
  goalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  goalName: {
    fontSize: 12,
    fontWeight: '700',
  },
  goalAmountText: {
    fontSize: 11,
  },
  goalTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footerVibe: {
    fontSize: 10,
    fontWeight: '700',
  },
});
