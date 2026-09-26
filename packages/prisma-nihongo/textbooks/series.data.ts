/**
 * Danh mục giáo trình tham khảo (bảng TextbookSeries / TextbookBook) — dữ liệu seed.
 * Minna no Nihongo, Sou Matome, Shinkanzen Master, TRY!, Kanji Look and Learn.
 * Nguồn: trang nhà xuất bản (ask-books.com, 3anet.co.jp, japantimes.co.jp) — kiểm tra lại khi NXB ra bản mới.
 */

type Level = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
type Kind = 'GRAMMAR' | 'VOCAB' | 'KANJI';
export type SeriesCode = 'MINNA' | 'SOUMATOME' | 'SHINKANZEN' | 'TRY' | 'KLL';

export type SeriesSeed = {
  code: SeriesCode;
  name: string;
  nameJa: string;
  publisher: string;
  url: string;
  blurb: string;
  /** Ký tự hiển thị ở menu */
  icon: string;
  /** Các cấp có lộ trình học trong app */
  planLevels: Level[];
  /** Regex (không có dấu /) nhận diện mục của bộ sách trong "File nghe sách"; khớp không phân biệt hoa thường */
  audioMatch: string | null;
};

export type BookSeed = {
  series: SeriesCode;
  level: Level;
  title: string;
  note?: string;
  /** Không có link khi không có nơi bán chính thức (vd bản cộng đồng) */
  url?: string;
  kinds: Kind[];
};

export const TEXTBOOK_SERIES: SeriesSeed[] = [
  {
    code: 'MINNA',
    name: 'Minna no Nihongo',
    nameJa: 'みんなの日本語',
    publisher: 'スリーエーネットワーク',
    url: 'https://www.3anet.co.jp/np/list.html?q=%E3%81%BF%E3%82%93%E3%81%AA%E3%81%AE%E6%97%A5%E6%9C%AC%E8%AA%9E',
    blurb: 'Giáo trình chính: sơ cấp I (bài 1–25 ≈ N5), sơ cấp II (bài 26–50 ≈ N4), trung cấp I/II (≈ N3/N2). Bài 1–50 có sẵn trong app.',
    icon: 'み',
    // Trung cấp (N3/N2) chưa có bài trong app → chưa có lộ trình.
    planLevels: ['N5', 'N4'],
    audioMatch: 'minna|みんなの日本語',
  },
  {
    code: 'SOUMATOME',
    name: 'Sou Matome',
    nameJa: '日本語総まとめ',
    publisher: 'アスク出版',
    url: 'https://ask-books.com/somatome/',
    blurb: 'Lịch 6 tuần × 7 ngày, ~2 trang/ngày — hợp để ôn nhanh trước kỳ thi.',
    icon: '総',
    planLevels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    audioMatch: 'soumatome|sou\\s*-?\\s*matome|総まとめ',
  },
  {
    code: 'SHINKANZEN',
    name: 'Shinkanzen Master',
    nameJa: '新完全マスター',
    publisher: 'スリーエーネットワーク',
    url: 'https://www.3anet.co.jp/np/list.html?series_id=4',
    blurb: 'Giải thích kỹ, nhiều bài luyện — học sâu từng kỹ năng. Có từ N4 (không có N5).',
    icon: '新',
    planLevels: ['N4', 'N3', 'N2', 'N1'],
    audioMatch: 'shin\\s*-?\\s*kanzen|新完全',
  },
  {
    code: 'TRY',
    name: 'TRY!',
    nameJa: '日本語能力試験 文法から伸ばす日本語',
    publisher: 'アスク出版 / ABK',
    url: 'https://ask-books.com/jlpt-try/',
    blurb: 'Học ngữ pháp qua ngữ cảnh hội thoại/đoạn văn; audio miễn phí, list từ vựng tải về.',
    icon: 'T',
    planLevels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    audioMatch: '\\btry\\b',
  },
  {
    code: 'KLL',
    name: 'Kanji Look and Learn',
    nameJa: 'イメージで覚える げんき な漢字512',
    publisher: 'The Japan Times',
    url: 'https://genki.japantimes.co.jp/kanji-look-and-learn_en',
    blurb:
      'Bản chính thức: 512 kanji N5–N3, 32 bài × 16 chữ (kanji bài 1–32 trong app theo đúng bộ này). N2–N1 chỉ có bản cộng đồng của Duy Triều (374 chữ), không phải của NXB.',
    icon: '漢',
    planLevels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    audioMatch: 'look\\s*(and|&)\\s*learn',
  },
];

const url = (code: SeriesCode) => TEXTBOOK_SERIES.find((s) => s.code === code)!.url;
const SM = url('SOUMATOME');
const SK = url('SHINKANZEN');
const TRY = url('TRY');
const KLL = url('KLL');
const MINNA = url('MINNA');

const TRY_GRAMMAR_COUNT: Record<Level, number> = { N5: 46, N4: 100, N3: 127, N2: 149, N1: 129 };

const kllCommunity = (level: 'N2' | 'N1'): BookSeed => ({
  series: 'KLL',
  level,
  title: `Kanji Look and Learn ${level} (bản Duy Triều)`,
  note: 'sách cộng đồng VN, không phải Japan Times · 374 chữ N2–N1',
  kinds: ['KANJI'],
});

