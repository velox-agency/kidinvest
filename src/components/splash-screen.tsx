import { useEffect, useMemo, useRef } from 'react';
import {
    Animated,
    Easing,
    ImageSourcePropType,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';

import { Colors } from '@/constants/theme';

export type SplashAnimationVariant = 'minimal' | 'playful';

interface AppSplashScreenProps {
  colorScheme: 'light' | 'dark';
  variant?: SplashAnimationVariant;
  onAnimationEnd: () => void;
}

const LOGO_DARK: ImageSourcePropType = require('@/assets/images/splash screen darkKidInvest-.png');
const LOGO_LIGHT: ImageSourcePropType = require('@/assets/images/splash screen lightKidInvest-.png');

const INTRO_DURATION = 3000;
const OUTRO_DURATION = 300;

export function AppSplashScreen({
  colorScheme,
  variant = 'minimal',
  onAnimationEnd,
}: AppSplashScreenProps) {
  const { width } = useWindowDimensions();

  const logoSize = useMemo(() => {
    const scaled = width * 0.34;
    return Math.max(128, Math.min(180, scaled));
  }, [width]);

  const containerOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    const intro = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: INTRO_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: INTRO_DURATION,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]);

    const pulse =
      variant === 'playful'
        ? Animated.sequence([
            Animated.timing(logoScale, {
              toValue: 1.03,
              duration: 180,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(logoScale, {
              toValue: 1,
              duration: 180,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ])
        : Animated.delay(160);

    const outro = Animated.timing(containerOpacity, {
      toValue: 0,
      duration: OUTRO_DURATION,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    });

    const sequence = Animated.sequence([intro, pulse, Animated.delay(120), outro]);

    sequence.start(({ finished }) => {
      if (finished) {
        onAnimationEnd();
      }
    });

    return () => {
      sequence.stop();
    };
  }, [containerOpacity, logoOpacity, logoScale, onAnimationEnd, variant]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerOpacity,
          backgroundColor: Colors[colorScheme].splashBackground,
        },
      ]}>
      <Animated.Image
        source={colorScheme === 'dark' ? LOGO_DARK : LOGO_LIGHT}
        resizeMode="contain"
        style={[
          styles.logo,
          {
            width: logoSize,
            height: logoSize,
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  logo: {
    maxWidth: '60%',
    maxHeight: '60%',
  },
});
