import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    I18nManager,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import i18n, { changeLanguage } from '@/utils/i18n';
import { onboardingState, type OnboardingLanguage } from '@/utils/onboarding-state';

type LanguageOption = {
  code: OnboardingLanguage;
  primaryKey: 'onboarding.arabicNative' | 'onboarding.frenchNative' | 'onboarding.englishNative';
  secondaryKey:
    | 'onboarding.arabicLabel'
    | 'onboarding.frenchLabel'
    | 'onboarding.englishLabel';
  flag: string;
};

const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  {
    code: 'ar',
    primaryKey: 'onboarding.arabicNative',
    secondaryKey: 'onboarding.arabicLabel',
    flag: '🇩🇿',
  },
  {
    code: 'fr',
    primaryKey: 'onboarding.frenchNative',
    secondaryKey: 'onboarding.frenchLabel',
    flag: '🇫🇷',
  },
  {
    code: 'en',
    primaryKey: 'onboarding.englishNative',
    secondaryKey: 'onboarding.englishLabel',
    flag: '🇬🇧',
  },
];

export default function OnboardingLanguageScreen() {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;
  const currentLanguage = useMemo(() => {
    const normalized = i18n.language.split('-')[0];
    if (normalized === 'ar' || normalized === 'fr' || normalized === 'en') {
      return normalized;
    }
    return 'en';
  }, []);

  const [selectedLanguage, setSelectedLanguage] = useState<OnboardingLanguage>(
    onboardingState.language ?? currentLanguage,
  );

  const handleConfirm = async () => {
    onboardingState.language = selectedLanguage;
    await changeLanguage(selectedLanguage);
    router.push('/onboarding/age');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('onboarding.chooseLanguage')}</Text>

          <View style={styles.cardsList}>
            {LANGUAGE_OPTIONS.map((option) => {
              const isSelected = selectedLanguage === option.code;

              return (
                <Pressable
                  key={option.code}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setSelectedLanguage(option.code)}
                  style={[styles.languageCard, isSelected ? styles.languageCardSelected : styles.languageCardIdle]}>
                  <View style={[styles.cardInner, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected ? <View style={styles.radioInner} /> : null}
                    </View>

                    <View style={styles.labelBlock}>
                      <Text style={styles.languagePrimary}>{t(option.primaryKey)}</Text>
                      <Text style={styles.languageSecondary}>{t(option.secondaryKey)}</Text>
                    </View>

                    <Text style={styles.flagText}>{option.flag}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.bottomBlock}>
          <Pressable accessibilityRole="button" onPress={handleConfirm} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>{t('onboarding.confirm')}</Text>
          </Pressable>
          <Text style={styles.note}>{t('onboarding.languageNote')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const shadowCard = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F5F0',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  title: {
    color: '#1A1A1A',
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  cardsList: {
    gap: 12,
  },
  languageCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...shadowCard,
  },
  languageCardSelected: {
    borderColor: '#2EAE63',
  },
  languageCardIdle: {
    borderColor: '#E5E5E5',
  },
  cardInner: {
    alignItems: 'center',
    gap: 12,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A8A8A8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#2EAE63',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2EAE63',
  },
  labelBlock: {
    flex: 1,
    gap: 2,
  },
  languagePrimary: {
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: '700',
  },
  languageSecondary: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '500',
  },
  flagText: {
    fontSize: 26,
  },
  bottomBlock: {
    gap: 10,
  },
  actionButton: {
    height: 56,
    borderRadius: 999,
    backgroundColor: '#2EAE63',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  note: {
    textAlign: 'center',
    color: '#888888',
    fontSize: 12,
    fontWeight: '500',
  },
});
