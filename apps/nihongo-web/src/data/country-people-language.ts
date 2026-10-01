/**
 * Bảng 国・人・語 (nước – người – ngôn ngữ) cho bài nhập môn kiểu Minna bài 1.
 * Người = tên nước + 人（じん）, suy ra bằng personOf(). Ngôn ngữ ghi tay vì nhiều nước
 * không theo quy tắc "tên nước + 語" (アメリカ → 英語, ブラジル → ポルトガル語…).
 */
export type LanguageItem = {
  ja: string;
  kana: string;
  romaji: string;
  vi: string;
};

export type CountryPeopleLanguage = {
  code: string; // ISO 3166-1 alpha-2, dùng cho cờ
  vi: string;
  ja: string;
  kana: string;
  romaji: string;
  languages: LanguageItem[];
};

const L = {
  vi: { ja: 'ベトナム語', kana: 'ベトナムご', romaji: 'betonamugo', vi: 'Tiếng Việt' },
  ja: { ja: '日本語', kana: 'にほんご', romaji: 'nihongo', vi: 'Tiếng Nhật' },
  zh: { ja: '中国語', kana: 'ちゅうごくご', romaji: 'chuugokugo', vi: 'Tiếng Trung' },
  ko: { ja: '韓国語', kana: 'かんこくご', romaji: 'kankokugo', vi: 'Tiếng Hàn' },
  th: { ja: 'タイ語', kana: 'タイご', romaji: 'taigo', vi: 'Tiếng Thái' },
  lo: { ja: 'ラオス語', kana: 'ラオスご', romaji: 'raosugo', vi: 'Tiếng Lào' },
  km: { ja: 'カンボジア語', kana: 'カンボジアご', romaji: 'kanbojiago', vi: 'Tiếng Khmer' },
  my: { ja: 'ミャンマー語', kana: 'ミャンマーご', romaji: 'myanmaago', vi: 'Tiếng Myanmar' },
  id: { ja: 'インドネシア語', kana: 'インドネシアご', romaji: 'indoneshiago', vi: 'Tiếng Indonesia' },
  ms: { ja: 'マレー語', kana: 'マレーご', romaji: 'mareego', vi: 'Tiếng Mã Lai' },
  fil: { ja: 'フィリピノ語', kana: 'フィリピノご', romaji: 'firipinogo', vi: 'Tiếng Philippines' },
  hi: { ja: 'ヒンディー語', kana: 'ヒンディーご', romaji: 'hindiigo', vi: 'Tiếng Hindi' },
  ne: { ja: 'ネパール語', kana: 'ネパールご', romaji: 'nepaarugo', vi: 'Tiếng Nepal' },
  mn: { ja: 'モンゴル語', kana: 'モンゴルご', romaji: 'mongorugo', vi: 'Tiếng Mông Cổ' },
  en: { ja: '英語', kana: 'えいご', romaji: 'eigo', vi: 'Tiếng Anh' },
  fr: { ja: 'フランス語', kana: 'フランスご', romaji: 'furansugo', vi: 'Tiếng Pháp' },
  de: { ja: 'ドイツ語', kana: 'ドイツご', romaji: 'doitsugo', vi: 'Tiếng Đức' },
  it: { ja: 'イタリア語', kana: 'イタリアご', romaji: 'itariago', vi: 'Tiếng Ý' },
  es: { ja: 'スペイン語', kana: 'スペインご', romaji: 'supeingo', vi: 'Tiếng Tây Ban Nha' },
  pt: { ja: 'ポルトガル語', kana: 'ポルトガルご', romaji: 'porutogarugo', vi: 'Tiếng Bồ Đào Nha' },
  ru: { ja: 'ロシア語', kana: 'ロシアご', romaji: 'roshiago', vi: 'Tiếng Nga' },
  ar: { ja: 'アラビア語', kana: 'アラビアご', romaji: 'arabiago', vi: 'Tiếng Ả Rập' },
} satisfies Record<string, LanguageItem>;

