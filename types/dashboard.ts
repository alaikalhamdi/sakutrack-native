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

