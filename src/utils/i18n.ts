import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import * as Updates from 'expo-updates';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import ar from '../locales/ar.json';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  fr: { translation: fr },
};

export const LANGUAGE_KEY = 'kids-invest-language';

export const setupI18n = async () => {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  const locale = savedLanguage || Localization.getLocales()[0]?.languageCode || 'en';

  if (!i18n.isInitialized) {
    await i18n
      .use(initReactI18next)
      .init({
        resources,
        lng: locale,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
        compatibilityJSON: 'v4', // i18next v24 requires 'v4' or removal of this field
      });
  }

  const isRTL = i18n.language === 'ar';

  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);

    try {
      await Updates.reloadAsync();
    } catch {
      // Ignore reload failures in environments where immediate runtime reload is unavailable.
    }
  }
};

export const changeLanguage = async (lang: 'ar' | 'en' | 'fr') => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  await i18n.changeLanguage(lang);

  const isRTL = lang === 'ar';

  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    try {
      await Updates.reloadAsync();
    } catch {
      // Ignore reload failures in environments where immediate runtime reload is unavailable.
    }
  }
};

export default i18n;