'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { toLocalImageUrl } from '@edu/vocab-images';
import {
  createKanjiEntry,
  createVocabulary,
  fetchKanaRomajiLookup,
  fetchKanjiEntryById,
  fetchVocabularyById,
  updateKanjiEntry,
  updateVocabulary,
} from '../api';
import { uploadContentImage } from '../utils/vocabImageUpload';

export type EditableKind = 'VOCAB' | 'KANJI';

/** Bài có thể chọn khi thêm mục mới (lấy từ các mục đang có trong nhánh). */
export type LessonOption = { lessonId: number; lessonNumber: number };

type Props = {
  kind: EditableKind;
  token: string;
  /** Sửa: id bản ghi; thêm mới: undefined */
  id?: number;
  lessons: LessonOption[];
  onClose: () => void;
  onSaved: () => void;
};

type Form = {
  // từ vựng
  kanji: string;
  kana: string;
  romaji: string;
  meaning: string;
  // kanji
  character: string;
  hanViet: string;
  onyomi: string;
  kunyomi: string;
  meaningVi: string;
  // chung
  lessonKey: string;
  imageUrl: string | null;
};

const EMPTY: Form = {
  kanji: '',
  kana: '',
  romaji: '',
  meaning: '',
  character: '',
  hanViet: '',
  onyomi: '',
  kunyomi: '',
  meaningVi: '',
  lessonKey: '',
  imageUrl: null,
};

/** Kanji tạo theo KanjiLesson.lessonNumber, từ vựng theo Lesson.id — lưu cả hai trong một key. */
const lessonKey = (l: LessonOption) => `${l.lessonId}:${l.lessonNumber}`;