export const COUNTRY_PEOPLE_LANGUAGES: CountryPeopleLanguage[] = [
  { code: 'VN', vi: 'Việt Nam', ja: 'ベトナム', kana: 'ベトナム', romaji: 'betonamu', languages: [L.vi] },
  { code: 'JP', vi: 'Nhật Bản', ja: '日本', kana: 'にほん', romaji: 'nihon', languages: [L.ja] },
  { code: 'CN', vi: 'Trung Quốc', ja: '中国', kana: 'ちゅうごく', romaji: 'chuugoku', languages: [L.zh] },
  { code: 'TW', vi: 'Đài Loan', ja: '台湾', kana: 'たいわん', romaji: 'taiwan', languages: [L.zh] },
  { code: 'KR', vi: 'Hàn Quốc', ja: '韓国', kana: 'かんこく', romaji: 'kankoku', languages: [L.ko] },
  { code: 'MN', vi: 'Mông Cổ', ja: 'モンゴル', kana: 'モンゴル', romaji: 'mongoru', languages: [L.mn] },
  { code: 'TH', vi: 'Thái Lan', ja: 'タイ', kana: 'タイ', romaji: 'tai', languages: [L.th] },
  { code: 'LA', vi: 'Lào', ja: 'ラオス', kana: 'ラオス', romaji: 'raosu', languages: [L.lo] },
  { code: 'KH', vi: 'Campuchia', ja: 'カンボジア', kana: 'カンボジア', romaji: 'kanbojia', languages: [L.km] },
  { code: 'MM', vi: 'Myanmar', ja: 'ミャンマー', kana: 'ミャンマー', romaji: 'myanmaa', languages: [L.my] },
  { code: 'ID', vi: 'Indonesia', ja: 'インドネシア', kana: 'インドネシア', romaji: 'indoneshia', languages: [L.id] },
  { code: 'MY', vi: 'Malaysia', ja: 'マレーシア', kana: 'マレーシア', romaji: 'mareeshia', languages: [L.ms] },
  { code: 'PH', vi: 'Philippines', ja: 'フィリピン', kana: 'フィリピン', romaji: 'firipin', languages: [L.fil, L.en] },
  { code: 'IN', vi: 'Ấn Độ', ja: 'インド', kana: 'インド', romaji: 'indo', languages: [L.hi, L.en] },
  { code: 'NP', vi: 'Nepal', ja: 'ネパール', kana: 'ネパール', romaji: 'nepaaru', languages: [L.ne] },
  { code: 'US', vi: 'Mỹ', ja: 'アメリカ', kana: 'アメリカ', romaji: 'amerika', languages: [L.en] },
  { code: 'GB', vi: 'Anh', ja: 'イギリス', kana: 'イギリス', romaji: 'igirisu', languages: [L.en] },
  { code: 'AU', vi: 'Úc', ja: 'オーストラリア', kana: 'オーストラリア', romaji: 'oosutoraria', languages: [L.en] },
  { code: 'CA', vi: 'Canada', ja: 'カナダ', kana: 'カナダ', romaji: 'kanada', languages: [L.en, L.fr] },
  { code: 'FR', vi: 'Pháp', ja: 'フランス', kana: 'フランス', romaji: 'furansu', languages: [L.fr] },
  { code: 'DE', vi: 'Đức', ja: 'ドイツ', kana: 'ドイツ', romaji: 'doitsu', languages: [L.de] },
  { code: 'IT', vi: 'Ý', ja: 'イタリア', kana: 'イタリア', romaji: 'itaria', languages: [L.it] },
  { code: 'ES', vi: 'Tây Ban Nha', ja: 'スペイン', kana: 'スペイン', romaji: 'supein', languages: [L.es] },
  { code: 'PT', vi: 'Bồ Đào Nha', ja: 'ポルトガル', kana: 'ポルトガル', romaji: 'porutogaru', languages: [L.pt] },
  { code: 'RU', vi: 'Nga', ja: 'ロシア', kana: 'ロシア', romaji: 'roshia', languages: [L.ru] },
  { code: 'BR', vi: 'Brazil', ja: 'ブラジル', kana: 'ブラジル', romaji: 'burajiru', languages: [L.pt] },
  { code: 'MX', vi: 'Mexico', ja: 'メキシコ', kana: 'メキシコ', romaji: 'mekishiko', languages: [L.es] },
  { code: 'EG', vi: 'Ai Cập', ja: 'エジプト', kana: 'エジプト', romaji: 'ejiputo', languages: [L.ar] },
  { code: 'SA', vi: 'Ả Rập Xê Út', ja: 'サウジアラビア', kana: 'サウジアラビア', romaji: 'saujiarabia', languages: [L.ar] },
];

/** Người nước đó: 〜人 đọc じん. */
export function personOf(c: CountryPeopleLanguage) {
  return { ja: `${c.ja}人`, kana: `${c.kana}じん`, romaji: `${c.romaji}jin`, vi: `Người ${c.vi}` };
}

/** Ngôn ngữ không theo quy tắc "tên nước + 語" (để tô đậm trên bảng). */
export function isIrregularLanguage(c: CountryPeopleLanguage, lang: LanguageItem): boolean {
  return lang.ja !== `${c.ja}語`;
}

export function matchesCountryPeople(c: CountryPeopleLanguage, query: string): boolean {
  const p = personOf(c);
  return [c.vi, c.ja, c.kana, c.romaji, c.code, p.ja, p.kana, ...c.languages.flatMap((l) => [l.ja, l.kana, l.romaji, l.vi])]
    .join(' ')
    .toLowerCase()
    .includes(query);
}
