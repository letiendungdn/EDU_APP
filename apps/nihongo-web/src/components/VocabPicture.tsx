'use client';

import { useState } from 'react';
import { resolveVocabImage } from '@edu/vocab-images';

type VocabPictureProps = {
  word?: string | null;
  meaning?: string | null;
  kana?: string | null;
  kanji?: string | null;
  imageUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  alt?: string;
};

export default function VocabPicture({
  word,
  meaning,
  kana,
  kanji,
  imageUrl,
  size = 'md',
  className = '',
  alt = '',
}: VocabPictureProps) {
  const [failed, setFailed] = useState(false);
  const src = resolveVocabImage({ word, meaning, kana, kanji, imageUrl });

  if (!src || failed) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={`vocab-picture vocab-picture-${size}${className ? ` ${className}` : ''}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
