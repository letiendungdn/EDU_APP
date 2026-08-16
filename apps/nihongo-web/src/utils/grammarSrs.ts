const KEY = 'nihongo-grammar-srs';

export type GrammarSrsCard = {
  id: number;
  pattern: string;
  meaning: string;
  lessonNumber: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
  due: number;
};

function readAll(): GrammarSrsCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GrammarSrsCard[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(cards: GrammarSrsCard[]): void {
  localStorage.setItem(KEY, JSON.stringify(cards));
}

export function loadGrammarSrs(): GrammarSrsCard[] {
  return readAll().sort((a, b) => a.due - b.due);
}

export function isGrammarPinned(id: number): boolean {
  return readAll().some((c) => c.id === id);
}

export function pinGrammar(input: {
  id: number;
  pattern: string;
  meaning: string;
  lessonNumber: number;
}): GrammarSrsCard[] {
  const cards = readAll();
  if (cards.some((c) => c.id === input.id)) return cards;
  cards.push({
    ...input,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    due: Date.now(),
  });
  writeAll(cards);
  return cards;
}

export function unpinGrammar(id: number): GrammarSrsCard[] {
  const next = readAll().filter((c) => c.id !== id);
  writeAll(next);
  return next;
}

export function dueGrammarCards(): GrammarSrsCard[] {
  const now = Date.now();
  return readAll().filter((c) => c.due <= now);
}

export function reviewGrammar(id: number, quality: number): GrammarSrsCard[] {
  const cards = readAll();
  const card = cards.find((c) => c.id === id);
  if (!card) return cards;
  const q = quality;
  const ef = Math.max(1.3, card.easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  let interval = 1;
  let reps = card.repetitions;
  if (q < 3) {
    interval = 1;
    reps = 0;
  } else if (reps === 0) {
    interval = 1;
    reps = 1;
  } else if (reps === 1) {
    interval = 6;
    reps = 2;
  } else {
    interval = Math.max(1, Math.round(card.interval * ef));
    reps += 1;
  }
  card.easeFactor = ef;
  card.interval = interval;
  card.repetitions = reps;
  card.due = Date.now() + interval * 24 * 60 * 60 * 1000;
  writeAll(cards);
  return cards;
}
