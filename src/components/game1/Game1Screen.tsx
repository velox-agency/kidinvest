import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Animated,
    Easing,
    I18nManager,
    Image,
    ImageBackground,
    type ImageSourcePropType,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useProgressStore } from '@/store/progressStore';

type Phase = 'countdown' | 'playing' | 'resultPending' | 'result';
type Denomination = 5 | 10 | 20 | 50 | 100 | 200;
type BubbleType = 'coin' | 'danger';

type BubbleConfig = {
  id: string;
  type: BubbleType;
  denomination: Denomination | 0;
  spawnAtMs: number;
  size: number;
  baseX: number;
  amplitude: number;
  periodMs: number;
  phaseOffset: number;
  speedMultiplier: number;
  penaltyAmount?: number;
};

type ActiveBubble = BubbleConfig & {
  y: number;
  spawnedAtMs: number;
};

type ParticleBurst = {
  id: string;
  x: number;
  y: number;
  createdAt: number;
  burstType: BubbleType;
};

type FloatingLabel = {
  id: string;
  x: number;
  y: number;
  value: number;
  createdAt: number;
  labelType: BubbleType;
};

type CoinKey = Denomination;

const GAME_DURATION_MS = 30_000;
const PRE_COUNTDOWN = ['3', '2', '1', 'GO'];
const TOTAL_BUBBLES = 22;
const RESULT_DELAY_MS = 600;
const RESULT_FADE_MS = 300;
const COUNT_UP_MS = 1000;
const REF_HEIGHT = 812;

const DENOMINATION_COUNTS: Record<Denomination, number> = {
  5: 4,
  10: 4,
  20: 4,
  50: 4,
  100: 3,
  200: 3,
};

const COIN_ASSETS: Record<CoinKey, ImageSourcePropType> = {
  5: require('../../../assets/images/coins/5da-KidInvestCurrency.png'),
  10: require('../../../assets/images/coins/10da-KidInvestCurrency.png'),
  20: require('../../../assets/images/coins/20da-KidInvestCurrency.png'),
  50: require('../../../assets/images/coins/50da-KidInvestCurrency.png'),
  100: require('../../../assets/images/coins/100da-KidInvestCurrency.png'),
  200: require('../../../assets/images/coins/200da-KidInvestCurrency.png'),
};

