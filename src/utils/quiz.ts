import type { Sign } from '@/data/types';

export type Question = { answer: Sign; choices: Sign[] };

export function shuffle<T>(items: T[], random = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** One question per sign; distractors come from the same lesson. */
export function buildQuestions(signs: Sign[], choiceCount: number, random = Math.random): Question[] {
  return shuffle(signs, random).map((answer) => {
    const distractors = shuffle(
      signs.filter((s) => s.id !== answer.id),
      random,
    ).slice(0, Math.max(0, choiceCount - 1));
    return { answer, choices: shuffle([answer, ...distractors], random) };
  });
}
