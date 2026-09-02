/**
 * Sinh jlpt-grammar-gap-fill.data.ts — bù gap ngữ pháp JLPT.
 * Chạy: npx tsx scripts/generate-jlpt-grammar-gap-fill.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import type { JlptGrammarItem, JlptGrammarLevel, JlptGrammarUnit } from '../jlpt-grammar.data';

type Level = JlptGrammarLevel;
/** [pattern, meaning, formality, explanation?, jp1, romaji1, vi1, jp2, romaji2, vi2] */
type Row = [string, string, string, string?, string, string, string, string, string, string];

function item(r: Row): JlptGrammarItem {
  const [pattern, meaning, formalityLevel, explanation, jp1, ro1, vi1, jp2, ro2, vi2] = r;
  return {
    pattern,
    meaning,
    formalityLevel,
    ...(explanation ? { explanation } : {}),
    examples: [
      { jp: jp1, romaji: ro1, vi: vi1 },
      { jp: jp2, romaji: ro2, vi: vi2 },
    ],
  };
}

function distribute(
  level: Level,
  patterns: Row[],
  lessonStart: number,
  lessonEnd: number,
  titlePrefix: string,
  baiOffset: number,
): JlptGrammarUnit[] {
  const lessonCount = lessonEnd - lessonStart + 1;
  const base = Math.floor(patterns.length / lessonCount);
  let extra = patterns.length % lessonCount;
  const units: JlptGrammarUnit[] = [];
  let idx = 0;
  for (let ln = lessonStart; ln <= lessonEnd; ln++) {
    const count = base + (extra > 0 ? 1 : 0);
    if (extra > 0) extra--;
    if (count === 0) continue;
    const items = patterns.slice(idx, idx + count).map(item);
    idx += count;
    units.push({
      lessonNumber: ln,
      jlptLevel: level,
      title: `${titlePrefix} (bài ${ln - baiOffset})`,
      sortOrder: ln * 10,
      items,
    });
  }
  if (idx !== patterns.length) throw new Error(`${level}: expected ${patterns.length}, used ${idx}`);
  return units;
}

function fmtUnit(u: JlptGrammarUnit, indent: string): string {
  const lines: string[] = [];
  lines.push(`${indent}{`);
  lines.push(`${indent}  lessonNumber: ${u.lessonNumber},`);
  lines.push(`${indent}  jlptLevel: '${u.jlptLevel}',`);
  lines.push(`${indent}  title: '${u.title}',`);
  lines.push(`${indent}  sortOrder: ${u.sortOrder},`);
  lines.push(`${indent}  items: [`);
  for (const it of u.items) {
    lines.push(`${indent}    {`);
    lines.push(`${indent}      pattern: ${JSON.stringify(it.pattern)},`);
    lines.push(`${indent}      meaning: ${JSON.stringify(it.meaning)},`);
    if (it.explanation) lines.push(`${indent}      explanation: ${JSON.stringify(it.explanation)},`);
    lines.push(`${indent}      formalityLevel: ${JSON.stringify(it.formalityLevel)},`);
    lines.push(`${indent}      examples: [`);
    for (const ex of it.examples) {
      lines.push(`${indent}        { jp: ${JSON.stringify(ex.jp)}, romaji: ${JSON.stringify(ex.romaji)}, vi: ${JSON.stringify(ex.vi)} },`);
    }
    lines.push(`${indent}      ],`);
    lines.push(`${indent}    },`);
  }
  lines.push(`${indent}  ],`);
  lines.push(`${indent}},`);
  return lines.join('\n');
}

// Pattern banks imported from companion module (keeps generator readable)
import { N5_ROWS, N4_ROWS, N3_ROWS, N2_ROWS, N1_ROWS } from './jlpt-grammar-gap-fill-banks';

function main() {
  const units: JlptGrammarUnit[] = [
    ...distribute('N5', N5_ROWS, 102, 109, 'N5 · Ngữ pháp bổ sung', 101),
    ...distribute('N4', N4_ROWS, 112, 118, 'N4 · Ngữ pháp bổ sung', 111),
    ...distribute('N3', N3_ROWS, 312, 316, 'N3 · Ngữ pháp bổ sung', 311),
    ...distribute('N2', N2_ROWS, 418, 419, 'N2 · Ngữ pháp bổ sung', 417),
    ...distribute('N1', N1_ROWS, 515, 523, 'N1 · Ngữ pháp bổ sung', 514),
  ];
  const total = units.reduce((s, u) => s + u.items.length, 0);
  if (total !== 238) throw new Error(`Expected 238 patterns, got ${total}`);

  const body = units.map((u) => fmtUnit(u, '  ')).join('\n');
  const out = `// Ngữ pháp JLPT bổ sung — bù gap theo jlpt-targets.ts
// Tổng: ${total} mẫu (N5×64, N4×58, N3×39, N2×7, N1×70)

import type { JlptGrammarUnit } from './jlpt-grammar.data';

export const JLPT_GRAMMAR_GAP_FILL: JlptGrammarUnit[] = [
${body}
];
`;
  const outPath = path.join(__dirname, '..', 'jlpt-grammar-gap-fill.data.ts');
  fs.writeFileSync(outPath, out, 'utf8');
  console.log(`Wrote ${outPath} (${total} patterns, ${units.length} units)`);
}

main();
