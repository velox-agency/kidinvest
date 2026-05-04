import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessibilityInfo,
  Alert,
  Animated,
  Easing,
  I18nManager,
  Image,
  ImageBackground,
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

type GamePhase = 'playing' | 'timeup' | 'success';

type Cell = 0 | 1;
type CellPosition = { row: number; col: number };

type Direction = 'up' | 'down' | 'left' | 'right';

const GOLD = '#C9A84C';
const MAZE_ROWS = 9;
const MAZE_COLS = 7;
const START_ROW = 8;
const START_COL = 3;
const EXIT_ROW = 0;
const EXIT_COL = 3;
const REWARD_AMOUNT = 500;
const REWARD_XP = 50;
const TIMER_START_MS = 60_000;

const MAZE_GRID: Cell[][] = [
  [1, 1, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 1, 1],
  [1, 1, 1, 0, 1, 1, 1],
];

function formatClock(millisecondsRemaining: number) {
  const totalSeconds = Math.max(0, Math.ceil(millisecondsRemaining / 1000));
  return `0:${String(totalSeconds).padStart(2, '0')}`;
}

function getCellColor({
  isWall,
  isExit,
  isStart,
  isPlayer,
  isOnPath,
  isMovable,
}: {
  isWall: boolean;
  isExit: boolean;
  isStart: boolean;
  isPlayer: boolean;
  isOnPath: boolean;
  isMovable: boolean;
}) {
  if (isWall) return '#0f172a';
  if (isPlayer) return GOLD;
  if (isExit) return '#10b981';
  if (isStart) return '#1e3a5f';
  if (isMovable) return 'rgba(201, 168, 76, 0.35)';
  if (isOnPath) return 'rgba(201, 168, 76, 0.22)';
  return '#1a2744';
}

function isAdjacentCell(from: CellPosition, to: CellPosition) {
  return (
    (Math.abs(from.row - to.row) === 1 && from.col === to.col) ||
    (Math.abs(from.col - to.col) === 1 && from.row === to.row)
  );
}

function containsCell(cells: CellPosition[], row: number, col: number) {
  return cells.some((cell) => cell.row === row && cell.col === col);
}

