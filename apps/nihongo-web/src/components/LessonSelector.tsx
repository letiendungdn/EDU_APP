'use client';

import { useMemo } from 'react';
import { useLessons } from '../hooks/queries';

export type LessonCountKind = 'vocab' | 'grammar' | 'none';
interface LessonSelectorProps {
  value: number;
  onChange: (lessonNumber: number) => void;
  id?: string;
  filterWithContent?: boolean;
  /** Loại số lượng hiển thị cạnh tên bài trong dropdown */
  countKind?: LessonCountKind;
  /** @deprecated Dùng countKind="vocab" | "none" */
  showVocabCount?: boolean;
}

function countSuffixForLesson(
  lesson: { _count?: { vocabularies?: number; grammars?: number } },
  countKind: LessonCountKind,
): string {
  if (countKind === 'none') return '';

  const count =
    countKind === 'grammar'
      ? lesson._count?.grammars
      : lesson._count?.vocabularies;

  if (count == null) return '';

  return countKind === 'grammar' ? ` (${count} mục)` : ` (${count} từ)`;
}

export default function LessonSelector({
  value,
  onChange,
  id = 'lesson-select',
  filterWithContent = true,
  countKind,
  showVocabCount = true,
}: LessonSelectorProps) {
  const resolvedCountKind: LessonCountKind =
    countKind ?? (showVocabCount ? 'vocab' : 'none');
  const contentFilter: 'grammar' | 'vocab' | undefined =
    resolvedCountKind === 'grammar'
      ? 'grammar'
      : resolvedCountKind === 'vocab' && filterWithContent !== false
        ? 'vocab'
        : undefined;
  const { data, isLoading, isError } = useLessons(
    contentFilter ? { has: contentFilter } : undefined,
  );

  const lessons = useMemo(() => {
    if (!data) return [];
    if (contentFilter) return data;
    if (!filterWithContent) return data;

    return data.filter(
      (l) =>
        (l._count?.vocabularies ?? 0) > 0 ||
        (l._count?.grammars ?? 0) > 0 ||
        (l._count?.exercises ?? 0) > 0,
    );
  }, [data, filterWithContent, contentFilter]);

  const groups = useMemo(() => {
    // Minna = lessonNumber 1–50 (jlptLevel trên các bài này chỉ là mức tương đương JLPT,
    // không phải khóa JLPT riêng — trước đây bị tách sang nhóm N5/N4/N3/N2).
    const isMinna = (n: number) => n >= 1 && n <= 50;
    const byNumber = <T extends { lessonNumber: number }>(a: T, b: T) =>
      a.lessonNumber - b.lessonNumber;

    const minna = lessons.filter((l) => isMinna(l.lessonNumber)).sort(byNumber);
    const rest = lessons.filter((l) => !isMinna(l.lessonNumber));

    const order: Array<{ key: string; label: string; levels: string[] }> = [
      { key: 'n5', label: 'JLPT N5', levels: ['N5', ''] },
      { key: 'n4', label: 'JLPT N4', levels: ['N4'] },
      { key: 'n3', label: 'JLPT N3', levels: ['N3'] },
      { key: 'n2', label: 'JLPT N2', levels: ['N2'] },
      { key: 'n1', label: 'JLPT N1', levels: ['N1'] },
    ];

    const levelGroups = order
      .map((g) => ({
        ...g,
        items: rest
          .filter((l) => g.levels.includes(l.jlptLevel ?? ''))
          .sort(byNumber),
      }))
      .filter((g) => g.items.length > 0);

    return [
      ...(minna.length
        ? [{ key: 'minna', label: 'Minna no Nihongo (bài 1–50)', items: minna }]
        : []),
      ...levelGroups,
    ];
  }, [lessons]);

  if (isLoading) {
    return (
      <div className="lesson-selector">
        <label>Chọn bài học: </label>
        <span className="select-loading">Đang tải...</span>
      </div>
    );
  }

  if (isError || lessons.length === 0) {
    return (
      <div className="lesson-selector">
        <label>Chọn bài học: </label>
        <span className="select-loading">Chưa có dữ liệu</span>
      </div>
    );
  }

  return (
    <div className="lesson-selector">
      <label htmlFor={id}>Chọn bài học: </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="select-input"
      >
        {groups.length > 1
          ? groups.map((group) => (
              <optgroup key={group.key} label={group.label}>
                {group.items.map((lesson) => (
                  <option key={lesson.lessonNumber} value={lesson.lessonNumber}>
                    {lesson.title ?? `Bài ${lesson.lessonNumber}`}
                    {countSuffixForLesson(lesson, resolvedCountKind)}
                  </option>
                ))}
              </optgroup>
            ))
          : (groups[0]?.items ?? lessons).map((lesson) => (
              <option key={lesson.lessonNumber} value={lesson.lessonNumber}>
                {lesson.title ?? `Bài ${lesson.lessonNumber}`}
                {countSuffixForLesson(lesson, resolvedCountKind)}
              </option>
            ))}
      </select>
    </div>
  );
}
