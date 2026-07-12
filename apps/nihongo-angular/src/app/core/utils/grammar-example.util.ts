/** Bỏ cách đọc kana/katakana ngay sau kanji (vd. 学生 がくせい → がくせい). */
export function stripInlineFurigana(text: string): string {
  return text
    .replace(/([一-龯])\s+([\u3040-\u309F\u30A0-\u30FF]+)/g, '$2')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Chuỗi tiếng Nhật sạch để TTS đọc (bỏ furigana trùng, bỏ khoảng trắng thừa). */
export function grammarExampleSpeechText(jp: string): string {
  return stripInlineFurigana(jp).replace(/\s+/g, '').replace(/…/g, '');
}

export function grammarExampleRomaji(romaji?: string | null): string {
  return romaji?.trim() ?? '';
}
