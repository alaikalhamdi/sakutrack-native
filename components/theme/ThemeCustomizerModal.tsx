import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME_PRESETS } from '../../constants/themes';
import { getFontFamily } from '../../constants/typography';
import { useAppTheme } from '../../context/ThemeContext';
import { BorderStyleId, FontStyleId, ThemePresetId } from '../../types/theme';
import { Text } from '../common/AppText';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface ThemeCustomizerModalProps {
  visible: boolean;
  onClose: () => void;
}

const ACCENT_COLORS = [
  '#6A994E', // Matcha Green
  '#FF5722', // Retro Orange
  '#00F0FF', // Cyber Cyan
  '#3B82F6', // Campus Blue
  '#EC4899', // Berry Pink
  '#EAB308', // Sunlight Gold
  '#8B5CF6', // Purple Glow
  '#10B981', // Emerald
];

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme, setPreset, updateCustomTheme, updateBorderRadius, updateFontStyle, getFont } =
    useAppTheme();

  const [activeTab, setActiveTab] = useState<'presets' | 'diy'>('presets');

  const presetList: { id: ThemePresetId; title: string; emoji: string }[] = [
    { id: 'matcha', title: 'Matcha Cozy', emoji: '🍵' },
    { id: 'retro', title: 'Retro Arcade', emoji: '🕹️' },
    { id: 'cyber', title: 'Cyber Neon', emoji: '⚡' },
    { id: 'campus', title: 'Clean Campus', emoji: '🎓' },
  ];

  const borderStyles: { id: BorderStyleId; label: string; radius: number }[] = [
    { id: 'sharp', label: 'Sharp Boxy (4px)', radius: 4 },
    { id: 'rounded', label: 'Cozy Rounded (16px)', radius: 16 },
    { id: 'pill', label: 'Ultra Pill (26px)', radius: 26 },
  ];

  const fontStyles: { id: FontStyleId; label: string; sample: string }[] = [
    { id: 'modern', label: 'Modern Sans (Jakarta)', sample: 'SakuTrack 2026' },
    { id: 'playful', label: 'Playful Vibe (Quicksand)', sample: 'SakuTrack 2026' },
    { id: 'mono', label: 'Retro Monospace (SpaceMono)', sample: 'SakuTrack 2026' },
    { id: 'serif', label: 'Editorial Serif (Lora)', sample: 'SakuTrack 2026' },
  ];

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
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text
                  style={[
                    styles.title,
                    {
                      color: theme.colors.text,
                      fontFamily: getFont('bold'),
                    },
                  ]}
                >
                  Theme & Style Studio ✨
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  Customize the look & aesthetic of your dashboard
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: theme.colors.surfaceSubtle }]}
              >
                <Ionicons name="close" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={[styles.tabBar, { backgroundColor: theme.colors.surfaceSubtle }]}>
              <TouchableOpacity
                onPress={() => setActiveTab('presets')}
                style={[
                  styles.tab,
                  activeTab === 'presets' && {
                    backgroundColor: theme.colors.primary,
                    borderRadius: Math.min(theme.borderRadius, 14),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: activeTab === 'presets' ? '#FFFFFF' : theme.colors.textSecondary,
                      fontWeight: activeTab === 'presets' ? '700' : '500',
                    },
                  ]}
                >
                  Curated Presets 🎨
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('diy')}
                style={[
                  styles.tab,
                  activeTab === 'diy' && {
                    backgroundColor: theme.colors.primary,
                    borderRadius: Math.min(theme.borderRadius, 14),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: activeTab === 'diy' ? '#FFFFFF' : theme.colors.textSecondary,
                      fontWeight: activeTab === 'diy' ? '700' : '500',
                    },
                  ]}
                >
                  DIY Customizer 🛠️
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              {activeTab === 'presets' ? (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Starter Aesthetics
                  </Text>
                  <View style={styles.presetsGrid}>
                    {presetList.map((preset) => {
                      const pTheme = THEME_PRESETS[preset.id];
                      const isSelected = theme.id === preset.id;

                      return (
                        <TouchableOpacity
                          key={preset.id}
                          activeOpacity={0.8}
                          onPress={() => setPreset(preset.id)}
                          style={[
                            styles.presetCard,
                            {
                              backgroundColor: pTheme.colors.surface,
                              borderColor: isSelected
                                ? theme.colors.primary
                                : pTheme.colors.border,
                              borderWidth: isSelected ? 2.5 : 1,
                              borderRadius: pTheme.borderRadius,
                            },
                          ]}
                        >
                          <View style={styles.presetTopRow}>
                            <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                            {isSelected && (
                              <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color={theme.colors.primary}
                              />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.presetName,
                              {
                                color: pTheme.colors.text,
                                fontFamily: getFontFamily(pTheme.fontStyle, 'bold'),
                              },
                            ]}
                          >
                            {preset.title}
                          </Text>
                          {/* Color chips */}
                          <View style={styles.chipsRow}>
                            <View
                              style={[
                                styles.chip,
                                { backgroundColor: pTheme.colors.primary },
                              ]}
                            />
                            <View
                              style={[
                                styles.chip,
                                { backgroundColor: pTheme.colors.accent },
                              ]}
                            />
                            <View
                              style={[
                                styles.chip,
                                { backgroundColor: pTheme.colors.background },
                              ]}
                            />
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <View style={styles.section}>
                  {/* Accent Color Picker */}
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Accent Colors
                  </Text>
                  <View style={styles.swatchesRow}>
                    {ACCENT_COLORS.map((color) => {
                      const isSelected = theme.colors.accent === color;
                      return (
                        <TouchableOpacity
                          key={color}
                          activeOpacity={0.7}
                          onPress={() =>
                            updateCustomTheme({
                              colors: { ...theme.colors, accent: color, primary: color },
                            })
                          }
                          style={[
                            styles.swatch,
                            {
                              backgroundColor: color,
                              borderColor: isSelected ? theme.colors.text : 'transparent',
                              borderWidth: isSelected ? 3 : 0,
                            },
                          ]}
                        />
                      );
                    })}
                  </View>

                  {/* Corner Radius Styles */}
                  <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 16 }]}>
                    Card Corner Style
                  </Text>
                  <View style={styles.optionsList}>
                    {borderStyles.map((item) => {
                      const isSelected = theme.borderRadius === item.radius;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => updateBorderRadius(item.radius, item.id)}
                          style={[
                            styles.optionRow,
                            {
                              backgroundColor: theme.colors.surfaceSubtle,
                              borderColor: isSelected
                                ? theme.colors.primary
                                : theme.colors.border,
                              borderWidth: isSelected ? 2 : 1,
                              borderRadius: item.radius,
                            },
                          ]}
                        >
                          <Text style={[styles.optionText, { color: theme.colors.text }]}>
                            {item.label}
                          </Text>
                          {isSelected && (
                            <Ionicons
                              name="radio-button-on"
                              size={18}
                              color={theme.colors.primary}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Font Style Selection */}
                  <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 16 }]}>
                    Typography Style
                  </Text>
                  <View style={styles.optionsList}>
                    {fontStyles.map((item) => {
                      const isSelected = theme.fontStyle === item.id;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => updateFontStyle(item.id)}
                          style={[
                            styles.optionRow,
                            {
                              backgroundColor: theme.colors.surfaceSubtle,
                              borderColor: isSelected
                                ? theme.colors.primary
                                : theme.colors.border,
                              borderWidth: isSelected ? 2 : 1,
                              borderRadius: Math.min(theme.borderRadius, 14),
                            },
                          ]}
                        >
                          <View>
                            <Text style={[styles.optionText, { color: theme.colors.text }]}>
                              {item.label}
                            </Text>
                            <Text
                              style={{
                                color: theme.colors.textSecondary,
                                fontSize: 13,
                                fontFamily: getFontFamily(item.id, 'medium'),
                              }}
                            >
                              {item.sample}
                            </Text>
                          </View>
                          {isSelected && (
                            <Ionicons
                              name="checkmark-circle"
                              size={18}
                              color={theme.colors.primary}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Live Preview Card */}
              <View style={{ marginTop: 20, marginBottom: 24 }}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Live Preview
                </Text>
                <Card variant="surface" style={{ marginTop: 8 }}>
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontSize: 16,
                      fontWeight: '700',
                      fontFamily: getFont('bold'),
                    }}
                  >
                    Sample Widget Card
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.textSecondary,
                      fontSize: 13,
                      marginVertical: 4,
                    }}
                  >
                    This is how your information cards will look on the dashboard!
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.accent,
                        fontSize: 20,
                        fontWeight: '800',
                      }}
                    >
                      Rp 75.000 / day
                    </Text>
                    <Button
                      title="Catchy Button"
                      size="sm"
                      onPress={() => {}}
                    />
                  </View>
                </Card>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
              <Button title="Done Customizing" onPress={onClose} size="md" />
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
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
  },
  scroll: {
    maxHeight: 460,
  },
  section: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetCard: {
    width: '48%',
    padding: 12,
    marginBottom: 4,
  },
  presetTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetEmoji: {
    fontSize: 24,
  },
  presetName: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  swatchesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatch: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  optionsList: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 14,
    borderTopWidth: 1,
  },
});
