'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useQueryClient } from '@tanstack/react-query';
import {
  createVocabulary,
  deleteVocabulary,
  getPresignedUploadUrl,
  updateVocabulary,
} from '../api';
import { queryKeys } from '../api/query-keys';
import { useAuth } from '../hooks/useAuth';
import type { Vocabulary } from '../types/api';
import { readVocabImageFile } from '../utils/vocabImageUpload';
import ImageLightbox from './ImageLightbox';

type Draft = {
  kanji: string;
  kana: string;
  romaji: string;
  meaning: string;
  imageUrl: string | null;
};

const emptyDraft = (): Draft => ({
  kanji: '',
  kana: '',
  romaji: '',
  meaning: '',
  imageUrl: null,
});

function matchesVocabSearch(vocab: Vocabulary, query: string): boolean {
  const haystack = [vocab.kanji, vocab.kana, vocab.romaji, vocab.meaning]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

async function uploadVocabImage(token: string, file: File): Promise<string> {
  // Ưu tiên S3 nếu cấu hình; không được thì lưu data URL (giống banner)
  try {
    const { url, publicUrl } = await getPresignedUploadUrl(
      token,
      file.type || 'image/jpeg',
      'vocab',
    );
    const put = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type || 'image/jpeg' },
    });
    if (put.ok) return publicUrl;
  } catch {
    // fall through
  }
  return readVocabImageFile(file);
}

type Props = {
  lessonNumber: number;
  lessonId: number | null;
  vocabularies: Vocabulary[];
  currentIndex: number;
  expectedCount: number | null;
  onSelectWord: (index: number) => void;
};

