import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { CurrencyCode } from '../../types/expense';
import { Button } from '../common/Button';

interface AllowanceCycleModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AllowanceCycleModal: React.FC<AllowanceCycleModalProps> = ({ visible, onClose }) => {
  const { theme } = useAppTheme();
  const { cycle, updateCycle, profile, updateProfile } = useData();

  const [amountStr, setAmountStr] = useState(cycle ? cycle.amount.toString() : '2500000');
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'biweekly'>(cycle?.period || 'monthly');
  const [currency, setCurrency] = useState<CurrencyCode>(profile?.currencyCode || 'IDR');
  const [error, setError] = useState('');

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

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (period === 'weekly') {
      end.setDate(start.getDate() + 7);
    } else if (period === 'biweekly') {
      end.setDate(start.getDate() + 14);
    }

    await updateCycle({
      id: cycle?.id || `cycle-${Date.now()}`,
      amount: parsedAmount,
      period,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      isActive: true,
    });

    if (profile?.currencyCode !== currency) {
      await updateProfile({ currencyCode: currency });
    }

    setError('');
    onClose();
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
                      fontFamily: theme.fontStyle === 'mono' ? 'Courier' : undefined,
                    },
                  ]}
                >
                  Allowance / Pocket Money Setup 💰
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
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
                      fontFamily: theme.fontStyle === 'mono' ? 'Courier' : undefined,
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
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
              <Button title="Save Allowance Plan" onPress={handleSave} size="lg" />
            </View>
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
    maxHeight: '85%',
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
  },
  scroll: {
    maxHeight: 440,
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
    alignItems: 'center',
    borderWidth: 1,
  },
  periodText: {
    fontSize: 13,
  },
  footer: {
    paddingVertical: 14,
    borderTopWidth: 1,
  },
});