function mulberry32(seed: number) {
  return function rng() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleArray<T>(input: T[], rng: () => number) {
  const output = [...input];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatClock(millisecondsRemaining: number) {
  const totalSeconds = Math.max(0, Math.ceil(millisecondsRemaining / 1000));
  return `0:${String(totalSeconds).padStart(2, '0')}`;
}

function getScaleFactor(screenHeight: number) {
  return screenHeight / REF_HEIGHT;
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function prepareBubbles(scaleFactor: number, screenWidth: number) {
  const rng = mulberry32(Date.now() ^ (Math.random() * 0xffffffff));
  const denoms: Denomination[] = [];

  (Object.entries(DENOMINATION_COUNTS) as Array<[string, number]>).forEach(([key, count]) => {
    const denomination = Number(key) as Denomination;
    for (let index = 0; index < count; index += 1) {
      denoms.push(denomination);
    }
  });

  const shuffledDenoms = shuffleArray(denoms, rng);
  const coinSpawnTimes = Array.from({ length: TOTAL_BUBBLES }, (_, index) => {
    let base: number;
    if (index < 12) {
      base = (index / 12) * 15_000;
    } else {
      base = 15_000 + ((index - 12) / 23) * 14_600;
    }
    const jitter = (rng() * 2 - 1) * 250;
    return clamp(base + jitter, 0, GAME_DURATION_MS - 400);
  }).sort((left, right) => left - right);

  const margin = 50 * scaleFactor;

  const coinBubbles = Array.from({ length: TOTAL_BUBBLES }, (_, index) => {
    const size = (64 + rng() * 32) * scaleFactor;
    return {
      id: `bubble-${index}`,
      type: 'coin' as BubbleType,
      denomination: shuffledDenoms[index],
      spawnAtMs: coinSpawnTimes[index],
      size,
      baseX: clamp(margin + rng() * (screenWidth - margin * 2), margin, screenWidth - margin),
      amplitude: (12 + rng() * 6) * scaleFactor,
      periodMs: 1200 + rng() * 600,
      phaseOffset: rng() * Math.PI * 2,
      speedMultiplier: 0.85 + rng() * 0.3,
    } satisfies BubbleConfig;
  });

    const dangerSpawnTimes = [
    8_000  + rng() * 4_000,
    12_000 + rng() * 4_000,
    14_000 + rng() * 3_000,
    17_000 + rng() * 3_000,
    20_000 + rng() * 3_000,
    22_000 + rng() * 3_000,
    25_000 + rng() * 3_000,
    27_000 + rng() * 2_000,
    ].map((value) => clamp(value, 0, GAME_DURATION_MS - 400));

  const dangerBubbles = dangerSpawnTimes.map((spawnAtMs, index) => {
    const size = (72 + rng() * 20) * scaleFactor;
    return {
      id: `danger-${index}`,
      type: 'danger' as BubbleType,
      denomination: 0 as Denomination,
      penaltyAmount: [30, 50, 30, 75, 50, 30, 75, 50][index % 8],
      spawnAtMs,
      size,
      baseX: clamp(margin + rng() * (screenWidth - margin * 2), margin, screenWidth - margin),
      amplitude: (10 + rng() * 8) * scaleFactor,
      periodMs: 1000 + rng() * 800,
      phaseOffset: rng() * Math.PI * 2,
      speedMultiplier: 1.0 + rng() * 0.2,
    } satisfies BubbleConfig;
  });

  return [...coinBubbles, ...dangerBubbles].sort((left, right) => left.spawnAtMs - right.spawnAtMs);
}

function bubbleHitSlop(size: number) {
  const extra = size * 0.075;
  return { top: extra, bottom: extra, left: extra, right: extra };
}

function BubbleItem({
  bubble,
  currentTimeMs,
  onPop,
  frozen,
}: {
  bubble: ActiveBubble;
  currentTimeMs: number;
  onPop: (bubble: ActiveBubble, tapX: number, tapY: number) => void;
  frozen: boolean;
}) {
  const ageMs = Math.max(0, currentTimeMs - bubble.spawnedAtMs);
  const wobble = bubble.amplitude * Math.sin((ageMs / bubble.periodMs) * Math.PI * 2 + bubble.phaseOffset);
  const left = bubble.baseX - bubble.size / 2 + wobble;
  const top = bubble.y - bubble.size / 2;

  const handlePress = (event: any) => {
    if (frozen) {
      return;
    }
    const tapX = left + (event?.nativeEvent?.locationX ?? bubble.size / 2);
    const tapY = top + (event?.nativeEvent?.locationY ?? bubble.size / 2);
    onPop(bubble, tapX, tapY);
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={frozen}
      hitSlop={bubbleHitSlop(bubble.size)}
      onPress={handlePress}
      style={[
        styles.bubble,
        {
          width: bubble.size,
          height: bubble.size,
          left,
          top,
        },
      ]}>
      {bubble.type === 'danger' ? (
        <View
          style={{
            width: bubble.size,
            height: bubble.size,
            borderRadius: bubble.size / 2,
            backgroundColor: 'rgba(220, 38, 38, 0.85)',
            borderWidth: 2,
            borderColor: '#ff6b6b',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#ff6b6b',
            shadowOpacity: 0.45,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 0 },
          }}>
          <Text style={{ color: '#fff', fontSize: bubble.size * 0.45, lineHeight: bubble.size * 0.55, fontWeight: '900' }}>✕</Text>
          <Text
            style={{
              color: '#fff',
              fontSize: Math.max(9, bubble.size * 0.13),
              fontWeight: '900',
              marginTop: -4,
            }}>
            {`-${bubble.penaltyAmount ?? 50} DZD`}
          </Text>
        </View>
      ) : (
        <View style={{ width: bubble.size, height: bubble.size, position: 'relative' }}>
          <Image
            source={COIN_ASSETS[bubble.denomination as Denomination]}
            resizeMode="contain"
            style={{ width: bubble.size, height: bubble.size }}
          />
        </View>
      )}
    </Pressable>
  );
}

export default function Game1Screen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scaleFactor = getScaleFactor(height);
  const isRTL = I18nManager.isRTL;

  const plannedBubbles = React.useMemo(() => prepareBubbles(scaleFactor, width), [scaleFactor, width]);

  const [phase, setPhase] = React.useState<Phase>('countdown');
  const [countdownIndex, setCountdownIndex] = React.useState(0);
  const [displayRemainingMs, setDisplayRemainingMs] = React.useState(GAME_DURATION_MS);
  const [sessionTotal, setSessionTotal] = React.useState(0);
  const currentTimeMsRef = React.useRef(0);
  const [bubbles, setBubbles] = React.useState<ActiveBubble[]>([]);
  const [particles, setParticles] = React.useState<ParticleBurst[]>([]);
  const [labels, setLabels] = React.useState<FloatingLabel[]>([]);
  const [resultVisible, setResultVisible] = React.useState(false);
  const [resultOpacity] = React.useState(() => new Animated.Value(0));
  const [timerPulse] = React.useState(() => new Animated.Value(1));
  const [countUpCurrency, setCountUpCurrency] = React.useState(0);
  const [countUpXP, setCountUpXP] = React.useState(0);
  const phaseRef = React.useRef<Phase>('countdown');

  const bubbleQueueRef = React.useRef(plannedBubbles);
  const bubbleIndexRef = React.useRef(0);
  const poppedBubbleIdsRef = React.useRef<Set<string>>(new Set());
  const rafRef = React.useRef<number | null>(null);
  const frameStartRef = React.useRef<number | null>(null);
  const lastFrameRef = React.useRef<number | null>(null);
  const elapsedRef = React.useRef(0);
  const pausedAtRef = React.useRef<number | null>(null);
  const pausedAccumulatedRef = React.useRef(0);
  const exitDialogOpenRef = React.useRef(false);
  const lastDisplayedSecondsRef = React.useRef<number>(30);
  const countdownTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const countUpRafRef = React.useRef<number | null>(null);
  const resultActionedRef = React.useRef(false);
  const onCoinMissedRef = React.useRef<() => void>(() => {});
  const [gameFrozen, setGameFrozen] = React.useState(false);

  React.useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const completeLevel = useProgressStore((state) => state.completeLevel);
  const addCurrency = useProgressStore((state) => state.addCurrency);
  const addXP = useProgressStore((state) => state.addXP);

  const playTickSfx = React.useCallback(() => {
    // TODO: wire tick SFX if a project asset exists.
  }, []);

  const playPopSfx = React.useCallback(() => {
    // TODO: wire pop SFX if a project asset exists.
  }, []);

  const playCelebrationSfx = React.useCallback(() => {
    // TODO: wire celebration/applause SFX if a project asset exists.
  }, []);

  const addBurst = React.useCallback((x: number, y: number, burstType: BubbleType = 'coin') => {
    const now = performance.now();
    const burstId = `burst-${now}-${Math.random().toString(36).slice(2)}`;
    setParticles((current) => [...current, { id: burstId, x, y, createdAt: now, burstType }]);
  }, []);

  const addFloatingLabel = React.useCallback((x: number, y: number, value: number, labelType: BubbleType = 'coin') => {
    const now = performance.now();
    const labelId = `label-${now}-${Math.random().toString(36).slice(2)}`;
    setLabels((current) => [...current, { id: labelId, x, y, value, createdAt: now, labelType }]);
  }, []);

  const triggerTimerPulse = React.useCallback(() => {
    timerPulse.setValue(1);
    Animated.sequence([
      Animated.timing(timerPulse, {
        toValue: 1.08,
        duration: 170,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(timerPulse, {
        toValue: 1,
        duration: 170,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [timerPulse]);

  const startResultCountUp = React.useCallback((targetCurrency: number, targetXP: number) => {
    const start = performance.now();

    const animate = (now: number) => {
      const progress = clamp((now - start) / COUNT_UP_MS, 0, 1);
      const eased = easeOutCubic(progress);
      setCountUpCurrency(Math.round(targetCurrency * eased));
      setCountUpXP(Math.round(targetXP * eased));

      if (progress < 1) {
        countUpRafRef.current = requestAnimationFrame(animate);
        return;
      }

      setCountUpCurrency(targetCurrency);
      setCountUpXP(targetXP);
    };

    countUpRafRef.current = requestAnimationFrame(animate);
  }, []);

  const finishRound = React.useCallback(() => {
    if (phase === 'resultPending' || phase === 'result') {
      return;
    }

    setGameFrozen(true);
    setPhase('resultPending');

    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current);
    }

    resultTimeoutRef.current = setTimeout(() => {
      setResultVisible(true);
      setPhase('result');

      Animated.timing(resultOpacity, {
        toValue: 1,
        duration: RESULT_FADE_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          playCelebrationSfx();
          startResultCountUp(sessionTotal, 50);
        }
      });
    }, RESULT_DELAY_MS);
  }, [phase, playCelebrationSfx, resultOpacity, sessionTotal, startResultCountUp]);

  const handleExit = React.useCallback(() => {
    const navigateAway = () => router.replace('/games');
    const resumeGameplay = () => {
      if (pausedAtRef.current) {
        pausedAccumulatedRef.current += performance.now() - pausedAtRef.current;
        pausedAtRef.current = null;
      }
      exitDialogOpenRef.current = false;
    };

    const exitMessage = t('game1_exit_confirm');
    if (Platform.OS === 'web') {
      const confirmed = globalThis.confirm(exitMessage);
      if (confirmed) {
        navigateAway();
      }
      return;
    }

    exitDialogOpenRef.current = true;
    pausedAtRef.current = performance.now();
    Alert.alert(t('game1_title'), exitMessage, [
      {
        text: t('game1_exit_no'),
        style: 'cancel',
        onPress: resumeGameplay,
      },
      {
        text: t('game1_exit_yes'),
        style: 'destructive',
        onPress: navigateAway,
      },
    ], {
      cancelable: true,
      onDismiss: resumeGameplay,
    });
  }, [router, t]);

  const handleCoinMissed = React.useCallback(() => {
  setSessionTotal((current) => Math.max(0, current - 5));
}, []);

React.useEffect(() => {
  onCoinMissedRef.current = handleCoinMissed;
}, [handleCoinMissed]);

  const updateBubbles = React.useCallback((nowMs: number) => {
    if (exitDialogOpenRef.current) {
      lastFrameRef.current = nowMs;
      return;
    }

    const prevFrame = lastFrameRef.current ?? nowMs;
    lastFrameRef.current = nowMs;

    const elapsedMs = clamp(nowMs - (frameStartRef.current ?? nowMs) - pausedAccumulatedRef.current, 0, GAME_DURATION_MS);
    elapsedRef.current = elapsedMs;
    const remainingMs = Math.max(0, GAME_DURATION_MS - elapsedMs);
    const remainingSeconds = Math.ceil(remainingMs / 1000);

    currentTimeMsRef.current = elapsedMs;
    setDisplayRemainingMs(remainingMs);
    setParticles((current) => current.filter((particle) => nowMs - particle.createdAt <= 400));
    setLabels((current) => current.filter((label) => nowMs - label.createdAt <= 600));

    if (remainingSeconds !== lastDisplayedSecondsRef.current) {
      if (remainingSeconds <= 5 && remainingSeconds > 0) {
        triggerTimerPulse();
      }
      lastDisplayedSecondsRef.current = remainingSeconds;
    }

    // DEBUG: log every second
    const debugSecond = Math.floor(elapsedMs / 1000);
    if (debugSecond !== (updateBubbles as any)._lastLogSecond) {
      (updateBubbles as any)._lastLogSecond = debugSecond;
      console.log('[TICK] second:', debugSecond, 'bubbles in state:', bubbles.length);
    }

    const progress = elapsedMs / GAME_DURATION_MS;
    const easedProgress = progress * progress;
    const speed = (70 + easedProgress * 160) * scaleFactor;
    const spawnList = bubbleQueueRef.current;

    const toSpawn: ActiveBubble[] = [];

    while (bubbleIndexRef.current < spawnList.length && spawnList[bubbleIndexRef.current].spawnAtMs <= elapsedMs) {
      const config = spawnList[bubbleIndexRef.current];
      bubbleIndexRef.current += 1;

      toSpawn.push({
        ...config,
        y: height + config.size / 2 + 12 * scaleFactor,
        spawnedAtMs: elapsedMs,
      });
    }

    const deltaMs = clamp(nowMs - prevFrame, 0, 32);
    const currentSpeed = speed;
    const currentPopped = new Set(poppedBubbleIdsRef.current);

    setBubbles((current) => {
      const withSpawned = toSpawn.length > 0 ? [...current, ...toSpawn] : current;

      if (withSpawned.length === 0) {
        return withSpawned;
      }

      const next = withSpawned
        .map((bubble) => {
          if (toSpawn.some((spawnedBubble) => spawnedBubble.id === bubble.id)) {
            return bubble;
          }

          if (currentPopped.has(bubble.id)) {
            return null;
          }

            const nextY = bubble.y - currentSpeed * bubble.speedMultiplier * deltaMs / 1000;
            if (nextY + bubble.size / 2 < 0) {
            if (bubble.type === 'coin') {
                onCoinMissedRef.current();
            }
            return null;
            }

          return { ...bubble, y: nextY };
        })
        .filter(Boolean) as ActiveBubble[];

      return next;
    });

    if (remainingMs <= 0) {
      setPhase('resultPending');
      setGameFrozen(true);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      finishRound();
      return;
    }

  }, [finishRound, height, scaleFactor]);

  const updateBubblesRef = React.useRef(updateBubbles);

  React.useEffect(() => {
    updateBubblesRef.current = updateBubbles;
  }, [updateBubbles]);

  React.useEffect(() => {
    if (phase !== 'countdown') {
      return;
    }

    let active = true;
    let step = 0;

    const advance = () => {
      if (!active) {
        return;
      }

      setCountdownIndex(step);
      if (step < 3) {
        playTickSfx();
      }

      if (step === 3) {
        countdownTimeoutRef.current = setTimeout(() => {
          if (!active) {
            return;
          }

          setPhase('playing');
          frameStartRef.current = performance.now();
          lastFrameRef.current = frameStartRef.current;
          elapsedRef.current = 0;
        }, 1000);
        return;
      }

      step += 1;
      countdownTimeoutRef.current = setTimeout(advance, 1000);
    };

    countdownTimeoutRef.current = setTimeout(advance, 1000);

    return () => {
      active = false;
      if (countdownTimeoutRef.current) {
        clearTimeout(countdownTimeoutRef.current);
      }
    };
  }, [phase, playTickSfx, triggerTimerPulse, updateBubbles]);

  React.useEffect(() => {
    bubbleQueueRef.current = plannedBubbles;
    bubbleIndexRef.current = 0;
  }, [plannedBubbles]);

  React.useEffect(() => {
    if (phase !== 'playing') {
      return;
    }

    const tick = (now: number) => {
      updateBubblesRef.current(now);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [phase]);

  React.useEffect(() => {
    if (phase !== 'result') {
      return;
    }

    return () => {
      if (countUpRafRef.current) {
        cancelAnimationFrame(countUpRafRef.current);
      }
    };
  }, [phase]);

  React.useEffect(() => {
    return () => {
      if (countdownTimeoutRef.current) {
        clearTimeout(countdownTimeoutRef.current);
      }
      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (countUpRafRef.current) {
        cancelAnimationFrame(countUpRafRef.current);
      }
    };
  }, []);

  const handleBubblePop = React.useCallback(
    (bubble: ActiveBubble, tapX: number, tapY: number) => {
      if (phase !== 'playing') {
        return;
      }

      if (poppedBubbleIdsRef.current.has(bubble.id)) {
        return;
      }
      poppedBubbleIdsRef.current.add(bubble.id);

      playPopSfx();

      if (bubble.type === 'danger') {
        const penalty = bubble.penaltyAmount ?? 50;
        addBurst(tapX, tapY, 'danger');
        addFloatingLabel(tapX, tapY, -penalty, 'danger');
        setSessionTotal((current) => Math.max(0, current - penalty));
        return;
      }

      addBurst(tapX, tapY);
      addFloatingLabel(tapX, tapY, bubble.denomination as Denomination);
      setSessionTotal((current) => current + (bubble.denomination as Denomination));
    },
    [addBurst, addFloatingLabel, phase, playPopSfx]
  );

  const currentCountdownText = phase === 'countdown'
    ? PRE_COUNTDOWN[countdownIndex] ?? PRE_COUNTDOWN[PRE_COUNTDOWN.length - 1]
    : null;

  const handleResultAction = React.useCallback(
    async (target: 'map' | 'next') => {
      if (resultActionedRef.current) {
        return;
      }
      resultActionedRef.current = true;

      await addCurrency(sessionTotal);
      await addXP(50);
      await completeLevel(1);

      if (target === 'next') {
        router.replace('/level/2');
      } else {
        router.replace('/games');
      }
    },
    [addCurrency, addXP, completeLevel, router, sessionTotal]
  );

  const baseOverlayOpacity = resultOpacity;

  return (
    <ImageBackground
      source={require('@/assets/images/bg/Gemini_Generated_Image_kqxo49kqxo49kqxo (1).png')}
      resizeMode="cover"
      style={styles.screen}>
      <View style={styles.backgroundOverlay} />

      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
        <View style={[styles.topBar, { paddingTop: insets.top + Spacing.two, flexDirection: isRTL ? 'row-reverse' : 'row' }]}> 
          <Pressable accessibilityRole="button" onPress={handleExit} style={styles.exitButton}>
            <Text style={styles.exitIcon}>←</Text>
          </Pressable>

          <Animated.Text
            style={[
              styles.timer,
              {
                color: displayRemainingMs <= 5000 ? '#ef4444' : '#ffffff',
                transform: [{ scale: timerPulse }],
              },
            ]}>
            {formatClock(displayRemainingMs)}
          </Animated.Text>

          <View style={styles.earningsPill}>
            <Image
              source={COIN_ASSETS[20]}
              resizeMode="contain"
              style={styles.earningsIcon}
            />
            <Text style={styles.earningsText}>{`${sessionTotal} DZD`}</Text>
          </View>
        </View>

        <View style={styles.gameField} pointerEvents={phase === 'playing' ? 'auto' : 'none'}>
          {bubbles.map((bubble) => (
            <BubbleItem
              bubble={bubble}
              currentTimeMs={currentTimeMsRef.current}
              frozen={gameFrozen}
              key={bubble.id}
              onPop={handleBubblePop}
            />
          ))}

          {particles.map((particle) => {
            const age = Math.max(0, performance.now() - particle.createdAt);
            const progress = clamp(age / 400, 0, 1);
            const distance = 40 * scaleFactor * easeOutCubic(progress);
            return Array.from({ length: 6 }, (_, index) => {
              const angle = (Math.PI * 2 * index) / 6;
              const isGold = index % 2 === 0;

              return (
                <View
                  key={`${particle.id}-${index}`}
                  style={[
                    styles.particle,
                    {
                      opacity: 1 - progress,
                      width: 6 + index % 3 * 2,
                      height: 6 + index % 3 * 2,
                      backgroundColor: particle.burstType === 'danger'
                        ? (isGold ? '#ef4444' : '#fca5a5')
                        : (isGold ? '#C9A84C' : '#ffffff'),
                      left: particle.x + Math.cos(angle) * distance,
                      top: particle.y + Math.sin(angle) * distance,
                    },
                  ]}
                />
              );
            });
          })}

          {labels.map((label) => {
            const age = Math.max(0, performance.now() - label.createdAt);
            const progress = clamp(age / 600, 0, 1);
            return (
              <Text
                key={label.id}
                style={[
                  styles.scoreLabel,
                  {
                    opacity: 1 - progress,
                    transform: [{ translateY: -50 * easeOutCubic(progress) }],
                    left: label.x,
                    top: label.y,
                    color: label.labelType === 'danger' ? '#ef4444' : '#C9A84C',
                  },
                ]}>
                {`${label.value > 0 ? '+' : ''}${label.value} DZD`}
              </Text>
            );
          })}

          {phase === 'countdown' && currentCountdownText ? (
            <View style={styles.countdownWrap} pointerEvents="none">
              <Text style={styles.countdownText}>
                {currentCountdownText === 'GO' ? t('game1_countdown_go') : currentCountdownText}
              </Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>

      {resultVisible ? (
        <Animated.View style={[styles.resultBackdrop, { opacity: baseOverlayOpacity }]} pointerEvents="auto">
          <View style={styles.resultDim} />
          <View style={styles.resultCardWrap}>
            <View style={styles.resultCard}>
              <Text style={styles.trophy}>⭐</Text>
              <Text style={styles.resultTitle}>{t('game1_well_done')}</Text>
              <Text style={styles.resultSub}>{t('game1_collected_label')}</Text>

              <View style={styles.resultTotalRow}>
                <Image source={COIN_ASSETS[20]} resizeMode="contain" style={styles.resultCoin} />
                <Text style={styles.resultTotal}>{`${countUpCurrency} DZD`}</Text>
              </View>

              <Text style={styles.resultXp}>{countUpXP > 0 ? `+${countUpXP} XP` : t('game1_xp_earned')}</Text>

              <View style={styles.resultDivider} />

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void handleResultAction('next');
                }}
                style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>{`${t('game1_next_game')} →`}</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void handleResultAction('map');
                }}
                style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>{t('game1_back_to_map')}</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      ) : null}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 26, 0.32)',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  exitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.24)',
  },
  exitIcon: {
    fontSize: 24,
    fontWeight: '800',
  },
  timer: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  earningsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.24)',
  },
  earningsIcon: {
    width: 18,
    height: 18,
  },
  earningsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  gameField: {
    flex: 1,
    position: 'relative',
  },
  bubble: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  bubbleLabel: {
    color: '#fff',
    fontWeight: '800',
    marginTop: -4,
    textAlign: 'center',
  },
  countdownWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    color: '#fff',
    fontSize: 68,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 8 },
    textShadowRadius: 14,
  },
  particle: {
    position: 'absolute',
    borderRadius: 999,
  },
  scoreLabel: {
    position: 'absolute',
    color: '#C9A84C',
    fontSize: 16,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  resultBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  resultDim: {
    ...StyleSheet.absoluteFillObject,
  },
  resultCardWrap: {
    width: '100%',
    maxWidth: 420,
  },
  resultCard: {
    borderRadius: 28,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: Spacing.four,
    alignItems: 'center',
    gap: 8,
  },
  trophy: {
    fontSize: 48,
  },
  resultTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  resultSub: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    fontWeight: '700',
  },
  resultTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  resultCoin: {
    width: 28,
    height: 28,
  },
  resultTotal: {
    color: '#C9A84C',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  resultXp: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  resultDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 12,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 18,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    backgroundColor: '#C9A84C',
  },
  primaryButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
  },
  secondaryButton: {
    paddingVertical: Spacing.two,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
