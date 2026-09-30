import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Badge } from './Badge';

interface HeaderProps {
  onOpenThemeModal: () => void;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenThemeModal,
  isEditMode,
  onToggleEditMode,
}) => {
  const { theme } = useAppTheme();
  const { profile, predictiveInsights } = useData();

  return (
    <View
      style={[
        styles.headerContainer,
        {
          borderBottomColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      {/* Top Row: Brand, Streak, & Action Buttons */}
      <View style={styles.topRow}>
        <View style={styles.brandGroup}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: theme.colors.primaryLight,
                borderColor: theme.colors.primary,
                borderWidth: theme.borderWidth > 0 ? 1.5 : 0,
              },
            ]}
          >
            <Text style={styles.avatarText}>🎒</Text>
          </View>
          <Text
            style={[
              styles.appName,
              {
                color: theme.colors.text,
                fontFamily: theme.fontStyle === 'mono' ? 'Courier' : undefined,
              },
            ]}
          >
            SakuTrack
          </Text>

          {/* Streak Badge */}
          <Badge
            label={`${profile?.currentStreak || 0}d`}
            icon={<Text style={{ fontSize: 12 }}>🔥</Text>}
            color="#FF5722"
            backgroundColor={theme.isDark ? '#3D2214' : '#FFEBE5'}
            size="sm"
            style={styles.streakBadge}
          />
        </View>

        <View style={styles.actionsGroup}>
          {/* Edit Dashboard button */}
          {onToggleEditMode ? (
            <TouchableOpacity
              onPress={onToggleEditMode}
              activeOpacity={0.7}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: isEditMode ? theme.colors.primary : theme.colors.surfaceSubtle,
                  borderColor: theme.colors.border,
                  borderWidth: theme.borderWidth > 0 ? 1 : 0,
                },
              ]}
            >
              <Ionicons
                name={isEditMode ? 'checkmark' : 'grid-outline'}
                size={18}
                color={isEditMode ? '#FFFFFF' : theme.colors.text}
              />
            </TouchableOpacity>
          ) : null}

          {/* Theme Switcher Button */}
          <TouchableOpacity
            onPress={onOpenThemeModal}
            activeOpacity={0.7}
            style={[
              styles.iconBtn,
              {
                backgroundColor: theme.colors.surfaceSubtle,
                borderColor: theme.colors.border,
                borderWidth: theme.borderWidth > 0 ? 1 : 0,
              },
            ]}
          >
            <Ionicons name="color-palette-outline" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub Row: Greeting & Broke-Meter Status */}
      <View style={styles.subRow}>
        <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
          Hi, <Text style={{ fontWeight: '700', color: theme.colors.text }}>{profile?.displayName || 'Student'}</Text>! 👋
        </Text>

        <Badge
          label={predictiveInsights.brokeStatus.title}
          icon={<Text style={{ fontSize: 12 }}>{predictiveInsights.brokeStatus.emoji}</Text>}
          color={predictiveInsights.brokeStatus.color}
          backgroundColor={theme.colors.surfaceSubtle}
          size="sm"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
  },
  appName: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  streakBadge: {
    marginLeft: 2,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  greeting: {
    fontSize: 13,
  },
});
