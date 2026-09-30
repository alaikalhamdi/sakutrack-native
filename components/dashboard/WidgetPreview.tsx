import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { DimensionValue, StyleSheet, View } from 'react-native';
import { ThemeConfig } from '../../types/theme';
import { WidgetSlotSize, WidgetType } from '../../types/dashboard';
import { Text } from '../common/AppText';

interface SizeOptionGlyphProps {
  size: WidgetSlotSize;
  isActive: boolean;
  isDisabled?: boolean;
  theme: ThemeConfig;
}

export const SizeOptionGlyph: React.FC<SizeOptionGlyphProps> = ({
  size,
  isActive,
  isDisabled,
  theme,
}) => {
  const activeColor = isActive ? '#FFFFFF' : theme.colors.primary;
  const emptyColor = isActive ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.12)';
  const disabledColor = 'rgba(0,0,0,0.08)';

  const getCellColor = (row: number, col: number) => {
    if (isDisabled) return disabledColor;
    if (size === '1x1') {
      return row === 0 && col === 0 ? activeColor : emptyColor;
    }
    if (size === '2x1') {
      return row === 0 ? activeColor : emptyColor;
    }
    // 2x2
    return activeColor;
  };

  return (
    <View style={styles.glyphGrid}>
      <View style={styles.glyphRow}>
        <View style={[styles.glyphCell, { backgroundColor: getCellColor(0, 0) }]} />
        <View style={[styles.glyphCell, { backgroundColor: getCellColor(0, 1) }]} />
      </View>
      <View style={styles.glyphRow}>
        <View style={[styles.glyphCell, { backgroundColor: getCellColor(1, 0) }]} />
        <View style={[styles.glyphCell, { backgroundColor: getCellColor(1, 1) }]} />
      </View>
    </View>
  );
};

interface WidgetCardPreviewProps {
  type: WidgetType;
  size: WidgetSlotSize;
  title: string;
  theme: ThemeConfig;
}

