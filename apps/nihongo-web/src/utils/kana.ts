import type { KanaCell, KanaChartItem, KanaSection } from '../types/reference';

export function flattenKanaSections(sections: KanaSection[]): KanaCell[] {
  return sections.flatMap((section) => section.rows.flat());
}

export function kanaChartToItems(chart: KanaCell[]): KanaChartItem[] {
  return chart
    .filter((item) => item.kana)
    .map((item) => ({
      speakText: item.kana,
      display: item.kana,
      romaji: item.romaji,
      hint: `Romaji: ${item.romaji}`,
    }));
}
