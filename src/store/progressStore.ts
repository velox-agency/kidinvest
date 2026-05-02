import { mmkvZustandStorage } from '@/services/storage/mmkv';
import { usePlayerStore } from '@/store/playerStore';
import { PlayerProfile } from '@/types/player.types';
import { changeLanguage, resetLanguage } from '@/utils/i18n';
import { onboardingState } from '@/utils/onboarding-state';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LevelStatus = 'locked' | 'available' | 'completed';

export interface ProgressState {
  xp: number;
  balance: number;
  levels: Record<string, LevelStatus>;
  completeLevel: (levelId: number) => Promise<void>;
  addCurrency: (amount: number) => Promise<void>;
  getBalance: () => Promise<number>;
  addXP: (amount: number) => Promise<void>;
  reset: () => void;
  eraseAllData: () => Promise<void>;
  profile: PlayerProfile | null;
  setLanguage: (lang: 'ar' | 'en' | 'fr') => Promise<void>;
}

const DEFAULT_LEVELS: Record<string, LevelStatus> = {
  '1': 'available',
  '2': 'locked',
  '3': 'locked',
  '4': 'locked',
  '5': 'locked',
  '6': 'locked',
  '7': 'locked',
  '8': 'locked',
};

const DEFAULT = {
  xp: 0,
  balance: 0,
  levels: DEFAULT_LEVELS,
  profile: null,
};

const STORAGE_KEY = 'kidinvest.progress';

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      xp: DEFAULT.xp,
      balance: DEFAULT.balance,
      levels: DEFAULT.levels,
      profile: usePlayerStore.getState().profile ?? null,

      completeLevel: async (levelId: number) => {
        const key = String(levelId);
        const state = get();
        const status = state.levels[key];
        if (status !== 'available') return;

        // Update state synchronously
        set((s) => {
          const nextLevels = { ...s.levels } as Record<string, LevelStatus>;
          nextLevels[key] = 'completed';
          const nextId = levelId + 1;
          if (nextLevels[String(nextId)] === 'locked') {
            nextLevels[String(nextId)] = 'available';
          }
          return {
            levels: nextLevels,
          } as Partial<ProgressState>;
        });

        // Simulate small write latency so UI can show a loading state
        await new Promise((res) => setTimeout(res, 300));
      },

      addCurrency: async (amount: number) => {
        set((s) => ({ balance: s.balance + amount }));
        await Promise.resolve();
      },

      getBalance: async (): Promise<number> => get().balance,

      addXP: async (amount: number) => {
        set((s) => ({ xp: s.xp + amount }));
        await Promise.resolve();
      },

      setLanguage: async (lang: 'ar' | 'en' | 'fr') => {
        // Persist via the existing i18n helper and update player profile if present
        await changeLanguage(lang);
        const playerSetLanguage = usePlayerStore.getState().setLanguage;
        if (playerSetLanguage) {
          playerSetLanguage(lang as any);
        }
        set((state) => ({
          profile: state.profile ? { ...state.profile, language: lang } : state.profile,
        }));
      },

      reset: () => set(() => ({ xp: DEFAULT.xp, balance: DEFAULT.balance, levels: DEFAULT.levels, profile: DEFAULT.profile })),

      eraseAllData: async () => {
        usePlayerStore.getState().resetProfile();
        onboardingState.name = '';
        onboardingState.gender = null;
        onboardingState.language = null;
        await resetLanguage();
        set(() => ({
          xp: DEFAULT.xp,
          balance: DEFAULT.balance,
          levels: { ...DEFAULT.levels },
          profile: DEFAULT.profile,
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => mmkvZustandStorage),
    }
  )
);

usePlayerStore.subscribe((state) => {
  useProgressStore.setState({ profile: state.profile ?? null });
});

// Helper accessors for non-hook usage
export function getProgress() {
  const s = useProgressStore.getState();
  return { xp: s.xp, balance: s.balance, levels: s.levels };
}

export function getXP() {
  return useProgressStore.getState().xp;
}

export function getProfile() {
  return usePlayerStore.getState().profile;
}

export function getBadges() {
  const levels = useProgressStore.getState().levels;
  const completed = Object.entries(levels)
    .filter(([, status]) => status === 'completed')
    .map(([id]) => Number(id));

  const badges: string[] = [];
  if (completed.includes(2)) badges.push('Money Friend');
  if (completed.includes(4)) badges.push('Money Thinker');
  if (completed.includes(6)) badges.push('Friend of Good');
  if (completed.includes(8)) badges.push('Small Finance Expert');
  return badges;
}
