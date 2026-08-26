import type { JapaneseVocabSuffixesPayload, VocabSuffixGroup as ApiGroup } from '../types/reference';

/** Loại từ gốc khi gắn 接尾語 */
export type RootPos = 'noun' | 'verb' | 'i-adj' | 'na-adj';

export type SetsubigoItem = {
  suffix: string;
  forms: string[];
  kana: string;
  romaji: string;
  meaning: string;
  attachesTo: string;
  pos: RootPos[];
  exampleJa: string;
  exampleVi: string;
};

export type SetsubigoGroup = {
  id: string;
  label: string;
  labelJa: string;
  hint: string;
  items: SetsubigoItem[];
};

export type SuffixMatch = {
  valid: true;
  groupId: string;
  item: SetsubigoItem;
  form: string;
  stem: string;
};

export type SuffixMiss = {
  valid: false;
  reason: string;
  /** Hậu tố khớp hình thức nhưng sai loại từ gốc */
  mismatch?: {
    form: string;
    item: SetsubigoItem;
    expectedPos: RootPos[];
  };
};

export type SuffixCheck = SuffixMatch | SuffixMiss;

const POS_LABEL: Record<RootPos, string> = {
  noun: 'danh từ',
  verb: 'động từ',
  'i-adj': 'tính từ い',
  'na-adj': 'tính từ な',
};

const ROOT_POS = new Set<RootPos>(['noun', 'verb', 'i-adj', 'na-adj']);

let catalog: SetsubigoGroup[] = [];

function asRootPos(values: string[] | undefined): RootPos[] {
  const list = (values ?? []).filter((p): p is RootPos => ROOT_POS.has(p as RootPos));
  return list.length ? list : ['noun'];
}

/** Map payload API → catalog setsubigo */
export function groupsFromPayload(payload: JapaneseVocabSuffixesPayload): SetsubigoGroup[] {
  return payload.groups.map((group: ApiGroup) => ({
    id: group.id,
    label: group.label,
    labelJa: group.labelJa ?? '',
    hint: group.hint,
    items: group.items.map((item) => ({
      suffix: item.suffix,
      forms: item.forms?.length ? item.forms : [item.suffix],
      kana: item.kana,
      romaji: item.romaji,
      meaning: item.meaning,
      attachesTo: item.attachesTo,
      pos: asRootPos(item.pos),
      exampleJa: item.exampleJa,
      exampleVi: item.exampleVi,
    })),
  }));
}

export function setSetsubigoCatalog(groups: SetsubigoGroup[]) {
  catalog = groups;
}

export function getSetsubigoCatalog(): SetsubigoGroup[] {
  return catalog;
}

/** @deprecated Dùng getSetsubigoCatalog() sau khi load API */
export const SETSUBIGO_GROUPS: SetsubigoGroup[] = new Proxy([] as SetsubigoGroup[], {
  get(_target, prop, receiver) {
    return Reflect.get(catalog, prop, receiver);
  },
  ownKeys() {
    return Reflect.ownKeys(catalog);
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Object.getOwnPropertyDescriptor(catalog, prop);
  },
});

function allItems(groups = catalog): Array<{ groupId: string; item: SetsubigoItem }> {
  return groups.flatMap((group) =>
    group.items.map((item) => ({ groupId: group.id, item })),
  );
}

/** Sắp xếp form dài trước để やすい thắng い, らしい thắng しい */
function formIndex(groups = catalog): Array<{ form: string; groupId: string; item: SetsubigoItem }> {
  return allItems(groups)
    .flatMap(({ groupId, item }) =>
      item.forms.map((form) => ({ form, groupId, item })),
    )
    .sort((a, b) => b.form.length - a.form.length);
}

/** 1. Phân loại hậu tố theo nhóm chức năng */
export function classifySetsubigo(groups = catalog): Record<string, SetsubigoItem[]> {
  return Object.fromEntries(groups.map((group) => [group.id, group.items]));
}

export function getSetsubigoGroup(id: string, groups = catalog): SetsubigoGroup | undefined {
  return groups.find((group) => group.id === id);
}

function stripWord(word: string): string {
  return word.replace(/\s+/g, '').replace(/[。．.、,]/g, '');
}

/**
 * 2. Kiểm tra từ có hậu tố hợp lệ với loại từ gốc hay không.
 * `rootPos`: loại của phần gốc (stem), không phải cả từ đã gắn hậu tố.
 */
export function hasValidSuffix(
  word: string,
  rootPos: RootPos,
  groups = catalog,
): boolean {
  return analyzeSetsubigo(word, rootPos, groups).valid;
}

export function analyzeSetsubigo(
  word: string,
  rootPos: RootPos,
  groups = catalog,
): SuffixCheck {
  const text = stripWord(word);
  if (!text) {
    return { valid: false, reason: 'Chưa nhập từ.' };
  }

  let shapeHit:
    | { form: string; groupId: string; item: SetsubigoItem; stem: string }
    | undefined;

  for (const entry of formIndex(groups)) {
    if (text.length <= entry.form.length) continue;
    if (!text.endsWith(entry.form)) continue;

    const stem = text.slice(0, -entry.form.length);
    if (!stem) continue;

    shapeHit = { ...entry, stem };
    if (entry.item.pos.includes(rootPos)) {
      return {
        valid: true,
        groupId: entry.groupId,
        item: entry.item,
        form: entry.form,
        stem,
      };
    }
    break;
  }

  if (shapeHit) {
    const expected = shapeHit.item.pos.map((p) => POS_LABEL[p]).join(', ');
    return {
      valid: false,
      reason: `「${shapeHit.form}」không gắn với ${POS_LABEL[rootPos]} (cần: ${expected}).`,
      mismatch: {
        form: shapeHit.form,
        item: shapeHit.item,
        expectedPos: shapeHit.item.pos,
      },
    };
  }

  return { valid: false, reason: 'Không nhận ra hậu tố 接尾語 trong danh sách.' };
}

export function listSetsubigoForPos(rootPos: RootPos, groups = catalog): SetsubigoItem[] {
  return allItems(groups)
    .map(({ item }) => item)
    .filter((item) => item.pos.includes(rootPos));
}

export const ROOT_POS_OPTIONS: { id: RootPos; label: string }[] = [
  { id: 'noun', label: 'Danh từ' },
  { id: 'verb', label: 'Động từ (gốc ます)' },
  { id: 'i-adj', label: 'Tính từ い' },
  { id: 'na-adj', label: 'Tính từ な' },
];
