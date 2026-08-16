import { classifyMinnaWord, compactKana, type MinnaWordClass } from './minna-word-class';

export type VerbGroup = 'godan' | 'ichidan' | 'suru' | 'kuru' | 'iku';

export type ConjFormId = 'masu' | 'te' | 'ta' | 'nai' | 'dict';

export const CONJ_FORMS: { id: ConjFormId; label: string; ja: string }[] = [
  { id: 'masu', label: 'ます', ja: '丁寧形' },
  { id: 'te', label: 'て', ja: 'て形' },
  { id: 'ta', label: 'た', ja: 'た形' },
  { id: 'nai', label: 'ない', ja: 'ない形' },
  { id: 'dict', label: 'Từ điển', ja: '辞書形' },
];

export type Conjugation = Record<ConjFormId, string>;

const E_ROW = new Set(['え', 'け', 'げ', 'せ', 'ぜ', 'て', 'で', 'ね', 'へ', 'べ', 'ぺ', 'め', 'れ']);

const GODAN_STEM_TO_DICT: Record<string, string> = {
  い: 'う',
  き: 'く',
  ぎ: 'ぐ',
  し: 'す',
  ち: 'つ',
  に: 'ぬ',
  び: 'ぶ',
  み: 'む',
  り: 'る',
};

const ICHIDAN_I_STEMS = new Set([
  'み',
  'い',
  'おき',
  'かり',
  'おり',
  'あび',
  'たり',
  'でき',
  'しんじ',
  'とじ',
  'おち',
  'すぎ',
  'かんじ',
  'かんがえ',
]);

function lastKana(stem: string): string {
  return stem.slice(-1);
}

function masuStem(kana: string): string | null {
  const compact = compactKana(kana);
  if (!compact.endsWith('ます') || compact.length < 3) return null;
  return compact.slice(0, -2);
}

const GODAN_SU_STEMS = new Set([
  'はなし',
  'だし',
  'かえし',
  'おし',
  'けし',
  'さし',
  'うつし',
  'なおし',
  'まわし',
  'のこし',
  'さがし',
  'こわし',
  'わたし',
]);

export function classifyVerbGroup(kana: string, kanji?: string | null): VerbGroup | null {
  const compact = compactKana(kana);
  const stem = masuStem(compact);
  if (!stem) return null;
  const k = (kanji ?? '').replace(/[\s　]/g, '');

  if (compact === 'します') return 'suru';
  if (compact.endsWith('します')) {
    return GODAN_SU_STEMS.has(stem) ? 'godan' : 'suru';
  }
  if (compact === 'きます') {
    if (/着/.test(k)) return 'ichidan';
    return 'kuru';
  }
  if (compact === 'いきます' && (/行/.test(k) || !k || !/生|活/.test(k))) return 'iku';
  if (ICHIDAN_I_STEMS.has(stem)) return 'ichidan';
  if (E_ROW.has(lastKana(stem))) return 'ichidan';
  return 'godan';
}

function godanTeTa(stem: string, te: boolean): string {
  const last = lastKana(stem);
  const head = stem.slice(0, -1);
  if (last === 'き') return `${head}${te ? 'いて' : 'いた'}`;
  if (last === 'ぎ') return `${head}${te ? 'いで' : 'いだ'}`;
  if (last === 'し') return `${head}${te ? 'して' : 'した'}`;
  if (last === 'に' || last === 'び' || last === 'み') return `${head}${te ? 'んで' : 'んだ'}`;
  return `${head}${te ? 'って' : 'った'}`;
}

function godanNai(stem: string): string {
  const last = lastKana(stem);
  const head = stem.slice(0, -1);
  if (last === 'い') return `${head}わない`;
  const dict = GODAN_STEM_TO_DICT[last];
  if (!dict) return `${stem}ない`;
  const aRow: Record<string, string> = {
    う: 'わ',
    く: 'か',
    ぐ: 'が',
    す: 'さ',
    つ: 'た',
    ぬ: 'な',
    ぶ: 'ば',
    む: 'ま',
    る: 'ら',
  };
  return `${head}${aRow[dict] ?? 'ら'}ない`;
}

function godanDict(stem: string): string {
  const last = lastKana(stem);
  const head = stem.slice(0, -1);
  const dictEnd = GODAN_STEM_TO_DICT[last];
  if (!dictEnd) return `${stem}る`;
  return `${head}${dictEnd}`;
}

export function conjugateVerb(kana: string, kanji?: string | null): Conjugation | null {
  const compact = compactKana(kana);
  const stem = masuStem(compact);
  const group = classifyVerbGroup(compact, kanji);
  if (!stem || !group) return null;

  if (group === 'suru') {
    const head = compact === 'します' ? '' : compact.slice(0, -3);
    return {
      masu: compact,
      te: `${head}して`,
      ta: `${head}した`,
      nai: `${head}しない`,
      dict: `${head}する`,
    };
  }
  if (group === 'kuru') {
    return { masu: 'きます', te: 'きて', ta: 'きた', nai: 'こない', dict: 'くる' };
  }
  if (group === 'iku') {
    return { masu: compact, te: 'いって', ta: 'いった', nai: 'いかない', dict: 'いく' };
  }
  if (group === 'ichidan') {
    return {
      masu: compact,
      te: `${stem}て`,
      ta: `${stem}た`,
      nai: `${stem}ない`,
      dict: `${stem}る`,
    };
  }
  return {
    masu: compact,
    te: godanTeTa(stem, true),
    ta: godanTeTa(stem, false),
    nai: godanNai(stem),
    dict: godanDict(stem),
  };
}

export function conjugateIAdj(kana: string): Conjugation | null {
  const compact = compactKana(kana);
  if (compact === 'いい' || compact === 'よい') {
    return { masu: 'いいです', te: 'よくて', ta: 'よかった', nai: 'よくない', dict: 'いい' };
  }
  if (!compact.endsWith('い') || compact.length < 2) return null;
  const stem = compact.slice(0, -1);
  return {
    masu: `${compact}です`,
    te: `${stem}くて`,
    ta: `${stem}かった`,
    nai: `${stem}くない`,
    dict: compact,
  };
}

export function conjugateNaAdj(kana: string): Conjugation | null {
  const compact = compactKana(kana);
  if (!compact) return null;
  return {
    masu: `${compact}です`,
    te: `${compact}で`,
    ta: `${compact}だった`,
    nai: `${compact}じゃない`,
    dict: compact,
  };
}

export function conjugateWord(input: {
  kana: string;
  kanji?: string | null;
  partOfSpeech?: string | null;
}): { wordClass: MinnaWordClass; group?: VerbGroup; forms: Conjugation } | null {
  const wordClass = classifyMinnaWord(input);
  if (wordClass === 'verb') {
    const forms = conjugateVerb(input.kana, input.kanji);
    if (!forms) return null;
    return { wordClass, group: classifyVerbGroup(input.kana, input.kanji) ?? undefined, forms };
  }
  if (wordClass === 'i-adj') {
    const forms = conjugateIAdj(input.kana);
    if (!forms) return null;
    return { wordClass, forms };
  }
  if (wordClass === 'na-adj') {
    const forms = conjugateNaAdj(input.kana);
    if (!forms) return null;
    return { wordClass, forms };
  }
  return null;
}

export function normalizeTypedJp(value: string): string {
  return value.replace(/[\s　]/g, '').replace(/です$/, '').trim();
}
