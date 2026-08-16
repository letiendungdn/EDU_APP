'use client';

import type { ReactNode } from 'react';
import { renderFuriganaParts } from '@/utils/furiganaDisplay';

export default function FuriganaText({
  text,
  show = true,
  className,
}: {
  text: string;
  show?: boolean;
  className?: string;
}) {
  if (!show) {
    return <span className={className}>{text.replace(/[（(][ぁ-んァ-ンー]+[）)]/g, '')}</span>;
  }
  const parts = renderFuriganaParts(text);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if ('text' in part) return <span key={i}>{part.text}</span>;
        return (
          <ruby key={i}>
            {part.kanji}
            <rt>{part.reading}</rt>
          </ruby>
        );
      })}
    </span>
  );
}

export function FuriganaToggle({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="furigana-toggle">
      <input type="checkbox" checked={on} onChange={onToggle} />
      <span>Hiện furigana</span>
    </label>
  );
}
