/**
 * Sinh jlpt-vocab-gap-fill.data.ts từ OpenJLPT vocab JSON.
 * Tải JSON nếu chưa có, lọc trùng với seed hiện có, bù gap theo jlpt-targets.
 *
 * Run: node scripts/build-jlpt-vocab-gap-fill.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const tmp = path.join(__dirname, '_tmp');

const NEED_PER_LEVEL = { N5: 142, N4: 167, N3: 1367, N2: 769, N1: 3679 };
const LESSON_START = { N5: 220, N4: 230, N3: 340, N2: 461, N1: 580 };
const WORDS_PER_LESSON = 22;

const VOCAB_URL =
  'https://raw.githubusercontent.com/evanclan/OpenJLPT/main/data/json/vocab';

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
        if (res.statusCode === 302 || res.statusCode === 301) {
          file.close();
          fs.unlinkSync(dest);
          download(res.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', reject);
  });
}

async function ensureVocabJson() {
  for (const lv of ['n5', 'n4', 'n3', 'n2', 'n1']) {
    await download(`${VOCAB_URL}/${lv}.json`, path.join(tmp, `vocab-${lv}.json`));
  }
}

function loadExistingKana() {
  const kana = new Set();
  const files = [
    'jlpt-vocab.data.ts',
    'jlpt-vocab-expand.data.ts',
    'jlpt-vocab-expand-extra.data.ts',
    'jlpt-vocab-expand-extra-tail.data.ts',
  ];
  for (const f of files) {
    const p = path.join(root, f);
    if (!fs.existsSync(p)) continue;
    const text = fs.readFileSync(p, 'utf8');
    for (const m of text.matchAll(/kana:\s*['"]([^'"]+)['"]/g)) kana.add(m[1]);
  }
  return kana;
}

/** Rough romaji from hiragana/katakana reading */
function toRomaji(reading) {
  // keep as-is for seed; OpenJLPT reading is kana — use reading as romaji fallback
  return reading
    .replace(/[\u3040-\u309f\u30a0-\u30ff]/g, (ch) => ch)
    .normalize('NFC');
}

/** English → Vietnamese gloss (best-effort, giữ nguyên nếu không map) */
const EN_VI = {
  to: 'để',
  eat: 'ăn',
  drink: 'uống',
  go: 'đi',
  come: 'đến',
  see: 'nhìn, thấy',
  hear: 'nghe',
  speak: 'nói',
  read: 'đọc',
  write: 'viết',
  buy: 'mua',
  sell: 'bán',
  work: 'làm việc',
  study: 'học',
  person: 'người',
  thing: 'vật',
  time: 'thời gian',
  day: 'ngày',
  year: 'năm',
  month: 'tháng',
  week: 'tuần',
  money: 'tiền',
  water: 'nước',
  food: 'thức ăn',
  house: 'nhà',
  school: 'trường học',
  company: 'công ty',
  country: 'đất nước',
  city: 'thành phố',
  friend: 'bạn',
  family: 'gia đình',
  child: 'trẻ em',
  man: 'đàn ông',
  woman: 'phụ nữ',
  big: 'to, lớn',
  small: 'nhỏ',
  good: 'tốt',
  bad: 'xấu, tệ',
  new: 'mới',
  old: 'cũ',
  hot: 'nóng',
  cold: 'lạnh',
  high: 'cao',
  low: 'thấp',
  long: 'dài',
  short: 'ngắn',
  important: 'quan trọng',
  necessary: 'cần thiết',
  possible: 'có thể',
  reason: 'lý do',
  result: 'kết quả',
  problem: 'vấn đề',
  method: 'phương pháp',
  situation: 'tình hình',
  society: 'xã hội',
  economy: 'kinh tế',
  politics: 'chính trị',
  culture: 'văn hóa',
  nature: 'tự nhiên',
  environment: 'môi trường',
  development: 'phát triển',
  increase: 'tăng',
  decrease: 'giảm',
  change: 'thay đổi',
  influence: 'ảnh hưởng',
  relationship: 'quan hệ',
  opinion: 'ý kiến',
  thought: 'suy nghĩ',
  feeling: 'cảm giác',
  experience: 'kinh nghiệm',
  knowledge: 'kiến thức',
  ability: 'khả năng',
  responsibility: 'trách nhiệm',
  permission: 'sự cho phép',
  prohibition: 'sự cấm',
  request: 'yêu cầu',
  agreement: 'thỏa thuận',
  opposition: 'phản đối',
  support: 'ủng hộ',
  opposition2: 'phản đối',
};

function enToVi(en) {
  const key = en.toLowerCase().replace(/[^a-z ]/g, '').trim().split(/\s+/)[0];
  return EN_VI[key] ?? en;
}

function meaningVi(entry) {
  const ms = entry.meanings ?? [];
  if (!ms.length) return entry.word ?? entry.reading ?? '?';
  return ms.slice(0, 3).map(enToVi).join('; ');
}

function hasKanji(s) {
  return /[\u4e00-\u9faf]/.test(s);
}

