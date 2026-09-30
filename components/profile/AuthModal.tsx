import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Text, TextInput } from '../common/AppText';
import { Button } from '../common/Button';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const { theme } = useAppTheme();
  const { isGuest, signIn, signUp, signOut, isSupabaseConfigured, user } = useAuth();
  const { syncWithSupabase, isSyncing } = useData();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setInfoMsg('');

    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }

    setLoading(true);
    if (mode === 'signup') {
      const res = await signUp(email, password, username || 'student');
      if (res.error) {
        setError(res.error.message);
      } else {
        setInfoMsg('Account created! Please check your email if confirmation is required.');
      }
    } else {
      const res = await signIn(email, password);
      if (res.error) {
        setError(res.error.message);
      } else {
        setInfoMsg('Signed in successfully!');
        onClose();
      }
    }
    setLoading(false);
  };

  const handleSync = async () => {
    setError('');
    setInfoMsg('');
    const res = await syncWithSupabase();
    if (res.success) {
      setInfoMsg(res.message);
    } else {
      setError(res.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.safeArea}>
          <View
            style={[
              styles.container,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius,
              },
            ]}
          >
            <View style={styles.header}>
              <View>
                <Text
                  style={[
                    styles.title,
                    {
                      color: theme.colors.text,
                      fontFamily: theme.fonts?.bold,
                    },
                  ]}
                >
                  Supabase Cloud Sync ⚡
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  Backup expenses, sync devices, and unlock public links
                </Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: theme.colors.surfaceSubtle }]}
              >
                <Ionicons name="close" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
              {/* Configuration Status Notice */}
              <View
                style={[
                  styles.statusCard,
                  {
                    backgroundColor: isSupabaseConfigured
                      ? theme.colors.primaryLight
                      : theme.colors.surfaceSubtle,
                    borderColor: isSupabaseConfigured
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={isSupabaseConfigured ? 'cloud-done-outline' : 'cloud-offline-outline'}
                  size={20}
                  color={isSupabaseConfigured ? theme.colors.primary : theme.colors.textMuted}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
                    {isSupabaseConfigured ? 'Supabase Connected' : 'Offline-First Mode'}
                  </Text>
                  <Text style={[styles.statusDesc, { color: theme.colors.textSecondary }]}>
                    {isSupabaseConfigured
                      ? 'Connected to your PostgreSQL database. Syncing enabled.'
                      : 'All data is safely saved in local offline storage on this device.'}
                  </Text>
                </View>
              </View>

              {error ? (
                <View style={[styles.errorBox, { backgroundColor: '#FFEBE5' }]}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              ) : null}

              {infoMsg ? (
                <View style={[styles.infoBox, { backgroundColor: '#E8F5E9' }]}>
                  <Text style={styles.infoText}>✓ {infoMsg}</Text>
                </View>
              ) : null}

              {!isGuest && user ? (
                <View style={styles.loggedInSection}>
                  <Text style={[styles.userText, { color: theme.colors.text }]}>
                    Signed in as: <Text style={{ fontWeight: '700' }}>{user.email}</Text>
                  </Text>
                  <View style={{ gap: 10, marginTop: 16 }}>
                    <Button
                      title={isSyncing ? 'Syncing...' : 'Sync Data Now 🔄'}
                      onPress={handleSync}
                      loading={isSyncing}
                      size="md"
                    />
                    <Button
                      title="Sign Out"
                      variant="outline"
                      onPress={signOut}
                      size="md"
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.form}>
                  {/* Mode Tabs */}
                  <View style={[styles.tabBar, { backgroundColor: theme.colors.surfaceSubtle }]}>
                    <TouchableOpacity
                      onPress={() => setMode('signin')}
                      style={[
                        styles.tab,
                        mode === 'signin' && {
                          backgroundColor: theme.colors.primary,
                          borderRadius: 10,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          { color: mode === 'signin' ? '#FFF' : theme.colors.textSecondary },
                        ]}
                      >
                        Sign In
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setMode('signup')}
                      style={[
                        styles.tab,
                        mode === 'signup' && {
                          backgroundColor: theme.colors.primary,
                          borderRadius: 10,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          { color: mode === 'signup' ? '#FFF' : theme.colors.textSecondary },
                        ]}
                      >
                        Sign Up
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {mode === 'signup' && (
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                        Student Handle / Username
                      </Text>
                      <TextInput
                        value={username}
                        onChangeText={setUsername}
                        placeholder="e.g. saku_student"
                        placeholderTextColor={theme.colors.textMuted}
                        style={[
                          styles.input,
                          {
                            color: theme.colors.text,
                            backgroundColor: theme.colors.surfaceSubtle,
                            borderColor: theme.colors.border,
                            borderRadius: Math.min(theme.borderRadius, 12),
                          },
                        ]}
                      />
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                      Email Address
                    </Text>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      placeholder="student@campus.edu"
                      placeholderTextColor={theme.colors.textMuted}
                      style={[
                        styles.input,
                        {
                          color: theme.colors.text,
                          backgroundColor: theme.colors.surfaceSubtle,
                          borderColor: theme.colors.border,
                          borderRadius: Math.min(theme.borderRadius, 12),
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                      Password
                    </Text>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      placeholder="••••••••"
                      placeholderTextColor={theme.colors.textMuted}
                      style={[
                        styles.input,
                        {
                          color: theme.colors.text,
                          backgroundColor: theme.colors.surfaceSubtle,
                          borderColor: theme.colors.border,
                          borderRadius: Math.min(theme.borderRadius, 12),
                        },
                      ]}
                    />
                  </View>

                  <Button
                    title={
                      loading
                        ? 'Connecting...'
                        : mode === 'signin'
                        ? 'Sign In to Supabase'
                        : 'Create Student Account'
                    }
                    onPress={handleSubmit}
                    loading={loading}
                    size="lg"
                    style={{ marginTop: 10 }}
                  />
                </View>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    maxHeight: 480,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  errorBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#D90429',
    fontSize: 12,
    fontWeight: '700',
  },
  infoBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '700',
  },
  loggedInSection: {
    paddingVertical: 10,
  },
  userText: {
    fontSize: 14,
  },
  form: {
    gap: 12,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputGroup: {},
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
});
