import { kanjivgHex, kanjivgStrokeFetchUrls } from '@edu/vocab-images';
import type { KanjiComponentIndex } from './kanji-structure';

const INDEX_URL = '/media/kanji-components.json';
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji';

let indexPromise: Promise<KanjiComponentIndex> | null = null;

/** Chỉ mục cấu tạo sinh từ SVG local (scripts/build-kanji-components.mjs). */
export function loadComponentIndex(): Promise<KanjiComponentIndex> {
  indexPromise ??= fetch(INDEX_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<KanjiComponentIndex>;
    })
    .catch((err) => {
      indexPromise = null;
      throw err;
    });
  return indexPromise;
}

/** SVG KanjiVG của một chữ: file local trước, không có thì tải từ CDN của KanjiVG. */
export async function fetchKanjiSvg(char: string): Promise<string | null> {
  const urls = [...kanjivgStrokeFetchUrls(char), `${CDN_BASE}/${kanjivgHex(char)}.svg`];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        if (text.includes('kvg:StrokePaths_')) return text;
      }
    } catch {
      /* thử nguồn tiếp theo */
    }
  }
  return null;
}
