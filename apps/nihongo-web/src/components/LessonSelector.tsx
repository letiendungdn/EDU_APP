'use client';

import { useMemo } from 'react';
import { useLessonsQuery } from '../hooks/queries';

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
  const { data, isLoading, isError } = useLessonsQuery();

  const lessons = useMemo(() => {
    if (!data) return [];
    if (!filterWithContent) return data;
    return data.filter(
      (l) =>
        (l._count?.vocabularies ?? 0) > 0 ||
        (l._count?.grammars ?? 0) > 0 ||
        (l._count?.exercises ?? 0) > 0,
    );
  }, [data, filterWithContent]);

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
        {lessons.map((lesson) => (
          <option key={lesson.lessonNumber} value={lesson.lessonNumber}>
            Bài {lesson.lessonNumber}
            {countSuffixForLesson(lesson, resolvedCountKind)}
          </option>
        ))}
      </select>
    </div>
  );
}
