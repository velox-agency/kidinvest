import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

interface CoinsCardProps {
  value: number;
}

function CoinStackIcon() {
  return (
    <Svg width={72} height={58} viewBox="0 0 108 88" fill="none">
      <Defs>
        <SvgLinearGradient id="coin-fill-1" x1="18" y1="14" x2="88" y2="72" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFF7C2" />
          <Stop offset="0.48" stopColor="#FACC15" />
          <Stop offset="1" stopColor="#B45309" />
        </SvgLinearGradient>
        <SvgLinearGradient id="coin-fill-2" x1="24" y1="24" x2="94" y2="78" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFED94" />
          <Stop offset="1" stopColor="#EAB308" />
        </SvgLinearGradient>
      </Defs>
      <Circle cx="34" cy="48" r="20" fill="url(#coin-fill-1)" opacity={0.95} />
      <Circle cx="53" cy="38" r="22" fill="url(#coin-fill-2)" opacity={0.96} />
      <Circle cx="72" cy="48" r="20" fill="url(#coin-fill-1)" opacity={0.94} />
      <Circle cx="53" cy="38" r="12" fill="#FFFBE6" opacity={0.18} />
      <Path d="M53 27V49" stroke="#7C5200" strokeWidth="3" strokeLinecap="round" opacity={0.25} />
      <Path d="M45 38H61" stroke="#7C5200" strokeWidth="3" strokeLinecap="round" opacity={0.25} />
    </Svg>
  );
}

export function CoinsCard({ value }: CoinsCardProps) {
  const { t } = useTranslation();
  const floatAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -4, duration: 1800, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ]),
    );

    floatLoop.start();

    return () => {
      floatLoop.stop();
    };
  }, [floatAnim]);

  return (
    <LinearGradient
      colors={['#1A1405', '#3B2F0B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardShell}>
      <View style={styles.card}>
        <View style={styles.glowCircle} />

        <View style={styles.iconRow}>
          <Animated.View style={[styles.iconWrap, { transform: [{ translateY: floatAnim }] }]}>
            <CoinStackIcon />
          </Animated.View>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
            {t('cards.coins')}
          </Text>
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
            {value}
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
    shadowColor: '#FACC15',
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
    backgroundColor: '#FFF5CC',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: -0.6,
    flexWrap: 'nowrap',
  },
});
