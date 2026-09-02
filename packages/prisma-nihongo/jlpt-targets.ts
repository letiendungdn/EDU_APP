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

/** Minna no Nihongo: gán jlptLevel theo số bài (1–50). */
export const MINNA_LESSON_JLPT: Array<{ from: number; to: number; level: 'N5' | 'N4' | 'N3' | 'N2' }> = [
  { from: 1, to: 10, level: 'N5' },
  { from: 11, to: 20, level: 'N4' },
  { from: 21, to: 32, level: 'N3' },
  { from: 33, to: 50, level: 'N2' },
];

export function minnaJlptForLesson(lessonNumber: number): 'N5' | 'N4' | 'N3' | 'N2' | null {
  for (const band of MINNA_LESSON_JLPT) {
    if (lessonNumber >= band.from && lessonNumber <= band.to) return band.level;
  }
  return null;
}
