import { Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, useAnimationState } from 'moti';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export type Song = {
  id: string;
  title: string;
  artist: string;
  cover?: string;
};

type Props = {
  song: Song;
  onPlay: (s: Song) => void;
  isPlaying?: boolean;
};

export default function SongCard({ song, onPlay, isPlaying }: Props) {
  const state = useAnimationState({
    rest: { scale: 1 },
    pressed: { scale: 0.97 },
  });

  return (
    <Pressable
      onPress={() => onPlay(song)}
      onPressIn={() => state.transitionTo('pressed')}
      onPressOut={() => state.transitionTo('rest')}
      style={{ width: '100%' }}
    >
      <MotiView state={state} style={styles.outer}>
        <LinearGradient
          colors={isPlaying ? ['#00F0FF', '#8A2BE2'] : ['#151426', '#0D0F16']}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.gradient}
        >
          <View style={styles.row}>
            <Image source={{ uri: song.cover }} style={styles.cover} />
            <View style={styles.info}>
              <Text numberOfLines={1} style={styles.title}>{song.title}</Text>
              <Text numberOfLines={1} style={styles.artist}>{song.artist}</Text>
            </View>
            <Pressable onPress={() => onPlay(song)} style={styles.playButton}>
              <Ionicons name="play" size={18} color="#0B1020" />
            </Pressable>
          </View>
        </LinearGradient>
      </MotiView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginVertical: Spacing.one,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6C6CFF',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  gradient: {
    padding: Spacing.two,
    borderRadius: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 999,
    marginRight: Spacing.three,
    backgroundColor: '#222',
  },
  info: {
    flex: 1,
  },
  title: {
    color: '#F7F8FF',
    fontSize: 16,
    fontWeight: '700',
  },
  artist: {
    color: '#B8BEEA',
    fontSize: 13,
    marginTop: 2,
  },
  playButton: {
    backgroundColor: '#FFD7A6',
    padding: 12,
    borderRadius: 999,
    marginLeft: Spacing.two,
  },
});
