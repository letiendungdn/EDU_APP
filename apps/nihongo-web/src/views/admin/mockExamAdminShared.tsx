'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createMockExamTemplate, updateMockExamTemplate } from '../../api';
import type { MockExamTemplateAdmin, MockExamTemplateInput } from '../../types/api';
import '../MockExam.css';

export const LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'] as const;

export const LEVEL_PRESETS: Record<
  (typeof LEVELS)[number],
  Pick<MockExamTemplateInput, 'lessonFrom' | 'lessonTo' | 'kanjiLessonFrom' | 'kanjiLessonTo' | 'durationMinutes' | 'scope'>
> = {
  n5: { lessonFrom: 1, lessonTo: 25, kanjiLessonFrom: 1, kanjiLessonTo: 10, durationMinutes: 50, scope: 'Minna Bài 1–25' },
  n4: { lessonFrom: 26, lessonTo: 50, kanjiLessonFrom: 11, kanjiLessonTo: 20, durationMinutes: 65, scope: 'Minna Bài 26–50' },
  n3: { lessonFrom: 301, lessonTo: 399, kanjiLessonFrom: 21, kanjiLessonTo: 32, durationMinutes: 70, scope: 'Bộ N3 trong app' },
  n2: { lessonFrom: 401, lessonTo: 499, kanjiLessonFrom: 401, kanjiLessonTo: 499, durationMinutes: 75, scope: 'Bộ N2 trong app' },
  n1: { lessonFrom: 501, lessonTo: 599, kanjiLessonFrom: 501, kanjiLessonTo: 599, durationMinutes: 80, scope: 'Bộ N1 trong app' },
};

export function emptyForm(level: (typeof LEVELS)[number] = 'n5'): MockExamTemplateInput {
  const preset = LEVEL_PRESETS[level];
  return {
    level,
    title: `Đề thi thử JLPT ${level.toUpperCase()}`,
    description: '',
    sourceMode: 'GENERATED',
    durationMinutes: preset.durationMinutes,
    lessonFrom: preset.lessonFrom,
    lessonTo: preset.lessonTo,
    kanjiLessonFrom: preset.kanjiLessonFrom,
    kanjiLessonTo: preset.kanjiLessonTo,
    vocabCount: 12,
    grammarCount: 10,
    kanjiCount: 5,
    listeningWordCount: 4,
    listeningSentenceCount: 4,
    passThreshold: 65,
    scope: preset.scope,
    isPublished: true,
    sortOrder: 0,
  };
}

export function adminToForm(tpl: MockExamTemplateAdmin): MockExamTemplateInput {
  return {
    slug: tpl.slug,
    level: tpl.level,
    title: tpl.title,
    description: tpl.description,
    sourceMode: tpl.sourceMode ?? 'GENERATED',
    durationMinutes: tpl.durationMinutes,
    lessonFrom: tpl.lessonFrom,
    lessonTo: tpl.lessonTo,
    kanjiLessonFrom: tpl.kanjiLessonFrom,
    kanjiLessonTo: tpl.kanjiLessonTo,
    vocabCount: tpl.vocabCount,
    grammarCount: tpl.grammarCount,
    kanjiCount: tpl.kanjiCount,
    listeningWordCount: tpl.listeningWordCount,
    listeningSentenceCount: tpl.listeningSentenceCount,
    passThreshold: tpl.passThreshold,
    scope: tpl.scope ?? '',
    isPublished: tpl.isPublished ?? true,
    sortOrder: tpl.sortOrder ?? 0,
  };
}

export function computeTotalQuestions(form: MockExamTemplateInput): number {
  return (
    (form.vocabCount ?? 0) +
    (form.grammarCount ?? 0) +
    (form.kanjiCount ?? 0) +
    (form.listeningWordCount ?? 0) +
    (form.listeningSentenceCount ?? 0)
  );
}

