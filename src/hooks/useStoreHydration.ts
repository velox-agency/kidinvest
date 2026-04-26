import { usePlayerStore } from "@/store/playerStore";

export function useStoreHydration() {
  const playerHydrated = usePlayerStore((state) => state.isHydrated);

  return playerHydrated;
}