/** Sơ đồ tư duy ngữ pháp JLPT — nhánh chủ đề + mẫu tiêu biểu (link sang /grammar). */

export type GrammarMindLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export type GrammarMindPattern = {
  pattern: string;
  meaning: string;
  /** Lesson trong app để mở GrammarView */
  lessonNumber?: number;
};

export type GrammarMindBranch = {
  id: string;
  label: string;
  labelJa?: string;
  hint?: string;
  patterns: GrammarMindPattern[];
};

export type GrammarMindMapLevel = {
  level: GrammarMindLevel;
  title: string;
  summary: string;
  accent: string;
  branches: GrammarMindBranch[];
};

export const GRAMMAR_MIND_LEVELS: GrammarMindLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

export const GRAMMAR_MIND_MAP: GrammarMindMapLevel[] = [
  {
    level: 'N5',
    title: 'Nền tảng giao tiếp',
    summary: 'Câu đơn, trợ từ cơ bản, tính từ, thì hiện tại/quá khứ, nghi vấn.',
    accent: '#22c55e',
    branches: [
      {
        id: 'n5-particles',
        label: 'Trợ từ cơ bản',
        labelJa: '助詞',
        hint: 'は・が・を・に・で・へ・と・も・の',
        patterns: [
          { pattern: 'N は N です', meaning: 'A là B', lessonNumber: 1 },
          { pattern: 'N が あります／います', meaning: 'có (vật / người, động vật)', lessonNumber: 10 },
          { pattern: 'N で V', meaning: 'làm gì bằng / tại nơi', lessonNumber: 7 },
          { pattern: 'N に 行きます', meaning: 'đi đến đâu', lessonNumber: 5 },
        ],
      },
      {
        id: 'n5-copula',
        label: 'Câu danh từ & lịch sự',
        labelJa: 'です／ます',
        patterns: [
          { pattern: '〜です／〜ではありません', meaning: 'là / không phải là', lessonNumber: 1 },
          { pattern: 'Vます／Vません／Vました', meaning: 'thể lịch sự động từ', lessonNumber: 6 },
          { pattern: '〜ください', meaning: 'xin hãy ~', lessonNumber: 14 },
        ],
      },
      {
        id: 'n5-adj',
        label: 'Tính từ',
        labelJa: 'い／な形容詞',
        patterns: [
          { pattern: 'い-adj + です', meaning: 'tính từ đuôi い', lessonNumber: 8 },
          { pattern: 'な-adj + です', meaning: 'tính từ đuôi な', lessonNumber: 8 },
          { pattern: 'Adj + く／に + V', meaning: 'tính từ bổ nghĩa động từ', lessonNumber: 8 },
        ],
      },
      {
        id: 'n5-question',
        label: 'Nghi vấn & nghi từ',
        labelJa: '疑問',
        patterns: [
          { pattern: '〜か', meaning: 'câu hỏi có/không', lessonNumber: 2 },
          { pattern: '何／どこ／だれ／いつ', meaning: 'nghi từ cơ bản', lessonNumber: 2 },
          { pattern: 'どの＋N／どれ', meaning: 'cái nào', lessonNumber: 9 },
        ],
      },
      {
        id: 'n5-time',
        label: 'Thời gian & số đếm',
        labelJa: '時・数',
        patterns: [
          { pattern: '〜時に V', meaning: 'làm lúc mấy giờ', lessonNumber: 4 },
          { pattern: '〜から〜まで', meaning: 'từ … đến …', lessonNumber: 4 },
          { pattern: '〜ましょう', meaning: 'cùng làm nhé', lessonNumber: 6 },
        ],
      },
      {
        id: 'n5-want',
        label: 'Ý muốn & sở thích',
        labelJa: 'ほしい・たい',
        patterns: [
          { pattern: 'Vたいです', meaning: 'muốn làm ~', lessonNumber: 13 },
          { pattern: 'N が ほしいです', meaning: 'muốn có ~', lessonNumber: 13 },
          { pattern: 'N が 好き／きらいです', meaning: 'thích / không thích', lessonNumber: 12 },
        ],
      },
    ],
  },
  {
    level: 'N4',
    title: 'Mở rộng câu & thể động từ',
    summary: 'Thể て／た, khả năng, điều kiện đơn, cho nhận, ý định.',
    accent: '#14b8a6',
    branches: [
      {
        id: 'n4-te',
        label: 'Thể て',
        labelJa: 'て形',
        patterns: [
          { pattern: 'Vて、Vて…', meaning: 'nối hành động liên tiếp', lessonNumber: 14 },
          { pattern: 'Vています', meaning: 'đang / trạng thái', lessonNumber: 14 },
          { pattern: 'Vてください／Vてもいい', meaning: 'xin hãy / được phép', lessonNumber: 15 },
          { pattern: 'Vてはいけません', meaning: 'không được ~', lessonNumber: 15 },
        ],
      },
      {
        id: 'n4-ta',
        label: 'Thể た & trải nghiệm',
        labelJa: 'た形',
        patterns: [
          { pattern: 'Vたことがあります', meaning: 'đã từng ~', lessonNumber: 19 },
          { pattern: 'Vたほうがいい', meaning: 'nên ~', lessonNumber: 20 },
          { pattern: 'Vたり Vたりする', meaning: 'làm A, làm B (ví dụ)', lessonNumber: 19 },
        ],
      },
      {
        id: 'n4-potential',
        label: 'Khả năng',
        labelJa: '可能形',
        patterns: [
          { pattern: 'V可能形', meaning: 'có thể làm ~', lessonNumber: 27 },
          { pattern: 'N が できます', meaning: 'biết làm / có thể', lessonNumber: 18 },
        ],
      },
      {
        id: 'n4-if',
        label: 'Điều kiện đơn',
        labelJa: 'たら・と・ば',
        patterns: [
          { pattern: 'Vた／い-adj＋かったら', meaning: 'nếu / khi (たら)', lessonNumber: 25 },
          { pattern: 'V辞書形＋と', meaning: 'hễ ~ thì (tự nhiên)', lessonNumber: 23 },
          { pattern: 'Vば／Adj＋ければ', meaning: 'nếu (giả định)', lessonNumber: 25 },
        ],
      },
      {
        id: 'n4-give',
        label: 'Cho · nhận',
        labelJa: 'あげ・くれ・もらい',
        patterns: [
          { pattern: 'Vてあげる／くれる／もらう', meaning: 'làm giúp / được làm giúp', lessonNumber: 24 },
          { pattern: 'N を あげます／もらいます', meaning: 'cho / nhận', lessonNumber: 7 },
        ],
      },
      {
        id: 'n4-intent',
        label: 'Ý định & suy đoán',
        labelJa: 'つもり・そう',
        patterns: [
          { pattern: 'V辞書形＋つもりです', meaning: 'dự định ~', lessonNumber: 18 },
          { pattern: 'V／Adj＋そうです', meaning: 'trông có vẻ ~', lessonNumber: 20 },
          { pattern: '〜と思います', meaning: 'tôi nghĩ rằng ~', lessonNumber: 21 },
        ],
      },
    ],
  },
  {
    level: 'N3',
    title: 'Logic câu phức & kính ngữ nhập môn',
    summary: 'Mục đích, truyền đạt, bị động, sai khiến, liên từ nâng cao.',
    accent: '#3b82f6',
    branches: [
      {
        id: 'n3-purpose',
        label: 'Nguyên nhân · mục đích',
        labelJa: '原因・目的',
        patterns: [
          { pattern: 'Vるように', meaning: 'để (sao cho) ~', lessonNumber: 301 },
          { pattern: 'Vようにする／なる', meaning: 'cố gắng / trở nên ~', lessonNumber: 301 },
          { pattern: 'N／Vために', meaning: 'để / vì (có chủ ý)', lessonNumber: 301 },
          { pattern: '〜おかげで／せいで', meaning: 'nhờ / vì (xấu)', lessonNumber: 301 },
        ],
      },
      {
        id: 'n3-hearsay',
        label: 'Truyền đạt · phỏng đoán',
        labelJa: '伝聞・推量',
        patterns: [
          { pattern: '〜そうです（伝聞）', meaning: 'nghe nói ~', lessonNumber: 302 },
          { pattern: '〜ようです／みたいです', meaning: 'hình như ~', lessonNumber: 302 },
          { pattern: '〜らしい', meaning: 'có vẻ / nghe đồn', lessonNumber: 302 },
        ],
      },
      {
        id: 'n3-voice',
        label: 'Bị động · sai khiến · kính ngữ',
        labelJa: '受身・使役・敬語',
        patterns: [
          { pattern: 'Vられる（受身）', meaning: 'bị động', lessonNumber: 303 },
          { pattern: 'Vさせる（使役）', meaning: 'sai khiến', lessonNumber: 303 },
          { pattern: 'お／ご〜になる・する', meaning: 'kính ngữ cơ bản', lessonNumber: 303 },
        ],
      },
      {
        id: 'n3-connect',
        label: 'Liên từ nâng cao',
        labelJa: '接続',
        patterns: [
          { pattern: '〜のに', meaning: 'thế mà / dù', lessonNumber: 304 },
          { pattern: '〜ばかりでなく', meaning: 'không chỉ … mà còn', lessonNumber: 304 },
          { pattern: '〜ことにする／なる', meaning: 'quyết định / được quyết', lessonNumber: 304 },
        ],
      },
      {
        id: 'n3-degree',
        label: 'Giả định · so sánh · mức độ',
        labelJa: '仮定・比較',
        patterns: [
          { pattern: '〜ば〜ほど', meaning: 'càng … càng', lessonNumber: 305 },
          { pattern: '〜くらい／ほど', meaning: 'đến mức ~', lessonNumber: 305 },
          { pattern: '〜としても', meaning: 'dù cho ~', lessonNumber: 305 },
        ],
      },
    ],
  },
  {
    level: 'N2',
    title: 'Sắc thái & lập luận',
    summary: 'Thời điểm tinh tế, căn cứ, nhấn mạnh, nhượng bộ, đánh giá.',
    accent: '#f59e0b',
    branches: [
      {
        id: 'n2-timing',
        label: 'Thời điểm · đồng thời',
        labelJa: '時点・同時',
        patterns: [
          { pattern: '〜最中に／ところだ', meaning: 'đúng lúc đang ~', lessonNumber: 401 },
          { pattern: '〜次第', meaning: 'ngay khi ~ thì', lessonNumber: 401 },
          { pattern: '〜とたん（に）', meaning: 'vừa … thì ngay', lessonNumber: 401 },
        ],
      },
      {
        id: 'n2-basis',
        label: 'Căn cứ · lập trường',
        labelJa: '根拠・立場',
        patterns: [
          { pattern: '〜によって／よると', meaning: 'tùy / theo nguồn', lessonNumber: 402 },
          { pattern: '〜をもとに（して）', meaning: 'dựa trên ~', lessonNumber: 402 },
          { pattern: '〜に関して／について', meaning: 'liên quan đến ~', lessonNumber: 402 },
        ],
      },
      {
        id: 'n2-focus',
        label: 'Nhấn mạnh · hạn định',
        labelJa: '強調・限定',
        patterns: [
          { pattern: '〜しか〜ない', meaning: 'chỉ … thôi (phủ định)', lessonNumber: 403 },
          { pattern: '〜ばかりだ／だけだ', meaning: 'chỉ toàn là ~', lessonNumber: 403 },
          { pattern: '〜ものだ／ことだ', meaning: 'đáng lẽ / lời khuyên', lessonNumber: 403 },
        ],
      },
      {
        id: 'n2-concession',
        label: 'Điều kiện · nhượng bộ',
        labelJa: '条件・譲歩',
        patterns: [
          { pattern: '〜にもかかわらず', meaning: 'bất chấp ~', lessonNumber: 404 },
          { pattern: '〜にしても／にしろ', meaning: 'dù là … đi nữa', lessonNumber: 404 },
          { pattern: '〜ないことには', meaning: 'nếu không … thì không', lessonNumber: 404 },
        ],
      },
      {
        id: 'n2-result',
        label: 'Hệ quả · cảm thán',
        labelJa: '結果・感慨',
        patterns: [
          { pattern: '〜あげく（に）', meaning: 'cuối cùng (thường xấu)', lessonNumber: 405 },
          { pattern: '〜どころか', meaning: 'đâu có … mà còn', lessonNumber: 405 },
          { pattern: '〜わけだ／はずだ', meaning: 'đương nhiên / chắc phải', lessonNumber: 405 },
        ],
      },
    ],
  },
  {
    level: 'N1',
    title: 'Văn viết & sắc thái tinh tế',
    summary: 'Nhấn mạnh văn chương, logic phức, cảm xúc, phạm vi thái độ.',
    accent: '#ef4444',
    branches: [
      {
        id: 'n1-written',
        label: 'Nhấn mạnh văn viết',
        labelJa: '書き言葉',
        patterns: [
          { pattern: '〜んばかりに', meaning: 'như sắp / gần như', lessonNumber: 501 },
          { pattern: '〜が早いか', meaning: 'vừa … đã ngay', lessonNumber: 501 },
          { pattern: '〜ともなく／ともなしに', meaning: 'không chủ đích ~', lessonNumber: 501 },
        ],
      },
      {
        id: 'n1-logic',
        label: 'Quan hệ logic · nhượng bộ',
        labelJa: '論理・譲歩',
        patterns: [
          { pattern: '〜であれ〜であれ', meaning: 'dù A hay B', lessonNumber: 502 },
          { pattern: '〜といえども', meaning: 'dù nói là ~', lessonNumber: 502 },
          { pattern: '〜なくして（は）', meaning: 'không có … thì không', lessonNumber: 502 },
        ],
      },
      {
        id: 'n1-emotion',
        label: 'Cảm xúc · đánh giá',
        labelJa: '感情・評価',
        patterns: [
          { pattern: '〜てやまない', meaning: 'mong mãi không thôi', lessonNumber: 503 },
          { pattern: '〜極まりない／の極み', meaning: 'cực kỳ ~', lessonNumber: 503 },
          { pattern: '〜ずにはいられない', meaning: 'không thể không ~', lessonNumber: 503 },
        ],
      },
      {
        id: 'n1-scope',
        label: 'Giới hạn · thái độ',
        labelJa: '範囲・態度',
        patterns: [
          { pattern: '〜に至るまで', meaning: 'cho đến tận ~', lessonNumber: 504 },
          { pattern: '〜をもって', meaning: 'bằng / lấy mốc ~', lessonNumber: 504 },
          { pattern: '〜をよそに', meaning: 'bất chấp / mặc kệ', lessonNumber: 504 },
        ],
      },
    ],
  },
];

export function getGrammarMindLevel(level: GrammarMindLevel): GrammarMindMapLevel {
  return GRAMMAR_MIND_MAP.find((item) => item.level === level) ?? GRAMMAR_MIND_MAP[0];
}
