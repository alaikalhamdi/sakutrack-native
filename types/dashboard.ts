export type WidgetType =
  | 'safe_to_spend'
  | 'burnout_runway'
  | 'spending_summary'
  | 'recent_transactions'
  | 'category_donut'
  | 'savings_carousel'
  | 'quick_add_launcher';

export type WidgetSlotSize = '1x1' | '2x1' | '2x2';

export interface DashboardWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  slotSize: WidgetSlotSize;
  isVisible: boolean;
  order: number;
}

export const DASHBOARD_GRID_GAP = 12;
export const WIDGET_BASE_ROW_HEIGHT = 185;
export const EDIT_HEADER_HEIGHT = 38;

export const WIDGET_SLOT_HEIGHTS: Record<WidgetSlotSize, number> = {
  '1x1': WIDGET_BASE_ROW_HEIGHT,
  '2x1': WIDGET_BASE_ROW_HEIGHT,
  '2x2': WIDGET_BASE_ROW_HEIGHT * 2 + DASHBOARD_GRID_GAP,
};

export function getWidgetSlotHeight(slotSize: WidgetSlotSize, isEditMode = false): number {
  const base = WIDGET_SLOT_HEIGHTS[slotSize] || WIDGET_BASE_ROW_HEIGHT;
  return isEditMode ? base + EDIT_HEADER_HEIGHT : base;
}

export const WIDGET_ALLOWED_SIZES: Record<WidgetType, WidgetSlotSize[]> = {
  safe_to_spend: ['1x1', '2x1'],
  spending_summary: ['1x1', '2x1'],
  burnout_runway: ['2x1', '2x2'],
  quick_add_launcher: ['2x1', '2x2'],
  savings_carousel: ['2x1', '2x2'],
  category_donut: ['2x1', '2x2'],
  recent_transactions: ['2x1', '2x2'],
};

export function getAllowedSizes(type: WidgetType): WidgetSlotSize[] {
  return WIDGET_ALLOWED_SIZES[type] || ['2x1', '2x2'];
}

export function isSizeAllowed(type: WidgetType, size: WidgetSlotSize): boolean {
  const allowed = getAllowedSizes(type);
  return allowed.includes(size);
}
