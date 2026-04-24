# KIDINVEST — Architecture Reference

> **For the coding agent:** This document is the single source of truth for the KIDINVEST codebase. Every folder, module, data model, and system described here reflects deliberate architectural decisions. Read this before generating any file.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Module Architecture](#4-module-architecture)
5. [Data Models](#5-data-models)
6. [State Management](#6-state-management)
7. [Offline-First Strategy](#7-offline-first-strategy)
8. [Navigation Architecture](#8-navigation-architecture)
9. [Mini-Game System](#9-mini-game-system)
10. [Economy System](#10-economy-system)
11. [Hard Situation Event System](#11-hard-situation-event-system)
12. [Avatar Shop System](#12-avatar-shop-system)
13. [Supabase Integration](#13-supabase-integration)
14. [Localization](#14-localization)
15. [Stage 2 Expansion Contract](#15-stage-2-expansion-contract)
16. [Development Roadmap](#16-development-roadmap)
17. [Coding Conventions](#17-coding-conventions)

---

## 1. Project Overview

**KIDINVEST** is an offline-first educational mobile game that teaches financial literacy to children using authentic Algerian Dinar (DZD). Children earn virtual money by playing mini-games on a 2D island map, spend it in an Avatar Shop, and face unexpected "Hard Situation" events that test their saving habits.

### Core Teaching Loop

```
Play Mini-Game → Earn DZD + XP → Visit Avatar Shop (spend/save) → Face Hard Situation Event → Learn outcome
```

### Stages

| Stage   | Age Range   | Status           | Core Mechanic                                     |
| ------- | ----------- | ---------------- | ------------------------------------------------- |
| Stage 1 | 6–9 years   | **Build now**    | 2D map, mini-games, avatar shop, hard situations  |
| Stage 2 | 10–14 years | Future expansion | Business simulation, investment, entrepreneurship |

---

## 2. Tech Stack

| Layer         | Technology                                                 | Rationale                                                                        |
| ------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Framework     | React Native via Expo SDK 55                               | Cross-platform, managed workflow, OTA updates                                    |
| Language      | TypeScript (strict mode)                                   | Type safety, agent-friendly inference                                            |
| Navigation    | Expo Router (file-based)                                   | Aligns with Expo SDK 55, supports deep linking                                   |
| Local Storage | AsyncStorage (`@react-native-async-storage/async-storage`) | Already in project, used by Supabase auth SDK — game data uses the same instance |
| Remote DB     | Supabase (PostgreSQL + Auth)                               | Optional cloud save, RLS policies per user                                       |
| Offline Sync  | Custom sync queue (see §7)                                 | Manual reconciliation on login                                                   |
| 2D Rendering  | React Native Skia                                          | Island map, map nodes, particle effects                                          |
| Animations    | Reanimated 3 + Moti                                        | Fluid UI transitions and game feedback                                           |
| Audio         | Expo AV                                                    | Sound effects and background music                                               |
| Localization  | i18n-js + locale detection                                 | Arabic, French, English                                                          |
| Icons/Art     | SVG via react-native-svg                                   | Resolution-independent assets                                                    |
| Testing       | Jest + React Native Testing Library                        | Unit and integration tests                                                       |

---

## 3. Folder Structure

```
kidinvest/
│
├── assets/                           # Root-level static assets (Expo Metro resolver)
│   └── images/
│       ├── map/                      # Island background, path SVGs
│       ├── avatars/                  # Boy/girl base sprites + equipment layers
│       ├── shop/                     # Item thumbnails
│       ├── events/                   # Hard situation illustrations
│       ├── audio/
│       │   ├── bgm/
│       │   └── sfx/
│       └── animations/               # Lottie JSON files for rewards/events
│
├── src/                              # All source code lives here (Expo SDK 55 convention)
│   │
│   ├── app/                          # Expo Router file-based routes (mapped via tsconfig paths)
│   │   ├── (onboarding)/
│   │   │   ├── _layout.tsx
│   │   │   ├── language.tsx          # Step 1: Language selection
│   │   │   ├── avatar.tsx            # Step 2: Avatar selection (boy/girl)
│   │   │   └── profile.tsx           # Step 3: Name + age entry
│   │   ├── (main)/
│   │   │   ├── _layout.tsx           # Tab navigator: Map ↔ Shop
│   │   │   ├── map.tsx               # The Island Map screen
│   │   │   └── shop.tsx              # The Avatar Shop screen
│   │   ├── (games)/
│   │   │   ├── _layout.tsx
│   │   │   ├── bubble-pop.tsx        # Race Against Time
│   │   │   ├── maze.tsx              # Maze game
│   │   │   ├── puzzle.tsx            # Jigsaw Puzzle
│   │   │   ├── memory-match.tsx      # Memory Match
│   │   │   └── sorting.tsx           # Sorting / Drag-and-drop
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   └── _layout.tsx               # Root layout — onboarding gate + auth gate
│   │
│   ├── components/                   # Shared UI components
│   │   ├── ui/                       # Generic primitives (Button, Card, Modal, Text)
│   │   ├── map/
│   │   │   ├── IslandMap.tsx
│   │   │   ├── MapNode.tsx
│   │   │   ├── MapPath.tsx
│   │   │   └── HardSituationOverlay.tsx
│   │   ├── shop/
│   │   │   ├── ShopGrid.tsx
│   │   │   ├── ShopItemCard.tsx
│   │   │   ├── AvatarPreview.tsx
│   │   │   └── NeedsVsDesiresTag.tsx
│   │   ├── avatar/
│   │   │   ├── AvatarRenderer.tsx
│   │   │   └── AvatarEquipment.tsx
│   │   ├── economy/
│   │   │   ├── WalletDisplay.tsx
│   │   │   ├── XPBar.tsx
│   │   │   └── RewardPopup.tsx
│   │   └── games/
│   │       ├── GameHeader.tsx
│   │       ├── GameTimer.tsx
│   │       └── GameResultModal.tsx
│   │
│   ├── systems/                      # Core business logic — no React, no UI
│   │   ├── economy/
│   │   │   ├── EconomyEngine.ts
│   │   │   └── PricingConfig.ts
│   │   ├── events/
│   │   │   ├── HardSituationEngine.ts
│   │   │   └── EventRegistry.ts
│   │   ├── progression/
│   │   │   ├── ProgressionEngine.ts
│   │   │   └── MapConfig.ts
│   │   ├── games/
│   │   │   ├── BaseGameEngine.ts
│   │   │   ├── BubblePopEngine.ts
│   │   │   ├── MazeEngine.ts
│   │   │   ├── PuzzleEngine.ts
│   │   │   ├── MemoryMatchEngine.ts
│   │   │   └── SortingEngine.ts
│   │   └── sync/
│   │       ├── SyncQueue.ts
│   │       └── SyncEngine.ts
│   │
│   ├── store/                        # Zustand global state slices
│   │   ├── index.ts
│   │   ├── playerStore.ts
│   │   ├── economyStore.ts
│   │   ├── progressionStore.ts
│   │   ├── shopStore.ts
│   │   └── sessionStore.ts           # Ephemeral — NOT persisted
│   │
│   ├── hooks/
│   │   ├── useEconomy.ts
│   │   ├── useProgression.ts
│   │   ├── useHardSituation.ts
│   │   ├── useShop.ts
│   │   ├── useGame.ts
│   │   └── useSync.ts
│   │
│   ├── services/                     # External service adapters
│   │   ├── supabase/
│   │   │   ├── auth.ts               # Auth helpers (login, register, logout, session)
│   │   │   ├── profileService.ts
│   │   │   ├── progressionService.ts
│   │   │   └── economyService.ts
│   │   └── storage/
│   │       ├── asyncStorage.ts       # Typed AsyncStorage helpers (get/set/remove with JSON)
│   │       └── localRepository.ts   # All local read/write operations (wraps asyncStorage)
│   │
│   ├── constants/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── layout.ts
│   │   └── gameConfig.ts
│   │
│   ├── locales/
│   │   ├── ar.json
│   │   ├── fr.json
│   │   └── en.json
│   │
│   ├── types/
│   │   ├── player.types.ts
│   │   ├── economy.types.ts
│   │   ├── game.types.ts
│   │   ├── shop.types.ts
│   │   ├── events.types.ts
│   │   └── stage2.types.ts           # Stubs only — do not implement
│   │
│   └── utils/
│       ├── supabase.ts               # Supabase client singleton (see §13)
│       ├── random.ts
│       ├── formatDZD.ts
│       ├── ageGroup.ts
│       └── logger.ts
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
│
├── __tests__/
│   ├── systems/
│   ├── hooks/
│   └── components/
│
├── app.json                          # Expo config (SDK 55 uses app.json, not app.config.ts by default)
├── expo-env.d.ts                     # Expo auto-generated environment types
├── global.css                        # NativeWind / global styles if used
├── tsconfig.json
├── bun.lock                          # Bun is the package manager for this project
└── ARCHITECTURE.md
```

### Key SDK 55 Layout Rules

> **The coding agent must follow these rules without exception.**

1. **All source code lives under `src/`.** Routes, components, hooks, stores, systems, services, utils — everything is under `src/`. Nothing meaningful lives at the root except config files and the `assets/` folder.

2. **`src/app/` is the Expo Router root.** The `app.json` `"expo.router.root"` field points to `src/app`. Confirm this is set in `app.json`:

   ```json
   {
     "expo": {
       "router": { "root": "src/app" }
     }
   }
   ```

3. **Assets stay at the project root** under `assets/`. Metro resolves assets relative to `app.json`, not `src/`. Do not move assets into `src/assets/`.

4. **The Supabase client lives at `src/utils/supabase.ts`** and is the only file that calls `createClient`. See §13 for the exact initialization pattern including the correct env var name (`EXPO_PUBLIC_SUPABASE_KEY`).

5. **`bun` is the package manager.** All install commands use `bun add`, not `npm install` or `yarn add`.

6. **The root layout (`src/app/_layout.tsx`) follows the established pattern:** it wraps the app in `ThemeProvider` (from `@react-navigation/native`), renders the `AnimatedSplashOverlay`, and delegates tab structure to the `AppTabs` component. New screens and navigators are added by extending `AppTabs` or its child navigators — not by restructuring `_layout.tsx`.

   ```tsx
   // src/app/_layout.tsx — established pattern, do not restructure
   import {
     DarkTheme,
     DefaultTheme,
     ThemeProvider,
   } from "@react-navigation/native";
   import React from "react";
   import { useColorScheme } from "react-native";
   import { AnimatedSplashOverlay } from "@/components/animated-icon";
   import AppTabs from "@/components/app-tabs";

   export default function TabLayout() {
     const colorScheme = useColorScheme();
     return (
       <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
         <AnimatedSplashOverlay />
         <AppTabs />
       </ThemeProvider>
     );
   }
   ```

   The onboarding gate, auth gate, and store hydration must be handled **inside `AppTabs`** (or a wrapper around it), not by adding logic to `_layout.tsx`.

7. **`src/components/app-tabs.tsx` is the navigation hub.** It defines the tab bar (Map tab and Shop tab) and any stack navigators nested within tabs. The game screens are pushed onto the Map tab's stack — they are not separate route groups. `app-tabs.web.tsx` is the web variant and must be kept in sync with any navigation changes.

---

## 4. Module Architecture

The codebase is split into three tiers. The coding agent must respect these dependency boundaries:

```
┌─────────────────────────────────────────────────┐
│                   TIER 1: UI                    │
│  app/ routes  +  src/components/                │
│  (React Native, Expo Router, Reanimated)        │
└───────────────────────┬─────────────────────────┘
                        │ calls hooks only
┌───────────────────────▼─────────────────────────┐
│               TIER 2: LOGIC                     │
│  src/hooks/  +  src/store/  +  src/systems/     │
│  (Zustand, pure TypeScript engines)             │
└───────────────────────┬─────────────────────────┘
                        │ calls services only
┌───────────────────────▼─────────────────────────┐
│               TIER 3: DATA                      │
│  src/services/  (MMKV, Supabase, SyncQueue)     │
└─────────────────────────────────────────────────┘
```

**Rule:** UI components import hooks. Hooks import stores and systems. Systems import services. No tier imports from a higher tier. This ensures the game logic can run in tests with no UI and no network.

---

## 5. Data Models

### 5.1 Player Profile

```typescript
// src/types/player.types.ts

export type Language = "ar" | "fr" | "en";
export type AvatarBase = "boy" | "girl";

export interface PlayerProfile {
  id: string; // UUID, generated locally on first launch
  name: string;
  age: number; // Used for difficulty scaling
  language: Language;
  avatarBase: AvatarBase;
  equippedItems: EquippedItems;
  createdAt: string; // ISO 8601
  supabaseUserId?: string; // Only present if account created
}

export interface EquippedItems {
  head?: string; // item ID
  body?: string;
  feet?: string;
  accessory?: string;
  background?: string;
}
```

### 5.2 Economy

```typescript
// src/types/economy.types.ts

export interface EconomyState {
  balanceDZD: number; // Current spendable balance
  totalEarnedDZD: number; // Lifetime earned (for analytics)
  totalSpentDZD: number; // Lifetime spent
  xp: number; // Total XP
  level: number; // Derived from XP thresholds
  transactions: Transaction[]; // Last 50 transactions (ring buffer)
}

export type TransactionType =
  | "GAME_REWARD"
  | "SHOP_PURCHASE"
  | "HARD_SITUATION_COST"
  | "HARD_SITUATION_XP_PENALTY"
  | "HARD_SITUATION_XP_REWARD";

export interface Transaction {
  id: string;
  type: TransactionType;
  amountDZD: number; // Positive = credit, negative = debit
  amountXP: number;
  timestamp: string;
  sourceId: string; // game node ID, shop item ID, or event ID
  balanceAfter: number;
}
```

### 5.3 Map Progression

```typescript
// src/types/game.types.ts

export type GameType =
  | "BUBBLE_POP"
  | "MAZE"
  | "PUZZLE"
  | "MEMORY_MATCH"
  | "SORTING";

export type NodeStatus = "LOCKED" | "UNLOCKED" | "COMPLETED" | "REPLAYING";

export interface MapNode {
  id: string;
  order: number; // Position along the path (0-indexed)
  gameType: GameType;
  difficulty: 1 | 2 | 3; // Scales with position on map
  reward: NodeReward;
  prerequisites: string[]; // IDs of nodes that must be completed first
}

export interface NodeReward {
  xp: number;
  dzd: number;
}

export interface PlayerProgression {
  nodeStatuses: Record<string, NodeStatus>;
  currentNodeId: string | null;
  lastPlayedAt: string | null;
  totalNodesCompleted: number;
}
```

### 5.4 Shop Items

```typescript
// src/types/shop.types.ts

export type ItemCategory =
  | "NEED" // Essential: food, basic clothing, backpack
  | "DESIRE"; // Non-essential: snacks, fashion, toys

export type ItemSlot = "head" | "body" | "feet" | "accessory" | "background";

export interface ShopItem {
  id: string;
  nameKey: string; // i18n key for localized name
  descriptionKey: string;
  category: ItemCategory;
  slot: ItemSlot;
  priceDZD: number;
  imageAsset: string; // require() path or asset URI
  isAvailableFromLevel: number;
}

export interface PlayerInventory {
  ownedItemIds: string[];
  equippedItems: EquippedItems;
}
```

### 5.5 Hard Situation Events

```typescript
// src/types/events.types.ts

export type HardSituationTrigger =
  | "RANDOM_ON_MAP_ENTER" // Fires at configurable probability when player returns to map
  | "AFTER_N_GAMES" // Fires after completing N games since last event
  | "BALANCE_THRESHOLD"; // Fires when balance exceeds a threshold (tests impulse spending)

export interface HardSituation {
  id: string;
  titleKey: string;
  descriptionKey: string;
  illustrationAsset: string;
  trigger: HardSituationTrigger;
  triggerConfig: Record<string, number>;
  choices: HardSituationChoice[];
}

export interface HardSituationChoice {
  id: string;
  labelKey: string;
  costDZD: number; // 0 if free choice
  outcome: HardSituationOutcome;
}

export interface HardSituationOutcome {
  xpDelta: number; // Positive or negative
  dzdDelta: number; // Usually 0 or negative (cost already deducted)
  feedbackTitleKey: string;
  feedbackBodyKey: string;
  feedbackSentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
}
```

### 5.6 Supabase DB Schema (SQL)

```sql
-- supabase/migrations/001_initial_schema.sql

-- Profiles table mirrors PlayerProfile
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age SMALLINT NOT NULL,
  language TEXT NOT NULL DEFAULT 'ar',
  avatar_base TEXT NOT NULL DEFAULT 'boy',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Economy snapshot (denormalized for fast sync)
CREATE TABLE economy_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  balance_dzd INTEGER NOT NULL DEFAULT 0,
  total_earned_dzd INTEGER NOT NULL DEFAULT 0,
  total_spent_dzd INTEGER NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL DEFAULT 0,
  level SMALLINT NOT NULL DEFAULT 1,
  synced_at TIMESTAMPTZ DEFAULT now()
);

-- Progression snapshot
CREATE TABLE progression_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  node_statuses JSONB NOT NULL DEFAULT '{}',
  total_nodes_completed SMALLINT NOT NULL DEFAULT 0,
  synced_at TIMESTAMPTZ DEFAULT now()
);

-- Inventory snapshot
CREATE TABLE inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  owned_item_ids TEXT[] NOT NULL DEFAULT '{}',
  equipped_items JSONB NOT NULL DEFAULT '{}',
  synced_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: users can only see and modify their own data
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE progression_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their profile"
  ON profiles FOR ALL
  USING (supabase_user_id = auth.uid());

-- Mirror policy for all snapshot tables
CREATE POLICY "Users own their economy"
  ON economy_snapshots FOR ALL
  USING (profile_id IN (SELECT id FROM profiles WHERE supabase_user_id = auth.uid()));
```

---

## 6. State Management

All global state lives in **Zustand** stores. AsyncStorage persistence is applied via Zustand's built-in `persist` middleware. The coding agent must not use React Context for game state.

```typescript
// src/store/economyStore.ts — example store shape

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface EconomyStore extends EconomyState {
  earnDZD: (amount: number, xp: number, sourceId: string) => void;
  spendDZD: (amount: number, sourceId: string) => boolean; // returns false if insufficient
  applyXPDelta: (xpDelta: number, sourceId: string) => void;
  reset: () => void;
}

export const useEconomyStore = create<EconomyStore>()(
  persist(
    (set, get) => ({
      balanceDZD: 0,
      totalEarnedDZD: 0,
      totalSpentDZD: 0,
      xp: 0,
      level: 1,
      transactions: [],
      earnDZD: (amount, xp, sourceId) => {
        /* ... */
      },
      spendDZD: (amount, sourceId) => {
        if (get().balanceDZD < amount) return false;
        /* deduct and log */ return true;
      },
      applyXPDelta: (xpDelta, sourceId) => {
        /* ... */
      },
      reset: () => set(INITIAL_ECONOMY_STATE),
    }),
    {
      name: "kidinvest.economy", // AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
```

### Store Dependency Graph

```
playerStore        — profile, avatar, language (no deps)
economyStore       — balance, XP, transactions (no deps)
progressionStore   — node statuses (reads economyStore.level)
shopStore          — inventory, equipped (reads economyStore.balanceDZD)
sessionStore       — active game, pending events (ephemeral, NOT persisted)
```

`sessionStore` is the only store that is **not** persisted. It holds transient runtime state (current game session, queued hard situation events) and is reset on app restart.

---

## 7. Offline-First Strategy

The app is fully playable with no network connection. Supabase is a cloud backup layer, not the primary data store.

### Read Path (App Launch)

```
1. Read from AsyncStorage via Zustand persist middleware (automatic on store hydration)
2. Zustand stores rehydrate with persisted data before first render
3. If user has supabaseUserId AND network available → background sync (non-blocking)
```

### Write Path (All Actions)

```
1. Write to Zustand store immediately (optimistic)
2. Zustand persist middleware writes to AsyncStorage asynchronously
3. If supabaseUserId exists → append mutation to SyncQueue (AsyncStorage-backed)
4. SyncEngine drains queue when network becomes available
```

### SyncQueue Schema

```typescript
// src/systems/sync/SyncQueue.ts

const SYNC_QUEUE_KEY = "kidinvest.syncQueue";

export interface SyncMutation {
  id: string;
  table: "economy_snapshots" | "progression_snapshots" | "inventory_snapshots";
  payload: Record<string, unknown>;
  timestamp: string;
  retryCount: number;
}

// Stored as a JSON array in AsyncStorage under SYNC_QUEUE_KEY.
// SyncEngine collapses older mutations for the same table into the latest snapshot
// before pushing, so the queue never grows unbounded.
// Conflict strategy: LAST_WRITE_WINS (local always wins — child's device is authoritative).
```

### Conflict Resolution Policy

Local state **always wins** over remote state. When a child logs in on a new device, Supabase data is loaded only if local MMKV has no existing profile. This prevents cloud data from overwriting progress earned offline. The UX presents a choice: "Continue as [Name]" (use cloud) or "Start fresh."

---

## 8. Navigation Architecture

The project uses Expo Router for file-based routing at the `src/app/` level, but the primary tab navigation is encapsulated in the `AppTabs` component (`src/components/app-tabs.tsx`), which is rendered by the root `_layout.tsx`. This is the established pattern — do not dissolve `AppTabs` into file-based route groups.

### Route Structure

```
src/app/
  _layout.tsx                 → Root: ThemeProvider + AnimatedSplashOverlay + AppTabs
  index.tsx                   → Entry redirect (resolves to map tab or onboarding)

src/components/
  app-tabs.tsx                → Tab navigator: Map tab + Shop tab
  app-tabs.web.tsx            → Web variant (keep in sync)
```

Game screens are pushed onto the **Map tab's internal stack navigator** inside `AppTabs`. They are not top-level Expo Router routes. This keeps the tab bar present during gameplay dismissal and allows the map to stay mounted underneath the game.

```
AppTabs
├── Map Tab (Stack Navigator)
│   ├── map.tsx               ← Default screen
│   ├── bubble-pop.tsx        ← Pushed on node tap
│   ├── maze.tsx
│   ├── puzzle.tsx
│   ├── memory-match.tsx
│   └── sorting.tsx
└── Shop Tab (Stack Navigator)
    └── shop.tsx              ← Default screen
```

Onboarding screens are a **modal stack** presented over `AppTabs`:

```
src/app/
  (onboarding)/
    _layout.tsx               → Modal stack
    language.tsx
    avatar.tsx
    profile.tsx
```

The onboarding gate and auth gate logic live in `AppTabs` (or a `SessionGate` wrapper inside it). They check AsyncStorage for `onboardingComplete` and `supabaseUserId` on mount, and conditionally present the onboarding modal.

Auth screens are accessed from within the Shop tab via a settings icon:

```
src/app/
  (auth)/
    _layout.tsx
    login.tsx
    register.tsx
```

### Map ↔ Shop Transition (Priority Design)

The tab bar between Map and Shop must feel **instant and contextual**. Implementation requirements:

- The tab bar is defined inside `AppTabs` (`src/components/app-tabs.tsx`). Customize it there — not in `_layout.tsx`.
- The Shop tab badge shows current DZD balance so the child always sees their wallet.
- When returning from a game to the map, the `RewardPopup` component animates as an absolute overlay **within the Map stack screen** — not a new route — so the map remains mounted underneath.
- Shared element transition: the `WalletDisplay` component appears identically in both the map header and the shop header. Use `Reanimated.SharedTransition` with a shared tag `wallet-display` to animate the balance number across the tab switch.

---

## 9. Mini-Game System

### Base Contract

Every mini-game engine implements this interface. The coding agent must not diverge from it.

```typescript
// src/systems/games/BaseGameEngine.ts

export interface GameConfig {
  nodeId: string;
  difficulty: 1 | 2 | 3;
  playerAge: number;
}

export interface GameResult {
  success: boolean;
  scorePercent: number; // 0–100, used to scale reward
  timeTakenMs: number;
  earnedDZD: number;
  earnedXP: number;
}

export interface BaseGameEngine {
  init(config: GameConfig): void;
  getState(): unknown; // Game-specific state, typed in subclass
  tick(deltaMs: number): void;
  handleInput(event: GameInputEvent): void;
  isComplete(): boolean;
  getResult(): GameResult;
  cleanup(): void;
}
```

### Difficulty Scaling Table

| Difficulty | Trigger    | Bubble Pop      | Maze       | Puzzle    | Memory Match | Sorting          |
| ---------- | ---------- | --------------- | ---------- | --------- | ------------ | ---------------- |
| 1          | Nodes 1–5  | 30s, 8 bubbles  | 5×5 grid   | 9 pieces  | 8 pairs      | 6 items, 2 bins  |
| 2          | Nodes 6–12 | 20s, 12 bubbles | 7×7 grid   | 16 pieces | 12 pairs     | 10 items, 3 bins |
| 3          | Nodes 13+  | 15s, 18 bubbles | 10×10 grid | 25 pieces | 16 pairs     | 16 items, 4 bins |

Age modifier: if `playerAge <= 6`, always use difficulty 1 regardless of node position.

### Reward Calculation

```typescript
// src/systems/economy/EconomyEngine.ts

export function calculateGameReward(
  node: MapNode,
  scorePercent: number,
): { dzd: number; xp: number } {
  const baseDZD = node.reward.dzd;
  const baseXP = node.reward.xp;
  // Scale linearly: full reward at 100%, minimum 40% at 0%
  const multiplier = 0.4 + (scorePercent / 100) * 0.6;
  return {
    dzd: Math.round(baseDZD * multiplier),
    xp: Math.round(baseXP * multiplier),
  };
}
```

### Game Launch Flow

```
User taps MapNode → progressionStore.canPlay(nodeId) check
  → navigate to (games)/[gameType]?nodeId=xxx
  → GameScreen reads config from MapConfig.ts
  → instantiates engine via GameEngineFactory
  → on isComplete() → getResult() → EconomyEngine.earnDZD()
  → navigate back to map with { reward } param
  → RewardPopup modal overlay shown over map
```

---

## 10. Economy System

### DZD Values Reference

```typescript
// src/systems/economy/PricingConfig.ts

export const PRICING = {
  // Mini-game base rewards
  games: {
    BUBBLE_POP: { dzd: 50, xp: 20 },
    MAZE: { dzd: 70, xp: 30 },
    PUZZLE: { dzd: 60, xp: 25 },
    MEMORY_MATCH: { dzd: 80, xp: 35 },
    SORTING: { dzd: 55, xp: 22 },
  },
  // Hard situation costs (illustrative; full list in EventRegistry)
  events: {
    UMBRELLA: { cost: 200 },
    BACKPACK: { cost: 500 },
  },
  // XP thresholds per level
  xpLevels: [0, 100, 250, 500, 900, 1400, 2100, 3000],
} as const;
```

### Shop Item Price Tiers

| Category         | Examples              | Price Range (DZD) |
| ---------------- | --------------------- | ----------------- |
| NEED – Food      | Bread, fruit          | 50–150            |
| NEED – Clothing  | Basic shirt, shoes    | 200–400           |
| NEED – School    | Backpack, pencils     | 400–600           |
| DESIRE – Snacks  | Candy, chips          | 80–200            |
| DESIRE – Fashion | Fancy hat, sunglasses | 300–700           |
| DESIRE – Toys    | Toy plane, ball       | 500–1,200         |

### Economic Balance Invariant

The `EconomyEngine.spendDZD()` function must always check `balanceDZD >= amount` before executing. The shop UI must pre-validate and disable items the child cannot afford. **The balance must never go negative.**

---

## 11. Hard Situation Event System

### Event Registry

Two events are defined initially. The registry is extensible — adding a new event requires only adding an entry to `EventRegistry.ts` and supplying localization keys and an illustration asset.

```typescript
// src/systems/events/EventRegistry.ts

export const HARD_SITUATION_EVENTS: HardSituation[] = [
  {
    id: "RAINSTORM",
    titleKey: "events.rainstorm.title",
    descriptionKey: "events.rainstorm.description",
    illustrationAsset: require("@/assets/images/events/rainstorm.svg"),
    trigger: "RANDOM_ON_MAP_ENTER",
    triggerConfig: { probability: 0.25, cooldownGames: 3 },
    choices: [
      {
        id: "BUY_UMBRELLA",
        labelKey: "events.rainstorm.choices.buy",
        costDZD: 200,
        outcome: {
          xpDelta: 20,
          dzdDelta: 0,
          feedbackTitleKey: "events.rainstorm.outcome.bought.title",
          feedbackBodyKey: "events.rainstorm.outcome.bought.body",
          feedbackSentiment: "POSITIVE",
        },
      },
      {
        id: "SKIP_NO_MONEY",
        labelKey: "events.rainstorm.choices.skip",
        costDZD: 0,
        outcome: {
          xpDelta: -15,
          dzdDelta: 0,
          feedbackTitleKey: "events.rainstorm.outcome.skipped.title",
          feedbackBodyKey: "events.rainstorm.outcome.skipped.body",
          feedbackSentiment: "NEGATIVE",
        },
      },
    ],
  },
  {
    id: "SCHOOL_ENTRY",
    titleKey: "events.school.title",
    descriptionKey: "events.school.description",
    illustrationAsset: require("@/assets/images/events/school.svg"),
    trigger: "AFTER_N_GAMES",
    triggerConfig: { n: 5 },
    choices: [
      {
        id: "BUY_BACKPACK",
        labelKey: "events.school.choices.backpack",
        costDZD: 500,
        outcome: {
          xpDelta: 40,
          dzdDelta: 0,
          feedbackTitleKey: "...",
          feedbackBodyKey: "...",
          feedbackSentiment: "POSITIVE",
        },
      },
      {
        id: "BUY_TOY_PLANE",
        labelKey: "events.school.choices.toyplane",
        costDZD: 500,
        outcome: {
          xpDelta: -20,
          dzdDelta: 0,
          feedbackTitleKey: "...",
          feedbackBodyKey: "...",
          feedbackSentiment: "NEGATIVE",
        },
      },
    ],
  },
];
```

### Event Scheduling Logic

```typescript
// src/systems/events/HardSituationEngine.ts

export class HardSituationEngine {
  // Called by the map screen every time the player returns to the map
  evaluateTriggers(context: TriggerContext): HardSituation | null {
    // 1. Check cooldown (no event if last event was < cooldownGames games ago)
    // 2. Filter RANDOM_ON_MAP_ENTER events, roll probability
    // 3. Check AFTER_N_GAMES events against context.gamesSinceLastEvent
    // 4. Return the first matching event or null
    // 5. Store triggered event ID + timestamp in sessionStore.pendingEvent
  }
}
```

The `HardSituationOverlay` component is rendered inside the map screen as an absolutely-positioned fullscreen overlay, animated in via Reanimated when `sessionStore.pendingEvent` is non-null.

---

## 12. Avatar Shop System

### Needs vs. Desires Teaching Mechanic

The shop does **not** lecture. It teaches through natural consequences:

- Items tagged `NEED` display a small green "حاجة / Besoin / Need" badge.
- Items tagged `DESIRE` display a yellow "رغبة / Désir / Want" badge.
- When a Hard Situation event fires after the child spent on Desires, the feedback message explicitly references what they bought: _"You spent your money on a toy plane. You didn't have enough for your backpack."_
- The `useHardSituation` hook reads recent `transactions` from `economyStore` to generate contextual feedback.

### Shop Item Unlock Logic

Items become visible in the shop based on `isAvailableFromLevel`. The `ShopGrid` component filters `ALL_SHOP_ITEMS` against `progressionStore.level` to show only age-appropriate inventory.

### Avatar Rendering Architecture

The avatar is built as layered SVG. The rendering order is:

```
1. Background (optional purchased background)
2. Base sprite (boy or girl — fixed)
3. Feet layer (shoes)
4. Body layer (shirt/outfit)
5. Head layer (hat/hair accessory)
6. Accessory layer (glasses, bag)
```

`AvatarRenderer.tsx` uses `react-native-svg` and accepts `EquippedItems`. Each layer is a separate SVG asset. The `AvatarPreview` in the shop shows the full equipped avatar updating in real time as the child taps items.

---

## 13. Supabase Integration

### Client Singleton — `src/utils/supabase.ts`

The Supabase client is initialized **once** in `src/utils/supabase.ts` and imported wherever needed. This is the file already in the project. No other file may call `createClient`.

```typescript
// src/utils/supabase.ts — do not modify this initialization pattern

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!, // ← env var is KEY, not ANON_KEY
  {
    auth: {
      storage: AsyncStorage, // Persist JWT session across app restarts
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Required for React Native (no URL scheme parsing)
    },
  },
);
```

> **Why `EXPO_PUBLIC_SUPABASE_KEY` and not `EXPO_PUBLIC_SUPABASE_ANON_KEY`?** The project's `.env` uses `EXPO_PUBLIC_SUPABASE_KEY`. The coding agent must use this exact name — do not rename it.

> **Why AsyncStorage for auth session storage?** The Supabase auth SDK manages the JWT internally using whichever storage adapter is passed. AsyncStorage is the standard adapter for React Native and is already a project dependency. All game data (balance, progression, inventory) is also stored via AsyncStorage through the Zustand persist middleware, so there is a single consistent storage layer.

Environment variables are defined in `.env.local` and exposed via the `EXPO_PUBLIC_` prefix (Expo SDK 55 standard):

```
# .env.local
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
```

### Auth Flow

```
Guest mode (default):
  - supabaseUserId = undefined in playerStore
  - All game data stays in MMKV only
  - supabase.auth.getSession() returns null — no network calls made

Account creation (optional, from Settings):
  1. User opens (auth)/register.tsx
  2. Call supabase.auth.signUp({ email, password })
  3. On success: write supabaseUserId to playerStore via MMKV
  4. SyncEngine.pushAll() — uploads all local snapshots to Supabase
  5. Future launches: SyncEngine runs in background if session exists

Device recovery:
  1. User opens (auth)/login.tsx on new device
  2. Call supabase.auth.signInWithPassword({ email, password })
  3. SyncEngine.pullAll() — fetches snapshots from Supabase
  4. If local MMKV has no profile: apply cloud data silently
  5. If local MMKV has existing profile: show "Continue as [Name]?" prompt
  6. On confirm: overwrite MMKV with cloud data and reload stores
```

### Service Layer Pattern

All Supabase table queries are isolated inside `src/services/supabase/`. Components and stores import only from this layer — never from `src/utils/supabase.ts` directly. The client singleton is an internal detail of the service layer.

```typescript
// src/services/supabase/economyService.ts

import { supabase } from "@/utils/supabase";
import type { EconomyState } from "@/types/economy.types";

export async function pushEconomySnapshot(
  profileId: string,
  snapshot: EconomyState,
): Promise<void> {
  const { error } = await supabase
    .from("economy_snapshots")
    .upsert({ profile_id: profileId, ...serializeEconomy(snapshot) });
  if (error) throw new SupabaseSyncError(error.message);
}

export async function pullEconomySnapshot(
  profileId: string,
): Promise<EconomyState | null> {
  const { data, error } = await supabase
    .from("economy_snapshots")
    .select("*")
    .eq("profile_id", profileId)
    .single();
  if (error || !data) return null;
  return deserializeEconomy(data);
}
```

### Auth Helper — `src/services/supabase/auth.ts`

```typescript
// src/services/supabase/auth.ts
// Wraps supabase.auth.* so calling code never imports the client directly.

import { supabase } from "@/utils/supabase";

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}

export function onAuthStateChange(
  callback: Parameters<typeof supabase.auth.onAuthStateChange>[0],
) {
  return supabase.auth.onAuthStateChange(callback);
}
```

````

---

## 14. Localization

### Locale Files

All user-visible strings live in `src/locales/{ar,fr,en}.json`. The coding agent must **never** hardcode Arabic, French, or English strings inside component JSX.

```json
// src/locales/ar.json (excerpt)
{
  "onboarding": {
    "language": { "title": "اختر لغتك" },
    "avatar": { "title": "اختر شخصيتك" },
    "profile": { "nameLabel": "ما اسمك؟", "agePlaceholder": "عمرك" }
  },
  "map": {
    "title": "جزيرة المال",
    "locked": "مغلق"
  },
  "shop": {
    "title": "متجر الشخصية",
    "balance": "رصيدك: {{amount}} د.ج"
  },
  "events": {
    "rainstorm": {
      "title": "الأمطار قادمة!",
      "description": "هل عندك ما يكفي لشراء مظلة؟"
    }
  }
}
````

### RTL Support

- Arabic requires RTL layout. Set `I18nManager.forceRTL(true)` when language is `'ar'` during onboarding. Persist the setting.
- All flex layouts must use `flexDirection: 'row'` (not start/end absolute positioning) so they mirror correctly under RTL.
- Test all screens in both RTL (Arabic) and LTR (French/English) before marking complete.

### Number Formatting

```typescript
// src/utils/formatDZD.ts
export function formatDZD(amount: number, locale: Language): string {
  const formatted = new Intl.NumberFormat(
    locale === "ar" ? "ar-DZ" : locale === "fr" ? "fr-DZ" : "en-DZ",
    { maximumFractionDigits: 0 },
  ).format(amount);
  return `${formatted} د.ج`;
}
```

---

## 15. Stage 2 Expansion Contract

Stage 2 (business simulation, ages 10–14) must not require restructuring the existing codebase. The following contracts must be honored during Stage 1 development:

### What Stage 1 must expose (do not break later)

| Contract                                    | Implementation                                                                                  |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `EconomyEngine` is stateless and injectable | Takes state as parameter, returns new state — no internal singletons                            |
| `BaseGameEngine` interface is stable        | Stage 2 mini-games (e.g., negotiation mini-game) implement the same interface                   |
| `MapConfig.ts` uses a typed node registry   | Stage 2 adds a second map config file; the router reads stage from `playerStore.stage`          |
| `ShopItem.category` uses a union type       | Stage 2 may add `'INVESTMENT'` as a new category — the union is already typed as `ItemCategory` |
| `PlayerProfile` has a `stage` field         | Defaults to `1`; Stage 2 unlocks when a progression milestone is reached                        |
| Route groups are stage-namespaced           | `(main)/` stays Stage 1; Stage 2 adds `(main-s2)/` as a parallel tab layout                     |

### Stubbed Stage 2 Types

```typescript
// src/types/stage2.types.ts
// These are stubs only. Do not implement — just ensure no name conflicts.

export interface Business {
  id: string;
  name: string;
  type: "SHOP" | "FARM" | "SERVICE";
  revenue: number;
  expenses: number;
}

export interface InvestmentOption {
  id: string;
  name: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  expectedReturnPercent: number;
}
```

---

## 16. Development Roadmap

### Phase 0 — Foundation (Week 1)

- [ ] Confirm `app.json` router root points to `src/app`
- [ ] AsyncStorage typed helpers (`src/services/storage/asyncStorage.ts`)
- [ ] Zustand stores scaffolded with AsyncStorage persist middleware
- [ ] Supabase project creation + RLS migration (`supabase/migrations/001_initial_schema.sql`)
- [ ] i18n setup with all three locale files (placeholder strings)
- [ ] `formatDZD` utility + RTL helper
- [ ] Design tokens (`src/constants/colors.ts`, `typography.ts`)
- [ ] `src/constants/theme.ts` extended with game-specific tokens (node colors, XP bar, shop badges)

### Phase 1 — Onboarding (Week 1–2)

- [ ] Language selection screen
- [ ] Avatar selection screen (boy/girl SVG)
- [ ] Name + age profile screen
- [ ] Onboarding completion flag in MMKV
- [ ] Root layout gate logic (onboarding vs. main)

### Phase 2 — Map Screen (Week 2–3) ⬅ Priority

- [ ] `IslandMap.tsx` with React Native Skia canvas
- [ ] `MapConfig.ts` — define first 8 nodes with game types and rewards
- [ ] `MapNode.tsx` — locked / unlocked / completed visual states
- [ ] `MapPath.tsx` — path connecting nodes
- [ ] `progressionStore` + `ProgressionEngine`
- [ ] `WalletDisplay` and `XPBar` in map header
- [ ] DZD balance badge on Shop tab inside `AppTabs` custom tab bar

### Phase 3 — Economy & Shop (Week 3–4) ⬅ Priority alongside Phase 2

- [ ] `economyStore` fully implemented with transaction logging
- [ ] `EconomyEngine.ts` — earn, spend, reward calculation
- [ ] `PricingConfig.ts` — first 15 shop items across all categories
- [ ] `ShopGrid.tsx` + `ShopItemCard.tsx`
- [ ] `AvatarRenderer.tsx` with layered SVG system
- [ ] `AvatarPreview.tsx` — live equip preview in shop
- [ ] Purchase flow with balance validation
- [ ] Map ↔ Shop shared transition for `WalletDisplay`

### Phase 4 — Mini-Games (Week 4–6)

- [ ] `BaseGameEngine.ts` interface
- [ ] `GameHeader`, `GameTimer`, `GameResultModal` shared components
- [ ] Bubble Pop game (start simple — tap targets on timer)
- [ ] Memory Match game
- [ ] Sorting game (drag-and-drop with `react-native-gesture-handler`)
- [ ] Maze game
- [ ] Puzzle game (most complex — save for last)
- [ ] `GameEngineFactory` routing by `GameType`
- [ ] Full reward flow: game → result → `RewardPopup` over map

### Phase 5 — Hard Situation Events (Week 6–7)

- [ ] `HardSituationEngine.ts` + `EventRegistry.ts`
- [ ] `HardSituationOverlay.tsx` animated entrance/exit
- [ ] Rainstorm event (assets + localization)
- [ ] School Entry event (assets + localization)
- [ ] Contextual feedback pulling from transaction history
- [ ] `NeedsVsDesiresTag` in shop item cards

### Phase 6 — Auth & Sync (Week 7–8)

- [ ] Optional login/register screens
- [ ] `SyncQueue` + `SyncEngine`
- [ ] Background sync on app launch
- [ ] Device recovery flow ("Continue as X?")
- [ ] Settings screen with logout option

### Phase 7 — Polish & QA (Week 8–9)

- [ ] Audio: background music + game SFX (Expo AV)
- [ ] All Lottie animations (reward pop, level up, event entrance)
- [ ] RTL audit across all screens (Arabic)
- [ ] Accessibility: minimum 44pt tap targets, readable font sizes for ages 6–9
- [ ] Offline regression tests (airplane mode flows)
- [ ] Jest unit tests for `EconomyEngine`, `HardSituationEngine`, `ProgressionEngine`
- [ ] Performance: Skia canvas frame rate profiling on low-end Android

---

## 17. Coding Conventions

### File Naming

| Type            | Convention                        | Example                  |
| --------------- | --------------------------------- | ------------------------ |
| React component | PascalCase `.tsx`                 | `ShopItemCard.tsx`       |
| Hook            | camelCase, `use` prefix           | `useEconomy.ts`          |
| Engine/system   | PascalCase, `Engine` suffix       | `EconomyEngine.ts`       |
| Store           | camelCase, `Store` suffix         | `economyStore.ts`        |
| Type file       | camelCase, `.types.ts`            | `economy.types.ts`       |
| Locale key      | dot-notation, snake_case segments | `events.rainstorm.title` |

### TypeScript Rules

- `strict: true` — no `any`, no non-null assertions unless documented
- All `HardSituation`, `ShopItem`, and `MapNode` arrays are typed as `readonly` const arrays
- Prefer `type` over `interface` for union types and mapped types; prefer `interface` for object shapes that may be extended

### Component Rules

- No business logic in components. Components call hooks only.
- No direct store imports in components. Use the corresponding hook (`useEconomy`, not `useEconomyStore`).
- Every component that touches DZD values must use `formatDZD(amount, language)` — never raw `toString()`.

### Import Conventions

- Always use the `@/` path alias (configured in `tsconfig.json`) for imports across `src/`. Never use relative `../../` paths that cross more than one directory level.
  - ✅ `import { supabase } from '@/utils/supabase'`
  - ❌ `import { supabase } from '../../utils/supabase'`
- Within the same folder, relative imports (`./sibling`) are acceptable.

### Import Conventions

- Always use the `@/` path alias for imports across `src/`. Never use relative `../../` paths crossing more than one directory level.
  - ✅ `import { supabase } from '@/utils/supabase'`
  - ❌ `import { supabase } from '../../utils/supabase'`
- Within the same folder, relative imports (`./sibling`) are acceptable.

### AsyncStorage Awareness

- Zustand's `persist` middleware with AsyncStorage is **asynchronous**. Stores are not hydrated synchronously on first render.
- Every screen that depends on persisted store data must handle the hydration state. Use a `useStoreHydration()` hook that checks `useStore.persist.hasHydrated()` and shows a loading state until true.
- The `sessionStore` is the only store that is **not** persisted — it holds transient runtime state (active game session, pending hard situation events) and resets on every app restart.

### Engine Rules

- All game engines are **pure classes** — no React imports, no store imports.
- Engines receive all dependencies via constructor injection.
- All randomness goes through `src/utils/random.ts` (seeded for testability).

---

_End of ARCHITECTURE.md — Last updated for KIDINVEST Stage 1, targeting Expo SDK 55._
