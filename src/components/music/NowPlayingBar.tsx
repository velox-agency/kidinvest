import { Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  song?: { title: string; artist?: string } | null;
  isPlaying?: boolean;
  onToggle?: () => void;
};

export default function NowPlayingBar({ song, isPlaying, onToggle }: Props) {
  if (!song) return null;

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.title}>{song.title}</Text>
        {song.artist ? <Text numberOfLines={1} style={styles.artist}>{song.artist}</Text> : null}
      </View>
      <Pressable onPress={onToggle} style={styles.playPause}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#081021" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: Spacing.three,
    backgroundColor: '#0E1220',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#6C6CFF',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  info: {
    flex: 1,
    paddingRight: Spacing.three,
  },
  title: {
    color: '#F4F6FF',
    fontWeight: '700',
  },
  artist: {
    color: '#B6BBE8',
    marginTop: 2,
    fontSize: 12,
  },
  playPause: {
    backgroundColor: '#FFCF7A',
    padding: 12,
    borderRadius: 999,
  },
});
