/** Mục tiêu tham khảo JLPT (ước lượng phổ biến khi ôn thi). Không phải danh sách chính thức. */
export const JLPT_VOCAB_CUMULATIVE: Record<'N5' | 'N4' | 'N3' | 'N2' | 'N1', number> = {
  N5: 800,
  N4: 1500,
  N3: 3750,
  N2: 6000,
  /** ~9700 sau khi gộp Minna + OpenJLPT + elzup (unique kana). */
  N1: 9700,
};

export const JLPT_KANJI_CUMULATIVE: Record<'N5' | 'N4' | 'N3' | 'N2' | 'N1', number> = {
  N5: 100,
  N4: 300,
  N3: 650,
  N2: 1000,
  N1: 2136,
};

/** Mục tiêu mẫu ngữ pháp (điểm ngữ pháp tích lũy, ước lượng). */
export const JLPT_GRAMMAR_CUMULATIVE: Record<'N5' | 'N4' | 'N3' | 'N2' | 'N1', number> = {
  N5: 120,
  N4: 220,
  N3: 350,
  N2: 500,
  N1: 650,
};

type Band = { from: number; to: number; level: 'N5' | 'N4' | 'N3' | 'N2' };

/**
 * Minna no Nihongo: sơ cấp I (bài 1–25) ≈ N5, sơ cấp II (bài 26–50) ≈ N4.
 * (Trước 2026-09-26 bảng này dùng nhầm cách chia của Kanji Look and Learn → bài 21–50 bị gắn N3/N2.)
 */
export const MINNA_LESSON_JLPT: Band[] = [
  { from: 1, to: 25, level: 'N5' },
  { from: 26, to: 50, level: 'N4' },
];

/** Kanji Look and Learn (KanjiLesson 1–32): Part 1 = N5, Part 2 = N4, Part 3 = N3. */
export const KLL_LESSON_JLPT: Band[] = [
  { from: 1, to: 10, level: 'N5' },
  { from: 11, to: 20, level: 'N4' },
  { from: 21, to: 32, level: 'N3' },
];

function levelFor(bands: Band[], lessonNumber: number) {
  return bands.find((b) => lessonNumber >= b.from && lessonNumber <= b.to)?.level ?? null;
}

export function kllJlptForLesson(lessonNumber: number): 'N5' | 'N4' | 'N3' | null {
  return levelFor(KLL_LESSON_JLPT, lessonNumber) as 'N5' | 'N4' | 'N3' | null;
}

export function minnaJlptForLesson(lessonNumber: number): 'N5' | 'N4' | 'N3' | 'N2' | null {
  return levelFor(MINNA_LESSON_JLPT, lessonNumber);
}