function pickWords(level, json, existingKana, need) {
  const out = [];
  const used = new Set();
  for (const entry of json) {
    if (out.length >= need) break;
    const kana = (entry.reading ?? '').normalize('NFC');
    const word = (entry.word ?? '').normalize('NFC');
    if (!kana || used.has(kana) || existingKana.has(kana)) continue;
    used.add(kana);
    existingKana.add(kana);
    const ex = entry.examples?.[0];
    out.push({
      kanji: hasKanji(word) ? word : undefined,
      kana,
      romaji: toRomaji(kana),
      meaning: meaningVi(entry),
      partOfSpeech: 'danh từ',
      exampleJa: ex?.ja ?? null,
      exampleKana: ex?.ja ?? null,
      exampleVi: ex?.en ? enToVi(ex.en) : null,
    });
  }
  return out;
}

function chunkUnits(level, words) {
  const start = LESSON_START[level];
  const units = [];
  for (let i = 0; i < words.length; i += WORDS_PER_LESSON) {
    const idx = Math.floor(i / WORDS_PER_LESSON);
    units.push({
      lessonNumber: start + idx,
      jlptLevel: level,
      words: words.slice(i, i + WORDS_PER_LESSON),
    });
  }
  return units;
}

function serializeWord(w) {
  const parts = [];
  if (w.kanji) parts.push(`kanji: ${JSON.stringify(w.kanji)}`);
  parts.push(`kana: ${JSON.stringify(w.kana)}`);
  parts.push(`romaji: ${JSON.stringify(w.romaji)}`);
  parts.push(`meaning: ${JSON.stringify(w.meaning)}`);
  if (w.partOfSpeech) parts.push(`partOfSpeech: ${JSON.stringify(w.partOfSpeech)}`);
  if (w.exampleJa) parts.push(`exampleJa: ${JSON.stringify(w.exampleJa)}`);
  if (w.exampleKana) parts.push(`exampleKana: ${JSON.stringify(w.exampleKana)}`);
  if (w.exampleVi) parts.push(`exampleVi: ${JSON.stringify(w.exampleVi)}`);
  return `{ ${parts.join(', ')} }`;
}

function serializeUnits(units) {
  return units
    .map(
      (u) => `  {
    lessonNumber: ${u.lessonNumber},
    jlptLevel: '${u.jlptLevel}',
    words: [
      ${u.words.map((w) => serializeWord(w)).join(',\n      ')}
    ],
  }`,
    )
    .join(',\n');
}

async function loadExistingKanaFromDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return new Set();
  try {
    const { PrismaClient } = await import('../generated/client/index.js');
    const prisma = new PrismaClient();
    const rows = await prisma.vocabulary.findMany({ select: { kana: true } });
    await prisma.$disconnect();
    return new Set(rows.map((r) => r.kana));
  } catch (e) {
    console.warn('DB kana load skipped:', e.message);
    return new Set();
  }
}

async function main() {
  await ensureVocabJson();
  const existingKana = loadExistingKana();
  const dbKana = await loadExistingKanaFromDb();
  for (const k of dbKana) existingKana.add(k);
  console.log(`Existing kana (seed files + DB): ${existingKana.size}`);

  const levelFiles = {
    N5: 'vocab-n5.json',
    N4: 'vocab-n4.json',
    N3: 'vocab-n3.json',
    N2: 'vocab-n2.json',
    N1: 'vocab-n1.json',
  };

  /** Pool thêm khi level thiếu sau lọc trùng */
  const overflowPool = {
    N5: ['vocab-n4.json'],
    N4: ['vocab-n5.json'],
    N3: ['vocab-n2.json'],
    N2: ['vocab-n3.json', 'vocab-n1.json'],
    N1: ['vocab-n2.json', 'vocab-n3.json', 'vocab-n4.json', 'vocab-n5.json'],
  };

  const allUnits = [];
  let total = 0;
  for (const [level, file] of Object.entries(levelFiles)) {
    const json = JSON.parse(fs.readFileSync(path.join(tmp, file), 'utf8'));
    let words = pickWords(level, json, existingKana, NEED_PER_LEVEL[level]);
    if (words.length < NEED_PER_LEVEL[level] && overflowPool[level]) {
      for (const extraFile of overflowPool[level]) {
        if (words.length >= NEED_PER_LEVEL[level]) break;
        const extra = JSON.parse(fs.readFileSync(path.join(tmp, extraFile), 'utf8'));
        const more = pickWords(
          level,
          extra,
          existingKana,
          NEED_PER_LEVEL[level] - words.length,
        );
        words = [...words, ...more];
      }
    }
    console.log(`${level}: picked ${words.length}/${NEED_PER_LEVEL[level]} from OpenJLPT`);
    const units = chunkUnits(level, words);
    allUnits.push(...units);
    total += words.length;
  }

  const out = `// AUTO-GENERATED — node scripts/build-jlpt-vocab-gap-fill.mjs
// Nguồn: OpenJLPT (https://github.com/evanclan/OpenJLPT) — vocab JSON
import type { JlptVocabUnit } from './jlpt-vocab.data';

export const JLPT_VOCAB_GAP_FILL: JlptVocabUnit[] = [
${serializeUnits(allUnits)}
];
`;

  const outPath = path.join(root, 'jlpt-vocab-gap-fill.data.ts');
  fs.writeFileSync(outPath, out, 'utf8');
  console.log(`Wrote ${outPath}: ${total} words, ${allUnits.length} lessons`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
