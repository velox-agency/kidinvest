import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

const levelImages = [
  require('../../../assets/images/levels/active/LEVEL 1-KidInvestMa.png'),
  require('../../../assets/images/levels/active/LEVEL 2-KidInvestMa.png'),
  require('../../../assets/images/levels/active/LEVEL 3-KidInvestMa.png'),
  require('../../../assets/images/levels/active/LEVEL 4-KidInvestMa.png'),
  require('../../../assets/images/levels/active/LEVEL 5-KidInvestMa.png'),
  require('../../../assets/images/levels/active/LEVEL 6-KidInvestMa.png'),
  require('../../../assets/images/levels/active/LEVEL 7-KidInvestMa.png'),
  require('../../../assets/images/levels/active/LEVEL 8-KidInvestMa.png'),
] as const;

const levels = [
  { id: 1, x: width * 0.68, y: height * 0.742 },
  { id: 2, x: width * 0.44, y: height * 0.64 },
  { id: 3, x: width * 0.524, y: height * 0.53 },
  { id: 4, x: width * 0.128, y: height * 0.52 },
  { id: 5, x: width * 0.32, y: height * 0.44 },
  { id: 6, x: width * 0.478, y: height * 0.338 },
  { id: 7, x: width * 0.15, y: height * 0.30 },
  { id: 8, x: width * 0.263, y: height * 0.203 },
] as const;

export default function GamesScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../../../assets/images/bg/gamemap.png')}
      resizeMode="cover"
      style={styles.screen}>
      <View style={styles.overlay} />

      <View style={styles.levelLayer}>
        {levels.map((level) => (
          <Pressable
            key={level.id}
            onPress={() => router.push(`/level/${String(level.id)}`)}
            hitSlop={10}
            style={[styles.levelButton, { left: level.x, top: level.y }]}
          >
            <Image
              source={levelImages[level.id - 1]}
              style={styles.levelImage}
              resizeMode="contain"
            />
          </Pressable>
        ))}
      </View>

      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
        <View style={styles.badge}>
          <Text style={styles.title}>{t('games.title')}</Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 26, 0.16)',
  },
  levelLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    pointerEvents: 'box-none',
  },
  levelButton: {
    position: 'absolute',
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -36 }, { translateY: -36 }],
  },
  levelImage: {
    width: 72,
    height: 72,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    zIndex: 3,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(0,0,0,0.28)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});