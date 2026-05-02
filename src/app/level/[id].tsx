import { Colors, Spacing } from '@/constants/theme';
import { useProgressStore } from '@/store/progressStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

export default function LevelPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  const levelId = Number(id);
  const status = useProgressStore((s) => s.levels[String(levelId)]);
  const completeLevel = useProgressStore((s) => s.completeLevel);

  const [loading, setLoading] = React.useState(false);

  const handleComplete = async () => {
    setLoading(true);
    await completeLevel(levelId);
    setLoading(false);
    router.push('/games');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Level {id}</Text>

      {status === 'available' ? (
        <Pressable
          accessibilityRole="button"
          onPress={handleComplete}
          disabled={loading}
          style={[styles.button, { backgroundColor: '#FACC15' }]}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Complete Level</Text>
          )}
        </Pressable>
      ) : status === 'completed' ? (
        <View style={styles.completedWrap}>
          <Text style={styles.completedLabel}>Completed ✓</Text>
        </View>
      ) : (
        <View style={styles.lockedWrap}>
          <Text style={styles.lockedText}>This level is locked.</Text>
          <Pressable onPress={() => router.push('/games')} style={styles.backButton}>
            <Text style={styles.backText}>Back to Map</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a1a',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  button: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '800',
    color: '#000',
    fontSize: 16,
  },
  completedWrap: {
    padding: Spacing.three,
    borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  completedLabel: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 16,
  },
  lockedWrap: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  lockedText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  backButton: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  backText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
