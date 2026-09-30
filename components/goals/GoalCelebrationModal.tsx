import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { SavingsGoal } from '../../types/expense';
import { Button } from '../common/Button';

interface GoalCelebrationModalProps {
  visible: boolean;
  goal: SavingsGoal | null;
  onClose: () => void;
  onShareProfile?: () => void;
  formatMoney: (amount: number) => string;
}

export const GoalCelebrationModal: React.FC<GoalCelebrationModalProps> = ({
  visible,
  goal,
  onClose,
  onShareProfile,
  formatMoney,
}) => {
  const { theme } = useAppTheme();

  useEffect(() => {
    if (visible && goal) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // ignore
      }
    }
  }, [visible, goal]);

  if (!goal) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.primary,
              borderRadius: Math.min(theme.borderRadius, 24),
              borderWidth: 2,
            },
          ]}
        >
          {/* Confetti / Ribbon Emoji Header */}
          <View style={styles.emojiRow}>
            <Text style={styles.floatingEmoji}>🎉</Text>
            <Text style={styles.trophyEmoji}>🏆</Text>
            <Text style={styles.floatingEmoji}>✨</Text>
          </View>

          <Text
            style={[
              styles.heading,
              {
                color: theme.colors.text,
                fontFamily: theme.fontStyle === 'mono' ? 'Courier' : undefined,
              },
            ]}
          >
            Goal Crushed!
          </Text>

          <View
            style={[
              styles.goalBadge,
              {
                backgroundColor: (goal.color || theme.colors.primary) + '22',
                borderColor: goal.color || theme.colors.primary,
                borderWidth: theme.borderWidth > 0 ? 1 : 0,
              },
            ]}
          >
            <Ionicons
              name={(goal.icon as any) || 'trophy'}
              size={20}
              color={goal.color || theme.colors.primary}
            />
            <Text style={[styles.goalBadgeTitle, { color: theme.colors.text }]}>
              {goal.title}
            </Text>
          </View>

          <Text style={[styles.amountText, { color: theme.colors.primary }]}>
            {formatMoney(goal.targetAmount)} Saved
          </Text>

          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
            Incredible financial discipline! You successfully funded 100% of this goal. Student budget mastery unlocked!
          </Text>

          <View style={styles.buttonGroup}>
            {onShareProfile && (
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onShareProfile();
                }}
                style={[
                  styles.shareBtn,
                  {
                    backgroundColor: theme.colors.primaryLight,
                    borderColor: theme.colors.primary,
                  },
                ]}
              >
                <Ionicons name="share-social-outline" size={16} color={theme.colors.primary} />
                <Text style={[styles.shareBtnText, { color: theme.colors.primary }]}>
                  Share to Profile Card
                </Text>
              </TouchableOpacity>
            )}

            <Button title="Claim & Celebrate 🎉" onPress={onClose} size="md" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    padding: 26,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  emojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  trophyEmoji: {
    fontSize: 54,
  },
  floatingEmoji: {
    fontSize: 32,
  },
  heading: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 12,
  },
  goalBadgeTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  amountText: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonGroup: {
    width: '100%',
    gap: 10,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
