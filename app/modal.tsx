import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/common/Card';
import { useAppTheme } from '../context/ThemeContext';

export default function GuideModalScreen() {
  const { theme } = useAppTheme();

  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🎒</Text>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                fontFamily: theme.fontStyle === 'mono' ? 'Courier' : undefined,
              },
            ]}
          >
            About SakuTrack
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            The fun, customizable expense tracker built for students
          </Text>
        </View>

        {/* Card 1: Safe-to-Spend */}
        <Card style={styles.guideCard}>
          <View style={styles.guideTop}>
            <Ionicons name="sparkles" size={20} color={theme.colors.accent} />
            <Text style={[styles.guideTitle, { color: theme.colors.text }]}>
              Daily Safe-to-Spend Runway
            </Text>
          </View>
          <Text style={[styles.guideBody, { color: theme.colors.textSecondary }]}>
            SakuTrack recalculates your daily spending allowance every day. If you splurge on a boba
            run today, the remaining days automatically adjust to keep you safe until next month&apos;s
            allowance!
          </Text>
        </Card>

        {/* Card 2: Broke-Meter */}
        <Card style={styles.guideCard}>
          <View style={styles.guideTop}>
            <Ionicons name="speedometer-outline" size={20} color="#FF5722" />
            <Text style={[styles.guideTitle, { color: theme.colors.text }]}>
              The Student Broke-Meter
            </Text>
          </View>
          <Text style={[styles.guideBody, { color: theme.colors.textSecondary }]}>
            Track your financial vibe from 💎 <Text style={{ fontWeight: '700' }}>Sultan Mode</Text>{' '}
            down to 🍜 <Text style={{ fontWeight: '700' }}>Indomie Alert</Text> and 🚨{' '}
            <Text style={{ fontWeight: '700' }}>Survival Protocol</Text>. Never get caught surprised
            at the end of the month again.
          </Text>
        </Card>

        {/* Card 3: Custom Themes & Draggable Cards */}
        <Card style={styles.guideCard}>
          <View style={styles.guideTop}>
            <Ionicons name="color-palette-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.guideTitle, { color: theme.colors.text }]}>
              Personalize Your Dashboard
            </Text>
          </View>
          <Text style={[styles.guideBody, { color: theme.colors.textSecondary }]}>
            Switch between curated aesthetics (*Matcha Cozy*, *Retro Arcade*, *Cyber Neon*, *Clean
            Campus*) or use the DIY customizer to tailor colors, font styles, and card corner radii.
            Long press or tap the grid icon to reorder and toggle cards!
          </Text>
        </Card>

        {/* Card 4: Supabase Sync */}
        <Card style={styles.guideCard}>
          <View style={styles.guideTop}>
            <Ionicons name="cloud-outline" size={20} color="#06D6A0" />
            <Text style={[styles.guideTitle, { color: theme.colors.text }]}>
              Local-First + Supabase Cloud
            </Text>
          </View>
          <Text style={[styles.guideBody, { color: theme.colors.textSecondary }]}>
            SakuTrack starts in lightning-fast offline mode with local storage. Whenever you want to
            backup your data or publish your shareable profile web link, simply link your Supabase
            account in the Profile tab.
          </Text>
        </Card>
      </ScrollView>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    gap: 14,
  },
  header: {
    alignItems: 'center',
    marginVertical: 14,
  },
  emoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  guideCard: {
    padding: 16,
  },
  guideTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  guideBody: {
    fontSize: 13,
    lineHeight: 19,
  },
});
