import type { Lesson } from '../types/api';

const BOOK_NAMES: Record<string, string> = {
  SOUMATOME: 'Sou Matome',
  SHINKANZEN: 'Shinkanzen',
  TRY: 'TRY!',
};

/**
 * Tiêu đề trang Ngữ pháp / Từ vựng theo giáo trình của bài đang mở:
 * Minna (bài 1–50) · sách luyện thi (Sou Matome / Shinkanzen / TRY!) · JLPT chung.
 */
export function lessonHeading(kind: 'grammar' | 'vocab', lesson: Lesson | undefined): string {
  const what = kind === 'grammar' ? 'Ngữ pháp' : 'Từ vựng';
  if (!lesson) return `${what} Minna no Nihongo`;
  const level = lesson.jlptLevel ?? '';
  const book = lesson.textbook ? BOOK_NAMES[lesson.textbook] : undefined;
  if (book) return `${what} ${book} ${level}`.trim();
  if (lesson.textbook === 'MINNA' || lesson.lessonNumber <= 50) return `${what} Minna no Nihongo`;
  return `${what} JLPT ${level}`.trim();
}
