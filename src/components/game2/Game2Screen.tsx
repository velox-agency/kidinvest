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
type Direction = 'up' | 'down' | 'left' | 'right';
type MazeDef = {
  grid: Cell[][];
  start: { row: number; col: number };
  exit: { row: number; col: number };
  name: string;
};

const GOLD = '#C9A84C';
const MAZE_COLS = 16;
const MAZE_ROWS = 16;
const LEGEND_HEIGHT = 28;
const TIMER_START_MS = 60_000;
const REWARD_AMOUNT = 500;
const REWARD_XP = 50;

const MAZE_1: Cell[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0],
  [1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,0],
  [1,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0],
  [1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,0],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0],
  [1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0],
  [1,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0],
  [1,1,1,0,1,0,1,1,1,0,1,0,1,0,1,1],
  [1,0,1,0,1,0,0,0,1,0,0,0,1,0,1,0],
  [1,0,1,0,1,1,1,0,1,1,1,1,1,0,1,0],
  [1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0],
  [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0],
  [1,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0],
  [1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,0],
  [1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],
];
const MAZE_1_START = { row: 14, col: 15 };
const MAZE_1_EXIT = { row: 1, col: 0 };

const MAZE_2: Cell[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0],
  [1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0],
  [1,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0],
  [1,1,1,0,1,0,1,1,1,0,1,0,1,0,1,0],
  [1,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0],
  [1,0,1,0,1,1,1,1,1,1,1,0,1,1,1,1],
  [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0],
  [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0],
  [1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
  [1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0],
  [1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0],
  [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0],
  [1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,0],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
];
const MAZE_2_START = { row: 5, col: 15};
const MAZE_2_EXIT = { row: 1, col: 0 };

const MAZE_3: Cell[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0],
  [1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,0],
  [1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0],
  [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0],
  [1,0,0,0,0,0,1,0,1,0,1,0,0,0,1,0],
  [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,0],
  [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0],
  [1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1],
  [1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0],
  [1,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0],
  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
  [1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,1],
  [1,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0],
  [1,0,1,1,1,1,1,0,1,0,1,0,1,1,1,0],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
];
const MAZE_3_START = { row: 13, col: 3 };
const MAZE_3_EXIT = { row: 1, col: 0 };

const MAZES: MazeDef[] = [
  { grid: MAZE_1, start: MAZE_1_START, exit: MAZE_1_EXIT, name: 'Maze 1' },
  { grid: MAZE_2, start: MAZE_2_START, exit: MAZE_2_EXIT, name: 'Maze 2' },
  { grid: MAZE_3, start: MAZE_3_START, exit: MAZE_3_EXIT, name: 'Maze 3' },
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
  if (isWall) return '#1a0a00';
  if (isPlayer) return GOLD;
  if (isExit) return '#064e3b';
  if (isStart) return '#1e3a5f';
  if (isMovable) return '#1a3a6e';
  if (isOnPath) return '#0f2a50';
  return '#0d1f3c';
}

function isAdjacentCell(fromRow: number, fromCol: number, toRow: number, toCol: number) {
  return (
    (Math.abs(fromRow - toRow) === 1 && fromCol === toCol) ||
    (Math.abs(fromCol - toCol) === 1 && fromRow === toRow)
  );
}

function containsCell(cells: Array<{ row: number; col: number }>, row: number, col: number) {
  return cells.some((cell) => cell.row === row && cell.col === col);
}

