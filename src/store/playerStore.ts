import { mmkvZustandStorage } from '@/services/storage/mmkv';
import { Language, PlayerProfile } from '@/types/player.types';
import 'react-native-get-random-values'; // required for uuid
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PlayerStore {
  profile: PlayerProfile | null
  isHydrated: boolean
  createProfile: (data: Pick<PlayerProfile, 'name' | 'age' | 'language' | 'avatarBase'>) => void;
  setLanguage: (language: Language) => void;
  setHydrated: () => void;
  resetProfile: () => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      profile: null,
      isHydrated: false,

      createProfile: (data) => {
        const profile: PlayerProfile = {
          id: uuidv4(),
          name: data.name,
          age: data.age,
          language: data.language,
          avatarBase: data.avatarBase,
          stage: 1,
          createdAt: new Date().toISOString(),
        };
        set({ profile });
      },

      setLanguage: (language) => {
        const { profile } = get();
        if (!profile) return;
        set({ profile: { ...profile, language } });
      },



      setHydrated: () => set({ isHydrated: true }),

      resetProfile: () => set({ profile: null }),
    }),
    {
      name: 'kidinvest.player',
      storage: createJSONStorage(() => mmkvZustandStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
)
