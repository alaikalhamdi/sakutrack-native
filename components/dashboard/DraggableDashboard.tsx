import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Text } from '../common/AppText';
import {
  DashboardWidgetConfig,
  WidgetSlotSize,
  WidgetType,
  getAllowedSizes,
} from '../../types/dashboard';
import { CategoryDonutWidget } from './CategoryDonutWidget';
import { QuickAddLauncherWidget } from './QuickAddLauncherWidget';
import { RecentExpensesWidget } from './RecentExpensesWidget';
import { RunwayWidget } from './RunwayWidget';
import { SafeToSpendWidget } from './SafeToSpendWidget';
import { SavingsGoalsWidget } from './SavingsGoalsWidget';
import { SpendCounterWidget } from './SpendCounterWidget';
import { Expense } from '../../types/expense';
import { WidgetDrawerModal } from './WidgetDrawerModal';
import { ThemeConfig } from '../../types/theme';

interface DraggableDashboardProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenAddExpense: () => void;
  onOpenExpensesTab: () => void;
  onOpenGoalsTab: () => void;
  onOpenCycleModal?: () => void;
  onEditExpense?: (expense: Expense) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  drawerVisible?: boolean;
  onOpenDrawer?: () => void;
  onCloseDrawer?: () => void;
}

/**
 * Striped Outline Drop Indicator
 * Shown at the destination slot while dragging to indicate where the card will land.
 */
const StripedDropPlaceholder: React.FC<{
  width: number | string;
  height: number;
  slotSize: WidgetSlotSize;
  theme: ThemeConfig;
}> = ({ width, height, slotSize, theme }) => {
  return (
    <View
      style={[
        styles.dropPlaceholder,
        {
          width: width as any,
          height: Math.max(90, height),
          borderColor: theme.colors.primary,
          backgroundColor: theme.isDark ? 'rgba(59, 130, 246, 0.16)' : 'rgba(37, 99, 235, 0.10)',
          borderRadius: Math.min(theme.borderRadius, 14),
        },
      ]}
    >
      <View style={[styles.stripedInnerBox, { borderColor: theme.colors.primary + '50' }]}>
        <View
          style={[
            styles.placeholderIconCircle,
            { backgroundColor: theme.colors.primary + '30' },
          ]}
        >
          <Ionicons name="download-outline" size={20} color={theme.colors.primary} />
        </View>
        <Text style={[styles.placeholderTitle, { color: theme.colors.primary }]}>
          Drop Here
        </Text>
        <Text style={[styles.placeholderSub, { color: theme.colors.textMuted }]}>
          {slotSize} slot
        </Text>
      </View>
    </View>
  );
};

interface WidgetCardItemProps {
  w: DashboardWidgetConfig;
  isEditMode: boolean;
  isThisDragging: boolean;
  isDropTarget: boolean;
  pan: Animated.ValueXY;
  theme: ThemeConfig;
  width: number | string;
  canDownsize: boolean;
  canUpsize: boolean;
  onLayout: (e: LayoutChangeEvent) => void;
  onStartDrag: (w: DashboardWidgetConfig) => void;
  onMoveDrag: (dx: number, dy: number, startWidgetId: string) => void;
  onEndDrag: () => void;
  onDownsize: (w: DashboardWidgetConfig) => void;
  onUpsize: (w: DashboardWidgetConfig) => void;
  onHide: (id: string) => void;
  renderContent: (type: WidgetType) => React.ReactNode;
}

