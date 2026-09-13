'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createReadingPassage,
  deleteReadingPassage,
  fetchReadingPassages,
  fetchReadingPassage,
  updateReadingPassage,
  type ReadingPassageInput,
  type ReadingPassageSummary,
} from '../../api';
import { useAuth } from '../../hooks/useAuth';
import { AdminDataTable, type AdminColumn } from '../../components/admin/AdminDataTable';
import { AdminModal, AdminConfirmDialog } from '../../components/admin/AdminModal';
import { AdminSearchInput } from '../../components/admin/AdminSearchInput';
import { AdminJlptFilter, type JlptLevelFilter } from '../../components/admin/AdminJlptFilter';
import { useAdminToast } from '../../components/admin/AdminToast';
import '../../components/admin/AdminComponents.css';
import './AdminPages.css';

type QuestionDraft = {
  question: string;
  answer: string;
  explanation: string;
  options: string[];
};

const EMPTY_QUESTION = (): QuestionDraft => ({
  question: '',
  answer: '',
  explanation: '',
  options: ['', '', '', ''],
});

const EMPTY_FORM = (): ReadingPassageInput & { questionsDraft: QuestionDraft[] } => ({
  title: '',
  content: '',
  jlptLevel: undefined,
  source: '',
  estimatedMin: 3,
  sortOrder: 0,
  questionsDraft: [EMPTY_QUESTION()],
});

