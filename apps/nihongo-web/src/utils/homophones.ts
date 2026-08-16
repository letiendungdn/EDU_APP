export type HomophoneGroup = {
  kana: string;
  items: Array<{ kanji: string | null; meaning: string; id: number }>;
};

export function buildHomophoneGroups(
  vocab: Array<{ id: number; kana: string; kanji?: string | null; meaning: string }>,
): HomophoneGroup[] {
  const byKana = new Map<string, HomophoneGroup['items']>();
  for (const row of vocab) {
    const kana = row.kana.replace(/[\s　]/g, '');
    if (kana.length < 2) continue;
    const list = byKana.get(kana) ?? [];
    const key = `${row.kanji ?? ''}::${row.meaning}`;
    if (list.some((x) => `${x.kanji ?? ''}::${x.meaning}` === key)) continue;
    list.push({ kanji: row.kanji ?? null, meaning: row.meaning, id: row.id });
    byKana.set(kana, list);
  }
  return [...byKana.entries()]
    .map(([kana, items]) => ({ kana, items }))
    .filter((g) => {
      const writings = new Set(g.items.map((i) => i.kanji ?? i.meaning));
      return writings.size >= 2;
    })
    .sort((a, b) => b.items.length - a.items.length);
}
