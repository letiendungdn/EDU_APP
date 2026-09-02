'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  createMockExamQuestion,
  deleteMockExamQuestion,
  fetchMockExamQuestions,
  getPresignedUploadUrl,
  updateMockExamQuestion,
} from '../api';
import { queryKeys } from '../api/query-keys';
import type {
  MockExamQuestionAdmin,
  MockExamQuestionInput,
  MockExamQuestionOptionInput,
} from '../types/api';

const SECTIONS = [
  { id: 'vocab', label: 'Từ vựng' },
  { id: 'grammar', label: 'Ngữ pháp' },
  { id: 'kanji', label: 'Kanji' },
  { id: 'listening', label: 'Nghe' },
] as const;

const TYPES = [
  { id: 'multiple_choice', label: 'Trắc nghiệm' },
  { id: 'fill_in_blank', label: 'Điền từ' },
  { id: 'listening', label: 'Nghe hiểu' },
] as const;

function emptyOptions(): MockExamQuestionOptionInput[] {
  return [
    { text: '', imageUrl: '' },
    { text: '', imageUrl: '' },
    { text: '', imageUrl: '' },
    { text: '', imageUrl: '' },
  ];
}

function emptyQuestion(
  sectionId: MockExamQuestionInput['sectionId'] = 'vocab',
): MockExamQuestionInput {
  return {
    sectionId,
    type: sectionId === 'listening' ? 'listening' : 'multiple_choice',
    question: '',
    correctAnswer: '',
    options: emptyOptions(),
    imageUrl: '',
    audioText: '',
    audioUrl: '',
  };
}

function fromAdmin(q: MockExamQuestionAdmin): MockExamQuestionInput {
  const options = (q.options ?? []).map((o) => ({
    text: o.text,
    imageUrl: o.imageUrl ?? '',
  }));
  while (options.length < 4) options.push({ text: '', imageUrl: '' });
  return {
    sectionId: q.sectionId,
    type: q.type,
    question: q.question,
    correctAnswer: q.correctAnswer,
    options,
    imageUrl: q.imageUrl ?? '',
    audioText: q.audioText ?? '',
    audioUrl: q.audioUrl ?? '',
  };
}

async function uploadFile(
  file: File,
  token: string,
  folder: string,
  fallbackType: string,
): Promise<string> {
  const { url, publicUrl } = await getPresignedUploadUrl(
    token,
    file.type || fallbackType,
    folder,
  );
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || fallbackType },
    body: file,
  });
  if (!res.ok) {
    throw new Error('Upload thất bại');
  }
  return publicUrl;
}

