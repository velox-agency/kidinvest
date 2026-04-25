import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

import { Spacing } from '@/constants/theme';

interface XPProgressCardProps {
  level: number;
  currentXP: number;
  maxXP: number;
}

function ChestIcon() {
  return (
    <Svg width={92} height={80} viewBox="0 0 92 80" fill="none">
      <Defs>
        <SvgLinearGradient id="chest-body" x1="20" y1="18" x2="72" y2="66" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFF7C2" />
          <Stop offset="0.52" stopColor="#FACC15" />
          <Stop offset="1" stopColor="#B45309" />
        </SvgLinearGradient>
        <SvgLinearGradient id="chest-lid" x1="18" y1="10" x2="74" y2="40" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFDE8" />
          <Stop offset="1" stopColor="#F59E0B" />
        </SvgLinearGradient>
      </Defs>
      <Path d="M20 29C20 24.582 23.582 21 28 21H64C68.418 21 72 24.582 72 29V35H20V29Z" fill="url(#chest-lid)" />
      <Path d="M18 35H74V55C74 60.523 69.523 65 64 65H28C22.477 65 18 60.523 18 55V35Z" fill="url(#chest-body)" />
      <Path d="M45 22V65" stroke="#7C5200" strokeWidth="4" strokeLinecap="round" opacity={0.6} />
      <Path d="M18 43H74" stroke="#7C5200" strokeWidth="4" strokeLinecap="round" opacity={0.42} />
      <Path d="M32 45H58" stroke="#FFF7CC" strokeWidth="3" strokeLinecap="round" opacity={0.56} />
      <Path d="M30 27H62" stroke="#FFF7CC" strokeWidth="4" strokeLinecap="round" opacity={0.28} />
    </Svg>
  );
}

export function XPProgressCard({ level, currentXP, maxXP }: XPProgressCardProps) {
  const { t } = useTranslation();
  const progress = maxXP > 0 ? Math.max(0, Math.min(currentXP / maxXP, 1)) : 0;
  const fillAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(0)).current;
  const floatAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: progress,
      duration: 900,
      useNativeDriver: false,
    }).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    );

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -4, duration: 1700, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1700, useNativeDriver: true }),
      ]),
    );

    pulseLoop.start();
    floatLoop.start();

    return () => {
      pulseLoop.stop();
      floatLoop.stop();
    };
  }, [fillAnim, floatAnim, progress, pulseAnim]);

  const fillWidth = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const badgeScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1.04] });
  const badgeOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] });

  return (
    <LinearGradient
      colors={['#111827', '#1F2937']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardShell}>
      <View style={styles.card}>
        <View style={styles.highlight} />
        <View style={styles.row}>
          <Animated.View style={[styles.badgeShell, { transform: [{ scale: badgeScale }], opacity: badgeOpacity }]}>
            <LinearGradient
              colors={['rgba(250,204,21,0.24)', 'rgba(234,179,8,0.12)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badge}>
              <Text style={styles.badgeText}>{level}</Text>
            </LinearGradient>
          </Animated.View>

          <View style={styles.centerBlock}>
            <Text style={styles.title}>{t('xp.title', { level })}</Text>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFillWrap, { width: fillWidth }]}>
                <LinearGradient
                  colors={['#FACC15', '#EAB308']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.progressFill}
                />
              </Animated.View>
            </View>
            <Text style={styles.xpText}>{t('xp.progress', { current: currentXP, max: maxXP })}</Text>
          </View>

          <Animated.View style={[styles.chestWrap, { transform: [{ translateY: floatAnim }] }]}>
            <ChestIcon />
          </Animated.View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    width: '100%',
    minHeight: 100,
    borderRadius: 26,
    shadowColor: '#FACC15',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  card: {
    flex: 1,
    borderRadius: 26,
    padding: Spacing.four,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    gap: Spacing.two,
  },
  highlight: {
    position: 'absolute',
    top: -36,
    left: -26,
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  badgeShell: {
    shadowColor: '#FACC15',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  badge: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFF7C2',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  centerBlock: {
    flex: 1,
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  progressFillWrap: {
    height: '100%',
  },
  progressFill: {
    flex: 1,
    borderRadius: 999,
  },
  xpText: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 13,
    fontWeight: '700',
  },
  chestWrap: {
    width: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
