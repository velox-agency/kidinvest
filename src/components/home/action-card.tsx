import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

interface ActionCardProps {
  title: string;
  subtitle: string;
  buttonLabel: string;
  onPress: () => void;
  colorScheme: 'light' | 'dark';
  accent: 'green' | 'yellow';
}

export function ActionCard({
  title,
  subtitle,
  buttonLabel,
  onPress,
  colorScheme,
  accent,
}: ActionCardProps) {
  const colors = Colors[colorScheme];
  const accentColor = accent === 'green' ? '#2EAE63' : '#D9A21B';
  const accentBackground = accent === 'green' ? 'rgba(46, 174, 99, 0.14)' : 'rgba(217, 162, 27, 0.16)';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.backgroundSelected,
          opacity: pressed ? 0.94 : 1,
        },
      ]}>
      <View style={[styles.iconMark, { backgroundColor: accentBackground }]}>
        <View style={[styles.iconDot, { backgroundColor: accentColor }]} />
      </View>

      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2} ellipsizeMode="tail">
        {title}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2} ellipsizeMode="tail">
        {subtitle}
      </Text>

      <View style={[styles.cta, { backgroundColor: accentColor }]}>
        <Text style={styles.ctaText} numberOfLines={1} ellipsizeMode="tail">
          {buttonLabel}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 228,
    borderRadius: 28,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.two,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  iconMark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 28,
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    flexShrink: 1,
  },
  cta: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: Spacing.one,
    height: 36,
    justifyContent: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});