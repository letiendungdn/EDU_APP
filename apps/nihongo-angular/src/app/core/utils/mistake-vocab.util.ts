const STORAGE_KEY = 'nihongo-mistake-vocab';

export interface MistakeWord {
  kana: string;
  kanji?: string | null;
  meaning: string;
  lessonNumber: number;
  wrongCount: number;
  lastWrongAt: string;
}

export function loadMistakeWords(): MistakeWord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as MistakeWord[];
  } catch {
    return [];
  }
}

export function saveMistakeWords(words: MistakeWord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

export function addMistakeWord(word: Omit<MistakeWord, 'wrongCount' | 'lastWrongAt'>): void {
  const list = loadMistakeWords();
  const key = `${word.lessonNumber}:${word.kana}`;
  const idx = list.findIndex((w) => `${w.lessonNumber}:${w.kana}` === key);
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      wrongCount: list[idx].wrongCount + 1,
      lastWrongAt: new Date().toISOString(),
    };
  } else {
    list.push({ ...word, wrongCount: 1, lastWrongAt: new Date().toISOString() });
  }
  saveMistakeWords(list);
}

export function extractVocabFromExercise(
  exercise: { question: string; answer: string },
  lessonNumber: number,
): Omit<MistakeWord, 'wrongCount' | 'lastWrongAt'> | null {
  const answer = exercise.answer.trim();
  if (!answer) return null;
  return { kana: answer, meaning: exercise.question.slice(0, 80), lessonNumber };
}

export function parseExerciseOptions(options: string[] | string | null): string[] {
  if (!options) return [];
  if (Array.isArray(options)) return options;
  try {
    const parsed = JSON.parse(options) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
