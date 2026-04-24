import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { I18nManager, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionCard } from '@/components/home/action-card';
import { HomeHeader } from '@/components/home/home-header';
import { QuestProgress, type QuestStep } from '@/components/home/quest-progress';
import { StatCard } from '@/components/home/stat-card';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import i18n, { changeLanguage } from '@/utils/i18n';
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
            <ActionCard
              colorScheme={colorScheme}
              accent="green"
              title={t('home.gamesTitle')}
              subtitle={t('home.gamesSubtitle')}
              buttonLabel={t('home.playNow')}
              onPress={() => router.push('/games')}
            />

            <ActionCard
              colorScheme={colorScheme}
              accent="yellow"
              title={t('home.musicTitle')}
              subtitle={t('home.musicSubtitle')}
              buttonLabel={t('home.listenNow')}
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
});
