import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    I18nManager,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';

import { onboardingState, type OnboardingGender } from '@/utils/onboarding-state';

function AvatarIllustration({ gender }: { gender: OnboardingGender }) {
  const isGirl = gender === 'girl';
  const shirtStart = isGirl ? '#F6A7C1' : '#7AC6FF';
  const shirtEnd = isGirl ? '#DD6F9A' : '#4A9DE0';
  const hair = isGirl ? '#5B3A29' : '#2F2F2F';

  return (
    <Svg width={90} height={90} viewBox="0 0 90 90" accessible={false}>
      <Defs>
        <LinearGradient id={`shirt-${gender}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={shirtStart} />
          <Stop offset="1" stopColor={shirtEnd} />
        </LinearGradient>
      </Defs>
      <Ellipse cx="45" cy="80" rx="26" ry="8" fill="#E6E1D8" />
      <Path
        d={isGirl ? 'M28 72 C31 54 59 54 62 72 Z' : 'M26 74 C30 52 60 52 64 74 Z'}
        fill={`url(#shirt-${gender})`}
      />
      <Circle cx="45" cy="35" r="16" fill="#F6D1B3" />
      <Path
        d={isGirl ? 'M29 35 C30 18 60 18 61 35 C58 25 52 22 45 22 C38 22 32 25 29 35 Z' : 'M28 36 C29 21 61 21 62 36 C59 27 53 24 45 24 C37 24 31 27 28 36 Z'}
        fill={hair}
      />
      <Circle cx="39" cy="37" r="1.5" fill="#3E2D21" />
      <Circle cx="51" cy="37" r="1.5" fill="#3E2D21" />
      <Path d="M40 45 C42 48 48 48 50 45" stroke="#C27E59" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export default function OnboardingIntroScreen() {
  const { t } = useTranslation();
  const [selectedGender, setSelectedGender] = useState<OnboardingGender | null>(onboardingState.gender);
  const [name, setName] = useState(onboardingState.name);
  const [isFocused, setIsFocused] = useState(false);

  const isRTL = I18nManager.isRTL;
  const canContinue = useMemo(
    () => Boolean(selectedGender) && name.trim().length > 0,
    [name, selectedGender],
  );

  const handleNext = () => {
    if (!canContinue || !selectedGender) {
      return;
    }

    onboardingState.gender = selectedGender;
    onboardingState.name = name.trim();
    router.push('/onboarding/language');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.textBlock}>
              <Text style={styles.title}>{t('onboarding.welcomeTitle')}</Text>
              <Text style={styles.subtitle}>{t('onboarding.welcomeSubtitle')}</Text>
            </View>

            <View style={[styles.avatarRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: selectedGender === 'girl' }}
                onPress={() => setSelectedGender('girl')}
                style={[
                  styles.avatarCard,
                  selectedGender === 'girl' ? styles.avatarCardSelected : styles.avatarCardUnselected,
                ]}>
                <AvatarIllustration gender="girl" />
                <Text style={styles.avatarLabel}>{t('onboarding.girl')}</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: selectedGender === 'boy' }}
                onPress={() => setSelectedGender('boy')}
                style={[
                  styles.avatarCard,
                  selectedGender === 'boy' ? styles.avatarCardSelected : styles.avatarCardUnselected,
                ]}>
                <AvatarIllustration gender="boy" />
                <Text style={styles.avatarLabel}>{t('onboarding.boy')}</Text>
              </Pressable>
            </View>

            <TextInput
              value={name}
              onChangeText={setName}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={t('onboarding.namePlaceholder')}
              placeholderTextColor="#B1B1B1"
              textAlign={isRTL ? 'right' : 'left'}
              style={[styles.nameInput, isFocused && styles.nameInputFocused]}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!canContinue}
            onPress={handleNext}
            style={[styles.actionButton, !canContinue && styles.actionButtonDisabled]}>
            <Text style={styles.actionButtonText}>{t('onboarding.next')}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardContainer: {
    flex: 1,
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
  textBlock: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#888888',
    textAlign: 'center',
  },
  avatarRow: {
    gap: 12,
  },
  avatarCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1.5,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...shadowCard,
  },
  avatarCardSelected: {
    backgroundColor: '#EAF8F0',
    borderColor: '#2EAE63',
  },
  avatarCardUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
  },
  avatarLabel: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  nameInput: {
    height: 52,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#D9D9D9',
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    paddingHorizontal: 18,
    ...shadowCard,
  },
  nameInputFocused: {
    borderColor: '#2EAE63',
  },
  actionButton: {
    height: 56,
    borderRadius: 999,
    backgroundColor: '#2EAE63',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.45,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});
