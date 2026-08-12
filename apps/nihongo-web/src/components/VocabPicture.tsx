'use client';

import { useEffect, useState } from 'react';
import { resolveVocabImage } from '@edu/vocab-images';
import ImageLightbox from './ImageLightbox';

type VocabPictureProps = {
  word?: string | null;
  meaning?: string | null;
  kana?: string | null;
  kanji?: string | null;
  imageUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  alt?: string;
  /** Click to enlarge in a centered lightbox. Default true. */
  zoomable?: boolean;
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
  zoomable = true,
}: VocabPictureProps) {
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const src = resolveVocabImage({ word, meaning, kana, kanji, imageUrl });

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) return null;

  const imgClass = `vocab-picture vocab-picture-${size}${className ? ` ${className}` : ''}${
    zoomable ? ' vocab-picture-zoomable' : ''
  }`;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={imgClass}
        loading="lazy"
        role={zoomable ? 'button' : undefined}
        tabIndex={zoomable ? 0 : undefined}
        title={zoomable ? 'Nhấn để phóng to' : undefined}
        onError={() => setFailed(true)}
        onClick={
          zoomable
            ? (e) => {
                e.stopPropagation();
                setOpen(true);
              }
            : undefined
        }
        onKeyDown={
          zoomable
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(true);
                }
              }
            : undefined
        }
      />
      {open && zoomable ? (
        <ImageLightbox src={src} alt={alt} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
