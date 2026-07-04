'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import TranslationCard from './TranslationCard';

interface Selection {
  text: string;
  x: number;
  y: number;
}

const SKIP_SELECTOR =
  'input, textarea, select, button, a[href], [contenteditable="true"], .translation-card';

const MAX_TEXT_LEN = 300;

function shouldSkipTarget(target: EventTarget | null): boolean {
  const el = target as Element | null;
  if (!el) return true;
  return Boolean(el.closest(SKIP_SELECTOR));
}

function isTypingField(): boolean {
  const active = document.activeElement;
  return Boolean(
    active &&
      (active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.tagName === 'SELECT' ||
        (active as HTMLElement).isContentEditable),
  );
}

/** Lấy từ/cụm tại vị trí double-click khi browser chưa select. */
function getTextAtPoint(clientX: number, clientY: number): string {
  const doc = document as Document & {
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
  };

  let node: Node | null = null;
  let offset = 0;

  if (doc.caretRangeFromPoint) {
    const range = doc.caretRangeFromPoint(clientX, clientY);
    if (!range) return '';
    node = range.startContainer;
    offset = range.startOffset;
  } else if (doc.caretPositionFromPoint) {
    const pos = doc.caretPositionFromPoint(clientX, clientY);
    if (!pos) return '';
    node = pos.offsetNode;
    offset = pos.offset;
  } else {
    return '';
  }

  if (node.nodeType !== Node.TEXT_NODE) return '';
  const text = node.textContent ?? '';
  if (!text) return '';

  const isWordChar = (ch: string) =>
    /[\p{L}\p{N}]/u.test(ch) || /[぀-ヿ一-龯]/.test(ch);

  let start = offset;
  let end = offset;
  while (start > 0 && isWordChar(text[start - 1]!)) start -= 1;
  while (end < text.length && isWordChar(text[end]!)) end += 1;

  return text.slice(start, end).trim();
}

function resolveLookup(
  clientX: number,
  clientY: number,
): { text: string; x: number; y: number } | null {
  let text = window.getSelection()?.toString().trim() ?? '';
  if (!text) {
    text = getTextAtPoint(clientX, clientY);
  }
  if (!text || text.length > MAX_TEXT_LEN) return null;

  const range = window.getSelection()?.rangeCount
    ? window.getSelection()!.getRangeAt(0)
    : null;
  const rect = range?.getBoundingClientRect();

  if (rect && rect.width > 0) {
    return {
      text,
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY + 10,
    };
  }

  return {
    text,
    x: clientX + window.scrollX,
    y: clientY + window.scrollY + 10,
  };
}

export default function SelectionTranslate() {
  const [sel, setSel] = useState<Selection | null>(null);
  const skipMouseUpUntil = useRef(0);

  const dismiss = useCallback(() => setSel(null), []);

  const openLookup = useCallback((clientX: number, clientY: number) => {
    const resolved = resolveLookup(clientX, clientY);
    if (resolved) setSel(resolved);
  }, []);

  useEffect(() => {
    function onMouseUp(e: MouseEvent) {
      if (Date.now() < skipMouseUpUntil.current) return;
      if (shouldSkipTarget(e.target)) return;
      if (isTypingField()) return;

      setTimeout(() => {
        if (isTypingField()) return;
        const resolved = resolveLookup(e.clientX, e.clientY);
        if (!resolved) {
          setSel(null);
          return;
        }
        setSel(resolved);
      }, 15);
    }

    function onDoubleClick(e: MouseEvent) {
      if (shouldSkipTarget(e.target)) return;
      if (isTypingField()) return;

      skipMouseUpUntil.current = Date.now() + 400;
      e.preventDefault();

      setTimeout(() => {
        openLookup(e.clientX, e.clientY);
      }, 0);
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
    document.addEventListener('dblclick', onDoubleClick);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('dblclick', onDoubleClick);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openLookup]);

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
