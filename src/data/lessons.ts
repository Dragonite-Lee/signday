import synced from './signs.json';
import type { Lesson, Sign, SignLanguage, SyncedSign } from './types';

const LESSON_SIZE = 5;

/**
 * Starter words used until signs.json is populated (and for ASL, which has no
 * public API yet). Words only — no media or hand-written descriptions.
 */
const STARTER: { id: string; title: { ko: string; en: string }; words: [string, string][] }[] = [
  {
    id: 'greetings',
    title: { ko: '인사하기', en: 'Greetings' },
    words: [
      ['안녕하세요', 'Hello'],
      ['감사합니다', 'Thank you'],
      ['미안합니다', 'Sorry'],
      ['네', 'Yes'],
      ['아니요', 'No'],
    ],
  },
  {
    id: 'feelings',
    title: { ko: '감정 표현', en: 'Feelings' },
    words: [
      ['기쁘다', 'Happy'],
      ['슬프다', 'Sad'],
      ['사랑', 'Love'],
      ['피곤하다', 'Tired'],
      ['좋다', 'Good'],
    ],
  },
  {
    id: 'people',
    title: { ko: '사람', en: 'People' },
    words: [
      ['나', 'Me'],
      ['너', 'You'],
      ['친구', 'Friend'],
      ['가족', 'Family'],
      ['농인', 'Deaf'],
    ],
  },
];

function starterLessons(language: SignLanguage): Lesson[] {
  return STARTER.map((l) => ({
    id: `${language}-${l.id}`,
    language,
    title: l.title,
    signs: l.words.map(([ko, en]) => ({ id: `${language}-${l.id}-${en}`, meaning: { ko, en } })),
  }));
}

/** Group synced KSL signs by category, then split into 5-sign lessons. */
export function lessonsFromSynced(signs: SyncedSign[]): Lesson[] {
  const byCategory = new Map<string, SyncedSign[]>();
  for (const s of signs) {
    const list = byCategory.get(s.category) ?? [];
    list.push(s);
    byCategory.set(s.category, list);
  }

  const lessons: Lesson[] = [];
  for (const [category, list] of byCategory) {
    for (let i = 0; i < list.length; i += LESSON_SIZE) {
      const chunk = list.slice(i, i + LESSON_SIZE);
      if (chunk.length < 2) continue; // a quiz needs distractors
      const part = Math.floor(i / LESSON_SIZE) + 1;
      lessons.push({
        id: `ksl-${category}-${part}`,
        language: 'ksl',
        title: { ko: `${category} ${part}`, en: `${category} ${part}` },
        signs: chunk.map<Sign>((s) => ({
          id: s.id,
          meaning: { ko: s.title, en: s.title },
          imageUrls: s.imageUrls,
          description: s.description,
          sourceUrl: s.sourceUrl,
          credit: s.credit,
        })),
      });
    }
  }
  return lessons;
}

const kslSynced = lessonsFromSynced((synced as { signs: SyncedSign[] }).signs);

export const LESSONS: Lesson[] = [
  ...(kslSynced.length ? kslSynced : starterLessons('ksl')),
  ...starterLessons('asl'),
];

export function lessonsFor(language: SignLanguage) {
  return LESSONS.filter((l) => l.language === language);
}

export function getLesson(id: string) {
  return LESSONS.find((l) => l.id === id);
}
