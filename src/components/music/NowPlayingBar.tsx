import { Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  song?: { title: string; artist?: string } | null;
  isPlaying?: boolean;
  onToggle?: () => void;
  onNext?: () => void;
};

export default function NowPlayingBar({ song, isPlaying, onToggle, onNext }: Props) {
  if (!song) return null;

  return (
    <LinearGradient colors={["#6b4b1b", "#a67832"]} style={styles.container}>
      <Pressable onPress={onToggle} style={styles.controlLeft}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color="#FFF8EA" />
      </Pressable>

      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.title}>{song.title}</Text>
        {song.artist ? <Text numberOfLines={1} style={styles.artist}>{song.artist}</Text> : null}
      </View>

      <Pressable onPress={onNext} style={styles.controlRight}>
        <Ionicons name="play-forward" size={18} color="#FFF8EA" />
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: Spacing.three,
    backgroundColor: '#8B6B3B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  controlLeft: {
    width: 44,
    height: 44,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.12)'
  },
  info: {
    flex: 1,
    paddingHorizontal: Spacing.three,
  },
  title: {
    color: '#FFF8EA',
    fontWeight: '800',
  },
  artist: {
    color: 'rgba(255,248,230,0.85)',
    marginTop: 2,
    fontSize: 12,
  },
  controlRight: {
    width: 44,
    height: 44,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.12)'
  },
});
