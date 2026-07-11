export interface ReadingVariant {
  text: string;
  label?: string;
}

function splitRomajiVariants(romaji: string): string[] {
  const trimmed = romaji.trim();
  const parenMatch = trimmed.match(/^(.+?)\s*\((.+?)\)\s*$/);
  if (!parenMatch) return [trimmed];

  const inner = parenMatch[2].trim();
  const alternates =
    inner.includes('、') || inner.includes(',')
      ? inner.split(/[,、]/).map((part) => part.trim())
      : [inner];

  return [parenMatch[1].trim(), ...alternates];
}

export function parseReadingVariants(text: string, romaji?: string): ReadingVariant[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const romajiLabels = romaji ? splitRomajiVariants(romaji) : [];
  const parenMatch =
    trimmed.match(/^(.+?)（(.+?)）$/) ?? trimmed.match(/^(.+?)\((.+?)\)$/);

  if (parenMatch) {
    const primary = parenMatch[1].trim();
    const inner = parenMatch[2].trim();
    const alternates =
      inner.includes('、') || inner.includes(',')
        ? inner.split(/[,、]/).map((part) => part.trim())
        : [inner];

    return [primary, ...alternates].map((variantText, index) => ({
      text: variantText,
      label: romajiLabels[index],
    }));
  }

  return [{ text: trimmed, label: romajiLabels[0] }];
}

export function getStrokeText(text: string): string {
  if (!text) return '';
  return [...text]
    .filter((char) => {
      const code = char.charCodeAt(0);
      return (
        (code >= 0x3040 && code <= 0x309f) ||
        (code >= 0x30a0 && code <= 0x30ff) ||
        (code >= 0x4e00 && code <= 0x9fff)
      );
    })
    .join('');
}

export function shouldShowKanaStroke(
  kanji: string | null | undefined,
  kana: string,
): boolean {
  const kanjiStroke = kanji ? getStrokeText(kanji) : '';
  const kanaStroke = getStrokeText(kana);
  return Boolean(kanjiStroke && kanaStroke && kanjiStroke !== kanaStroke);
}

export function strokeBoxSize(charCount: number, dense = false): number {
  if (dense) {
    if (charCount <= 1) return 165;
    if (charCount <= 2) return 135;
    if (charCount <= 4) return 112;
    return 92;
  }
  if (charCount <= 1) return 200;
  if (charCount <= 2) return 160;
  if (charCount <= 4) return 130;
  return 105;
}

/** Thu nhỏ nét vẽ vừa khung flashcard (tránh tràn khi từ dài). */
export function flashcardStrokeBoxSize(charCount: number, rowWidth = 460): number {
  if (charCount <= 0) return 120;
  const spacing = 8;
  const available = rowWidth - spacing * Math.max(0, charCount - 1);
  const size = Math.floor(available / charCount);
  return Math.max(48, Math.min(120, size));
}

export function counterStrokeDims(text: string): { width: number; height: number } | null {
  const writable = getStrokeText(text);
  if (!writable) return null;
  const len = [...writable].length;
  if (len <= 1) return { width: 88, height: 88 };
  if (len <= 2) return { width: 72, height: 72 };
  return { width: 58, height: 58 };
}
