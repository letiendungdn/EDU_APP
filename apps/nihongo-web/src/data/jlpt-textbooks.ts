/**
 * Giáo trình tham khảo theo cấp — Minna no Nihongo, Sou Matome, Shinkanzen Master, TRY!, Kanji Look and Learn.
 * Nguồn: trang nhà xuất bản (ask-books.com, 3anet.co.jp, japantimes.co.jp) — kiểm tra lại khi NXB ra bản mới.
 */

import type { JlptMindKind, JlptMindLevel } from './jlpt-mind-map-shared';

export type JlptTextbookSeries = 'MINNA' | 'SOUMATOME' | 'SHINKANZEN' | 'TRY' | 'KLL';

export type JlptTextbook = {
  series: JlptTextbookSeries;
  /** Tên sách tiếng Nhật */
  title: string;
  note?: string;
  /** Không có link khi không có nơi bán chính thức (vd bản cộng đồng) */
  url?: string;
  kinds: JlptMindKind[];
};

export const JLPT_TEXTBOOK_SERIES: Record<
  JlptTextbookSeries,
  { name: string; nameJa: string; publisher: string; url: string; blurb: string }
> = {
  MINNA: {
    name: 'Minna no Nihongo',
    nameJa: 'みんなの日本語',
    publisher: 'スリーエーネットワーク',
    url: 'https://www.3anet.co.jp/np/list.html?q=%E3%81%BF%E3%82%93%E3%81%AA%E3%81%AE%E6%97%A5%E6%9C%AC%E8%AA%9E',
    blurb: 'Giáo trình chính: sơ cấp I (bài 1–25 ≈ N5), sơ cấp II (bài 26–50 ≈ N4), trung cấp I/II (≈ N3/N2). Bài 1–50 có sẵn trong app.',
  },
  SOUMATOME: {
    name: 'Sou Matome',
    nameJa: '日本語総まとめ',
    publisher: 'アスク出版',
    url: 'https://ask-books.com/somatome/',
    blurb: 'Lịch 6 tuần × 7 ngày, ~2 trang/ngày — hợp để ôn nhanh trước kỳ thi.',
  },
  SHINKANZEN: {
    name: 'Shinkanzen Master',
    nameJa: '新完全マスター',
    publisher: 'スリーエーネットワーク',
    url: 'https://www.3anet.co.jp/np/list.html?series_id=4',
    blurb: 'Giải thích kỹ, nhiều bài luyện — học sâu từng kỹ năng. Có từ N4 (không có N5).',
  },
  TRY: {
    name: 'TRY!',
    nameJa: '日本語能力試験 文法から伸ばす日本語',
    publisher: 'アスク出版 / ABK',
    url: 'https://ask-books.com/jlpt-try/',
    blurb: 'Học ngữ pháp qua ngữ cảnh hội thoại/đoạn văn; audio miễn phí, list từ vựng tải về.',
  },
  KLL: {
    name: 'Kanji Look and Learn',
    nameJa: 'イメージで覚える げんき な漢字512',
    publisher: 'The Japan Times',
    url: 'https://genki.japantimes.co.jp/kanji-look-and-learn_en',
    blurb:
      'Bản chính thức: 512 kanji N5–N3, 32 bài × 16 chữ (kanji bài 1–32 trong app theo đúng bộ này). N2–N1 chỉ có bản cộng đồng của Duy Triều (374 chữ), không phải của NXB.',
  },
};

/** Nhận diện mục của bộ sách trong "File nghe sách" (tiêu đề nhập tay, nhiều cách viết). */
export const TEXTBOOK_AUDIO_MATCH: Record<JlptTextbookSeries, RegExp | null> = {
  MINNA: /minna|みんなの日本語/i,
  SOUMATOME: /soumatome|sou\s*-?\s*matome|総まとめ/i,
  SHINKANZEN: /shin\s*-?\s*kanzen|新完全/i,
  TRY: /\btry\b/i,
  KLL: /look\s*(and|&)\s*learn/i,
};

const SM = JLPT_TEXTBOOK_SERIES.SOUMATOME.url;
const SK = JLPT_TEXTBOOK_SERIES.SHINKANZEN.url;
const TRY = JLPT_TEXTBOOK_SERIES.TRY.url;
const KLL = JLPT_TEXTBOOK_SERIES.KLL.url;
const MINNA = JLPT_TEXTBOOK_SERIES.MINNA.url;

const kllCommunity = (level: 'N2' | 'N1'): JlptTextbook => ({
  series: 'KLL',
  title: `Kanji Look and Learn ${level} (bản Duy Triều)`,
  note: 'sách cộng đồng VN, không phải Japan Times · 374 chữ N2–N1',
  kinds: ['KANJI'],
});

const TRY_GRAMMAR_COUNT: Record<JlptMindLevel, number> = { N5: 46, N4: 100, N3: 127, N2: 149, N1: 129 };

