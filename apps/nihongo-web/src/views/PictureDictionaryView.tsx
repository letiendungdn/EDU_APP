'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import LessonSelector from '../components/LessonSelector';
import { useVocabulariesQuery } from '../hooks/queries';
import { playAudio } from '../utils/speech';
import { resolveVocabImage } from '@edu/vocab-images';
import type { Vocabulary } from '../types/api';
import './PictureDictionaryView.css';

type PictureVocab = Vocabulary & { resolvedImage: string | null };

function PictureImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <div className="picture-card-placeholder">📷</div>;
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default function PictureDictionaryView() {
  const [lesson, setLesson] = useState(1);
  const [picturesOnly, setPicturesOnly] = useState(true);
  const [selected, setSelected] = useState<PictureVocab | null>(null);

  const { data: vocabList = [], isLoading } = useVocabulariesQuery(lesson);

  const items = useMemo(() => {
    const mapped: PictureVocab[] = vocabList.map((v) => ({
      ...v,
      resolvedImage: resolveVocabImage({
        word: v.romaji,
        meaning: v.meaning,
        kana: v.kana,
        kanji: v.kanji,
        imageUrl: v.imageUrl,
      }),
    }));
    return picturesOnly ? mapped.filter((v) => v.resolvedImage) : mapped;
  }, [vocabList, picturesOnly]);

  const handleSpeak = (v: PictureVocab, e?: React.MouseEvent) => {
    e?.stopPropagation();
    playAudio(v.kana);
  };

  return (
    <div className="container picture-dict-view">
      <div className="picture-dict-header">
        <div>
          <h2 className="view-title">Từ điển hình ảnh</h2>
          <p className="picture-dict-subtitle">
            Minna no Nihongo · {items.length} từ {picturesOnly ? 'có ảnh' : ''}
            {items.length === 0 && !isLoading && ' · thử bài 3–15 cho từ vật thể'}
          </p>
        </div>
        <div className="picture-dict-links">
          <Link href="/vocab" className="btn btn-outline">
            Flashcard
          </Link>
          <Link href="/kanji" className="btn btn-primary">
            Kanji
          </Link>
        </div>
      </div>

      <LessonSelector value={lesson} onChange={setLesson} />

      <label className="picture-dict-toggle">
        <input
          type="checkbox"
          checked={picturesOnly}
          onChange={(e) => setPicturesOnly(e.target.checked)}
        />
        Chỉ từ có ảnh
      </label>

      {isLoading ? (
        <p className="picture-dict-empty">Đang tải...</p>
      ) : items.length === 0 ? (
        <div className="empty-state glass-panel">
          <p>Bài {lesson} chưa có từ có hình ảnh. Thử bài khác hoặc tắt lọc.</p>
        </div>
      ) : (
        <div className="picture-dict-grid">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="picture-card glass-panel"
              onClick={() => setSelected(item)}
            >
              <div className="picture-card-image-wrap">
                {item.resolvedImage ? (
                  <PictureImg src={item.resolvedImage} alt={item.kana} />
                ) : (
                  <div className="picture-card-placeholder">📷</div>
                )}
              </div>
              <div className="picture-card-body">
                <span className="japanese-text">{item.kanji || item.kana}</span>
                <span className="picture-card-meaning">{item.meaning}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="picture-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="picture-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="picture-modal-close" onClick={() => setSelected(null)}>
              ✕
            </button>
            {selected.resolvedImage && (
              <PictureImg src={selected.resolvedImage} alt={selected.kana} className="picture-modal-image" />
            )}
            <button type="button" className="btn-audio picture-modal-audio" onClick={(e) => handleSpeak(selected, e)}>
              🔊
            </button>
            <span className="picture-modal-kanji japanese-text">{selected.kanji || selected.kana}</span>
            <span className="picture-modal-kana japanese-text">{selected.kana}</span>
            <span className="picture-modal-romaji">{selected.romaji}</span>
            <p className="picture-modal-meaning">{selected.meaning}</p>
          </div>
        </div>
      )}
    </div>
  );
}
