'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createKanjiEntry,
  deleteKanjiEntry,
  updateKanjiEntry,
} from '../api';
import {
  useKanjiAllJlptQuery,
  useKanjiByJlptQuery,
  useKanjiLessonsQuery,
  queryKeys,
} from '../hooks/queries';
import { useAuth } from '../hooks/useAuth';
import { playAudio } from '../utils/speech';
import { getKanjiSpeakItems } from '../utils/kanjiSpeak';
import type {
  CreateKanjiEntryInput,
  KanjiEntry,
  KanjiLesson,
} from '../types/api';
import './KanjiListView.css';

const JLPT_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
type JlptLevel = (typeof JLPT_ORDER)[number];
type ViewLevel = JlptLevel | 'ALL';
type DisplayMode = 'grid' | 'table';

interface KanjiFormValues {
  character: string;
  meaningVi: string;
  lessonNumber: number;
  hanViet: string;
  onyomi: string;
  kunyomi: string;
  jlptLevel: JlptLevel;
}

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
      hint = 'Chưa có dữ liệu';
    } else if (lessonNumbers.length === 1) {
      hint = `Bài ${lessonNumbers[0]}`;
    } else {
      hint = `Bài ${lessonNumbers[0]}–${lessonNumbers[lessonNumbers.length - 1]}`;
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
    entry.jlptLevel,
    entry.lesson?.jlptLevel,
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
  return getKanjiSpeakItems(entry)[0] ?? entry.character;
}

function getEntryJlpt(entry: KanjiEntry): string {
  return entry.jlptLevel ?? entry.lesson?.jlptLevel ?? '—';
}

function defaultFormValues(activeLevel: ViewLevel, lessons: KanjiLesson[]): KanjiFormValues {
  const filtered =
    activeLevel === 'ALL'
      ? lessons
      : lessons.filter((l) => l.jlptLevel === activeLevel);
  const first = filtered[0] ?? lessons[0];

  return {
    character: '',
    meaningVi: '',
    lessonNumber: first?.lessonNumber ?? 1,
    hanViet: '',
    onyomi: '',
    kunyomi: '',
    jlptLevel: (activeLevel === 'ALL' ? 'N5' : activeLevel) as JlptLevel,
  };
}

function entryToForm(entry: KanjiEntry): KanjiFormValues {
  return {
    character: entry.character,
    meaningVi: entry.meaningVi,
    lessonNumber: entry.lesson?.lessonNumber ?? 1,
    hanViet: entry.hanViet ?? '',
    onyomi: entry.onyomi ?? '',
    kunyomi: entry.kunyomi ?? '',
    jlptLevel: (entry.jlptLevel ?? entry.lesson?.jlptLevel ?? 'N5') as JlptLevel,
  };
}

function formToPayload(values: KanjiFormValues): CreateKanjiEntryInput {
  return {
    character: values.character.trim(),
    meaningVi: values.meaningVi.trim(),
    lessonNumber: values.lessonNumber,
    hanViet: values.hanViet.trim() || undefined,
    onyomi: values.onyomi.trim() || undefined,
    kunyomi: values.kunyomi.trim() || undefined,
    jlptLevel: values.jlptLevel,
  };
}

