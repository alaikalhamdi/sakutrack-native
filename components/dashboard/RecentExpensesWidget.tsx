import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Text } from '../common/AppText';
import { Expense } from '../../types/expense';
import { Card } from '../common/Card';

interface RecentExpensesProps {
  onOpenExpensesTab: () => void;
  onOpenAddModal: () => void;
  onEditExpense?: (expense: Expense) => void;
}

export const RecentExpensesWidget: React.FC<RecentExpensesProps> = ({
  onOpenExpensesTab,
  onOpenAddModal,
  onEditExpense,
}) => {
  const { theme } = useAppTheme();
  const { expenses, categories, formatMoney, deleteExpense } = useData();

  const recent = expenses.slice(0, 4);

  const getCategory = (catId: string) => {
    return categories.find((c) => c.id === catId);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Ionicons name="receipt-outline" size={16} color={theme.colors.accent} />
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.title, { color: theme.colors.textSecondary }]}
          >
            RECENT EXPENSES
          </Text>
        </View>

        <TouchableOpacity onPress={onOpenExpensesTab} style={{ flexShrink: 0 }}>
          <Text style={[styles.viewAll, { color: theme.colors.primary }]}>View All →</Text>
        </TouchableOpacity>
      </View>

      {recent.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            No expenses yet! Tap below to log one.
          </Text>
          <TouchableOpacity
            onPress={onOpenAddModal}
            style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.addBtnText}>+ Log Expense</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.list}>
          {recent.map((item) => {
            const cat = getCategory(item.categoryId);
            const date = new Date(item.spentAt);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => onEditExpense?.(item)}
                style={[
                  styles.itemRow,
                  { borderBottomColor: theme.colors.border },
                ]}
              >
                <View style={styles.itemLeft}>
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: cat ? cat.color + '22' : theme.colors.surfaceSubtle,
                        borderColor: cat ? cat.color : theme.colors.border,
                        borderWidth: theme.borderWidth > 0 ? 1 : 0,
                      },
                    ]}
                  >
                    <Ionicons
                      name={(cat?.icon as any) || 'pricetag-outline'}
                      size={16}
                      color={cat?.color || theme.colors.primary}
                    />
                  </View>

                  <View style={styles.itemTextWrap}>
                    <View style={styles.titleLine}>
                      <Text
                        numberOfLines={1}
                        style={[styles.itemTitle, { color: theme.colors.text }]}
                      >
                        {item.title}
                      </Text>
                    </View>
                    <Text style={[styles.itemDate, { color: theme.colors.textMuted }]}>
                      {timeStr} • {cat?.name || 'General'}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemRight}>
                  <Text
                    style={[
                      styles.itemAmount,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.fonts?.bold,
                      },
                    ]}
                  >
                    -{formatMoney(item.amount)}
                  </Text>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      deleteExpense(item.id);
                    }}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={13} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    flexShrink: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    gap: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemTextWrap: {
    flex: 1,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  itemDate: {
    fontSize: 11,
    marginTop: 1,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 2,
  },
});