const WidgetCardItem: React.FC<WidgetCardItemProps> = ({
  w,
  isEditMode,
  isThisDragging,
  isDropTarget,
  pan,
  theme,
  width,
  canDownsize,
  canUpsize,
  onLayout,
  onStartDrag,
  onMoveDrag,
  onEndDrag,
  onDownsize,
  onUpsize,
  onHide,
  renderContent,
}) => {
  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => isEditMode,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return isEditMode && (Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2);
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return isEditMode && (Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2);
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => {
        onStartDrag(w);
      },
      onPanResponderMove: (_, gestureState) => {
        onMoveDrag(gestureState.dx, gestureState.dy, w.id);
      },
      onPanResponderRelease: () => {
        onEndDrag();
      },
      onPanResponderTerminate: () => {
        onEndDrag();
      },
    });
  }, [isEditMode, w, onStartDrag, onMoveDrag, onEndDrag]);

  return (
    <View
      style={[
        styles.cardWrapper,
        {
          width: width as any,
          zIndex: isThisDragging ? 9999 : 1,
          elevation: isThisDragging ? 24 : 1,
        },
      ]}
      onLayout={onLayout}
    >
      {/* Ghost slot visible under the lifted card when dragging */}
      {isThisDragging && (
        <View
          style={[
            styles.ghostSlot,
            {
              backgroundColor: theme.colors.surfaceSubtle,
              borderColor: theme.colors.primary + '60',
              borderRadius: theme.borderRadius,
            },
          ]}
        >
          <View style={styles.ghostContent}>
            <View
              style={[
                styles.ghostIconCircle,
                { backgroundColor: theme.colors.primary + '20' },
              ]}
            >
              <Ionicons name="move" size={18} color={theme.colors.primary} />
            </View>
            <Text style={[styles.ghostTitle, { color: theme.colors.textMuted }]}>
              Moving card...
            </Text>
          </View>
        </View>
      )}

      {isEditMode ? (
        <Animated.View
          style={[
            styles.windowFrame,
            {
              backgroundColor: theme.colors.surface,
              borderColor: isThisDragging ? theme.colors.primary : theme.colors.border,
              borderWidth: isThisDragging ? 2 : (theme.borderWidth > 0 ? 1 : 0.8),
              borderRadius: theme.borderRadius,
              opacity: isDropTarget ? 0.35 : 1,
            },
            isThisDragging && {
              transform: [
                ...pan.getTranslateTransform(),
                { scale: 1.04 },
              ],
              shadowColor: theme.colors.primary,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
              elevation: 24,
            },
          ]}
        >
          {/* Grip Holder / Window Titlebar */}
          <View
            style={[
              styles.windowTitleBar,
              {
                backgroundColor: isThisDragging
                  ? theme.colors.primaryLight
                  : theme.colors.surfaceSubtle,
                borderBottomColor: isThisDragging
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
          >
            {/* Grip Handle Area */}
            <View
              {...panResponder.panHandlers}
              style={styles.gripHandleArea}
            >
              <View
                style={[
                  styles.gripIconWrap,
                  {
                    backgroundColor: isThisDragging
                      ? theme.colors.primary
                      : theme.colors.primaryLight,
                  },
                ]}
              >
                <Ionicons
                  name="apps"
                  size={13}
                  color={isThisDragging ? '#FFFFFF' : theme.colors.primary}
                />
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.windowTitleText,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.fonts?.bold,
                  },
                ]}
              >
                {w.title}
              </Text>
              <View
                style={[
                  styles.sizePillBadge,
                  {
                    backgroundColor: isThisDragging
                      ? theme.colors.primary
                      : theme.colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sizePillBadgeText,
                    {
                      color: isThisDragging ? '#FFFFFF' : theme.colors.textSecondary,
                      fontWeight: '800',
                    },
                  ]}
                >
                  {w.slotSize}
                </Text>
              </View>
            </View>

            {/* Window Controls: Downsize, Upsize, Hide */}
            <View style={styles.windowControls}>
              {/* Downsize Button */}
              <TouchableOpacity
                disabled={!canDownsize || isThisDragging}
                onPress={() => onDownsize(w)}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                style={[
                  styles.windowBtn,
                  {
                    backgroundColor: canDownsize ? theme.colors.surface : 'transparent',
                    opacity: canDownsize && !isThisDragging ? 1 : 0.25,
                  },
                ]}
              >
                <Ionicons
                  name="contract-outline"
                  size={14}
                  color={canDownsize ? theme.colors.primary : theme.colors.textMuted}
                />
              </TouchableOpacity>

              {/* Upsize Button */}
              <TouchableOpacity
                disabled={!canUpsize || isThisDragging}
                onPress={() => onUpsize(w)}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                style={[
                  styles.windowBtn,
                  {
                    backgroundColor: canUpsize ? theme.colors.surface : 'transparent',
                    opacity: canUpsize && !isThisDragging ? 1 : 0.25,
                  },
                ]}
              >
                <Ionicons
                  name="expand-outline"
                  size={14}
                  color={canUpsize ? theme.colors.primary : theme.colors.textMuted}
                />
              </TouchableOpacity>

              {/* Hide Button */}
              <TouchableOpacity
                disabled={isThisDragging}
                onPress={() => onHide(w.id)}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                style={[
                  styles.windowBtn,
                  {
                    backgroundColor: theme.isDark ? '#3D1414' : '#FEE2E2',
                    opacity: isThisDragging ? 0.25 : 1,
                  },
                ]}
              >
                <Ionicons name="eye-off-outline" size={14} color={theme.colors.danger} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Window Body (Disabled clicks in edit mode to prevent unintended actions) */}
          <View pointerEvents="none" style={styles.windowBody}>
            {renderContent(w.type)}
          </View>
        </Animated.View>
      ) : (
        <View style={{ width: '100%' }}>
          {renderContent(w.type)}
        </View>
      )}
    </View>
  );
};

