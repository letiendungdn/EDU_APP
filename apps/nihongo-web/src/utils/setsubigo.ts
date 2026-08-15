import suffixCatalog from '../data/vocab-suffixes.json';

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

const catalog = suffixCatalog as { groups: SetsubigoGroup[] };

/** Dữ liệu mẫu (JSON) — nhóm chức năng + quy tắc gắn */
export const SETSUBIGO_GROUPS: SetsubigoGroup[] = catalog.groups;

function allItems(): Array<{ groupId: string; item: SetsubigoItem }> {
  return SETSUBIGO_GROUPS.flatMap((group) =>
    group.items.map((item) => ({ groupId: group.id, item })),
  );
}

/** Sắp xếp form dài trước để やすい thắng い, らしい thắng しい */
function formIndex(): Array<{ form: string; groupId: string; item: SetsubigoItem }> {
  return allItems()
    .flatMap(({ groupId, item }) =>
      item.forms.map((form) => ({ form, groupId, item })),
    )
    .sort((a, b) => b.form.length - a.form.length);
}

/** 1. Phân loại hậu tố theo nhóm chức năng */
export function classifySetsubigo(): Record<string, SetsubigoItem[]> {
  return Object.fromEntries(
    SETSUBIGO_GROUPS.map((group) => [group.id, group.items]),
  );
}

export function getSetsubigoGroup(id: string): SetsubigoGroup | undefined {
  return SETSUBIGO_GROUPS.find((group) => group.id === id);
}

function stripWord(word: string): string {
  return word.replace(/\s+/g, '').replace(/[。．.、,]/g, '');
}

/**
 * 2. Kiểm tra từ có hậu tố hợp lệ với loại từ gốc hay không.
 * `rootPos`: loại của phần gốc (stem), không phải cả từ đã gắn hậu tố.
 *
 * Ví dụ:
 * - 田中さん + noun → hợp lệ
 * - 分かりやすい + verb → hợp lệ (分かり = 連用形)
 * - 高すぎる + i-adj → hợp lệ (高 = gốc 高い)
 * - 高すぎる + noun → không hợp lệ
 */
export function hasValidSuffix(word: string, rootPos: RootPos): boolean {
  return analyzeSetsubigo(word, rootPos).valid;
}

export function analyzeSetsubigo(word: string, rootPos: RootPos): SuffixCheck {
  const text = stripWord(word);
  if (!text) {
    return { valid: false, reason: 'Chưa nhập từ.' };
  }

  let shapeHit:
    | { form: string; groupId: string; item: SetsubigoItem; stem: string }
    | undefined;

  for (const entry of formIndex()) {
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
    // Cùng một form có thể thuộc nhiều item; thử form khác trước khi kết luận sai POS
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

export function listSetsubigoForPos(rootPos: RootPos): SetsubigoItem[] {
  return allItems()
    .map(({ item }) => item)
    .filter((item) => item.pos.includes(rootPos));
}

export const ROOT_POS_OPTIONS: { id: RootPos; label: string }[] = [
  { id: 'noun', label: 'Danh từ' },
  { id: 'verb', label: 'Động từ (gốc ます)' },
  { id: 'i-adj', label: 'Tính từ い' },
  { id: 'na-adj', label: 'Tính từ な' },
];
