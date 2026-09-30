import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Text } from './AppText';
import { Badge } from './Badge';

interface HeaderProps {
  onOpenThemeModal: () => void;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
  onOpenCatalogue?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenThemeModal,
  isEditMode,
  onToggleEditMode,
  onOpenCatalogue,
}) => {
  const { theme, getFont } = useAppTheme();
  const { profile, predictiveInsights } = useData();

  if (isEditMode) {
    return (
      <View
        style={[
          styles.headerContainer,
          styles.retractedHeader,
          {
            borderBottomColor: theme.colors.border,
            borderBottomWidth: 1,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <View style={styles.editingRow}>
          <View style={styles.editingTitleGroup}>
            <View
              style={[
                styles.editingIconBadge,
                { backgroundColor: theme.colors.primaryLight },
              ]}
            >
              <Ionicons name="layers-outline" size={16} color={theme.colors.primary} />
            </View>
            <View>
              <Text
                style={[
                  styles.editingTitle,
                  { color: theme.colors.text, fontFamily: getFont('bold') },
                ]}
              >
                Editing Layout
              </Text>
              <Text style={[styles.editingSubtitle, { color: theme.colors.textMuted }]}>
                Drag grip • Resize • Hide
              </Text>
            </View>
          </View>

          <View style={styles.editingActions}>
            {onOpenCatalogue && (
              <TouchableOpacity
                onPress={onOpenCatalogue}
                activeOpacity={0.7}
                style={[
                  styles.catalogueBtn,
                  {
                    backgroundColor: theme.colors.surfaceSubtle,
                    borderColor: theme.colors.border,
                    borderWidth: theme.borderWidth > 0 ? 1 : 0,
                  },
                ]}
              >
                <Ionicons name="grid-outline" size={14} color={theme.colors.text} />
                <Text style={[styles.catalogueBtnText, { color: theme.colors.text }]}>
                  Catalogue
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onToggleEditMode}
              activeOpacity={0.7}
              style={[styles.doneBtn, { backgroundColor: theme.colors.primary }]}
            >
              <Ionicons name="checkmark-done" size={15} color="#FFFFFF" />
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

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
                fontFamily: getFont('bold'),
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
                  backgroundColor: theme.colors.surfaceSubtle,
                  borderColor: theme.colors.border,
                  borderWidth: theme.borderWidth > 0 ? 1 : 0,
                },
              ]}
            >
              <Ionicons
                name="grid-outline"
                size={18}
                color={theme.colors.text}
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
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.greeting, { color: theme.colors.textSecondary, flex: 1, marginRight: 8 }]}
        >
          Hi, <Text style={{ fontWeight: '700', color: theme.colors.text }}>{profile?.displayName || 'Student'}</Text>! 👋
        </Text>

        <Badge
          label={predictiveInsights.brokeStatus.title}
          icon={<Text style={{ fontSize: 12 }}>{predictiveInsights.brokeStatus.emoji}</Text>}
          color={predictiveInsights.brokeStatus.color}
          backgroundColor={theme.colors.surfaceSubtle}
          size="sm"
          style={{ flexShrink: 0, alignSelf: 'center' }}
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
    alignSelf: 'center',
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
  retractedHeader: {
    paddingVertical: 10,
    gap: 0,
  },
  editingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editingTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  editingIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editingTitle: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  editingSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
  },
  editingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catalogueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  catalogueBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
