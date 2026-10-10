import type { Lesson, SignLanguage } from './types';

/**
 * Starter curriculum — words only.
 * Videos are intentionally empty: every clip must come from a licensed source
 * (e.g. 국립국어원 한국수어사전 for KSL) and be reviewed by a native signer
 * before it ships. Do not add written "how to sign" descriptions without review.
 */
const greetings = (language: SignLanguage): Lesson => ({
  id: `${language}-greetings`,
  language,
  title: { ko: '인사하기', en: 'Greetings' },
  signs: [
    { id: `${language}-hello`, meaning: { ko: '안녕하세요', en: 'Hello' } },
    { id: `${language}-thanks`, meaning: { ko: '감사합니다', en: 'Thank you' } },
    { id: `${language}-sorry`, meaning: { ko: '미안합니다', en: 'Sorry' } },
    { id: `${language}-yes`, meaning: { ko: '네', en: 'Yes' } },
    { id: `${language}-no`, meaning: { ko: '아니요', en: 'No' } },
  ],
});

const feelings = (language: SignLanguage): Lesson => ({
  id: `${language}-feelings`,
  language,
  title: { ko: '감정 표현', en: 'Feelings' },
  signs: [
    { id: `${language}-happy`, meaning: { ko: '기쁘다', en: 'Happy' } },
    { id: `${language}-sad`, meaning: { ko: '슬프다', en: 'Sad' } },
    { id: `${language}-love`, meaning: { ko: '사랑', en: 'Love' } },
    { id: `${language}-tired`, meaning: { ko: '피곤하다', en: 'Tired' } },
    { id: `${language}-good`, meaning: { ko: '좋다', en: 'Good' } },
  ],
});

const people = (language: SignLanguage): Lesson => ({
  id: `${language}-people`,
  language,
  title: { ko: '사람', en: 'People' },
  signs: [
    { id: `${language}-me`, meaning: { ko: '나', en: 'Me' } },
    { id: `${language}-you`, meaning: { ko: '너', en: 'You' } },
    { id: `${language}-friend`, meaning: { ko: '친구', en: 'Friend' } },
    { id: `${language}-family`, meaning: { ko: '가족', en: 'Family' } },
    { id: `${language}-deaf`, meaning: { ko: '농인', en: 'Deaf' } },
  ],
});

export const LESSONS: Lesson[] = (['ksl', 'asl'] as const).flatMap((l) => [
  greetings(l),
  feelings(l),
  people(l),
]);

export function lessonsFor(language: SignLanguage) {
  return LESSONS.filter((l) => l.language === language);
}

export function getLesson(id: string) {
  return LESSONS.find((l) => l.id === id);
}
