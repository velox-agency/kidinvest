import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';


interface LevelCardProps {
  level: string;
}

function LevelArrowIcon() {
  return (
    <Svg width={56} height={48} viewBox="0 0 92 80" fill="none">
      <Defs>
        <SvgLinearGradient id="level-arrow" x1="20" y1="10" x2="72" y2="68" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#A7F3D0" />
          <Stop offset="1" stopColor="#22C55E" />
        </SvgLinearGradient>
      </Defs>
      <Path
        d="M46 14L64 31H54V60H38V31H28L46 14Z"
        fill="url(#level-arrow)"
      />
      <Path
        d="M22 66H70"
        stroke="#D1FAE5"
        strokeWidth="5"
        strokeLinecap="round"
        opacity={0.72}
      />
    </Svg>
  );
}

export function LevelCard({ level }: LevelCardProps) {
  const { t } = useTranslation();
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ]),
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  const glowScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1.06] });
  const glowOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  return (
    <LinearGradient
      colors={['#0F2A1E', '#14532D']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardShell}>
      <View style={styles.card}>
        <View style={styles.glowCircle} />
        <View style={styles.iconRow}>
          <Animated.View style={[styles.iconWrap, { transform: [{ scale: glowScale }], opacity: glowOpacity }]}>
            <LevelArrowIcon />
          </Animated.View>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
            {t('cards.level')}
          </Text>
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
            {level}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 24,
    shadowColor: '#22C55E',
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'space-between',
  },
  glowCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -30,
    left: -30,
    opacity: 0.15,
    backgroundColor: '#D1FAE5',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  textBlock: {
    gap: 6,
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    flexWrap: 'nowrap',
  },
  value: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    flexWrap: 'nowrap',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
