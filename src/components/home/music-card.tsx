import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

import { Spacing } from '@/constants/theme';

interface MusicCardProps {
  title: string;
  description: string;
  onPress: () => void;
}

function HeadphoneIcon() {
  return (
    <Svg width={124} height={96} viewBox="0 0 124 96" fill="none">
      <Defs>
        <SvgLinearGradient id="music-shell" x1="26" y1="24" x2="98" y2="78" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFE8A3" />
          <Stop offset="0.48" stopColor="#FACC15" />
          <Stop offset="1" stopColor="#7C3AED" />
        </SvgLinearGradient>
        <SvgLinearGradient id="music-pad" x1="30" y1="30" x2="90" y2="76" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFF7CC" />
          <Stop offset="1" stopColor="#B45309" />
        </SvgLinearGradient>
      </Defs>
      <Path
        d="M34 49C34 32.432 47.432 19 64 19C80.568 19 94 32.432 94 49V59"
        stroke="url(#music-shell)"
        strokeWidth="11"
        strokeLinecap="round"
      />
      <Path
        d="M31.5 51C31.5 39.678 40.678 30.5 52 30.5H58V58.5H52C40.678 58.5 31.5 49.322 31.5 38V51Z"
        fill="url(#music-pad)"
      />
      <Path
        d="M90.5 51C90.5 39.678 81.322 30.5 70 30.5H64V58.5H70C81.322 58.5 90.5 49.322 90.5 38V51Z"
        fill="url(#music-pad)"
      />
      <Path
        d="M47 69H77C84.732 69 91 62.732 91 55V53C91 49.686 88.314 47 85 47H39C35.686 47 33 49.686 33 53V55C33 62.732 39.268 69 47 69Z"
        fill="#0B0F1A"
        opacity={0.62}
      />
      <Path d="M48 68H76" stroke="#FFF7CC" strokeWidth="3" strokeLinecap="round" opacity={0.8} />
      <Circle cx="29" cy="25" r="3" fill="#FACC15" opacity={0.85} />
      <Circle cx="98" cy="33" r="4" fill="#EAB308" opacity={0.65} />
      <Path d="M95 20L103 16" stroke="#FACC15" strokeWidth="2.6" strokeLinecap="round" opacity={0.7} />
      <Path d="M93 25L102 25" stroke="#FFF7CC" strokeWidth="2.6" strokeLinecap="round" opacity={0.5} />
    </Svg>
  );
}

export function MusicCard({ title, description, onPress }: MusicCardProps) {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;
  const floatAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
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
        colors={['#2A1A0F', '#A16207']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        <View style={styles.glowTopLeft} />
        <View style={styles.borderGlow} />
        <Animated.View style={[styles.iconWrap, { transform: [{ translateY: floatAnim }] }]}>
          <HeadphoneIcon />
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
          colors={['#FACC15', '#EAB308']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cta}>
          <Text style={styles.ctaText}>{t('home.listenNow')}</Text>
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
    shadowColor: '#FACC15',
    shadowOpacity: 0.24,
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
    borderColor: 'rgba(255,255,255,0.16)',
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
    backgroundColor: 'rgba(250,204,21,0.12)',
  },
  borderGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,248,220,0.08)',
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
    shadowColor: '#FACC15',
    shadowOpacity: 0.34,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  ctaText: {
    color: '#3F2C00',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
