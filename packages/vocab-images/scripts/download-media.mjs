/**
 * Tải ảnh OpenMoji, KanjiVG, vnjpclub về packages/vocab-images/media/
 * Chạy: node packages/vocab-images/scripts/download-media.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const MEDIA = path.join(ROOT, 'media');
const INDEX_TS = path.join(ROOT, 'src', 'index.ts');
const SEED_SQL = path.join(ROOT, '../../infra/postgres/nihongo-content-seed.sql');

const OPENMOJI_VERSION = '15.0.0';
const openmojiCdn = (code) =>
  `https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@${OPENMOJI_VERSION}/color/svg/${code.toUpperCase()}.svg`;

async function download(url, dest) {
  if (fs.existsSync(dest)) return 'skip';
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return 'ok';
}

function extractOpenmojiCodes() {
  const src = fs.readFileSync(INDEX_TS, 'utf8');
  const codes = new Set();
  for (const m of src.matchAll(/om(?:Flag)?\('([A-F0-9-]+)'\)/gi)) {
    codes.add(m[1].toUpperCase());
  }
  const sql = fs.existsSync(SEED_SQL) ? fs.readFileSync(SEED_SQL, 'utf8') : '';
  for (const m of sql.matchAll(/openmoji@[\d.]+\/color\/svg\/([A-F0-9-]+)\.svg/gi)) {
    codes.add(m[1].toUpperCase());
  }
  return [...codes];
}

function extractKanjiChars() {
  const chars = new Set();
  try {
    const out = execSync(
      'docker exec edu-postgres psql -U nihongo nihongo -t -A -c "SELECT DISTINCT \\"character\\" FROM \\"KanjiEntry\\""',
      { encoding: 'utf8' },
    );
    for (const line of out.split('\n')) {
      const c = line.trim();
      if (c) [...c].forEach((ch) => chars.add(ch));
    }
  } catch {
    console.warn('Không query được KanjiEntry — bỏ qua KanjiVG từ DB');
  }
  return [...chars];
}

/** Kana/kanji từ Vocabulary — nhiều từ lesson 1 (誰, だれ…) không có trong KanjiEntry */
function extractVocabStrokeChars() {
  const chars = new Set();

  const addFromText = (text) => {
    if (!text) return;
    for (const ch of text.replace(/[~～\s]/g, '')) {
      const code = ch.codePointAt(0) ?? 0;
      if (
        (code >= 0x3040 && code <= 0x309f) ||
        (code >= 0x30a0 && code <= 0x30ff) ||
        (code >= 0x4e00 && code <= 0x9fff)
      ) {
        chars.add(ch);
      }
    }
  };

  if (fs.existsSync(SEED_SQL)) {
    const sql = fs.readFileSync(SEED_SQL, 'utf8');
    for (const m of sql.matchAll(
      /INSERT INTO public\."Vocabulary"[\s\S]*?VALUES \(\d+, (NULL|'[^']*'), ('[^']*)'/g,
    )) {
      const kanji = m[1] === 'NULL' ? null : m[1].slice(1, -1);
      const kana = m[2].slice(1, -1);
      addFromText(kanji);
      addFromText(kana);
    }
  }

  try {
    const out = execSync(
      `docker exec edu-postgres psql -U nihongo nihongo -t -A -c "SELECT DISTINCT kanji, kana FROM \\"Vocabulary\\" WHERE kanji IS NOT NULL OR kana IS NOT NULL"`,
      { encoding: 'utf8' },
    );
    for (const line of out.split('\n')) {
      const [kanji, kana] = line.split('|');
      addFromText(kanji);
      addFromText(kana);
    }
  } catch {
    /* seed sql fallback */
  }

  return [...chars];
}

function extractKanaChartChars() {
  const chars = new Set();

  if (fs.existsSync(SEED_SQL)) {
    const sql = fs.readFileSync(SEED_SQL, 'utf8');
    for (const m of sql.matchAll(
      /INSERT INTO public\."KanaCell"[\s\S]*?VALUES \(\d+, \d+, \d+, \d+, '([^']*)', '[^']*'\)/g,
    )) {
      for (const ch of m[1] ?? '') chars.add(ch);
    }
  }

  try {
    const out = execSync(
      `docker exec edu-postgres psql -U nihongo nihongo -t -A -c "SELECT DISTINCT kana FROM \\"KanaCell\\""`,
      { encoding: 'utf8' },
    );
    for (const line of out.split('\n')) {
      for (const ch of line.trim()) chars.add(ch);
    }
  } catch {
    /* seed sql fallback */
  }

  return [...chars];
}

function extractKanjiMnemonicUrls() {
  const urls = new Set();
  if (!fs.existsSync(SEED_SQL)) return [];
  const sql = fs.readFileSync(SEED_SQL, 'utf8');
  for (const m of sql.matchAll(/https:\/\/www\.vnjpclub\.com\/images\/[^'"]+/g)) {
    urls.add(m[0]);
  }
  try {
    const out = execSync(
      `docker exec edu-postgres psql -U nihongo nihongo -t -A -c "SELECT DISTINCT \\"imageUrl\\" FROM \\"KanjiEntry\\" WHERE \\"imageUrl\\" IS NOT NULL"`,
      { encoding: 'utf8' },
    );
    for (const line of out.split('\n')) {
      const u = line.trim();
      if (u.startsWith('http')) urls.add(u);
    }
  } catch {
    /* seed sql fallback */
  }
  return [...urls];
}

function kanjiMnemonicDest(url) {
  const m = url.match(/vnjpclub\.com\/images\/(.+?)(?:\?.*)?$/i);
  if (!m) return null;
  return path.join(MEDIA, 'kanji', m[1]);
}

async function main() {
  let ok = 0;
  let skip = 0;
  let fail = 0;

  console.log('OpenMoji...');
  for (const code of extractOpenmojiCodes()) {
    const dest = path.join(MEDIA, 'openmoji', `${code}.svg`);
    try {
      const r = await download(openmojiCdn(code), dest);
      if (r === 'skip') skip++;
      else ok++;
    } catch (e) {
      console.warn(`  miss ${code}:`, e.message);
      fail++;
    }
  }

  console.log('KanjiVG...');
  const strokeChars = new Set([
    ...extractKanjiChars(),
    ...extractVocabStrokeChars(),
    ...extractKanaChartChars(),
  ]);
  for (const char of strokeChars) {
    const hex = char.codePointAt(0).toString(16).padStart(5, '0');
    const dest = path.join(MEDIA, 'kanjivg', `${hex}.svg`);
    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;
    try {
      const r = await download(url, dest);
      if (r === 'skip') skip++;
      else ok++;
    } catch {
      fail++;
    }
  }

  console.log('Kanji mnemonic (vnjpclub)...');
  for (const url of extractKanjiMnemonicUrls()) {
    const dest = kanjiMnemonicDest(url);
    if (!dest) continue;
    try {
      const r = await download(url, dest);
      if (r === 'skip') skip++;
      else ok++;
    } catch (e) {
      console.warn(`  miss ${url}:`, e.message);
      fail++;
    }
  }

  console.log(`Done: ${ok} tải mới, ${skip} đã có, ${fail} lỗi`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
