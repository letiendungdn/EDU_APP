export type Prefecture = {
  code: string;       // ISO 3166-2:JP code, e.g. "JP-13"
  nameJa: string;     // 都道府県名 (kanji)
  nameKana: string;   // ひらがな
  nameRomaji: string;
  capital: string;    // 県庁所在地
  region: string;     // 地方
  lat: number;
  lng: number;
  famous: string;     // 有名なもの
  vocab: VocabItem[];
};

export type VocabItem = {
  ja: string;
  kana: string;
  romaji: string;
  vi: string;
  type: 'food' | 'place' | 'culture' | 'nature';
};

export const PREFECTURES: Prefecture[] = [
  // Hokkaido
  {
    code: 'JP-01', nameJa: '北海道', nameKana: 'ほっかいどう', nameRomaji: 'Hokkaidō',
    capital: '札幌市', region: '北海道地方', lat: 43.06, lng: 141.35,
    famous: '雪まつり、ラーメン、乳製品',
    vocab: [
      { ja: '雪', kana: 'ゆき', romaji: 'yuki', vi: 'tuyết', type: 'nature' },
      { ja: '牛乳', kana: 'ぎゅうにゅう', romaji: 'gyūnyū', vi: 'sữa bò', type: 'food' },
      { ja: '温泉', kana: 'おんせん', romaji: 'onsen', vi: 'suối nước nóng', type: 'culture' },
      { ja: '森', kana: 'もり', romaji: 'mori', vi: 'rừng', type: 'nature' },
      { ja: 'ラーメン', kana: 'らーめん', romaji: 'rāmen', vi: 'mì ramen', type: 'food' },
    ],
  },
  // Aomori
  {
    code: 'JP-02', nameJa: '青森県', nameKana: 'あおもりけん', nameRomaji: 'Aomori',
    capital: '青森市', region: '東北地方', lat: 40.82, lng: 140.74,
    famous: 'りんご、ねぶた祭り',
    vocab: [
      { ja: 'りんご', kana: 'りんご', romaji: 'ringo', vi: 'táo', type: 'food' },
      { ja: '祭り', kana: 'まつり', romaji: 'matsuri', vi: 'lễ hội', type: 'culture' },
      { ja: '海峡', kana: 'かいきょう', romaji: 'kaikyō', vi: 'eo biển', type: 'nature' },
    ],
  },
  // Iwate
  {
    code: 'JP-03', nameJa: '岩手県', nameKana: 'いわてけん', nameRomaji: 'Iwate',
    capital: '盛岡市', region: '東北地方', lat: 39.70, lng: 141.15,
    famous: 'わんこそば、南部鉄器',
    vocab: [
      { ja: 'そば', kana: 'そば', romaji: 'soba', vi: 'mì soba', type: 'food' },
      { ja: '鉄', kana: 'てつ', romaji: 'tetsu', vi: 'sắt/gang', type: 'culture' },
      { ja: '山', kana: 'やま', romaji: 'yama', vi: 'núi', type: 'nature' },
    ],
  },
  // Miyagi
  {
    code: 'JP-04', nameJa: '宮城県', nameKana: 'みやぎけん', nameRomaji: 'Miyagi',
    capital: '仙台市', region: '東北地方', lat: 38.27, lng: 140.87,
    famous: '牛タン、松島',
    vocab: [
      { ja: '牛タン', kana: 'ぎゅうたん', romaji: 'gyūtan', vi: 'lưỡi bò', type: 'food' },
      { ja: '松', kana: 'まつ', romaji: 'matsu', vi: 'cây thông', type: 'nature' },
      { ja: '島', kana: 'しま', romaji: 'shima', vi: 'đảo', type: 'place' },
    ],
  },
  // Akita
  {
    code: 'JP-05', nameJa: '秋田県', nameKana: 'あきたけん', nameRomaji: 'Akita',
    capital: '秋田市', region: '東北地方', lat: 39.72, lng: 140.10,
    famous: '秋田犬、きりたんぽ',
    vocab: [
      { ja: '犬', kana: 'いぬ', romaji: 'inu', vi: 'chó', type: 'culture' },
      { ja: '米', kana: 'こめ', romaji: 'kome', vi: 'gạo', type: 'food' },
      { ja: '秋', kana: 'あき', romaji: 'aki', vi: 'mùa thu', type: 'nature' },
    ],
  },
  // Yamagata
  {
    code: 'JP-06', nameJa: '山形県', nameKana: 'やまがたけん', nameRomaji: 'Yamagata',
    capital: '山形市', region: '東北地方', lat: 38.24, lng: 140.36,
    famous: 'さくらんぼ、芋煮',
    vocab: [
      { ja: 'さくらんぼ', kana: 'さくらんぼ', romaji: 'sakuranbo', vi: 'anh đào', type: 'food' },
      { ja: '山', kana: 'やま', romaji: 'yama', vi: 'núi', type: 'nature' },
      { ja: '芋', kana: 'いも', romaji: 'imo', vi: 'khoai', type: 'food' },
    ],
  },
  // Fukushima
  {
    code: 'JP-07', nameJa: '福島県', nameKana: 'ふくしまけん', nameRomaji: 'Fukushima',
    capital: '福島市', region: '東北地方', lat: 37.75, lng: 140.47,
    famous: '桃、喜多方ラーメン',
    vocab: [
      { ja: '桃', kana: 'もも', romaji: 'momo', vi: 'đào', type: 'food' },
      { ja: '川', kana: 'かわ', romaji: 'kawa', vi: 'sông', type: 'nature' },
      { ja: '湖', kana: 'みずうみ', romaji: 'mizuumi', vi: 'hồ', type: 'nature' },
    ],
  },
  // Ibaraki
  {
    code: 'JP-08', nameJa: '茨城県', nameKana: 'いばらきけん', nameRomaji: 'Ibaraki',
    capital: '水戸市', region: '関東地方', lat: 36.34, lng: 140.45,
    famous: '納豆、偕楽園',
    vocab: [
      { ja: '納豆', kana: 'なっとう', romaji: 'nattō', vi: 'đậu nành lên men', type: 'food' },
      { ja: '梅', kana: 'うめ', romaji: 'ume', vi: 'mận/hoa mai', type: 'nature' },
      { ja: '庭園', kana: 'ていえん', romaji: 'teien', vi: 'vườn cảnh', type: 'place' },
    ],
  },
  // Tochigi
  {
    code: 'JP-09', nameJa: '栃木県', nameKana: 'とちぎけん', nameRomaji: 'Tochigi',
    capital: '宇都宮市', region: '関東地方', lat: 36.57, lng: 139.88,
    famous: '餃子、日光東照宮',
    vocab: [
      { ja: '餃子', kana: 'ぎょうざ', romaji: 'gyōza', vi: 'há cảo chiên', type: 'food' },
      { ja: '神社', kana: 'じんじゃ', romaji: 'jinja', vi: 'đền thần', type: 'place' },
      { ja: '滝', kana: 'たき', romaji: 'taki', vi: 'thác nước', type: 'nature' },
    ],
  },
  // Gunma
  {
    code: 'JP-10', nameJa: '群馬県', nameKana: 'ぐんまけん', nameRomaji: 'Gunma',
    capital: '前橋市', region: '関東地方', lat: 36.39, lng: 139.06,
    famous: '温泉（草津）、こんにゃく',
    vocab: [
      { ja: '温泉', kana: 'おんせん', romaji: 'onsen', vi: 'suối nước nóng', type: 'culture' },
      { ja: 'こんにゃく', kana: 'こんにゃく', romaji: 'konnyaku', vi: 'nưa konjac', type: 'food' },
      { ja: '風', kana: 'かぜ', romaji: 'kaze', vi: 'gió', type: 'nature' },
    ],
  },
  // Saitama
  {
    code: 'JP-11', nameJa: '埼玉県', nameKana: 'さいたまけん', nameRomaji: 'Saitama',
    capital: 'さいたま市', region: '関東地方', lat: 35.86, lng: 139.65,
    famous: '川越、盆栽',
    vocab: [
      { ja: '盆栽', kana: 'ぼんさい', romaji: 'bonsai', vi: 'cây bonsai', type: 'culture' },
      { ja: '城', kana: 'しろ', romaji: 'shiro', vi: 'lâu đài', type: 'place' },
      { ja: '川', kana: 'かわ', romaji: 'kawa', vi: 'sông', type: 'nature' },
    ],
  },
  // Chiba
  {
    code: 'JP-12', nameJa: '千葉県', nameKana: 'ちばけん', nameRomaji: 'Chiba',
    capital: '千葉市', region: '関東地方', lat: 35.61, lng: 140.12,
    famous: '落花生、東京ディズニーランド',
    vocab: [
      { ja: '落花生', kana: 'らっかせい', romaji: 'rakkase', vi: 'lạc/đậu phộng', type: 'food' },
      { ja: '海', kana: 'うみ', romaji: 'umi', vi: 'biển', type: 'nature' },
      { ja: '港', kana: 'みなと', romaji: 'minato', vi: 'cảng', type: 'place' },
    ],
  },
  // Tokyo
  {
    code: 'JP-13', nameJa: '東京都', nameKana: 'とうきょうと', nameRomaji: 'Tōkyō',
    capital: '新宿区', region: '関東地方', lat: 35.68, lng: 139.69,
    famous: '渋谷、浅草、寿司、ラーメン',
    vocab: [
      { ja: '都市', kana: 'とし', romaji: 'toshi', vi: 'thành phố', type: 'place' },
      { ja: '電車', kana: 'でんしゃ', romaji: 'densha', vi: 'tàu điện', type: 'culture' },
      { ja: '寿司', kana: 'すし', romaji: 'sushi', vi: 'sushi', type: 'food' },
      { ja: '神社', kana: 'じんじゃ', romaji: 'jinja', vi: 'đền thần', type: 'place' },
      { ja: '塔', kana: 'とう', romaji: 'tō', vi: 'tháp', type: 'place' },
    ],
  },
  // Kanagawa
  {
    code: 'JP-14', nameJa: '神奈川県', nameKana: 'かながわけん', nameRomaji: 'Kanagawa',
    capital: '横浜市', region: '関東地方', lat: 35.45, lng: 139.64,
    famous: '横浜中華街、鎌倉大仏',
    vocab: [
      { ja: '大仏', kana: 'だいぶつ', romaji: 'daibutsu', vi: 'tượng Phật lớn', type: 'culture' },
      { ja: '中華', kana: 'ちゅうか', romaji: 'chūka', vi: 'Trung Hoa', type: 'culture' },
      { ja: '港', kana: 'みなと', romaji: 'minato', vi: 'cảng', type: 'place' },
    ],
  },
  // Niigata
  {
    code: 'JP-15', nameJa: '新潟県', nameKana: 'にいがたけん', nameRomaji: 'Niigata',
    capital: '新潟市', region: '中部地方', lat: 37.91, lng: 139.02,
    famous: '米（コシヒカリ）、日本酒',
    vocab: [
      { ja: '米', kana: 'こめ', romaji: 'kome', vi: 'gạo', type: 'food' },
      { ja: '日本酒', kana: 'にほんしゅ', romaji: 'nihonshu', vi: 'rượu sake', type: 'food' },
      { ja: '雪', kana: 'ゆき', romaji: 'yuki', vi: 'tuyết', type: 'nature' },
    ],
  },
  // Toyama
  {
    code: 'JP-16', nameJa: '富山県', nameKana: 'とやまけん', nameRomaji: 'Toyama',
    capital: '富山市', region: '中部地方', lat: 36.70, lng: 137.21,
    famous: '黒部ダム、ます寿司',
    vocab: [
      { ja: 'ダム', kana: 'だむ', romaji: 'damu', vi: 'đập nước', type: 'place' },
      { ja: '魚', kana: 'さかな', romaji: 'sakana', vi: 'cá', type: 'food' },
      { ja: '薬', kana: 'くすり', romaji: 'kusuri', vi: 'thuốc', type: 'culture' },
    ],
  },
  // Ishikawa
  {
    code: 'JP-17', nameJa: '石川県', nameKana: 'いしかわけん', nameRomaji: 'Ishikawa',
    capital: '金沢市', region: '中部地方', lat: 36.59, lng: 136.63,
    famous: '兼六園、金箔、加賀料理',
    vocab: [
      { ja: '金', kana: 'きん', romaji: 'kin', vi: 'vàng', type: 'culture' },
      { ja: '庭', kana: 'にわ', romaji: 'niwa', vi: 'sân vườn', type: 'place' },
      { ja: '海鮮', kana: 'かいせん', romaji: 'kaisen', vi: 'hải sản', type: 'food' },
    ],
  },
  // Fukui
  {
    code: 'JP-18', nameJa: '福井県', nameKana: 'ふくいけん', nameRomaji: 'Fukui',
    capital: '福井市', region: '中部地方', lat: 36.07, lng: 136.22,
    famous: '越前がに、恐竜',
    vocab: [
      { ja: '蟹', kana: 'かに', romaji: 'kani', vi: 'cua', type: 'food' },
      { ja: '恐竜', kana: 'きょうりゅう', romaji: 'kyōryū', vi: 'khủng long', type: 'culture' },
      { ja: '海', kana: 'うみ', romaji: 'umi', vi: 'biển', type: 'nature' },
    ],
  },
  // Yamanashi
  {
    code: 'JP-19', nameJa: '山梨県', nameKana: 'やまなしけん', nameRomaji: 'Yamanashi',
    capital: '甲府市', region: '中部地方', lat: 35.66, lng: 138.57,
    famous: '富士山、ぶどう、ワイン',
    vocab: [
      { ja: '富士山', kana: 'ふじさん', romaji: 'Fujisan', vi: 'núi Phú Sĩ', type: 'nature' },
      { ja: 'ぶどう', kana: 'ぶどう', romaji: 'budō', vi: 'nho', type: 'food' },
      { ja: 'ワイン', kana: 'わいん', romaji: 'wain', vi: 'rượu vang', type: 'food' },
    ],
  },
  // Nagano
  {
    code: 'JP-20', nameJa: '長野県', nameKana: 'ながのけん', nameRomaji: 'Nagano',
    capital: '長野市', region: '中部地方', lat: 36.65, lng: 138.18,
    famous: '蕎麦、スキー、善光寺',
    vocab: [
      { ja: '蕎麦', kana: 'そば', romaji: 'soba', vi: 'mì kiều mạch', type: 'food' },
      { ja: 'スキー', kana: 'すきー', romaji: 'sukī', vi: 'trượt tuyết', type: 'culture' },
      { ja: 'サル', kana: 'さる', romaji: 'saru', vi: 'khỉ', type: 'nature' },
    ],
  },
  // Shizuoka
  {
    code: 'JP-22', nameJa: '静岡県', nameKana: 'しずおかけん', nameRomaji: 'Shizuoka',
    capital: '静岡市', region: '中部地方', lat: 34.98, lng: 138.38,
    famous: 'お茶、富士山、うなぎ',
    vocab: [
      { ja: 'お茶', kana: 'おちゃ', romaji: 'ocha', vi: 'trà', type: 'food' },
      { ja: '富士山', kana: 'ふじさん', romaji: 'Fujisan', vi: 'núi Phú Sĩ', type: 'nature' },
      { ja: 'うなぎ', kana: 'うなぎ', romaji: 'unagi', vi: 'lươn', type: 'food' },
    ],
  },
  // Aichi
  {
    code: 'JP-23', nameJa: '愛知県', nameKana: 'あいちけん', nameRomaji: 'Aichi',
    capital: '名古屋市', region: '中部地方', lat: 35.18, lng: 136.91,
    famous: '味噌カツ、手羽先、名古屋城',
    vocab: [
      { ja: '味噌', kana: 'みそ', romaji: 'miso', vi: 'tương miso', type: 'food' },
      { ja: '城', kana: 'しろ', romaji: 'shiro', vi: 'lâu đài', type: 'place' },
      { ja: '車', kana: 'くるま', romaji: 'kuruma', vi: 'xe hơi', type: 'culture' },
      { ja: '手羽先', kana: 'てばさき', romaji: 'tebasaki', vi: 'cánh gà', type: 'food' },
    ],
  },
  // Mie
  {
    code: 'JP-24', nameJa: '三重県', nameKana: 'みえけん', nameRomaji: 'Mie',
    capital: '津市', region: '近畿地方', lat: 34.73, lng: 136.51,
    famous: '伊勢神宮、松阪牛',
    vocab: [
      { ja: '神宮', kana: 'じんぐう', romaji: 'jingū', vi: 'đền thần lớn', type: 'place' },
      { ja: '牛肉', kana: 'ぎゅうにく', romaji: 'gyūniku', vi: 'thịt bò', type: 'food' },
      { ja: '海女', kana: 'あま', romaji: 'ama', vi: 'thợ lặn nữ', type: 'culture' },
    ],
  },
  // Shiga
  {
    code: 'JP-25', nameJa: '滋賀県', nameKana: 'しがけん', nameRomaji: 'Shiga',
    capital: '大津市', region: '近畿地方', lat: 35.00, lng: 135.87,
    famous: '琵琶湖、近江牛',
    vocab: [
      { ja: '湖', kana: 'みずうみ', romaji: 'mizuumi', vi: 'hồ', type: 'nature' },
      { ja: '牛肉', kana: 'ぎゅうにく', romaji: 'gyūniku', vi: 'thịt bò', type: 'food' },
      { ja: '魚', kana: 'さかな', romaji: 'sakana', vi: 'cá', type: 'food' },
    ],
  },
  // Kyoto
  {
    code: 'JP-26', nameJa: '京都府', nameKana: 'きょうとふ', nameRomaji: 'Kyōto',
    capital: '京都市', region: '近畿地方', lat: 35.02, lng: 135.76,
    famous: '金閣寺、抹茶、舞妓',
    vocab: [
      { ja: '寺', kana: 'てら', romaji: 'tera', vi: 'chùa/đền', type: 'place' },
      { ja: '抹茶', kana: 'まっちゃ', romaji: 'matcha', vi: 'trà matcha', type: 'food' },
      { ja: '着物', kana: 'きもの', romaji: 'kimono', vi: 'kimono', type: 'culture' },
      { ja: '舞妓', kana: 'まいこ', romaji: 'maiko', vi: 'nghệ nhân truyền thống', type: 'culture' },
      { ja: '桜', kana: 'さくら', romaji: 'sakura', vi: 'hoa anh đào', type: 'nature' },
    ],
  },
  // Osaka
  {
    code: 'JP-27', nameJa: '大阪府', nameKana: 'おおさかふ', nameRomaji: 'Ōsaka',
    capital: '大阪市', region: '近畿地方', lat: 34.69, lng: 135.50,
    famous: 'たこ焼き、お好み焼き、串カツ',
    vocab: [
      { ja: 'たこ焼き', kana: 'たこやき', romaji: 'takoyaki', vi: 'bánh bạch tuộc', type: 'food' },
      { ja: 'お好み焼き', kana: 'おこのみやき', romaji: 'okonomiyaki', vi: 'bánh xèo Nhật', type: 'food' },
      { ja: '城', kana: 'しろ', romaji: 'shiro', vi: 'lâu đài', type: 'place' },
      { ja: '商人', kana: 'しょうにん', romaji: 'shōnin', vi: 'thương nhân', type: 'culture' },
    ],
  },
  // Hyogo
  {
    code: 'JP-28', nameJa: '兵庫県', nameKana: 'ひょうごけん', nameRomaji: 'Hyōgo',
    capital: '神戸市', region: '近畿地方', lat: 34.69, lng: 135.18,
    famous: '神戸牛、明石焼き、姫路城',
    vocab: [
      { ja: '牛肉', kana: 'ぎゅうにく', romaji: 'gyūniku', vi: 'thịt bò', type: 'food' },
      { ja: '城', kana: 'しろ', romaji: 'shiro', vi: 'lâu đài', type: 'place' },
      { ja: '港', kana: 'みなと', romaji: 'minato', vi: 'cảng', type: 'place' },
    ],
  },
  // Nara
  {
    code: 'JP-29', nameJa: '奈良県', nameKana: 'ならけん', nameRomaji: 'Nara',
    capital: '奈良市', region: '近畿地方', lat: 34.69, lng: 135.83,
    famous: '鹿、東大寺、大仏',
    vocab: [
      { ja: '鹿', kana: 'しか', romaji: 'shika', vi: 'hươu', type: 'nature' },
      { ja: '大仏', kana: 'だいぶつ', romaji: 'daibutsu', vi: 'tượng Phật lớn', type: 'culture' },
      { ja: '古都', kana: 'こと', romaji: 'koto', vi: 'cố đô', type: 'place' },
    ],
  },
  // Wakayama
  {
    code: 'JP-30', nameJa: '和歌山県', nameKana: 'わかやまけん', nameRomaji: 'Wakayama',
    capital: '和歌山市', region: '近畿地方', lat: 34.23, lng: 135.17,
    famous: 'みかん、熊野古道、梅',
    vocab: [
      { ja: 'みかん', kana: 'みかん', romaji: 'mikan', vi: 'quýt', type: 'food' },
      { ja: '梅', kana: 'うめ', romaji: 'ume', vi: 'mận/hoa mai', type: 'food' },
      { ja: '道', kana: 'みち', romaji: 'michi', vi: 'con đường', type: 'place' },
    ],
  },
  // Tottori
  {
    code: 'JP-31', nameJa: '鳥取県', nameKana: 'とっとりけん', nameRomaji: 'Tottori',
    capital: '鳥取市', region: '中国地方', lat: 35.50, lng: 134.24,
    famous: '砂丘、松葉がに',
    vocab: [
      { ja: '砂', kana: 'すな', romaji: 'suna', vi: 'cát', type: 'nature' },
      { ja: '蟹', kana: 'かに', romaji: 'kani', vi: 'cua', type: 'food' },
      { ja: '丘', kana: 'おか', romaji: 'oka', vi: 'đồi', type: 'nature' },
    ],
  },
  // Shimane
  {
    code: 'JP-32', nameJa: '島根県', nameKana: 'しまねけん', nameRomaji: 'Shimane',
    capital: '松江市', region: '中国地方', lat: 35.47, lng: 133.05,
    famous: '出雲大社、宍道湖',
    vocab: [
      { ja: '神社', kana: 'じんじゃ', romaji: 'jinja', vi: 'đền thần', type: 'place' },
      { ja: '湖', kana: 'みずうみ', romaji: 'mizuumi', vi: 'hồ', type: 'nature' },
      { ja: '縁結び', kana: 'えんむすび', romaji: 'enmusubi', vi: 'kết duyên', type: 'culture' },
    ],
  },
  // Okayama
  {
    code: 'JP-33', nameJa: '岡山県', nameKana: 'おかやまけん', nameRomaji: 'Okayama',
    capital: '岡山市', region: '中国地方', lat: 34.66, lng: 133.93,
    famous: '桃、マスカット、後楽園',
    vocab: [
      { ja: '桃', kana: 'もも', romaji: 'momo', vi: 'đào', type: 'food' },
      { ja: 'ぶどう', kana: 'ぶどう', romaji: 'budō', vi: 'nho', type: 'food' },
      { ja: '庭園', kana: 'ていえん', romaji: 'teien', vi: 'vườn cảnh', type: 'place' },
    ],
  },
  // Hiroshima
  {
    code: 'JP-34', nameJa: '広島県', nameKana: 'ひろしまけん', nameRomaji: 'Hiroshima',
    capital: '広島市', region: '中国地方', lat: 34.40, lng: 132.46,
    famous: 'お好み焼き、牡蠣、原爆ドーム',
    vocab: [
      { ja: 'お好み焼き', kana: 'おこのみやき', romaji: 'okonomiyaki', vi: 'bánh xèo Nhật', type: 'food' },
      { ja: '牡蠣', kana: 'かき', romaji: 'kaki', vi: 'hàu', type: 'food' },
      { ja: '平和', kana: 'へいわ', romaji: 'heiwa', vi: 'hòa bình', type: 'culture' },
    ],
  },
  // Yamaguchi
  {
    code: 'JP-35', nameJa: '山口県', nameKana: 'やまぐちけん', nameRomaji: 'Yamaguchi',
    capital: '山口市', region: '中国地方', lat: 34.19, lng: 131.47,
    famous: 'フグ料理、錦帯橋',
    vocab: [
      { ja: 'フグ', kana: 'ふぐ', romaji: 'fugu', vi: 'cá nóc', type: 'food' },
      { ja: '橋', kana: 'はし', romaji: 'hashi', vi: 'cầu', type: 'place' },
      { ja: '川', kana: 'かわ', romaji: 'kawa', vi: 'sông', type: 'nature' },
    ],
  },
  // Tokushima
  {
    code: 'JP-36', nameJa: '徳島県', nameKana: 'とくしまけん', nameRomaji: 'Tokushima',
    capital: '徳島市', region: '四国地方', lat: 34.07, lng: 134.56,
    famous: 'すだち、阿波踊り',
    vocab: [
      { ja: '踊り', kana: 'おどり', romaji: 'odori', vi: 'múa', type: 'culture' },
      { ja: '渦潮', kana: 'うずしお', romaji: 'uzushio', vi: 'xoáy nước', type: 'nature' },
      { ja: '祭り', kana: 'まつり', romaji: 'matsuri', vi: 'lễ hội', type: 'culture' },
    ],
  },
  // Kagawa
  {
    code: 'JP-37', nameJa: '香川県', nameKana: 'かがわけん', nameRomaji: 'Kagawa',
    capital: '高松市', region: '四国地方', lat: 34.34, lng: 134.04,
    famous: 'うどん',
    vocab: [
      { ja: 'うどん', kana: 'うどん', romaji: 'udon', vi: 'mì udon', type: 'food' },
      { ja: '島', kana: 'しま', romaji: 'shima', vi: 'đảo', type: 'place' },
      { ja: '海', kana: 'うみ', romaji: 'umi', vi: 'biển', type: 'nature' },
    ],
  },
  // Ehime
  {
    code: 'JP-38', nameJa: '愛媛県', nameKana: 'えひめけん', nameRomaji: 'Ehime',
    capital: '松山市', region: '四国地方', lat: 33.84, lng: 132.77,
    famous: 'みかん、道後温泉',
    vocab: [
      { ja: 'みかん', kana: 'みかん', romaji: 'mikan', vi: 'quýt', type: 'food' },
      { ja: '温泉', kana: 'おんせん', romaji: 'onsen', vi: 'suối nước nóng', type: 'culture' },
      { ja: '城', kana: 'しろ', romaji: 'shiro', vi: 'lâu đài', type: 'place' },
    ],
  },
  // Kochi
  {
    code: 'JP-39', nameJa: '高知県', nameKana: 'こうちけん', nameRomaji: 'Kōchi',
    capital: '高知市', region: '四国地方', lat: 33.56, lng: 133.53,
    famous: 'カツオ（かつおのたたき）、よさこい祭り',
    vocab: [
      { ja: 'かつお', kana: 'かつお', romaji: 'katsuo', vi: 'cá ngừ vây vàng', type: 'food' },
      { ja: '踊り', kana: 'おどり', romaji: 'odori', vi: 'múa', type: 'culture' },
      { ja: '川', kana: 'かわ', romaji: 'kawa', vi: 'sông', type: 'nature' },
    ],
  },
  // Fukuoka
  {
    code: 'JP-40', nameJa: '福岡県', nameKana: 'ふくおかけん', nameRomaji: 'Fukuoka',
    capital: '福岡市', region: '九州地方', lat: 33.61, lng: 130.42,
    famous: 'とんこつラーメン、もつ鍋、明太子',
    vocab: [
      { ja: 'ラーメン', kana: 'らーめん', romaji: 'rāmen', vi: 'mì ramen', type: 'food' },
      { ja: '明太子', kana: 'めんたいこ', romaji: 'mentaiko', vi: 'trứng cá tuyết muối', type: 'food' },
      { ja: '博多', kana: 'はかた', romaji: 'Hakata', vi: 'Hakata (khu phố)', type: 'place' },
    ],
  },
  // Saga
  {
    code: 'JP-41', nameJa: '佐賀県', nameKana: 'さがけん', nameRomaji: 'Saga',
    capital: '佐賀市', region: '九州地方', lat: 33.27, lng: 130.30,
    famous: '有田焼、伊万里焼',
    vocab: [
      { ja: '陶器', kana: 'とうき', romaji: 'tōki', vi: 'đồ gốm', type: 'culture' },
      { ja: '焼き物', kana: 'やきもの', romaji: 'yakimono', vi: 'gốm sứ', type: 'culture' },
      { ja: '海', kana: 'うみ', romaji: 'umi', vi: 'biển', type: 'nature' },
    ],
  },
  // Nagasaki
  {
    code: 'JP-42', nameJa: '長崎県', nameKana: 'ながさきけん', nameRomaji: 'Nagasaki',
    capital: '長崎市', region: '九州地方', lat: 32.75, lng: 129.87,
    famous: 'ちゃんぽん、カステラ、軍艦島',
    vocab: [
      { ja: 'ちゃんぽん', kana: 'ちゃんぽん', romaji: 'chanpon', vi: 'mì chanpon', type: 'food' },
      { ja: 'カステラ', kana: 'かすてら', romaji: 'kasutera', vi: 'bánh castella', type: 'food' },
      { ja: '島', kana: 'しま', romaji: 'shima', vi: 'đảo', type: 'place' },
    ],
  },
  // Kumamoto
  {
    code: 'JP-43', nameJa: '熊本県', nameKana: 'くまもとけん', nameRomaji: 'Kumamoto',
    capital: '熊本市', region: '九州地方', lat: 32.79, lng: 130.74,
    famous: '熊本城、辛子蓮根、馬刺し',
    vocab: [
      { ja: '城', kana: 'しろ', romaji: 'shiro', vi: 'lâu đài', type: 'place' },
      { ja: '馬', kana: 'うま', romaji: 'uma', vi: 'ngựa', type: 'food' },
      { ja: '火山', kana: 'かざん', romaji: 'kazan', vi: 'núi lửa', type: 'nature' },
    ],
  },
  // Oita
  {
    code: 'JP-44', nameJa: '大分県', nameKana: 'おおいたけん', nameRomaji: 'Ōita',
    capital: '大分市', region: '九州地方', lat: 33.24, lng: 131.61,
    famous: '別府温泉、とり天',
    vocab: [
      { ja: '温泉', kana: 'おんせん', romaji: 'onsen', vi: 'suối nước nóng', type: 'culture' },
      { ja: '地獄', kana: 'じごく', romaji: 'jigoku', vi: 'địa ngục (suối nhiệt)', type: 'place' },
      { ja: '鶏', kana: 'とり', romaji: 'tori', vi: 'gà', type: 'food' },
    ],
  },
  // Miyazaki
  {
    code: 'JP-45', nameJa: '宮崎県', nameKana: 'みやざきけん', nameRomaji: 'Miyazaki',
    capital: '宮崎市', region: '九州地方', lat: 31.91, lng: 131.42,
    famous: 'チキン南蛮、マンゴー',
    vocab: [
      { ja: 'マンゴー', kana: 'まんごー', romaji: 'mangō', vi: 'xoài', type: 'food' },
      { ja: '鶏', kana: 'とり', romaji: 'tori', vi: 'gà', type: 'food' },
      { ja: '海', kana: 'うみ', romaji: 'umi', vi: 'biển', type: 'nature' },
    ],
  },
  // Kagoshima
  {
    code: 'JP-46', nameJa: '鹿児島県', nameKana: 'かごしまけん', nameRomaji: 'Kagoshima',
    capital: '鹿児島市', region: '九州地方', lat: 31.56, lng: 130.56,
    famous: '桜島、黒豚、芋焼酎',
    vocab: [
      { ja: '火山', kana: 'かざん', romaji: 'kazan', vi: 'núi lửa', type: 'nature' },
      { ja: '豚', kana: 'ぶた', romaji: 'buta', vi: 'lợn', type: 'food' },
      { ja: '焼酎', kana: 'しょうちゅう', romaji: 'shōchū', vi: 'rượu shochu', type: 'food' },
    ],
  },
  // Okinawa
  {
    code: 'JP-47', nameJa: '沖縄県', nameKana: 'おきなわけん', nameRomaji: 'Okinawa',
    capital: '那覇市', region: '九州地方', lat: 26.21, lng: 127.68,
    famous: 'ゴーヤチャンプルー、泡盛、珊瑚礁',
    vocab: [
      { ja: 'ゴーヤ', kana: 'ごーや', romaji: 'gōya', vi: 'mướp đắng', type: 'food' },
      { ja: '珊瑚', kana: 'さんご', romaji: 'sango', vi: 'san hô', type: 'nature' },
      { ja: '泡盛', kana: 'あわもり', romaji: 'awamori', vi: 'rượu awamori', type: 'food' },
      { ja: '海', kana: 'うみ', romaji: 'umi', vi: 'biển', type: 'nature' },
    ],
  },
  // Gifu (JP-21 missing)
  {
    code: 'JP-21', nameJa: '岐阜県', nameKana: 'ぎふけん', nameRomaji: 'Gifu',
    capital: '岐阜市', region: '中部地方', lat: 35.39, lng: 136.72,
    famous: '飛騨高山、合掌造り',
    vocab: [
      { ja: '合掌', kana: 'がっしょう', romaji: 'gasshō', vi: 'nhà mái dốc', type: 'culture' },
      { ja: '山', kana: 'やま', romaji: 'yama', vi: 'núi', type: 'nature' },
      { ja: '川', kana: 'かわ', romaji: 'kawa', vi: 'sông', type: 'nature' },
    ],
  },
];

export const PREFECTURE_BY_CODE = Object.fromEntries(
  PREFECTURES.map((p) => [p.code, p]),
);

export const TYPE_COLOR: Record<string, string> = {
  food: '#ef4444',
  place: '#3b82f6',
  culture: '#8b5cf6',
  nature: '#16a34a',
};

export const TYPE_LABEL: Record<string, string> = {
  food: '食べ物',
  place: '場所',
  culture: '文化',
  nature: '自然',
};
