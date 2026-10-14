export type SignLanguage = 'ksl' | 'asl';

export type Sign = {
  id: string;
  /** Meaning shown to the learner, per UI locale. */
  meaning: { ko: string; en: string };
  /** Official handshape images (e.g. 국립국어원). Shown in order. */
  imageUrls?: string[];
  /** Official handshape description from the source. Never hand-written. */
  description?: string;
  /** Looping clip, if a licensed one exists. */
  videoUrl?: string;
  /** Link to the source entry. */
  sourceUrl?: string;
  /** Attribution line (required by the source license). */
  credit?: string;
};

export type Lesson = {
  id: string;
  language: SignLanguage;
  title: { ko: string; en: string };
  signs: Sign[];
};

/** Shape written by scripts/sync-signs.mjs */
export type SyncedSign = {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrls: string[];
  sourceUrl: string;
  credit: string;
};
