import { describe, expect, it } from 'vitest';
import { lessonShortLabel } from '../lessonHeading';

describe('lessonShortLabel', () => {
  it('labels Minna lessons with the book name', () => {
    expect(lessonShortLabel({ lessonNumber: 3, title: 'Bài 3', textbook: 'MINNA' })).toBe('Minna · Bài 3');
  });

  it('uses the lesson title for textbook and JLPT lessons', () => {
    expect(
      lessonShortLabel({ lessonNumber: 21101, title: 'Sou Matome N1 · Tuần 1 · Ngày 1', textbook: 'SOUMATOME' }),
    ).toBe('Sou Matome N1 · Tuần 1 · Ngày 1');
  });

  it('falls back to the lesson number without a title', () => {
    expect(lessonShortLabel({ lessonNumber: 205, title: null, textbook: null })).toBe('Bài 205');
  });
});
