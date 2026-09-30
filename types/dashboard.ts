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
