import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput } from '../../components/common/AppText';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { AuthModal } from '../../components/profile/AuthModal';
import { ShareProfileModal } from '../../components/profile/ShareProfileModal';
import { ThemeCustomizerModal } from '../../components/theme/ThemeCustomizerModal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
  const { theme } = useAppTheme();
  const { profile, updateProfile, predictiveInsights } = useData();
  const { user, isGuest } = useAuth();

  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [campus, setCampus] = useState(profile.campus || '');
  const [bio, setBio] = useState(profile.bio);

  const handleSaveProfile = async () => {
    await updateProfile({
      displayName: name.trim() || 'Student Track',
      username: username.trim().toLowerCase() || 'student',
      campus: campus.trim() || undefined,
      bio: bio.trim(),
    });
    setIsEditing(false);
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={styles.topHeader}>
        <Text
          style={[
            styles.screenTitle,
            {
              color: theme.colors.text,
              fontFamily: theme.fonts?.bold,
            },
          ]}
        >
          Student Profile 🎒
        </Text>

        <TouchableOpacity
          onPress={() => setShareModalVisible(true)}
          style={[styles.shareHeaderBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons name="share-social-outline" size={16} color="#FFF" />
          <Text style={styles.shareHeaderBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profile Info Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View
              style={[
                styles.avatarLarge,
                {
                  backgroundColor: theme.colors.primaryLight,
                  borderColor: theme.colors.primary,
                  borderWidth: theme.borderWidth > 0 ? 2 : 0,
                },
              ]}
            >
              <Text style={styles.avatarEmoji}>🎓</Text>
            </View>

            <View style={styles.nameHeaderWrap}>
              <Text style={[styles.profileName, { color: theme.colors.text }]}>
                {profile.displayName}
              </Text>
              <Text style={[styles.profileHandle, { color: theme.colors.accent }]}>
                @{profile.username}
              </Text>
              {profile.campus && (
                <Text style={[styles.campusText, { color: theme.colors.textMuted }]}>
                  🏫 {profile.campus}
                </Text>
              )}
            </View>
          </View>

          {/* Bio */}
          <Text style={[styles.bioText, { color: theme.colors.textSecondary }]}>
            {profile.bio}
          </Text>

          {/* Quick Badges Row */}
          <View style={styles.badgesRow}>
            <Badge
              label={`${profile.currentStreak || 0}d streak`}
              icon={<Text style={{ fontSize: 13 }}>🔥</Text>}
              color="#FF5722"
              backgroundColor={theme.isDark ? '#3D2214' : '#FFEBE5'}
              size="sm"
            />
            <Badge
              label={predictiveInsights.brokeStatus.title}
              icon={<Text style={{ fontSize: 13 }}>{predictiveInsights.brokeStatus.emoji}</Text>}
              color={predictiveInsights.brokeStatus.color}
              backgroundColor={theme.colors.surfaceSubtle}
              size="sm"
            />
          </View>

          {/* Edit Profile Toggle Button */}
          <Button
            title={isEditing ? 'Cancel Editing' : 'Edit Student Details'}
            variant="outline"
            size="sm"
            onPress={() => setIsEditing(!isEditing)}
            style={{ marginTop: 14 }}
          />

          {/* Inline Edit Form */}
          {isEditing && (
            <View style={[styles.editForm, { borderTopColor: theme.colors.border }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textMuted }]}>Display Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.colors.surfaceSubtle,
                      borderColor: theme.colors.border,
                      borderRadius: Math.min(theme.borderRadius, 10),
                    },
                  ]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textMuted }]}>Handle (@username)</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.colors.surfaceSubtle,
                      borderColor: theme.colors.border,
                      borderRadius: Math.min(theme.borderRadius, 10),
                    },
                  ]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textMuted }]}>Campus / School</Text>
                <TextInput
                  value={campus}
                  onChangeText={setCampus}
                  placeholder="e.g. Stanford / UI / ITB"
                  placeholderTextColor={theme.colors.textMuted}
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.colors.surfaceSubtle,
                      borderColor: theme.colors.border,
                      borderRadius: Math.min(theme.borderRadius, 10),
                    },
                  ]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textMuted }]}>Bio</Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.colors.surfaceSubtle,
                      borderColor: theme.colors.border,
                      borderRadius: Math.min(theme.borderRadius, 10),
                      minHeight: 50,
                    },
                  ]}
                />
              </View>

              <Button title="Save Profile Info" onPress={handleSaveProfile} size="sm" />
            </View>
          )}
        </Card>

        {/* Feature Hub Buttons */}
        <View style={styles.hubGrid}>
          {/* Share Profile Action */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShareModalVisible(true)}
            style={[
              styles.hubCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: theme.borderRadius,
              },
            ]}
          >
            <View style={[styles.hubIcon, { backgroundColor: '#FFEBE5' }]}>
              <Ionicons name="sparkles" size={22} color="#FF5722" />
            </View>
            <View style={styles.hubText}>
              <Text style={[styles.hubTitle, { color: theme.colors.text }]}>Shareable Profile & Stories</Text>
              <Text style={[styles.hubSub, { color: theme.colors.textSecondary }]}>
                Export aesthetic cards to Instagram & get public links
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          {/* Theme Studio Action */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setThemeModalVisible(true)}
            style={[
              styles.hubCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: theme.borderRadius,
              },
            ]}
          >
            <View style={[styles.hubIcon, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name="color-palette" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.hubText}>
              <Text style={[styles.hubTitle, { color: theme.colors.text }]}>Theme Studio & DIY Customizer</Text>
              <Text style={[styles.hubSub, { color: theme.colors.textSecondary }]}>
                Active theme: {theme.name} ({theme.borderStyle} borders)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          {/* Supabase Sync Action */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAuthModalVisible(true)}
            style={[
              styles.hubCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: theme.borderRadius,
              },
            ]}
          >
            <View style={[styles.hubIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="cloud" size={22} color="#2E7D32" />
            </View>
            <View style={styles.hubText}>
              <Text style={[styles.hubTitle, { color: theme.colors.text }]}>Supabase Cloud & Auth</Text>
              <Text style={[styles.hubSub, { color: theme.colors.textSecondary }]}>
                {isGuest ? 'Local mode (1-tap Supabase account link)' : `Connected as ${user?.email}`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Currency & Privacy Settings */}
        <Card style={styles.settingsCard}>
          <Text style={[styles.settingsHeader, { color: theme.colors.textSecondary }]}>
            APP PREFERENCES
          </Text>

          {/* Currency Toggle */}
          <View style={[styles.settingRow, { borderBottomColor: theme.colors.border }]}>
            <View>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Currency</Text>
              <Text style={[styles.settingDesc, { color: theme.colors.textMuted }]}>
                Current: {profile.currencyCode === 'USD' ? 'USD ($)' : 'IDR (Rp)'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                updateProfile({
                  currencyCode: profile.currencyCode === 'IDR' ? 'USD' : 'IDR',
                })
              }
              style={[styles.currencyPill, { backgroundColor: theme.colors.primaryLight }]}
            >
              <Text style={[styles.currencyPillText, { color: theme.colors.primary }]}>
                Switch to {profile.currencyCode === 'IDR' ? 'USD ($)' : 'IDR (Rp)'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Public Profile Toggle */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Public Profile</Text>
              <Text style={[styles.settingDesc, { color: theme.colors.textMuted }]}>
                Allow friends to see your goals and streaks via web link
              </Text>
            </View>

            <Switch
              value={profile.isPublic}
              onValueChange={(val) => updateProfile({ isPublic: val })}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>
        </Card>
      </ScrollView>

      {/* Share Modal */}
      <ShareProfileModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
      />

      {/* Theme Studio Modal */}
      <ThemeCustomizerModal
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
      />

      {/* Supabase Cloud Auth Modal */}
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
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
  shareHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  shareHeaderBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  profileCard: {
    marginTop: 10,
    marginBottom: 16,
    padding: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 30,
  },
  nameHeaderWrap: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
  },
  profileHandle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  campusText: {
    fontSize: 11,
    marginTop: 2,
  },
  bioText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  editForm: {
    borderTopWidth: 0.5,
    marginTop: 14,
    paddingTop: 12,
    gap: 10,
  },
  inputGroup: {},
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
  },
  hubGrid: {
    gap: 10,
    marginBottom: 16,
  },
  hubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  hubIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hubText: {
    flex: 1,
  },
  hubTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  hubSub: {
    fontSize: 11,
    marginTop: 2,
  },
  settingsCard: {
    padding: 16,
  },
  settingsHeader: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  currencyPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  currencyPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
