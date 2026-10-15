import curated from './curated.json';
import type { CuratedUnit, Lesson, SignLanguage } from './types';

/** Lessons hold ~5 signs; a unit of 7+ words is split into evenly sized parts. */
const LESSON_SIZE = 5;

/**
 * ASL has no public data source yet: words only, no media or descriptions.
 * Replace once licensed ASL clips are sourced.
 */
const ASL_STARTER: { id: string; title: { ko: string; en: string }; words: [string, string][] }[] = [
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
];

function aslLessons(): Lesson[] {
  return ASL_STARTER.map((l) => ({
    id: `asl-${l.id}`,
    language: 'asl',
    title: l.title,
    signs: l.words.map(([ko, en]) => ({ id: `asl-${l.id}-${en}`, meaning: { ko, en } })),
  }));
}

export function lessonsFromUnits(units: CuratedUnit[]): Lesson[] {
  return units.flatMap((u) => {
    const parts = Math.max(1, Math.round(u.signs.length / LESSON_SIZE));
    const size = Math.ceil(u.signs.length / parts);
    return Array.from({ length: parts }, (_, p) => {
      const chunk = u.signs.slice(p * size, (p + 1) * size);
      const suffix = parts > 1 ? ` ${p + 1}` : '';
      return {
        id: `ksl-${u.id}${parts > 1 ? `-${p + 1}` : ''}`,
        language: 'ksl' as const,
        title: { ko: u.title.ko + suffix, en: u.title.en + suffix },
        signs: chunk.map((s) => ({
          id: s.id,
          meaning: s.label,
          synonyms: s.synonyms,
          videoUrl: s.videoUrl || undefined,
          imageUrls: s.imageUrls,
          description: s.description,
          sourceUrl: s.sourceUrl,
          credit: s.credit,
        })),
      };
    }).filter((l) => l.signs.length >= 2);
  });
}

export const LESSONS: Lesson[] = [...lessonsFromUnits((curated as { units: CuratedUnit[] }).units), ...aslLessons()];

export function lessonsFor(language: SignLanguage) {
  return LESSONS.filter((l) => l.language === language);
}

export function getLesson(id: string) {
  return LESSONS.find((l) => l.id === id);
}
