import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';

/**
 * Đề thi thử JLPT N5→N1 mô phỏng cấu trúc/tỉ lệ điểm của đề thi hiện hành —
 * CÂU HỎI TỰ SOẠN HOÀN TOÀN MỚI, không sao chép/dịch lại đề thật đã công bố
 * (tránh vi phạm bản quyền Japan Foundation/JEES). sourceMode='CUSTOM' nên
 * dùng MockExamQuestion/MockExamQuestionOption thay vì sinh tự động.
 *
 * sectionId dùng 4 khoá đã biết ở SECTION_NAMES (mock-exams.service.ts):
 * vocab (文字・語彙), grammar (文法), reading (読解), listening (聴解).
 *
 * Idempotent theo slug: xoá template cũ (cascade xoá luôn câu hỏi) rồi tạo lại.
 */

type Section = 'vocab' | 'grammar' | 'reading' | 'listening';
type QType = 'multiple_choice' | 'fill_in_blank' | 'listening';

interface QuestionSeed {
  sectionId: Section;
  type: QType;
  question: string;
  correctAnswer: string;
  options: string[];
  audioText?: string;
}

interface ExamSeed {
  slug: string;
  level: 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
  title: string;
  durationMinutes: number;
  passThreshold: number;
  sortOrder: number;
  questions: QuestionSeed[];
}

