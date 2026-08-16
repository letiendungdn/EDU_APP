export type KanjiInWordItem = {
  character: string;
  word: string;
  reading: string;
  meaningVi: string;
};

/** Lấy phần đọc ứng với 1 kanji trong từ (ưu tiên kana liền mạch). */
export function readingChoices(
  item: KanjiInWordItem,
  siblings: KanjiInWordItem[],
): string[] {
  const correct = item.reading.replace(/[-－]/g, '').trim();
  const pool = siblings
    .filter((s) => s.character === item.character && s.reading !== item.reading)
    .map((s) => s.reading.replace(/[-－]/g, '').trim());
  const extra = siblings
    .filter((s) => s.character !== item.character)
    .map((s) => s.reading.replace(/[-－]/g, '').trim());
  const uniq = [...new Set([correct, ...pool, ...extra])].filter(Boolean);
  const rest = uniq.filter((r) => r !== correct).slice(0, 3);
  while (rest.length < 3 && uniq.length > rest.length + 1) {
    const next = uniq.find((r) => r !== correct && !rest.includes(r));
    if (!next) break;
    rest.push(next);
  }
  const options = [correct, ...rest];
  for (let i = options.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

export function collectKanjiWords(
  entries: Array<{
    character: string;
    vocabularies?: Array<{ word: string; reading: string; meaningVi: string }>;
  }>,
): KanjiInWordItem[] {
  const items: KanjiInWordItem[] = [];
  for (const entry of entries) {
    for (const vocab of entry.vocabularies ?? []) {
      if (!vocab.word.includes(entry.character)) continue;
      if (!vocab.reading.trim()) continue;
      items.push({
        character: entry.character,
        word: vocab.word,
        reading: vocab.reading,
        meaningVi: vocab.meaningVi,
      });
    }
  }
  return items;
}
