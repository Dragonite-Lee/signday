export type SignLanguage = 'ksl' | 'asl';

export type Sign = {
  id: string;
  /** Meaning shown to the learner, per UI locale. */
  meaning: { ko: string; en: string };
  /**
   * Video of a native/certified signer. Leave undefined until the clip is
   * sourced and reviewed — the UI shows a placeholder instead.
   */
  videoUrl?: string;
  /** Short credit line for the clip (license requirement, e.g. 공공누리 출처표시). */
  credit?: string;
};

export type Lesson = {
  id: string;
  language: SignLanguage;
  title: { ko: string; en: string };
  signs: Sign[];
};
