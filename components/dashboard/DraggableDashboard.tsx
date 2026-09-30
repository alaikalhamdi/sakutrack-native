import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { DashboardWidgetConfig, WidgetType } from '../../types/dashboard';
import { CategoryDonutWidget } from './CategoryDonutWidget';
import { QuickAddLauncherWidget } from './QuickAddLauncherWidget';
import { RecentExpensesWidget } from './RecentExpensesWidget';
import { RunwayWidget } from './RunwayWidget';
import { SafeToSpendWidget } from './SafeToSpendWidget';
import { SavingsGoalsWidget } from './SavingsGoalsWidget';
import { SpendCounterWidget } from './SpendCounterWidget';
import { Expense } from '../../types/expense';
import { WidgetDrawerModal } from './WidgetDrawerModal';

interface DraggableDashboardProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenAddExpense: () => void;
  onOpenExpensesTab: () => void;
  onOpenGoalsTab: () => void;
  onEditExpense?: (expense: Expense) => void;
}

export const DraggableDashboard: React.FC<DraggableDashboardProps> = ({
  isEditMode,
  onToggleEditMode,
  onOpenAddExpense,
  onOpenExpensesTab,
  onOpenGoalsTab,
  onEditExpense,
}) => {
  const { theme } = useAppTheme();
  const { widgets, reorderWidgets, toggleWidgetVisibility } = useData();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const visibleWidgets = [...widgets]
    .filter((w) => w.isVisible)
    .sort((a, b) => a.order - b.order);

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= visibleWidgets.length) return;

    const reordered = [...visibleWidgets];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Merge back into full widgets array maintaining hidden widgets
    const updatedFull = widgets.map((w) => {
      const matchIdx = reordered.findIndex((rw) => rw.id === w.id);
      return matchIdx !== -1 ? { ...w, order: matchIdx } : w;
    });

    reorderWidgets(updatedFull);
  };

  const renderWidgetContent = (type: WidgetType) => {
    switch (type) {
      case 'safe_to_spend':
        return <SafeToSpendWidget />;
      case 'spending_summary':
        return <SpendCounterWidget />;
      case 'burnout_runway':
        return <RunwayWidget />;
      case 'quick_add_launcher':
        return <QuickAddLauncherWidget onOpenFullModal={onOpenAddExpense} />;
      case 'savings_carousel':
        return <SavingsGoalsWidget onOpenGoalsTab={onOpenGoalsTab} />;
      case 'category_donut':
        return <CategoryDonutWidget />;
      case 'recent_transactions':
        return (
          <RecentExpensesWidget
            onOpenExpensesTab={onOpenExpensesTab}
            onOpenAddModal={onOpenAddExpense}
            onEditExpense={onEditExpense}
          />
        );
      default:
        return null;
    }
  };

  // Group adjacent 1x1 widgets together into paired rows
  const groupedElements: (DashboardWidgetConfig | DashboardWidgetConfig[])[] = [];
  let i = 0;
  while (i < visibleWidgets.length) {
    const current = visibleWidgets[i];
    if (
      current.slotSize === '1x1' &&
      i + 1 < visibleWidgets.length &&
      visibleWidgets[i + 1].slotSize === '1x1'
    ) {
      groupedElements.push([current, visibleWidgets[i + 1]]);
      i += 2;
    } else {
      groupedElements.push(current);
      i += 1;
    }
  }

  return (
    <View style={styles.container}>
      {/* Edit Mode Banner */}
      {isEditMode && (
        <View
          style={[
            styles.editBanner,
            {
              backgroundColor: theme.colors.surfaceSubtle,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <View style={styles.bannerLeft}>
            <Ionicons name="apps" size={18} color={theme.colors.primary} />
            <Text style={[styles.bannerText, { color: theme.colors.text }]}>
              Dashboard Customizer Active
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setDrawerVisible(true)}
            style={[styles.manageBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Ionicons name="options-outline" size={14} color="#FFF" />
            <Text style={styles.manageBtnText}>Add / Hide Cards</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Render Widgets */}
      <View style={styles.grid}>
        {groupedElements.map((item, groupIdx) => {
          if (Array.isArray(item)) {
            // Render 2 side-by-side 1x1 cards
            const [w1, w2] = item;
            const idx1 = visibleWidgets.findIndex((w) => w.id === w1.id);
            const idx2 = visibleWidgets.findIndex((w) => w.id === w2.id);

            return (
              <View key={`pair-${w1.id}-${w2.id}`} style={styles.rowPair}>
                {/* Widget 1 */}
                <View style={styles.colHalf}>
                  {isEditMode && (
                    <View style={styles.editControls}>
                      <TouchableOpacity
                        disabled={idx1 === 0}
                        onPress={() => moveWidget(idx1, 'up')}
                        style={styles.shiftBtn}
                      >
                        <Ionicons
                          name="arrow-up"
                          size={14}
                          color={idx1 === 0 ? theme.colors.textMuted : theme.colors.primary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={idx1 === visibleWidgets.length - 1}
                        onPress={() => moveWidget(idx1, 'down')}
                        style={styles.shiftBtn}
                      >
                        <Ionicons
                          name="arrow-down"
                          size={14}
                          color={
                            idx1 === visibleWidgets.length - 1
                              ? theme.colors.textMuted
                              : theme.colors.primary
                          }
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => toggleWidgetVisibility(w1.id)}
                        style={styles.shiftBtn}
                      >
                        <Ionicons name="eye-off-outline" size={14} color={theme.colors.danger} />
                      </TouchableOpacity>
                    </View>
                  )}
                  {renderWidgetContent(w1.type)}
                </View>

                {/* Widget 2 */}
                <View style={styles.colHalf}>
                  {isEditMode && (
                    <View style={styles.editControls}>
                      <TouchableOpacity
                        disabled={idx2 === 0}
                        onPress={() => moveWidget(idx2, 'up')}
                        style={styles.shiftBtn}
                      >
                        <Ionicons
                          name="arrow-up"
                          size={14}
                          color={idx2 === 0 ? theme.colors.textMuted : theme.colors.primary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={idx2 === visibleWidgets.length - 1}
                        onPress={() => moveWidget(idx2, 'down')}
                        style={styles.shiftBtn}
                      >
                        <Ionicons
                          name="arrow-down"
                          size={14}
                          color={
                            idx2 === visibleWidgets.length - 1
                              ? theme.colors.textMuted
                              : theme.colors.primary
                          }
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => toggleWidgetVisibility(w2.id)}
                        style={styles.shiftBtn}
                      >
                        <Ionicons name="eye-off-outline" size={14} color={theme.colors.danger} />
                      </TouchableOpacity>
                    </View>
                  )}
                  {renderWidgetContent(w2.type)}
                </View>
              </View>
            );
          } else {
            // Full width card (2x1 or 2x2 or unpaired 1x1)
            const idx = visibleWidgets.findIndex((w) => w.id === item.id);

            return (
              <View key={item.id} style={styles.fullCardWrap}>
                {isEditMode && (
                  <View
                    style={[
                      styles.cardEditBar,
                      { backgroundColor: theme.colors.surfaceSubtle },
                    ]}
                  >
                    <Text style={[styles.cardTitleEdit, { color: theme.colors.textSecondary }]}>
                      {item.title} ({item.slotSize})
                    </Text>
                    <View style={styles.editControls}>
                      <TouchableOpacity
                        disabled={idx === 0}
                        onPress={() => moveWidget(idx, 'up')}
                        style={styles.shiftBtn}
                      >
                        <Ionicons
                          name="arrow-up"
                          size={16}
                          color={idx === 0 ? theme.colors.textMuted : theme.colors.primary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={idx === visibleWidgets.length - 1}
                        onPress={() => moveWidget(idx, 'down')}
                        style={styles.shiftBtn}
                      >
                        <Ionicons
                          name="arrow-down"
                          size={16}
                          color={
                            idx === visibleWidgets.length - 1
                              ? theme.colors.textMuted
                              : theme.colors.primary
                          }
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => toggleWidgetVisibility(item.id)}
                        style={styles.shiftBtn}
                      >
                        <Ionicons name="eye-off-outline" size={16} color={theme.colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {renderWidgetContent(item.type)}
              </View>
            );
          }
        })}
      </View>

      <WidgetDrawerModal visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  editBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bannerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  manageBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  grid: {
    gap: 12,
  },
  rowPair: {
    flexDirection: 'row',
    gap: 12,
  },
  colHalf: {
    flex: 1,
  },
  fullCardWrap: {
    width: '100%',
  },
  cardEditBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: 4,
  },
  cardTitleEdit: {
    fontSize: 11,
    fontWeight: '600',
  },
  editControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shiftBtn: {
    padding: 4,
  },
});
