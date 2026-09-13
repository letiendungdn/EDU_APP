'use client';

import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteMockExamTemplate, fetchMockExamTemplatesAdmin } from '../../api';
import { queryKeys } from '../../api/query-keys';
import { useAuth } from '../../hooks/useAuth';
import type { MockExamTemplateAdmin } from '../../types/api';
import MockExamQuestionEditor from '../../components/MockExamQuestionEditor';
import { AdminDataTable, type AdminColumn } from '../../components/admin/AdminDataTable';
import { AdminConfirmDialog } from '../../components/admin/AdminModal';
import { useAdminToast } from '../../components/admin/AdminToast';
import { emptyForm, adminToForm, MockExamAdminForm } from './mockExamAdminShared';
import '../../components/admin/AdminComponents.css';

export default function AdminMockExamsView() {
  const { token } = useAuth();
  const toast = useAdminToast();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState<null | { mode: 'create' } | { mode: 'edit'; tpl: MockExamTemplateAdmin }>(null);
  const [questionsTpl, setQuestionsTpl] = useState<MockExamTemplateAdmin | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MockExamTemplateAdmin | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.exam.templatesAdmin,
    queryFn: () => fetchMockExamTemplatesAdmin(token!),
    enabled: !!token,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.exam.templates });
    queryClient.invalidateQueries({ queryKey: queryKeys.exam.templatesAdmin });
  }, [queryClient]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMockExamTemplate(id, token!),
    onSuccess: () => {
      toast.show('Đã xoá đề thi.', 'success');
      setConfirmDelete(null);
      invalidate();
    },
    onError: (e: Error) => toast.show(e.message || 'Xoá thất bại', 'error'),
  });

  const templates = data ?? [];

  const columns: AdminColumn<MockExamTemplateAdmin>[] = [
    { key: 'level', header: 'Cấp', render: (r) => r.level.toUpperCase(), width: '60px' },
    { key: 'title', header: 'Tiêu đề', render: (r) => r.title },
    { key: 'mode', header: 'Loại', render: (r) => ((r.sourceMode ?? 'GENERATED') === 'CUSTOM' ? 'Tự soạn' : 'Tự sinh') },
    { key: 'total', header: 'Số câu', render: (r) => r.totalQuestions, width: '80px' },
    { key: 'duration', header: 'Phút', render: (r) => r.durationMinutes, width: '70px' },
    { key: 'published', header: 'Trạng thái', render: (r) => (r.isPublished === false ? 'Ẩn' : 'Đã công bố'), width: '100px' },
  ];

  return (
    <div>
      <div className="admin-toolbar">
        <button type="button" className="btn btn-primary" onClick={() => setFormState({ mode: 'create' })}>
          + Thêm đề
        </button>
      </div>

      {formState?.mode === 'create' && token && (
        <MockExamAdminForm
          initial={emptyForm()}
          token={token}
          onCancel={() => setFormState(null)}
          onSaved={() => {
            setFormState(null);
            toast.show('Đã tạo đề thi.', 'success');
            invalidate();
          }}
        />
      )}
      {formState?.mode === 'edit' && token && (
        <MockExamAdminForm
          editId={formState.tpl.id}
          initial={adminToForm(formState.tpl)}
          token={token}
          onCancel={() => setFormState(null)}
          onSaved={() => {
            setFormState(null);
            toast.show('Đã cập nhật đề thi.', 'success');
            invalidate();
          }}
        />
      )}
      {questionsTpl && token && (
        <MockExamQuestionEditor
          templateId={questionsTpl.id}
          title={questionsTpl.title}
          token={token}
          onClose={() => {
            setQuestionsTpl(null);
            invalidate();
          }}
        />
      )}

      <AdminDataTable
        columns={columns}
        rows={templates}
        rowKey={(r) => r.id}
        loading={isLoading}
        emptyText='Chưa có đề thi nào — bấm "Thêm đề" để tạo.'
        actions={(r) => (
          <>
            {(r.sourceMode ?? 'GENERATED') === 'CUSTOM' && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setQuestionsTpl(r)}>
                Câu hỏi
              </button>
            )}
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setFormState({ mode: 'edit', tpl: r })}>
              Sửa
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(r)}>
              Xoá
            </button>
          </>
        )}
      />

      <AdminConfirmDialog
        open={!!confirmDelete}
        message={`Xoá đề "${confirmDelete?.title}"? Hành động không hoàn tác.`}
        onConfirm={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