const EXAMS: ExamSeed[] = [
  {
    slug: 'n5-format-moi',
    level: 'n5',
    title: 'N5 — Đề luyện theo cấu trúc đề thi gần đây',
    durationMinutes: 90,
    passThreshold: 60,
    sortOrder: 5,
    questions: [
      { sectionId: 'vocab', type: 'multiple_choice', question: '「火曜日」の読み方はどれですか。', correctAnswer: 'かようび', options: ['かようび', 'すいようび', 'もくようび', 'きんようび'] },
      { sectionId: 'vocab', type: 'multiple_choice', question: '「二千円」の読み方はどれですか。', correctAnswer: 'にせんえん', options: ['にせんえん', 'さんぜんえん', 'にひゃくえん', 'せんえん'] },
      { sectionId: 'vocab', type: 'multiple_choice', question: '「忙しい」の意味は何ですか。', correctAnswer: 'bận rộn', options: ['bận rộn', 'rảnh rỗi', 'vui vẻ', 'buồn bã'] },
      { sectionId: 'vocab', type: 'multiple_choice', question: '「借ります」の意味は何ですか。', correctAnswer: 'mượn', options: ['mượn', 'cho mượn', 'mua', 'bán'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: '明日、友達＿＿映画を見に行きます。', correctAnswer: 'と', options: ['と', 'を', 'に', 'が'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: '部屋にだれ＿＿いません。', correctAnswer: 'も', options: ['も', 'か', 'は', 'と'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: '昨日、雨が＿＿ので、出かけませんでした。', correctAnswer: '降った', options: ['降った', '降る', '降って', '降ります'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: 'この漢字の読み方＿＿教えてください。', correctAnswer: 'を', options: ['を', 'に', 'で', 'と'] },
      { sectionId: 'reading', type: 'multiple_choice', question: '【文章】わたしは毎朝六時に起きます。それから、公園を散歩します。散歩のあと、朝ごはんを食べます。\n\n質問：散歩のあとに何をしますか。', correctAnswer: '朝ごはんを食べます。', options: ['朝ごはんを食べます。', '顔を洗います。', '仕事に行きます。', '新聞を読みます。'] },
      { sectionId: 'reading', type: 'multiple_choice', question: '【文章】きのう、デパートでかばんを買いました。青いかばんです。とても軽くて、使いやすいです。\n\n質問：買ったかばんはどんな色ですか。', correctAnswer: '青い', options: ['青い', '赤い', '黒い', '白い'] },
      { sectionId: 'listening', type: 'listening', question: '何を聞いていますか。', correctAnswer: 'トイレの場所', options: ['トイレの場所', '名前', '時間', '値段'], audioText: 'すみません、トイレはどこですか。' },
      { sectionId: 'listening', type: 'listening', question: 'テストはいつですか。', correctAnswer: '来週の月曜日', options: ['来週の月曜日', '今週の月曜日', '来週の火曜日', '今日'], audioText: '来週の月曜日はテストです。' },
    ],
  },
  {
    slug: 'n4-format-moi',
    level: 'n4',
    title: 'N4 — Đề luyện theo cấu trúc đề thi gần đây',
    durationMinutes: 115,
    passThreshold: 65,
    sortOrder: 6,
    questions: [
      { sectionId: 'vocab', type: 'multiple_choice', question: '「旅行」の読み方はどれですか。', correctAnswer: 'りょこう', options: ['りょこう', 'りゅうこう', 'りょうこう', 'りこう'] },
      { sectionId: 'vocab', type: 'multiple_choice', question: '「一週間」の読み方はどれですか。', correctAnswer: 'いっしゅうかん', options: ['いっしゅうかん', 'いちしゅうかん', 'いっしゅかん', 'いちしゅかん'] },
      { sectionId: 'vocab', type: 'multiple_choice', question: '「準備します」の意味は何ですか。', correctAnswer: 'chuẩn bị', options: ['chuẩn bị', 'dọn dẹp', 'sửa chữa', 'hoàn thành'] },
      { sectionId: 'vocab', type: 'multiple_choice', question: '「久しぶり」の意味は何ですか。', correctAnswer: 'đã lâu không gặp', options: ['đã lâu không gặp', 'rất vui', 'rất tiếc', 'xin lỗi'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: 'このパソコンは古いです＿＿、まだ使えます。', correctAnswer: 'が', options: ['が', 'ので', 'から', 'と'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: '友達に手紙を＿＿もらいました。', correctAnswer: '書いて', options: ['書いて', '書く', '書き', '書いた'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: '雨が降っていた＿＿、試合は中止になりました。', correctAnswer: 'ので', options: ['ので', 'のに', 'けど', 'し'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: 'この漢字は難しくて、＿＿読めません。', correctAnswer: 'なかなか', options: ['なかなか', 'すぐに', 'もう', 'まだ'] },
      { sectionId: 'reading', type: 'multiple_choice', question: '【文章】田中さんは毎日会社まで自転車で行きます。電車より時間はかかりますが、運動になるので続けています。\n\n質問：田中さんはどうやって会社に行きますか。', correctAnswer: '自転車で', options: ['自転車で', '電車で', 'バスで', '歩いて'] },
      { sectionId: 'reading', type: 'multiple_choice', question: '【文章】この店のラーメンはとても人気があります。特に週末は、開店前から並んでいる人がたくさんいます。\n\n質問：週末、この店はどんな様子ですか。', correctAnswer: '開店前から人が並んでいる', options: ['開店前から人が並んでいる', '誰も来ない', '休みになる', '値段が上がる'] },
      { sectionId: 'reading', type: 'multiple_choice', question: '【文章】山田さんは来月、大阪に引っ越します。新しい仕事のためです。友達はみんな寂しがっています。\n\n質問：山田さんはなぜ引っ越しますか。', correctAnswer: '新しい仕事のため', options: ['新しい仕事のため', '結婚するため', '病気のため', '学校のため'] },
      { sectionId: 'listening', type: 'listening', question: '何に誘っていますか。', correctAnswer: '映画を見ること', options: ['映画を見ること', '買い物すること', '旅行すること', '勉強すること'], audioText: '今度の日曜日、一緒に映画を見に行きませんか。' },
      { sectionId: 'listening', type: 'listening', question: '何をお願いしていますか。', correctAnswer: '荷物を大きい箱に入れ替えること', options: ['荷物を大きい箱に入れ替えること', '荷物を送ること', '箱を捨てること', '荷物を運ぶこと'], audioText: 'すみません、この荷物をもう少し大きい箱に入れ替えてもらえますか。' },
      { sectionId: 'listening', type: 'listening', question: '鍵はどこで借りますか。', correctAnswer: '事務室', options: ['事務室', '会議室', '受付', '倉庫'], audioText: '会議室の鍵は事務室で借りてください。' },
    ],
  },
  {
    slug: 'n3-format-moi',
    level: 'n3',
    title: 'N3 — Đề luyện theo cấu trúc đề thi gần đây',
    durationMinutes: 140,
    passThreshold: 65,
    sortOrder: 7,
    questions: [
      { sectionId: 'vocab', type: 'multiple_choice', question: '「経験」の読み方はどれですか。', correctAnswer: 'けいけん', options: ['けいけん', 'けいげん', 'きょうけん', 'けいこん'] },
      { sectionId: 'vocab', type: 'multiple_choice', question: '「複雑」の読み方はどれですか。', correctAnswer: 'ふくざつ', options: ['ふくざつ', 'ふくそう', 'ふっさつ', 'ふくさつ'] },
      { sectionId: 'vocab', type: 'multiple_choice', question: '「解決します」の意味は何ですか。', correctAnswer: 'giải quyết', options: ['giải quyết', 'phát sinh', 'phức tạp hóa', 'trì hoãn'] },
      { sectionId: 'vocab', type: 'multiple_choice', question: '「あきらめます」の意味は何ですか。', correctAnswer: 'từ bỏ', options: ['từ bỏ', 'cố gắng', 'thành công', 'hối hận'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: '田中さんは忙しい＿＿、いつも笑顔で仕事をしています。', correctAnswer: 'にもかかわらず', options: ['にもかかわらず', 'ばかりに', 'おかげで', 'につれて'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: '子供＿＿分かるように、優しく説明しました。', correctAnswer: 'にも', options: ['にも', 'でも', 'には', 'とは'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: 'このレポートは明日＿＿出さなければなりません。', correctAnswer: 'までに', options: ['までに', 'まで', 'までは', 'までも'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: '彼は日本語が上手な＿＿、漢字はあまり書けません。', correctAnswer: 'わりに', options: ['わりに', 'ために', 'とおりに', 'ように'] },
      { sectionId: 'reading', type: 'multiple_choice', question: '【文章】最近、スマートフォンで健康を管理するアプリが人気だ。歩いた歩数や睡眠時間が自動的に記録され、グラフで確認できる。\n\n質問：このアプリは何を記録しますか。', correctAnswer: '歩数や睡眠時間', options: ['歩数や睡眠時間', '体重だけ', '食べた物だけ', '天気'] },
      { sectionId: 'reading', type: 'multiple_choice', question: '【文章】会社の近くに新しいカフェができた。値段は少し高いが、静かで仕事がしやすいと評判だ。\n\n質問：新しいカフェの評判はどうですか。', correctAnswer: '静かで仕事がしやすい', options: ['静かで仕事がしやすい', 'うるさくて落ち着かない', '安くて人気がある', 'いつも混んでいる'] },
      { sectionId: 'reading', type: 'multiple_choice', question: '【文章】田中先生は学生に「間違えることを恐れないでください」といつも言っている。失敗から学ぶことが多いからだ。\n\n質問：田中先生が伝えたいことは何ですか。', correctAnswer: '失敗を恐れなくていい', options: ['失敗を恐れなくていい', '失敗してはいけない', '勉強しなくていい', '先生を信じなくていい'] },
      { sectionId: 'listening', type: 'listening', question: '会議は何時からですか。', correctAnswer: '11時', options: ['11時', '10時', '9時', '12時'], audioText: '明日の会議は10時からではなく、11時からに変更になりました。' },
      { sectionId: 'listening', type: 'listening', question: '何をお願いしていますか。', correctAnswer: '書類にサインをすること', options: ['書類にサインをすること', '書類を読むこと', '書類をコピーすること', '書類を捨てること'], audioText: 'すみません、この書類にサインをお願いできますか。' },
      { sectionId: 'listening', type: 'listening', question: '何をするように言っていますか。', correctAnswer: '迂回すること', options: ['迂回すること', '急ぐこと', '止まること', '写真を撮ること'], audioText: '駅前の道路は工事中なので、迂回してください。' },
    ],
  },
  {
    slug: 'n2-format-moi',
    level: 'n2',
    title: 'N2 — Đề luyện theo cấu trúc đề thi gần đây',
    durationMinutes: 155,
    passThreshold: 65,
    sortOrder: 8,
    questions: [
      { sectionId: 'vocab', type: 'multiple_choice', question: '「契約」の読み方はどれですか。', correctAnswer: 'けいやく', options: ['けいやく', 'けいがく', 'せいやく', 'きやく'] },
      { sectionId: 'vocab', type: 'multiple_choice', question: '「収入」の読み方はどれですか。', correctAnswer: 'しゅうにゅう', options: ['しゅうにゅう', 'しゅにゅう', 'しゅうにゅ', 'しょうにゅう'] },
      { sectionId: 'vocab', type: 'multiple_choice', question: '「妥協します」の意味は何ですか。', correctAnswer: 'thỏa hiệp', options: ['thỏa hiệp', 'phản đối', 'đồng ý hoàn toàn', 'tranh cãi'] },
      { sectionId: 'vocab', type: 'multiple_choice', question: '「見落とします」の意味は何ですか。', correctAnswer: 'bỏ sót', options: ['bỏ sót', 'phát hiện', 'ghi nhớ', 'sắp xếp'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: '忙しさの＿＿、彼は毎晩本を読む時間を作っている。', correctAnswer: 'なかで', options: ['なかで', 'あまり', 'かぎり', 'うちに'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: '一度決めたこと＿＿、最後までやり遂げるべきだ。', correctAnswer: 'からには', options: ['からには', 'にしては', 'としても', 'にもまして'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: '台風の影響＿＿、電車が大幅に遅れている。', correctAnswer: 'により', options: ['により', 'で', 'にとって', 'に対して'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: '彼の説明を聞けば聞く＿＿、分からなくなった。', correctAnswer: 'ほど', options: ['ほど', 'だけ', 'きり', 'まま'] },
      { sectionId: 'reading', type: 'multiple_choice', question: '【文章】在宅勤務が広がったことで、通勤時間が減り、自分の時間を持てるようになったという声が多い。一方で、同僚とのコミュニケーション不足を感じる人もいる。\n\n質問：在宅勤務の課題として挙げられているのは何か。', correctAnswer: '同僚とのコミュニケーション不足', options: ['同僚とのコミュニケーション不足', '通勤時間の増加', '給料の減少', '仕事量の増加'] },
      { sectionId: 'reading', type: 'multiple_choice', question: '【文章】高齢化が進む日本では、介護の担い手不足が深刻な問題となっている。外国人労働者の受け入れを拡大する動きも出てきている。\n\n質問：介護の担い手不足に対してどんな動きが出ているか。', correctAnswer: '外国人労働者の受け入れ拡大', options: ['外国人労働者の受け入れ拡大', '介護施設の閉鎖', '介護料金の値上げ', '高齢者の減少'] },
      { sectionId: 'reading', type: 'multiple_choice', question: '【文章】食品の値上げが続く中、消費者は少しでも安い店を求めてスーパーをはしごするようになっている。\n\n質問：消費者はどう行動するようになったか。', correctAnswer: '安い店を求めて複数の店を回る', options: ['安い店を求めて複数の店を回る', '一つの店だけで買い物する', '買い物を控える', '高い店で買う'] },
      { sectionId: 'listening', type: 'listening', question: '何を伝えていますか。', correctAnswer: '後で連絡し直すこと', options: ['後で連絡し直すこと', '今すぐ対応すること', '担当者が休みであること', '電話を切ること'], audioText: '恐れ入りますが、担当者が席を外しておりますので、後ほど折り返しご連絡させていただきます。' },
      { sectionId: 'listening', type: 'listening', question: '報告はいつ行われますか。', correctAnswer: '来週の会議で', options: ['来週の会議で', '今日中に', '来月', '今すぐ'], audioText: 'このデータについては、来週の会議で改めて詳しくご報告いたします。' },
      { sectionId: 'listening', type: 'listening', question: '何を伝えていますか。', correctAnswer: '席が空いていないこと', options: ['席が空いていないこと', '予約ができること', '店が休みであること', '注文ができないこと'], audioText: '申し訳ございませんが、只今満席となっております。' },
    ],
  },
  {
    slug: 'n1-format-moi',
    level: 'n1',
    title: 'N1 — Đề luyện theo cấu trúc đề thi gần đây',
    durationMinutes: 165,
    passThreshold: 65,
    sortOrder: 9,
    questions: [
      { sectionId: 'vocab', type: 'multiple_choice', question: '「顕著」の読み方はどれですか。', correctAnswer: 'けんちょ', options: ['けんちょ', 'げんちょ', 'けんじょ', 'けんちょう'] },
      { sectionId: 'vocab', type: 'multiple_choice', question: '「妥当」の読み方はどれですか。', correctAnswer: 'だとう', options: ['だとう', 'たとう', 'だとん', 'だどう'] },
      { sectionId: 'vocab', type: 'multiple_choice', question: '「著しい」の意味は何ですか。', correctAnswer: 'rõ rệt, đáng kể', options: ['rõ rệt, đáng kể', 'mờ nhạt, không rõ', 'không thay đổi', 'chỉ tạm thời'] },
      { sectionId: 'vocab', type: 'multiple_choice', question: '「潔く」の意味は何ですか。', correctAnswer: 'dứt khoát, không do dự', options: ['dứt khoát, không do dự', 'do dự, chần chừ', 'tức giận', 'vui mừng'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: '彼の実力から＿＿、この結果は当然だと言える。', correctAnswer: 'すれば', options: ['すれば', 'して', 'すると', 'したら'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: '締め切りが迫っている＿＿、彼は落ち着いて作業を進めている。', correctAnswer: 'にもかかわらず', options: ['にもかかわらず', 'ばかりに', 'あまり', 'ことなく'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: '一度失敗した＿＿諦める必要はない。', correctAnswer: 'からといって', options: ['からといって', 'ところで', 'とはいえ', 'ないまでも'] },
      { sectionId: 'grammar', type: 'multiple_choice', question: '彼女は疲れている＿＿、笑顔を絶やさなかった。', correctAnswer: 'ながらも', options: ['ながらも', 'ものの', 'あまり', 'ゆえに'] },
      { sectionId: 'reading', type: 'multiple_choice', question: '【文章】効率化が進む現代社会において、あえて手間をかけることの価値が見直されつつある。時間をかけて作られたものには、機械的な生産にはない魅力があるからだ。\n\n質問：筆者は何の価値が見直されていると述べているか。', correctAnswer: '手間をかけることの価値', options: ['手間をかけることの価値', '効率化の価値', '機械生産の価値', '速さの価値'] },
      { sectionId: 'reading', type: 'multiple_choice', question: '【文章】言葉は時代とともに変化するものであり、変化そのものを一概に否定するのは適切ではないという意見がある。\n\n質問：この意見はどのような立場か。', correctAnswer: '言葉の変化を一概に否定すべきではない', options: ['言葉の変化を一概に否定すべきではない', '言葉は変化してはならない', '昔の言葉が常に正しい', '若者の言葉は誤りだ'] },
      { sectionId: 'reading', type: 'multiple_choice', question: '【文章】AIの発展により、創造性は人間だけのものではなくなりつつあるという見方がある一方、問いを立てる力は依然として人間に残されているという指摘もある。\n\n質問：依然として人間に残されているとされる力は何か。', correctAnswer: '問いを立てる力', options: ['問いを立てる力', 'データを処理する力', '絵を描く力', '計算する力'] },
      { sectionId: 'listening', type: 'listening', question: '何を伝えていますか。', correctAnswer: '感謝の気持ち', options: ['感謝の気持ち', '謝罪の気持ち', '依頼の内容', '反対の意見'], audioText: 'この度は、格別のご配慮を賜り、誠にありがとうございました。' },
      { sectionId: 'listening', type: 'listening', question: '何を伝えていますか。', correctAnswer: '開催を中止すること', options: ['開催を中止すること', '開催を延長すること', '開催場所を変えること', '参加者を増やすこと'], audioText: '諸般の事情により、開催を見合わせることといたしました。' },
      { sectionId: 'listening', type: 'listening', question: '何をお願いしていますか。', correctAnswer: 'もう少し待つこと', options: ['もう少し待つこと', '今すぐ来ること', '帰ること', '電話をかけ直すこと'], audioText: '恐縮ですが、今しばらくお待ちいただけますでしょうか。' },
    ],
  },
];

export async function seedMockExamRecent(prisma: PrismaClientType) {
  let templateCount = 0;
  let questionCount = 0;

  for (const exam of EXAMS) {
    await prisma.mockExamTemplate.deleteMany({ where: { slug: exam.slug } });

    await prisma.mockExamTemplate.create({
      data: {
        slug: exam.slug,
        level: exam.level,
        title: exam.title,
        description:
          'Đề tự soạn, mô phỏng cấu trúc & tỉ lệ điểm của đề thi JLPT hiện hành (không sao chép đề thật).',
        sourceMode: 'CUSTOM',
        durationMinutes: exam.durationMinutes,
        passThreshold: exam.passThreshold,
        scope: 'Đề tự soạn (mô phỏng format gần đây)',
        sortOrder: exam.sortOrder,
        isPublished: true,
        questions: {
          create: exam.questions.map((q, i) => ({
            sectionId: q.sectionId,
            type: q.type,
            question: q.question,
            correctAnswer: q.correctAnswer,
            audioText: q.audioText ?? null,
            sortOrder: i,
            options: {
              create: q.options.map((text, oi) => ({ text, sortOrder: oi })),
            },
          })),
        },
      },
    });

    templateCount += 1;
    questionCount += exam.questions.length;
  }

  console.log(
    `Mock exam (format gần đây): +${templateCount} đề, +${questionCount} câu hỏi (N5-N1).`,
  );
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedMockExamRecent(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
