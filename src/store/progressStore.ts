import { mmkvZustandStorage } from '@/services/storage/mmkv';
import { usePlayerStore } from '@/store/playerStore';
import { PlayerProfile } from '@/types/player.types';
import { changeLanguage } from '@/utils/i18n';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LevelStatus = 'locked' | 'available' | 'completed';

export interface ProgressState {
  xp: number;
  levels: Record<string, LevelStatus>;
  completeLevel: (levelId: number) => Promise<void>;
  reset: () => void;
  profile: PlayerProfile | null;
  setLanguage: (lang: 'ar' | 'en' | 'fr') => Promise<void>;
}

const DEFAULT: Omit<ProgressState, 'completeLevel' | 'reset'> = {
  xp: 0,
  levels: {
    '1': 'available',
    '2': 'locked',
    '3': 'locked',
    '4': 'locked',
    '5': 'locked',
    '6': 'locked',
    '7': 'locked',
    '8': 'locked',
  },
};

const STORAGE_KEY = 'kidinvest.progress';

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      xp: DEFAULT.xp,
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
            xp: s.xp + 50,
            levels: nextLevels,
          } as Partial<ProgressState>;
        });

        // Simulate small write latency so UI can show a loading state
        await new Promise((res) => setTimeout(res, 300));
      },

      setLanguage: async (lang: 'ar' | 'en' | 'fr') => {
        // Persist via the existing i18n helper and update player profile if present
        await changeLanguage(lang);
        const playerSetLanguage = usePlayerStore.getState().setLanguage;
        if (playerSetLanguage) {
          playerSetLanguage(lang as any);
        }
        set(() => ({ }));
      },

      reset: () => set(() => ({ xp: DEFAULT.xp, levels: DEFAULT.levels })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => mmkvZustandStorage),
    }
  )
);

// keep progressStore.profile in sync with playerStore.profile
usePlayerStore.subscribe(
  (s) => s.profile,
  (profile) => {
    useProgressStore.setState({ profile: profile ?? null });
  }
);

// Helper accessors for non-hook usage
export function getProgress() {
  const s = useProgressStore.getState();
  return { xp: s.xp, levels: s.levels };
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