function upperLevelBooks(level: 'N3' | 'N2' | 'N1'): JlptTextbook[] {
  return [
    { series: 'SOUMATOME', title: `日本語総まとめ ${level} 文法`, url: SM, kinds: ['GRAMMAR'] },
    { series: 'SOUMATOME', title: `日本語総まとめ ${level} 語彙`, url: SM, kinds: ['VOCAB'] },
    { series: 'SOUMATOME', title: `日本語総まとめ ${level} 漢字`, url: SM, kinds: ['KANJI'] },
    { series: 'SOUMATOME', title: `日本語総まとめ ${level} 読解・聴解`, note: '2 cuốn riêng', url: SM, kinds: ['GRAMMAR'] },
    { series: 'SHINKANZEN', title: `新完全マスター文法 ${level}`, url: SK, kinds: ['GRAMMAR'] },
    { series: 'SHINKANZEN', title: `新完全マスター語彙 ${level}`, url: SK, kinds: ['VOCAB'] },
    { series: 'SHINKANZEN', title: `新完全マスター単語 ${level}`, note: 'sổ từ vựng theo chủ đề', url: SK, kinds: ['VOCAB'] },
    { series: 'SHINKANZEN', title: `新完全マスター漢字 ${level}`, url: SK, kinds: ['KANJI'] },
    { series: 'SHINKANZEN', title: `新完全マスター読解・聴解 ${level}`, note: '2 cuốn riêng', url: SK, kinds: ['GRAMMAR'] },
    { series: 'TRY', title: `TRY! ${level}`, note: `${TRY_GRAMMAR_COUNT[level]} mẫu ngữ pháp`, url: TRY, kinds: ['GRAMMAR'] },
    { series: 'TRY', title: `TRY! ${level} — list từ vựng`, note: 'tải miễn phí (EN/中文/VI)', url: TRY, kinds: ['VOCAB'] },
  ];
}

export const JLPT_TEXTBOOKS: Record<JlptMindLevel, JlptTextbook[]> = {
  N5: [
    { series: 'MINNA', title: 'みんなの日本語 初級I (bài 1–25)', note: 'kèm sách dịch & giải thích ngữ pháp', url: MINNA, kinds: ['GRAMMAR', 'VOCAB'] },
    {
      series: 'SOUMATOME',
      title: '日本語総まとめ N5（かんじ・ことば・ぶんぽう・読む・聞く）',
      note: '1 cuốn gộp 5 kỹ năng',
      url: SM,
      kinds: ['GRAMMAR', 'VOCAB', 'KANJI'],
    },
    { series: 'TRY', title: 'TRY! N5', note: '46 mẫu ngữ pháp', url: TRY, kinds: ['GRAMMAR'] },
    { series: 'TRY', title: 'TRY! N5 — list từ vựng', note: 'tải miễn phí (EN/中文/VI…)', url: TRY, kinds: ['VOCAB'] },
    { series: 'KLL', title: 'Kanji Look and Learn — Part 1 (第1〜10課)', note: '160 chữ N5 · có Workbook riêng', url: KLL, kinds: ['KANJI'] },
  ],
  N4: [
    { series: 'MINNA', title: 'みんなの日本語 初級II (bài 26–50)', note: 'kèm sách dịch & giải thích ngữ pháp', url: MINNA, kinds: ['GRAMMAR', 'VOCAB'] },
    { series: 'SOUMATOME', title: '日本語総まとめ N4 漢字・ことば', url: SM, kinds: ['VOCAB', 'KANJI'] },
    { series: 'SOUMATOME', title: '日本語総まとめ N4 文法・読解・聴解', url: SM, kinds: ['GRAMMAR'] },
    { series: 'SHINKANZEN', title: '新完全マスター文法 N4', url: 'https://www.3anet.co.jp/np/books/3606/', kinds: ['GRAMMAR'] },
    { series: 'SHINKANZEN', title: '新完全マスター語彙 N4', note: '~690 từ', url: 'https://www.3anet.co.jp/np/books/3636/', kinds: ['VOCAB'] },
    { series: 'SHINKANZEN', title: '新完全マスター単語 N4', url: SK, kinds: ['VOCAB'] },
    { series: 'SHINKANZEN', title: '新完全マスター漢字 N4', note: '278 chữ / 15 buổi', url: 'https://www.3anet.co.jp/np/books/3626/', kinds: ['KANJI'] },
    { series: 'SHINKANZEN', title: '新完全マスター読解・聴解 N4', note: '2 cuốn riêng', url: 'https://www.3anet.co.jp/np/books/3616/', kinds: ['GRAMMAR'] },
    { series: 'TRY', title: 'TRY! N4', note: '100 mẫu ngữ pháp', url: TRY, kinds: ['GRAMMAR'] },
    { series: 'TRY', title: 'TRY! N4 — list từ vựng', note: 'tải miễn phí (EN/中文/VI…)', url: TRY, kinds: ['VOCAB'] },
    { series: 'KLL', title: 'Kanji Look and Learn — Part 2 (第11〜20課)', note: '160 chữ N4 · có Workbook riêng', url: KLL, kinds: ['KANJI'] },
  ],
  N3: [
    { series: 'MINNA', title: 'みんなの日本語 中級I', note: 'app chưa có bài trung cấp', url: MINNA, kinds: ['GRAMMAR', 'VOCAB'] },
    ...upperLevelBooks('N3'),
    { series: 'KLL', title: 'Kanji Look and Learn — Part 3 (第21〜32課)', note: '192 chữ N3 · có Workbook riêng', url: KLL, kinds: ['KANJI'] },
  ],
  N2: [
    { series: 'MINNA', title: 'みんなの日本語 中級II', note: 'app chưa có bài trung cấp', url: MINNA, kinds: ['GRAMMAR', 'VOCAB'] },
    ...upperLevelBooks('N2'),
    kllCommunity('N2'),
  ],
  N1: [...upperLevelBooks('N1'), kllCommunity('N1')],
};

export function textbooksFor(level: JlptMindLevel, kind: JlptMindKind): JlptTextbook[] {
  return JLPT_TEXTBOOKS[level].filter((b) => b.kinds.includes(kind));
}
