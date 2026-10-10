import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import type { SignLanguage } from '@/data/types';

const KEY = 'signday/progress/v1';

export type Progress = {
  language: SignLanguage | null;
  streak: number;
  /** Local date (YYYY-MM-DD) of the last finished lesson. */
  lastStudyDate: string | null;
  completedLessonIds: string[];
};

const initial: Progress = {
  language: null,
  streak: 0,
  lastStudyDate: null,
  completedLessonIds: [],
};

function localDate(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

/** Streak still counts if you studied today or yesterday. */
export function currentStreak(p: Progress, today = localDate()) {
  if (!p.lastStudyDate) return 0;
  return daysBetween(p.lastStudyDate, today) <= 1 ? p.streak : 0;
}

export function nextStreak(p: Progress, today = localDate()) {
  if (!p.lastStudyDate) return 1;
  const gap = daysBetween(p.lastStudyDate, today);
  if (gap === 0) return p.streak;
  if (gap === 1) return p.streak + 1;
  return 1;
}

type Ctx = {
  progress: Progress;
  ready: boolean;
  setLanguage: (l: SignLanguage) => void;
  completeLesson: (lessonId: string) => void;
};

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setProgress({ ...initial, ...JSON.parse(raw) }))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const update = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((prev) => {
      const next = fn(prev);
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const setLanguage = useCallback((language: SignLanguage) => update((p) => ({ ...p, language })), [update]);

  const completeLesson = useCallback(
    (lessonId: string) =>
      update((p) => ({
        ...p,
        streak: nextStreak(p),
        lastStudyDate: localDate(),
        completedLessonIds: p.completedLessonIds.includes(lessonId)
          ? p.completedLessonIds
          : [...p.completedLessonIds, lessonId],
      })),
    [update],
  );

  return (
    <ProgressContext.Provider value={{ progress, ready, setLanguage, completeLesson }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
