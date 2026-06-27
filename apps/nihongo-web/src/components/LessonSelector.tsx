'use client';

import { useMemo } from 'react';
import { useLessonsQuery } from '../hooks/queries';

interface LessonSelectorProps {
  value: number;
  onChange: (lessonNumber: number) => void;
  id?: string;
  filterWithContent?: boolean;
}

export default function LessonSelector({
  value,
  onChange,
  id = 'lesson-select',
  filterWithContent = true,
}: LessonSelectorProps) {
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
            {lesson.title ? ` — ${lesson.title}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
