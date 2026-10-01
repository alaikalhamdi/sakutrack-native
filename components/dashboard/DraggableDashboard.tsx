import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  EDIT_HEADER_HEIGHT,
  WidgetSlotSize,
  WidgetType,
  getAllowedSizes,
  getWidgetSlotHeight,
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
 * Shown at the freed destination slot to indicate where the card will land.
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
          height: height,
          borderColor: theme.colors.primary,
          backgroundColor: theme.isDark ? 'rgba(59, 130, 246, 0.16)' : 'rgba(37, 99, 235, 0.10)',
          borderRadius: Math.min(theme.borderRadius, 14),
        },
      ]}
    >
      <View style={[styles.stripedInnerBox, { borderColor: theme.colors.primary + '60' }]}>
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
  pan: Animated.ValueXY;
  targetOffset: { x: number; y: number };
  theme: ThemeConfig;
  width: number | string;
  height: number;
  baseCardHeight: number;
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
  pan,
  targetOffset,
  theme,
  width,
  height,
  baseCardHeight,
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
  // Smooth spring shift animation when cards move out of the way for reordering
  const [shiftAnim] = useState(() => new Animated.ValueXY({ x: 0, y: 0 }));

  useEffect(() => {
    if (isThisDragging) {
      shiftAnim.setValue({ x: 0, y: 0 });
      return;
    }
    Animated.spring(shiftAnim, {
      toValue: targetOffset,
      friction: 9,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [targetOffset, isThisDragging, shiftAnim]);

  // Stable PanResponder: callbacks have stable references during drag so PanResponder is never recreated
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

  let transformStyle: any[] = [];
  if (isThisDragging) {
    transformStyle = [
      ...pan.getTranslateTransform(),
      { scale: 1.04 },
    ];
  } else {
    transformStyle = shiftAnim.getTranslateTransform();
  }

  return (
    <View
      style={[
        styles.cardWrapper,
        {
          width: width as any,
          height: height,
          zIndex: isThisDragging ? 9999 : 1,
          elevation: isThisDragging ? 24 : 1,
        },
      ]}
      onLayout={onLayout}
    >
      {isEditMode ? (
        <Animated.View
          style={[
            styles.windowFrame,
            {
              height: height,
              backgroundColor: theme.colors.surface,
              borderColor: isThisDragging ? theme.colors.primary : theme.colors.border,
              borderWidth: isThisDragging ? 2 : (theme.borderWidth > 0 ? 1 : 0.8),
              borderRadius: theme.borderRadius,
              transform: transformStyle,
            },
            isThisDragging && {
              shadowColor: theme.colors.primary,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
              elevation: 24,
            },
          ]}
        >
          {/* Grip Holder / Window Titlebar */}
          <View style={styles.windowTitleBar}>
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

          {/* Window Body: maintains full baseCardHeight so content is never squeezed */}
          <View pointerEvents="none" style={[styles.windowBody, { height: baseCardHeight }]}>
            {renderContent(w.type)}
          </View>
        </Animated.View>
      ) : (
        <View style={{ width: '100%', height: height }}>
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
  const currentDropIndexRef = useRef(-1);

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
    currentDropIndexRef.current = initialIdx;
    pan.setValue({ x: 0, y: 0 });

    onDragStart?.();

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore
    }
  }, [isEditMode, visibleWidgets, pan, onDragStart]);

  // onMoveDrag has completely stable dependencies so PanResponder is never disrupted mid-drag
  const onMoveDrag = useCallback((dx: number, dy: number, startWidgetId: string) => {
    pan.setValue({ x: dx, y: dy });

    const startLayout = itemLayouts[startWidgetId];
    if (!startLayout) return;

    const newDropIdx = calculateDropIndex(dx, dy, startLayout);
    if (newDropIdx >= 0) {
      currentDropIndexRef.current = newDropIdx;
      setCurrentDropIndex((prev) => {
        if (prev !== newDropIdx) {
          try {
            Haptics.selectionAsync();
          } catch {
            // ignore
          }
          return newDropIdx;
        }
        return prev;
      });
    }
  }, [pan, itemLayouts, calculateDropIndex]);

  // Drop handler: Reorders widgets using arrayMove (splice) and correctly updates order indices
  const onEndDrag = useCallback(() => {
    onDragEnd?.();

    const fromIdx = visibleWidgets.findIndex((item) => item.id === draggingWidgetId);
    const targetIdx = currentDropIndexRef.current;

    if (fromIdx !== -1 && targetIdx !== -1 && fromIdx !== targetIdx) {
      // Reorder using standard array move (splice): shifts items between fromIdx and targetIdx
      const reordered = [...visibleWidgets];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(targetIdx, 0, moved);

      // Reconstruct the full widgets list maintaining the new order for visible widgets
      const hiddenWidgets = widgets.filter((w) => !w.isVisible);
      const updatedFull = [...reordered, ...hiddenWidgets].map((w, idx) => ({
        ...w,
        order: idx,
      }));

      reorderWidgets(updatedFull);

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // ignore
      }
    }

    setDraggingWidgetId(null);
    setCurrentDropIndex(-1);
    currentDropIndexRef.current = -1;
    pan.setValue({ x: 0, y: 0 });
  }, [onDragEnd, draggingWidgetId, visibleWidgets, widgets, reorderWidgets, pan]);

  // Calculate the shift offset for each card in the grid to make room for the dragged card
  const getTargetOffset = useCallback((index: number) => {
    if (
      !draggingWidgetId ||
      currentDropIndex === -1 ||
      currentDropIndex === draggingIndex ||
      draggingIndex === -1
    ) {
      return { x: 0, y: 0 };
    }

    // Dragged card itself is moved by pan, not targetOffset
    if (index === draggingIndex) {
      return { x: 0, y: 0 };
    }

    // Dragging downwards: cards between draggingIndex < index <= currentDropIndex shift UP to index - 1
    if (draggingIndex < currentDropIndex) {
      if (index > draggingIndex && index <= currentDropIndex) {
        const targetSlot = itemLayouts[visibleWidgets[index - 1]?.id];
        const currentSlot = itemLayouts[visibleWidgets[index]?.id];
        if (targetSlot && currentSlot) {
          return {
            x: targetSlot.x - currentSlot.x,
            y: targetSlot.y - currentSlot.y,
          };
        }
      }
    }

    // Dragging upwards: cards between currentDropIndex <= index < draggingIndex shift DOWN to index + 1
    if (draggingIndex > currentDropIndex) {
      if (index >= currentDropIndex && index < draggingIndex) {
        const targetSlot = itemLayouts[visibleWidgets[index + 1]?.id];
        const currentSlot = itemLayouts[visibleWidgets[index]?.id];
        if (targetSlot && currentSlot) {
          return {
            x: targetSlot.x - currentSlot.x,
            y: targetSlot.y - currentSlot.y,
          };
        }
      }
    }

    return { x: 0, y: 0 };
  }, [draggingWidgetId, currentDropIndex, draggingIndex, visibleWidgets, itemLayouts]);

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

  const freedSlotWidget = currentDropIndex >= 0 && currentDropIndex < visibleWidgets.length
    ? visibleWidgets[currentDropIndex]
    : null;
  const freedSlotLayout = freedSlotWidget ? itemLayouts[freedSlotWidget.id] : null;
  const isDropIndicatorVisible = Boolean(
    draggingWidgetId &&
    currentDropIndex !== -1 &&
    currentDropIndex !== draggingIndex &&
    freedSlotLayout
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
          const is1x1 = w.slotSize === '1x1';
          const allowed = getAllowedSizes(w.type);
          const currIdx = allowed.indexOf(w.slotSize);
          const canDownsize = currIdx > 0;
          const canUpsize = currIdx >= 0 && currIdx < allowed.length - 1;
          const targetOffset = getTargetOffset(index);
          const cardHeight = getWidgetSlotHeight(w.slotSize, isEditMode);
          const baseCardHeight = getWidgetSlotHeight(w.slotSize, false);

          return (
            <WidgetCardItem
              key={w.id}
              w={w}
              isEditMode={isEditMode}
              isThisDragging={isThisDragging}
              pan={pan}
              targetOffset={targetOffset}
              theme={theme}
              width={is1x1 ? halfWidth : '100%'}
              height={cardHeight}
              baseCardHeight={baseCardHeight}
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

        {/* Drop Target Indicator Overlay (Vacated slot with striped outline) */}
        {isDropIndicatorVisible && freedSlotWidget && freedSlotLayout && (
          <View
            pointerEvents="none"
            style={[
              styles.dropIndicatorOverlay,
              {
                left: freedSlotLayout.x,
                top: freedSlotLayout.y,
                width: freedSlotLayout.width,
                height: freedSlotLayout.height,
              },
            ]}
          >
            <StripedDropPlaceholder
              width="100%"
              height={freedSlotLayout.height}
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
  dropIndicatorOverlay: {
    position: 'absolute',
    zIndex: 500,
    elevation: 8,
  },
  windowFrame: {
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  windowTitleBar: {
    height: EDIT_HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
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
