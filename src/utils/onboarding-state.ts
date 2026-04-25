export type OnboardingGender = 'girl' | 'boy';
export type OnboardingLanguage = 'ar' | 'fr' | 'en';

export const onboardingState: {
  gender: OnboardingGender | null;
  name: string;
  language: OnboardingLanguage | null;
} = {
  gender: null,
  name: '',
  language: null,
};
