export type SignLanguage = 'ksl' | 'asl';

export type Sign = {
  id: string;
  /** Meaning shown to the learner, per UI locale. */
  meaning: { ko: string; en: string };
  /** Other words the same sign means (from the source dictionary). */
  synonyms?: string[];
  /** Official handshape images (e.g. 국립국어원). Shown in order. */
  imageUrls?: string[];
  /** Official handshape description from the source. Never hand-written. */
  description?: string;
  /** Looping clip from a licensed source. */
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

/** Shape written by scripts/build-curriculum.mjs → src/data/curated.json */
export type CuratedUnit = {
  id: string;
  title: { ko: string; en: string };
  signs: {
    id: string;
    label: { ko: string; en: string };
    synonyms: string[];
    videoUrl: string;
    thumbnailUrl: string;
    imageUrls: string[];
    description: string;
    sourceUrl: string;
    credit: string;
  }[];
};
