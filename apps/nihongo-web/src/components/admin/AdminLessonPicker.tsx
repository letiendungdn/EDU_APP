'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { AdminJlptFilter, type JlptLevelFilter } from './AdminJlptFilter';
import './AdminComponents.css';

export type AdminLessonListItem = {
  id: number;
  lessonNumber: number;
  title: string | null;
  jlptLevel?: string | null;
  count?: number | null;
};

interface AdminLessonPickerProps {
  title?: string;
  lessons: AdminLessonListItem[];
  loading?: boolean;
  activeLessonNumber: number | null;
  onSelectLesson: (lessonNumber: number) => void;
  filterPlaceholder?: string;
  emptySelectHint?: string;
  children: ReactNode;
  headerExtra?: ReactNode;
}

/** Component canonical để chọn 1 lesson rồi hiển thị nội dung của nó bên phải
 * — dùng chung cho Vocab/Grammar/Kanji/Exercises thay vì mỗi view tự chép lại. */
export function AdminLessonPicker({
  title = 'Bài học',
  lessons,
  loading = false,
  activeLessonNumber,
  onSelectLesson,
  filterPlaceholder = 'Lọc bài…',
  emptySelectHint = 'Chọn một bài bên trái để xem danh sách.',
  children,
  headerExtra,
}: AdminLessonPickerProps) {
  const [filter, setFilter] = useState('');
  const [level, setLevel] = useState<JlptLevelFilter>('');

  const filteredLessons = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return lessons.filter((l) => {
      if (level && l.jlptLevel !== level) return false;
      if (!q) return true;
      const hay = [String(l.lessonNumber), l.title, l.jlptLevel].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [lessons, filter, level]);

  return (
    <div className="admin-lp">
      <aside className="glass-panel admin-lp__sidebar" style={{ padding: '0.85rem' }}>
        <strong>{title}</strong>
        <input
          type="search"
          className="admin-search-input"
          placeholder={filterPlaceholder}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <AdminJlptFilter value={level} onChange={setLevel} />
        <div className="admin-lp__list">
          {loading ? (
            <p className="admin-lp__empty">Đang tải bài…</p>
          ) : filteredLessons.length === 0 ? (
            <p className="admin-lp__empty">Không có bài khớp.</p>
          ) : (
            filteredLessons.map((lesson) => {
              const active = lesson.lessonNumber === activeLessonNumber;
              return (
                <button
                  key={lesson.id}
                  type="button"
                  className={`admin-lp__item ${active ? 'active' : ''}`}
                  onClick={() => onSelectLesson(lesson.lessonNumber)}
                >
                  <span>
                    #{lesson.lessonNumber} · {lesson.title?.trim() || `Bài ${lesson.lessonNumber}`}
                  </span>
                  <span className="admin-lp__item-badge">
                    {lesson.jlptLevel ?? ''} {lesson.count != null ? `(${lesson.count})` : ''}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section>
        {headerExtra}
        {activeLessonNumber == null ? (
          <div className="glass-panel admin-lp__empty" style={{ padding: '2rem' }}>
            {emptySelectHint}
          </div>
        ) : (
          children
        )}
      </section>
    </div>
  );
}
