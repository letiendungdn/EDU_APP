/** Tách 漢字（かな） thành ruby; dùng khi bật furigana. */
export function renderFuriganaParts(
  text: string,
): Array<{ kanji: string; reading?: string } | { text: string }> {
  const parts: Array<{ kanji: string; reading?: string } | { text: string }> = [];
  const re = /([一-龯々〆ヵヶ]+)[（(]([ぁ-んァ-ンー]+)[）)]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    parts.push({ kanji: m[1], reading: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts.length ? parts : [{ text }];
}

export function stripParenFurigana(text: string): string {
  return text.replace(/[（(][ぁ-んァ-ンー]+[）)]/g, '');
}
