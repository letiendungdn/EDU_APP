'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMockExamTemplate,
  deleteMockExamTemplate,
  fetchMockExamTemplatesAdmin,
  updateMockExamTemplate,
} from '../api';
import { queryKeys } from '../api/query-keys';
import { useAuth } from '../hooks/useAuth';
import { useMockExamTemplatesQuery } from '../hooks/queries';
import type { MockExamTemplateAdmin, MockExamTemplateInput } from '../types/api';
import './MockExam.css';

const LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'] as const;

const LEVEL_PRESETS: Record<
  (typeof LEVELS)[number],
  Pick<
    MockExamTemplateInput,
    | 'lessonFrom'
    | 'lessonTo'
    | 'kanjiLessonFrom'
    | 'kanjiLessonTo'
    | 'durationMinutes'
    | 'scope'
  >
> = {
  n5: {
    lessonFrom: 1,
    lessonTo: 25,
    kanjiLessonFrom: 1,
    kanjiLessonTo: 10,
    durationMinutes: 50,
    scope: 'Minna Bài 1–25',
  },
  n4: {
    lessonFrom: 26,
    lessonTo: 50,
    kanjiLessonFrom: 11,
    kanjiLessonTo: 20,
    durationMinutes: 65,
    scope: 'Minna Bài 26–50',
  },
  n3: {
    lessonFrom: 301,
    lessonTo: 399,
    kanjiLessonFrom: 21,
    kanjiLessonTo: 32,
    durationMinutes: 70,
    scope: 'Bộ N3 trong app',
  },
  n2: {
    lessonFrom: 401,
    lessonTo: 499,
    kanjiLessonFrom: 401,
    kanjiLessonTo: 499,
    durationMinutes: 75,
    scope: 'Bộ N2 trong app',
  },
  n1: {
    lessonFrom: 501,
    lessonTo: 599,
    kanjiLessonFrom: 501,
    kanjiLessonTo: 599,
    durationMinutes: 80,
    scope: 'Bộ N1 trong app',
  },
};

