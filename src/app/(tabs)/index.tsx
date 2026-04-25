import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { I18nManager, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameCard } from '@/components/home/game-card';
import { HomeHeader } from '@/components/home/home-header';
import { MusicCard } from '@/components/home/music-card';
import { QuestProgress, type QuestStep } from '@/components/home/quest-progress';
import { StatCard } from '@/components/home/stat-card';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import i18n, { changeLanguage } from '@/utils/i18n';
import { onboardingState } from '@/utils/onboarding-state';
import { useColorScheme } from 'react-native';

const QUEST_STEPS: readonly QuestStep[] = [
  { key: 'start', status: 'completed' },
  { key: 'firstPiggyBank', status: 'completed' },
  { key: 'merchant', status: 'current' },
  { key: 'expert', status: 'locked' },
];

const LANGUAGE_CYCLE: readonly ('ar' | 'fr' | 'en')[] = ['ar', 'fr', 'en'];

function getNextLanguage() {
  const currentLanguage = i18n.language.split('-')[0] as 'ar' | 'fr' | 'en';
  const currentIndex = LANGUAGE_CYCLE.indexOf(currentLanguage);
  return LANGUAGE_CYCLE[(currentIndex + 1) % LANGUAGE_CYCLE.length];
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorScheme];
  const isRTL = I18nManager.isRTL;

  const handleReset = async () => {
    onboardingState.name = '';
    await AsyncStorage.multiRemove(['user_name', 'user_age', 'onboarding_complete']);
    router.replace('/onboarding');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}> 
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              alignSelf: 'center',
              width: '100%',
              maxWidth: MaxContentWidth,
            },
          ]}
          showsVerticalScrollIndicator={false}>
          <HomeHeader
            colorScheme={colorScheme}
            title={t('home.welcomeTitle')}
            languageLabel={t('home.switchLanguage')}
            onLanguagePress={() => changeLanguage(getNextLanguage())}
          />

          <Pressable
            accessibilityRole="button"
            onPress={handleReset}
            style={[styles.resetButton, { borderColor: colors.textSecondary }]}
          >
            <Text style={[styles.resetButtonText, { color: colors.text }]}>{t('onboarding.reset')}</Text>
          </Pressable>

          <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <StatCard
              colorScheme={colorScheme}
              label={t('home.level')}
              value="Beginner"
              accent="green"
            />
            <StatCard
              colorScheme={colorScheme}
              label={t('home.coins')}
              value="120"
              accent="yellow"
            />
          </View>

          <View style={[styles.actionsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}> 
            <GameCard
              title={t('games.title')}
              description={t('games.description')}
              onPress={() => router.push('/games')}
            />

            <MusicCard
              title={t('music.title')}
              description={t('music.description')}
              onPress={() => router.push('/music')}
            />
          </View>

          <QuestProgress colorScheme={colorScheme} steps={QUEST_STEPS} />
        </ScrollView>
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
  },
  content: {
    width: '100%',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
    flexGrow: 1,
  },
  statsRow: {
    gap: Spacing.three,
    alignItems: 'stretch',
    width: '100%',
  },
  actionsRow: {
    gap: Spacing.three,
    alignItems: 'stretch',
    width: '100%',
  },
  resetButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignSelf: 'flex-start',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
