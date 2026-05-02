import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CoinsCard } from "@/components/home/coins-card";
import { GameCard } from "@/components/home/game-card";
import { HomeHeader } from "@/components/home/home-header";
import { LevelCard } from "@/components/home/level-card";
import { MusicCard } from "@/components/home/music-card";
import {
    QuestProgress,
    type QuestStep,
} from "@/components/home/quest-progress";
import { XPProgressCard } from "@/components/home/xp-progress-card";
import { Colors, MaxContentWidth, Spacing } from "@/constants/theme";
import { usePlayerStore } from "@/store/playerStore";
import { useProgressStore } from '@/store/progressStore';
import { onboardingState } from "@/utils/onboarding-state";

const QUEST_STEPS: readonly QuestStep[] = [
  { key: "start", status: "completed" },
  { key: "firstPiggyBank", status: "completed" },
  { key: "merchant", status: "current" },
  { key: "expert", status: "locked" },
];
export default function HomeScreen() {
  const { t } = useTranslation();
  const resetProfile = usePlayerStore((state) => state.resetProfile);
  const profile = usePlayerStore((state) => state.profile);
  const colorScheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[colorScheme];

  const handleReset = () => {
    resetProfile();
    onboardingState.name = "";
    onboardingState.gender = null;
    onboardingState.language = null;
    router.replace("/onboarding");
  };

  const currentXP = useProgressStore((s) => s.xp);

  return (
    <ImageBackground
      source={require('@/assets/images/bg/Gemini_Generated_Image_kqxo49kqxo49kqxo (1).png')}
      resizeMode="cover"
      style={styles.screen}>
      <View style={styles.backgroundOverlay} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              alignSelf: "center",
              width: "100%",
              maxWidth: MaxContentWidth,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <HomeHeader
            colorScheme={colorScheme}
            title={t("home.welcomeTitle")}
            avatarEmoji={profile?.avatarBase === 'girl' ? '👧' : '👦'}
            onAvatarPress={() => router.push('/profile')}
          />

          <Pressable
            accessibilityRole="button"
            onPress={handleReset}
            style={[styles.resetButton, { borderColor: colors.textSecondary }]}
          >
            <Text style={[styles.resetButtonText, { color: colors.text }]}>
              {t("onboarding.reset")}
            </Text>
          </Pressable>

          <XPProgressCard level={3} currentXP={currentXP} maxXP={600} />

          <View style={styles.statsRow}> 
            <LevelCard level={t('level.beginner')} />
            <CoinsCard value={120} />
          </View>

          <View style={styles.actionsColumn}>
            <View style={styles.actionRow}>
              <GameCard
                title={t('games.title')}
                description={t('games.description')}
                onPress={() => router.push('/games')}
              />
            </View>

            <View style={styles.actionRow}>
              <MusicCard
                title={t('music.title')}
                description={t('music.description')}
                onPress={() => router.push('/music')}
              />
            </View>
          </View>

          <QuestProgress colorScheme={colorScheme} steps={QUEST_STEPS} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 26, 0.32)',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    width: "100%",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
    flexGrow: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    width: '100%',
  },
  actionsColumn: {
    width: '100%',
    gap: Spacing.three,
  },
  actionRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  resetButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignSelf: "flex-start",
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
