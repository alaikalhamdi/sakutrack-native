import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useData } from '../../context/DataContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Text } from '../common/AppText';
import { Card } from '../common/Card';

interface QuickAddProps {
  onOpenFullModal: () => void;
}

export const QuickAddLauncherWidget: React.FC<QuickAddProps> = ({ onOpenFullModal }) => {
  const { theme } = useAppTheme();
  const { addExpense, currencyCode } = useData();

  const isUSD = currencyCode === 'USD';

  const quickItems = isUSD
    ? [
        { title: '☕ Coffee', amount: 5.5, cat: 'food_drinks' },
        { title: '🍔 Campus Lunch', amount: 12.0, cat: 'food_drinks' },
        { title: '🚌 Transit', amount: 3.5, cat: 'transport' },
        { title: '📚 Print / Study', amount: 4.0, cat: 'campus_books' },
      ]
    : [
        { title: '☕ Kopi / Teh', amount: 20000, cat: 'food_drinks' },
        { title: '🍛 Makan Siang', amount: 25000, cat: 'food_drinks' },
        { title: '🛵 Ojol / Transit', amount: 15000, cat: 'transport' },
        { title: '📄 Fotokopi / Print', amount: 10000, cat: 'campus_books' },
      ];

  const handleQuickAdd = async (item: (typeof quickItems)[0]) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore web fallback
    }

    await addExpense({
      categoryId: item.cat,
      title: item.title,
      amount: item.amount,
      spentAt: new Date().toISOString(),
    });
  };

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Ionicons name="flash-outline" size={16} color={theme.colors.accent} />
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.title, { color: theme.colors.textSecondary }]}
          >
            SPEED LOG (ONE-TAP)
          </Text>
        </View>

        <TouchableOpacity
          onPress={onOpenFullModal}
          style={[styles.customBtn, { backgroundColor: theme.colors.primaryLight }]}
        >
          <Ionicons name="add" size={16} color={theme.colors.primary} />
          <Text style={[styles.customBtnText, { color: theme.colors.primary }]}>Custom</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chipsGrid}>
        {quickItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            activeOpacity={0.7}
            onPress={() => handleQuickAdd(item)}
            style={[
              styles.chip,
              {
                backgroundColor: theme.colors.surfaceSubtle,
                borderColor: theme.colors.border,
                borderWidth: theme.borderWidth > 0 ? 1 : 0,
                borderRadius: Math.min(theme.borderRadius, 14),
              },
            ]}
          >
            <Text style={[styles.chipText, { color: theme.colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.chipAmount, { color: theme.colors.accent }]}>
              +{isUSD ? `$${item.amount}` : `${Math.round(item.amount / 1000)}k`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  customBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 2,
    flexShrink: 0,
  },
  customBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    marginRight: 4,
  },
  chipAmount: {
    fontSize: 11,
    fontWeight: '700',
  },
});
