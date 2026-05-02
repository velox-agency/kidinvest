import { Spacing } from '@/constants/theme';
import { useProgressStore } from '@/store/progressStore';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const xp = useProgressStore((s) => s.xp);
  const profile = useProgressStore((s) => s.profile) ?? { name: '', age: null, avatarBase: 'boy', language: 'en' };
  const levels = useProgressStore((s) => s.levels);
  const badges = React.useMemo(() => {
    const completed = Object.entries(levels).filter(([, status]) => status === 'completed').map(([id]) => Number(id));
    const out: string[] = [];
    if (completed.includes(2)) out.push('Money Friend');
    if (completed.includes(4)) out.push('Money Thinker');
    if (completed.includes(6)) out.push('Friend of Good');
    if (completed.includes(8)) out.push('Small Finance Expert');
    return out;
  }, [levels]);

  const completedCount = Object.values(levels).filter((s) => s === 'completed').length;

  const currentLang = profile?.language ?? 'en';

  const setLang = useProgressStore((s) => s.setLanguage);

  const onLanguagePress = async (lang: 'ar' | 'fr' | 'en') => {
    await setLang(lang);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>{'← ' + t('tabs.games')}</Text>
      </Pressable>

      <View style={styles.avatarWrap}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>{profile?.avatarBase === 'girl' ? '👧' : '👦'}</Text>
        </View>
        <Text style={styles.name}>{profile?.name ?? ''}</Text>
        <Text style={styles.sub}>{profile?.age ? `${profile.age} ${t('onboarding.years')}` : ''}</Text>
      </View>

      <View style={styles.rowCard}>
        <Text style={styles.cardTitle}>XP</Text>
        <Text style={styles.cardValue}>{xp}</Text>
      </View>

      <View style={styles.rowCard}>
        <Text style={styles.cardTitle}>Progress</Text>
        <Text style={styles.cardValue}>{`${completedCount} / 8 ${t('level')}`}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.switchLanguage')}</Text>
        <View style={styles.langRow}>
          <Pressable onPress={() => onLanguagePress('ar')} style={[styles.langChip, currentLang === 'ar' ? styles.langActive : null]}>
            <Text style={styles.langText}>العربية</Text>
          </Pressable>
          <Pressable onPress={() => onLanguagePress('fr')} style={[styles.langChip, currentLang === 'fr' ? styles.langActive : null]}>
            <Text style={styles.langText}>Français</Text>
          </Pressable>
          <Pressable onPress={() => onLanguagePress('en')} style={[styles.langChip, currentLang === 'en' ? styles.langActive : null]}>
            <Text style={styles.langText}>English</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgeRow}>
          {badges.length === 0 ? <Text style={styles.badgeEmpty}>No badges yet</Text> : badges.map((b) => (
            <View key={b} style={styles.badgeItem}><Text style={styles.badgeText}>{b}</Text></View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    paddingTop: Spacing.six,
    backgroundColor: '#0a0a1a',
    minHeight: '100%'
  },
  back: {
    marginBottom: Spacing.two,
  },
  backText: { color: '#FFF', fontWeight: '700' },
  avatarWrap: { alignItems: 'center', marginBottom: Spacing.four },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: Spacing.two },
  avatarCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.two },
  avatarEmoji: { fontSize: 56 },
  name: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  rowCard: { backgroundColor: 'rgba(255,255,255,0.04)', padding: Spacing.three, borderRadius: 12, marginBottom: Spacing.three, flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { color: 'rgba(255,255,255,0.8)', fontWeight: '700' },
  cardValue: { color: '#FFF', fontWeight: '900' },
  section: { marginTop: Spacing.three },
  sectionTitle: { color: 'rgba(255,255,255,0.9)', fontWeight: '800', marginBottom: Spacing.two },
  langRow: { flexDirection: 'row', gap: Spacing.two },
  langChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', marginRight: Spacing.two },
  langActive: { backgroundColor: '#FACC15', borderColor: '#FACC15' },
  langText: { fontWeight: '800' },
  badgeRow: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
  badgeItem: { backgroundColor: 'rgba(255,255,255,0.04)', padding: 8, borderRadius: 8 },
  badgeText: { color: '#FFF', fontWeight: '700' },
  badgeEmpty: { color: 'rgba(255,255,255,0.6)' }
});
