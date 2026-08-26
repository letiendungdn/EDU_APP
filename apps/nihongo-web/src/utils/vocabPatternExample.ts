/**
 * Map example sentences stored on Vocabulary (exampleJa / exampleKana / exampleVi).
 * Generators live in DB — do not rebuild sentences on the client.
 */

export type VocabPatternSource = {
  kanji?: string | null;
  kana?: string | null;
  exampleJa?: string | null;
  exampleKana?: string | null;
  exampleVi?: string | null;
};

export type VocabPatternExample = {
  ja: string;
  kana?: string;
  vi: string;
  speak: string;
};

const WAVE = /[～〜]/;

export function isVocabPattern(vocab: {
  kanji?: string | null;
  kana?: string | null;
  meaning?: string | null;
}): boolean {
  return Boolean(
    (vocab.kanji && WAVE.test(vocab.kanji)) ||
      (vocab.kana && WAVE.test(vocab.kana)) ||
      (vocab.meaning && WAVE.test(vocab.meaning)),
  );
}

export function getVocabExamples(vocab: VocabPatternSource): VocabPatternExample[] {
  const ja = vocab.exampleJa?.trim();
  if (!ja) return [];

  const kana = vocab.exampleKana?.trim() || undefined;
  const vi = vocab.exampleVi?.trim() || '';
  return [
    {
      ja,
      kana,
      vi,
      speak: (kana || ja).replace(/[。！？]/g, ''),
    },
  ];
}

/** @deprecated Dùng getVocabExamples */
export function getVocabPatternExamples(
  vocab: VocabPatternSource,
): VocabPatternExample[] | null {
  const examples = getVocabExamples(vocab);
  return examples.length ? examples : null;
}
