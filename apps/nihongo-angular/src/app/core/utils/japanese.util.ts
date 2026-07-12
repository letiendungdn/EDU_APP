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

export type FlashcardTextTier = 'sm' | 'md' | 'lg' | 'xl';

export interface OptionalBracketSegment {
  text: string;
  optional: boolean;
  openBracket?: '[' | '［';
  closeBracket?: ']' | '］';
}

const OPTIONAL_BRACKET_RE = /(\[|［)([^\]］]+)(]|］)/g;

export function parseOptionalBracketSegments(text: string): OptionalBracketSegment[] {
  const segments: OptionalBracketSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(OPTIONAL_BRACKET_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, index), optional: false });
    }

    const open = match[1] as '[' | '［';
    segments.push({
      text: match[2],
      optional: true,
      openBracket: open,
      closeBracket: open === '[' ? ']' : '］',
    });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), optional: false });
  }

  return segments.length ? segments : [{ text, optional: false }];
}

export function hasOptionalBracketParts(text: string | null | undefined): boolean {
  if (!text) return false;
  return /(\[|［)[^\]］]+(]|］)/.test(text);
}

function flashcardEffectiveLength(text: string): number {
  if (hasOptionalBracketParts(text)) {
    return parseOptionalBracketSegments(text)
      .filter((segment) => !segment.optional)
      .map((segment) => segment.text)
      .join('')
      .replace(/\s/g, '').length;
  }

  return text.replace(/\s/g, '').length;
}

/** Cỡ chữ flashcard theo độ dài — tránh cụm dài bị font quá to. */
export function flashcardTextTier(...texts: (string | null | undefined)[]): FlashcardTextTier {
  const len = Math.max(0, ...texts.map((text) => flashcardEffectiveLength(text ?? '')));
  if (len <= 4) return 'sm';
  if (len <= 9) return 'md';
  if (len <= 16) return 'lg';
  return 'xl';
}

/** Chỉ chữ Latin — coi là romaji (không có kana/kanji). */
export function isRomajiInput(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/.test(trimmed)) return false;
  return /^[a-zA-Z0-9\s\-'.,!?]+$/.test(trimmed);
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

export function flashcardPhraseStrokeScale(totalChars: number): number {
  if (totalChars <= 6) return 1;
  if (totalChars <= 10) return 0.76;
  if (totalChars <= 14) return 0.62;
  return 0.52;
}

export function flashcardSegmentStrokeSize(
  charCount: number,
  optional: boolean,
  totalChars: number,
): number {
  const base = strokeBoxSize(charCount, true);
  const scaled = Math.round(base * flashcardPhraseStrokeScale(totalChars));
  return optional ? Math.max(30, Math.round(scaled * 0.52)) : Math.max(36, scaled);
}

export function optionalBracketStrokeCharCount(text: string): number {
  return parseOptionalBracketSegments(text).reduce(
    (sum, segment) => sum + [...getStrokeText(segment.text)].length,
    0,
  );
}

export function counterStrokeDims(text: string): { width: number; height: number } | null {
  const writable = getStrokeText(text);
  if (!writable) return null;
  const len = [...writable].length;
  if (len <= 1) return { width: 88, height: 88 };
  if (len <= 2) return { width: 72, height: 72 };
  return { width: 58, height: 58 };
}
