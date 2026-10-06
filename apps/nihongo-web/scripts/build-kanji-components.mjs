// Đọc các SVG KanjiVG trong public/media/kanjivg → public/media/kanji-components.json
// (cây thành phần của từng chữ, dùng cho trang /kanji/structure).
// Chạy lại sau khi thêm SVG mới: node scripts/build-kanji-components.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svgDir = join(root, 'public', 'media', 'kanjivg');
const outFile = join(root, 'public', 'media', 'kanji-components.json');

// Thuộc tính KanjiVG → khoá rút gọn trong JSON
const ATTRS = {
  'kvg:element': 'e',
  'kvg:original': 'o',
  'kvg:position': 'p',
  'kvg:radical': 'r',
  'kvg:phon': 'ph',
  'kvg:part': 'pt',
  'kvg:partial': 'pa',
  'kvg:variant': 'v',
};

function parseAttrs(tag) {
  const attrs = {};
  for (const m of tag.matchAll(/([\w:]+)="([^"]*)"/g)) attrs[m[1]] = m[2];
  return attrs;
}

function parseSvg(text) {
  const start = text.indexOf('<g id="kvg:StrokePaths_');
  const end = text.indexOf('<g id="kvg:StrokeNumbers_');
  if (start < 0) return null;
  const body = text.slice(start, end < 0 ? undefined : end);

  const stack = [];
  let root = null;
  let strokes = 0;
  for (const m of body.matchAll(/<g\b[^>]*>|<\/g>|<path\b[^>]*\/?>/g)) {
    const tag = m[0];
    if (tag.startsWith('</g')) {
      stack.pop();
    } else if (tag.startsWith('<g')) {
      const a = parseAttrs(tag);
      if (a.id?.startsWith('kvg:StrokePaths_')) {
        stack.push(null);
        continue;
      }
      const node = { id: a.id?.replace(/^kvg:[0-9a-f]+-?/, '') ?? '', n: 0, c: [] };
      for (const [k, short] of Object.entries(ATTRS)) {
        if (a[k] != null) node[short] = a[k] === 'true' ? 1 : a[k];
      }
      const parent = stack[stack.length - 1];
      if (parent) parent.c.push(node);
      else if (!root) root = node;
      stack.push(node);
    } else {
      strokes += 1;
      for (const node of stack) if (node) node.n += 1;
    }
  }
  if (!root) return null;
  prune(root);
  return { root, strokes };
}

function prune(node) {
  for (const child of node.c) prune(child);
  if (node.c.length === 0) delete node.c;
}

const result = {};
for (const file of readdirSync(svgDir).sort()) {
  if (!file.endsWith('.svg') || file.includes('-')) continue;
  const cp = Number.parseInt(file.replace('.svg', ''), 16);
  if (!Number.isFinite(cp)) continue;
  const char = String.fromCodePoint(cp);
  // Chỉ lấy kanji (CJK), bỏ kana
  if (!/\p{Script=Han}/u.test(char)) continue;
  const parsed = parseSvg(readFileSync(join(svgDir, file), 'utf8'));
  if (parsed) result[char] = parsed.root;
}

writeFileSync(outFile, JSON.stringify(result));
console.log(`kanji-components.json: ${Object.keys(result).length} chữ`);
