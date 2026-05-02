import { Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';

export type Song = {
  id: string;
  title: string;
  artist: string;
  cover?: string;
};

type Props = {
  song: Song;
  onPlay: (s: Song) => void;
  selected?: boolean;
};

export default function LevelSongItem({ song, onPlay, selected }: Props) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(selected ? 1 : 0);

  // subtle floating when selected
  const float = useSharedValue(0);

  useEffect(() => {
    if (selected) {
      float.value = withRepeat(
        withTiming(6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      glow.value = withTiming(1, { duration: 350 });
    } else {
      float.value = withTiming(0);
      glow.value = withTiming(0, { duration: 350 });
    }
  }, [selected, float, glow]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(scale.value, { stiffness: 200, damping: 14 }) },
      { translateY: -float.value },
    ],
    shadowOpacity: interpolate(glow.value, [0, 1], [0.12, 0.45]),
  }));

  const frameGlow = useAnimatedStyle(() => ({
    shadowRadius: interpolate(glow.value, [0, 1], [8, 22]),
    shadowOpacity: interpolate(glow.value, [0, 1], [0.08, 0.65]),
  }));

  const onPressIn = () => { scale.value = 0.96; };
  const onPressOut = () => { scale.value = 1; };

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <Pressable onPress={() => onPlay(song)} onPressIn={onPressIn} onPressOut={onPressOut}>
        <View style={[styles.row, selected ? styles.rowSelected : null]}>
          <Animated.View style={[styles.avatarFrame, frameGlow]}>
            <LinearGradient colors={["#E6C86A", "#D49E2A"]} style={styles.frameGradient}>
              <Image source={{ uri: song.cover }} style={styles.cover} />
            </LinearGradient>
          </Animated.View>

          <View style={styles.info}>
            <Text numberOfLines={1} style={styles.title}>{song.title}</Text>
            <Text numberOfLines={1} style={styles.artist}>{song.artist}</Text>

            <View style={styles.starsRow}>
              <View style={styles.star} />
              <View style={styles.star} />
              <View style={styles.star} />
            </View>
          </View>

          <Pressable onPress={() => onPlay(song)} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.playWrap}>
            <LinearGradient
              colors={selected ? ["#65D27A", "#2FB24E"] : ["#FFD66B", "#F89D2B"]}
              style={styles.playButton}
            >
              <Ionicons name="play" size={18} color={selected ? '#04220A' : '#2A1B00'} />
            </LinearGradient>
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: Spacing.one,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    overflow: 'visible',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    backgroundColor: 'transparent',
    borderRadius: 16,
  },
  rowSelected: {
    backgroundColor: 'rgba(40,200,120,0.08)',
  },
  avatarFrame: {
    width: 72,
    height: 72,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
    shadowColor: '#A6FFB0',
  },
  frameGradient: {
    width: 64,
    height: 64,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: '#EEE',
  },
  info: {
    flex: 1,
  },
  title: {
    color: '#FFD3A6',
    fontSize: 16,
    fontWeight: '800',
  },
  artist: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 4,
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  star: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD66B',
    marginRight: 6,
  },
  playWrap: {
    marginLeft: Spacing.two,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
  },
});
