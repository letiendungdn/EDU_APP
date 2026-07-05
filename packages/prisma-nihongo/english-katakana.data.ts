/** Nội dung tĩnh — tương quan âm tiếng Anh và katakana (gairaigo). */
export interface EnglishKatakanaPoint {
  explanation: string;
  english?: string;
  katakana?: string;
  romaji?: string;
}

export interface EnglishKatakanaMapping {
  english: string;
  katakana: string;
  romaji: string;
  note?: string;
}

export interface EnglishKatakanaExample {
  english: string;
  katakana: string;
  romaji: string;
  meaningVi: string;
  note?: string;
}

export interface EnglishKatakanaSection {
  id: string;
  title: string;
  summary: string;
  points?: EnglishKatakanaPoint[];
  mappings?: EnglishKatakanaMapping[];
  examples?: EnglishKatakanaExample[];
}

export interface EnglishKatakanaPayload {
  intro: string;
  tipsForVietnamese: string[];
  sections: EnglishKatakanaSection[];
}

export const ENGLISH_KATAKANA: EnglishKatakanaPayload = {
  intro:
    'Tiếng Nhật không có đủ âm để bắt chước tiếng Anh nguyên bản. Khi mượn từ nước ngoài (gairaigo 外来語), người Nhật ghi bằng katakana theo cách nghe gần nhất với hệ âm tiếng Nhật — thường ngắn hơn, không có phụ âm cuối phức tạp, và dùng 長音 (ー) cho nguyên âm dài.',
  tipsForVietnamese: [
    'Đừng đọc katakana như đọc chữ Latin — hãy nghĩ "âm Nhật hóa" của từ tiếng Anh.',
    'Âm L và R trong tiếng Anh thường gộp thành ラ行 (ra, ri, ru, re, ro) — ví dụ love → ラブ.',
    'Âm V không có trong tiếng Nhật cổ — thường dùng バ行 hoặc ヴ + nguyên âm (violet → ヴァイオレット).',
    'Âm TH thường thành ス hoặc テ (think → シンク, three → スリー).',
    'Nguyên âm dài trong tiếng Anh hay được kéo bằng ー: coffee → コーヒー, table → テーブル.',
    'Phụ âm cuối bị cắt hoặc thêm nguyên âm: bus → バス, bed → ベッド.',
    'Khi nghe podcast hay anime, nhận diện gairaigo giúp đoán nghĩa nhanh hơn từ kanji.',
    'Giáo trình Minna thường chỉ liệt kê từ — 6 quy luật chuyển âm bên dưới mới giúp anh tự đoán cách viết katakana.',
  ],
  sections: [
    {
      id: 'gairaigo',
      title: 'Gairaigo — từ mượn tiếng Anh',
      summary: 'Vì sao coffee viết コーヒー chứ không phải hiragana.',
      points: [
        {
          explanation:
            'Gairaigo (外来語) là từ mượn từ tiếng Anh, Pháp, Đức… Katakana báo hiệu "đây không phải từ gốc Nhật".',
        },
        {
          explanation:
            'Cách viết theo âm nghe được (音写 onsha), không theo chính tả tiếng Anh — computer và kompyuutaa cùng một dòng âm.',
          english: 'computer',
          katakana: 'コンピューター',
          romaji: 'konpyuutaa',
        },
        {
          explanation:
            'Nhiều từ hàng ngày ở Nhật là gairaigo: ホテル, レストラン, スマホ — người Việt học N5 nên quen sớm.',
        },
      ],
    },
    {
      id: 'six-core-rules',
      title: '6 quy luật chuyển âm (giáo trình hay bỏ sót)',
      summary:
        'Nắm 6 quy tắc này là có thể tự chuyển hầu hết từ tiếng Anh sang katakana — phần lớn sách N5 chỉ cho ví dụ mà không giải thích hệ thống.',
      points: [
        {
          explanation:
            'Quy luật 1 — Thêm nguyên âm sau phụ âm đứng một mình: tiếng Nhật gần như chỉ có âm tiết CV (phụ âm + nguyên âm). Phụ âm cuối từ phải được "vá" bằng nguyên âm.',
        },
        {
          explanation:
            'Kết thúc bằng t hoặc d → thêm o. Kết thúc bằng c, b, f, g, k, l, m, p, s → thêm u. Ngoại lệ: salad → サラダ (không thêm u sau d).',
          english: 'hint / mask / post',
          katakana: 'ヒント / マスク / ポスト',
          romaji: 'hinto / masuku / posuto',
        },
        {
          explanation:
            'Quy luật 2 — Thay âm tiếng Anh không có trong tiếng Nhật bằng âm gần nhất. Đây là lý do love→ラブ, think→シンク, fan→ファン.',
        },
        {
          explanation:
            'Quy luật 3 — Trường âm ー cho nguyên âm dài: -ar/-er/-or → カー/ター, -ee/-ea/-oo → スピード/チーズ/ルーム, -w/-y cuối → ショー/コピー.',
          english: 'car / speed / show',
          katakana: 'カー / スピード / ショー',
          romaji: 'kaa / supiido / shoo',
        },
        {
          explanation:
            'Quy luật 4 — Âm ngắt ッ (sokuon) khi có phụ âm "dừng" sau nguyên âm ngắn: -ck/-x/-tch, -ss/-pp/-tt, hoặc -at/-ap/-et/-ip/-op...',
          english: 'block / staff / ship',
          katakana: 'ブロック / スタッフ / シップ',
          romaji: 'burokku / sutaffu / shippu',
        },
        {
          explanation:
            'Quy luật 5 — Katakana ghép (ャュョィェォヴ): dùng ký tự nhỏ để bắt âm ti, di, fa, tu, du, v… mà bảng 50 âm không có. Cat ngày nay là キャット, không phải カット.',
          english: 'cat / gap / duet',
          katakana: 'キャット / ギャップ / デュエット',
          romaji: 'kyatto / gyappu / dyuetto',
        },
        {
          explanation:
            'Quy luật 6 — Tách cụm phụ âm bằng nguyên âm (thường u): tiếng Anh có st, tr, dr, spr… tiếng Nhật chèn u để mỗi mora vẫn là CV.',
          english: 'street / spring / drive',
          katakana: 'ストリート / スプリング / ドライブ',
          romaji: 'sutoriito / supuringu / doraibu',
        },
      ],
      mappings: [
        {
          english: '1. Thêm nguyên âm',
          katakana: 't,d→オ / c,b,f,g,k,l,m,p,s→ウ',
          romaji: '—',
          note: 'hint→ヒント, mask→マスク',
        },
        {
          english: '2. Thay âm không có',
          katakana: 'L/R→ラ行, V→ヴ/バ, TH→ス/テ',
          romaji: '—',
          note: 'love→ラブ, violin→ヴァイオリン',
        },
        {
          english: '3. Trường âm ー',
          katakana: '-ar/-er→アー/ター, -ee/-oo→イー/ウー',
          romaji: '—',
          note: 'car→カー, game→ゲーム',
        },
        {
          english: '4. Âm ngắt ッ',
          katakana: 'sau nguyên âm ngắn + p,t,k…',
          romaji: '—',
          note: 'match→マッチ, book→ブック',
        },
        {
          english: '5. Kana ghép nhỏ',
          katakana: 'ティ, ファ, トゥ, デュ, ヴ',
          romaji: '—',
          note: 'party→パーティー, fan→ファン',
        },
        {
          english: '6. Tách cụm phụ âm',
          katakana: 'chèn ウ (hoặc オ)',
          romaji: '—',
          note: 'stress→ストレス, truck→トラック',
        },
      ],
      examples: [
        {
          english: 'automation',
          katakana: 'オートメーション',
          romaji: 'ootomeeshon',
          meaningVi: 'tự động hóa',
          note: 'quy luật 3: -ation',
        },
        {
          english: 'culture',
          katakana: 'カルチャー',
          romaji: 'karuchaa',
          meaningVi: 'văn hóa',
          note: 'quy luật 3: -ture',
        },
        {
          english: 'cookie',
          katakana: 'クッキー',
          romaji: 'kukkii',
          meaningVi: 'bánh quy',
          note: 'quy luật 4: -oo- + ッ',
        },
        {
          english: 'tomorrow',
          katakana: 'トゥモロー',
          romaji: 'tumoroo',
          meaningVi: 'ngày mai',
          note: 'quy luật 5: トゥ',
        },
        {
          english: 'salad',
          katakana: 'サラダ',
          romaji: 'sarada',
          meaningVi: 'salad',
          note: 'ngoại lệ quy luật 1 — không thêm u',
        },
        {
          english: 'picnic',
          katakana: 'ピクニック',
          romaji: 'pikunikku',
          meaningVi: 'dã ngoại',
          note: 'ngoại lệ quy luật 4 — ッ chỉ ở âm tiết cuối',
        },
      ],
    },
    {
      id: 'basic-cv',
      title: 'Bảng âm cơ bản (consonant + vowel)',
      summary: 'Mỗi âm tiếng Anh thường map sang một hoặc vài kana.',
      mappings: [
        { english: 'a', katakana: 'ア', romaji: 'a', note: 'cat, apple' },
        { english: 'i', katakana: 'イ', romaji: 'i', note: 'it, big' },
        { english: 'u', katakana: 'ウ', romaji: 'u', note: 'put (môi tròn)' },
        { english: 'e', katakana: 'エ', romaji: 'e', note: 'bed, pen' },
        { english: 'o', katakana: 'オ', romaji: 'o', note: 'hot, dog' },
        { english: 'ka', katakana: 'カ', romaji: 'ka' },
        { english: 'ki', katakana: 'キ', romaji: 'ki' },
        { english: 'ku', katakana: 'ク', romaji: 'ku' },
        { english: 'ke', katakana: 'ケ', romaji: 'ke' },
        { english: 'ko', katakana: 'コ', romaji: 'ko' },
        { english: 'sa', katakana: 'サ', romaji: 'sa' },
        { english: 'shi', katakana: 'シ', romaji: 'shi', note: 'she, ship' },
        { english: 'su', katakana: 'ス', romaji: 'su' },
        { english: 'ta', katakana: 'タ', romaji: 'ta' },
        { english: 'chi', katakana: 'チ', romaji: 'chi', note: 'cheese' },
        { english: 'tsu', katakana: 'ツ', romaji: 'tsu', note: 'cats,itsu' },
        { english: 'na', katakana: 'ナ', romaji: 'na' },
        { english: 'ni', katakana: 'ニ', romaji: 'ni' },
        { english: 'no', katakana: 'ノ', romaji: 'no' },
        { english: 'ha', katakana: 'ハ', romaji: 'ha' },
        { english: 'fu', katakana: 'フ', romaji: 'fu', note: 'food, phone' },
        { english: 'ma', katakana: 'マ', romaji: 'ma' },
        { english: 'mi', katakana: 'ミ', romaji: 'mi' },
        { english: 'mo', katakana: 'モ', romaji: 'mo' },
        { english: 'ya', katakana: 'ヤ', romaji: 'ya' },
        { english: 'yu', katakana: 'ユ', romaji: 'yu' },
        { english: 'yo', katakana: 'ヨ', romaji: 'yo' },
        { english: 'ra', katakana: 'ラ', romaji: 'ra' },
        { english: 'ri', katakana: 'リ', romaji: 'ri' },
        { english: 'ru', katakana: 'ル', romaji: 'ru' },
        { english: 're', katakana: 'レ', romaji: 're' },
        { english: 'ro', katakana: 'ロ', romaji: 'ro' },
        { english: 'wa', katakana: 'ワ', romaji: 'wa' },
        { english: 'n', katakana: 'ン', romaji: 'n', note: 'cuối âm tiết' },
      ],
    },
    {
      id: 'english-sounds',
      title: 'Âm đặc trưng tiếng Anh → katakana',
      summary: 'L/R, V, F, TH, W và các tổ hợp khó.',
      mappings: [
        { english: 'L / R', katakana: 'ラ・リ・ル・レ・ロ', romaji: 'ra ri ru re ro', note: 'love, red, radio' },
        { english: 'V', katakana: 'ヴ / バ', romaji: 'vu / ba', note: 'violin → ヴァイオリン' },
        { english: 'F', katakana: 'フ / ファ', romaji: 'fu / fa', note: 'fan → ファン' },
        { english: 'TH', katakana: 'ス / テ / シ', romaji: 'su / te / shi', note: 'think, three, this' },
        { english: 'W', katakana: 'ワ / ウ', romaji: 'wa / u', note: 'water → ウォーター' },
        { english: 'X', katakana: 'クス / キス', romaji: 'kusu / kisu', note: 'box → ボックス' },
        { english: 'ti / di', katakana: 'ティ / ディ', romaji: 'ti / di', note: 'party, radio' },
        { english: 'tu / du', katakana: 'トゥ / ドゥ', romaji: 'tu / du', note: 'tour, due' },
        { english: 'sh / ch', katakana: 'シュ / チュ', romaji: 'shu / chu', note: 'shoes, cheese' },
        { english: 'j', katakana: 'ジ / ジェ', romaji: 'ji / je', note: 'jazz, juice' },
        { english: '-er', katakana: 'アー / ー', romaji: 'aa / long', note: 'computer, driver' },
        { english: '-le', katakana: 'ル', romaji: 'ru', note: 'table, apple' },
      ],
    },
    {
      id: 'long-vowel',
      title: 'Trường âm ー (chōon)',
      summary: 'Nguyên âm dài tiếng Anh thường được kéo trong katakana.',
      points: [
        {
          explanation:
            'Dấu ー kéo dài nguyên âm trước đó một mora. Không phát âm như chữ "i" riêng — コーヒー là 4 mora: コ + ー + ヒ + ー.',
          english: 'coffee',
          katakana: 'コーヒー',
          romaji: 'koohii',
        },
        {
          explanation:
            'Âm "oo" trong English thường → ウ + ー hoặc オ + ー: room → ルーム, door → ドア.',
        },
        {
          explanation:
            'Âm "ee" thường → イ + ー hoặc エ + ー: cheese → チーズ, meet → ミート.',
        },
      ],
      examples: [
        { english: 'coffee', katakana: 'コーヒー', romaji: 'koohii', meaningVi: 'cà phê' },
        { english: 'hotel', katakana: 'ホテル', romaji: 'hoteru', meaningVi: 'khách sạn' },
        { english: 'table', katakana: 'テーブル', romaji: 'teeburu', meaningVi: 'bàn' },
        { english: 'game', katakana: 'ゲーム', romaji: 'geemu', meaningVi: 'trò chơi' },
        { english: 'music', katakana: 'ミュージック', romaji: 'myuujikku', meaningVi: 'âm nhạc' },
      ],
    },
    {
      id: 'common-words',
      title: 'Từ tiếng Anh thường gặp',
      summary: 'Bảng tra nhanh — nghe mẫu để quen tai.',
      examples: [
        { english: 'smartphone', katakana: 'スマホ', romaji: 'sumaho', meaningVi: 'điện thoại thông minh', note: 'viết tắt phổ biến' },
        { english: 'computer', katakana: 'コンピューター', romaji: 'konpyuutaa', meaningVi: 'máy tính' },
        { english: 'internet', katakana: 'インターネット', romaji: 'intaanetto', meaningVi: 'mạng internet' },
        { english: 'restaurant', katakana: 'レストラン', romaji: 'resutoran', meaningVi: 'nhà hàng' },
        { english: 'taxi', katakana: 'タクシー', romaji: 'takushii', meaningVi: 'taxi' },
        { english: 'bus', katakana: 'バス', romaji: 'basu', meaningVi: 'xe buýt' },
        { english: 'ticket', katakana: 'チケット', romaji: 'chiketto', meaningVi: 'vé' },
        { english: 'test', katakana: 'テスト', romaji: 'tesuto', meaningVi: 'bài kiểm tra' },
        { english: 'part-time job', katakana: 'アルバイト', romaji: 'arubaito', meaningVi: 'việc làm thêm', note: 'từ Đức Arbeit' },
        { english: 'air conditioner', katakana: 'エアコン', romaji: 'eakon', meaningVi: 'máy lạnh', note: 'viết tắt' },
        { english: 'pen', katakana: 'ペン', romaji: 'pen', meaningVi: 'bút' },
        { english: 'milk', katakana: 'ミルク', romaji: 'miruku', meaningVi: 'sữa' },
        { english: 'bread', katakana: 'パン', romaji: 'pan', meaningVi: 'bánh mì', note: 'từ Pháp pain' },
        { english: 'chocolate', katakana: 'チョコレート', romaji: 'chokoreeto', meaningVi: 'sô-cô-la' },
        { english: 'camera', katakana: 'カメラ', romaji: 'kamera', meaningVi: 'máy ảnh' },
        { english: 'email', katakana: 'メール', romaji: 'meeru', meaningVi: 'email' },
      ],
    },
    {
      id: 'tricky',
      title: 'Dễ nhầm — đọc không như chữ Anh',
      summary: 'Một số từ nghe khác hẳn so với orthography tiếng Anh.',
      examples: [
        { english: 'iron', katakana: 'アイロン', romaji: 'airon', meaningVi: 'bàn ủi', note: 'không phải "sắt"' },
        { english: 'mansion', katakana: 'マンション', romaji: 'manshon', meaningVi: 'chung cư cao tầng', note: 'không phải biệt thự' },
        { english: 'smart', katakana: 'スマート', romaji: 'sumaato', meaningVi: 'gầy, thon', note: 'không chỉ "thông minh"' },
        { english: 'service', katakana: 'サービス', romaji: 'saabisu', meaningVi: 'đồ miễn phí / phục vụ', note: 'コンビニ service = đồ tặng kèm' },
        { english: 'juice', katakana: 'ジュース', romaji: 'juusu', meaningVi: 'nước ép / soda', note: 'thường gồm cả nước ngọt' },
        { english: 'handle', katakana: 'ハンドル', romaji: 'handoru', meaningVi: 'vô-lăng xe', note: 'không phải tay cầm cửa' },
        { english: 'claim', katakana: 'クレーム', romaji: 'kureemu', meaningVi: 'khiếu nại' },
        { english: 'talent', katakana: 'タレント', romaji: 'tarento', meaningVi: 'nghệ sĩ TV' },
      ],
    },
  ],
};
