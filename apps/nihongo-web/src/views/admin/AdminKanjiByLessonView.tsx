'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createKanjiEntry, deleteKanjiEntry, updateKanjiEntry } from '../../api';
import { useKanjiEntriesQuery, useKanjiLessonsQuery, queryKeys } from '../../hooks/queries';
import { useAuth } from '../../hooks/useAuth';
import type { CreateKanjiEntryInput, KanjiEntry } from '../../types/api';
import { AdminLessonPicker } from '../../components/admin/AdminLessonPicker';
import { AdminDataTable, type AdminColumn } from '../../components/admin/AdminDataTable';
import { AdminModal, AdminConfirmDialog } from '../../components/admin/AdminModal';
import { useAdminToast } from '../../components/admin/AdminToast';
import '../../components/admin/AdminComponents.css';

type FormState = {
  character: string;
  meaningVi: string;
  hanViet: string;
  onyomi: string;
  kunyomi: string;
  jlptLevel: string;
};

const emptyForm = (jlptLevel = 'N5'): FormState => ({
  character: '',
  meaningVi: '',
  hanViet: '',
  onyomi: '',
  kunyomi: '',
  jlptLevel,
});

export default function AdminKanjiByLessonView({
  initialLessonNumber,
}: {
  initialLessonNumber?: number;
} = {}) {
  const { token } = useAuth();
  const toast = useAdminToast();
  const queryClient = useQueryClient();
  const { data: lessons = [], isLoading: lessonsLoading } = useKanjiLessonsQuery();
  const [selectedLessonNumber, setSelectedLessonNumber] = useState<number | null>(
    initialLessonNumber ?? null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<KanjiEntry | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [confirmDelete, setConfirmDelete] = useState<KanjiEntry | null>(null);

  useEffect(() => {
    if (initialLessonNumber != null && initialLessonNumber > 0) {
      setSelectedLessonNumber(initialLessonNumber);
    }
  }, [initialLessonNumber]);

  const lessonItems = useMemo(
    () =>
      lessons.map((l) => ({
        id: l.id,
        lessonNumber: l.lessonNumber,
        title: l.title,
        jlptLevel: l.jlptLevel,
        count: l._count?.entries ?? null,
      })),
    [lessons],
  );

  const activeLessonNumber = selectedLessonNumber ?? lessonItems[0]?.lessonNumber ?? null;
  const activeLesson = lessons.find((l) => l.lessonNumber === activeLessonNumber);

  const { data: entries = [], isLoading: entriesLoading } = useKanjiEntriesQuery(
    activeLessonNumber ?? 0,
    activeLessonNumber != null,
  );

  const invalidate = () => {
    if (activeLessonNumber != null) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.kanjiEntries(activeLessonNumber) });
    }
    void queryClient.invalidateQueries({ queryKey: queryKeys.kanjiLessons });
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: CreateKanjiEntryInput) => {
      if (!token) throw new Error('Chưa đăng nhập');
      if (editing) return updateKanjiEntry(editing.id, payload, token);
      return createKanjiEntry(payload, token);
    },
    onSuccess: () => {
      toast.show(editing ? 'Đã cập nhật kanji.' : 'Đã thêm kanji.', 'success');
      setModalOpen(false);
      invalidate();
    },
    onError: (err: Error) => toast.show(err.message || 'Lưu thất bại', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!token) throw new Error('Chưa đăng nhập');
      return deleteKanjiEntry(id, token);
    },
    onSuccess: () => {
      toast.show('Đã xoá kanji.', 'success');
      setConfirmDelete(null);
      invalidate();
    },
    onError: (err: Error) => toast.show(err.message || 'Xoá thất bại', 'error'),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm(activeLesson?.jlptLevel ?? 'N5'));
    setModalOpen(true);
  }

  function openEdit(item: KanjiEntry) {
    setEditing(item);
    setForm({
      character: item.character,
      meaningVi: item.meaningVi,
      hanViet: item.hanViet ?? '',
      onyomi: item.onyomi ?? '',
      kunyomi: item.kunyomi ?? '',
      jlptLevel: item.jlptLevel ?? activeLesson?.jlptLevel ?? 'N5',
    });
    setModalOpen(true);
  }

  function onSubmit() {
    if (activeLessonNumber == null) return;
    if (!form.character.trim() || !form.meaningVi.trim()) {
      toast.show('Cần nhập chữ và nghĩa.', 'error');
      return;
    }
    saveMutation.mutate({
      character: form.character.trim(),
      meaningVi: form.meaningVi.trim(),
      lessonNumber: activeLessonNumber,
      hanViet: form.hanViet.trim() || undefined,
      onyomi: form.onyomi.trim() || undefined,
      kunyomi: form.kunyomi.trim() || undefined,
      jlptLevel: form.jlptLevel || undefined,
    });
  }

  const columns: AdminColumn<KanjiEntry>[] = [
    { key: 'character', header: '字', render: (r) => <span className="japanese-text" style={{ fontSize: 20 }}>{r.character}</span>, width: '60px' },
    { key: 'hanViet', header: 'HV', render: (r) => r.hanViet ?? '—', width: '90px' },
    { key: 'onyomi', header: 'On', render: (r) => r.onyomi ?? '—' },
    { key: 'kunyomi', header: 'Kun', render: (r) => r.kunyomi ?? '—' },
    { key: 'meaningVi', header: 'Nghĩa', render: (r) => r.meaningVi },
    { key: 'jlptLevel', header: 'JLPT', render: (r) => r.jlptLevel ?? activeLesson?.jlptLevel ?? '—', width: '70px' },
  ];

  return (
    <AdminLessonPicker
      title="Bài kanji"
      lessons={lessonItems}
      loading={lessonsLoading}
      activeLessonNumber={activeLessonNumber}
      onSelectLesson={setSelectedLessonNumber}
      emptySelectHint="Chọn một bài kanji bên trái để xem / sửa danh sách chữ."
    >
      {activeLessonNumber != null && activeLesson && (
        <>
          <div className="admin-toolbar" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: '1rem' }}>
              #{activeLesson.lessonNumber} {activeLesson.title?.trim() || `Bài ${activeLesson.lessonNumber}`}
              {activeLesson.jlptLevel ? ` · ${activeLesson.jlptLevel}` : ''}
              {activeLesson._count?.entries != null ? ` (${activeLesson._count.entries})` : ''}
            </h2>
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              + Thêm kanji
            </button>
          </div>

          <AdminDataTable
            columns={columns}
            rows={entries}
            rowKey={(r) => r.id}
            loading={entriesLoading}
            emptyText="Chưa có kanji trong bài này."
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
        </>
      )}

      <AdminModal
        open={modalOpen}
        title={editing ? `Sửa kanji ${editing.character}` : 'Thêm kanji'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Huỷ
            </button>
            <button type="button" className="btn btn-primary" disabled={saveMutation.isPending} onClick={onSubmit}>
              {saveMutation.isPending ? 'Đang lưu...' : 'Lưu'}
            </button>
          </>
        }
      >
        <div className="admin-content-form-grid">
          <label>
            Chữ
            <input value={form.character} onChange={(e) => setForm((f) => ({ ...f, character: e.target.value }))} />
          </label>
          <label>
            Nghĩa VI
            <input value={form.meaningVi} onChange={(e) => setForm((f) => ({ ...f, meaningVi: e.target.value }))} />
          </label>
          <label>
            Hán Việt
            <input value={form.hanViet} onChange={(e) => setForm((f) => ({ ...f, hanViet: e.target.value }))} />
          </label>
          <label>
            On’yomi
            <input value={form.onyomi} onChange={(e) => setForm((f) => ({ ...f, onyomi: e.target.value }))} />
          </label>
          <label>
            Kun’yomi
            <input value={form.kunyomi} onChange={(e) => setForm((f) => ({ ...f, kunyomi: e.target.value }))} />
          </label>
          <label>
            JLPT
            <select value={form.jlptLevel} onChange={(e) => setForm((f) => ({ ...f, jlptLevel: e.target.value }))}>
              {['N5', 'N4', 'N3', 'N2', 'N1'].map((lv) => (
                <option key={lv} value={lv}>
                  {lv}
                </option>
              ))}
            </select>
          </label>
        </div>
      </AdminModal>

      <AdminConfirmDialog
        open={!!confirmDelete}
        message={`Xoá kanji "${confirmDelete?.character}"?`}
        onConfirm={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}
        onCancel={() => setConfirmDelete(null)}
      />
    </AdminLessonPicker>
  );
}
