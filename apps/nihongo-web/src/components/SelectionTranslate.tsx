'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import TranslationCard from './TranslationCard';

interface Selection {
  text: string;
  x: number;
  y: number;
}

// Tags where we should NOT trigger translation (user is typing)
const SKIP_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export default function SelectionTranslate() {
  const [sel, setSel] = useState<Selection | null>(null);

  const dismiss = useCallback(() => setSel(null), []);

  useEffect(() => {
    function onMouseUp(e: MouseEvent) {
      // Ignore clicks inside the card itself
      if ((e.target as Element)?.closest?.('.translation-card')) return;

      // Short delay to let selection settle
      setTimeout(() => {
        const active = document.activeElement;
        if (active && SKIP_TAGS.has(active.tagName)) return;

        const text = window.getSelection()?.toString().trim() ?? '';
        if (!text || text.length > 300) {
          setSel(null);
          return;
        }

        const range = window.getSelection()?.getRangeAt(0);
        const rect  = range?.getBoundingClientRect();
        if (!rect || rect.width === 0) return;

        setSel({
          text,
          x: rect.left + window.scrollX,
          y: rect.bottom + window.scrollY + 10,
        });
      }, 15);
    }

    function onMouseDown(e: MouseEvent) {
      if (!(e.target as Element)?.closest?.('.translation-card')) {
        setSel(null);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setSel(null);
    }

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  if (!sel || typeof document === 'undefined') return null;

  return createPortal(
    <TranslationCard
      text={sel.text}
      anchorX={sel.x}
      anchorY={sel.y}
      onClose={dismiss}
    />,
    document.body,
  );
}
