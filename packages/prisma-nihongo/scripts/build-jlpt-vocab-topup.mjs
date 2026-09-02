/**
 * Top-up từ vựng còn thiếu (N5–N2 vài từ, N1 ~1350) từ elzup/jlpt-word-list CSV.
 * Run: node scripts/build-jlpt-vocab-topup.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const tmp = path.join(__dirname, '_tmp');

const NEED = { N5: 0, N4: 0, N3: 0, N2: 0, N1: 281 };
const LESSON_START = { N5: 900, N4: 910, N3: 920, N2: 930, N1: 1000 };
const WORDS_PER_LESSON = 22;

const CSV_URL =
  'https://raw.githubusercontent.com/elzup/jlpt-word-list/master/src';

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      resolve();
      return;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          fs.unlinkSync(dest);
          download(res.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', reject);
  });
}

async function ensureCsv() {
  for (const lv of ['n5', 'n4', 'n3', 'n2', 'n1']) {
    await download(`${CSV_URL}/${lv}.csv`, path.join(tmp, `elzup-${lv}.csv`));
  }
  await download(`${CSV_URL.replace('/src', '/out')}/all.min.csv`, path.join(tmp, 'elzup-all.min.csv'));
}

function parseMinCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const [expression, reading] = lines[i].split(',');
    if (!reading) continue;
    rows.push({
      kanji: expression && /[\u4e00-\u9faf]/.test(expression) ? expression.trim() : undefined,
      kana: reading.trim().normalize('NFC'),
      romaji: reading.trim().normalize('NFC'),
      meaning: (expression ?? reading).trim(),
      partOfSpeech: 'danh từ',
    });
  }
  return rows;
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].match(/("(?:[^"]|"")*"|[^,]*)(?:,|$)/g);
    if (!cols || cols.length < 3) continue;
    const clean = cols.map((c) => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
    const [expression, reading, meaning] = clean;
    if (!reading) continue;
    rows.push({
      kanji: /[\u4e00-\u9faf]/.test(expression ?? '') ? expression : undefined,
      kana: reading.normalize('NFC'),
      romaji: reading.normalize('NFC'),
      meaning: (meaning ?? expression ?? reading).slice(0, 120),
      partOfSpeech: 'danh từ',
    });
  }
  return rows;
}

async function loadExistingKana() {
  const kana = new Set();
  for (const f of fs.readdirSync(root)) {
    if (!f.endsWith('.data.ts') && !f.endsWith('.ts')) continue;
    if (!f.includes('vocab') && !f.includes('Vocab')) continue;
    const text = fs.readFileSync(path.join(root, f), 'utf8');
    for (const m of text.matchAll(/kana:\s*['"]([^'"]+)['"]/g)) kana.add(m[1]);
  }
  const url = process.env.DATABASE_URL;
  if (url) {
    try {
      const { PrismaClient } = await import('../generated/client/index.js');
      const prisma = new PrismaClient();
      const rows = await prisma.vocabulary.findMany({ select: { kana: true } });
      await prisma.$disconnect();
      rows.forEach((r) => kana.add(r.kana));
    } catch {
      /* ignore */
    }
  }
  return kana;
}

function chunk(level, words) {
  const units = [];
  const start = LESSON_START[level];
  for (let i = 0; i < words.length; i += WORDS_PER_LESSON) {
    units.push({
      lessonNumber: start + Math.floor(i / WORDS_PER_LESSON),
      jlptLevel: level,
      words: words.slice(i, i + WORDS_PER_LESSON),
    });
  }
  return units;
}

function serialize(units) {
  return units
    .map(
      (u) => `  {
    lessonNumber: ${u.lessonNumber},
    jlptLevel: '${u.jlptLevel}',
    words: [
      ${u.words
        .map((w) => {
          const p = [
            w.kanji ? `kanji: ${JSON.stringify(w.kanji)}` : null,
            `kana: ${JSON.stringify(w.kana)}`,
            `romaji: ${JSON.stringify(w.romaji)}`,
            `meaning: ${JSON.stringify(w.meaning)}`,
            w.partOfSpeech ? `partOfSpeech: ${JSON.stringify(w.partOfSpeech)}` : null,
          ].filter(Boolean);
          return `{ ${p.join(', ')} }`;
        })
        .join(',\n      ')}
    ],
  }`,
    )
    .join(',\n');
}

async function main() {
  await ensureCsv();
  const existing = await loadExistingKana();
  console.log(`Existing kana: ${existing.size}`);

  const levelCsv = { N5: 'elzup-n5.csv', N4: 'elzup-n4.csv', N3: 'elzup-n3.csv', N2: 'elzup-n2.csv', N1: 'elzup-n1.csv' };
  const allUnits = [];
  let total = 0;

  for (const [level, file] of Object.entries(levelCsv)) {
    if (NEED[level] <= 0) continue;
    const text = fs.readFileSync(path.join(tmp, file), 'utf8');
    const rows = parseCsv(text);
    const picked = [];
    for (const row of rows) {
      if (picked.length >= NEED[level]) break;
      if (existing.has(row.kana)) continue;
      existing.add(row.kana);
      picked.push(row);
    }
    console.log(`${level}: ${picked.length}/${NEED[level]} (from ${file})`);
    allUnits.push(...chunk(level, picked));
    total += picked.length;
  }

  // N1 bù thêm từ all.min.csv nếu còn thiếu
  if (NEED.N1 > 0) {
    const already = allUnits.filter((u) => u.jlptLevel === 'N1').reduce((s, u) => s + u.words.length, 0);
    const stillNeed = NEED.N1 - already;
    if (stillNeed > 0 && fs.existsSync(path.join(tmp, 'elzup-all.min.csv'))) {
      const rows = parseMinCsv(fs.readFileSync(path.join(tmp, 'elzup-all.min.csv'), 'utf8'));
      const picked = [];
      for (const row of rows) {
        if (picked.length >= stillNeed) break;
        if (existing.has(row.kana)) continue;
        existing.add(row.kana);
        picked.push(row);
      }
      console.log(`N1 extra: ${picked.length}/${stillNeed} (from all.min.csv)`);
      allUnits.push(...chunk('N1', picked));
      total += picked.length;
    }
  }

  const out = `// AUTO-GENERATED — node scripts/build-jlpt-vocab-topup.mjs
// Nguồn: elzup/jlpt-word-list CSV
import type { JlptVocabUnit } from './jlpt-vocab.data';

export const JLPT_VOCAB_GAP_TOPUP: JlptVocabUnit[] = [
${serialize(allUnits)}
];
`;
  fs.writeFileSync(path.join(root, 'jlpt-vocab-gap-topup.data.ts'), out, 'utf8');
  console.log(`Wrote topup: ${total} words, ${allUnits.length} lessons`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
