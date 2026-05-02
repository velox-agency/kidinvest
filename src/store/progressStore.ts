import { mmkvZustandStorage } from '@/services/storage/mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LevelStatus = 'locked' | 'available' | 'completed';

export interface ProgressState {
  xp: number;
  levels: Record<string, LevelStatus>;
  completeLevel: (levelId: number) => Promise<void>;
  reset: () => void;
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

      reset: () => set(() => ({ xp: DEFAULT.xp, levels: DEFAULT.levels })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => mmkvZustandStorage),
    }
  )
);

// Helper accessors for non-hook usage
export function getProgress() {
  const s = useProgressStore.getState();
  return { xp: s.xp, levels: s.levels };
}

export function getXP() {
  return useProgressStore.getState().xp;
}