export const DraggableDashboard: React.FC<DraggableDashboardProps> = ({
  isEditMode,
  onOpenAddExpense,
  onOpenExpensesTab,
  onOpenGoalsTab,
  onOpenCycleModal,
  onEditExpense,
  onDragStart,
  onDragEnd,
  drawerVisible: externalDrawerVisible,
  onCloseDrawer: externalCloseDrawer,
}) => {
  const { theme } = useAppTheme();
  const { widgets, reorderWidgets, toggleWidgetVisibility, updateWidgetSlotSize } = useData();

  const [internalDrawerVisible, setInternalDrawerVisible] = useState(false);
  const isDrawerVisible = externalDrawerVisible !== undefined ? externalDrawerVisible : internalDrawerVisible;
  const closeDrawer = externalCloseDrawer || (() => setInternalDrawerVisible(false));

  const [containerWidth, setContainerWidth] = useState(() => Dimensions.get('window').width - 32);
  const gap = 12;
  const halfWidth = Math.floor((containerWidth - gap) / 2);

  // Layout positions registry of all cards in the grid as React state
  const [itemLayouts, setItemLayouts] = useState<Record<string, { x: number; y: number; width: number; height: number }>>({});

  const handleCardLayout = useCallback((id: string, layout: { x: number; y: number; width: number; height: number }) => {
    setItemLayouts((prev) => {
      const existing = prev[id];
      if (
        existing &&
        existing.x === layout.x &&
        existing.y === layout.y &&
        existing.width === layout.width &&
        existing.height === layout.height
      ) {
        return prev;
      }
      return {
        ...prev,
        [id]: layout,
      };
    });
  }, []);

  // Dragging state
  const [draggingWidgetId, setDraggingWidgetId] = useState<string | null>(null);
  const [currentDropIndex, setCurrentDropIndex] = useState<number>(-1);

  // Animated delta for active card translation
  const [pan] = useState(() => new Animated.ValueXY({ x: 0, y: 0 }));

  // Visible widgets sorted by order
  const visibleWidgets = useMemo(() => {
    return [...widgets]
      .filter((w) => w.isVisible)
      .sort((a, b) => a.order - b.order);
  }, [widgets]);

  const draggingIndex = useMemo(() => {
    if (!draggingWidgetId) return -1;
    return visibleWidgets.findIndex((item) => item.id === draggingWidgetId);
  }, [draggingWidgetId, visibleWidgets]);

  const draggingWidget = useMemo(() => {
    if (!draggingWidgetId) return null;
    return visibleWidgets.find((item) => item.id === draggingWidgetId) || null;
  }, [draggingWidgetId, visibleWidgets]);

  // Handle Resize: Downsize
  const handleDownsize = useCallback((w: DashboardWidgetConfig) => {
    const allowed = getAllowedSizes(w.type);
    const currIdx = allowed.indexOf(w.slotSize);
    if (currIdx > 0) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // ignore
      }
      updateWidgetSlotSize(w.id, allowed[currIdx - 1]);
    }
  }, [updateWidgetSlotSize]);

  // Handle Resize: Upsize
  const handleUpsize = useCallback((w: DashboardWidgetConfig) => {
    const allowed = getAllowedSizes(w.type);
    const currIdx = allowed.indexOf(w.slotSize);
    if (currIdx >= 0 && currIdx < allowed.length - 1) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // ignore
      }
      updateWidgetSlotSize(w.id, allowed[currIdx + 1]);
    }
  }, [updateWidgetSlotSize]);

  // Handle Hide
  const handleHide = useCallback((id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
    toggleWidgetVisibility(id);
  }, [toggleWidgetVisibility]);

  // Calculate destination index based on touch position in grid
  const calculateDropIndex = useCallback((
    dx: number,
    dy: number,
    startLayout: { x: number; y: number; width: number; height: number }
  ) => {
    if (visibleWidgets.length <= 1) return 0;

    const fingerCenterX = startLayout.x + dx + startLayout.width / 2;
    const fingerCenterY = startLayout.y + dy + startLayout.height / 2;

    let closestIndex = 0;
    let minDistance = Number.MAX_VALUE;

    for (let i = 0; i < visibleWidgets.length; i++) {
      const item = visibleWidgets[i];
      const layout = itemLayouts[item.id];
      if (!layout) continue;

      const itemCenterX = layout.x + layout.width / 2;
      const itemCenterY = layout.y + layout.height / 2;

      // Distance calculation between centers
      const dist = Math.hypot(fingerCenterX - itemCenterX, fingerCenterY - itemCenterY);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    return closestIndex;
  }, [visibleWidgets, itemLayouts]);

  const onStartDrag = useCallback((w: DashboardWidgetConfig) => {
    if (!isEditMode) return;
    const initialIdx = visibleWidgets.findIndex((item) => item.id === w.id);
    setDraggingWidgetId(w.id);
    setCurrentDropIndex(initialIdx);
    pan.setValue({ x: 0, y: 0 });

    onDragStart?.();

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore
    }
  }, [isEditMode, visibleWidgets, pan, onDragStart]);

  const onMoveDrag = useCallback((dx: number, dy: number, startWidgetId: string) => {
    pan.setValue({ x: dx, y: dy });

    const startLayout = itemLayouts[startWidgetId];
    if (!startLayout) return;

    const newDropIdx = calculateDropIndex(dx, dy, startLayout);
    if (newDropIdx >= 0 && newDropIdx !== currentDropIndex) {
      setCurrentDropIndex(newDropIdx);
      try {
        Haptics.selectionAsync();
      } catch {
        // ignore
      }
    }
  }, [pan, itemLayouts, calculateDropIndex, currentDropIndex]);

  const onEndDrag = useCallback(() => {
    onDragEnd?.();

    if (draggingWidgetId && currentDropIndex >= 0 && currentDropIndex < visibleWidgets.length) {
      const fromIdx = visibleWidgets.findIndex((item) => item.id === draggingWidgetId);
      if (fromIdx !== -1 && fromIdx !== currentDropIndex) {
        const reordered = [...visibleWidgets];
        const [moved] = reordered.splice(fromIdx, 1);
        reordered.splice(currentDropIndex, 0, moved);

        const updatedFull = widgets.map((item) => {
          const matchIdx = reordered.findIndex((rw) => rw.id === item.id);
          return matchIdx !== -1 ? { ...item, order: matchIdx } : item;
        });

        reorderWidgets(updatedFull);

        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          // ignore
        }
      }
    }

    setDraggingWidgetId(null);
    setCurrentDropIndex(-1);
    pan.setValue({ x: 0, y: 0 });
  }, [onDragEnd, draggingWidgetId, currentDropIndex, visibleWidgets, widgets, reorderWidgets, pan]);

  const renderWidgetContent = useCallback((type: WidgetType) => {
    switch (type) {
      case 'safe_to_spend':
        return <SafeToSpendWidget />;
      case 'spending_summary':
        return <SpendCounterWidget />;
      case 'burnout_runway':
        return <RunwayWidget onOpenCycleModal={onOpenCycleModal} />;
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
  }, [onOpenCycleModal, onOpenAddExpense, onOpenGoalsTab, onOpenExpensesTab, onEditExpense]);

  const targetWidget = currentDropIndex >= 0 && currentDropIndex < visibleWidgets.length
    ? visibleWidgets[currentDropIndex]
    : null;
  const targetLayout = targetWidget ? itemLayouts[targetWidget.id] : null;
  const isDropIndicatorVisible = Boolean(
    draggingWidgetId &&
    currentDropIndex !== -1 &&
    currentDropIndex !== draggingIndex &&
    targetLayout
  );

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width - 32;
        if (w > 100) setContainerWidth(w);
      }}
    >
      {/* Main Grid: Responsive 2-column flexWrap */}
      <View
        style={[
          styles.grid,
          { width: '100%' },
        ]}
      >
        {visibleWidgets.map((w, index) => {
          const isThisDragging = draggingWidgetId === w.id;
          const isDropTarget = currentDropIndex === index && currentDropIndex !== draggingIndex;
          const is1x1 = w.slotSize === '1x1';
          const allowed = getAllowedSizes(w.type);
          const currIdx = allowed.indexOf(w.slotSize);
          const canDownsize = currIdx > 0;
          const canUpsize = currIdx >= 0 && currIdx < allowed.length - 1;

          return (
            <WidgetCardItem
              key={w.id}
              w={w}
              isEditMode={isEditMode}
              isThisDragging={isThisDragging}
              isDropTarget={isDropTarget}
              pan={pan}
              theme={theme}
              width={is1x1 ? halfWidth : '100%'}
              canDownsize={canDownsize}
              canUpsize={canUpsize}
              onLayout={(e: LayoutChangeEvent) => {
                handleCardLayout(w.id, e.nativeEvent.layout);
              }}
              onStartDrag={onStartDrag}
              onMoveDrag={onMoveDrag}
              onEndDrag={onEndDrag}
              onDownsize={handleDownsize}
              onUpsize={handleUpsize}
              onHide={handleHide}
              renderContent={renderWidgetContent}
            />
          );
        })}

        {/* Drop Target Indicator Overlay */}
        {isDropIndicatorVisible && targetWidget && targetLayout && (
          <View
            pointerEvents="none"
            style={[
              styles.dropIndicatorOverlay,
              {
                left: targetLayout.x,
                top: targetLayout.y,
                width: targetLayout.width,
                height: targetLayout.height,
              },
            ]}
          >
            <StripedDropPlaceholder
              width="100%"
              height={targetLayout.height}
              slotSize={draggingWidget?.slotSize || '2x1'}
              theme={theme}
            />
          </View>
        )}
      </View>

      <WidgetDrawerModal visible={isDrawerVisible} onClose={closeDrawer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    position: 'relative',
  },
  cardWrapper: {
    position: 'relative',
  },
  ghostSlot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  ghostContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  ghostIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  ghostTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dropIndicatorOverlay: {
    position: 'absolute',
    zIndex: 9000,
    elevation: 16,
  },
  windowFrame: {
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  windowTitleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  gripHandleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 6,
    paddingVertical: 2,
  },
  gripIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  windowTitleText: {
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
  },
  sizePillBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  sizePillBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  windowControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  windowBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  windowBody: {
    overflow: 'hidden',
  },
  dropPlaceholder: {
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    overflow: 'hidden',
  },
  stripedInnerBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    gap: 3,
  },
  placeholderIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  placeholderTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  placeholderSub: {
    fontSize: 10,
    fontWeight: '600',
  },
});
