export type JlptListeningType = 'sokuji' | 'kadai' | 'point' | 'hatsua';

export type JlptListeningItem = {
  type: JlptListeningType;
  typeLabel: string;
  promptJa: string;
  promptVi: string;
  options: string[];
  answer: string;
};

export const JLPT_LISTENING_TYPES: { id: JlptListeningType; ja: string; vi: string }[] = [
  { id: 'sokuji', ja: '即時応答', vi: 'Đáp ngay câu chào / câu hỏi ngắn' },
  { id: 'kadai', ja: '課題理解', vi: 'Nghe tình huống, chọn việc cần làm' },
  { id: 'point', ja: 'ポイント理解', vi: 'Nghe đoạn hội thoại, nắm ý chính' },
  { id: 'hatsua', ja: '発話表現', vi: 'Chọn câu nói phù hợp hoàn cảnh' },
];

export const JLPT_LISTENING_ITEMS: JlptListeningItem[] = [
  {
    type: 'sokuji',
    typeLabel: '即時応答',
    promptJa: 'いらっしゃいませ。',
    promptVi: 'Nhân viên cửa hàng chào bạn.',
    options: ['こんにちは。', 'いただきます。', 'おやすみなさい。', 'ただいま。'],
    answer: 'こんにちは。',
  },
  {
    type: 'sokuji',
    typeLabel: '即時応答',
    promptJa: 'お名前は？',
    promptVi: 'Người kia hỏi tên bạn.',
    options: ['リンです。', 'どうぞ。', 'すみません。', 'はい、そうです。'],
    answer: 'リンです。',
  },
  {
    type: 'sokuji',
    typeLabel: '即時応答',
    promptJa: '今、何時ですか。',
    promptVi: 'Người kia hỏi mấy giờ.',
    options: ['三時です。', 'はい、そうです。', 'どうぞ。', 'はじめまして。'],
    answer: '三時です。',
  },
  {
    type: 'sokuji',
    typeLabel: '即時応答',
    promptJa: 'お茶、いかがですか。',
    promptVi: 'Người kia mời trà.',
    options: ['はい、いただきます。', 'はじめまして。', '行ってきます。', 'お大事に。'],
    answer: 'はい、いただきます。',
  },
  {
    type: 'kadai',
    typeLabel: '課題理解',
    promptJa: '駅へ行きたいです。どうしますか。',
    promptVi: 'Bạn muốn đến ga. Nên làm gì?',
    options: ['地図を見ます。', 'ご飯を食べます。', '本を借ります。', '手紙を書きます。'],
    answer: '地図を見ます。',
  },
  {
    type: 'kadai',
    typeLabel: '課題理解',
    promptJa: '頭が痛いです。どうしますか。',
    promptVi: 'Bạn bị đau đầu. Nên làm gì?',
    options: ['薬を飲みます。', '映画を見ます。', '泳ぎます。', '歌を歌います。'],
    answer: '薬を飲みます。',
  },
  {
    type: 'kadai',
    typeLabel: '課題理解',
    promptJa: '明日テストがあります。どうしますか。',
    promptVi: 'Mai có kiểm tra. Nên làm gì?',
    options: ['勉強します。', '旅行します。', '寝坊します。', '買い物しません。'],
    answer: '勉強します。',
  },
  {
    type: 'point',
    typeLabel: 'ポイント理解',
    promptJa: '男：明日は何時に会いましょうか。女：十時はどうですか。男：はい、じゃあ駅で。',
    promptVi: 'Họ sẽ gặp nhau khi nào, ở đâu?',
    options: ['明日の十時、駅で', '今日の十時、学校で', '明日の九時、駅で', '明日の十時、うちで'],
    answer: '明日の十時、駅で',
  },
  {
    type: 'point',
    typeLabel: 'ポイント理解',
    promptJa: '女：この本、いくらですか。男：八百円です。女：じゃあ、これをください。',
    promptVi: 'Người phụ nữ làm gì?',
    options: ['本を八百円で買います', '本を借ります', '本を返します', '本を八百円で売ります'],
    answer: '本を八百円で買います',
  },
  {
    type: 'hatsua',
    typeLabel: '発話表現',
    promptJa: '友達の家へ行きます。何と言いますか。',
    promptVi: 'Đến nhà bạn. Nói gì khi vào?',
    options: ['おじゃまします。', 'いってきます。', 'ただいま。', 'ごちそうさまでした。'],
    answer: 'おじゃまします。',
  },
  {
    type: 'hatsua',
    typeLabel: '発話表現',
    promptJa: '電車の中で人が足を踏みました。何と言いますか。',
    promptVi: 'Trên tàu có người giẫm chân bạn.',
    options: ['すみません。', 'いただきます。', 'おめでとうございます。', '行ってらっしゃい。'],
    answer: 'すみません。',
  },
  {
    type: 'hatsua',
    typeLabel: '発話表現',
    promptJa: 'お店で水がほしいです。何と言いますか。',
    promptVi: 'Ở quán, bạn muốn nước.',
    options: ['水をください。', '水を貸してください。', '水を捨ててください。', '水を返してください。'],
    answer: '水をください。',
  },
];
