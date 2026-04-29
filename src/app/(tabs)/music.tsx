import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageBackground, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import NowPlayingBar from '@/components/music/NowPlayingBar';
import SearchBar from '@/components/music/SearchBar';
import SongList from '@/components/music/SongList';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

const SAMPLE_SONGS = [
  { id: '1', title: 'Mood', artist: '24kGoldn', cover: 'https://picsum.photos/200/200?1' },
  { id: '2', title: 'Levitating', artist: 'Dua Lipa', cover: 'https://picsum.photos/200/200?2' },
  { id: '3', title: 'Blinding Lights', artist: 'The Weeknd', cover: 'https://picsum.photos/200/200?3' },
  { id: '4', title: 'Sunflower', artist: 'Post Malone', cover: 'https://picsum.photos/200/200?4' },
  { id: '5', title: 'Circles', artist: 'Post Malone', cover: 'https://picsum.photos/200/200?5' },
];

export default function MusicScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  const [query, setQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const songs = SAMPLE_SONGS;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q));
  }, [query, songs]);

  const onPlay = useCallback((song) => {
    setPlayingId(song.id);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => setIsPlaying(v => !v), []);

  // To use your custom background image place it at: assets/images/bg/music-bg.png
  // Example: assets/images/bg/music-bg.png -> require('../../../assets/images/bg/music-bg.png')
  const bgSource = require('../../../assets/images/bg/musicBackground.png');

  return (
    <ImageBackground source={bgSource} resizeMode="cover" style={styles.screen}>
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{t('music.title')}</Text>
          </View>

          <View style={styles.content}>
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder={t('music.search', { defaultValue: 'Search songs' })}
            />

            <View style={styles.listWrapper}>
              <SongList songs={filtered} onPlay={onPlay} playingId={playingId} />
            </View>
          </View>

          <NowPlayingBar
            song={songs.find(s => s.id === playingId) ?? null}
            isPlaying={isPlaying}
            onToggle={togglePlay}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
  },
  headerRow: {
    width: '100%',
    maxWidth: MaxContentWidth,
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F6F7FF',
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flex: 1,
  },
  listWrapper: {
    marginTop: Spacing.two,
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,9,28,0.36)',
  },
});
