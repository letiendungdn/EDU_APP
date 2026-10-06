/** Một nút trong cây cấu tạo KanjiVG (xem scripts/build-kanji-components.mjs). */
export interface KanjiNode {
  /** id nhóm trong SVG, vd. "g1" (gốc là "") */
  id: string;
  /** Số nét thuộc nhóm */
  n: number;
  /** Thành phần (kvg:element) */
  e?: string;
  /** Dạng gốc (kvg:original), vd. 亻 → 人 */
  o?: string;
  /** Vị trí: left, right, top, bottom, tare, nyo, kamae… */
  p?: string;
  /** Là bộ thủ (general / tradit / nelson) */
  r?: string;
  /** Thành phần biểu âm */
  ph?: string;
  /** Thành phần bị tách làm nhiều phần (1, 2…) */
  pt?: string;
  c?: KanjiNode[];
}

export type KanjiComponentIndex = Record<string, KanjiNode>;

export function isKanji(char: string): boolean {
  return /\p{Script=Han}/u.test(char);
}

/** Mã nội bộ KanjiVG/CHISE (vd. CDP-8BC4), không phải một chữ để hiển thị. */
export function isCodedElement(value: string): boolean {
  return /^[A-Z][A-Z0-9]*-/.test(value);
}

/**
 * Chữ dùng để vẽ một nút. Mã không có Unicode được thay bằng các thành phần con
 * (CDP-8BC4 trong 原 là 白 trên 小).
 */
export function componentParts(node: KanjiNode): string[] {
  const raw = node.e ?? '';
  if (raw && !isCodedElement(raw)) return [raw];
  if (node.o && !isCodedElement(node.o)) return [node.o];
  return meaningfulChildren(node).flatMap(componentParts);
}

export function componentLabel(node: KanjiNode): string {
  const parts = componentParts(node);
  return parts.length > 0 ? parts.join('+') : '';
}

/** Nhãn khi chỉ có chuỗi element (ô “chữ có thành phần …”), không có cả nút cây. */
const CODED_ELEMENT_LABEL: Record<string, string> = {
  'CDP-8BC4': '白+小',
};

export function displayElement(key: string): string {
  return CODED_ELEMENT_LABEL[key] ?? (isCodedElement(key) ? '' : key);
}

const ATTRS: Record<string, keyof KanjiNode> = {
  'kvg:element': 'e',
  'kvg:original': 'o',
  'kvg:position': 'p',
  'kvg:radical': 'r',
  'kvg:phon': 'ph',
  'kvg:part': 'pt',
};

/** Đọc cây thành phần từ nội dung SVG KanjiVG. */
export function parseKanjiVgTree(svgText: string): KanjiNode | null {
  const start = svgText.indexOf('<g id="kvg:StrokePaths_');
  if (start < 0) return null;
  const end = svgText.indexOf('<g id="kvg:StrokeNumbers_');
  const body = svgText.slice(start, end < 0 ? undefined : end);

  const stack: Array<KanjiNode | null> = [];
  let root: KanjiNode | null = null;
  for (const m of body.matchAll(/<g\b[^>]*>|<\/g>|<path\b[^>]*\/?>/g)) {
    const tag = m[0];
    if (tag.startsWith('</g')) {
      stack.pop();
      continue;
    }
    if (tag.startsWith('<path')) {
      for (const node of stack) if (node) node.n += 1;
      continue;
    }
    const attrs: Record<string, string> = {};
    for (const a of tag.matchAll(/([\w:]+)="([^"]*)"/g)) attrs[a[1]!] = a[2]!;
    if (attrs.id?.startsWith('kvg:StrokePaths_')) {
      stack.push(null);
      continue;
    }
    const node: KanjiNode = { id: attrs.id?.replace(/^kvg:[0-9a-f]+-?/, '') ?? '', n: 0 };
    for (const [attr, key] of Object.entries(ATTRS)) {
      if (attrs[attr] != null) (node as unknown as Record<string, string>)[key] = attrs[attr]!;
    }
    const parent = stack[stack.length - 1];
    if (parent) (parent.c ??= []).push(node);
    else root ??= node;
    stack.push(node);
  }
  return root;
}

/** Thành phần trực tiếp có ý nghĩa: bỏ qua nhóm không có kvg:element (chỉ gom nét). */
export function meaningfulChildren(node: KanjiNode): KanjiNode[] {
  const out: KanjiNode[] = [];
  for (const child of node.c ?? []) {
    if (child.e) out.push(child);
    else out.push(...meaningfulChildren(child));
  }
  return out;
}

export interface KanjiLayout {
  symbol: string;
  label: string;
}

/** Kiểu bố cục của chữ, suy từ vị trí các thành phần cấp 1. */
export function kanjiLayout(root: KanjiNode): KanjiLayout | null {
  const positions = new Set((root.c ?? []).map((c) => c.p).filter(Boolean));
  const children = meaningfulChildren(root);
  if (positions.has('kamae')) return { symbol: '⿴', label: 'Bao quanh (構 かまえ)' };
  if (positions.has('tare')) return { symbol: '⿸', label: 'Che trên – trái (垂 たれ)' };
  if (positions.has('nyo')) return { symbol: '⿺', label: 'Bao dưới – trái (繞 にょう)' };
  if (positions.has('left') || positions.has('right')) {
    return children.length >= 3
      ? { symbol: '⿲', label: 'Trái – giữa – phải' }
      : { symbol: '⿰', label: 'Trái – phải (偏・旁)' };
  }
  if (positions.has('top') || positions.has('bottom')) {
    return children.length >= 3
      ? { symbol: '⿳', label: 'Trên – giữa – dưới' }
      : { symbol: '⿱', label: 'Trên – dưới (冠・脚)' };
  }
  if (children.length === 0) return { symbol: '◻', label: 'Chữ đơn (không tách được)' };
  return null;
}

/**
 * Các nhóm SVG cần tô sáng khi chọn một thành phần. Thành phần bị tách nhiều phần
 * (kvg:part) thì tô cả các phần còn lại.
 */
export function focusGroupIds(root: KanjiNode, node: KanjiNode): string[] {
  if (!node.pt || !node.e) return [node.id];
  const ids: string[] = [];
  const walk = (n: KanjiNode) => {
    if (n.e === node.e && n.pt) ids.push(n.id);
    n.c?.forEach(walk);
  };
  walk(root);
  return ids;
}

/** Thành phần → danh sách chữ chứa nó (tính cả dạng gốc 亻 → 人). */
export function buildReverseIndex(index: KanjiComponentIndex): Map<string, string[]> {
  const map = new Map<string, Set<string>>();
  for (const [char, root] of Object.entries(index)) {
    const walk = (n: KanjiNode) => {
      for (const key of [n.e, n.o]) {
        if (key && key !== char) {
          if (!map.has(key)) map.set(key, new Set());
          map.get(key)!.add(char);
        }
      }
      n.c?.forEach(walk);
    };
    root.c?.forEach(walk);
  }
  return new Map([...map].map(([k, v]) => [k, [...v]]));
}
