type KanjiSpeakSource = {
  character?: string;
  onyomi?: string | null;
  kunyomi?: string | null;
  vocabularies?: Array<{ reading?: string | null }>;
};

export type KanjiReadingToken = {
  display: string;
  speak: string;
};

function speakForm(display: string): string {
  return display.replace(/-/g, '').trim();
}

export function splitKanjiReadingField(raw: string | null | undefined): KanjiReadingToken[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,、;／/]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((display) => ({ display, speak: speakForm(display) }))
    .filter((part) => part.speak);
}

export function getKanjiReadingGroups(kanji: KanjiSpeakSource): KanjiReadingToken[][] {
  return [splitKanjiReadingField(kanji.onyomi), splitKanjiReadingField(kanji.kunyomi)].filter(
    (group) => group.length > 0,
  );
}

export function getKanjiSpeakItems(kanji: KanjiSpeakSource): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const add = (text: string) => {
    const value = text.trim();
    if (!value || seen.has(value)) return;
    seen.add(value);
    out.push(value);
  };

  for (const group of getKanjiReadingGroups(kanji)) {
    for (const token of group) add(token.speak);
  }
  for (const vocab of kanji.vocabularies ?? []) {
    if (vocab.reading) add(speakForm(vocab.reading));
  }
  if (!out.length && kanji.character) add(kanji.character);
  return out;
}
