import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/common/AppText';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { isSupabaseConfigured, supabase } from '../../services/supabase';

interface PublicProfileData {
  displayName: string;
  username: string;
  campus?: string;
  bio?: string;
  currentStreak: number;
  brokeStatus: {
    title: string;
    emoji: string;
    description: string;
    color: string;
  };
  goals: {
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    icon?: string;
    color?: string;
  }[];
}

export default function PublicProfileScreen() {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const { theme } = useAppTheme();
  const { profile: localProfile, goals: localGoals, predictiveInsights, formatMoney } = useData();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const targetUser = username?.toLowerCase() || 'student';

      // Check if viewing own profile locally
      if (localProfile.username?.toLowerCase() === targetUser) {
        const publicGoals = localGoals.filter((g) => g.isPublic);
        setData({
          displayName: localProfile.displayName,
          username: localProfile.username,
          campus: localProfile.campus,
          bio: localProfile.bio,
          currentStreak: localProfile.currentStreak || 0,
          brokeStatus: {
            title: predictiveInsights.brokeStatus.title,
            emoji: predictiveInsights.brokeStatus.emoji,
            description: predictiveInsights.brokeStatus.description,
            color: predictiveInsights.brokeStatus.color,
          },
          goals: publicGoals.map((g) => ({
            id: g.id,
            title: g.title,
            targetAmount: g.targetAmount,
            currentAmount: g.currentAmount || 0,
            icon: g.icon,
            color: g.color,
          })),
        });
        setLoading(false);
        return;
      }

      // If Supabase configured, attempt to query public profile from database
      if (isSupabaseConfigured) {
        try {
          const { data: dbProfile, error: pError } = await supabase
            .from('profiles')
            .select('id, display_name, username, bio, campus, current_streak, is_public')
            .eq('username', targetUser)
            .single();

          if (!pError && dbProfile) {
            const { data: dbGoals } = await supabase
              .from('savings_goals')
              .select('id, title, target_amount, current_amount, icon, color')
              .eq('user_id', dbProfile.id)
              .eq('is_public', true);

            setData({
              displayName: dbProfile.display_name || targetUser,
              username: dbProfile.username,
              campus: dbProfile.campus || undefined,
              bio: dbProfile.bio || undefined,
              currentStreak: dbProfile.current_streak || 0,
              brokeStatus: {
                title: 'Active Tracker',
                emoji: '⚡',
                description: 'Managing student funds diligently with SakuTrack.',
                color: theme.colors.primary,
              },
              goals: (dbGoals || []).map((g) => ({
                id: g.id,
                title: g.title,
                targetAmount: Number(g.target_amount),
                currentAmount: Number(g.current_amount),
                icon: g.icon || undefined,
                color: g.color || undefined,
              })),
            });
            setLoading(false);
            return;
          }
        } catch {
          // fallback to display mock student
        }
      }

      // Fallback preview
      setData({
        displayName: `${targetUser} on Campus`,
        username: targetUser,
        campus: 'Student Community',
        bio: 'Tracking daily saku and student budgets with SakuTrack.',
        currentStreak: 5,
        brokeStatus: {
          title: 'Cruising Along',
          emoji: '🚀',
          description: 'Healthy rhythm. Balancing meals, study snacks and saving up!',
          color: '#10B981',
        },
        goals: [
          {
            id: 'sample-goal-1',
            title: 'Campus Tech Fund',
            targetAmount: 2000000,
            currentAmount: 1400000,
            icon: 'hardware-chip',
            color: '#4EA8DE',
          },
        ],
      });
      setLoading(false);
    }

    fetchProfile();
  }, [username, localProfile, localGoals, predictiveInsights, theme.colors.primary]);

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(
        Platform.OS === 'web' && typeof window !== 'undefined'
          ? window.location.href
          : `https://sakutrack.app/p/${username || 'student'}`
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      {/* Top Navbar */}
      <View
        style={[
          styles.navBar,
          { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.brandRow}>
          <Text style={styles.brandEmoji}>🎒</Text>
          <Text style={[styles.navTitle, { color: theme.colors.text }]}>SakuTrack Profile</Text>
        </View>

        <TouchableOpacity onPress={handleCopyLink} style={styles.shareBtn}>
          <Ionicons
            name={copied ? 'checkmark-circle' : 'share-outline'}
            size={20}
            color={copied ? '#10B981' : theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading student profile...
          </Text>
        </View>
      ) : !data ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Student Not Found</Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textMuted }]}>
            We could not locate @{username}. Check the link and try again!
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.cardContainer}>
            {/* Main Profile Showcase Card */}
            <Card style={styles.mainCard}>
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: theme.colors.primaryLight,
                      borderColor: theme.colors.primary,
                      borderWidth: theme.borderWidth > 0 ? 2 : 0,
                    },
                  ]}
                >
                  <Text style={styles.avatarEmoji}>🎓</Text>
                </View>

                <View style={styles.userHead}>
                  <Text style={[styles.displayName, { color: theme.colors.text }]}>
                    {data.displayName}
                  </Text>
                  <Text style={[styles.handle, { color: theme.colors.accent }]}>
                    @{data.username}
                  </Text>
                  {data.campus && (
                    <Text style={[styles.campusText, { color: theme.colors.textMuted }]}>
                      🏫 {data.campus}
                    </Text>
                  )}
                </View>

                <Badge
                  label={`${data.currentStreak}d 🔥`}
                  color="#FF5722"
                  backgroundColor={theme.isDark ? '#3D2214' : '#FFEBE5'}
                  size="sm"
                />
              </View>

              {data.bio ? (
                <Text style={[styles.bioText, { color: theme.colors.textSecondary }]}>
                  {data.bio}
                </Text>
              ) : null}

              {/* Broke Status Banner */}
              <View
                style={[
                  styles.statusCard,
                  {
                    backgroundColor: theme.colors.surfaceSubtle,
                    borderColor: data.brokeStatus.color,
                    borderLeftWidth: 4,
                  },
                ]}
              >
                <View style={styles.statusRow}>
                  <Text style={styles.statusEmoji}>{data.brokeStatus.emoji}</Text>
                  <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
                    Status: {data.brokeStatus.title}
                  </Text>
                </View>
                <Text style={[styles.statusDesc, { color: theme.colors.textSecondary }]}>
                  {data.brokeStatus.description}
                </Text>
              </View>

              {/* Public Savings Goals */}
              <View style={styles.goalsSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                  ACTIVE SAVINGS TARGETS 🎯
                </Text>

                {data.goals.length === 0 ? (
                  <Text style={[styles.noGoalsText, { color: theme.colors.textMuted }]}>
                    No public savings goals listed yet.
                  </Text>
                ) : (
                  data.goals.map((g) => {
                    const percent = Math.min(
                      100,
                      Math.round(((g.currentAmount || 0) / (g.targetAmount || 1)) * 100)
                    );
                    const isCompleted = percent >= 100;

                    return (
                      <View
                        key={g.id}
                        style={[
                          styles.goalItem,
                          {
                            backgroundColor: theme.colors.surfaceSubtle,
                            borderColor: theme.colors.border,
                            borderWidth: theme.borderWidth > 0 ? 1 : 0,
                          },
                        ]}
                      >
                        <View style={styles.goalInfoRow}>
                          <Text style={[styles.goalTitle, { color: theme.colors.text }]}>
                            {g.title}
                          </Text>
                          <Text
                            style={[
                              styles.goalAmount,
                              { color: isCompleted ? '#D97706' : theme.colors.primary },
                            ]}
                          >
                            {formatMoney(g.currentAmount)} ({percent}%)
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.track,
                            { backgroundColor: theme.colors.border },
                          ]}
                        >
                          <View
                            style={[
                              styles.fill,
                              {
                                width: `${percent}%`,
                                backgroundColor: isCompleted
                                  ? '#FFD700'
                                  : g.color || theme.colors.primary,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })
                )}
              </View>

              {/* Footer CTA */}
              <View style={[styles.cardFooter, { borderTopColor: theme.colors.border }]}>
                <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
                  Track your student expenses & allowance on SakuTrack
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace('/(tabs)')}
                  style={[styles.openAppBtn, { backgroundColor: theme.colors.primary }]}
                >
                  <Text style={styles.openAppBtnText}>Open SakuTrack App</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandEmoji: {
    fontSize: 18,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  shareBtn: {
    padding: 6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 520,
  },
  mainCard: {
    padding: 20,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  userHead: {
    flex: 1,
  },
  displayName: {
    fontSize: 18,
    fontWeight: '800',
  },
  handle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  campusText: {
    fontSize: 12,
    marginTop: 2,
  },
  bioText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  statusCard: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 18,
  },
  statusRow: {
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
    lineHeight: 16,
  },
  goalsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  noGoalsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  goalItem: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  goalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  goalAmount: {
    fontSize: 12,
    fontWeight: '700',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  cardFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
  openAppBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  openAppBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
