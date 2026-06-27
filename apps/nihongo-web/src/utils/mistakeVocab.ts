import type { Exercise } from '../types/api';
import type { MockExamReviewItem } from './mockExam';

const STORAGE_KEY = 'nihongo-mistake-vocab';
export const DAILY_REVIEW_LIMIT = 20;
const MASTER_STREAK = 3;

export interface MistakeWord {
  key: string;
  kana: string;
  kanji: string | null;
  romaji: string;
  meaning: string;
  lessonNumber: number;
  wrongCount: number;
  reviewStreak: number;
  mastered: boolean;
  addedAt: string;
  updatedAt: string;
  lastReviewedAt: string | null;
}

interface MistakeStore {
  words: MistakeWord[];
  lastReviewDate: string | null;
  reviewedToday: number;
}

export interface MistakeStats {
  total: number;
  mastered: number;
  reviewedToday: number;
  dailyGoal: number;
  dueToday: number;
}

export interface MistakeWordInput {
  kana: string;
  kanji?: string | null;
  romaji?: string;
  meaning?: string;
  lessonNumber?: number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadStore(): MistakeStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { words: [], lastReviewDate: null, reviewedToday: 0 };
    return JSON.parse(raw) as MistakeStore;
  } catch {
    return { words: [], lastReviewDate: null, reviewedToday: 0 };
  }
}

function saveStore(store: MistakeStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function makeWordKey(kana: string, lessonNumber?: number): string {
  return `${lessonNumber ?? 0}:${kana}`;
}

export function extractVocabFromExercise(
  exercise: Pick<Exercise, 'question' | 'answer'> | null | undefined,
  lessonNumber: number,
): Omit<MistakeWordInput, 'romaji'> & { lessonNumber: number } | null {
  const question = exercise?.question ?? '';
  const bracketMatch = question.match(/「([^」]+)」\s*\(([^)]+)\)/);
  if (bracketMatch) {
    const left = bracketMatch[1].trim();
    const kana = bracketMatch[2].trim();
    const hasKanji = /[\u4e00-\u9faf]/.test(left);
    return {
      kanji: hasKanji ? left : null,
      kana,
      meaning: exercise?.answer ?? '',
      lessonNumber,
    };
  }

  const fillMatch = question.match(/Điền hiragana cho:\s*"(.+?)"/i);
  if (fillMatch) {
    return {
      kanji: null,
      kana: exercise?.answer ?? '',
      meaning: fillMatch[1],
      lessonNumber,
    };
  }

  return null;
}

export function addMistakeWord(word: MistakeWordInput): string | null {
  if (!word?.kana?.trim()) return null;

  const store = loadStore();
  const key = makeWordKey(word.kana, word.lessonNumber);
  const existing = store.words.find((w) => w.key === key);

  if (existing) {
    existing.wrongCount = (existing.wrongCount ?? 0) + 1;
    existing.meaning = word.meaning ?? existing.meaning;
    existing.kanji = word.kanji ?? existing.kanji;
    existing.romaji = word.romaji ?? existing.romaji;
    existing.mastered = false;
    existing.reviewStreak = 0;
    existing.updatedAt = new Date().toISOString();
  } else {
    store.words.push({
      key,
      kana: word.kana,
      kanji: word.kanji ?? null,
      romaji: word.romaji ?? '',
      meaning: word.meaning ?? '',
      lessonNumber: word.lessonNumber ?? 0,
      wrongCount: 1,
      reviewStreak: 0,
      mastered: false,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastReviewedAt: null,
    });
  }

  saveStore(store);
  return key;
}

export function removeMistakeWord(key: string): void {
  const store = loadStore();
  store.words = store.words.filter((w) => w.key !== key);
  saveStore(store);
}

export function clearMasteredWords(): void {
  const store = loadStore();
  store.words = store.words.filter((w) => !w.mastered);
  saveStore(store);
}

