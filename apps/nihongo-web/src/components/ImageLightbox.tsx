'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ImageLightbox.css';

type ImageLightboxProps = {
  src: string;
  alt?: string;
  onClose: () => void;
};

export default function ImageLightbox({ src, alt = '', onClose }: ImageLightboxProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="image-lightbox-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="image-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label={alt || 'Xem ảnh lớn'}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="image-lightbox-close"
          onClick={onClose}
          aria-label="Đóng"
        >
          ×
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="image-lightbox-img" />
      </div>
    </div>,
    document.body,
  );
}
