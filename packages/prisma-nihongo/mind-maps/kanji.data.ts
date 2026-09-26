import type { MindMapLevelData as JlptMindMapLevel } from './types';

/** Sơ đồ tư duy kanji JLPT — nhóm nghĩa + chữ tiêu biểu. */
export const KANJI_MIND_MAP: JlptMindMapLevel[] = [
  {
    level: 'N5',
    title: 'Kanji cơ bản',
    summary: '~100 chữ · số, ngày, người, tự nhiên, trường lớp.',
    accent: '#22c55e',
    branches: [
      {
        id: 'k-n5-number',
        label: 'Số · đếm',
        labelJa: '数',
        patterns: [
          { pattern: '一／二／三', meaning: '1 / 2 / 3', href: '/kanji/list?level=N5', linkLabel: 'Bảng N5' },
          { pattern: '十／百／千', meaning: '10 / 100 / 1000', href: '/kanji/list?level=N5', linkLabel: 'Bảng N5' },
          { pattern: '円', meaning: 'yên', href: '/kanji/list?level=N5', linkLabel: 'Bảng N5' },
        ],
      },
      {
        id: 'k-n5-time',
        label: 'Thời gian · lịch',
        labelJa: '時',
        patterns: [
          { pattern: '日／月／年', meaning: 'ngày / tháng / năm', href: '/kanji/list?level=N5', linkLabel: 'Bảng N5' },
          { pattern: '時／分／半', meaning: 'giờ / phút / rưỡi', href: '/kanji/list?level=N5', linkLabel: 'Bảng N5' },
          { pattern: '今／先／何', meaning: 'nay / trước / gì', href: '/kanji/list?level=N5', linkLabel: 'Bảng N5' },
        ],
      },
      {
        id: 'k-n5-people',
        label: 'Người · gia đình',
        labelJa: '人',
        patterns: [
          { pattern: '人／男／女', meaning: 'người / nam / nữ', href: '/kanji/list?level=N5', linkLabel: 'Bảng N5' },
          { pattern: '父／母／子', meaning: 'cha / mẹ / con', href: '/kanji/list?level=N5', linkLabel: 'Bảng N5' },
          { pattern: '友／名', meaning: 'bạn / tên', href: '/kanji/list?level=N5', linkLabel: 'Bảng N5' },
        ],
      },
      {
        id: 'k-n5-nature',
        label: 'Tự nhiên',
        labelJa: '自然',
        patterns: [
          { pattern: '山／川／木', meaning: 'núi / sông / cây', href: '/kanji/list?level=N5', linkLabel: 'Bảng N5' },
          { pattern: '天／気／雨', meaning: 'trời / khí / mưa', href: '/kanji/list?level=N5', linkLabel: 'Bảng N5' },
          { pattern: '火／水／金／土', meaning: 'lửa / nước / kim / đất', href: '/kanji/list?level=N5', linkLabel: 'Bảng N5' },
        ],
      },
      {
        id: 'k-n5-school',
        label: 'Trường · học',
        labelJa: '学',
        patterns: [
          { pattern: '学／校／生', meaning: 'học / trường / sinh', href: '/kanji/list?level=N5', linkLabel: 'Bảng N5' },
          { pattern: '先／生／書', meaning: 'trước / sinh / viết', href: '/kanji/list?level=N5', linkLabel: 'Bảng N5' },
          { pattern: '語／本／読', meaning: 'ngữ / sách / đọc', href: '/kanji/list?level=N5', linkLabel: 'Bảng N5' },
        ],
      },
      {
        id: 'k-n5-action',
        label: 'Động từ cơ bản',
        labelJa: '動詞',
        patterns: [
          { pattern: '行／来／帰', meaning: 'đi / đến / về', href: '/kanji/list?level=N5', linkLabel: 'Bảng N5' },
          { pattern: '見／聞／言', meaning: 'xem / nghe / nói', href: '/kanji/list?level=N5', linkLabel: 'Bảng N5' },
          { pattern: '食／飲／買', meaning: 'ăn / uống / mua', href: '/kanji/list?level=N5', linkLabel: 'Bảng N5' },
        ],
      },
    ],
  },
  {
    level: 'N4',
    title: 'Mở rộng đời sống',
    summary: '~300 chữ · cảm xúc, cơ thể, địa điểm, công việc nhẹ.',
    accent: '#14b8a6',
    branches: [
      {
        id: 'k-n4-feel',
        label: 'Cảm xúc · tính cách',
        labelJa: '心',
        patterns: [
          { pattern: '思／考／知', meaning: 'nghĩ / suy / biết', href: '/kanji/list?level=N4', linkLabel: 'Bảng N4' },
          { pattern: '楽／苦／忙', meaning: 'vui / khổ / bận', href: '/kanji/list?level=N4', linkLabel: 'Bảng N4' },
          { pattern: '急／特／別', meaning: 'gấp / đặc / biệt', href: '/kanji/list?level=N4', linkLabel: 'Bảng N4' },
        ],
      },
      {
        id: 'k-n4-body',
        label: 'Cơ thể · sức khỏe',
        labelJa: '体',
        patterns: [
          { pattern: '体／頭／顔', meaning: 'cơ thể / đầu / mặt', href: '/kanji/list?level=N4', linkLabel: 'Bảng N4' },
          { pattern: '目／耳／口', meaning: 'mắt / tai / miệng', href: '/kanji/list?level=N4', linkLabel: 'Bảng N4' },
          { pattern: '病／薬／痛', meaning: 'bệnh / thuốc / đau', href: '/kanji/list?level=N4', linkLabel: 'Bảng N4' },
        ],
      },
      {
        id: 'k-n4-place',
        label: 'Địa điểm · giao thông',
        labelJa: '場',
        patterns: [
          { pattern: '場／所／建', meaning: 'chỗ / nơi / xây', href: '/kanji/list?level=N4', linkLabel: 'Bảng N4' },
          { pattern: '駅／通／道', meaning: 'ga / thông / đường', href: '/kanji/list?level=N4', linkLabel: 'Bảng N4' },
          { pattern: '旅／乗／送', meaning: 'du lịch / lên / gửi', href: '/kanji/list?level=N4', linkLabel: 'Bảng N4' },
        ],
      },
      {
        id: 'k-n4-work',
        label: 'Công việc · xã hội',
        labelJa: '仕',
        patterns: [
          { pattern: '仕／事／会', meaning: 'làm / việc / họp', href: '/kanji/list?level=N4', linkLabel: 'Bảng N4' },
          { pattern: '社／員／業', meaning: 'xã / viên / nghiệp', href: '/kanji/list?level=N4', linkLabel: 'Bảng N4' },
          { pattern: '質／問／答', meaning: 'chất / hỏi / đáp', href: '/kanji/list?level=N4', linkLabel: 'Bảng N4' },
        ],
      },
      {
        id: 'k-n4-nature2',
        label: 'Thiên nhiên mở rộng',
        labelJa: '季節',
        patterns: [
          { pattern: '春／夏／秋／冬', meaning: 'xuân / hạ / thu / đông', href: '/kanji/list?level=N4', linkLabel: 'Bảng N4' },
          { pattern: '風／雪／雲', meaning: 'gió / tuyết / mây', href: '/kanji/list?level=N4', linkLabel: 'Bảng N4' },
          { pattern: '海／島／池', meaning: 'biển / đảo / ao', href: '/kanji/list?level=N4', linkLabel: 'Bảng N4' },
        ],
      },
    ],
  },
  {
    level: 'N3',
    title: 'Xã hội & trừu tượng',
    summary: '~650 chữ · tin tức, quan hệ, khái niệm phổ biến.',
    accent: '#3b82f6',
    branches: [
      {
        id: 'k-n3-society',
        label: 'Xã hội · chính trị',
        labelJa: '社会',
        patterns: [
          { pattern: '政／治／法', meaning: 'chính / trị / pháp', href: '/kanji/list?level=N3', linkLabel: 'Bảng N3' },
          { pattern: '経／済／産', meaning: 'kinh / tế / sản', href: '/kanji/list?level=N3', linkLabel: 'Bảng N3' },
          { pattern: '環／境／保', meaning: 'hoàn / cảnh / bảo', href: '/kanji/list?level=N3', linkLabel: 'Bảng N3' },
        ],
      },
      {
        id: 'k-n3-news',
        label: 'Tin tức · sự kiện',
        labelJa: '報道',
        patterns: [
          { pattern: '発／表／報', meaning: 'phát / biểu / báo', href: '/kanji/list?level=N3', linkLabel: 'Bảng N3' },
          { pattern: '事／件／故', meaning: 'sự / kiện / cố', href: '/kanji/list?level=N3', linkLabel: 'Bảng N3' },
          { pattern: '影／響／変', meaning: 'ảnh / hưởng / biến', href: '/kanji/list?level=N3', linkLabel: 'Bảng N3' },
        ],
      },
      {
        id: 'k-n3-abstract',
        label: 'Khái niệm trừu tượng',
        labelJa: '抽象',
        patterns: [
          { pattern: '場／合／際', meaning: 'trường hợp / khi', href: '/kanji/list?level=N3', linkLabel: 'Bảng N3' },
          { pattern: '方／法／術', meaning: 'phương / pháp / thuật', href: '/kanji/list?level=N3', linkLabel: 'Bảng N3' },
          { pattern: '理／由／係', meaning: 'lý / do / hệ', href: '/kanji/list?level=N3', linkLabel: 'Bảng N3' },
        ],
      },
      {
        id: 'k-n3-emotion',
        label: 'Cảm xúc nâng cao',
        labelJa: '感情',
        patterns: [
          { pattern: '感／情／態', meaning: 'cảm / tình / thái', href: '/kanji/list?level=N3', linkLabel: 'Bảng N3' },
          { pattern: '緊／張／圧', meaning: 'căng / trương / áp', href: '/kanji/list?level=N3', linkLabel: 'Bảng N3' },
          { pattern: '不／満／足', meaning: 'bất / mãn / túc', href: '/kanji/list?level=N3', linkLabel: 'Bảng N3' },
        ],
      },
      {
        id: 'k-n3-business',
        label: 'Công sở',
        labelJa: '業務',
        patterns: [
          { pattern: '連／絡／報', meaning: 'liên / lạc / báo', href: '/kanji/list?level=N3', linkLabel: 'Bảng N3' },
          { pattern: '資／料／計', meaning: 'tư / liệu / kế', href: '/kanji/list?level=N3', linkLabel: 'Bảng N3' },
          { pattern: '期／限／切', meaning: 'kỳ / hạn / cắt', href: '/kanji/list?level=N3', linkLabel: 'Bảng N3' },
        ],
      },
    ],
  },
  {
    level: 'N2',
    title: 'Đọc hiểu & công việc',
    summary: '~1000 chữ · báo chí, kinh tế, từ Hán phức tạp hơn.',
    accent: '#f59e0b',
    branches: [
      {
        id: 'k-n2-media',
        label: 'Truyền thông',
        labelJa: '報道',
        patterns: [
          { pattern: '論／評／批', meaning: 'luận / bình / phê', href: '/kanji/list?level=N2', linkLabel: 'Bảng N2' },
          { pattern: '記／載／掲', meaning: 'ký / tải / yết', href: '/kanji/list?level=N2', linkLabel: 'Bảng N2' },
          { pattern: '世／論／傾', meaning: 'thế / luận / khuynh', href: '/kanji/list?level=N2', linkLabel: 'Bảng N2' },
        ],
      },
      {
        id: 'k-n2-economy',
        label: 'Kinh tế · tài chính',
        labelJa: '経済',
        patterns: [
          { pattern: '景／気／消', meaning: 'cảnh / khí / tiêu', href: '/kanji/list?level=N2', linkLabel: 'Bảng N2' },
          { pattern: '投／資／損', meaning: 'đầu / tư / tổn', href: '/kanji/list?level=N2', linkLabel: 'Bảng N2' },
          { pattern: '税／収／益', meaning: 'thuế / thu / ích', href: '/kanji/list?level=N2', linkLabel: 'Bảng N2' },
        ],
      },
      {
        id: 'k-n2-nuance',
        label: 'Sắc thái · đánh giá',
        labelJa: '語感',
        patterns: [
          { pattern: '曖／昧／微', meaning: 'ái / muội / vi', href: '/kanji/list?level=N2', linkLabel: 'Bảng N2' },
          { pattern: '深／刻／厳', meaning: 'thâm / khắc / nghiêm', href: '/kanji/list?level=N2', linkLabel: 'Bảng N2' },
          { pattern: '適／切／妥', meaning: 'thích / thiết / thỏa', href: '/kanji/list?level=N2', linkLabel: 'Bảng N2' },
        ],
      },
      {
        id: 'k-n2-compound',
        label: 'Hán ngữ công sở',
        labelJa: '漢語',
        patterns: [
          { pattern: '実／施／検', meaning: 'thực / thi / kiểm', href: '/kanji/list?level=N2', linkLabel: 'Bảng N2' },
          { pattern: '検／討／確', meaning: 'kiểm / thảo / xác', href: '/kanji/list?level=N2', linkLabel: 'Bảng N2' },
          { pattern: '提／案／承', meaning: 'đề / án / thừa', href: '/kanji/list?level=N2', linkLabel: 'Bảng N2' },
        ],
      },
      {
        id: 'k-n2-formal',
        label: 'Lịch sự · nghi thức',
        labelJa: '礼儀',
        patterns: [
          { pattern: '敬／礼／儀', meaning: 'kính / lễ / nghi', href: '/kanji/list?level=N2', linkLabel: 'Bảng N2' },
          { pattern: '対／応／処', meaning: 'đối / ứng / xử', href: '/kanji/list?level=N2', linkLabel: 'Bảng N2' },
          { pattern: '承／認／許', meaning: 'thừa / nhận / hứa', href: '/kanji/list?level=N2', linkLabel: 'Bảng N2' },
        ],
      },
    ],
  },
  {
    level: 'N1',
    title: 'Văn viết & chuyên ngành',
    summary: '~2000 chữ · học thuật, văn chương, luật · chính trị.',
    accent: '#ef4444',
    branches: [
      {
        id: 'k-n1-literary',
        label: 'Văn chương',
        labelJa: '文語',
        patterns: [
          { pattern: '趣／情／味', meaning: 'thú / tình / vị', href: '/kanji/list?level=N1', linkLabel: 'Bảng N1' },
          { pattern: '名／残／風', meaning: 'danh / tàn / phong', href: '/kanji/list?level=N1', linkLabel: 'Bảng N1' },
          { pattern: '雅／致／粋', meaning: 'nhã / trí / túy', href: '/kanji/list?level=N1', linkLabel: 'Bảng N1' },
        ],
      },
      {
        id: 'k-n1-academic',
        label: 'Học thuật',
        labelJa: '学術',
        patterns: [
          { pattern: '仮／説／験', meaning: 'giả / thuyết / nghiệm', href: '/kanji/list?level=N1', linkLabel: 'Bảng N1' },
          { pattern: '観／点／析', meaning: 'quan / điểm / tích', href: '/kanji/list?level=N1', linkLabel: 'Bảng N1' },
          { pattern: '構／造／概', meaning: 'cấu / tạo / khái', href: '/kanji/list?level=N1', linkLabel: 'Bảng N1' },
        ],
      },
      {
        id: 'k-n1-law',
        label: 'Luật · chính trị',
        labelJa: '法制',
        patterns: [
          { pattern: '憲／法／規', meaning: 'hiến / pháp / quy', href: '/kanji/list?level=N1', linkLabel: 'Bảng N1' },
          { pattern: '裁／判／訟', meaning: 'tài / phán / tụng', href: '/kanji/list?level=N1', linkLabel: 'Bảng N1' },
          { pattern: '権／利／義', meaning: 'quyền / lợi / nghĩa', href: '/kanji/list?level=N1', linkLabel: 'Bảng N1' },
        ],
      },
      {
        id: 'k-n1-attitude',
        label: 'Thái độ · đánh giá',
        labelJa: '評価',
        patterns: [
          { pattern: '宜／激／厳', meaning: 'nghi / khích / nghiêm', href: '/kanji/list?level=N1', linkLabel: 'Bảng N1' },
          { pattern: '妥／当／適', meaning: 'thỏa / đáng / thích', href: '/kanji/list?level=N1', linkLabel: 'Bảng N1' },
          { pattern: '秀／逸／卓', meaning: 'tú / dật / trác', href: '/kanji/list?level=N1', linkLabel: 'Bảng N1' },
        ],
      },
    ],
  },
];
