import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildReverseIndex,
  componentLabel,
  componentParts,
  displayElement,
  focusGroupIds,
  kanjiLayout,
  meaningfulChildren,
  parseKanjiVgTree,
  type KanjiComponentIndex,
} from '../utils/kanji-structure';

const svgDir = join(__dirname, '../../public/media/kanjivg');
const svg = (hex: string) => readFileSync(join(svgDir, `${hex}.svg`), 'utf8');

describe('kanji-structure', () => {
  it('đọc cây 語 = 言 (trái, bộ thủ) + 吾 (phải, gợi âm)', () => {
    const root = parseKanjiVgTree(svg('08a9e'))!;
    expect(root.e).toBe('語');
    expect(root.n).toBe(14);
    const [left, right] = meaningfulChildren(root);
    expect(left).toMatchObject({ e: '言', p: 'left', r: 'general', n: 7 });
    expect(right).toMatchObject({ e: '吾', p: 'right', ph: '吾', n: 7 });
    expect(kanjiLayout(root)?.symbol).toBe('⿰');
  });

  it('nhận diện bố cục bao quanh / che trên – trái / bao dưới – trái', () => {
    expect(kanjiLayout(parseKanjiVgTree(svg('0805e'))!)?.symbol).toBe('⿴'); // 聞
    expect(kanjiLayout(parseKanjiVgTree(svg('075c5'))!)?.symbol).toBe('⿸'); // 病
    expect(kanjiLayout(parseKanjiVgTree(svg('09053'))!)?.symbol).toBe('⿺'); // 道
  });

  it('tô sáng đủ các phần của thành phần bị tách (亠 trong 主)', () => {
    const root = parseKanjiVgTree(svg('04e3b'))!;
    const part1 = root.c!.find((c) => c.e === '亠')!;
    expect(focusGroupIds(root, part1)).toEqual(['g1', 'g4']);
  });

  it('mã CHISE trong 原 hiện thành 白 trên 小, không in CDP-8BC4', () => {
    const root = parseKanjiVgTree(svg('0539f'))!;
    const inner = meaningfulChildren(root).find((c) => c.e === 'CDP-8BC4')!;
    expect(componentParts(inner)).toEqual(['白', '小']);
    expect(componentLabel(inner)).toBe('白+小');
    expect(displayElement('CDP-8BC4')).toBe('白+小');
    expect(componentLabel(meaningfulChildren(root)[0]!)).toBe('厂');
  });

  it('tra ngược thành phần → các chữ chứa nó', () => {
    const index: KanjiComponentIndex = {
      '語': parseKanjiVgTree(svg('08a9e'))!,
      '主': parseKanjiVgTree(svg('04e3b'))!,
    };
    const rev = buildReverseIndex(index);
    expect(rev.get('言')).toEqual(['語']);
    expect(rev.get('口')).toEqual(['語']);
    expect(rev.get('玉')).toEqual(['主']); // dạng gốc của 王
  });
});
