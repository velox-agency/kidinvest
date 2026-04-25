import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

import { Spacing } from '@/constants/theme';

interface GameCardProps {
  title: string;
  description: string;
  onPress: () => void;
}

function ControllerIcon() {
  return (
    <Svg width={124} height={96} viewBox="0 0 124 96" fill="none">
      <Defs>
        <SvgLinearGradient id="game-body" x1="20" y1="18" x2="104" y2="84" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#A7F3D0" />
          <Stop offset="0.5" stopColor="#34D399" />
          <Stop offset="1" stopColor="#065F46" />
        </SvgLinearGradient>
        <SvgLinearGradient id="game-body-dark" x1="26" y1="24" x2="96" y2="76" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#E5FFF3" stopOpacity="0.95" />
          <Stop offset="1" stopColor="#10B981" stopOpacity="0.9" />
        </SvgLinearGradient>
      </Defs>
      <Path
        d="M29 48C29 34.745 39.745 24 53 24H71C84.255 24 95 34.745 95 48V55.5C95 68.479 84.479 79 71.5 79H52.5C39.521 79 29 68.479 29 55.5V48Z"
        fill="url(#game-body)"
        opacity={0.28}
      />
      <Path
        d="M24 46.5C24 31.82 35.82 20 50.5 20H73.5C88.18 20 100 31.82 100 46.5V56.5C100 71.18 88.18 83 73.5 83H50.5C35.82 83 24 71.18 24 56.5V46.5Z"
        fill="url(#game-body-dark)"
      />
      <Path
        d="M39 54C39 49.582 42.582 46 47 46H54C58.418 46 62 49.582 62 54V61C62 65.418 58.418 69 54 69H47C42.582 69 39 65.418 39 61V54Z"
        fill="#08131A"
        opacity={0.6}
      />
      <Circle cx="50.5" cy="58" r="2.4" fill="#D1FAE5" />
      <Circle cx="82" cy="49" r="5.2" fill="#D1FAE5" opacity={0.95} />
      <Circle cx="82" cy="49" r="2.1" fill="#0B0F1A" />
      <Path d="M77 49H87" stroke="#0B0F1A" strokeWidth="2.6" strokeLinecap="round" />
      <Path d="M82 44V54" stroke="#0B0F1A" strokeWidth="2.6" strokeLinecap="round" />
      <Path d="M67 40L74 43" stroke="#D1FAE5" strokeWidth="2.8" strokeLinecap="round" />
      <Path d="M70 34L74.5 38.5" stroke="#D1FAE5" strokeWidth="2.8" strokeLinecap="round" />
      <Path d="M69 51L75 48" stroke="#D1FAE5" strokeWidth="2.8" strokeLinecap="round" />
      <Path d="M35 44C35 44 38 40 43 39" stroke="#D1FAE5" strokeWidth="2.2" strokeLinecap="round" opacity={0.65} />
      <Path d="M67 59C67 59 74 63 84 63" stroke="#D1FAE5" strokeWidth="2.2" strokeLinecap="round" opacity={0.45} />
    </Svg>
  );
}

export function GameCard({ title, description, onPress }: GameCardProps) {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;
  const floatAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [floatAnim]);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardShell,
        {
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}>
      <LinearGradient
        colors={['#0F2A1E', '#1F8A5B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        <View style={styles.glowTopLeft} />
        <View style={styles.borderGlow} />
        <Animated.View style={[styles.iconWrap, { transform: [{ translateY: floatAnim }] }]}>
          <ControllerIcon />
        </Animated.View>

        <View style={styles.textBlock}>
          <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
            {title}
          </Text>
          <Text style={[styles.description, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
            {description}
          </Text>
        </View>

        <LinearGradient
          colors={['#22C55E', '#16A34A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cta}>
          <Text style={styles.ctaText}>{t('home.playNow')}</Text>
        </LinearGradient>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    flex: 1,
    minHeight: 258,
    borderRadius: 24,
    shadowColor: '#22C55E',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    padding: Spacing.four,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    gap: Spacing.two,
  },
  glowTopLeft: {
    position: 'absolute',
    top: -36,
    left: -22,
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  borderGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  iconWrap: {
    alignSelf: 'center',
    marginTop: -6,
  },
  textBlock: {
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  cta: {
    alignSelf: 'flex-start',
    minWidth: 160,
    paddingHorizontal: Spacing.three,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