export default function MindMapItemEditor({ kind, token, id, lessons, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Form>({ ...EMPTY, lessonKey: lessons[0] ? lessonKey(lessons[0]) : '' });
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = id != null;

  // Sửa: tải bản ghi đầy đủ (danh sách sơ đồ không kèm ảnh base64)
  useEffect(() => {
    if (id == null) return;
    let cancelled = false;
    setLoading(true);
    const load =
      kind === 'VOCAB'
        ? fetchVocabularyById(id).then((v) => ({
            ...EMPTY,
            kanji: v.kanji ?? '',
            kana: v.kana,
            romaji: v.romaji ?? '',
            meaning: v.meaning,
            imageUrl: v.imageUrl ?? null,
          }))
        : fetchKanjiEntryById(id).then((k) => ({
            ...EMPTY,
            character: k.character,
            hanViet: k.hanViet ?? '',
            onyomi: k.onyomi ?? '',
            kunyomi: k.kunyomi ?? '',
            meaningVi: k.meaningVi,
            imageUrl: k.imageUrl ?? null,
          }));
    load
      .then((f) => !cancelled && setForm(f))
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : 'Không tải được dữ liệu'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, kind]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (key: keyof Form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onPickImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadContentImage(token, file, kind === 'VOCAB' ? 'vocab' : 'kanji');
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được ảnh');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const [lessonIdStr, lessonNumberStr] = form.lessonKey.split(':');
      if (kind === 'VOCAB') {
        if (!form.kana.trim() || !form.meaning.trim()) throw new Error('Cần nhập kana và nghĩa.');
        let romaji = form.romaji.trim();
        if (!romaji) {
          // API bắt buộc romaji — tự sinh từ kana nếu admin để trống
          romaji = await fetchKanaRomajiLookup(form.kana.trim())
            .then((r) => r.romaji)
            .catch(() => '');
        }
        const body = {
          kanji: form.kanji.trim() || null,
          kana: form.kana.trim(),
          romaji,
          meaning: form.meaning.trim(),
          imageUrl: form.imageUrl,
        };
        if (isEdit) await updateVocabulary(id!, body, token);
        else {
          if (!lessonIdStr) throw new Error('Chọn bài để thêm từ.');
          await createVocabulary({ ...body, lessonId: Number(lessonIdStr) }, token);
        }
      } else {
        if (!form.character.trim() || !form.meaningVi.trim()) throw new Error('Cần nhập chữ kanji và nghĩa.');
        const body = {
          character: form.character.trim(),
          hanViet: form.hanViet.trim(),
          onyomi: form.onyomi.trim(),
          kunyomi: form.kunyomi.trim(),
          meaningVi: form.meaningVi.trim(),
          imageUrl: form.imageUrl,
        };
        if (isEdit) await updateKanjiEntry(id!, body, token);
        else {
          if (!lessonNumberStr) throw new Error('Chọn bài để thêm chữ.');
          await createKanjiEntry({ ...body, lessonNumber: Number(lessonNumberStr) }, token);
        }
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const title = `${isEdit ? 'Sửa' : 'Thêm'} ${kind === 'VOCAB' ? 'từ vựng' : 'kanji'}`;
  const preview = form.imageUrl ? (toLocalImageUrl(form.imageUrl) ?? form.imageUrl) : null;

  return (
    <div className="gmm-editor__backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="gmm-editor glass-panel" role="dialog" aria-modal="true" aria-label={title} onSubmit={submit}>
        <h3>{title}</h3>
        {loading ? (
          <p className="gmm-editor__muted">Đang tải…</p>
        ) : (
          <>
            {!isEdit ? (
              <label>
                Bài
                <select value={form.lessonKey} onChange={set('lessonKey')}>
                  {lessons.map((l) => (
                    <option key={lessonKey(l)} value={lessonKey(l)}>
                      Bài {l.lessonNumber}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {kind === 'VOCAB' ? (
              <>
                <label>
                  Kanji
                  <input className="japanese-text" value={form.kanji} onChange={set('kanji')} placeholder="私" />
                </label>
                <label>
                  Kana *
                  <input className="japanese-text" value={form.kana} onChange={set('kana')} placeholder="わたし" required />
                </label>
                <label>
                  Romaji <span className="gmm-editor__muted">(để trống sẽ tự sinh)</span>
                  <input value={form.romaji} onChange={set('romaji')} placeholder="watashi" />
                </label>
                <label>
                  Nghĩa *
                  <input value={form.meaning} onChange={set('meaning')} placeholder="tôi" required />
                </label>
              </>
            ) : (
              <>
                <div className="gmm-editor__row">
                  <label>
                    Chữ *
                    <input className="japanese-text" value={form.character} onChange={set('character')} placeholder="一" required />
                  </label>
                  <label>
                    Hán Việt
                    <input value={form.hanViet} onChange={set('hanViet')} placeholder="NHẤT" />
                  </label>
                </div>
                <label>
                  Âm on
                  <input className="japanese-text" value={form.onyomi} onChange={set('onyomi')} placeholder="いち, いつ" />
                </label>
                <label>
                  Âm kun
                  <input className="japanese-text" value={form.kunyomi} onChange={set('kunyomi')} placeholder="ひと-つ" />
                </label>
                <label>
                  Nghĩa *
                  <input value={form.meaningVi} onChange={set('meaningVi')} placeholder="một" required />
                </label>
              </>
            )}

            <div className="gmm-editor__image">
              {preview ? <img src={preview} alt="" /> : <span className="gmm-editor__muted">Chưa có ảnh</span>}
              <div className="gmm-editor__image-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? 'Đang tải ảnh…' : preview ? 'Đổi ảnh' : 'Thêm ảnh'}
                </button>
                {preview ? (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setForm((f) => ({ ...f, imageUrl: null }))}>
                    Xóa ảnh
                  </button>
                ) : null}
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => void onPickImage(e.target.files?.[0])} />
            </div>
          </>
        )}

        {error ? <p className="gmm-editor__error">{error}</p> : null}

        <div className="gmm-editor__actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving || loading || uploading}>
            {saving ? 'Đang lưu…' : 'Lưu'}
          </button>
        </div>
      </form>
    </div>
  );
}