export default function Game2Screen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isRTL = I18nManager.isRTL;

  const balance = useProgressStore((state) => state.balance);
  const completeLevel = useProgressStore((state) => state.completeLevel);
  const addCurrency = useProgressStore((state) => state.addCurrency);
  const addXP = useProgressStore((state) => state.addXP);

  const [gamePhase, setGamePhase] = React.useState<GamePhase>('playing');
  const [playerRow, setPlayerRow] = React.useState(START_ROW);
  const [playerCol, setPlayerCol] = React.useState(START_COL);
  const [visitedCells, setVisitedCells] = React.useState<CellPosition[]>([
    { row: START_ROW, col: START_COL },
  ]);
  const [moveHistory, setMoveHistory] = React.useState<CellPosition[]>([
    { row: START_ROW, col: START_COL },
  ]);
  const [moveCount, setMoveCount] = React.useState(0);
  const [timeRemainingMs, setTimeRemainingMs] = React.useState(TIMER_START_MS);
  const [timeupVisible, setTimeupVisible] = React.useState(false);
  const [successVisible, setSuccessVisible] = React.useState(false);
  const [timeupOpacity] = React.useState(() => new Animated.Value(0));
  const [successOpacity] = React.useState(() => new Animated.Value(0));
  const [timerPulse] = React.useState(() => new Animated.Value(1));
  const [timeBonusSeconds, setTimeBonusSeconds] = React.useState<number | null>(null);
  const resultActionedRef = React.useRef(false);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPulsedSecondRef = React.useRef<number | null>(null);

  const topBarHeight = insets.top + 56;
  const bottomControlsHeight = insets.bottom + 120;
  const availableWidth = screenWidth - 24;
  const availableHeight = screenHeight - topBarHeight - bottomControlsHeight - 24;
  const cellSize = Math.floor(Math.min(availableWidth / MAZE_COLS, availableHeight / MAZE_ROWS));
  const mazePixelWidth = cellSize * MAZE_COLS;
  const mazePixelHeight = cellSize * MAZE_ROWS;
  const mazeLeft = Math.max(12, Math.floor((screenWidth - mazePixelWidth) / 2));
  const mazeTop = topBarHeight + 12;

  const playTickPulse = React.useCallback(() => {
    timerPulse.setValue(1);
    Animated.sequence([
      Animated.timing(timerPulse, {
        toValue: 1.08,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(timerPulse, {
        toValue: 1,
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [timerPulse]);

  const stopTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetMaze = React.useCallback(() => {
    stopTimer();
    lastPulsedSecondRef.current = null;
    setPlayerRow(START_ROW);
    setPlayerCol(START_COL);
    setVisitedCells([{ row: START_ROW, col: START_COL }]);
    setMoveHistory([{ row: START_ROW, col: START_COL }]);
    setMoveCount(0);
    setTimeRemainingMs(TIMER_START_MS);
    setTimeBonusSeconds(null);
    setTimeupVisible(false);
    setSuccessVisible(false);
    timeupOpacity.setValue(0);
    successOpacity.setValue(0);
    setGamePhase('playing');
  }, [stopTimer, successOpacity, timeupOpacity]);

  const handleTimeUp = React.useCallback(() => {
    if (gamePhase !== 'playing') {
      return;
    }

    stopTimer();
    setGamePhase('timeup');
    setTimeupVisible(true);
    timeupOpacity.setValue(0);
    Animated.timing(timeupOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [gamePhase, stopTimer, timeupOpacity]);

  const handleWin = React.useCallback(() => {
    if (gamePhase !== 'playing') {
      return;
    }

    stopTimer();
    setGamePhase('success');
    setSuccessVisible(true);
    setTimeBonusSeconds(Math.max(0, Math.floor(timeRemainingMs / 1000)));
    successOpacity.setValue(0);
    Animated.timing(successOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      AccessibilityInfo.announceForAccessibility(`${t('game2_well_done')} ${t('game2_edu_message')}`);
    });
  }, [gamePhase, stopTimer, successOpacity, t, timeRemainingMs]);

  const handleCompleteAndNavigate = React.useCallback(
    async (target: 'next' | 'map') => {
      if (resultActionedRef.current) {
        return;
      }
      resultActionedRef.current = true;

      await addCurrency(REWARD_AMOUNT);
      await addXP(REWARD_XP);
      await completeLevel(2);

      if (target === 'next') {
        router.replace('/level/3');
      } else {
        router.replace('/games');
      }
    },
    [addCurrency, addXP, completeLevel, router]
  );

  const handleExit = React.useCallback(() => {
    const exitMessage = t('game2_exit_confirm');
    const navigateAway = () => router.replace('/games');

    if (Platform.OS === 'web') {
      const confirmed = globalThis.confirm(exitMessage);
      if (confirmed) {
        navigateAway();
      }
      return;
    }

    Alert.alert(t('game2_title'), exitMessage, [
      {
        text: t('game2_exit_no'),
        style: 'cancel',
      },
      {
        text: t('game2_exit_yes'),
        style: 'destructive',
        onPress: navigateAway,
      },
    ], {
      cancelable: true,
    });
  }, [router, t]);

  const movePlayer = React.useCallback(
    (row: number, col: number) => {
      if (gamePhase !== 'playing') {
        return;
      }

      if (row < 0 || row >= MAZE_ROWS || col < 0 || col >= MAZE_COLS) {
        return;
      }

      if (MAZE_GRID[row][col] === 1) {
        return;
      }

      const current = { row: playerRow, col: playerCol };
      const target = { row, col };

      if (!isAdjacentCell(current, target)) {
        return;
      }

      setPlayerRow(row);
      setPlayerCol(col);
      setMoveHistory((prev) => [...prev, target]);
      setVisitedCells((prev) => (containsCell(prev, row, col) ? prev : [...prev, target]));
      setMoveCount((prev) => prev + 1);

      if (row === EXIT_ROW && col === EXIT_COL) {
        handleWin();
      }
    },
    [gamePhase, handleWin, playerCol, playerRow]
  );

  const handleCellPress = React.useCallback(
    (row: number, col: number) => {
      movePlayer(row, col);
    },
    [movePlayer]
  );

  const handleDirectionMove = React.useCallback(
    (direction: Direction) => {
      if (gamePhase !== 'playing') {
        return;
      }

      const next =
        direction === 'up'
          ? { row: playerRow - 1, col: playerCol }
          : direction === 'down'
            ? { row: playerRow + 1, col: playerCol }
            : direction === 'left'
              ? { row: playerRow, col: playerCol - 1 }
              : { row: playerRow, col: playerCol + 1 };

      movePlayer(next.row, next.col);
    },
    [gamePhase, movePlayer, playerCol, playerRow]
  );

  const handleGoBack = React.useCallback(() => {
    if (gamePhase !== 'playing') {
      return;
    }

    if (moveHistory.length <= 1) {
      return;
    }

    const newHistory = moveHistory.slice(0, -1);
    const previousCell = newHistory[newHistory.length - 1];
    setMoveHistory(newHistory);
    setPlayerRow(previousCell.row);
    setPlayerCol(previousCell.col);
  }, [gamePhase, moveHistory]);

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility(t('game2_instruction'));
  }, [t]);

  React.useEffect(() => {
    if (gamePhase !== 'playing') {
      stopTimer();
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      let nextValue = 0;

      setTimeRemainingMs((previous) => {
        nextValue = Math.max(0, previous - 1000);
        return nextValue;
      });

      if (nextValue > 0 && nextValue <= 10_000) {
        const currentSecond = Math.ceil(nextValue / 1000);
        if (currentSecond !== lastPulsedSecondRef.current) {
          lastPulsedSecondRef.current = currentSecond;
          playTickPulse();
        }
      }

      if (nextValue <= 0) {
        stopTimer();
        handleTimeUp();
      }
    }, 1000);

    return () => {
      stopTimer();
    };
  }, [gamePhase, handleTimeUp, playTickPulse, stopTimer]);

  React.useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  React.useEffect(() => {
    if (timeupVisible) {
      AccessibilityInfo.announceForAccessibility(`${t('game2_timeup')} ${t('game2_timeup_sub')}`);
    }
  }, [t, timeupVisible]);

  const pathButtons = [
    { direction: 'up' as const, icon: '⬆️', label: 'Up' },
    { direction: 'left' as const, icon: '⬅️', label: 'Left' },
    { direction: 'down' as const, icon: '⬇️', label: 'Down' },
    { direction: 'right' as const, icon: '➡️', label: 'Right' },
  ];

  const arrowButtons = isRTL ? [...pathButtons].reverse() : pathButtons;

  const topBarArrow = isRTL ? '↪️' : '←';
  const backArrow = isRTL ? '↪️' : '↩️';

  const gridCells = MAZE_GRID.flatMap((row, rowIndex) =>
    row.map((cell, colIndex) => {
      const isWall = cell === 1;
      const isExit = rowIndex === EXIT_ROW && colIndex === EXIT_COL;
      const isStart = rowIndex === START_ROW && colIndex === START_COL;
      const isPlayer = playerRow === rowIndex && playerCol === colIndex;
      const isOnPath = containsCell(visitedCells, rowIndex, colIndex);
      const isMovable =
        gamePhase === 'playing' &&
        !isWall &&
        ((Math.abs(rowIndex - playerRow) === 1 && colIndex === playerCol) ||
          (Math.abs(colIndex - playerCol) === 1 && rowIndex === playerRow));

      return {
        rowIndex,
        colIndex,
        isWall,
        isExit,
        isStart,
        isPlayer,
        isOnPath,
        isMovable,
      };
    })
  );

  const mazeBoardStyle = {
    left: mazeLeft,
    top: mazeTop,
    width: mazePixelWidth,
    height: mazePixelHeight,
  } as const;

  const moveCounter = `${t('game2_moves')}: ${moveCount}`;

  return (
    <ImageBackground
      source={require('@/assets/images/bg/Gemini_Generated_Image_kqxo49kqxo49kqxo (1).png')}
      resizeMode="cover"
      style={styles.screen}>
      <View style={styles.backgroundOverlay} />

      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.topBar, { paddingTop: insets.top + Spacing.two, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Pressable accessibilityRole="button" onPress={handleExit} style={styles.exitButton}>
            <Text style={styles.exitIcon}>{topBarArrow}</Text>
          </Pressable>

          <Text style={styles.title}>{t('game2_title')}</Text>

          <View style={styles.balancePill}>
            <Image source={require('@/assets/images/coins/20da-KidInvestCurrency.png')} resizeMode="contain" style={styles.balanceIcon} />
            <Text style={styles.balanceText}>{`${balance} DZD`}</Text>
          </View>
        </View>

        <View style={styles.gameShell}>
          <View style={[styles.mazeBoard, mazeBoardStyle]}>
            {gridCells.map((cell) => {
              const backgroundColor = getCellColor({
                isWall: cell.isWall,
                isExit: cell.isExit,
                isStart: cell.isStart,
                isPlayer: cell.isPlayer,
                isOnPath: cell.isOnPath,
                isMovable: cell.isMovable,
              });

              return (
                <Pressable
                  key={`${cell.rowIndex}-${cell.colIndex}`}
                  accessibilityRole="button"
                  disabled={cell.isWall || gamePhase !== 'playing'}
                  onPress={() => handleCellPress(cell.rowIndex, cell.colIndex)}
                  style={[
                    styles.cell,
                    {
                      left: cell.colIndex * cellSize,
                      top: cell.rowIndex * cellSize,
                      width: cellSize,
                      height: cellSize,
                      backgroundColor,
                      borderColor: cell.isWall ? '#0f172a' : 'rgba(201,168,76,0.15)',
                    },
                  ]}>
                  {cell.isExit && !cell.isPlayer ? (
                    <View style={styles.cellContent}>
                      <Text style={{ fontSize: cellSize * 0.5 }}>💰</Text>
                    </View>
                  ) : null}

                  {cell.isPlayer ? (
                    <View style={styles.cellContent}>
                      <Text style={{ fontSize: cellSize * 0.55 }}>🧒</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.controlsWrap, { paddingBottom: insets.bottom + 8 }]}>
          <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Pressable
              accessibilityRole="button"
              onPress={handleGoBack}
              disabled={gamePhase !== 'playing'}
              style={[styles.controlButton, gamePhase !== 'playing' && styles.controlButtonDisabled]}>
              <Text style={styles.controlIcon}>{backArrow}</Text>
              <Text style={styles.controlLabel}>{t('game2_go_back')}</Text>
            </Pressable>

            <Animated.Text
              style={[
                styles.timerText,
                {
                  color: timeRemainingMs <= 10_000 ? '#ef4444' : '#FFFFFF',
                  transform: [{ scale: timerPulse }],
                },
              ]}>
              {formatClock(timeRemainingMs)}
            </Animated.Text>

            <View style={styles.controlButton}>
              <Text style={styles.controlIcon}>👣</Text>
              <Text style={styles.controlLabel}>{moveCounter}</Text>
            </View>
          </View>

          <View style={[styles.directionPadRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {arrowButtons.map((button) => (
              <Pressable
                key={button.direction}
                accessibilityRole="button"
                onPress={() => handleDirectionMove(button.direction)}
                disabled={gamePhase !== 'playing'}
                style={[styles.directionButton, gamePhase !== 'playing' && styles.controlButtonDisabled]}>
                <Text style={styles.directionIcon}>{button.icon}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </SafeAreaView>

      {timeupVisible ? (
        <Animated.View style={[styles.overlay, { opacity: timeupOpacity }]} pointerEvents="auto">
          <View style={styles.overlayBackdrop} />
          <View style={styles.overlayCardWrap}>
            <View style={styles.overlayCard} accessibilityLiveRegion="polite">
              <Text style={styles.overlayEmoji}>⏰</Text>
              <Text style={styles.overlayTitle}>{t('game2_timeup')}</Text>
              <Text style={styles.overlaySubtext}>{t('game2_timeup_sub')}</Text>

              <View style={styles.overlayDivider} />

              <Pressable
                accessibilityRole="button"
                onPress={resetMaze}
                style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>{t('game2_retry_button')}</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  router.replace('/games');
                }}
                style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>{t('game2_back_to_map')}</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      ) : null}

      {successVisible ? (
        <Animated.View style={[styles.overlay, { opacity: successOpacity }]} pointerEvents="auto">
          <View style={styles.overlayBackdrop} />
          <View style={styles.overlayCardWrap}>
            <View style={styles.overlayCard} accessibilityLiveRegion="polite">
              <Text style={styles.overlayEmoji}>⭐</Text>
              <Text style={styles.overlayTitle}>{t('game2_well_done')}</Text>

              <View style={styles.eduBox}>
                <Text style={styles.eduIcon}>🏦</Text>
                <Text style={styles.eduText}>{t('game2_edu_message')}</Text>
              </View>

              <View style={styles.rewardRow}>
                <Image source={require('@/assets/images/coins/100da-KidInvestCurrency.png')} resizeMode="contain" style={styles.rewardIcon} />
                <Text style={styles.rewardText}>{`+${REWARD_AMOUNT} DZD`}</Text>
              </View>

              <Text style={styles.xpText}>{`+${REWARD_XP} XP`}</Text>

              {timeBonusSeconds !== null && timeBonusSeconds > 0 ? (
                <Text style={styles.timeBonusText}>{`${t('game2_time_bonus')}: +${timeBonusSeconds}s ⚡`}</Text>
              ) : null}

              <View style={styles.overlayDivider} />

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void handleCompleteAndNavigate('next');
                }}
                style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>{`${t('game2_next_game')} →`}</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void handleCompleteAndNavigate('map');
                }}
                style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>{t('game2_back_to_map')}</Text>
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
    backgroundColor: 'rgba(11, 15, 26, 0.34)',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    gap: Spacing.two,
  },
  exitButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11, 15, 26, 0.28)',
  },
  exitIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  title: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  balancePill: {
    minWidth: 108,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: Spacing.two,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(11, 15, 26, 0.48)',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.28)',
  },
  balanceIcon: {
    width: 20,
    height: 20,
  },
  balanceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  gameShell: {
    flex: 1,
    position: 'relative',
  },
  mazeBoard: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: GOLD,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(2, 6, 23, 0.55)',
  },
  cell: {
    position: 'absolute',
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  statsRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1.5,
    borderColor: 'rgba(201,168,76,0.4)',
  },
  controlButtonDisabled: {
    opacity: 0.45,
  },
  controlIcon: {
    fontSize: 22,
  },
  controlLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
  },
  directionPadRow: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  directionButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(11, 15, 26, 0.55)',
    borderWidth: 1.5,
    borderColor: 'rgba(201,168,76,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionIcon: {
    fontSize: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 10, 20, 0.72)',
  },
  overlayCardWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  overlayCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.32)',
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  overlayEmoji: {
    fontSize: 48,
    lineHeight: 56,
  },
  overlayTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
  },
  overlaySubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  eduBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.24)',
    backgroundColor: 'rgba(201, 168, 76, 0.08)',
  },
  eduIcon: {
    fontSize: 18,
    lineHeight: 22,
    marginTop: 1,
  },
  eduText: {
    flex: 1,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardIcon: {
    width: 28,
    height: 28,
  },
  rewardText: {
    color: GOLD,
    fontSize: 24,
    fontWeight: '900',
  },
  xpText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  timeBonusText: {
    color: '#FDE68A',
    fontSize: 12,
    fontWeight: '700',
  },
  overlayDivider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginVertical: Spacing.one,
  },
  primaryButton: {
    width: '100%',
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '900',
  },
  secondaryButton: {
    minHeight: 46,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});