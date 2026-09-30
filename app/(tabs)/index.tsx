import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { DraggableDashboard } from '../../components/dashboard/DraggableDashboard';
import { AddExpenseModal } from '../../components/expenses/AddExpenseModal';
import { EditExpenseModal } from '../../components/expenses/EditExpenseModal';
import { ThemeCustomizerModal } from '../../components/theme/ThemeCustomizerModal';
import { useAppTheme } from '../../context/ThemeContext';
import { Expense } from '../../types/expense';

export default function DashboardScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [addExpenseVisible, setAddExpenseVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      {/* App Header */}
      <Header
        onOpenThemeModal={() => setThemeModalVisible(true)}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
      />

      {/* Main Draggable Dashboard Body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <DraggableDashboard
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode(!isEditMode)}
          onOpenAddExpense={() => setAddExpenseVisible(true)}
          onOpenExpensesTab={() => router.push('/(tabs)/expenses')}
          onOpenGoalsTab={() => router.push('/(tabs)/goals')}
          onEditExpense={setEditingExpense}
        />
      </ScrollView>

      {/* Floating Action Button (FAB) */}
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

      {/* Theme Customizer Studio */}
      <ThemeCustomizerModal
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
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
