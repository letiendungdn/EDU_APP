'use client';

import type { Vocabulary } from '../types/api';
import './VocabCard.css';

interface VocabCardProps {
  vocab: Pick<Vocabulary, 'kanji' | 'kana' | 'romaji' | 'meaning'>;
  flipped?: boolean;
  onFlip?: () => void;
  onPlay?: () => void;
}

export default function VocabCard({
  vocab,
  flipped = false,
  onFlip,
  onPlay,
}: VocabCardProps) {
  return (
    <div
      className={`vocab-card ${flipped ? 'vocab-card--flipped' : ''}`}
      onClick={onFlip}
      role={onFlip ? 'button' : undefined}
      tabIndex={onFlip ? 0 : undefined}
      onKeyDown={
        onFlip
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onFlip();
              }
            }
          : undefined
      }
    >
      {onPlay && (
        <button
          type="button"
          className="btn-audio vocab-card-audio"
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          title="Nghe phát âm"
        >
          🔊
        </button>
      )}
      {!flipped ? (
        <>
          <span className="vocab-card-kanji japanese-text">{vocab.kanji || vocab.kana}</span>
          <span className="vocab-card-hint">Chạm để lật</span>
        </>
      ) : (
        <>
          <span className="vocab-card-kana japanese-text">{vocab.kana}</span>
          <span className="vocab-card-romaji">{vocab.romaji}</span>
          <span className="vocab-card-meaning">{vocab.meaning}</span>
        </>
      )}
    </div>
  );
}
