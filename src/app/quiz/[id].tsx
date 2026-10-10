import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

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

  const onNext = () => {
    if (index === questions.length - 1) {
      completeLesson(lesson.id);
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setPicked(null);
  };

  return (
    <Screen footer={<Button label={t.next} disabled={!answered} onPress={onNext} />}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {t.whatMeans} · {t.signOf(index + 1, questions.length)}
      </ThemedText>
      <SignVideo key={q.answer.id} sign={q.answer} />

      {q.choices.map((c) => {
        const showRight = answered && c.id === q.answer.id;
        const showWrong = answered && c.id === picked?.id && !isCorrect;
        return (
          <Pressable
            key={c.id}
            disabled={answered}
            onPress={() => {
              setPicked(c);
              if (c.id === q.answer.id) setScore((s) => s + 1);
            }}
            style={[
              styles.choice,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: showRight ? theme.success : showWrong ? theme.danger : 'transparent',
              },
            ]}>
            <ThemedText style={styles.choiceText}>{c.meaning[locale]}</ThemedText>
          </Pressable>
        );
      })}

      {answered ? (
        <ThemedText style={[styles.feedback, { color: isCorrect ? theme.success : theme.danger }]}>
          {isCorrect ? t.correct : t.wrong(q.answer.meaning[locale])}
        </ThemedText>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  big: { fontSize: 72, lineHeight: 84, textAlign: 'center', marginTop: Spacing.six },
  center: { textAlign: 'center' },
  choice: { padding: Spacing.three, borderRadius: 16, borderWidth: 2 },
  choiceText: { fontWeight: 600, fontSize: 17 },
  feedback: { fontWeight: 700, textAlign: 'center' },
});