export function getMistakeStats(): MistakeStats {
  const store = loadStore();
  const active = store.words.filter((w) => !w.mastered);
  const today = todayKey();
  const reviewedToday =
    store.lastReviewDate === today ? store.reviewedToday ?? 0 : 0;

  return {
    total: active.length,
    mastered: store.words.filter((w) => w.mastered).length,
    reviewedToday,
    dailyGoal: DAILY_REVIEW_LIMIT,
    dueToday: Math.min(DAILY_REVIEW_LIMIT, active.length),
  };
}

export function getAllMistakeWords(includeMastered = false): MistakeWord[] {
  const store = loadStore();
  return store.words
    .filter((w) => includeMastered || !w.mastered)
    .sort((a, b) => (b.wrongCount ?? 0) - (a.wrongCount ?? 0));
}

export function getTodayReviewBatch(limit = DAILY_REVIEW_LIMIT): MistakeWord[] {
  const store = loadStore();
  const pool = store.words
    .filter((w) => !w.mastered)
    .sort((a, b) => {
      const aTime = a.lastReviewedAt ? new Date(a.lastReviewedAt).getTime() : 0;
      const bTime = b.lastReviewedAt ? new Date(b.lastReviewedAt).getTime() : 0;
      if (aTime !== bTime) return aTime - bTime;
      return (b.wrongCount ?? 0) - (a.wrongCount ?? 0);
    });

  return pool.slice(0, limit);
}

export function recordReviewResult(key: string, remembered: boolean): void {
  const store = loadStore();
  const word = store.words.find((w) => w.key === key);
  if (!word) return;

  const today = todayKey();
  if (store.lastReviewDate !== today) {
    store.lastReviewDate = today;
    store.reviewedToday = 0;
  }

  word.lastReviewedAt = new Date().toISOString();
  store.reviewedToday = (store.reviewedToday ?? 0) + 1;

  if (remembered) {
    word.reviewStreak = (word.reviewStreak ?? 0) + 1;
    if (word.reviewStreak >= MASTER_STREAK) {
      word.mastered = true;
    }
  } else {
    word.reviewStreak = 0;
    word.wrongCount = (word.wrongCount ?? 0) + 1;
    word.mastered = false;
  }

  word.updatedAt = new Date().toISOString();
  saveStore(store);
}

export function importWrongItemsFromReview(reviewItems: MockExamReviewItem[]): number {
  let added = 0;
  for (const item of reviewItems) {
    if (item.isCorrect) continue;
    if (item.sectionId !== 'vocab' && item.sectionId !== 'listening') continue;

    const kana =
      item.sectionId === 'listening' && item.audioText
        ? item.audioText
        : extractVocabFromExercise(
            { question: item.question, answer: item.correctAnswer },
            item.lessonNumber ?? 0,
          )?.kana;

    if (!kana) continue;

    const parsed =
      item.sectionId === 'vocab'
        ? extractVocabFromExercise(
            { question: item.question, answer: item.correctAnswer },
            item.lessonNumber ?? 0,
          )
        : null;

    addMistakeWord({
      kana,
      kanji: parsed?.kanji ?? null,
      meaning: item.correctAnswer,
      lessonNumber: item.lessonNumber ?? 0,
    });
    added += 1;
  }
  return added;
}

export async function syncToServer(): Promise<void> {
  const { getStoredToken } = await import('../lib/api-client');
  const { syncReviewProgress } = await import('../api/index');
  const token = getStoredToken();
  if (!token) return;

  const store = loadStore();
  const active = store.words.filter((w) => !w.mastered);
  if (!active.length) return;

  try {
    await syncReviewProgress(
      token,
      active.map((w) => ({
        kana: w.kana,
        kanji: w.kanji,
        meaning: w.meaning,
        lessonNumber: w.lessonNumber,
        wrongCount: w.wrongCount ?? 0,
        reviewStreak: w.reviewStreak ?? 0,
        mastered: w.mastered ?? false,
        lastReviewedAt: w.lastReviewedAt ?? undefined,
      })),
    );
  } catch {
    // localStorage vẫn là source of truth khi offline
  }
}