export function MockExamAdminForm({
  editId,
  initial,
  onCancel,
  onSaved,
  token,
}: {
  editId?: number;
  initial: MockExamTemplateInput;
  onCancel: () => void;
  onSaved: () => void;
  token: string;
}) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const isEdit = editId != null;
  const isCustom = form.sourceMode === 'CUSTOM';

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isEdit && editId) {
        return updateMockExamTemplate(editId, form, token);
      }
      return createMockExamTemplate(form, token);
    },
    onSuccess: () => onSaved(),
    onError: (err: Error) => setError(err.message || 'Lưu thất bại'),
  });

  const setField = <K extends keyof MockExamTemplateInput>(key: K, value: MockExamTemplateInput[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'level' && typeof value === 'string') {
        const preset = LEVEL_PRESETS[value as (typeof LEVELS)[number]];
        if (preset && next.sourceMode !== 'CUSTOM') {
          next.lessonFrom = preset.lessonFrom;
          next.lessonTo = preset.lessonTo;
          next.kanjiLessonFrom = preset.kanjiLessonFrom;
          next.kanjiLessonTo = preset.kanjiLessonTo;
          next.durationMinutes = preset.durationMinutes;
          next.scope = preset.scope;
        }
      }
      if (key === 'sourceMode' && value === 'CUSTOM') {
        next.scope = next.scope || 'Đề tự soạn';
        next.vocabCount = 0;
        next.grammarCount = 0;
        next.kanjiCount = 0;
        next.listeningWordCount = 0;
        next.listeningSentenceCount = 0;
      }
      return next;
    });
  };

  return (
    <form
      className="mock-exam-admin-form glass-panel"
      onSubmit={(e) => {
        e.preventDefault();
        setError('');
        saveMutation.mutate();
      }}
    >
      <h3>{isEdit ? 'Sửa đề thi' : 'Thêm đề thi mới'}</h3>
      {error && <p className="mock-exam-admin-error">{error}</p>}

      <div className="mock-exam-admin-grid">
        <label>
          Cấp độ
          <select value={form.level} onChange={(e) => setField('level', e.target.value)}>
            {LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <label>
          Loại đề
          <select value={form.sourceMode ?? 'GENERATED'} onChange={(e) => setField('sourceMode', e.target.value as 'GENERATED' | 'CUSTOM')}>
            <option value="GENERATED">Tự sinh từ bài học</option>
            <option value="CUSTOM">Tự soạn câu hỏi + audio</option>
          </select>
        </label>
        <label>
          Slug (URL)
          <input type="text" value={form.slug ?? ''} onChange={(e) => setField('slug', e.target.value)} placeholder="Tự tạo nếu để trống" />
        </label>
        <label className="mock-exam-admin-span2">
          Tiêu đề
          <input type="text" required value={form.title} onChange={(e) => setField('title', e.target.value)} />
        </label>
        <label className="mock-exam-admin-span2">
          Mô tả
          <textarea rows={2} value={form.description ?? ''} onChange={(e) => setField('description', e.target.value)} />
        </label>
        <label>
          Thời gian (phút)
          <input type="number" min={10} max={240} required value={form.durationMinutes} onChange={(e) => setField('durationMinutes', Number(e.target.value))} />
        </label>
        <label>
          Ngưỡng đậu (%)
          <input type="number" min={0} max={100} value={form.passThreshold ?? 65} onChange={(e) => setField('passThreshold', Number(e.target.value))} />
        </label>
        {!isCustom && (
          <>
            <label>
              Bài học từ
              <input type="number" min={1} required value={form.lessonFrom} onChange={(e) => setField('lessonFrom', Number(e.target.value))} />
            </label>
            <label>
              Bài học đến
              <input type="number" min={1} required value={form.lessonTo} onChange={(e) => setField('lessonTo', Number(e.target.value))} />
            </label>
            <label>
              Kanji từ (bài)
              <input type="number" min={1} required value={form.kanjiLessonFrom} onChange={(e) => setField('kanjiLessonFrom', Number(e.target.value))} />
            </label>
            <label>
              Kanji đến (bài)
              <input type="number" min={1} required value={form.kanjiLessonTo} onChange={(e) => setField('kanjiLessonTo', Number(e.target.value))} />
            </label>
            <label>
              Số câu từ vựng
              <input type="number" min={0} value={form.vocabCount ?? 0} onChange={(e) => setField('vocabCount', Number(e.target.value))} />
            </label>
            <label>
              Số câu ngữ pháp
              <input type="number" min={0} value={form.grammarCount ?? 0} onChange={(e) => setField('grammarCount', Number(e.target.value))} />
            </label>
            <label>
              Số câu kanji
              <input type="number" min={0} value={form.kanjiCount ?? 0} onChange={(e) => setField('kanjiCount', Number(e.target.value))} />
            </label>
            <label>
              Nghe — từ vựng
              <input type="number" min={0} value={form.listeningWordCount ?? 0} onChange={(e) => setField('listeningWordCount', Number(e.target.value))} />
            </label>
            <label>
              Nghe — câu
              <input type="number" min={0} value={form.listeningSentenceCount ?? 0} onChange={(e) => setField('listeningSentenceCount', Number(e.target.value))} />
            </label>
          </>
        )}
        {isCustom && (
          <p className="mock-exam-admin-span2 mock-exam-admin-hint">
            Đề tự soạn: sau khi lưu, bấm <strong>Câu hỏi</strong> trên thẻ đề để thêm câu hỏi, đáp án và file âm thanh.
          </p>
        )}
        <label>
          Thứ tự hiển thị
          <input type="number" min={0} value={form.sortOrder ?? 0} onChange={(e) => setField('sortOrder', Number(e.target.value))} />
        </label>
        <label className="mock-exam-admin-span2">
          Phạm vi (hiển thị)
          <input type="text" value={form.scope ?? ''} onChange={(e) => setField('scope', e.target.value)} />
        </label>
        <label className="mock-exam-admin-check">
          <input type="checkbox" checked={form.isPublished ?? true} onChange={(e) => setField('isPublished', e.target.checked)} />
          Công bố (hiện với học viên)
        </label>
      </div>

      {!isCustom && (
        <p className="mock-exam-admin-preview">
          Tổng cộng: <strong>{computeTotalQuestions(form)}</strong> câu
        </p>
      )}

      <div className="mock-exam-admin-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Hủy
        </button>
        <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Đang lưu…' : 'Lưu'}
        </button>
      </div>
    </form>
  );
}
