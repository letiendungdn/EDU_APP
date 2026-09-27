// Kanji thường gặp còn thiếu trong DB (phát hiện khi đối chiếu với danh sách OpenJLPT —
// file jlpt-kanji-gap-fill.data.ts không seed được vì bản dịch máy sai).
// Tự soạn tay: Hán-Việt, âm đọc, nghĩa tiếng Việt, số nét.
// KanjiLesson mới: 316–317 (N3). 処 → bài 417 (N2), 枠 → bài 845 (N1) — ở file tương ứng.

import type { JlptKanjiLesson } from './jlpt-kanji.data';

export const JLPT_KANJI_MISSING: JlptKanjiLesson[] = [
  {
    lessonNumber: 316,
    jlptLevel: 'N3',
    title: 'Bài 46 · Kanji N3 bổ sung (7)',
    sortOrder: 3160,
    entries: [
      { character: '願', hanViet: 'NGUYỆN', onyomi: 'がん', kunyomi: 'ねが-う', meaningVi: 'mong muốn, cầu xin, nguyện vọng', strokeCount: 19 },
      { character: '局', hanViet: 'CỤC', onyomi: 'きょく', meaningVi: 'cục, cơ quan; cục diện, ván cờ', strokeCount: 7 },
      { character: '候', hanViet: 'HẬU', onyomi: 'こう', kunyomi: 'そうろう', meaningVi: 'khí hậu, thời tiết; ứng cử (hậu bổ)', strokeCount: 10 },
      { character: '亡', hanViet: 'VONG', onyomi: 'ぼう, もう', kunyomi: 'な-い, な-くなる', meaningVi: 'chết, mất; diệt vong', strokeCount: 3 },
      { character: '適', hanViet: 'THÍCH', onyomi: 'てき', meaningVi: 'thích hợp, phù hợp', strokeCount: 14 },
      { character: '婦', hanViet: 'PHỤ', onyomi: 'ふ', meaningVi: 'người phụ nữ; vợ (phu phụ)', strokeCount: 11 },
      { character: '寄', hanViet: 'KÍ', onyomi: 'き', kunyomi: 'よ-る, よ-せる', meaningVi: 'ghé qua; tiến lại gần; gửi (kí gửi)', strokeCount: 11 },
      { character: '返', hanViet: 'PHẢN', onyomi: 'へん', kunyomi: 'かえ-す, かえ-る', meaningVi: 'trả lại; đáp lại', strokeCount: 7 },
      { character: '背', hanViet: 'BỐI', onyomi: 'はい', kunyomi: 'せ, せい, そむ-く', meaningVi: 'lưng; chiều cao; làm trái', strokeCount: 9 },
      { character: '途', hanViet: 'ĐỒ', onyomi: 'と', meaningVi: 'con đường; giữa chừng (đồ trung)', strokeCount: 10 },
    ],
  },
  {
    lessonNumber: 317,
    jlptLevel: 'N3',
    title: 'Bài 47 · Kanji N3 bổ sung (8)',
    sortOrder: 3170,
    entries: [
      { character: '抜', hanViet: 'BẠT', onyomi: 'ばつ', kunyomi: 'ぬ-く, ぬ-ける', meaningVi: 'rút ra, nhổ; bỏ sót; vượt qua', strokeCount: 7 },
      { character: '努', hanViet: 'NỖ', onyomi: 'ど', kunyomi: 'つと-める', meaningVi: 'nỗ lực, cố gắng', strokeCount: 7 },
      { character: '散', hanViet: 'TÁN', onyomi: 'さん', kunyomi: 'ち-る, ち-らす, ち-らかる', meaningVi: 'phân tán, rơi rụng; tản bộ', strokeCount: 12 },
      { character: '倒', hanViet: 'ĐẢO', onyomi: 'とう', kunyomi: 'たお-れる, たお-す', meaningVi: 'ngã, đổ; đánh đổ', strokeCount: 10 },
      { character: '等', hanViet: 'ĐẲNG', onyomi: 'とう', kunyomi: 'ひと-しい, など', meaningVi: 'bằng nhau; cấp bậc; vân vân', strokeCount: 12 },
      { character: '曲', hanViet: 'KHÚC', onyomi: 'きょく', kunyomi: 'ま-がる, ま-げる', meaningVi: 'uốn cong, rẽ; bài hát, khúc nhạc', strokeCount: 6 },
      { character: '庭', hanViet: 'ĐÌNH', onyomi: 'てい', kunyomi: 'にわ', meaningVi: 'sân, vườn; gia đình', strokeCount: 10 },
      { character: '居', hanViet: 'CƯ', onyomi: 'きょ', kunyomi: 'い-る', meaningVi: 'ở, cư trú', strokeCount: 8 },
      { character: '更', hanViet: 'CANH', onyomi: 'こう', kunyomi: 'さら, ふ-ける', meaningVi: 'thay đổi (canh tân); hơn nữa; về khuya', strokeCount: 7 },
      { character: '抱', hanViet: 'BÃO', onyomi: 'ほう', kunyomi: 'だ-く, いだ-く, かか-える', meaningVi: 'ôm, bế; ôm ấp (hoài bão)', strokeCount: 8 },
    ],
  },
];