function KanjiEntryAdminForm({
  initial,
  editId,
  lessons,
  token,
  onCancel,
  onSaved,
}: {
  initial: KanjiFormValues;
  editId?: number;
  lessons: KanjiLesson[];
  token: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const lessonOptions = useMemo(
    () =>
      [...lessons].sort((a, b) => a.lessonNumber - b.lessonNumber).map((l) => ({
        value: l.lessonNumber,
        label: `Bài ${l.lessonNumber}${l.jlptLevel ? ` (${l.jlptLevel})` : ''}${l.title ? ` — ${l.title}` : ''}`,
      })),
    [lessons],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.character.trim() || !values.meaningVi.trim()) {
      setError('Kanji và nghĩa tiếng Việt là bắt buộc.');
      return;
    }

    setSaving(true);
    try {
      const payload = formToPayload(values);
      if (editId != null) {
        await updateKanjiEntry(editId, payload, token);
      } else {
        await createKanjiEntry(payload, token);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không lưu được kanji.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="kanji-admin-form glass-panel" onSubmit={handleSubmit}>
      <h3>{editId != null ? 'Sửa kanji' : 'Thêm kanji mới'}</h3>
      {error && <p className="kanji-admin-error">{error}</p>}

      <div className="kanji-admin-grid">
        <label>
          Kanji *
          <input
            value={values.character}
            onChange={(e) => setValues((v) => ({ ...v, character: e.target.value }))}
            placeholder="食"
            required
          />
        </label>
        <label>
          Hán Việt
          <input
            value={values.hanViet}
            onChange={(e) => setValues((v) => ({ ...v, hanViet: e.target.value }))}
            placeholder="Thực"
          />
        </label>
        <label>
          Âm ON
          <input
            value={values.onyomi}
            onChange={(e) => setValues((v) => ({ ...v, onyomi: e.target.value }))}
            placeholder="ショク"
          />
        </label>
        <label>
          Âm KUN
          <input
            value={values.kunyomi}
            onChange={(e) => setValues((v) => ({ ...v, kunyomi: e.target.value }))}
            placeholder="た(べる)"
          />
        </label>
        <label className="kanji-admin-span2">
          Nghĩa tiếng Việt *
          <input
            value={values.meaningVi}
            onChange={(e) => setValues((v) => ({ ...v, meaningVi: e.target.value }))}
            placeholder="ăn, thức ăn"
            required
          />
        </label>
        <label>
          JLPT
          <select
            value={values.jlptLevel}
            onChange={(e) =>
              setValues((v) => ({ ...v, jlptLevel: e.target.value as JlptLevel }))
            }
          >
            {JLPT_ORDER.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
        <label>
          Bài kanji
          <select
            value={values.lessonNumber}
            onChange={(e) =>
              setValues((v) => ({ ...v, lessonNumber: Number(e.target.value) }))
            }
          >
            {lessonOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="kanji-admin-actions">
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>
          Hủy
        </button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
          {saving ? 'Đang lưu...' : editId != null ? 'Cập nhật' : 'Thêm'}
        </button>
      </div>
    </form>
  );
}

export default function KanjiListView() {
  const { isAdmin, token } = useAuth();
  const queryClient = useQueryClient();
  const { data: lessons = [], isLoading: loadingLessons } = useKanjiLessonsQuery();
  const summary = useMemo(() => buildJlptSummary(lessons), [lessons]);
  const totalKanji = useMemo(() => summary.reduce((sum, item) => sum + item.count, 0), [summary]);

  const [activeLevel, setActiveLevel] = useState<ViewLevel>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');
  const [selectedEntry, setSelectedEntry] = useState<KanjiEntry | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formState, setFormState] = useState<
    null | { mode: 'create' } | { mode: 'edit'; entry: KanjiEntry }
  >(null);

  const canEdit = isAdmin && editMode;

  const isAllView = activeLevel === 'ALL';
  const { data: allEntries = [], isLoading: loadingAll } = useKanjiAllJlptQuery(isAllView);
  const { data: levelEntries = [], isLoading: loadingLevel } = useKanjiByJlptQuery(
    isAllView ? '' : activeLevel,
  );

  const entries = isAllView ? allEntries : levelEntries;
  const activeMeta = isAllView
    ? {
        level: 'ALL' as const,
        count: totalKanji,
        hint: `Gộp ${JLPT_ORDER.join(', ')} — ${totalKanji} kanji`,
        hasData: totalKanji > 0,
      }
    : (summary.find((item) => item.level === activeLevel) ?? summary[0]);

  const filteredEntries = useMemo(
    () => entries.filter((entry) => matchesSearch(entry, searchInput)),
    [entries, searchInput],
  );

  const isLoading = loadingLessons || (isAllView ? loadingAll : loadingLevel);

  const invalidateKanji = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.kanjiLessons });
    for (const level of JLPT_ORDER) {
      queryClient.invalidateQueries({ queryKey: queryKeys.kanjiByJlpt(level) });
    }
  }, [queryClient]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteKanjiEntry(id, token!),
    onSuccess: (_data, id) => {
      if (selectedEntry?.id === id) setSelectedEntry(null);
      setFormState(null);
      invalidateKanji();
    },
  });

  function selectLevel(level: ViewLevel) {
    setActiveLevel(level);
    setSearchInput('');
    setSelectedEntry(null);
    setFormState(null);
  }

  function selectEntry(entry: KanjiEntry) {
    setSelectedEntry(entry);
    playAudio(getPrimaryReading(entry));
  }

  function handleSaved() {
    setFormState(null);
    invalidateKanji();
  }

  function handleDelete(entry: KanjiEntry) {
    if (!token) return;
    const label = `${entry.character}${entry.hanViet ? ` (${entry.hanViet})` : ''}`;
    if (!window.confirm(`Xóa kanji "${label}"? Từ vựng liên quan cũng sẽ bị xóa.`)) return;
    deleteMutation.mutate(entry.id);
  }

  return (
    <div className="container kanji-list-view">
      <div className="kanji-list-header-row">
        <div>
          <h2 className="view-title">Bảng tổng hợp Kanji JLPT</h2>
          <p className="kanji-list-subtitle">
            {loadingLessons
              ? 'Đang tải thống kê kanji...'
              : `${totalKanji} kanji theo cấp N5 → N1 — tra cứu Hán Việt, âm ON/KUN và nghĩa tiếng Việt.`}
          </p>
        </div>
        {isAdmin && (
          <div className="kanji-admin-toolbar">
            <button
              type="button"
              className={`kanji-admin-toggle${editMode ? ' kanji-admin-toggle--on' : ''}`}
              onClick={() => {
                setEditMode((v) => !v);
                setFormState(null);
              }}
            >
              {editMode ? 'Xong' : 'Sửa'}
            </button>
            {canEdit && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setFormState({ mode: 'create' })}
              >
                + Thêm kanji
              </button>
            )}
          </div>
        )}
      </div>

      <div className="kanji-list-links">
        <Link href="/kanji">← Flashcard theo bài</Link>
        <Link href="/kanji/quiz">Quiz kanji →</Link>
      </div>

      {formState?.mode === 'create' && token && (
        <KanjiEntryAdminForm
          initial={defaultFormValues(activeLevel, lessons)}
          lessons={lessons}
          token={token}
          onCancel={() => setFormState(null)}
          onSaved={handleSaved}
        />
      )}
      {formState?.mode === 'edit' && token && (
        <KanjiEntryAdminForm
          editId={formState.entry.id}
          initial={entryToForm(formState.entry)}
          lessons={lessons}
          token={token}
          onCancel={() => setFormState(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="kanji-summary-grid" role="group" aria-label="Tổng quan kanji theo JLPT">
        {summary.map((item) => (
          <button
            key={item.level}
            type="button"
            className={`kanji-summary-card level-${item.level.toLowerCase()} ${
              activeLevel === item.level ? 'active' : ''
            }`}
            onClick={() => selectLevel(item.level)}
          >
            <span className="kanji-summary-level">{item.level}</span>
            <span className="kanji-summary-count">{item.count}</span>
            <span className="kanji-summary-hint">kanji · {item.hint}</span>
          </button>
        ))}
        <button
          type="button"
          className={`kanji-summary-card level-all ${activeLevel === 'ALL' ? 'active' : ''}`}
          onClick={() => selectLevel('ALL')}
        >
          <span className="kanji-summary-level">Tất cả</span>
          <span className="kanji-summary-count">{totalKanji}</span>
          <span className="kanji-summary-hint">N5 → N1</span>
        </button>
      </div>

      <div className="kanji-list-toolbar">
        <div className="kanji-list-tabs" role="tablist" aria-label="Cấp JLPT">
          <button
            type="button"
            role="tab"
            aria-selected={activeLevel === 'ALL'}
            className={`tab-btn ${activeLevel === 'ALL' ? 'active' : ''}`}
            onClick={() => selectLevel('ALL')}
          >
            Tất cả ({totalKanji})
          </button>
          {summary.map((item) => (
            <button
              key={item.level}
              type="button"
              role="tab"
              aria-selected={activeLevel === item.level}
              className={`tab-btn ${activeLevel === item.level ? 'active' : ''}`}
              onClick={() => selectLevel(item.level)}
            >
              {item.level} ({item.count})
            </button>
          ))}
        </div>

        <input
          type="search"
          className="kanji-list-search"
          placeholder="Lọc kanji, Hán Việt, âm đọc, nghĩa, JLPT..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Lọc kanji trong bảng"
          disabled={!activeMeta?.hasData}
        />

        <div className="kanji-display-toggle" role="group" aria-label="Kiểu hiển thị">
          <button
            type="button"
            className={`display-btn ${displayMode === 'grid' ? 'active' : ''}`}
            onClick={() => setDisplayMode('grid')}
            aria-pressed={displayMode === 'grid'}
          >
            Ô vuông
          </button>
          <button
            type="button"
            className={`display-btn ${displayMode === 'table' ? 'active' : ''}`}
            onClick={() => setDisplayMode('table')}
            aria-pressed={displayMode === 'table'}
          >
            Bảng
          </button>
        </div>
      </div>

      {activeMeta && (
        <div className="kanji-list-meta glass-panel" style={{ padding: '0.75rem 1rem' }}>
          <span>
            <strong>{isAllView ? 'Tất cả cấp' : activeMeta.level}</strong> — {activeMeta.hint}
          </span>
          <span>
            Hiển thị <strong>{filteredEntries.length}</strong> / {entries.length} kanji
          </span>
        </div>
      )}

      {isLoading ? (
        <p className="kanji-list-empty">
          Đang tải bảng kanji {isAllView ? 'tổng hợp' : activeLevel}...
        </p>
      ) : !activeMeta?.hasData ? (
        <p className="kanji-list-empty">
          Chưa có kanji {isAllView ? 'trong hệ thống' : activeLevel} trong database.
          {canEdit ? ' Bấm "+ Thêm kanji" để tạo mới.' : ' Khi thêm bài học mới, bảng sẽ tự cập nhật.'}
        </p>
      ) : filteredEntries.length === 0 ? (
        <p className="kanji-list-empty">Không tìm thấy kanji phù hợp.</p>
      ) : displayMode === 'grid' ? (
        <>
          <div className="kanji-cell-grid-wrap glass-panel">
            <div className="kanji-cell-grid" role="list" aria-label="Lưới kanji">
              {filteredEntries.map((entry) => {
                const jlpt = getEntryJlpt(entry);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    role="listitem"
                    className={`kanji-cell ${selectedEntry?.id === entry.id ? 'selected' : ''} ${
                      isAllView ? `level-${jlpt.toLowerCase()}` : ''
                    }`}
                    onClick={() => selectEntry(entry)}
                    title={[entry.hanViet, entry.onyomi, entry.kunyomi, entry.meaningVi]
                      .filter(Boolean)
                      .join(' · ')}
                  >
                    {isAllView && jlpt !== '—' && (
                      <span className="kanji-cell-badge">{jlpt}</span>
                    )}
                    <span className="kanji-cell-char">{entry.character}</span>
                    {entry.hanViet && <span className="kanji-cell-hv">{entry.hanViet}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedEntry && (
            <div className="kanji-cell-detail glass-panel">
              <div className="kanji-cell-detail-main">
                <span className="kanji-cell-detail-char">{selectedEntry.character}</span>
                <div>
                  <p className="kanji-cell-detail-hv">{selectedEntry.hanViet ?? '—'}</p>
                  <p className="kanji-cell-detail-reading">
                    ON: {selectedEntry.onyomi ?? '—'} · KUN: {selectedEntry.kunyomi ?? '—'}
                  </p>
                  <p className="kanji-cell-detail-meaning">{selectedEntry.meaningVi}</p>
                </div>
              </div>
              <div className="kanji-cell-detail-meta">
                {isAllView && (
                  <span className={`kanji-list-jlpt level-${getEntryJlpt(selectedEntry).toLowerCase()}`}>
                    {getEntryJlpt(selectedEntry)}
                  </span>
                )}
                {selectedEntry.lesson?.lessonNumber != null && (
                  <span>Bài {selectedEntry.lesson.lessonNumber}</span>
                )}
                <button
                  type="button"
                  className="kanji-cell-detail-speak"
                  onClick={() => playAudio(getPrimaryReading(selectedEntry))}
                >
                  Nghe đọc
                </button>
                {canEdit && (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setFormState({ mode: 'edit', entry: selectedEntry })}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm kanji-admin-delete"
                      disabled={deleteMutation.isPending}
                      onClick={() => handleDelete(selectedEntry)}
                    >
                      Xóa
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="kanji-list-table-wrap glass-panel">
          <table className="kanji-list-table">
            <thead>
              <tr>
                <th>#</th>
                {isAllView && <th>JLPT</th>}
                <th>Kanji</th>
                <th>Hán Việt</th>
                <th>Âm ON</th>
                <th>Âm KUN</th>
                <th>Nghĩa</th>
                <th>Bài</th>
                {canEdit && <th>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, index) => (
                <tr key={entry.id}>
                  <td>{index + 1}</td>
                  {isAllView && (
                    <td className={`kanji-list-jlpt level-${getEntryJlpt(entry).toLowerCase()}`}>
                      {getEntryJlpt(entry)}
                    </td>
                  )}
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
                  {canEdit && (
                    <td className="kanji-admin-row-actions">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setFormState({ mode: 'edit', entry })}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm kanji-admin-delete"
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(entry)}
                      >
                        Xóa
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