function emptyForm(level: (typeof LEVELS)[number] = 'n5'): MockExamTemplateInput {
  const preset = LEVEL_PRESETS[level];
  return {
    level,
    title: `Đề thi thử JLPT ${level.toUpperCase()}`,
    description: '',
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

function adminToForm(tpl: MockExamTemplateAdmin): MockExamTemplateInput {
  return {
    slug: tpl.slug,
    level: tpl.level,
    title: tpl.title,
    description: tpl.description,
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

function computeTotalQuestions(form: MockExamTemplateInput): number {
  return (
    (form.vocabCount ?? 0) +
    (form.grammarCount ?? 0) +
    (form.kanjiCount ?? 0) +
    (form.listeningWordCount ?? 0) +
    (form.listeningSentenceCount ?? 0)
  );
}

function MockExamAdminForm({
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

  const setField = <K extends keyof MockExamTemplateInput>(
    key: K,
    value: MockExamTemplateInput[K],
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'level' && typeof value === 'string') {
        const preset = LEVEL_PRESETS[value as (typeof LEVELS)[number]];
        if (preset) {
          next.lessonFrom = preset.lessonFrom;
          next.lessonTo = preset.lessonTo;
          next.kanjiLessonFrom = preset.kanjiLessonFrom;
          next.kanjiLessonTo = preset.kanjiLessonTo;
          next.durationMinutes = preset.durationMinutes;
          next.scope = preset.scope;
        }
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
          <select
            value={form.level}
            onChange={(e) => setField('level', e.target.value)}
          >
            {LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <label>
          Slug (URL)
          <input
            type="text"
            value={form.slug ?? ''}
            onChange={(e) => setField('slug', e.target.value)}
            placeholder="Tự tạo nếu để trống"
          />
        </label>
        <label className="mock-exam-admin-span2">
          Tiêu đề
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
          />
        </label>
        <label className="mock-exam-admin-span2">
          Mô tả
          <textarea
            rows={2}
            value={form.description ?? ''}
            onChange={(e) => setField('description', e.target.value)}
          />
        </label>
        <label>
          Thời gian (phút)
          <input
            type="number"
            min={10}
            max={240}
            required
            value={form.durationMinutes}
            onChange={(e) => setField('durationMinutes', Number(e.target.value))}
          />
        </label>
        <label>
          Ngưỡng đậu (%)
          <input
            type="number"
            min={0}
            max={100}
            value={form.passThreshold ?? 65}
            onChange={(e) => setField('passThreshold', Number(e.target.value))}
          />
        </label>
        <label>
          Bài học từ
          <input
            type="number"
            min={1}
            required
            value={form.lessonFrom}
            onChange={(e) => setField('lessonFrom', Number(e.target.value))}
          />
        </label>
        <label>
          Bài học đến
          <input
            type="number"
            min={1}
            required
            value={form.lessonTo}
            onChange={(e) => setField('lessonTo', Number(e.target.value))}
          />
        </label>
        <label>
          Kanji từ (bài)
          <input
            type="number"
            min={1}
            required
            value={form.kanjiLessonFrom}
            onChange={(e) => setField('kanjiLessonFrom', Number(e.target.value))}
          />
        </label>
        <label>
          Kanji đến (bài)
          <input
            type="number"
            min={1}
            required
            value={form.kanjiLessonTo}
            onChange={(e) => setField('kanjiLessonTo', Number(e.target.value))}
          />
        </label>
        <label>
          Số câu từ vựng
          <input
            type="number"
            min={0}
            value={form.vocabCount ?? 0}
            onChange={(e) => setField('vocabCount', Number(e.target.value))}
          />
        </label>
        <label>
          Số câu ngữ pháp
          <input
            type="number"
            min={0}
            value={form.grammarCount ?? 0}
            onChange={(e) => setField('grammarCount', Number(e.target.value))}
          />
        </label>
        <label>
          Số câu kanji
          <input
            type="number"
            min={0}
            value={form.kanjiCount ?? 0}
            onChange={(e) => setField('kanjiCount', Number(e.target.value))}
          />
        </label>
        <label>
          Nghe — từ vựng
          <input
            type="number"
            min={0}
            value={form.listeningWordCount ?? 0}
            onChange={(e) => setField('listeningWordCount', Number(e.target.value))}
          />
        </label>
        <label>
          Nghe — câu
          <input
            type="number"
            min={0}
            value={form.listeningSentenceCount ?? 0}
            onChange={(e) =>
              setField('listeningSentenceCount', Number(e.target.value))
            }
          />
        </label>
        <label>
          Thứ tự hiển thị
          <input
            type="number"
            min={0}
            value={form.sortOrder ?? 0}
            onChange={(e) => setField('sortOrder', Number(e.target.value))}
          />
        </label>
        <label className="mock-exam-admin-span2">
          Phạm vi (hiển thị)
          <input
            type="text"
            value={form.scope ?? ''}
            onChange={(e) => setField('scope', e.target.value)}
          />
        </label>
        <label className="mock-exam-admin-check">
          <input
            type="checkbox"
            checked={form.isPublished ?? true}
            onChange={(e) => setField('isPublished', e.target.checked)}
          />
          Công bố (hiện với học viên)
        </label>
      </div>

      <p className="mock-exam-admin-preview">
        Tổng cộng: <strong>{computeTotalQuestions(form)}</strong> câu
      </p>

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

export default function MockExamListPage() {
  const { isAdmin, token } = useAuth();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [formState, setFormState] = useState<
    null | { mode: 'create' } | { mode: 'edit'; tpl: MockExamTemplateAdmin }
  >(null);

  const canEdit = isAdmin && editMode;

  const publicQuery = useMockExamTemplatesQuery();
  const adminQuery = useQuery({
    queryKey: queryKeys.exam.templatesAdmin,
    queryFn: () => fetchMockExamTemplatesAdmin(token!),
    enabled: canEdit && !!token,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.exam.templates });
    queryClient.invalidateQueries({ queryKey: queryKeys.exam.templatesAdmin });
  }, [queryClient]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMockExamTemplate(id, token!),
    onSuccess: invalidate,
  });

  const templates = useMemo(() => {
    if (canEdit && adminQuery.data) return adminQuery.data;
    return publicQuery.data ?? [];
  }, [canEdit, adminQuery.data, publicQuery.data]);

  const loading = canEdit ? adminQuery.isLoading : publicQuery.isLoading;
  const isError = canEdit ? adminQuery.isError : publicQuery.isError;

  const handleSaved = () => {
    setFormState(null);
    invalidate();
  };

  return (
    <div className="container mock-exam-page">
      <header className="mock-exam-header">
        <div className="mock-exam-header-row">
          <div>
            <h2 className="view-title">Thi thử JLPT</h2>
            <p className="mock-exam-subtitle">
              Làm bài theo format thi thật — có giới hạn thời gian, nộp bài một lần, sau đó xem đáp án chi tiết.
            </p>
          </div>
          {isAdmin && (
            <div className="mock-exam-admin-toolbar">
              <button
                type="button"
                className={`mock-exam-admin-toggle${editMode ? ' mock-exam-admin-toggle--on' : ''}`}
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
                  + Thêm đề
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {formState?.mode === 'create' && token && (
        <MockExamAdminForm
          initial={emptyForm()}
          token={token}
          onCancel={() => setFormState(null)}
          onSaved={handleSaved}
        />
      )}
      {formState?.mode === 'edit' && token && (
        <MockExamAdminForm
          editId={formState.tpl.id}
          initial={adminToForm(formState.tpl)}
          token={token}
          onCancel={() => setFormState(null)}
          onSaved={handleSaved}
        />
      )}

      {loading ? (
        <div className="empty-state glass-panel">
          <p>Đang tải đề thi...</p>
        </div>
      ) : isError ? (
        <div className="empty-state glass-panel">
          <p>Không tải được danh sách đề thi. Hãy kiểm tra backend.</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="empty-state glass-panel">
          <p>Chưa có đề thi nào{canEdit ? ' — bấm "Thêm đề" để tạo.' : '.'}</p>
        </div>
      ) : (
        <div className="mock-exam-grid">
          {templates.map((tpl) => {
            const slug = tpl.slug ?? tpl.level;
            const adminTpl = tpl as MockExamTemplateAdmin;
            const unpublished = canEdit && adminTpl.isPublished === false;

            return (
              <article
                key={slug}
                className={`mock-exam-card glass-panel${unpublished ? ' mock-exam-card--draft' : ''}`}
              >
                <span className={`mock-exam-level-badge level-${tpl.level}`}>
                  {tpl.level.toUpperCase()}
                </span>
                {unpublished && (
                  <span className="mock-exam-draft-badge">Ẩn</span>
                )}
                <h3>{tpl.title}</h3>
                <p>{tpl.description}</p>
                <ul className="mock-exam-meta">
                  <li>⏱ {tpl.durationMinutes} phút</li>
                  <li>📝 {tpl.totalQuestions} câu</li>
                  <li>📖 {tpl.scope ?? `Minna Bài ${tpl.lessonRange}`}</li>
                  {canEdit && adminTpl.slug && (
                    <li>🔗 /mock-exam/{adminTpl.slug}</li>
                  )}
                </ul>

                <div className="mock-exam-card-actions">
                  {!unpublished && (
                    <Link
                      href={`/mock-exam/${slug}`}
                      className="btn btn-primary mock-exam-start-btn"
                    >
                      Bắt đầu thi
                    </Link>
                  )}
                  {canEdit && adminTpl.id && (
                    <>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() =>
                          setFormState({ mode: 'edit', tpl: adminTpl })
                        }
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm mock-exam-delete-btn"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Xóa đề "${tpl.title}"? Hành động không hoàn tác.`,
                            )
                          ) {
                            deleteMutation.mutate(adminTpl.id);
                          }
                        }}
                      >
                        Xóa
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <section className="mock-exam-notes glass-panel">
        <h3>Lưu ý khi thi</h3>
        <ul>
          <li>Không hiện đáp án trong lúc làm bài — giống kỳ thi thật.</li>
          <li>
            Phần <strong>Nghe</strong>: audio TTS tự phát, nghe lại tối đa 2 lần/câu.
          </li>
          <li>Có thể chuyển qua lại giữa các câu trước khi nộp bài.</li>
          <li>Hết giờ hệ thống tự nộp bài với các câu đã chọn.</li>
          <li>
            Sau khi nộp, vào trang <strong>Đáp án &amp; giải thích</strong> để ôn lại.
          </li>
        </ul>
      </section>
    </div>
  );
}
