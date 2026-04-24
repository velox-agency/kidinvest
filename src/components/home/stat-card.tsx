import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

interface StatCardProps {
  label: string;
  value: string;
  accent?: 'green' | 'yellow';
  colorScheme: 'light' | 'dark';
}

export function StatCard({ label, value, accent = 'green', colorScheme }: StatCardProps) {
  const colors = Colors[colorScheme];
  const accentColor = accent === 'green' ? '#2EAE63' : '#D9A21B';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.backgroundSelected,
        },
      ]}>
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={2} ellipsizeMode="tail">
        {label}
      </Text>
      <Text style={[styles.value, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 120,
    borderRadius: 24,
    borderWidth: 1,
    padding: Spacing.three,
    gap: 10,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  accentBar: {
    width: 34,
    height: 6,
    borderRadius: 999,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    lineHeight: 16,
    flexShrink: 1,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 28,
  },
});