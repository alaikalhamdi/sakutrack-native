import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Text, TextInput } from '../common/AppText';
import { Button } from '../common/Button';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ visible, onClose }) => {
  const { theme } = useAppTheme();
  const { categories, addExpense, currencyCode } = useData();

  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || 'food_drinks');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const isUSD = currencyCode === 'USD';

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please give this expense a title!');
      return;
    }
    const parsedAmount = parseFloat(amountStr.replace(/[^0-9.]/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount!');
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore
    }

    await addExpense({
      categoryId: selectedCatId,
      title: title.trim(),
      amount: parsedAmount,
      spentAt: new Date().toISOString(),
      note: note.trim() || undefined,
    });

    setTitle('');
    setAmountStr('');
    setNote('');
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
                      fontFamily: theme.fonts?.bold,
                    },
                  ]}
                >
                  Log Student Expense 💸
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  Keep your daily allowance runway accurate
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

              {/* Amount Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  Amount ({isUSD ? '$' : 'Rp'})
                </Text>
                <TextInput
                  value={amountStr}
                  onChangeText={(val) => {
                    setAmountStr(val);
                    setError('');
                  }}
                  keyboardType="numeric"
                  placeholder={isUSD ? '12.50' : '35000'}
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

              {/* Title Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  Title / What did you buy?
                </Text>
                <TextInput
                  value={title}
                  onChangeText={(val) => {
                    setTitle(val);
                    setError('');
                  }}
                  placeholder="e.g. Campus Lunch, Lecture Notes, Train Ticket"
                  placeholderTextColor={theme.colors.textMuted}
                  style={[
                    styles.textInput,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.colors.surfaceSubtle,
                      borderColor: theme.colors.border,
                      borderRadius: Math.min(theme.borderRadius, 14),
                    },
                  ]}
                />
              </View>

              {/* Category Picker */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  Category
                </Text>
                <View style={styles.catGrid}>
                  {categories.map((cat) => {
                    const isSelected = selectedCatId === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setSelectedCatId(cat.id)}
                        style={[
                          styles.catChip,
                          {
                            backgroundColor: isSelected
                              ? theme.colors.primaryLight
                              : theme.colors.surfaceSubtle,
                            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                            borderWidth: isSelected ? 1.5 : 1,
                            borderRadius: Math.min(theme.borderRadius, 12),
                          },
                        ]}
                      >
                        <Ionicons
                          name={(cat.icon as any) || 'pricetag'}
                          size={14}
                          color={isSelected ? theme.colors.primary : cat.color}
                        />
                        <Text
                          style={[
                            styles.catChipText,
                            {
                              color: isSelected ? theme.colors.primary : theme.colors.text,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>


              {/* Note (optional) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  Note (optional)
                </Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Split with study group..."
                  placeholderTextColor={theme.colors.textMuted}
                  style={[
                    styles.textInput,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.colors.surfaceSubtle,
                      borderColor: theme.colors.border,
                      borderRadius: Math.min(theme.borderRadius, 14),
                    },
                  ]}
                />
              </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
              <Button title="Save Expense" onPress={handleSave} size="lg" />
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
    maxHeight: '90%',
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
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '800',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  textInput: {
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  catChipText: {
    fontSize: 12,
  },
  footer: {
    paddingVertical: 14,
    borderTopWidth: 1,
  },
});
