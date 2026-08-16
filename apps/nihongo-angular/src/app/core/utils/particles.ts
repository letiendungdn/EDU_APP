const TWO_MORA = ['から', 'まで', 'より', 'ので'] as const;
const ONE_MORA = ['は', 'が', 'を', 'に', 'で', 'と', 'も', 'へ'] as const;

const SKIP_WHOLE = ['こんにちは', 'こんばんは', 'おはようございます'];

export type ParticleHit = {
  start: number;
  end: number;
  particle: string;
};

function parenRanges(jp: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  const re = /[（(][^）)]*[）)]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(jp))) ranges.push([m.index, m.index + m[0].length]);
  return ranges;
}

function inRange(index: number, ranges: Array<[number, number]>): boolean {
  return ranges.some(([a, b]) => index >= a && index < b);
}

export function findParticles(jp: string): ParticleHit[] {
  const compact = jp.replace(/\s+/g, '');
  if (SKIP_WHOLE.some((w) => compact.includes(w) && compact.length <= w.length + 2)) {
    return [];
  }
  const ranges = parenRanges(jp);
  const hits: ParticleHit[] = [];
  let i = 0;
  while (i < jp.length) {
    if (inRange(i, ranges) || /\s/.test(jp[i])) {
      i += 1;
      continue;
    }
    const two = TWO_MORA.find((p) => jp.startsWith(p, i));
    if (two && !inRange(i, ranges)) {
      hits.push({ start: i, end: i + two.length, particle: two });
      i += two.length;
      continue;
    }
    const one = ONE_MORA.find((p) => jp.startsWith(p, i));
    if (one) {
      const after = jp.slice(i + 1);
      const before = jp.slice(0, i);
      if (one === 'で' && after.startsWith('す')) {
        i += 1;
        continue;
      }
      if (one === 'は' && (before.endsWith('こんにち') || before.endsWith('こんばん'))) {
        i += 1;
        continue;
      }
      hits.push({ start: i, end: i + 1, particle: one });
      i += 1;
      continue;
    }
    i += 1;
  }
  return hits;
}

export type ParticleQuestion = {
  id: string;
  prompt: Array<{ text: string; blank?: string }>;
  answer: string;
  options: string[];
  vi?: string;
  sourceJp: string;
};

const OPTION_BANK = ['は', 'が', 'を', 'に', 'で', 'と', 'も', 'へ', 'から', 'まで'];

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function buildParticleQuestions(
  examples: Array<{ jp: string; vi?: string | null; id?: number | string }>,
): ParticleQuestion[] {
  const questions: ParticleQuestion[] = [];
  for (const example of examples) {
    const hits = findParticles(example.jp);
    if (!hits.length) continue;
    const hit = hits[Math.floor(Math.random() * hits.length)];
    const prompt: ParticleQuestion['prompt'] = [];
    if (hit.start > 0) prompt.push({ text: example.jp.slice(0, hit.start) });
    prompt.push({ text: '＿', blank: hit.particle });
    if (hit.end < example.jp.length) prompt.push({ text: example.jp.slice(hit.end) });
    const distractors = shuffle(OPTION_BANK.filter((p) => p !== hit.particle)).slice(0, 3);
    questions.push({
      id: String(example.id ?? `${example.jp}-${hit.start}`),
      prompt,
      answer: hit.particle,
      options: shuffle([hit.particle, ...distractors]),
      vi: example.vi ?? undefined,
      sourceJp: example.jp,
    });
  }
  return questions;
}
