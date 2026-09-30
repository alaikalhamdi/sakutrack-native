import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput } from '../../components/common/AppText';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { AddExpenseModal } from '../../components/expenses/AddExpenseModal';
import { AllowanceCycleModal } from '../../components/expenses/AllowanceCycleModal';
import { EditExpenseModal } from '../../components/expenses/EditExpenseModal';
import { ManageCategoriesModal } from '../../components/expenses/ManageCategoriesModal';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Expense } from '../../types/expense';

export default function ExpensesScreen() {
  const { theme } = useAppTheme();
  const {
    expenses,
    categories,
    cycle,
    predictiveInsights,
    formatMoney,
    deleteExpense,
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [cycleModalVisible, setCycleModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [manageCategoriesVisible, setManageCategoriesVisible] = useState(false);

  const getCategory = useCallback(
    (catId: string) => categories.find((c) => c.id === catId),
    [categories]
  );

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return expenses.filter((e) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(query);
        const cat = getCategory(e.categoryId);
        const matchesCat = cat?.name.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCat) return false;
      }

      // Category
      if (selectedCatId && e.categoryId !== selectedCatId) return false;

      // Period filter
      if (filterPeriod === 'today') {
        return e.spentAt.startsWith(todayStr);
      }
      if (filterPeriod === 'week') {
        const expDate = new Date(e.spentAt);
        const diffDays = Math.ceil(Math.abs(now.getTime() - expDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }
      if (filterPeriod === 'month') {
        const expDate = new Date(e.spentAt);
        return (
          expDate.getMonth() === now.getMonth() &&
          expDate.getFullYear() === now.getFullYear()
        );
      }

      return true;
    });
  }, [expenses, searchQuery, filterPeriod, selectedCatId, getCategory]);

  const totalFilteredSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Cycle date format
  const cycleDatesFormatted = useMemo(() => {
    if (!cycle) return '';
    const start = new Date(cycle.startDate);
    const end = new Date(cycle.endDate);
    const startStr = start.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${startStr} – ${endStr}`;
  }, [cycle]);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      {/* Screen Title */}
      <View style={styles.topHeader}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text
            numberOfLines={1}
            style={[
              styles.screenTitle,
              {
                color: theme.colors.text,
                fontFamily: theme.fonts?.bold,
              },
            ]}
          >
            Expenses & Saku 💸
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.screenSubtitle, { color: theme.colors.textSecondary }]}
          >
            Monitor your student spending and allowance health
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setAddModalVisible(true)}
          style={[styles.addBtn, { backgroundColor: theme.colors.primary, flexShrink: 0 }]}
        >
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.addBtnText}>Log</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Allowance Summary Card */}
        <Card style={styles.allowanceCard}>
          <View style={styles.allowanceTop}>
            <View style={styles.allowanceTitleRow}>
              <Ionicons name="wallet-outline" size={18} color={theme.colors.accent} />
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[styles.allowanceLabel, { color: theme.colors.textSecondary }]}
                >
                  {cycle ? `${cycle.period.toUpperCase()} ALLOWANCE CYCLE` : 'NO ACTIVE ALLOWANCE'}
                </Text>
                {cycleDatesFormatted ? (
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[styles.cycleDates, { color: theme.colors.textMuted }]}
                  >
                    {cycleDatesFormatted}
                  </Text>
                ) : null}
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setCycleModalVisible(true)}
              style={[styles.editPlanBtn, { backgroundColor: theme.colors.primaryLight, flexShrink: 0 }]}
            >
              <Ionicons name={cycle ? 'pencil' : 'add'} size={12} color={theme.colors.primary} />
              <Text style={[styles.editPlanText, { color: theme.colors.primary }]}>
                {cycle ? 'Edit Plan' : 'Set Plan'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.allowanceStatsRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[styles.statValue, { color: theme.colors.text }]}
              >
                {formatMoney(predictiveInsights.remainingAllowance)}
              </Text>
              <Text numberOfLines={1} style={[styles.statSub, { color: theme.colors.textMuted }]}>
                {cycle ? `Remaining of ${formatMoney(cycle.amount)}` : 'Set allowance budget'}
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
              <Badge
                label={`${predictiveInsights.daysRemainingInCycle} ${
                  predictiveInsights.daysRemainingInCycle === 1 ? 'day' : 'days'
                } left`}
                color={theme.colors.primary}
                backgroundColor={theme.colors.surfaceSubtle}
                size="sm"
              />
              <Text style={[styles.safeDailyNote, { color: theme.colors.accent }]}>
                Safe daily: {cycle ? formatMoney(predictiveInsights.dailySafeToSpend) : '—'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderRadius: Math.min(theme.borderRadius, 14),
            },
          ]}
        >
          <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search expenses (e.g. coffee, transit, books)..."
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.searchInput, { color: theme.colors.text }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Period Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPills}
        >
          {[
            { id: 'all', label: 'All' },
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
          ].map((tab) => {
            const isSelected = filterPeriod === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setFilterPeriod(tab.id as any)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    borderWidth: 1,
                    borderRadius: 16,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Category Pills & Manage Launcher */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPills}
        >
          {/* Manage Categories Action */}
          <TouchableOpacity
            onPress={() => setManageCategoriesVisible(true)}
            style={[
              styles.catPill,
              {
                backgroundColor: theme.colors.surfaceSubtle,
                borderColor: theme.colors.primary,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderRadius: 12,
              },
            ]}
          >
            <Ionicons name="options-outline" size={14} color={theme.colors.primary} />
            <Text style={[styles.catPillText, { color: theme.colors.primary, fontWeight: '700' }]}>
              Manage
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedCatId(null)}
            style={[
              styles.catPill,
              {
                backgroundColor: !selectedCatId ? theme.colors.primaryLight : theme.colors.surface,
                borderColor: !selectedCatId ? theme.colors.primary : theme.colors.border,
                borderWidth: 1,
                borderRadius: 12,
              },
            ]}
          >
            <Text
              style={[
                styles.catPillText,
                { color: !selectedCatId ? theme.colors.primary : theme.colors.textSecondary },
              ]}
            >
              All Categories
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => {
            const isSelected = selectedCatId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCatId(isSelected ? null : cat.id)}
                style={[
                  styles.catPill,
                  {
                    backgroundColor: isSelected ? theme.colors.primaryLight : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    borderWidth: 1,
                    borderRadius: 12,
                  },
                ]}
              >
                <View style={[styles.catPillDot, { backgroundColor: cat.color }]} />
                <Text
                  style={[
                    styles.catPillText,
                    { color: isSelected ? theme.colors.primary : theme.colors.textSecondary },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Spend Total for current filter */}
        <View style={styles.totalBar}>
          <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
            Showing {filteredExpenses.length} transactions (tap to edit)
          </Text>
          <Text style={[styles.totalAmount, { color: theme.colors.text }]}>
            Total: {formatMoney(totalFilteredSpent)}
          </Text>
        </View>

        {/* Transaction List */}
        {filteredExpenses.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🍃</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No expenses found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textMuted }]}>
              Try adjusting your search or filters, or log a new expense!
            </Text>
          </View>
        ) : (
          <View style={styles.expenseList}>
            {filteredExpenses.map((item) => {
              const cat = getCategory(item.categoryId);
              const date = new Date(item.spentAt);
              const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => setEditingExpense(item)}
                >
                  <Card style={styles.expenseItem}>
                    <View style={styles.itemMainRow}>
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
                            name={(cat?.icon as any) || 'pricetag'}
                            size={18}
                            color={cat?.color || theme.colors.primary}
                          />
                        </View>

                        <View style={styles.itemDetails}>
                          <View style={styles.titleLine}>
                            <Text
                              style={[
                                styles.itemTitle,
                                {
                                  color: theme.colors.text,
                                  fontFamily: theme.fonts?.semiBold,
                                },
                              ]}
                            >
                              {item.title}
                            </Text>
                          </View>
                          <Text style={[styles.itemSub, { color: theme.colors.textMuted }]}>
                            {dateStr} • {cat?.name || 'General'}
                            {item.note ? ` • "${item.note}"` : ''}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.itemRight}>
                        <Text
                          style={[
                            styles.itemPrice,
                            {
                              color: theme.colors.text,
                              fontFamily: theme.fonts?.bold,
                            },
                          ]}
                        >
                          -{formatMoney(item.amount)}
                        </Text>
                        <TouchableOpacity
                          onPress={() => deleteExpense(item.id)}
                          style={styles.deleteBtn}
                        >
                          <Ionicons name="trash-outline" size={15} color={theme.colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Expense Modal */}
      <AddExpenseModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        visible={Boolean(editingExpense)}
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
      />

      {/* Allowance Setup Modal */}
      <AllowanceCycleModal
        visible={cycleModalVisible}
        onClose={() => setCycleModalVisible(false)}
      />

      {/* Manage Categories Modal */}
      <ManageCategoriesModal
        visible={manageCategoriesVisible}
        onClose={() => setManageCategoriesVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  allowanceCard: {
    marginTop: 10,
    marginBottom: 14,
    padding: 14,
  },
  allowanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  allowanceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  allowanceLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cycleDates: {
    fontSize: 10,
    marginTop: 1,
  },
  editPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editPlanText: {
    fontSize: 11,
    fontWeight: '700',
  },
  allowanceStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statSub: {
    fontSize: 11,
    marginTop: 2,
  },
  safeDailyNote: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  filterPills: {
    gap: 8,
    paddingBottom: 10,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterPillText: {
    fontSize: 12,
  },
  categoryPills: {
    gap: 8,
    paddingBottom: 12,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  catPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 12,
  },
  totalAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 240,
  },
  expenseList: {
    gap: 10,
  },
  expenseItem: {
    padding: 12,
  },
  itemMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 11,
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
  },
  deleteBtn: {
    padding: 2,
  },
});
