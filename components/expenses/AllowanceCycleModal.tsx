import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
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
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { CurrencyCode } from '../../types/expense';
import { Text, TextInput } from '../common/AppText';
import { Button } from '../common/Button';

interface AllowanceCycleModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AllowanceCycleModal: React.FC<AllowanceCycleModalProps> = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <AllowanceCycleForm onClose={onClose} />
    </Modal>
  );
};

const AllowanceCycleForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { theme } = useAppTheme();
  const { cycle, updateCycle, profile, updateProfile } = useData();

  const [amountStr, setAmountStr] = useState(cycle ? cycle.amount.toString() : '');
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'biweekly'>(
    cycle?.period || 'monthly'
  );
  const [monthlyStartMode, setMonthlyStartMode] = useState<'today' | 'first_of_month'>('today');
  const [currency, setCurrency] = useState<CurrencyCode>(profile?.currencyCode || 'IDR');
  const [error, setError] = useState('');

  const previewDates = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;

    if (period === 'weekly') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else if (period === 'biweekly') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(start);
      end.setDate(start.getDate() + 13);
    } else {
      if (monthlyStartMode === 'first_of_month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(start);
        end.setMonth(start.getMonth() + 1);
        end.setDate(end.getDate() - 1);
      }
    }

    const fmt = (d: Date) =>
      d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.round((end.getTime() - start.getTime()) / msPerDay) + 1;

    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(
      start.getDate()
    ).padStart(2, '0')}`;
    const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(
      end.getDate()
    ).padStart(2, '0')}`;

    return {
      formatted: `${fmt(start)} – ${fmt(end)} (${days} days)`,
      startStr,
      endStr,
    };
  }, [period, monthlyStartMode]);

  const handleSave = async () => {
    const parsedAmount = parseFloat(amountStr.replace(/[^0-9.]/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid allowance amount!');
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore
    }

    await updateCycle({
      id: cycle?.id || `cycle-${Date.now()}`,
      amount: parsedAmount,
      period,
      startDate: previewDates.startStr,
      endDate: previewDates.endStr,
      isActive: true,
    });

    if (profile?.currencyCode !== currency) {
      await updateProfile({ currencyCode: currency });
    }

    setError('');
    onClose();
  };

  return (
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
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text
                numberOfLines={1}
                style={[
                  styles.title,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.fonts?.bold,
                  },
                ]}
              >
                Allowance / Pocket Money Setup 💰
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.subtitle, { color: theme.colors.textSecondary }]}
              >
                Define your student stipend cycle & safe spending runway
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
            {error ? (
              <View style={[styles.errorBox, { backgroundColor: '#FFEBE5' }]}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            {/* Currency Picker */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Preferred Currency
              </Text>
              <View style={styles.currencyRow}>
                <TouchableOpacity
                  onPress={() => setCurrency('IDR')}
                  style={[
                    styles.currChip,
                    currency === 'IDR' && {
                      backgroundColor: theme.colors.primary,
                      borderColor: theme.colors.primary,
                    },
                    { borderColor: theme.colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.currChipText,
                      { color: currency === 'IDR' ? '#FFF' : theme.colors.text },
                    ]}
                  >
                    🇮🇩 IDR (Rupiah Rp)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setCurrency('USD')}
                  style={[
                    styles.currChip,
                    currency === 'USD' && {
                      backgroundColor: theme.colors.primary,
                      borderColor: theme.colors.primary,
                    },
                    { borderColor: theme.colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.currChipText,
                      { color: currency === 'USD' ? '#FFF' : theme.colors.text },
                    ]}
                  >
                    🇺🇸 USD (Dollar $)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Allowance Amount */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Starting Allowance Amount
              </Text>
              <TextInput
                value={amountStr}
                onChangeText={(val) => {
                  setAmountStr(val);
                  setError('');
                }}
                keyboardType="numeric"
                placeholder={currency === 'USD' ? '400.00' : '2500000'}
                placeholderTextColor={theme.colors.textMuted}
                style={[
                  styles.amountInput,
                  {
                    color: theme.colors.primary,
                    backgroundColor: theme.colors.surfaceSubtle,
                    borderColor: theme.colors.border,
                    borderRadius: Math.min(theme.borderRadius, 14),
                    fontFamily: theme.fonts?.bold,
                  },
                ]}
              />
            </View>

            {/* Period selection */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Allowance Frequency / Cycle
              </Text>
              <View style={styles.periodRow}>
                {[
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'biweekly', label: 'Bi-Weekly' },
                  { id: 'weekly', label: 'Weekly' },
                ].map((p) => {
                  const isSelected = period === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => setPeriod(p.id as any)}
                      style={[
                        styles.periodChip,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.surfaceSubtle,
                          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                          borderRadius: Math.min(theme.borderRadius, 12),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.periodText,
                          {
                            color: isSelected ? '#FFFFFF' : theme.colors.text,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Monthly start mode selector */}
            {period === 'monthly' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  Cycle Start Date
                </Text>
                <View style={styles.periodRow}>
                  <TouchableOpacity
                    onPress={() => setMonthlyStartMode('today')}
                    style={[
                      styles.periodChip,
                      {
                        backgroundColor:
                          monthlyStartMode === 'today'
                            ? theme.colors.primary
                            : theme.colors.surfaceSubtle,
                        borderColor:
                          monthlyStartMode === 'today'
                            ? theme.colors.primary
                            : theme.colors.border,
                        borderRadius: Math.min(theme.borderRadius, 12),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        {
                          color: monthlyStartMode === 'today' ? '#FFFFFF' : theme.colors.text,
                          fontWeight: monthlyStartMode === 'today' ? '700' : '500',
                        },
                      ]}
                    >
                      From Today (30 Days)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setMonthlyStartMode('first_of_month')}
                    style={[
                      styles.periodChip,
                      {
                        backgroundColor:
                          monthlyStartMode === 'first_of_month'
                            ? theme.colors.primary
                            : theme.colors.surfaceSubtle,
                        borderColor:
                          monthlyStartMode === 'first_of_month'
                            ? theme.colors.primary
                            : theme.colors.border,
                        borderRadius: Math.min(theme.borderRadius, 12),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        {
                          color:
                            monthlyStartMode === 'first_of_month'
                              ? '#FFFFFF'
                              : theme.colors.text,
                          fontWeight: monthlyStartMode === 'first_of_month' ? '700' : '500',
                        },
                      ]}
                    >
                      Calendar Month
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Date Preview Box */}
            <View
              style={[
                styles.previewBox,
                {
                  backgroundColor: theme.colors.surfaceSubtle,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.previewLabel, { color: theme.colors.textMuted }]}>
                  Calculated Cycle Range
                </Text>
                <Text
                  style={[
                    styles.previewValue,
                    { color: theme.colors.text, fontFamily: theme.fonts?.semiBold },
                  ]}
                >
                  {previewDates.formatted}
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <Button title="Save Allowance Plan" onPress={handleSave} size="lg" />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    maxHeight: '88%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
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
    flexShrink: 0,
  },
  scroll: {
    maxHeight: 460,
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  currChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  currChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '800',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  periodChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  periodText: {
    fontSize: 12,
    textAlign: 'center',
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewValue: {
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    paddingVertical: 14,
    borderTopWidth: 1,
  },
});