export default function MockExamQuestionEditor({
  templateId,
  title,
  token,
  onClose,
}: {
  templateId: number;
  title: string;
  token: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<MockExamQuestionInput>(emptyQuestion());
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const questionsQuery = useQuery({
    queryKey: [...queryKeys.exam.templatesAdmin, 'questions', templateId],
    queryFn: () => fetchMockExamQuestions(templateId, token),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.exam.templatesAdmin, 'questions', templateId],
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.exam.templates });
    queryClient.invalidateQueries({ queryKey: queryKeys.exam.templatesAdmin });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const options = (form.options ?? [])
        .map((o) => ({
          text: o.text.trim(),
          imageUrl: o.imageUrl?.trim() || null,
        }))
        .filter((o) => o.text);
      const payload: MockExamQuestionInput = {
        sectionId: form.sectionId,
        type: form.type,
        question: form.question.trim(),
        correctAnswer: form.correctAnswer.trim(),
        options: form.type === 'fill_in_blank' ? undefined : options,
        imageUrl: form.imageUrl?.trim() || null,
        audioText: form.audioText?.trim() || null,
        audioUrl: form.audioUrl?.trim() || null,
      };
      if (editId != null) {
        return updateMockExamQuestion(templateId, editId, payload, token);
      }
      return createMockExamQuestion(templateId, payload, token);
    },
    onSuccess: () => {
      setEditId(null);
      setForm(emptyQuestion(form.sectionId));
      setError('');
      invalidate();
    },
    onError: (err: Error) => setError(err.message || 'Lưu câu hỏi thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMockExamQuestion(templateId, id, token),
    onSuccess: invalidate,
  });

  const setField = <K extends keyof MockExamQuestionInput>(
    key: K,
    value: MockExamQuestionInput[K],
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'sectionId' && value === 'listening') {
        next.type = 'listening';
      }
      if (key === 'type' && value === 'listening' && prev.sectionId !== 'listening') {
        next.sectionId = 'listening';
      }
      return next;
    });
  };

  const setOptionText = (index: number, text: string) => {
    setForm((prev) => {
      const options = [...(prev.options ?? emptyOptions())];
      options[index] = { ...options[index], text };
      return { ...prev, options };
    });
  };

  const setOptionImage = (index: number, imageUrl: string) => {
    setForm((prev) => {
      const options = [...(prev.options ?? emptyOptions())];
      options[index] = { ...options[index], imageUrl };
      return { ...prev, options };
    });
  };

  const handleUpload = async (
    file: File | null,
    apply: (url: string) => void,
  ) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const isAudio = file.type.startsWith('audio/');
      const url = await uploadFile(
        file,
        token,
        isAudio ? 'mock-exam-audio' : 'mock-exam-images',
        isAudio ? 'audio/mpeg' : 'image/jpeg',
      );
      apply(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  const questions = questionsQuery.data ?? [];
  const needsOptions =
    form.type === 'multiple_choice' || form.type === 'listening';

  return (
    <div className="mock-exam-q-editor glass-panel">
      <div className="mock-exam-q-editor-head">
        <div>
          <h3>Câu hỏi · {title}</h3>
          <p className="mock-exam-q-editor-sub">
            Thêm câu hỏi/đáp án kèm ảnh; phần nghe có thể upload audio.
          </p>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
          Đóng
        </button>
      </div>

      {questionsQuery.isLoading ? (
        <p>Đang tải câu hỏi...</p>
      ) : (
        <ul className="mock-exam-q-list">
          {questions.length === 0 && (
            <li className="mock-exam-q-empty">Chưa có câu hỏi.</li>
          )}
          {questions.map((q, index) => (
            <li key={q.id} className="mock-exam-q-item">
              <div>
                <strong>
                  #{index + 1} · {q.sectionId} · {q.type}
                </strong>
                <p>{q.question}</p>
                {q.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={q.imageUrl} alt="" className="mock-exam-q-thumb" />
                )}
                <small>
                  Đáp án: {q.correctAnswer}
                  {q.imageUrl ? ' · có ảnh câu hỏi' : ''}
                  {q.options?.some((o) => o.imageUrl) ? ' · có ảnh đáp án' : ''}
                  {q.audioUrl ? ' · có file audio' : ''}
                </small>
              </div>
              <div className="mock-exam-q-item-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setEditId(q.id);
                    setForm(fromAdmin(q));
                    setError('');
                  }}
                >
                  Sửa
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm mock-exam-delete-btn"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (window.confirm('Xóa câu hỏi này?')) {
                      deleteMutation.mutate(q.id);
                    }
                  }}
                >
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form
        className="mock-exam-q-form"
        onSubmit={(e) => {
          e.preventDefault();
          setError('');
          saveMutation.mutate();
        }}
      >
        <h4>{editId != null ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</h4>
        {error && <p className="mock-exam-admin-error">{error}</p>}

        <div className="mock-exam-admin-grid">
          <label>
            Phần
            <select
              value={form.sectionId}
              onChange={(e) =>
                setField(
                  'sectionId',
                  e.target.value as MockExamQuestionInput['sectionId'],
                )
              }
            >
              {SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Loại
            <select
              value={form.type}
              onChange={(e) =>
                setField('type', e.target.value as MockExamQuestionInput['type'])
              }
            >
              {TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="mock-exam-admin-span2">
            Đề bài / câu hỏi
            <textarea
              rows={2}
              required
              value={form.question}
              onChange={(e) => setField('question', e.target.value)}
            />
          </label>
          <label className="mock-exam-admin-span2">
            Ảnh câu hỏi (tuỳ chọn)
            <input
              type="file"
              accept="image/*"
              disabled={uploading || saveMutation.isPending}
              onChange={(e) =>
                void handleUpload(e.target.files?.[0] ?? null, (url) =>
                  setField('imageUrl', url),
                )
              }
            />
          </label>
          {form.imageUrl ? (
            <div className="mock-exam-admin-span2 mock-exam-q-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.imageUrl} alt="Ảnh câu hỏi" />
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setField('imageUrl', '')}
              >
                Xóa ảnh câu hỏi
              </button>
            </div>
          ) : null}
          <label className="mock-exam-admin-span2">
            Đáp án đúng
            <input
              type="text"
              required
              value={form.correctAnswer}
              onChange={(e) => setField('correctAnswer', e.target.value)}
              placeholder={
                needsOptions
                  ? 'Phải trùng text một lựa chọn bên dưới'
                  : 'Nhập đáp án điền từ'
              }
            />
          </label>

          {needsOptions &&
            (form.options ?? emptyOptions()).slice(0, 4).map((opt, i) => (
              <div key={i} className="mock-exam-admin-span2 mock-exam-q-option-block">
                <label>
                  Lựa chọn {i + 1} (text)
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => setOptionText(i, e.target.value)}
                    required={i < 2}
                  />
                </label>
                <label>
                  Ảnh đáp án {i + 1} (tuỳ chọn)
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading || saveMutation.isPending}
                    onChange={(e) =>
                      void handleUpload(e.target.files?.[0] ?? null, (url) =>
                        setOptionImage(i, url),
                      )
                    }
                  />
                </label>
                {opt.imageUrl ? (
                  <div className="mock-exam-q-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={opt.imageUrl} alt={`Đáp án ${i + 1}`} />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setOptionImage(i, '')}
                    >
                      Xóa ảnh
                    </button>
                  </div>
                ) : null}
              </div>
            ))}

          {form.type === 'listening' && (
            <>
              <label className="mock-exam-admin-span2">
                File âm thanh
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg"
                  disabled={uploading || saveMutation.isPending}
                  onChange={(e) =>
                    void handleUpload(e.target.files?.[0] ?? null, (url) =>
                      setField('audioUrl', url),
                    )
                  }
                />
              </label>
              <label className="mock-exam-admin-span2">
                URL audio
                <input
                  type="url"
                  value={form.audioUrl ?? ''}
                  onChange={(e) => setField('audioUrl', e.target.value)}
                  placeholder="https://..."
                />
              </label>
              <label className="mock-exam-admin-span2">
                Hoặc TTS text (nếu không có file)
                <input
                  type="text"
                  className="japanese-text"
                  value={form.audioText ?? ''}
                  onChange={(e) => setField('audioText', e.target.value)}
                  placeholder="こんにちは"
                />
              </label>
            </>
          )}
        </div>

        <div className="mock-exam-admin-actions">
          {editId != null && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setEditId(null);
                setForm(emptyQuestion());
                setError('');
              }}
            >
              Hủy sửa
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={saveMutation.isPending || uploading}
          >
            {uploading
              ? 'Đang upload...'
              : saveMutation.isPending
                ? 'Đang lưu...'
                : editId != null
                  ? 'Cập nhật câu hỏi'
                  : 'Thêm câu hỏi'}
          </button>
        </div>
      </form>
    </div>
  );
}
