import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import i18n from '@/utils/i18n';
import { onboardingState } from '@/utils/onboarding-state';

const ITEM_HEIGHT = 64;
const PICKER_HEIGHT = 192;
const AGE_ITEMS = Array.from({ length: 12 }, (_, idx) => idx + 5);
const DEFAULT_AGE = 8;

export default function OnboardingAgeScreen() {
  const { t } = useTranslation();
  const listRef = useRef<FlatList<number>>(null);
  const [selectedAge, setSelectedAge] = useState(DEFAULT_AGE);
  const defaultIndex = useMemo(() => AGE_ITEMS.indexOf(DEFAULT_AGE), []);

  useEffect(() => {
    if (!onboardingState.gender || !onboardingState.name.trim()) {
      router.replace('/onboarding');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      listRef.current?.scrollToOffset({
        offset: defaultIndex * ITEM_HEIGHT,
        animated: false,
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [defaultIndex]);

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(rawIndex, AGE_ITEMS.length - 1));
    setSelectedAge(AGE_ITEMS[clampedIndex]);
  };

  const handleFinish = async () => {
    const selectedLanguage = onboardingState.language ?? ((i18n.language.split('-')[0] as 'ar' | 'fr' | 'en') || 'en');

    await AsyncStorage.multiSet([
      ['onboarding_complete', 'true'],
      ['user_gender', onboardingState.gender ?? ''],
      ['user_name', onboardingState.name],
      ['user_age', String(selectedAge)],
      ['user_language', selectedLanguage],
    ]);

    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainContent}>
          <View style={styles.textBlock}>
            <Text style={styles.title}>{t('onboarding.ageTitle')}</Text>
            <Text style={styles.subtitle}>{t('onboarding.ageSubtitle')}</Text>
          </View>

          <View style={styles.pickerWrap}>
            <FlatList
              ref={listRef}
              data={AGE_ITEMS}
              keyExtractor={(item) => String(item)}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              bounces={false}
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              contentContainerStyle={styles.pickerContent}
              onMomentumScrollEnd={handleMomentumEnd}
              renderItem={({ item }) => {
                const distance = Math.abs(item - selectedAge);
                const fontSize = distance === 0 ? 48 : distance === 1 ? 28 : 20;
                const fontWeight = distance === 0 ? '800' : '600';
                const color = distance === 0 ? '#2EAE63' : distance === 1 ? '#AAAAAA' : '#CCCCCC';
                const scale = distance === 0 ? 1 : distance === 1 ? 0.9 : 0.82;

                return (
                  <View style={styles.ageItem}>
                    <Text style={[styles.ageText, { fontSize, fontWeight, color, transform: [{ scale }] }]}>
                      {item}
                    </Text>
                  </View>
                );
              }}
            />

            <View pointerEvents="none" style={styles.pickerOverlayTop}>
              <LinearGradient
                colors={['#F7F5F0', 'rgba(247,245,240,0)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.fadeGradient}
              />
            </View>
            <View pointerEvents="none" style={styles.pickerOverlayBottom}>
              <LinearGradient
                colors={['rgba(247,245,240,0)', '#F7F5F0']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.fadeGradient}
              />
            </View>
          </View>

          <Text style={styles.yearsLabel}>{t('onboarding.years')}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.progressDots}>
            <View style={styles.dotInactive} />
            <View style={styles.dotInactive} />
            <View style={styles.dotActive} />
          </View>

          <Pressable accessibilityRole="button" onPress={handleFinish} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>{t('onboarding.next')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  textBlock: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: '#1A1A1A',
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#888888',
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
  pickerWrap: {
    width: '100%',
    maxWidth: 220,
    height: PICKER_HEIGHT,
    position: 'relative',
  },
  pickerContent: {
    paddingVertical: ITEM_HEIGHT,
  },
  ageItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageText: {
    textAlign: 'center',
  },
  yearsLabel: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '500',
  },
  pickerOverlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
  },
  pickerOverlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
  },
  fadeGradient: {
    flex: 1,
  },
  footer: {
    gap: 16,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2EAE63',
  },
  dotInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCCCCC',
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
});