function upperLevelBooks(level: 'N3' | 'N2' | 'N1'): BookSeed[] {
  return [
    { series: 'SOUMATOME', level, title: `日本語総まとめ ${level} 文法`, url: SM, kinds: ['GRAMMAR'] },
    { series: 'SOUMATOME', level, title: `日本語総まとめ ${level} 語彙`, url: SM, kinds: ['VOCAB'] },
    { series: 'SOUMATOME', level, title: `日本語総まとめ ${level} 漢字`, url: SM, kinds: ['KANJI'] },
    { series: 'SOUMATOME', level, title: `日本語総まとめ ${level} 読解・聴解`, note: '2 cuốn riêng', url: SM, kinds: ['GRAMMAR'] },
    { series: 'SHINKANZEN', level, title: `新完全マスター文法 ${level}`, url: SK, kinds: ['GRAMMAR'] },
    { series: 'SHINKANZEN', level, title: `新完全マスター語彙 ${level}`, url: SK, kinds: ['VOCAB'] },
    { series: 'SHINKANZEN', level, title: `新完全マスター単語 ${level}`, note: 'sổ từ vựng theo chủ đề', url: SK, kinds: ['VOCAB'] },
    { series: 'SHINKANZEN', level, title: `新完全マスター漢字 ${level}`, url: SK, kinds: ['KANJI'] },
    { series: 'SHINKANZEN', level, title: `新完全マスター読解・聴解 ${level}`, note: '2 cuốn riêng', url: SK, kinds: ['GRAMMAR'] },
    { series: 'TRY', level, title: `TRY! ${level}`, note: `${TRY_GRAMMAR_COUNT[level]} mẫu ngữ pháp`, url: TRY, kinds: ['GRAMMAR'] },
    { series: 'TRY', level, title: `TRY! ${level} — list từ vựng`, note: 'tải miễn phí (EN/中文/VI)', url: TRY, kinds: ['VOCAB'] },
  ];
}

export const TEXTBOOK_BOOKS: BookSeed[] = [
  // N5
  { series: 'MINNA', level: 'N5', title: 'みんなの日本語 初級I (bài 1–25)', note: 'kèm sách dịch & giải thích ngữ pháp', url: MINNA, kinds: ['GRAMMAR', 'VOCAB'] },
  { series: 'SOUMATOME', level: 'N5', title: '日本語総まとめ N5（かんじ・ことば・ぶんぽう・読む・聞く）', note: '1 cuốn gộp 5 kỹ năng', url: SM, kinds: ['GRAMMAR', 'VOCAB', 'KANJI'] },
  { series: 'TRY', level: 'N5', title: 'TRY! N5', note: '46 mẫu ngữ pháp', url: TRY, kinds: ['GRAMMAR'] },
  { series: 'TRY', level: 'N5', title: 'TRY! N5 — list từ vựng', note: 'tải miễn phí (EN/中文/VI…)', url: TRY, kinds: ['VOCAB'] },
  { series: 'KLL', level: 'N5', title: 'Kanji Look and Learn — Part 1 (第1〜10課)', note: '160 chữ N5 · có Workbook riêng', url: KLL, kinds: ['KANJI'] },
  // N4
  { series: 'MINNA', level: 'N4', title: 'みんなの日本語 初級II (bài 26–50)', note: 'kèm sách dịch & giải thích ngữ pháp', url: MINNA, kinds: ['GRAMMAR', 'VOCAB'] },
  { series: 'SOUMATOME', level: 'N4', title: '日本語総まとめ N4 漢字・ことば', url: SM, kinds: ['VOCAB', 'KANJI'] },
  { series: 'SOUMATOME', level: 'N4', title: '日本語総まとめ N4 文法・読解・聴解', url: SM, kinds: ['GRAMMAR'] },
  { series: 'SHINKANZEN', level: 'N4', title: '新完全マスター文法 N4', url: 'https://www.3anet.co.jp/np/books/3606/', kinds: ['GRAMMAR'] },
  { series: 'SHINKANZEN', level: 'N4', title: '新完全マスター語彙 N4', note: '~690 từ', url: 'https://www.3anet.co.jp/np/books/3636/', kinds: ['VOCAB'] },
  { series: 'SHINKANZEN', level: 'N4', title: '新完全マスター単語 N4', url: SK, kinds: ['VOCAB'] },
  { series: 'SHINKANZEN', level: 'N4', title: '新完全マスター漢字 N4', note: '278 chữ / 15 buổi', url: 'https://www.3anet.co.jp/np/books/3626/', kinds: ['KANJI'] },
  { series: 'SHINKANZEN', level: 'N4', title: '新完全マスター読解・聴解 N4', note: '2 cuốn riêng', url: 'https://www.3anet.co.jp/np/books/3616/', kinds: ['GRAMMAR'] },
  { series: 'TRY', level: 'N4', title: 'TRY! N4', note: '100 mẫu ngữ pháp', url: TRY, kinds: ['GRAMMAR'] },
  { series: 'TRY', level: 'N4', title: 'TRY! N4 — list từ vựng', note: 'tải miễn phí (EN/中文/VI…)', url: TRY, kinds: ['VOCAB'] },
  { series: 'KLL', level: 'N4', title: 'Kanji Look and Learn — Part 2 (第11〜20課)', note: '160 chữ N4 · có Workbook riêng', url: KLL, kinds: ['KANJI'] },
  // N3
  { series: 'MINNA', level: 'N3', title: 'みんなの日本語 中級I', note: 'app chưa có bài trung cấp', url: MINNA, kinds: ['GRAMMAR', 'VOCAB'] },
  ...upperLevelBooks('N3'),
  { series: 'KLL', level: 'N3', title: 'Kanji Look and Learn — Part 3 (第21〜32課)', note: '192 chữ N3 · có Workbook riêng', url: KLL, kinds: ['KANJI'] },
  // N2
  { series: 'MINNA', level: 'N2', title: 'みんなの日本語 中級II', note: 'app chưa có bài trung cấp', url: MINNA, kinds: ['GRAMMAR', 'VOCAB'] },
  ...upperLevelBooks('N2'),
  kllCommunity('N2'),
  // N1
  ...upperLevelBooks('N1'),
  kllCommunity('N1'),
];
