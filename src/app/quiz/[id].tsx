import * as Haptics from 'expo-haptics';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { SignVideo } from '@/components/sign-video';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { getLesson } from '@/data/lessons';
import type { Sign } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { locale, t } from '@/i18n';
import { useProgress } from '@/store/progress';
import { buildQuestions } from '@/utils/quiz';

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = getLesson(id);
  const questions = useMemo(() => (lesson ? buildQuestions(lesson.signs, 4) : []), [lesson]);
  const { completeLesson } = useProgress();
  const theme = useTheme();

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Sign | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!lesson) return <Redirect href="/" />;

  if (finished) {
    return (
      <Screen footer={<Button label={t.finish} onPress={() => router.dismissTo('/')} />}>
        <ThemedText style={styles.big}>🎉</ThemedText>
        <ThemedText type="subtitle" style={styles.center}>
          {t.resultTitle(score, questions.length)}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.center}>
          {t.resultSub}
        </ThemedText>
      </Screen>
    );
  }

  const q = questions[index];
  const answered = picked !== null;
  const isCorrect = picked?.id === q.answer.id;
  const tone = isCorrect ? 'success' : 'danger';

  const choose = (c: Sign) => {
    const right = c.id === q.answer.id;
    setPicked(c);
    if (right) setScore((s) => s + 1);
    Haptics.notificationAsync(
      right ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
    ).catch(() => {});
  };

  const onNext = () => {
    if (index === questions.length - 1) {
      completeLesson(lesson.id);
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setPicked(null);
  };

  const footer = answered ? (
    <View style={[styles.feedback, { backgroundColor: theme[`${tone}Soft`] }]}>
      <View style={styles.feedbackHead}>
        <View style={[styles.badge, { backgroundColor: theme[tone] }]}>
          <ThemedText style={[styles.badgeIcon, { color: theme.onPrimary }]}>{isCorrect ? '✓' : '✕'}</ThemedText>
        </View>
        <View style={styles.feedbackText}>
          <ThemedText style={[styles.feedbackTitle, { color: theme[tone] }]}>
            {isCorrect ? t.correct : t.wrongTitle}
          </ThemedText>
          {!isCorrect ? (
            <ThemedText style={{ color: theme[tone] }}>{t.wrong(q.answer.meaning[locale])}</ThemedText>
          ) : null}
        </View>
      </View>
      <Button label={t.keepGoing} tone={tone} onPress={onNext} />
    </View>
  ) : null;

  return (
    <Screen footer={footer}>
      <View style={styles.top}>
        <ThemedText type="smallBold" onPress={() => router.back()} themeColor="textSecondary">
          ✕
        </ThemedText>
        <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
          <View
            style={[
              styles.fill,
              { backgroundColor: theme.primary, width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      <ThemedText type="smallBold" themeColor="textSecondary">
        {t.whatMeans}
      </ThemedText>
      <SignVideo key={q.answer.id} sign={q.answer} />

      <View style={styles.choices}>
        {q.choices.map((c) => {
          const isAnswer = c.id === q.answer.id;
          const isPicked = c.id === picked?.id;
          const state = !answered ? 'idle' : isAnswer ? 'right' : isPicked ? 'wrong' : 'dim';
          const color = state === 'right' ? theme.success : state === 'wrong' ? theme.danger : undefined;
          return (
            <Pressable
              key={c.id}
              disabled={answered}
              accessibilityRole="button"
              accessibilityState={{ selected: isPicked }}
              onPress={() => choose(c)}
              style={({ pressed }) => [
                styles.choice,
                {
                  backgroundColor:
                    state === 'right' ? theme.successSoft : state === 'wrong' ? theme.dangerSoft : theme.backgroundElement,
                  borderColor: color ?? 'transparent',
                  opacity: state === 'dim' ? 0.45 : 1,
                },
                pressed && styles.pressed,
              ]}>
              <ThemedText style={[styles.choiceText, color && { color }]}>{c.meaning[locale]}</ThemedText>
              {state === 'right' || state === 'wrong' ? (
                <ThemedText style={[styles.choiceIcon, { color }]}>{state === 'right' ? '✓' : '✕'}</ThemedText>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  big: { fontSize: 72, lineHeight: 84, textAlign: 'center', marginTop: Spacing.six },
  center: { textAlign: 'center' },
  top: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  track: { flex: 1, height: 10, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
  choices: { gap: Spacing.two },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.three,
    borderRadius: 16,
    borderWidth: 2,
  },
  pressed: { transform: [{ scale: 0.98 }] },
  choiceText: { fontWeight: 600, fontSize: 17 },
  choiceIcon: { fontWeight: 800, fontSize: 18 },
  feedback: { borderRadius: 20, padding: Spacing.three, gap: Spacing.three },
  feedbackHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  badge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  badgeIcon: { fontWeight: 800, fontSize: 18, lineHeight: 22 },
  feedbackText: { flex: 1 },
  feedbackTitle: { fontWeight: 800, fontSize: 19 },
});
