/** Quy luật thêm trường âm ー — đầy đủ theo giáo trình (Kosei / Minna). */

export type LongVowelPoint = {
  explanation: string;
  english?: string;
  katakana?: string;
  romaji?: string;
};

export type LongVowelMapping = {
  english: string;
  katakana: string;
  romaji: string;
  note?: string;
};

export type LongVowelExample = {
  english: string;
  katakana: string;
  romaji: string;
  meaningVi: string;
  note?: string;
};

export const LONG_VOWEL_SECTION = {
  slug: 'long-vowel',
  title: 'Trường âm ー (chōon) — quy luật thêm đủ',
  summary:
    'Khi nào viết ー? Giáo trình hay chỉ cho vài ví dụ — dưới đây là đủ 7 nhóm hay gặp khi chuyển tiếng Anh → katakana.',
  points: [
    {
      explanation:
        'Dấu ー kéo dài nguyên âm ngay trước đó thêm một mora. Không đọc như chữ "i" riêng — コーヒー = 4 mora: コ + ー + ヒ + ー.',
      english: 'coffee',
      katakana: 'コーヒー',
      romaji: 'koohii',
    },
    {
      explanation:
        '① -ar / -er / -ir / -ur / -or → trường âm hàng ア (ー). Car → カー, curtain → カーテン, computer → コンピューター.',
      english: 'car / curtain / computer',
      katakana: 'カー / カーテン / コンピューター',
      romaji: 'kaa / kaaten / konpyuutaa',
    },
    {
      explanation:
        '② -ee- / -ea- / -ai- / -oa- / -au- / -oo- → nguyên âm dài tương ứng. Speed → スピード, coupon → クーポン, cheese → チーズ, room → ルーム.',
      english: 'speed / coupon / cheese / room',
      katakana: 'スピード / クーポン / チーズ / ルーム',
      romaji: 'supiido / kuupon / chiizu / ruumu',
    },
    {
      explanation:
        '③ -all / -al / -ol → kéo dài âm o/a. Gold → ゴールド, all → オール, ball → ボール.',
      english: 'gold / all / ball',
      katakana: 'ゴールド / オール / ボール',
      romaji: 'goorudo / ooru / booru',
    },
    {
      explanation:
        '④ Kết thúc -w / -y → kéo dài nguyên âm trước. Show → ショー, copy → コピー, snow → スノー.',
      english: 'show / copy / snow',
      katakana: 'ショー / コピー / スノー',
      romaji: 'shoo / kopii / sunoo',
    },
    {
      explanation:
        '⑤ Magic e / silent e dạng -a-e / -o-e / -u-e → nguyên âm dài. Case → ケース, game → ゲーム, note → ノート, cute → キュート.',
      english: 'case / game / note',
      katakana: 'ケース / ゲーム / ノート',
      romaji: 'keesu / geemu / nooto',
    },
    {
      explanation:
        '⑥ -ation / -otion → thường …ーション. Automation → オートメーション, lotion → ローション, station → ステーション.',
      english: 'automation / lotion / station',
      katakana: 'オートメーション / ローション / ステーション',
      romaji: 'ootomeeshon / rooshon / suteeshon',
    },
    {
      explanation:
        '⑦ -ire / -ture → …アー / …チャー (kéo dài). Fire → ファイア／ファイヤー, culture → カルチャー, future → フューチャー.',
      english: 'culture / future / fire',
      katakana: 'カルチャー / フューチャー / ファイヤー',
      romaji: 'karuchaa / fyuuchaa / faiyaa',
    },
    {
      explanation:
        'Lưu ý: tài liệu kỹ thuật / JIS đôi khi lược ー theo "quy tắc 3 mora" (từ ≥3 mora bỏ trường âm). Học giao tiếp / JLPT thì giữ ー theo các quy luật trên.',
    },
  ] satisfies LongVowelPoint[],
  mappings: [
    {
      english: '① -ar/-er/-ir/-ur/-or',
      katakana: 'ー (hàng ア)',
      romaji: 'kaa / kaaten',
      note: 'car→カー, curtain→カーテン',
    },
    {
      english: '② -ee/-ea/-ai/-oa/-au/-oo',
      katakana: 'ー',
      romaji: 'supiido / kuupon',
      note: 'speed→スピード, coupon→クーポン',
    },
    {
      english: '③ -all/-al/-ol',
      katakana: 'ー',
      romaji: 'goorudo / ooru',
      note: 'gold→ゴールド, all→オール',
    },
    {
      english: '④ -w / -y cuối',
      katakana: 'ー',
      romaji: 'shoo / kopii',
      note: 'show→ショー, copy→コピー',
    },
    {
      english: '⑤ -a-e / -o-e / -u-e',
      katakana: 'ー',
      romaji: 'keesu / geemu / nooto',
      note: 'case→ケース, game→ゲーム, note→ノート',
    },
    {
      english: '⑥ -ation / -otion',
      katakana: '…ーション',
      romaji: 'rooshon / suteeshon',
      note: 'lotion→ローション, station→ステーション',
    },
    {
      english: '⑦ -ire / -ture',
      katakana: '…アー / …チャー',
      romaji: 'karuchaa / fyuuchaa',
      note: 'culture→カルチャー, future→フューチャー',
    },
  ] satisfies LongVowelMapping[],
  examples: [
    { english: 'car', katakana: 'カー', romaji: 'kaa', meaningVi: 'xe hơi', note: '① -ar' },
    { english: 'curtain', katakana: 'カーテン', romaji: 'kaaten', meaningVi: 'rèm cửa', note: '① -ur/-ain' },
    { english: 'speed', katakana: 'スピード', romaji: 'supiido', meaningVi: 'tốc độ', note: '② -ee' },
    { english: 'coupon', katakana: 'クーポン', romaji: 'kuupon', meaningVi: 'phiếu giảm giá', note: '② -ou/-oo' },
    { english: 'cheese', katakana: 'チーズ', romaji: 'chiizu', meaningVi: 'phô mai', note: '② -ee' },
    { english: 'room', katakana: 'ルーム', romaji: 'ruumu', meaningVi: 'phòng', note: '② -oo' },
    { english: 'gold', katakana: 'ゴールド', romaji: 'goorudo', meaningVi: 'vàng', note: '③ -ol' },
    { english: 'all', katakana: 'オール', romaji: 'ooru', meaningVi: 'tất cả', note: '③ -all' },
    { english: 'show', katakana: 'ショー', romaji: 'shoo', meaningVi: 'buổi biểu diễn', note: '④ -w' },
    { english: 'copy', katakana: 'コピー', romaji: 'kopii', meaningVi: 'sao chép', note: '④ -y' },
    { english: 'case', katakana: 'ケース', romaji: 'keesu', meaningVi: 'hộp / trường hợp', note: '⑤ -a-e' },
    { english: 'game', katakana: 'ゲーム', romaji: 'geemu', meaningVi: 'trò chơi', note: '⑤ -a-e' },
    { english: 'note', katakana: 'ノート', romaji: 'nooto', meaningVi: 'sổ ghi chép', note: '⑤ -o-e' },
    { english: 'lotion', katakana: 'ローション', romaji: 'rooshon', meaningVi: 'kem dưỡng', note: '⑥ -otion' },
    { english: 'station', katakana: 'ステーション', romaji: 'suteeshon', meaningVi: 'nhà ga / trạm', note: '⑥ -ation' },
    { english: 'culture', katakana: 'カルチャー', romaji: 'karuchaa', meaningVi: 'văn hóa', note: '⑦ -ture' },
    { english: 'coffee', katakana: 'コーヒー', romaji: 'koohii', meaningVi: 'cà phê', note: 'ー kép' },
    { english: 'table', katakana: 'テーブル', romaji: 'teeburu', meaningVi: 'bàn', note: '⑤ -a-e' },
  ] satisfies LongVowelExample[],
};

/** Tóm tắt quy luật 3 trong mục «6 quy luật chuyển âm». */
export const SIX_CORE_RULE3_POINT = {
  explanation:
    'Quy luật 3 — Trường âm ー cho nguyên âm dài (đủ 7 nhóm): ① -ar/-er/-ir/-ur/-or → カー; ② -ee/-ea/-ai/-oa/-au/-oo → スピード; ③ -all/-al/-ol → ゴールド; ④ -w/-y → ショー/コピー; ⑤ -a-e/-o-e/-u-e → ケース/ゲーム; ⑥ -ation/-otion → ローション; ⑦ -ire/-ture → カルチャー. Xem mục «Trường âm ー» bên dưới.',
  english: 'car / speed / show / game / lotion',
  katakana: 'カー / スピード / ショー / ゲーム / ローション',
  romaji: 'kaa / supiido / shoo / geemu / rooshon',
};

export const SIX_CORE_RULE3_MAPPING = {
  english: '3. Trường âm ー (7 nhóm)',
  katakana: '-ar/-ee/-all/-w/-a-e/-ation/-ture',
  romaji: '—',
  note: 'Xem mục Trường âm ー — đủ 7 quy luật',
};
