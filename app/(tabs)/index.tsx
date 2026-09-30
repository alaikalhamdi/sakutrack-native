import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/common/AppText';
import { Header } from '../../components/common/Header';
import { DraggableDashboard } from '../../components/dashboard/DraggableDashboard';
import { AddExpenseModal } from '../../components/expenses/AddExpenseModal';
import { AllowanceCycleModal } from '../../components/expenses/AllowanceCycleModal';
import { EditExpenseModal } from '../../components/expenses/EditExpenseModal';
import { ThemeCustomizerModal } from '../../components/theme/ThemeCustomizerModal';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Expense } from '../../types/expense';

export default function DashboardScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { isDashboardEditing, setIsDashboardEditing } = useData();

  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [addExpenseVisible, setAddExpenseVisible] = useState(false);
  const [cycleModalVisible, setCycleModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      {/* App Header (Retracts brand & greeting when in edit mode) */}
      <Header
        onOpenThemeModal={() => setThemeModalVisible(true)}
        isEditMode={isDashboardEditing}
        onToggleEditMode={() => setIsDashboardEditing(!isDashboardEditing)}
        onOpenCatalogue={() => setDrawerVisible(true)}
      />

      {/* Main Draggable Dashboard Body */}
      <ScrollView
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isDashboardEditing && styles.scrollContentEditing,
        ]}
      >
        <DraggableDashboard
          isEditMode={isDashboardEditing}
          onToggleEditMode={() => setIsDashboardEditing(!isDashboardEditing)}
          onOpenAddExpense={() => setAddExpenseVisible(true)}
          onOpenExpensesTab={() => router.push('/(tabs)/expenses')}
          onOpenGoalsTab={() => router.push('/(tabs)/goals')}
          onOpenCycleModal={() => setCycleModalVisible(true)}
          onEditExpense={setEditingExpense}
          onDragStart={() => setScrollEnabled(false)}
          onDragEnd={() => setScrollEnabled(true)}
          drawerVisible={drawerVisible}
          onOpenDrawer={() => setDrawerVisible(true)}
          onCloseDrawer={() => setDrawerVisible(false)}
        />
      </ScrollView>

      {/* Floating Action Button (FAB) - Hidden during editing */}
      {!isDashboardEditing && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setAddExpenseVisible(true)}
          style={[
            styles.fab,
            {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.border,
              borderWidth: theme.borderWidth > 0 ? 1.5 : 0,
              shadowColor: theme.colors.primary,
            },
          ]}
        >
          <Ionicons name="add" size={26} color="#FFFFFF" />
          <Text style={styles.fabText}>Log Saku</Text>
        </TouchableOpacity>
      )}

      {/* Theme Customizer Studio */}
      <ThemeCustomizerModal
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
      />

      {/* Allowance Cycle Setup Modal */}
      <AllowanceCycleModal
        visible={cycleModalVisible}
        onClose={() => setCycleModalVisible(false)}
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        visible={addExpenseVisible}
        onClose={() => setAddExpenseVisible(false)}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        visible={Boolean(editingExpense)}
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 110,
  },
  scrollContentEditing: {
    paddingBottom: 36,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 28,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