export default function VocabWordList({
  lessonNumber,
  lessonId,
  vocabularies,
  currentIndex,
  expectedCount,
  onSelectWord,
}: Props) {
  const { isAdmin, token } = useAuth();
  const queryClient = useQueryClient();
  const listScrollRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [adding, setAdding] = useState(false);
  const [addDraft, setAddDraft] = useState<Draft>(emptyDraft());
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const canEdit = isAdmin && editMode;
  const isListIncomplete =
    expectedCount != null &&
    vocabularies.length > 0 &&
    vocabularies.length < expectedCount;

  useEffect(() => {
    setSearchQuery('');
    setEditingId(null);
    setAdding(false);
    setError(null);
  }, [lessonNumber]);

  const filteredVocab = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return vocabularies
      .map((vocab, index) => ({ vocab, index }))
      .filter(({ vocab }) => !q || matchesVocabSearch(vocab, q));
  }, [vocabularies, searchQuery]);

  const useVirtual = !canEdit;
  const rowVirtualizer = useVirtualizer({
    count: useVirtual ? filteredVocab.length : 0,
    getScrollElement: () => listScrollRef.current,
    estimateSize: () => 72,
    overscan: 5,
  });

  useEffect(() => {
    if (!useVirtual) return;
    const filteredIndex = filteredVocab.findIndex(
      ({ index }) => index === currentIndex,
    );
    if (filteredIndex >= 0) {
      rowVirtualizer.scrollToIndex(filteredIndex, { align: 'auto' });
    }
  }, [currentIndex, lessonNumber, searchQuery, filteredVocab, rowVirtualizer, useVirtual]);

  function toggleEditMode() {
    setEditMode((on) => {
      if (on) {
        setAdding(false);
        setEditingId(null);
        setError(null);
      }
      return !on;
    });
  }

  async function invalidate() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.vocab.byLesson(lessonNumber),
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all }),
    ]);
  }

  function startEdit(item: Vocabulary) {
    setAdding(false);
    setEditingId(item.id);
    setDraft({
      kanji: item.kanji ?? '',
      kana: item.kana,
      romaji: item.romaji,
      meaning: item.meaning,
      imageUrl: item.imageUrl ?? null,
    });
    setError(null);
  }

  async function onPickImage(
    file: File | null,
    onChange: (next: Draft) => void,
    value: Draft,
  ) {
    if (!file || !token) return;
    setUploading(true);
    setError(null);
    try {
      const imageUrl = await uploadVocabImage(token, file);
      onChange({ ...value, imageUrl });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải ảnh được');
    } finally {
      setUploading(false);
    }
  }

  async function saveEdit() {
    if (!token || editingId == null) return;
    const kana = draft.kana.trim();
    const romaji = draft.romaji.trim();
    const meaning = draft.meaning.trim();
    const kanji = draft.kanji.trim();
    if (!kana || !romaji || !meaning) {
      setError('Điền đủ kana, romaji và nghĩa');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await updateVocabulary(
        editingId,
        {
          kanji: kanji || null,
          kana,
          romaji,
          meaning,
          imageUrl: draft.imageUrl,
        },
        token,
      );
      setEditingId(null);
      await invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không lưu được');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number, index: number) {
    if (!token) return;
    if (!window.confirm('Xóa từ vựng này?')) return;
    setBusy(true);
    setError(null);
    try {
      await deleteVocabulary(id, token);
      if (index === currentIndex && index > 0) {
        onSelectWord(index - 1);
      } else if (index < currentIndex) {
        onSelectWord(Math.max(0, currentIndex - 1));
      }
      await invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không xóa được');
    } finally {
      setBusy(false);
    }
  }

  async function handleAdd() {
    if (!token || lessonId == null) {
      setError('Không xác định được bài học');
      return;
    }
    const kana = addDraft.kana.trim();
    const romaji = addDraft.romaji.trim();
    const meaning = addDraft.meaning.trim();
    const kanji = addDraft.kanji.trim();
    if (!kana || !romaji || !meaning) {
      setError('Điền đủ kana, romaji và nghĩa');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createVocabulary(
        {
          lessonId,
          kana,
          romaji,
          meaning,
          ...(kanji ? { kanji } : {}),
          ...(addDraft.imageUrl ? { imageUrl: addDraft.imageUrl } : {}),
        },
        token,
      );
      setAddDraft(emptyDraft());
      setAdding(false);
      await invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thêm được');
    } finally {
      setBusy(false);
    }
  }

  function renderImageField(
    value: Draft,
    onChange: (next: Draft) => void,
  ) {
    return (
      <div className="vocab-admin-image">
        <div className="vocab-admin-image-preview">
          {value.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value.imageUrl}
              alt="Ảnh minh họa"
              className="vocab-picture-zoomable"
              role="button"
              tabIndex={0}
              title="Nhấn để phóng to"
              onClick={() => setLightboxSrc(value.imageUrl)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setLightboxSrc(value.imageUrl);
                }
              }}
            />
          ) : (
            <span>Chưa có ảnh</span>
          )}
        </div>
        <div className="vocab-admin-image-actions">
          <label className="vocab-admin-image-upload">
            {uploading ? 'Đang tải…' : '📷 Upload ảnh'}
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={busy || uploading}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                e.target.value = '';
                void onPickImage(file, onChange, value);
              }}
            />
          </label>
          {value.imageUrl && (
            <button
              type="button"
              className="vocab-admin-image-clear"
              disabled={busy || uploading}
              onClick={() => onChange({ ...value, imageUrl: null })}
            >
              Xóa ảnh
            </button>
          )}
        </div>
      </div>
    );
  }

  function renderAdminForm(
    value: Draft,
    onChange: (next: Draft) => void,
    actions: ReactNode,
  ) {
    return (
      <div className="vocab-admin-form">
        <input
          className="japanese-text"
          placeholder="Kanji (tuỳ chọn)"
          value={value.kanji}
          disabled={busy}
          onChange={(e) => onChange({ ...value, kanji: e.target.value })}
        />
        <input
          className="japanese-text"
          placeholder="Kana *"
          value={value.kana}
          disabled={busy}
          onChange={(e) => onChange({ ...value, kana: e.target.value })}
        />
        <input
          placeholder="Romaji *"
          value={value.romaji}
          disabled={busy}
          onChange={(e) => onChange({ ...value, romaji: e.target.value })}
        />
        <input
          placeholder="Nghĩa *"
          value={value.meaning}
          disabled={busy}
          onChange={(e) => onChange({ ...value, meaning: e.target.value })}
        />
        {renderImageField(value, onChange)}
        <div className="vocab-admin-actions">{actions}</div>
      </div>
    );
  }

  function renderRow(vocab: Vocabulary, index: number) {
    const isEditing = canEdit && editingId === vocab.id;

    if (isEditing) {
      return (
        <div key={vocab.id} className="vocab-word-list-edit-row">
          {renderAdminForm(draft, setDraft, (
            <>
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy || uploading}
                onClick={() => void saveEdit()}
              >
                Lưu
              </button>
              <button
                type="button"
                className="btn btn-nav"
                disabled={busy || uploading}
                onClick={() => setEditingId(null)}
              >
                Hủy
              </button>
            </>
          ))}
        </div>
      );
    }

    return (
      <div key={vocab.id} className="vocab-word-list-row-wrap">
        <button
          type="button"
          className={`vocab-word-list-item ${
            index === currentIndex ? 'active' : ''
          }`}
          onClick={() => onSelectWord(index)}
          aria-current={index === currentIndex ? 'true' : undefined}
        >
          <span className="vocab-word-list-num">{index + 1}</span>
          <span className="vocab-word-list-jp japanese-text">
            {vocab.kanji || vocab.kana}
          </span>
          <span className="vocab-word-list-meaning">{vocab.meaning}</span>
          {canEdit && vocab.imageUrl ? (
            <span className="vocab-word-list-has-image" title="Có ảnh minh họa">
              🖼
            </span>
          ) : null}
        </button>
        {canEdit && (
          <div className="vocab-admin-row-actions">
            <button
              type="button"
              title="Sửa"
              disabled={busy}
              onClick={() => startEdit(vocab)}
            >
              ✎
            </button>
            <button
              type="button"
              title="Xóa"
              className="vocab-admin-delete"
              disabled={busy}
              onClick={() => void handleDelete(vocab.id, index)}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <aside className="vocab-word-list glass-panel">
      <div className="vocab-word-list-head">
        <h3 className="vocab-word-list-title">
          Danh sách từ
          {searchQuery.trim()
            ? ` (${filteredVocab.length}/${vocabularies.length})`
            : ` (${vocabularies.length})`}
        </h3>
        {isAdmin && (
          <div className="vocab-admin-toolbar">
            <button
              type="button"
              className={`vocab-admin-toggle${editMode ? ' vocab-admin-toggle--on' : ''}`}
              disabled={busy}
              onClick={toggleEditMode}
              title={editMode ? 'Tắt chỉnh sửa' : 'Bật chỉnh sửa'}
            >
              {editMode ? 'Xong' : 'Sửa'}
            </button>
            {canEdit && (
              <button
                type="button"
                className="vocab-admin-add"
                disabled={busy || lessonId == null}
                onClick={() => {
                  setEditingId(null);
                  setAdding((v) => !v);
                  setAddDraft(emptyDraft());
                  setError(null);
                }}
              >
                {adding ? 'Hủy' : '+ Thêm'}
              </button>
            )}
          </div>
        )}
      </div>

      <input
        type="search"
        className="vocab-word-list-search"
        placeholder="Tìm kiếm từ..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Tìm từ vựng"
      />

      {error && <p className="vocab-admin-error">{error}</p>}

      {isListIncomplete && (
        <p className="vocab-word-list-warning" role="status">
          Đang hiển thị {vocabularies.length}/{expectedCount} từ — hãy refresh trang.
        </p>
      )}

      {canEdit && adding &&
        renderAdminForm(addDraft, setAddDraft, (
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy || uploading}
            onClick={() => void handleAdd()}
          >
            Lưu từ mới
          </button>
        ))}

      <div ref={listScrollRef} className="vocab-word-list-items">
        {filteredVocab.length === 0 ? (
          <p className="vocab-word-list-empty">
            {canEdit
              ? 'Chưa có từ — bấm + Thêm.'
              : 'Không tìm thấy từ phù hợp.'}
          </p>
        ) : useVirtual ? (
          <div
            className="vocab-word-list-virtual"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const { vocab, index } = filteredVocab[virtualRow.index];
              return (
                <div
                  key={vocab.id}
                  className="vocab-word-list-row"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {renderRow(vocab, index)}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="vocab-word-list-plain">
            {filteredVocab.map(({ vocab, index }) => renderRow(vocab, index))}
          </div>
        )}
      </div>

      {canEdit && (
        <p className="vocab-admin-hint">✎ sửa · 📷 upload ảnh · ✕ xóa · + Thêm từ mới</p>
      )}

      {lightboxSrc ? (
        <ImageLightbox
          src={lightboxSrc}
          alt="Ảnh minh họa"
          onClose={() => setLightboxSrc(null)}
        />
      ) : null}
    </aside>
  );
}
