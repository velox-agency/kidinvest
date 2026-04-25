import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

export default function GamesScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}> 
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
          <Text style={[styles.title, { color: colors.text }]}>{t('games.title')}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  card: {
    width: '100%',
    maxWidth: MaxContentWidth,
    borderRadius: 28,
    borderWidth: 1,
    padding: Spacing.five,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});