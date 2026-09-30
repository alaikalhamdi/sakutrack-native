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

interface ManageCategoriesModalProps {
  visible: boolean;
  onClose: () => void;
}

const AVAILABLE_ICONS = [
  'fast-food',
  'school',
  'bicycle',
  'film',
  'game-controller',
  'medkit',
  'fitness',
  'shirt',
  'cafe',
  'cart',
  'gift',
  'musical-notes',
  'airplane',
  'bus',
  'sparkles',
];

const AVAILABLE_COLORS = [
  '#FF70A6',
  '#4EA8DE',
  '#FF9770',
  '#70D6FF',
  '#E9D8A6',
  '#06D6A0',
  '#8A2BE2',
  '#FF5722',
  '#FFD166',
  '#2EC4B6',
];

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useAppTheme();
  const { categories, addCategory, deleteCategory } = useData() as any;

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please enter a category name');
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore
    }

    if (addCategory) {
      await addCategory({
        id: `cat_${Date.now()}`,
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        isCustom: true,
      });
    }

    setName('');
    setIsCreating(false);
    setError('');
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
            {/* Header */}
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
                  Spending Categories 🏷️
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  Organize your student spending buckets
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
              {/* Add Custom Category Button or Form */}
              {!isCreating ? (
                <TouchableOpacity
                  onPress={() => setIsCreating(true)}
                  style={[
                    styles.addCategoryCard,
                    {
                      backgroundColor: theme.colors.surfaceSubtle,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                >
                  <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
                  <Text style={[styles.addCategoryText, { color: theme.colors.primary }]}>
                    Create Custom Category
                  </Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={[
                    styles.createForm,
                    {
                      backgroundColor: theme.colors.surfaceSubtle,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.formTitle, { color: theme.colors.text }]}>
                    New Student Category
                  </Text>

                  {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

                  <TextInput
                    value={name}
                    onChangeText={(t) => {
                      setName(t);
                      setError('');
                    }}
                    placeholder="e.g. Gym, Laundry, Club Dues"
                    placeholderTextColor={theme.colors.textMuted}
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                        color: theme.colors.text,
                        borderRadius: 10,
                      },
                    ]}
                  />

                  {/* Icon Selector */}
                  <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                    Select Icon
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.iconScroll}
                  >
                    {AVAILABLE_ICONS.map((icon) => {
                      const isSelected = selectedIcon === icon;
                      return (
                        <TouchableOpacity
                          key={icon}
                          onPress={() => setSelectedIcon(icon)}
                          style={[
                            styles.iconChip,
                            {
                              backgroundColor: isSelected
                                ? theme.colors.primary
                                : theme.colors.surface,
                              borderColor: theme.colors.border,
                              borderWidth: 1,
                            },
                          ]}
                        >
                          <Ionicons
                            name={icon as any}
                            size={16}
                            color={isSelected ? '#FFF' : theme.colors.text}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* Color Selector */}
                  <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                    Select Color
                  </Text>
                  <View style={styles.colorRow}>
                    {AVAILABLE_COLORS.map((col) => {
                      const isSelected = selectedColor === col;
                      return (
                        <TouchableOpacity
                          key={col}
                          onPress={() => setSelectedColor(col)}
                          style={[
                            styles.colorDot,
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

                  <View style={styles.formBtnRow}>
                    <Button
                      title="Cancel"
                      variant="ghost"
                      size="sm"
                      onPress={() => setIsCreating(false)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      title="Save Category"
                      variant="primary"
                      size="sm"
                      onPress={handleCreate}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              )}

              {/* Categories List */}
              <View style={styles.catList}>
                {categories.map((cat: any) => (
                  <View
                    key={cat.id}
                    style={[
                      styles.catItem,
                      {
                        backgroundColor: theme.colors.surfaceSubtle,
                        borderColor: theme.colors.border,
                        borderWidth: 1,
                        borderRadius: 12,
                      },
                    ]}
                  >
                    <View style={styles.catLeft}>
                      <View
                        style={[
                          styles.catIconWrap,
                          { backgroundColor: cat.color + '22', borderColor: cat.color },
                        ]}
                      >
                        <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                      </View>
                      <View>
                        <Text style={[styles.catItemName, { color: theme.colors.text }]}>
                          {cat.name}
                        </Text>
                        <Text style={[styles.catItemType, { color: theme.colors.textMuted }]}>
                          {cat.isCustom ? 'Custom Category' : 'Default Preset'}
                        </Text>
                      </View>
                    </View>

                    {cat.isCustom && deleteCategory ? (
                      <TouchableOpacity
                        onPress={() => deleteCategory(cat.id)}
                        style={styles.trashBtn}
                      >
                        <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
              <Button title="Done" onPress={onClose} size="md" />
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
    marginBottom: 14,
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
  addCategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginBottom: 14,
  },
  addCategoryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  createForm: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    gap: 10,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    color: '#D90429',
    fontSize: 11,
    fontWeight: '600',
  },
  input: {
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  iconScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  iconChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  formBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  catList: {
    gap: 8,
    paddingBottom: 16,
  },
  catItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  catIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  catItemName: {
    fontSize: 13,
    fontWeight: '600',
  },
  catItemType: {
    fontSize: 10,
    marginTop: 1,
  },
  trashBtn: {
    padding: 6,
  },
  footer: {
    paddingVertical: 14,
    borderTopWidth: 1,
  },
});