export const WidgetCardPreview: React.FC<WidgetCardPreviewProps> = ({
  type,
  size,
  title,
  theme,
}) => {
  const isOneByOne = size === '1x1';
  const isTwoByTwo = size === '2x2';

  // Preview container width and height
  const containerStyle = [
    styles.previewBox,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: Math.min(theme.borderRadius, 12),
      width: (isOneByOne ? '50%' : '100%') as DimensionValue,
      minHeight: isOneByOne ? 84 : isTwoByTwo ? 120 : 76,
    },
  ];

  const renderContent = () => {
    switch (type) {
      case 'safe_to_spend':
        return (
          <View style={styles.previewInner}>
            <View style={styles.previewHeader}>
              <Ionicons name="sparkles" size={11} color={theme.colors.accent} />
              <Text numberOfLines={1} style={[styles.previewLabel, { color: theme.colors.textSecondary }]}>
                SAFE-TO-SPEND
              </Text>
            </View>
            <Text style={[styles.previewBigVal, { color: theme.colors.primary }]}>
              {isOneByOne ? 'Rp 50k' : 'Rp 52.500 / day'}
            </Text>
            <Text numberOfLines={1} style={[styles.previewSub, { color: theme.colors.textMuted }]}>
              Daily safe limit
            </Text>
          </View>
        );

      case 'spending_summary':
        return (
          <View style={styles.previewInner}>
            <View style={styles.previewHeader}>
              <Ionicons name="wallet-outline" size={11} color={theme.colors.accent} />
              <Text numberOfLines={1} style={[styles.previewLabel, { color: theme.colors.textSecondary }]}>
                SPENT (TODAY)
              </Text>
              {!isOneByOne && (
                <View style={[styles.miniPills, { backgroundColor: theme.colors.surfaceSubtle }]}>
                  <Text style={[styles.miniPillText, { color: theme.colors.primary }]}>T</Text>
                  <Text style={[styles.miniPillText, { color: theme.colors.textMuted }]}>W</Text>
                </View>
              )}
            </View>
            <Text style={[styles.previewBigVal, { color: theme.colors.text }]}>
              {isOneByOne ? 'Rp 35k' : 'Rp 35.000'}
            </Text>
            <Text numberOfLines={1} style={[styles.previewSub, { color: theme.colors.textMuted }]}>
              Tracked today
            </Text>
          </View>
        );

      case 'burnout_runway':
        return (
          <View style={styles.previewInner}>
            <View style={styles.previewHeader}>
              <Ionicons name="speedometer-outline" size={11} color={theme.colors.accent} />
              <Text numberOfLines={1} style={[styles.previewLabel, { color: theme.colors.textSecondary }]}>
                ALLOWANCE RUNWAY
              </Text>
              <View style={[styles.miniBadge, { backgroundColor: theme.colors.success + '20' }]}>
                <Text style={{ fontSize: 9, color: theme.colors.success, fontWeight: '700' }}>14d left</Text>
              </View>
            </View>
            <View style={styles.previewRowBetween}>
              <Text style={[styles.previewValMedium, { color: theme.colors.text }]}>Rp 450.000</Text>
              <Text style={[styles.previewSub, { color: theme.colors.textMuted }]}>75% left</Text>
            </View>
            <View style={[styles.miniBarBg, { backgroundColor: theme.colors.surfaceSubtle }]}>
              <View style={[styles.miniBarFill, { width: '75%', backgroundColor: theme.colors.primary }]} />
            </View>
            {isTwoByTwo && (
              <View style={[styles.miniNoteBox, { backgroundColor: theme.colors.surfaceSubtle }]}>
                <Text numberOfLines={1} style={[styles.miniNoteText, { color: theme.colors.textSecondary }]}>
                  💡 Great pacing! Runway lasts through cycle.
                </Text>
              </View>
            )}
          </View>
        );

      case 'quick_add_launcher':
        return (
          <View style={styles.previewInner}>
            <View style={styles.previewHeader}>
              <Ionicons name="flash-outline" size={11} color={theme.colors.accent} />
              <Text numberOfLines={1} style={[styles.previewLabel, { color: theme.colors.textSecondary }]}>
                ONE-TAP SPEED LOG
              </Text>
            </View>
            <View style={styles.miniChipsGrid}>
              <View style={[styles.miniChip, { backgroundColor: theme.colors.surfaceSubtle }]}>
                <Text style={styles.miniChipText}>☕ Kopi +20k</Text>
              </View>
              <View style={[styles.miniChip, { backgroundColor: theme.colors.surfaceSubtle }]}>
                <Text style={styles.miniChipText}>🍛 Makan +25k</Text>
              </View>
              {isTwoByTwo && (
                <>
                  <View style={[styles.miniChip, { backgroundColor: theme.colors.surfaceSubtle }]}>
                    <Text style={styles.miniChipText}>🛵 Transit +15k</Text>
                  </View>
                  <View style={[styles.miniChip, { backgroundColor: theme.colors.surfaceSubtle }]}>
                    <Text style={styles.miniChipText}>📄 Print +10k</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        );

      case 'savings_carousel':
        return (
          <View style={styles.previewInner}>
            <View style={styles.previewHeader}>
              <Ionicons name="trophy-outline" size={11} color={theme.colors.accent} />
              <Text numberOfLines={1} style={[styles.previewLabel, { color: theme.colors.textSecondary }]}>
                STUDENT SAVINGS GOALS
              </Text>
              <Text style={{ fontSize: 9, color: theme.colors.primary, fontWeight: '700' }}>View →</Text>
            </View>
            <View style={[styles.miniGoalItem, { backgroundColor: theme.colors.surfaceSubtle }]}>
              <Text style={styles.miniGoalIcon}>💻</Text>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={[styles.miniGoalTitle, { color: theme.colors.text }]}>
                  New Laptop
                </Text>
                <View style={[styles.miniBarBg, { height: 4, marginTop: 3 }]}>
                  <View style={[styles.miniBarFill, { width: '60%', backgroundColor: theme.colors.accent }]} />
                </View>
              </View>
            </View>
            {isTwoByTwo && (
              <View style={[styles.miniGoalItem, { backgroundColor: theme.colors.surfaceSubtle, marginTop: 4 }]}>
                <Text style={styles.miniGoalIcon}>🎸</Text>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={[styles.miniGoalTitle, { color: theme.colors.text }]}>
                    Acoustic Guitar
                  </Text>
                  <View style={[styles.miniBarBg, { height: 4, marginTop: 3 }]}>
                    <View style={[styles.miniBarFill, { width: '35%', backgroundColor: '#10B981' }]} />
                  </View>
                </View>
              </View>
            )}
          </View>
        );

      case 'category_donut':
        return (
          <View style={styles.previewInner}>
            <View style={styles.previewHeader}>
              <Ionicons name="pie-chart-outline" size={11} color={theme.colors.accent} />
              <Text numberOfLines={1} style={[styles.previewLabel, { color: theme.colors.textSecondary }]}>
                WHERE MONEY GOES
              </Text>
            </View>
            <View style={styles.miniBreakdownRow}>
              <View style={[styles.miniDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={[styles.miniBreakdownText, { color: theme.colors.text }]}>Food & Drinks</Text>
              <Text style={[styles.miniBreakdownPct, { color: theme.colors.textSecondary }]}>55%</Text>
            </View>
            <View style={[styles.miniBarBg, { height: 4 }]}>
              <View style={[styles.miniBarFill, { width: '55%', backgroundColor: '#3B82F6' }]} />
            </View>
            {isTwoByTwo && (
              <>
                <View style={[styles.miniBreakdownRow, { marginTop: 4 }]}>
                  <View style={[styles.miniDot, { backgroundColor: '#EC4899' }]} />
                  <Text style={[styles.miniBreakdownText, { color: theme.colors.text }]}>Campus / Study</Text>
                  <Text style={[styles.miniBreakdownPct, { color: theme.colors.textSecondary }]}>30%</Text>
                </View>
                <View style={[styles.miniBarBg, { height: 4 }]}>
                  <View style={[styles.miniBarFill, { width: '30%', backgroundColor: '#EC4899' }]} />
                </View>
              </>
            )}
          </View>
        );

      case 'recent_transactions':
        return (
          <View style={styles.previewInner}>
            <View style={styles.previewHeader}>
              <Ionicons name="receipt-outline" size={11} color={theme.colors.accent} />
              <Text numberOfLines={1} style={[styles.previewLabel, { color: theme.colors.textSecondary }]}>
                RECENT EXPENSES
              </Text>
              <Text style={{ fontSize: 9, color: theme.colors.primary, fontWeight: '700' }}>All →</Text>
            </View>
            <View style={styles.miniTxRow}>
              <Text style={styles.miniTxIcon}>☕</Text>
              <Text numberOfLines={1} style={[styles.miniTxTitle, { color: theme.colors.text }]}>
                Morning Latte
              </Text>
              <Text style={[styles.miniTxAmount, { color: theme.colors.text }]}>-Rp 18k</Text>
            </View>
            {isTwoByTwo && (
              <>
                <View style={styles.miniTxRow}>
                  <Text style={styles.miniTxIcon}>🍔</Text>
                  <Text numberOfLines={1} style={[styles.miniTxTitle, { color: theme.colors.text }]}>
                    Campus Cafeteria
                  </Text>
                  <Text style={[styles.miniTxAmount, { color: theme.colors.text }]}>-Rp 25k</Text>
                </View>
                <View style={styles.miniTxRow}>
                  <Text style={styles.miniTxIcon}>🚌</Text>
                  <Text numberOfLines={1} style={[styles.miniTxTitle, { color: theme.colors.text }]}>
                    Bus Transit
                  </Text>
                  <Text style={[styles.miniTxAmount, { color: theme.colors.text }]}>-Rp 10k</Text>
                </View>
              </>
            )}
          </View>
        );

      default:
        return (
          <View style={styles.previewInner}>
            <Text style={[styles.previewLabel, { color: theme.colors.textSecondary }]}>{title}</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.previewWrapper}>
      <View style={containerStyle}>{renderContent()}</View>
      <View style={styles.previewTagWrap}>
        <Text style={[styles.previewTagText, { color: theme.colors.textMuted }]}>
          Preview ({size})
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  glyphGrid: {
    width: 14,
    height: 14,
    gap: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glyphRow: {
    flexDirection: 'row',
    gap: 2,
  },
  glyphCell: {
    width: 5,
    height: 5,
    borderRadius: 1,
  },
  previewWrapper: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  previewBox: {
    borderWidth: 1,
    padding: 8,
    overflow: 'hidden',
  },
  previewInner: {
    gap: 4,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'space-between',
  },
  previewLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.3,
    flex: 1,
  },
  previewBigVal: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 1,
  },
  previewValMedium: {
    fontSize: 12,
    fontWeight: '800',
  },
  previewSub: {
    fontSize: 9,
    fontWeight: '500',
  },
  previewRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  miniPills: {
    flexDirection: 'row',
    borderRadius: 4,
    padding: 1,
    gap: 2,
  },
  miniPillText: {
    fontSize: 7.5,
    fontWeight: '700',
    paddingHorizontal: 2,
  },
  miniBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  miniBarBg: {
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
    marginTop: 2,
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  miniNoteBox: {
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRadius: 4,
    marginTop: 3,
  },
  miniNoteText: {
    fontSize: 8,
  },
  miniChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  miniChip: {
    paddingHorizontal: 5,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  miniChipText: {
    fontSize: 8,
    fontWeight: '600',
  },
  miniGoalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 4,
    borderRadius: 6,
  },
  miniGoalIcon: {
    fontSize: 11,
  },
  miniGoalTitle: {
    fontSize: 9,
    fontWeight: '700',
  },
  miniBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  miniDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  miniBreakdownText: {
    fontSize: 8.5,
    fontWeight: '600',
    flex: 1,
  },
  miniBreakdownPct: {
    fontSize: 8,
    fontWeight: '700',
  },
  miniTxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 1.5,
  },
  miniTxIcon: {
    fontSize: 10,
  },
  miniTxTitle: {
    fontSize: 8.5,
    fontWeight: '600',
    flex: 1,
  },
  miniTxAmount: {
    fontSize: 8.5,
    fontWeight: '700',
  },
  previewTagWrap: {
    marginTop: 3,
  },
  previewTagText: {
    fontSize: 8.5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
