import { I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';

interface HomeHeaderProps {
  title: string;
  colorScheme: 'light' | 'dark';
  avatarEmoji?: string;
  onAvatarPress?: () => void;
}

export function HomeHeader({
  title,
  colorScheme,
  avatarEmoji,
  onAvatarPress,
}: HomeHeaderProps) {
  const colors = Colors[colorScheme];
  const isRTL = I18nManager.isRTL;

  return (
    <View style={[styles.container, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <View style={styles.textBlock}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
          numberOfLines={2}
          ellipsizeMode="tail">
          {title}
        </Text>
      </View>

      {avatarEmoji && onAvatarPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={onAvatarPress}
          style={({ pressed }) => [
            styles.avatarButton,
            {
              backgroundColor: colors.backgroundElement,
              opacity: pressed ? 0.82 : 1,
            },
          ]}>
          <Text style={[styles.avatarEmoji, { color: colors.text }]}>{avatarEmoji}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.three,
    height: 84,
  },
  textBlock: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
    height: 84,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 24,
    flexShrink: 1,
  },
  avatarButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  avatarEmoji: {
    fontSize: 22,
  },
});