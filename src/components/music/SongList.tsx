import React, { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import LevelSongItem, { Song } from './SongCard';

type Props = {
  songs: Song[];
  onPlay: (s: Song) => void;
  playingId?: string | null;
};

export default function SongList({ songs, onPlay, playingId }: Props) {
  const renderItem = useCallback(
    ({ item }: { item: Song }) => (
      <LevelSongItem key={item.id} song={item} onPlay={onPlay} selected={playingId === item.id} />
    ),
    [onPlay, playingId]
  );

  const keyExtractor = useCallback((item: Song) => item.id, []);

  return (
    <FlatList
      data={songs}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
  },
});