function WallCell({ cellSize, rowIndex, colIndex }: { cellSize: number; rowIndex: number; colIndex: number }) {
  return (
    <View
      style={[
        styles.cell,
        {
          left: colIndex * cellSize,
          top: rowIndex * cellSize,
          width: cellSize,
          height: cellSize,
          backgroundColor: '#1a0a00',
        },
      ]}>
      <View style={styles.wallMortarTop} />
      <View style={styles.wallMortarBottom} />
      <View
        style={[
          styles.wallMortarVertical,
          {
            left: rowIndex % 2 === 0 ? cellSize / 2 : cellSize / 4,
          },
        ]}
      />
      <View style={styles.wallBrickFace} />
    </View>
  );
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

  const initialMazeIndex = React.useRef(Math.floor(Math.random() * MAZES.length)).current;
  const [mazeIndex, setMazeIndex] = React.useState(initialMazeIndex);
  const currentMaze = MAZES[mazeIndex];

  const [gamePhase, setGamePhase] = React.useState<GamePhase>('playing');
  const [playerRow, setPlayerRow] = React.useState(currentMaze.start.row);
  const [playerCol, setPlayerCol] = React.useState(currentMaze.start.col);
  const [visitedCells, setVisitedCells] = React.useState<Array<{ row: number; col: number }>>([
    { row: currentMaze.start.row, col: currentMaze.start.col },
  ]);
  const [moveHistory, setMoveHistory] = React.useState<Array<{ row: number; col: number }>>([
    { row: currentMaze.start.row, col: currentMaze.start.col },
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
  const timerStartTimeRef = React.useRef<number | null>(null);
  const timerRafRef = React.useRef<number | null>(null);
  const timerPausedRef = React.useRef(false);
  const timerRestartTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeUpFiredRef = React.useRef(false);
  const handleTimeUpRef = React.useRef<() => void>(() => {});
  const lastPulsedSecondRef = React.useRef<number | null>(null);

  const TOP_BAR_HEIGHT = insets.top + 56;
  const BOTTOM_CONTROLS_HEIGHT = insets.bottom + 120;
  const availableWidth = screenWidth - 2;
  const availableHeight = screenHeight - TOP_BAR_HEIGHT - BOTTOM_CONTROLS_HEIGHT - LEGEND_HEIGHT - 2;
  const cellSize = Math.floor(Math.min(availableWidth / MAZE_COLS, availableHeight / MAZE_ROWS));
  const mazePixelWidth = cellSize * MAZE_COLS;
  const mazePixelHeight = cellSize * MAZE_ROWS;
  const mazeLeft = Math.floor((screenWidth - mazePixelWidth) / 2);
  const mazeTop = TOP_BAR_HEIGHT + LEGEND_HEIGHT + 12;

  const startTimer = React.useCallback(() => {
    timerStartTimeRef.current = performance.now();
    timerPausedRef.current = false;

    const tick = () => {
      if (timerPausedRef.current) {
        return;
      }

      const elapsed = performance.now() - (timerStartTimeRef.current ?? performance.now());
      const remaining = Math.max(0, TIMER_START_MS - elapsed);
      setTimeRemainingMs(remaining);

      if (remaining <= 0) {
        handleTimeUpRef.current();
        return;
      }

      timerRafRef.current = requestAnimationFrame(tick);
    };

    timerRafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopTimer = React.useCallback(() => {
    timerPausedRef.current = true;
    if (timerRafRef.current !== null) {
      cancelAnimationFrame(timerRafRef.current);
      timerRafRef.current = null;
    }
  }, []);

  const resetTimer = React.useCallback(() => {
    stopTimer();
    timeUpFiredRef.current = false;
    setTimeRemainingMs(TIMER_START_MS);

    if (timerRestartTimeoutRef.current) {
      clearTimeout(timerRestartTimeoutRef.current);
    }

    timerRestartTimeoutRef.current = setTimeout(() => {
      startTimer();
      timerRestartTimeoutRef.current = null;
    }, 50);
  }, [startTimer, stopTimer]);

  const playTimerPulse = React.useCallback(() => {
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

  const playCelebrationSfx = React.useCallback(() => {
    // TODO: wire celebration SFX if a project asset becomes available.
  }, []);

  const handleTimeUp = React.useCallback(() => {
    if (timeUpFiredRef.current) {
      return;
    }

    timeUpFiredRef.current = true;
    stopTimer();
    setGamePhase('timeup');
    setTimeupVisible(true);
    timeupOpacity.setValue(0);

    Animated.timing(timeupOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [stopTimer, timeupOpacity]);

  React.useEffect(() => {
    handleTimeUpRef.current = handleTimeUp;
  }, [handleTimeUp]);

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
    }).start(({ finished }) => {
      if (finished) {
        playCelebrationSfx();
        AccessibilityInfo.announceForAccessibility(`${t('game2_well_done')} ${t('game2_edu_message')}`);
      }
    });
  }, [gamePhase, playCelebrationSfx, stopTimer, successOpacity, t, timeRemainingMs]);

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
      { text: t('game2_exit_no'), style: 'cancel' },
      { text: t('game2_exit_yes'), style: 'destructive', onPress: navigateAway },
    ], { cancelable: true });
  }, [router, t]);

  const syncMazeState = React.useCallback(() => {
    const maze = currentMaze;
    setPlayerRow(maze.start.row);
    setPlayerCol(maze.start.col);
    setVisitedCells([{ row: maze.start.row, col: maze.start.col }]);
    setMoveHistory([{ row: maze.start.row, col: maze.start.col }]);
    setMoveCount(0);
    setGamePhase('playing');
    setTimeupVisible(false);
    setSuccessVisible(false);
    setTimeBonusSeconds(null);
    timeupOpacity.setValue(0);
    successOpacity.setValue(0);
    resultActionedRef.current = false;
  }, [currentMaze, successOpacity, timeupOpacity]);

  React.useEffect(() => {
    syncMazeState();
  }, [mazeIndex, syncMazeState]);

  const resetMazeForRetry = React.useCallback(() => {
    timeUpFiredRef.current = false;
    lastPulsedSecondRef.current = null;
    setMazeIndex((prev) => (prev + 1) % MAZES.length);
    resetTimer();
  }, [resetTimer]);

  const handleCellPress = React.useCallback(
    (row: number, col: number) => {
      if (gamePhase !== 'playing') {
        return;
      }

      if (currentMaze.grid[row]?.[col] === 1) {
        return;
      }

      if (!isAdjacentCell(playerRow, playerCol, row, col)) {
        return;
      }

      setPlayerRow(row);
      setPlayerCol(col);
      setMoveHistory((prev) => [...prev, { row, col }]);
      setVisitedCells((prev) => (containsCell(prev, row, col) ? prev : [...prev, { row, col }]));
      setMoveCount((prev) => prev + 1);

      if (row === currentMaze.exit.row && col === currentMaze.exit.col) {
        handleWin();
      }
    },
    [currentMaze, gamePhase, handleWin, playerCol, playerRow]
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

      handleCellPress(next.row, next.col);
    },
    [gamePhase, handleCellPress, playerCol, playerRow]
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
    startTimer();

    return () => {
      stopTimer();
      if (timerRestartTimeoutRef.current) {
        clearTimeout(timerRestartTimeoutRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (gamePhase !== 'playing') {
      stopTimer();
      return;
    }
  }, [gamePhase, stopTimer]);

  React.useEffect(() => {
    if (timeupVisible) {
      AccessibilityInfo.announceForAccessibility(`${t('game2_timeup')} ${t('game2_timeup_sub')}`);
    }
  }, [t, timeupVisible]);

  React.useEffect(() => {
    if (successVisible) {
      AccessibilityInfo.announceForAccessibility(`${t('game2_well_done')} ${t('game2_edu_message')}`);
    }
  }, [successVisible, t]);

  React.useEffect(() => {
    const currentSecond = Math.ceil(timeRemainingMs / 1000);
    if (timeRemainingMs > 0 && timeRemainingMs <= 10_000) {
      if (currentSecond !== lastPulsedSecondRef.current) {
        lastPulsedSecondRef.current = currentSecond;
        playTimerPulse();
      }
    } else {
      lastPulsedSecondRef.current = null;
    }
  }, [playTimerPulse, timeRemainingMs]);

  const isCurrentExit = playerRow === currentMaze.exit.row && playerCol === currentMaze.exit.col;

  const cells = React.useMemo(
    () =>
      currentMaze.grid.flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isWall = cell === 1;
          const isExit = rowIndex === currentMaze.exit.row && colIndex === currentMaze.exit.col;
          const isStart = rowIndex === currentMaze.start.row && colIndex === currentMaze.start.col;
          const isPlayer = playerRow === rowIndex && playerCol === colIndex;
          const isOnPath = containsCell(visitedCells, rowIndex, colIndex);
          const isMovable =
            gamePhase === 'playing' &&
            !isWall &&
            isAdjacentCell(playerRow, playerCol, rowIndex, colIndex);

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
      ),
    [currentMaze.exit.col, currentMaze.exit.row, currentMaze.grid, currentMaze.start.col, currentMaze.start.row, gamePhase, playerCol, playerRow, visitedCells]
  );

  const legendItems = [
    { color: '#2d1a0e', label: t('game2_legend_wall') },
    { color: '#0d1f3c', label: t('game2_legend_path') },
    { color: '#064e3b', label: t('game2_legend_exit') },
  ];

  const arrowButtons: Array<{ direction: Direction; icon: string }> = isRTL
    ? [
        { direction: 'right', icon: '➡️' },
        { direction: 'down', icon: '⬇️' },
        { direction: 'left', icon: '⬅️' },
        { direction: 'up', icon: '⬆️' },
      ]
    : [
        { direction: 'up', icon: '⬆️' },
        { direction: 'left', icon: '⬅️' },
        { direction: 'down', icon: '⬇️' },
        { direction: 'right', icon: '➡️' },
      ];

  return (
    <ImageBackground
      source={require('@/assets/images/bg/Gemini_Generated_Image_kqxo49kqxo49kqxo (1).png')}
      resizeMode="cover"
      style={styles.screen}>
      <View style={styles.backgroundOverlay} />

      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.topBar, { paddingTop: insets.top + Spacing.two, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Pressable accessibilityRole="button" onPress={handleExit} style={styles.exitButton}>
            <Text style={styles.exitIcon}>{isRTL ? '↪️' : '←'}</Text>
          </Pressable>

          <Text style={styles.title}>{t('game2_title')}</Text>

          <View style={styles.balancePill}>
            <Image source={require('@/assets/images/coins/20da-KidInvestCurrency.png')} resizeMode="contain" style={styles.balanceIcon} />
            <Text style={styles.balanceText}>{`${balance} DZD`}</Text>
          </View>
        </View>

        <View style={styles.gameShell}>
          <View style={styles.legendRow}>
            <Text style={styles.legendTitle}>{t('game2_maze_label')}</Text>
            {legendItems.map((item) => (
              <View key={item.label} style={styles.legendChip}>
                <View style={[styles.legendSwatch, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View
            style={[
              styles.mazeBoard,
              {
                left: mazeLeft,
                top: TOP_BAR_HEIGHT + LEGEND_HEIGHT + 12,
                width: mazePixelWidth,
                height: mazePixelHeight,
              },
            ]}>
            {cells.map((cell) => {
              if (cell.isWall) {
                return <WallCell key={`${cell.rowIndex}-${cell.colIndex}`} cellSize={cellSize} rowIndex={cell.rowIndex} colIndex={cell.colIndex} />;
              }

              const backgroundColor = getCellColor({
                isWall: false,
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
                  disabled={gamePhase !== 'playing'}
                  onPress={() => handleCellPress(cell.rowIndex, cell.colIndex)}
                  style={[
                    styles.cell,
                    {
                      left: cell.colIndex * cellSize,
                      top: cell.rowIndex * cellSize,
                      width: cellSize,
                      height: cellSize,
                      backgroundColor,
                      borderColor: 'rgba(201,168,76,0.15)',
                    },
                  ]}>
                  {cell.isExit && !cell.isPlayer ? (
                    <View style={styles.cellContent}>
                      <Text style={{ fontSize: Math.max(12, cellSize * 0.5) }}>💰</Text>
                    </View>
                  ) : null}

                  {cell.isPlayer ? (
                    <View style={styles.cellContent}>
                      <Text style={{ fontSize: Math.max(12, cellSize * 0.55) }}>🧒</Text>
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
              <Text style={styles.controlIcon}>{isRTL ? '↪️' : '↩️'}</Text>
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
              <Text style={styles.controlLabel}>{`${t('game2_moves')}: ${moveCount}`}</Text>
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

              <Pressable accessibilityRole="button" onPress={resetMazeForRetry} style={styles.primaryButton}>
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

              {timeBonusSeconds !== null && timeBonusSeconds > 0 ? <Text style={styles.timeBonusText}>{`${t('game2_time_bonus')}: +${timeBonusSeconds}s ⚡`}</Text> : null}

              <View style={styles.overlayDivider} />

              <Pressable accessibilityRole="button" onPress={() => void handleCompleteAndNavigate('next')} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>{`${t('game2_next_game')} →`}</Text>
              </Pressable>

              <Pressable accessibilityRole="button" onPress={() => void handleCompleteAndNavigate('map')} style={styles.secondaryButton}>
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
  legendRow: {
    position: 'absolute',
    top: 2,
    left: 0,
    right: 0,
    height: LEGEND_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  legendTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginRight: 4,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  mazeBoard: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: GOLD,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(2, 6, 23, 0.55)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
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
  wallMortarTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#0a0500',
  },
  wallMortarBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#0a0500',
  },
  wallMortarVertical: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    width: 2,
    backgroundColor: '#0a0500',
  },
  wallBrickFace: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 2,
    right: 2,
    backgroundColor: '#2d1a0e',
    borderRadius: 1,
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