import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
}

const GOAL_ICONS = ['musical-notes', 'hardware-chip', 'shield-checkmark', 'airplane', 'gift', 'shirt', 'book', 'car'];
const GOAL_COLORS = ['#FF70A6', '#4EA8DE', '#06D6A0', '#FFD166', '#8A2BE2', '#FF5722'];

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ visible, onClose }) => {
  const { theme } = useAppTheme();
  const { addGoal, currencyCode } = useData();

  const [title, setTitle] = useState('');
  const [targetStr, setTargetStr] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(GOAL_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0]);
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState('');

  const isUSD = currencyCode === 'USD';

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please give your savings goal a name!');
      return;
    }
    const parsedTarget = parseFloat(targetStr.replace(/[^0-9.]/g, ''));
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setError('Please enter a target savings amount!');
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore
    }

    await addGoal({
      title: title.trim(),
      targetAmount: parsedTarget,
      icon: selectedIcon,
      color: selectedColor,
      isPublic,
    });

    setTitle('');
    setTargetStr('');
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
                  Create Savings Goal 🎯
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  Save up for student milestones & show them off
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

              {/* Title */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  Goal Title
                </Text>
                <TextInput
                  value={title}
                  onChangeText={(t) => {
                    setTitle(t);
                    setError('');
                  }}
                  placeholder="e.g. Cold Play Concert, Semester Break Trip"
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

              {/* Target Amount */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  Target Amount ({isUSD ? '$' : 'Rp'})
                </Text>
                <TextInput
                  value={targetStr}
                  onChangeText={(val) => {
                    setTargetStr(val);
                    setError('');
                  }}
                  keyboardType="numeric"
                  placeholder={isUSD ? '150.00' : '750000'}
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

              {/* Icon Selector */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  Goal Icon
                </Text>
                <View style={styles.iconsRow}>
                  {GOAL_ICONS.map((icon) => {
                    const isSelected = selectedIcon === icon;
                    return (
                      <TouchableOpacity
                        key={icon}
                        onPress={() => setSelectedIcon(icon)}
                        style={[
                          styles.iconChoice,
                          {
                            backgroundColor: isSelected
                              ? theme.colors.primaryLight
                              : theme.colors.surfaceSubtle,
                            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                            borderWidth: isSelected ? 2 : 1,
                            borderRadius: 12,
                          },
                        ]}
                      >
                        <Ionicons
                          name={icon as any}
                          size={18}
                          color={isSelected ? theme.colors.primary : theme.colors.text}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Color Selector */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  Theme Color
                </Text>
                <View style={styles.colorsRow}>
                  {GOAL_COLORS.map((col) => {
                    const isSelected = selectedColor === col;
                    return (
                      <TouchableOpacity
                        key={col}
                        onPress={() => setSelectedColor(col)}
                        style={[
                          styles.colorCircle,
                          {
                            backgroundColor: col,
                            borderColor: isSelected ? theme.colors.text : 'transparent',
                            borderWidth: isSelected ? 3 : 0,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              </View>

              {/* Public Toggle */}
              <View
                style={[
                  styles.toggleRow,
                  {
                    backgroundColor: theme.colors.surfaceSubtle,
                    borderRadius: Math.min(theme.borderRadius, 12),
                  },
                ]}
              >
                <View style={styles.toggleLeft}>
                  <Ionicons name="share-social-outline" size={18} color={theme.colors.primary} />
                  <View>
                    <Text style={[styles.toggleTitle, { color: theme.colors.text }]}>
                      Show on Shareable Profile
                    </Text>
                    <Text style={[styles.toggleSub, { color: theme.colors.textMuted }]}>
                      Friends can see your savings progress
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                />
              </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
              <Button title="Create Goal" onPress={handleSave} size="lg" />
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
  textInput: {
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  amountInput: {
    fontSize: 22,
    fontWeight: '800',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  iconsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconChoice: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 14,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  toggleSub: {
    fontSize: 11,
    marginTop: 1,
  },
  footer: {
    paddingVertical: 14,
    borderTopWidth: 1,
  },
});
