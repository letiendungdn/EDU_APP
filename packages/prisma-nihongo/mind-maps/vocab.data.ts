import type { MindMapLevelData as JlptMindMapLevel } from './types';

/** Sơ đồ tư duy từ vựng JLPT — chủ đề + từ tiêu biểu. */
export const VOCAB_MIND_MAP: JlptMindMapLevel[] = [
  {
    level: 'N5',
    title: 'Đời sống cơ bản',
    summary: '~800 từ · chào hỏi, gia đình, ăn uống, thời gian, trường lớp.',
    accent: '#22c55e',
    branches: [
      {
        id: 'v-n5-greet',
        label: 'Chào hỏi · lịch sự',
        labelJa: 'あいさつ',
        patterns: [
          { pattern: 'こんにちは', meaning: 'xin chào', lessonNumber: 1 },
          { pattern: 'ありがとうございます', meaning: 'cảm ơn', lessonNumber: 1 },
          { pattern: 'すみません', meaning: 'xin lỗi / làm ơn', lessonNumber: 2 },
        ],
      },
      {
        id: 'v-n5-family',
        label: 'Gia đình · người',
        labelJa: '家族',
        patterns: [
          { pattern: '家族', meaning: 'gia đình', lessonNumber: 4 },
          { pattern: '友達', meaning: 'bạn bè', lessonNumber: 5 },
          { pattern: '先生', meaning: 'thầy/cô', lessonNumber: 1 },
        ],
      },
      {
        id: 'v-n5-food',
        label: 'Ăn uống',
        labelJa: '食べ物',
        patterns: [
          { pattern: 'ご飯', meaning: 'cơm / bữa ăn', lessonNumber: 7 },
          { pattern: '水', meaning: 'nước', lessonNumber: 7 },
          { pattern: '食べる／飲む', meaning: 'ăn / uống', lessonNumber: 6 },
        ],
      },
      {
        id: 'v-n5-time',
        label: 'Thời gian',
        labelJa: '時間',
        patterns: [
          { pattern: '今日／明日／昨日', meaning: 'hôm nay / mai / hôm qua', lessonNumber: 4 },
          { pattern: '今', meaning: 'bây giờ', lessonNumber: 3 },
          { pattern: '時／分', meaning: 'giờ / phút', lessonNumber: 4 },
        ],
      },
      {
        id: 'v-n5-place',
        label: 'Nơi chốn',
        labelJa: '場所',
        patterns: [
          { pattern: '学校', meaning: 'trường học', lessonNumber: 5 },
          { pattern: '駅', meaning: 'nhà ga', lessonNumber: 10 },
          { pattern: '家', meaning: 'nhà', lessonNumber: 5 },
        ],
      },
      {
        id: 'v-n5-action',
        label: 'Động từ hàng ngày',
        labelJa: '動詞',
        patterns: [
          { pattern: '行く／来る／帰る', meaning: 'đi / đến / về', lessonNumber: 5 },
          { pattern: '見る／聞く', meaning: 'xem / nghe', lessonNumber: 6 },
          { pattern: 'する', meaning: 'làm', lessonNumber: 6 },
        ],
      },
    ],
  },
  {
    level: 'N4',
    title: 'Mở rộng đời sống',
    summary: '~1.500 từ (gồm N5) · cảm xúc, cơ thể, thời tiết, mua sắm, đi lại.',
    accent: '#14b8a6',
    branches: [
      {
        id: 'v-n4-feel',
        label: 'Cảm xúc',
        labelJa: '気持ち',
        patterns: [
          { pattern: '嬉しい／悲しい', meaning: 'vui / buồn', lessonNumber: 21 },
          { pattern: '心配', meaning: 'lo lắng', lessonNumber: 22 },
          { pattern: '安心', meaning: 'yên tâm', lessonNumber: 22 },
        ],
      },
      {
        id: 'v-n4-body',
        label: 'Cơ thể · sức khỏe',
        labelJa: '体',
        patterns: [
          { pattern: '頭／手／足', meaning: 'đầu / tay / chân', lessonNumber: 16 },
          { pattern: '病気', meaning: 'bệnh', lessonNumber: 16 },
          { pattern: '痛い', meaning: 'đau', lessonNumber: 16 },
        ],
      },
      {
        id: 'v-n4-weather',
        label: 'Thời tiết · mùa',
        labelJa: '天気',
        patterns: [
          { pattern: '晴れ／雨／曇り', meaning: 'nắng / mưa / mây', lessonNumber: 12 },
          { pattern: '暑い／寒い', meaning: 'nóng / lạnh', lessonNumber: 12 },
          { pattern: '季節', meaning: 'mùa', lessonNumber: 12 },
        ],
      },
      {
        id: 'v-n4-shop',
        label: 'Mua sắm · tiền',
        labelJa: '買い物',
        patterns: [
          { pattern: '値段', meaning: 'giá', lessonNumber: 11 },
          { pattern: '安い／高い', meaning: 'rẻ / đắt', lessonNumber: 11 },
          { pattern: '買う／売る', meaning: 'mua / bán', lessonNumber: 11 },
        ],
      },
      {
        id: 'v-n4-travel',
        label: 'Đi lại · du lịch',
        labelJa: '旅行',
        patterns: [
          { pattern: '旅行', meaning: 'du lịch', lessonNumber: 15 },
          { pattern: '飛行機／電車', meaning: 'máy bay / tàu điện', lessonNumber: 10 },
          { pattern: '予約', meaning: 'đặt chỗ', lessonNumber: 18 },
        ],
      },
      {
        id: 'v-n4-work',
        label: 'Công việc nhẹ',
        labelJa: '仕事',
        patterns: [
          { pattern: '会社', meaning: 'công ty', lessonNumber: 17 },
          { pattern: '仕事', meaning: 'công việc', lessonNumber: 17 },
          { pattern: '会議', meaning: 'họp', lessonNumber: 26 },
        ],
      },
    ],
  },
  {
    level: 'N3',
    title: 'Xã hội & trừu tượng',
    summary: '~3.700 từ · tin tức đơn giản, quan hệ xã hội, từ Hán phổ biến.',
    accent: '#3b82f6',
    branches: [
      {
        id: 'v-n3-society',
        label: 'Xã hội',
        labelJa: '社会',
        patterns: [
          { pattern: '社会', meaning: 'xã hội', lessonNumber: 301 },
          { pattern: '環境', meaning: 'môi trường', lessonNumber: 301 },
          { pattern: '文化', meaning: 'văn hóa', lessonNumber: 302 },
        ],
      },
      {
        id: 'v-n3-news',
        label: 'Tin tức cơ bản',
        labelJa: 'ニュース',
        patterns: [
          { pattern: '事件', meaning: 'sự việc', lessonNumber: 302 },
          { pattern: '発表', meaning: 'công bố', lessonNumber: 302 },
          { pattern: '影響', meaning: 'ảnh hưởng', lessonNumber: 303 },
        ],
      },
      {
        id: 'v-n3-abstract',
        label: 'Khái niệm trừu tượng',
        labelJa: '抽象',
        patterns: [
          { pattern: '場合', meaning: 'trường hợp', lessonNumber: 303 },
          { pattern: '方法', meaning: 'phương pháp', lessonNumber: 303 },
          { pattern: '理由', meaning: 'lý do', lessonNumber: 301 },
        ],
      },
      {
        id: 'v-n3-feel',
        label: 'Cảm xúc nâng cao',
        labelJa: '感情',
        patterns: [
          { pattern: '不満', meaning: 'bất mãn', lessonNumber: 304 },
          { pattern: '感動', meaning: 'cảm động', lessonNumber: 304 },
          { pattern: '緊張', meaning: 'căng thẳng', lessonNumber: 304 },
        ],
      },
      {
        id: 'v-n3-business',
        label: 'Công sở nhập môn',
        labelJa: 'ビジネス',
        patterns: [
          { pattern: '連絡', meaning: 'liên lạc', lessonNumber: 305 },
          { pattern: '資料', meaning: 'tài liệu', lessonNumber: 305 },
          { pattern: '締め切り', meaning: 'hạn chót', lessonNumber: 305 },
        ],
      },
    ],
  },
  {
    level: 'N2',
    title: 'Đọc hiểu & công việc',
    summary: '~6.000 từ · báo chí đơn giản, từ ghép Hán, kính ngữ từ vựng.',
    accent: '#f59e0b',
    branches: [
      {
        id: 'v-n2-media',
        label: 'Báo chí · truyền thông',
        labelJa: '報道',
        patterns: [
          { pattern: '報道', meaning: 'đưa tin', lessonNumber: 401 },
          { pattern: '記事', meaning: 'bài báo', lessonNumber: 401 },
          { pattern: '世論', meaning: 'dư luận', lessonNumber: 401 },
        ],
      },
      {
        id: 'v-n2-economy',
        label: 'Kinh tế · xã hội',
        labelJa: '経済',
        patterns: [
          { pattern: '経済', meaning: 'kinh tế', lessonNumber: 402 },
          { pattern: '景気', meaning: 'tình hình kinh tế', lessonNumber: 402 },
          { pattern: '消費', meaning: 'tiêu dùng', lessonNumber: 402 },
        ],
      },
      {
        id: 'v-n2-nuance',
        label: 'Sắc thái từ',
        labelJa: '語感',
        patterns: [
          { pattern: '曖昧', meaning: 'mơ hồ', lessonNumber: 403 },
          { pattern: '微妙', meaning: 'tinh tế / khó nói', lessonNumber: 403 },
          { pattern: '深刻', meaning: 'nghiêm trọng', lessonNumber: 403 },
        ],
      },
      {
        id: 'v-n2-formal',
        label: 'Từ trang trọng',
        labelJa: '改まった語',
        patterns: [
          { pattern: '致す／参る', meaning: 'làm / đi (khiêm nhường)', lessonNumber: 403 },
          { pattern: '申し上げる', meaning: 'nói (khiêm)', lessonNumber: 403 },
          { pattern: 'ご覧になる', meaning: 'xem (tôn kính)', lessonNumber: 404 },
        ],
      },
      {
        id: 'v-n2-compound',
        label: 'Từ ghép Hán',
        labelJa: '漢語',
        patterns: [
          { pattern: '実施', meaning: 'tiến hành', lessonNumber: 404 },
          { pattern: '検討', meaning: 'xem xét', lessonNumber: 405 },
          { pattern: '確認', meaning: 'xác nhận', lessonNumber: 405 },
        ],
      },
    ],
  },
  {
    level: 'N1',
    title: 'Văn viết & chuyên ngành',
    summary: '~10.000 từ · văn học, học thuật, đánh giá tinh tế.',
    accent: '#ef4444',
    branches: [
      {
        id: 'v-n1-literary',
        label: 'Văn chương',
        labelJa: '文語的',
        patterns: [
          { pattern: 'しきたり', meaning: 'phong tục', lessonNumber: 501 },
          { pattern: '名残', meaning: 'lưu luyến', lessonNumber: 501 },
          { pattern: '風情', meaning: 'vẻ thẩm mỹ', lessonNumber: 501 },
        ],
      },
      {
        id: 'v-n1-academic',
        label: 'Học thuật',
        labelJa: '学術',
        patterns: [
          { pattern: '仮説', meaning: 'giả thuyết', lessonNumber: 502 },
          { pattern: '検証', meaning: 'kiểm chứng', lessonNumber: 502 },
          { pattern: '観点', meaning: 'quan điểm', lessonNumber: 502 },
        ],
      },
      {
        id: 'v-n1-synonym',
        label: 'Đồng nghĩa tinh tế',
        labelJa: '類義語',
        patterns: [
          { pattern: '取り組む／取り扱う', meaning: 'xử lý / đối phó', lessonNumber: 503 },
          { pattern: '推す／推進する', meaning: 'đẩy / thúc đẩy', lessonNumber: 503 },
          { pattern: '見通す／見送る', meaning: 'nhìn thấu / tiễn biệt', lessonNumber: 503 },
        ],
      },
      {
        id: 'v-n1-attitude',
        label: 'Thái độ · đánh giá',
        labelJa: '評価',
        patterns: [
          { pattern: '心地よい', meaning: 'dễ chịu', lessonNumber: 504 },
          { pattern: '激しい', meaning: 'mạnh mẽ / quyết liệt', lessonNumber: 504 },
          { pattern: '宜しい', meaning: 'thích hợp / được', lessonNumber: 504 },
        ],
      },
    ],
  },
];
