import { useTranslation } from 'react-i18next';
import { I18nManager, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

export type QuestStepStatus = 'completed' | 'current' | 'locked';

export interface QuestStep {
  key: 'start' | 'firstPiggyBank' | 'merchant' | 'expert' | (string & {});
  status: QuestStepStatus;
}

interface QuestProgressProps {
  steps: readonly QuestStep[];
  colorScheme: 'light' | 'dark';
}

export function QuestProgress({ steps, colorScheme }: QuestProgressProps) {
  const { t } = useTranslation();
  const colors = Colors[colorScheme];
  const isRTL = I18nManager.isRTL;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.backgroundSelected,
        },
      ]}>
      <Text style={[styles.heading, { color: colors.text }]}>{t('home.questTitle')}</Text>

      <View style={[styles.track, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isLocked = step.status === 'locked';

          return (
            <View key={step.key} style={styles.stepWrap}>
              <View
                style={[
                  styles.bubble,
                  {
                    backgroundColor: isCompleted
                      ? '#2EAE63'
                      : isCurrent
                        ? '#D9A21B'
                        : colors.background,
                    borderColor: isCompleted || isCurrent ? 'transparent' : colors.backgroundSelected,
                    opacity: isLocked ? 0.55 : 1,
                  },
                ]}>
                <Text
                  style={[
                    styles.bubbleText,
                    { color: isCompleted || isCurrent ? '#fff' : colors.textSecondary },
                  ]}>
                  {isCompleted ? '✓' : index + 1}
                </Text>
              </View>

              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                style={[
                  styles.label,
                  {
                    color: isCurrent ? colors.text : isLocked ? colors.textSecondary : colors.text,
                    opacity: isLocked ? 0.7 : 1,
                    textAlign: 'center',
                  },
                ]}>
                {t(`home.steps.${step.key}`)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 160,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  track: {
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  stepWrap: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    height: 80,
  },
  bubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    minHeight: 28,
    maxWidth: 78,
  },
});