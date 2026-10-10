import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { lessonsFor } from '@/data/lessons';
import { useTheme } from '@/hooks/use-theme';
import { locale, t } from '@/i18n';
import { currentStreak, useProgress } from '@/store/progress';

export default function Home() {
  const theme = useTheme();
  const { progress, setLanguage } = useProgress();
  const language = progress.language ?? 'ksl';
  const lessons = lessonsFor(language);
  const today = lessons.find((l) => !progress.completedLessonIds.includes(l.id)) ?? lessons[0];
  const streak = currentStreak(progress);

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="subtitle">Signday</ThemedText>
        <ThemedView type="backgroundElement" style={styles.streak}>
          <ThemedText style={styles.streakText}>🔥 {t.streak(streak)}</ThemedText>
        </ThemedView>
      </View>

      <ThemedView type="backgroundElement" style={styles.todayCard}>
        <ThemedText type="small" themeColor="textSecondary">
          {t.todayLesson} · {language.toUpperCase()}
        </ThemedText>
        <ThemedText type="subtitle">{today.title[locale]}</ThemedText>
        <ThemedText themeColor="textSecondary">
          {today.signs.map((s) => s.meaning[locale]).join(' · ')}
        </ThemedText>
        <Button label={t.learn} onPress={() => router.push(`/lesson/${today.id}`)} />
      </ThemedView>

      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.section}>
        {t.allLessons}
      </ThemedText>
      {lessons.map((l) => {
        const done = progress.completedLessonIds.includes(l.id);
        return (
          <Pressable
            key={l.id}
            onPress={() => router.push(`/lesson/${l.id}`)}
            style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText style={styles.rowTitle}>{l.title[locale]}</ThemedText>
            <ThemedText type="small" style={{ color: done ? theme.success : theme.textSecondary }}>
              {done ? `✓ ${t.done}` : `${l.signs.length}`}
            </ThemedText>
          </Pressable>
        );
      })}

      <Pressable
        onPress={() => setLanguage(language === 'ksl' ? 'asl' : 'ksl')}
        style={styles.switch}
        accessibilityRole="button">
        <ThemedText type="small" themeColor="textSecondary">
          {t.changeLanguage} → {language === 'ksl' ? 'ASL' : 'KSL'}
        </ThemedText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streak: { paddingVertical: Spacing.one, paddingHorizontal: Spacing.three, borderRadius: 999 },
  streakText: { fontWeight: 700 },
  todayCard: { padding: Spacing.four, borderRadius: 24, gap: Spacing.two },
  section: { marginTop: Spacing.three },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 16,
  },
  rowTitle: { fontWeight: 600 },
  switch: { alignSelf: 'center', padding: Spacing.three },
});
