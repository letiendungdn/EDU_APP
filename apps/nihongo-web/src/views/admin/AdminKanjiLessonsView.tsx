'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createKanjiLesson,
  deleteKanjiLesson,
  fetchKanjiLessons,
  updateKanjiLesson,
  type KanjiLessonInput,
} from '../../api';
import { useAuth } from '../../hooks/useAuth';
import type { KanjiLesson } from '../../types/api';
import { AdminDataTable, type AdminColumn } from '../../components/admin/AdminDataTable';
import { AdminModal, AdminConfirmDialog } from '../../components/admin/AdminModal';
import { AdminSearchInput } from '../../components/admin/AdminSearchInput';
import { AdminJlptFilter, type JlptLevelFilter } from '../../components/admin/AdminJlptFilter';
import { useAdminToast } from '../../components/admin/AdminToast';
import '../../components/admin/AdminComponents.css';
import './AdminPages.css';

const EMPTY_FORM: KanjiLessonInput = { lessonNumber: 0, title: '', jlptLevel: undefined, sortOrder: 0 };

export default function AdminKanjiLessonsView() {
  const { token } = useAuth();
  const toast = useAdminToast();
  const [items, setItems] = useState<KanjiLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<JlptLevelFilter>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<KanjiLesson | null>(null);
  const [form, setForm] = useState<KanjiLessonInput>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<KanjiLesson | null>(null);

  async function load() {
    setLoading(true);
    try {
      setItems(await fetchKanjiLessons());
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
      return [String(it.lessonNumber), it.title, it.jlptLevel].filter(Boolean).join(' ').toLowerCase().includes(q);
    });
  }, [items, search, level]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, lessonNumber: (Math.max(0, ...items.map((i) => i.lessonNumber)) || 0) + 1 });
    setModalOpen(true);
  }

  function openEdit(item: KanjiLesson) {
    setEditing(item);
    setForm({
      lessonNumber: item.lessonNumber,
      title: item.title ?? '',
      jlptLevel: item.jlptLevel ?? undefined,
      sortOrder: item.sortOrder ?? 0,
    });
    setModalOpen(true);
  }

  async function onSubmit() {
    if (!token) return;
    setBusy(true);
    try {
      if (editing) {
        await updateKanjiLesson(editing.id, form, token);
        toast.show('Đã cập nhật lesson.', 'success');
      } else {
        await createKanjiLesson(form, token);
        toast.show('Đã tạo lesson mới.', 'success');
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
      await deleteKanjiLesson(confirmDelete.id, token);
      toast.show('Đã xoá lesson.', 'success');
      setConfirmDelete(null);
      await load();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Xoá thất bại (còn kanji bên trong?)', 'error');
    } finally {
      setBusy(false);
    }
  }

  const columns: AdminColumn<KanjiLesson>[] = [
    { key: 'lessonNumber', header: '#', render: (r) => r.lessonNumber, width: '70px' },
    { key: 'title', header: 'Tiêu đề', render: (r) => r.title ?? `Bài ${r.lessonNumber}` },
    { key: 'jlptLevel', header: 'Cấp', render: (r) => r.jlptLevel ?? '—', width: '70px' },
    { key: 'count', header: 'Số kanji', render: (r) => r._count?.entries ?? 0, width: '90px' },
  ];

  return (
    <div>
      <div className="admin-toolbar">
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Tìm theo số bài / tiêu đề..." />
        <AdminJlptFilter value={level} onChange={setLevel} />
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Thêm lesson
        </button>
      </div>

      <AdminDataTable
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.id}
        loading={loading}
        emptyText="Chưa có kanji lesson nào."
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
        title={editing ? `Sửa lesson #${editing.lessonNumber}` : 'Thêm kanji lesson'}
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
        <div className="admin-content-form-grid">
          <label>
            Số bài (lessonNumber)
            <input
              type="number"
              value={form.lessonNumber}
              onChange={(e) => setForm((f) => ({ ...f, lessonNumber: Number(e.target.value) }))}
            />
          </label>
          <label>
            Tiêu đề
            <input value={form.title ?? ''} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </label>
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
            Thứ tự (sortOrder)
            <input
              type="number"
              value={form.sortOrder ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
            />
          </label>
        </div>
      </AdminModal>

      <AdminConfirmDialog
        open={!!confirmDelete}
        message={`Xoá kanji lesson #${confirmDelete?.lessonNumber}? Chỉ xoá được khi lesson không còn kanji nào bên trong.`}
        onConfirm={onDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
