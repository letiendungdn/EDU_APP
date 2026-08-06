/** Nội dung tĩnh — quy tắc phát âm tiếng Nhật (giải thích tiếng Việt). */
export interface PronunciationRulePoint {
  label?: string;
  japanese?: string;
  romaji?: string;
  explanation: string;
}

export interface PronunciationRuleExample {
  japanese: string;
  romaji: string;
  meaning: string;
  note?: string;
}

export interface PronunciationRuleSection {
  id: string;
  title: string;
  summary: string;
  points: PronunciationRulePoint[];
  examples?: PronunciationRuleExample[];
}

export interface JapanesePronunciationRulesPayload {
  intro: string;
  tipsForVietnamese: string[];
  sections: PronunciationRuleSection[];
}

export const JAPANESE_PRONUNCIATION_RULES: JapanesePronunciationRulesPayload = {
  intro:
    "Tiếng Nhật có khoảng 46 âm cơ bản (mora). Mỗi chữ hiragana/katakana thường tương ứng một mora — phát âm đều, không nhấn âm tiết như tiếng Việt.",
  tipsForVietnamese: [
    'Giữ miệng mở vừa phải; âm あ gần âm "a" ngắn, không kéo dài như "a" trong "ba".',
    "Âm ら hàng r không lắc lưỡi — lưỡi chạm vòm miệng nhẹ rồi buông.",
    'Âm ふ/フ gần "hu" thổi nhẹ, không phải "ph" hay "f" cứng như tiếng Anh.',
    'Âm つ nhỏ, sát răng — không phát âm như "ts" tách rời hai âm.',
    "Âm ん thay đổi khẩu hình theo âm sau: trước M/P/B → [m]; T/D/N/R/Z → [n]; K/G → [ŋ]; cuối từ / trước nguyên âm → mũi [ɴ].",
    "Kéo dài nguyên âm (おばあさん) khác hẳn nguyên âm ngắn (おばさん) — sai độ dài là sai nghĩa.",
  ],
  sections: [
    {
      id: "vowels",
      title: "Năm nguyên âm あ・い・う・え・お",
      summary: "Nền tảng của mọi âm tiếng Nhật.",
      points: [
        {
          japanese: "あ い う え お",
          romaji: "a i u e o",
          explanation:
            'Năm nguyên âm thuần. Mỗi âm một mora, độ dài ổn định. う môi tròn nhẹ, không phải "u" mím chặt.',
        },
        {
          label: "Bảng kana",
          explanation:
            "Hiragana dùng cho từ gốc Nhật; katakana cho từ mượn. Cùng âm, khác cách viết.",
        },
      ],
      examples: [
        { japanese: "あめ", romaji: "ame", meaning: "mưa / kẹo" },
        { japanese: "いぬ", romaji: "inu", meaning: "chó" },
        { japanese: "うみ", romaji: "umi", meaning: "biển" },
      ],
    },
    {
      id: "mora",
      title: "Mora — nhịp phát âm",
      summary: "Tiếng Nhật đếm theo mora, không phải âm tiết.",
      points: [
        {
          explanation:
            "Mỗi kana (trừ っ, ん đặc biệt) thường = 1 mora. きょう (kyo) = 3 mora: き + ょ + う.",
        },
        {
          explanation:
            "Nói đều nhịp, không nhấn mạnh từng âm tiết như tiếng Việt. Thời lượng mỗi mora gần bằng nhau.",
        },
      ],
      examples: [
        {
          japanese: "にほん",
          romaji: "ni-ho-n",
          meaning: "Nhật Bản",
          note: "4 mora",
        },
        {
          japanese: "がっこう",
          romaji: "ga-k-ko-u",
          meaning: "trường học",
          note: "っ = mora dừng",
        },
      ],
    },
    {
      id: "yoon",
      title: "Âm ghép きゃ・しゅ・ちょ…",
      summary: "Ghép âm i-row + や・ゆ・よ nhỏ.",
      points: [
        {
          japanese: "きゃ きゅ きょ",
          romaji: "kya kyu kyo",
          explanation: 'Ghép trong một mora — không đọc "ki-ya" tách đôi.',
        },
        {
          japanese: "しゃ しゅ しょ",
          romaji: "sha shu sho",
          explanation: 'Âm sh — môi tròn, lưỡi nâng. Không đọc "si-ya".',
        },
        {
          japanese: "ちゃ ちゅ ちょ",
          romaji: "cha chu cho",
          explanation: 'Gần "chi" + y nhỏ; khác với しゃ (sh).',
        },
      ],
      examples: [
        { japanese: "きょう", romaji: "kyou", meaning: "hôm nay" },
        { japanese: "しゃしん", romaji: "shashin", meaning: "ảnh" },
        { japanese: "ちょっと", romaji: "chotto", meaning: "một chút" },
      ],
    },
    {
      id: "sokuon",
      title: "Âm đôi っ (sokuon)",
      summary: "Dấu nhỏ — tạo khoảng dừng / phụ âm kép.",
      points: [
        {
          japanese: "っ",
          explanation:
            "Không phát âm riêng — tạm dừng rồi phát âm phụ âm kế tiếp mạnh hơn (kk, pp, tt…).",
        },
        {
          explanation:
            'Ví dụ がっこう: dừng nhẹ trước こ, như "gak-kou" chứ không "gatsukou".',
        },
      ],
      examples: [
        { japanese: "いっぷん", romaji: "ippun", meaning: "một phút" },
        { japanese: "きって", romaji: "kitte", meaning: "tem" },
        { japanese: "ざっし", romaji: "zasshi", meaning: "tạp chí" },
      ],
    },
    {
      id: "long-vowel",
      title: "Trường âm (chouon)",
      summary: "Kéo dài nguyên âm — đổi nghĩa nếu đọc sai độ dài.",
      points: [
        {
          explanation:
            "おばさん (cô) vs おばあさん (bà) — mora あ kéo dài gấp đôi. きょう vs きよう cũng khác mora.",
        },
        {
          explanation:
            "Katakana dùng ー để kéo dài: コーヒー (koohii). Hiragana thường lặp nguyên âm.",
        },
      ],
      examples: [
        { japanese: "おばさん", romaji: "obasan", meaning: "cô, dì" },
        { japanese: "おばあさん", romaji: "obaasan", meaning: "bà" },
        { japanese: "ビール", romaji: "biiru", meaning: "bia" },
      ],
    },
    {
      id: "dakuten",
      title: "Âm đục が・ざ & yếu ぱ",
      summary: "Dấu ゛ (dakuten) và ゜ (handakuten).",
      points: [
        {
          japanese: "か → が",
          explanation: "Thêm rung thanh hầu — ga, không phải ka.",
        },
        {
          japanese: "は → ば / ぱ",
          explanation: 'ば đục; ぱ yếu (p gần b). は đọc "wa" khi là trợ từ.',
        },
        {
          japanese: "ざ じ ず ぜ ぞ",
          explanation:
            'じ ≈ "ji", ず ≈ "zu" — không giống "di", "du" tiếng Việt.',
        },
      ],
      examples: [
        { japanese: "かぎ", romaji: "kagi", meaning: "chìa khóa" },
        { japanese: "ぱん", romaji: "pan", meaning: "bánh mì" },
        { japanese: "じかん", romaji: "jikan", meaning: "thời gian" },
      ],
    },
    {
      id: "special",
      title: "Âm đặc biệt: ら・ふ・つ・ん",
      summary: "Hay sai với người Việt.",
      points: [
        {
          japanese: "らりるれろ",
          romaji: "ra ri ru re ro",
          explanation: "Một âm r lẫn l — lưỡi chạm vòm, không lắc.",
        },
        {
          japanese: "ふ",
          romaji: "fu",
          explanation: 'Thổi nhẹ qua môi, gần "hu".',
        },
        {
          japanese: "つ",
          romaji: "tsu",
          explanation: "Âm xát nhẹ, một mora duy nhất.",
        },
        {
          japanese: "ん",
          romaji: "n",
          explanation:
            "Âm mũi — khẩu hình đổi theo âm sau (xem mục «Âm ん — biến thể phát âm»). Cuối từ không thêm nguyên âm.",
        },
      ],
      examples: [
        { japanese: "ふろ", romaji: "furo", meaning: "bồn tắm" },
        { japanese: "つき", romaji: "tsuki", meaning: "mặt trăng" },
        { japanese: "せんせい", romaji: "sensei", meaning: "thầy/cô" },
      ],
    },
    {
      id: "n-assimilation",
      title: "Âm ん — biến thể phát âm",
      summary:
        "ん không phát âm một kiểu cố định: khẩu hình và vị trí lưỡi đổi theo âm ngay sau nó.",
      points: [
        {
          label: "[m] — mím môi",
          japanese: "ん → [m]",
          explanation:
            "Khi ん đứng trước hàng M / P / B (ま・ぱ・ば…). Vì các âm này cần mím môi, ん tự chuyển thành /m/.",
        },
        {
          label: "[n] — đầu lưỡi chạm vòm lợi",
          japanese: "ん → [n]",
          explanation:
            "Khi ん đứng trước hàng T / D / N / R / Z (た・だ・な・ら・ざ…). Lưỡi chạm vòm lợi trên như âm n tiếng Việt.",
        },
        {
          label: "[ŋ] — như «ng» tiếng Việt",
          japanese: "ん → [ŋ]",
          explanation:
            "Khi ん đứng trước hàng K / G (か・き・く… / が・ぎ…). Phát âm gần «ng» trong «ngân», «mang».",
        },
        {
          label: "[ɴ] — mũi / thoát hơi",
          japanese: "ん → [ɴ]",
          explanation:
            "Khi ん ở cuối từ, hoặc đứng trước nguyên âm (あいうえお), hàng Y/W (や・ゆ・よ・わ), và hàng gió S/H (さ・は…). Mở khẩu hình, hơi thoát qua mũi — không chạm hẳn lưỡi lên vòm miệng.",
        },
        {
          label: "Mẹo nhớ",
          explanation:
            "Chuẩn bị khẩu hình cho âm tiếp theo: trước P/B/M → M; trước K/G → NG; trước T/D/N → N. Không cần thuộc ký hiệu IPA.",
        },
      ],
      examples: [
        {
          japanese: "あんぱん",
          romaji: "am-pan",
          meaning: "bánh nhân đậu đỏ",
          note: "[m] trước P",
        },
        {
          japanese: "日本橋",
          romaji: "ni-hom-ba-shi",
          meaning: "Nihonbashi",
          note: "[m] trước B",
        },
        {
          japanese: "さんま",
          romaji: "sam-ma",
          meaning: "cá thu đao",
          note: "[m] trước M",
        },
        {
          japanese: "乾杯",
          romaji: "kam-pai",
          meaning: "cạn ly",
          note: "[m] trước P (không phải [n])",
        },
        {
          japanese: "反対",
          romaji: "han-tai",
          meaning: "phản đối",
          note: "[n] trước T",
        },
        {
          japanese: "案内",
          romaji: "an-nai",
          meaning: "hướng dẫn",
          note: "[n] trước N",
        },
        {
          japanese: "連絡",
          romaji: "ren-ra-ku",
          meaning: "liên lạc",
          note: "[n] trước R",
        },
        {
          japanese: "天気",
          romaji: "teng-ki",
          meaning: "thời tiết",
          note: "[ŋ] trước K",
        },
        {
          japanese: "漫画",
          romaji: "mang-ga",
          meaning: "truyện tranh",
          note: "[ŋ] trước G",
        },
        {
          japanese: "銀行",
          romaji: "ging-kou",
          meaning: "ngân hàng",
          note: "[ŋ] trước K",
        },
        {
          japanese: "本",
          romaji: "hon",
          meaning: "sách",
          note: "[ɴ] cuối từ",
        },
        {
          japanese: "恋愛",
          romaji: "ren-ai",
          meaning: "tình yêu",
          note: "[ɴ] trước nguyên âm あ",
        },
      ],
    },
    {
      id: "pitch",
      title: "Pitch accent (âm cao–thấp)",
      summary: "Cùng kana nhưng cao độ khác → nghĩa khác (ít gặp N5).",
      points: [
        {
          explanation:
            "Tiếng Nhật dùng cao độ mora, không nhấn trọng âm như tiếng Anh. Mỗi từ có kiểu lên–xuống riêng.",
        },
        {
          explanation:
            "N5: nghe mẫu và bắt chước. は trợ từ thường thấp; một số từ danh từ cao ở mora đầu.",
        },
      ],
      examples: [
        {
          japanese: "はし",
          romaji: "hashi",
          meaning: "đũa / cầu",
          note: "Pitch khác nhau",
        },
        { japanese: "いま", romaji: "ima", meaning: "bây giờ / phòng" },
      ],
    },
    {
      id: "practice",
      title: "Luyện trên app",
      summary: "Cách dùng tab Phát âm hiệu quả.",
      points: [
        {
          explanation:
            'Tab Kana: luyện từng âm hiragana/katakana. Bật "Phát âm mẫu khi chuyển thẻ" để nghe ngay.',
        },
        {
          explanation:
            "Tab Từ vựng Minna: luyện theo bài. Ghi âm → nghe lại → so với mẫu.",
        },
        {
          explanation:
            "Lật thẻ xem gợi ý romaji/nghĩa. Lặp lại âm khó (ら, つ, っ, ん biến thể, trường âm) mỗi ngày.",
        },
      ],
    },
  ],
};
