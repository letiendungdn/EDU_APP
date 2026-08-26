import { getKanjiReadingGroups } from './kanjiSpeak';
import { buildMcqQuestions, type McqOption, type McqQuestionBase } from './mcqQuiz';

export type KanjiQuizMode = 'char-to-meaning' | 'meaning-to-char' | 'char-to-reading';

export type KanjiQuizSource = {
  id: number;
  character: string;
  meaningVi: string;
  readingLabel: string;
  speak: string;
  lessonNumber?: number;
};

export type KanjiQuizQuestion = McqQuestionBase & {
  mode: KanjiQuizMode;
  character: string;
  meaningVi: string;
  readingLabel: string;
  speak: string;
  lessonNumber?: number;
};

export function kanjiReadingLabel(entry: {
  character: string;
  onyomi?: string | null;
  kunyomi?: string | null;
}): string {
  const groups = getKanjiReadingGroups(entry);
  if (!groups.length) return entry.character;
  return groups.map((group) => group.map((token) => token.display).join(', ')).join(' · ');
}

export function kanjiSpeakText(entry: {
  character: string;
  onyomi?: string | null;
  kunyomi?: string | null;
}): string {
  const groups = getKanjiReadingGroups(entry);
  const first = groups[0]?.[0]?.speak;
  return first || entry.character;
}

export function toKanjiQuizSource(
  entry: {
    id: number;
    character: string;
    meaningVi: string;
    onyomi?: string | null;
    kunyomi?: string | null;
    lesson?: { lessonNumber?: number } | null;
  },
  lessonNumber?: number,
): KanjiQuizSource | null {
  const character = entry.character?.trim();
  const meaningVi = entry.meaningVi?.trim();
  if (!character || !meaningVi) return null;
  return {
    id: entry.id,
    character,
    meaningVi,
    readingLabel: kanjiReadingLabel(entry),
    speak: kanjiSpeakText(entry),
    lessonNumber: lessonNumber ?? entry.lesson?.lessonNumber,
  };
}

const HAS_KANJI = /[\u4e00-\u9fff]/;
const WAVE = /[～〜]/;

/**
 * Từ vựng Minna có chữ Hán → nguồn cho trắc nghiệm kanji
 * (kanji ↔ nghĩa / đọc kana của từ).
 */
export function toKanjiQuizSourceFromVocab(
  vocab: {
    id: number;
    kanji?: string | null;
    kana: string;
    meaning: string;
  },
  lessonNumber?: number,
): KanjiQuizSource | null {
  const character = vocab.kanji?.trim() || '';
  const kana = vocab.kana?.trim() || '';
  const meaningVi = vocab.meaning?.trim() || '';
  if (!character || !kana || !meaningVi) return null;
  if (!HAS_KANJI.test(character)) return null;
  if (WAVE.test(character) || WAVE.test(kana) || WAVE.test(meaningVi)) return null;
  return {
    id: vocab.id,
    character,
    meaningVi,
    readingLabel: kana,
    speak: kana,
    lessonNumber,
  };
}

function toOption(item: KanjiQuizSource, mode: KanjiQuizMode): McqOption {
  if (mode === 'char-to-meaning') {
    return { text: item.meaningVi, reveal: `${item.character} · ${item.readingLabel}`, speak: item.speak };
  }
  if (mode === 'meaning-to-char') {
    return { text: item.character, reveal: `${item.meaningVi} · ${item.readingLabel}`, speak: item.speak };
  }
  return { text: item.readingLabel, reveal: `${item.character} · ${item.meaningVi}`, speak: item.speak };
}

export function buildKanjiQuiz(
  source: KanjiQuizSource[],
  mode: KanjiQuizMode,
  options: { optionCount?: number; random?: () => number } = {},
): KanjiQuizQuestion[] {
  const pool = source.filter((item) => {
    if (!item.character || !item.meaningVi) return false;
    if (mode === 'char-to-reading' && !item.readingLabel.trim()) return false;
    return true;
  });

  return buildMcqQuestions(pool, {
    ...options,
    answerOf: (item) => {
      if (mode === 'char-to-meaning') return item.meaningVi;
      if (mode === 'meaning-to-char') return item.character;
      return item.readingLabel;
    },
    toOption: (item) => toOption(item, mode),
    toQuestion: (item, choices, answer) => ({
      id: item.id,
      mode,
      prompt:
        mode === 'meaning-to-char'
          ? item.meaningVi
          : item.character,
      promptSub: mode === 'char-to-reading' ? 'Chọn cách đọc' : undefined,
      answer,
      options: choices,
      character: item.character,
      meaningVi: item.meaningVi,
      readingLabel: item.readingLabel,
      speak: item.speak,
      lessonNumber: item.lessonNumber,
    }),
  }) as KanjiQuizQuestion[];
}
