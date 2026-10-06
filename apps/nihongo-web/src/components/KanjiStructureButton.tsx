'use client';

import { kanjiCharsOf, useKanjiStructure } from '@/contexts/KanjiStructureContext';

interface KanjiStructureButtonProps {
  /** Từ / chữ chứa kanji cần phân tích */
  text: string | null | undefined;
  /** Chọn sẵn chữ này khi từ có nhiều kanji */
  char?: string;
  /** Hiện thêm chữ "Cấu tạo" cạnh biểu tượng */
  withLabel?: boolean;
  className?: string;
}

/** Nút 構 mở cửa sổ phân tích cấu tạo; không hiện gì nếu `text` không có kanji. */
export default function KanjiStructureButton({ text, char, withLabel, className }: KanjiStructureButtonProps) {
  const { openKanjiStructure } = useKanjiStructure();
  if (!text || kanjiCharsOf(text).length === 0) return null;

  return (
    <button
      type="button"
      className={`ks-open-btn${className ? ` ${className}` : ''}`}
      title="Phân tích cấu tạo kanji"
      aria-label={`Phân tích cấu tạo kanji của ${text}`}
      onClick={(e) => {
        // Nút thường nằm trong thẻ lật / ô bấm được — không để sự kiện lan ra ngoài
        e.stopPropagation();
        e.preventDefault();
        openKanjiStructure(text, char);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
      }}
    >
      構{withLabel && <span className="ks-open-btn-label">Cấu tạo</span>}
    </button>
  );
}
