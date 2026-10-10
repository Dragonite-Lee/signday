import { getLocales } from 'expo-localization';

export type Locale = 'ko' | 'en';

export const locale: Locale = getLocales()[0]?.languageCode === 'ko' ? 'ko' : 'en';

const strings = {
  ko: {
    pickLanguageTitle: '어떤 수어를 배워볼까요?',
    pickLanguageSub: '하루 3분, 취미처럼. 언제든 바꿀 수 있어요.',
    ksl: '한국수어 (KSL)',
    asl: '미국수어 (ASL)',
    start: '시작하기',
    streak: (n: number) => `${n}일 연속`,
    todayLesson: '오늘의 레슨',
    allLessons: '레슨',
    done: '완료',
    learn: '배우기',
    quiz: '퀴즈',
    next: '다음',
    check: '확인',
    finish: '끝내기',
    videoComingSoon: '영상 준비 중',
    whatMeans: '이 수어의 뜻은?',
    correct: '정답!',
    wrong: (a: string) => `정답은 "${a}"`,
    resultTitle: (s: number, t: number) => `${t}개 중 ${s}개 정답`,
    resultSub: '오늘도 한 걸음. 내일 또 만나요.',
    changeLanguage: '언어 바꾸기',
    signOf: (i: number, t: number) => `${i} / ${t}`,
  },
  en: {
    pickLanguageTitle: 'Which sign language?',
    pickLanguageSub: '3 minutes a day, just for fun. Switch anytime.',
    ksl: 'Korean Sign Language (KSL)',
    asl: 'American Sign Language (ASL)',
    start: 'Start',
    streak: (n: number) => `${n}-day streak`,
    todayLesson: "Today's lesson",
    allLessons: 'Lessons',
    done: 'Done',
    learn: 'Learn',
    quiz: 'Quiz',
    next: 'Next',
    check: 'Check',
    finish: 'Finish',
    videoComingSoon: 'Video coming soon',
    whatMeans: 'What does this sign mean?',
    correct: 'Correct!',
    wrong: (a: string) => `Answer: "${a}"`,
    resultTitle: (s: number, t: number) => `${s} of ${t} correct`,
    resultSub: 'One more step today. See you tomorrow.',
    changeLanguage: 'Change language',
    signOf: (i: number, t: number) => `${i} / ${t}`,
  },
};

export const t = strings[locale];
