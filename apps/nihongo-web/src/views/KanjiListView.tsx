'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { playAudio } from '../utils/speech';
import { useKanjiByJlptQuery, useKanjiLessonsQuery } from '../hooks/queries';
import type { KanjiEntry, KanjiLesson } from '../types/api';
import './KanjiListView.css';

const JLPT_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
type JlptLevel = (typeof JLPT_ORDER)[number];

interface JlptSummary {
  level: JlptLevel;
  count: number;
  hint: string;
  hasData: boolean;
}

function buildJlptSummary(lessons: KanjiLesson[]): JlptSummary[] {
  const buckets = new Map<JlptLevel, { count: number; lessonNumbers: number[] }>(
    JLPT_ORDER.map((level) => [level, { count: 0, lessonNumbers: [] }]),
  );

  for (const lesson of lessons) {
    const level = lesson.jlptLevel as JlptLevel | null;
    if (!level || !buckets.has(level)) continue;

    const bucket = buckets.get(level)!;
    bucket.count += lesson._count?.entries ?? 0;
    bucket.lessonNumbers.push(lesson.lessonNumber);
  }

  return JLPT_ORDER.map((level) => {
    const { count, lessonNumbers } = buckets.get(level)!;
    lessonNumbers.sort((a, b) => a - b);

    let hint: string;
    if (count === 0) {
      hint = 'Chưa có dữ liệu kanji cho cấp này trong hệ thống.';
    } else if (lessonNumbers.length === 1) {
      hint = `Bài ${lessonNumbers[0]} — ${count} kanji.`;
    } else {
      hint = `Bài ${lessonNumbers[0]}–${lessonNumbers[lessonNumbers.length - 1]} — ${count} kanji.`;
    }

    return { level, count, hint, hasData: count > 0 };
  });
}

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

function matchesSearch(entry: KanjiEntry, query: string): boolean {
  const q = normalizeSearch(query);
  if (!q) return true;

  const haystack = [
    entry.character,
    entry.hanViet,
    entry.onyomi,
    entry.kunyomi,
    entry.meaningVi,
    entry.lesson?.title,
    entry.lesson?.lessonNumber != null ? `bài ${entry.lesson.lessonNumber}` : '',
    ...(entry.vocabularies?.map((v) => `${v.word} ${v.reading} ${v.meaningVi}`) ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(q);
}

function getPrimaryReading(entry: KanjiEntry): string {
  const raw = entry.onyomi || entry.kunyomi || entry.character;
  return raw.split(/[,、]/)[0].replace(/-.*/, '').trim();
}

export default function KanjiListView() {
  const { data: lessons = [], isLoading: loadingLessons } = useKanjiLessonsQuery();
  const summary = useMemo(() => buildJlptSummary(lessons), [lessons]);
  const totalKanji = useMemo(() => summary.reduce((sum, item) => sum + item.count, 0), [summary]);

  const [activeLevel, setActiveLevel] = useState<JlptLevel>('N5');
  const [searchInput, setSearchInput] = useState('');

  const activeMeta = summary.find((item) => item.level === activeLevel) ?? summary[0];
  const { data: entries = [], isLoading: loadingEntries } = useKanjiByJlptQuery(activeLevel);

  const filteredEntries = useMemo(
    () => entries.filter((entry) => matchesSearch(entry, searchInput)),
    [entries, searchInput],
  );

  const isLoading = loadingLessons || loadingEntries;

  return (
    <div className="container kanji-list-view">
      <h2 className="view-title">Bảng Kanji theo JLPT</h2>
      <p className="kanji-list-subtitle">
        {loadingLessons
          ? 'Đang tải thống kê kanji...'
          : `Tổng ${totalKanji} kanji trong hệ thống, nhóm theo cấp độ JLPT.`}
      </p>

      <div className="kanji-list-links">
        <Link href="/kanji">← Flashcard theo bài</Link>
      </div>

      <div className="kanji-list-toolbar">
        <div className="kanji-list-tabs" role="tablist" aria-label="Cấp JLPT">
          {summary.map((item) => (
            <button
              key={item.level}
              type="button"
              role="tab"
              aria-selected={activeLevel === item.level}
              className={`tab-btn ${activeLevel === item.level ? 'active' : ''}`}
              onClick={() => {
                setActiveLevel(item.level);
                setSearchInput('');
              }}
            >
              {item.level} ({item.count})
            </button>
          ))}
        </div>

        <input
          type="search"
          className="kanji-list-search"
          placeholder="Lọc kanji, Hán Việt, âm đọc, nghĩa..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Lọc kanji trong bảng"
          disabled={!activeMeta?.hasData}
        />
      </div>

      {activeMeta && (
        <div className="kanji-list-meta glass-panel" style={{ padding: '0.75rem 1rem' }}>
          <span>
            <strong>{activeMeta.level}</strong> — {activeMeta.hint}
          </span>
          <span>
            Hiển thị <strong>{filteredEntries.length}</strong> / {entries.length} kanji
          </span>
        </div>
      )}

      {isLoading ? (
        <p className="kanji-list-empty">Đang tải bảng kanji {activeLevel}...</p>
      ) : !activeMeta?.hasData ? (
        <p className="kanji-list-empty">
          Chưa có kanji {activeLevel} trong database. Khi thêm bài học mới, bảng sẽ tự cập nhật.
        </p>
      ) : filteredEntries.length === 0 ? (
        <p className="kanji-list-empty">Không tìm thấy kanji phù hợp.</p>
      ) : (
        <div className="kanji-list-table-wrap glass-panel">
          <table className="kanji-list-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Kanji</th>
                <th>Hán Việt</th>
                <th>Âm ON</th>
                <th>Âm KUN</th>
                <th>Nghĩa</th>
                <th>Bài</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, index) => (
                <tr key={entry.id}>
                  <td>{index + 1}</td>
                  <td>
                    <button
                      type="button"
                      className="kanji-list-char"
                      onClick={() => playAudio(getPrimaryReading(entry))}
                      title="Nghe đọc"
                    >
                      {entry.character}
                    </button>
                  </td>
                  <td className="kanji-list-hanviet">{entry.hanViet ?? '—'}</td>
                  <td className="kanji-list-reading">{entry.onyomi ?? '—'}</td>
                  <td className="kanji-list-reading">{entry.kunyomi ?? '—'}</td>
                  <td className="kanji-list-meaning">{entry.meaningVi}</td>
                  <td className="kanji-list-lesson">
                    {entry.lesson?.lessonNumber != null
                      ? `Bài ${entry.lesson.lessonNumber}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
