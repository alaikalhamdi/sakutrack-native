import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Text } from '../common/AppText';
import { WidgetSlotSize, isSizeAllowed } from '../../types/dashboard';
import { Button } from '../common/Button';
import { SizeOptionGlyph, WidgetCardPreview } from './WidgetPreview';

interface WidgetDrawerModalProps {
  visible: boolean;
  onClose: () => void;
}

const SLOT_SIZES: WidgetSlotSize[] = ['1x1', '2x1', '2x2'];

export const WidgetDrawerModal: React.FC<WidgetDrawerModalProps> = ({ visible, onClose }) => {
  const { theme } = useAppTheme();
  const { widgets, toggleWidgetVisibility, updateWidgetSlotSize } = useData();

  const handleSizeChange = (id: string, size: WidgetSlotSize) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
    updateWidgetSlotSize(id, size);
  };

  const handleToggle = (id: string) => {
    try {
      Haptics.selectionAsync();
    } catch {
      // ignore
    }
    toggleWidgetVisibility(id);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
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
                  Dashboard Card Catalog 🗂️
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  Customize visibility, preview cards & choose sizes
                </Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: theme.colors.surfaceSubtle }]}
              >
                <Ionicons name="close" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              <View style={styles.list}>
                {widgets.map((w) => (
                  <View
                    key={w.id}
                    style={[
                      styles.itemRow,
                      {
                        backgroundColor: theme.colors.surfaceSubtle,
                        borderColor: theme.colors.border,
                        borderWidth: theme.borderWidth > 0 ? 1 : 0,
                        borderRadius: Math.min(theme.borderRadius, 14),
                      },
                    ]}
                  >
                    <View style={styles.itemMain}>
                      <View style={styles.itemHeaderRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                            {w.title}
                          </Text>
                          <Text style={[styles.itemType, { color: theme.colors.textMuted }]}>
                            {w.type.replace(/_/g, ' ')}
                          </Text>
                        </View>

                        <Switch
                          value={w.isVisible}
                          onValueChange={() => handleToggle(w.id)}
                          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                          thumbColor="#FFFFFF"
                        />
                      </View>

                      {/* Size Picker Pills with Size Option Preview Glyphs */}
                      <View style={styles.sizePickerRow}>
                        <Text style={[styles.sizeLabel, { color: theme.colors.textMuted }]}>
                          Size:
                        </Text>
                        <View style={styles.sizePills}>
                          {SLOT_SIZES.map((size) => {
                            const isSelected = w.slotSize === size;
                            const isAllowed = isSizeAllowed(w.type, size);

                            return (
                              <TouchableOpacity
                                key={size}
                                disabled={!isAllowed}
                                onPress={() => isAllowed && handleSizeChange(w.id, size)}
                                style={[
                                  styles.sizePill,
                                  {
                                    backgroundColor: isSelected
                                      ? theme.colors.primary
                                      : isAllowed
                                      ? 'rgba(0,0,0,0.05)'
                                      : 'transparent',
                                    borderColor: isSelected
                                      ? theme.colors.primary
                                      : isAllowed
                                      ? theme.colors.border
                                      : 'rgba(0,0,0,0.08)',
                                    opacity: isAllowed ? 1 : 0.4,
                                  },
                                ]}
                              >
                                <SizeOptionGlyph
                                  size={size}
                                  isActive={isSelected}
                                  isDisabled={!isAllowed}
                                  theme={theme}
                                />
                                <Text
                                  style={[
                                    styles.sizePillText,
                                    {
                                      color: isSelected
                                        ? '#FFFFFF'
                                        : isAllowed
                                        ? theme.colors.textSecondary
                                        : theme.colors.textMuted,
                                      fontWeight: isSelected ? '800' : '600',
                                    },
                                  ]}
                                >
                                  {size}
                                </Text>
                                {!isAllowed && (
                                  <Ionicons name="lock-closed" size={9} color={theme.colors.textMuted} />
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>

                      {/* Card Miniature Preview */}
                      <WidgetCardPreview
                        type={w.type}
                        size={w.slotSize}
                        title={w.title}
                        theme={theme}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
              <Button title="Apply Changes" onPress={onClose} size="md" />
            </View>
          </View>
        </SafeAreaView>
      </View>
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
    maxHeight: 520,
  },
  list: {
    gap: 12,
    paddingBottom: 20,
  },
  itemRow: {
    padding: 14,
  },
  itemMain: {
    width: '100%',
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemType: {
    fontSize: 11,
    textTransform: 'capitalize',
    marginTop: 1,
  },
  sizePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  sizeLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  sizePills: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  sizePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  sizePillText: {
    fontSize: 11,
  },
  footer: {
    paddingVertical: 14,
    borderTopWidth: 1,
  },
});
