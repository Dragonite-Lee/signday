import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { SignVideo } from '@/components/sign-video';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { getLesson } from '@/data/lessons';
import { useTheme } from '@/hooks/use-theme';
import { locale, t } from '@/i18n';

/** Step through each sign of the lesson, then hand off to the quiz. */
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = getLesson(id);
  const [index, setIndex] = useState(0);
  const theme = useTheme();

  if (!lesson) return <Redirect href="/" />;

  const sign = lesson.signs[index];
  const last = index === lesson.signs.length - 1;

  return (
    <Screen
      footer={
        <Button
          label={last ? t.quiz : t.next}
          onPress={() => (last ? router.replace(`/quiz/${lesson.id}`) : setIndex(index + 1))}
        />
      }>
      <View style={styles.top}>
        <ThemedText type="smallBold" onPress={() => router.back()} themeColor="textSecondary">
          ✕
        </ThemedText>
        <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
          <View
            style={[
              styles.fill,
              { backgroundColor: theme.primary, width: `${((index + 1) / lesson.signs.length) * 100}%` },
            ]}
          />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {t.signOf(index + 1, lesson.signs.length)}
        </ThemedText>
      </View>

      <SignVideo key={sign.id} sign={sign} />
      <ThemedText type="title" style={styles.meaning}>
        {sign.meaning[locale]}
      </ThemedText>
      {sign.meaning.en !== sign.meaning[locale] ? (
        <ThemedText themeColor="textSecondary" style={styles.center}>
          {sign.meaning.en}
        </ThemedText>
      ) : null}
      {sign.description ? (
        <View style={[styles.howTo, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {t.howTo}
          </ThemedText>
          <ThemedText>{sign.description}</ThemedText>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  track: { flex: 1, height: 10, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
  meaning: { textAlign: 'center', marginTop: Spacing.three },
  center: { textAlign: 'center' },
  howTo: { padding: Spacing.three, borderRadius: 16, gap: Spacing.one },
});