export default function AdminReadingView() {
  const { token } = useAuth();
  const toast = useAdminToast();
  const [items, setItems] = useState<ReadingPassageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<JlptLevelFilter>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM());
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ReadingPassageSummary | null>(null);

  async function load() {
    setLoading(true);
    try {
      setItems(await fetchReadingPassages());
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Không tải được danh sách', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (level && it.jlptLevel !== level) return false;
      if (!q) return true;
      return it.title.toLowerCase().includes(q);
    });
  }, [items, search, level]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM());
    setModalOpen(true);
  }

  async function openEdit(item: ReadingPassageSummary) {
    setEditingId(item.id);
    setModalOpen(true);
    try {
      const full = await fetchReadingPassage(item.id);
      setForm({
        title: full.title,
        content: full.content,
        jlptLevel: full.jlptLevel ?? undefined,
        source: full.source ?? '',
        estimatedMin: full.estimatedMin,
        sortOrder: item.sortOrder,
        questionsDraft: full.questions.length
          ? full.questions.map((q) => ({
              question: q.question,
              answer: q.answer,
              explanation: q.explanation ?? '',
              options: q.options.map((o) => o.text),
            }))
          : [EMPTY_QUESTION()],
      });
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Không tải được bài đọc', 'error');
      setModalOpen(false);
    }
  }

  function updateQuestion(index: number, patch: Partial<QuestionDraft>) {
    setForm((f) => ({
      ...f,
      questionsDraft: f.questionsDraft.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    }));
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    setForm((f) => ({
      ...f,
      questionsDraft: f.questionsDraft.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, oi) => (oi === oIndex ? value : o)) } : q,
      ),
    }));
  }

  function addQuestion() {
    setForm((f) => ({ ...f, questionsDraft: [...f.questionsDraft, EMPTY_QUESTION()] }));
  }

  function removeQuestion(index: number) {
    setForm((f) => ({ ...f, questionsDraft: f.questionsDraft.filter((_, i) => i !== index) }));
  }

  function validate(): string | null {
    if (!form.title.trim()) return 'Cần nhập tiêu đề.';
    if (!form.content.trim()) return 'Cần nhập nội dung bài đọc.';
    for (const [i, q] of form.questionsDraft.entries()) {
      const opts = q.options.map((o) => o.trim()).filter(Boolean);
      if (!q.question.trim()) return `Câu hỏi #${i + 1}: thiếu nội dung câu hỏi.`;
      if (opts.length < 2) return `Câu hỏi #${i + 1}: cần ít nhất 2 lựa chọn.`;
      if (!opts.includes(q.answer.trim())) {
        return `Câu hỏi #${i + 1}: đáp án phải trùng chính xác 1 trong các lựa chọn.`;
      }
    }
    return null;
  }

  async function onSubmit() {
    if (!token) return;
    const err = validate();
    if (err) {
      toast.show(err, 'error');
      return;
    }
    setBusy(true);
    try {
      const payload: ReadingPassageInput = {
        title: form.title,
        content: form.content,
        jlptLevel: form.jlptLevel,
        source: form.source || undefined,
        estimatedMin: form.estimatedMin,
        sortOrder: form.sortOrder,
        questions: form.questionsDraft.map((q) => ({
          question: q.question.trim(),
          answer: q.answer.trim(),
          explanation: q.explanation.trim() || undefined,
          options: q.options.map((o) => o.trim()).filter(Boolean),
        })),
      };
      if (editingId != null) {
        await updateReadingPassage(editingId, payload, token);
        toast.show('Đã cập nhật bài đọc.', 'success');
      } else {
        await createReadingPassage(payload, token);
        toast.show('Đã tạo bài đọc mới.', 'success');
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Lưu thất bại', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!token || !confirmDelete) return;
    setBusy(true);
    try {
      await deleteReadingPassage(confirmDelete.id, token);
      toast.show('Đã xoá bài đọc.', 'success');
      setConfirmDelete(null);
      await load();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Xoá thất bại', 'error');
    } finally {
      setBusy(false);
    }
  }

  const columns: AdminColumn<ReadingPassageSummary>[] = [
    { key: 'title', header: 'Tiêu đề', render: (r) => r.title },
    { key: 'jlptLevel', header: 'Cấp', render: (r) => r.jlptLevel ?? '—', width: '70px' },
    { key: 'estimatedMin', header: 'Phút', render: (r) => r.estimatedMin, width: '70px' },
    { key: 'questions', header: 'Câu hỏi', render: (r) => r._count.questions, width: '90px' },
  ];

  return (
    <div>
      <div className="admin-toolbar">
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Tìm theo tiêu đề..." />
        <AdminJlptFilter value={level} onChange={setLevel} />
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Thêm bài đọc
        </button>
      </div>

      <AdminDataTable
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.id}
        loading={loading}
        emptyText="Chưa có bài đọc nào."
        actions={(r) => (
          <>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(r)}>
              Sửa
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(r)}>
              Xoá
            </button>
          </>
        )}
      />

      <AdminModal
        open={modalOpen}
        title={editingId != null ? 'Sửa bài đọc' : 'Thêm bài đọc'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Huỷ
            </button>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={onSubmit}>
              {busy ? 'Đang lưu...' : 'Lưu'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '65vh', overflowY: 'auto' }}>
          <label>
            Tiêu đề
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </label>
          <label>
            Nội dung bài đọc (tiếng Nhật)
            <textarea
              rows={6}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            />
          </label>
          <div className="admin-content-form-grid">
            <label>
              Cấp JLPT
              <select
                value={form.jlptLevel ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, jlptLevel: e.target.value || undefined }))}
              >
                <option value="">—</option>
                {['N5', 'N4', 'N3', 'N2', 'N1'].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Thời gian ước tính (phút)
              <input
                type="number"
                value={form.estimatedMin ?? 3}
                onChange={(e) => setForm((f) => ({ ...f, estimatedMin: Number(e.target.value) }))}
              />
            </label>
            <label>
              Thứ tự (sortOrder)
              <input
                type="number"
                value={form.sortOrder ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              />
            </label>
            <label>
              Nguồn (tuỳ chọn)
              <input value={form.source ?? ''} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} />
            </label>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.4rem 0' }} />
          <strong>Câu hỏi</strong>
          {form.questionsDraft.map((q, qi) => (
            <div
              key={qi}
              className="glass-panel"
              style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Câu {qi + 1}</strong>
                {form.questionsDraft.length > 1 && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeQuestion(qi)}>
                    Xoá câu
                  </button>
                )}
              </div>
              <input
                placeholder="Nội dung câu hỏi"
                value={q.question}
                onChange={(e) => updateQuestion(qi, { question: e.target.value })}
              />
              {q.options.map((opt, oi) => (
                <div key={oi} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name={`answer-${qi}`}
                    checked={opt.trim().length > 0 && opt.trim() === q.answer.trim()}
                    onChange={() => updateQuestion(qi, { answer: opt })}
                    title="Đánh dấu là đáp án đúng"
                  />
                  <input
                    style={{ flex: 1 }}
                    placeholder={`Lựa chọn ${oi + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const wasAnswer = opt.trim() === q.answer.trim() && opt.trim().length > 0;
                      updateOption(qi, oi, e.target.value);
                      if (wasAnswer) updateQuestion(qi, { answer: e.target.value });
                    }}
                  />
                </div>
              ))}
              <textarea
                rows={2}
                placeholder="Giải thích (tuỳ chọn)"
                value={q.explanation}
                onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
              />
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={addQuestion}>
            + Thêm câu hỏi
          </button>
        </div>
      </AdminModal>

      <AdminConfirmDialog
        open={!!confirmDelete}
        message={`Xoá bài đọc "${confirmDelete?.title}"? Toàn bộ câu hỏi bên trong sẽ mất.`}
        onConfirm={onDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
