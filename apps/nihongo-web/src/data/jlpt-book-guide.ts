/** Gợi ý sách luyện thi JLPT — link NXB / nhà sách (không phải nội dung trong app). */

export type BookLevelId = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';

export type RecommendedBook = {
  id: string;
  title: string;
  series: string;
  why: string;
  /** Có bản giải thích / chú thích tiếng Việt */
  hasVietnamese: boolean;
  vietnameseNote?: string;
  buyUrl: string;
  buyLabel: string;
  levels: BookLevelId[];
};

export const JLPT_BOOK_GUIDE_INTRO =
  'Nội dung N3–N1 trong app chỉ mang tính tham khảo (best-effort). Để học chắc nghĩa và dạng đề, nên mua thêm sách luyện thi uy tín — ưu tiên bản có tiếng Việt nếu còn mới học.';

export const JLPT_RECOMMENDED_BOOKS: RecommendedBook[] = [
  {
    id: 'skm-n4-grammar-vi',
    title: 'Shin Kanzen Master N4 · Ngữ pháp (ベトナム語版)',
    series: '新完全マスター',
    why: 'Ôn lại sơ cấp cuối + dạng đề N4. Bản Việt chính thức từ NXB 3A — dễ tự học.',
    hasVietnamese: true,
    vietnameseNote: 'Bản Việt chính thức (3A Network)',
    buyUrl: 'https://www.3anet.co.jp/np/books/3690/',
    buyLabel: 'Xem trên 3A Network',
    levels: ['n4', 'n5'],
  },
  {
    id: 'skm-n3-grammar-vi',
    title: 'Shin Kanzen Master N3 · Ngữ pháp (ベトナム語版)',
    series: '新完全マスター',
    why: 'Sách ngữ pháp N3 chuẩn luyện thi: giải thích ngắn, bài tập nhiều, có mô phỏng đề.',
    hasVietnamese: true,
    vietnameseNote: 'Bản Việt chính thức (3A Network)',
    buyUrl: 'https://www.3anet.co.jp/np/books/3680/',
    buyLabel: 'Xem trên 3A Network',
    levels: ['n3'],
  },
  {
    id: 'sou-n3-grammar-vi',
    title: 'Nihongo Sō-Matome N3 · Ngữ pháp',
    series: '日本語総まとめ',
    why: 'Ôn theo ngày (~6–8 tuần), gọn. Bản bán ở VN thường có chú thích / dịch tiếng Việt.',
    hasVietnamese: true,
    vietnameseNote: 'Bản kèm dịch / chú thích tiếng Việt (VN)',
    buyUrl: 'https://vnjpbook.com/soumatome-n3-ngu-phap/',
    buyLabel: 'Xem tại vnjpbook',
    levels: ['n3'],
  },
  {
    id: 'skm-n2-grammar',
    title: 'Shin Kanzen Master N2 · Ngữ pháp',
    series: '新完全マスター',
    why: 'Chuyên sâu N2 (~211 mẫu theo nghĩa). Bản NXB chủ yếu tiếng Nhật — nên có trình độ đọc giải thích JP.',
    hasVietnamese: false,
    vietnameseNote: 'Chưa có bản Việt chính thức từ NXB',
    buyUrl: 'https://www.3anet.co.jp/np/books/3602/',
    buyLabel: 'Xem trên 3A Network',
    levels: ['n2'],
  },
  {
    id: 'sou-n2-grammar-vi',
    title: 'Nihongo Sō-Matome N2 · Ngữ pháp',
    series: '日本語総まとめ',
    why: 'Lịch ôn N2 theo tuần; dễ kết hợp với app. Bản VN có chú thích tiếng Việt.',
    hasVietnamese: true,
    vietnameseNote: 'Bản kèm dịch / chú thích tiếng Việt (VN)',
    buyUrl: 'https://vnjpbook.com/soumatome-n2-ngu-phap/',
    buyLabel: 'Xem tại vnjpbook',
    levels: ['n2'],
  },
  {
    id: 'skm-n1-grammar',
    title: 'Shin Kanzen Master N1 · Ngữ pháp',
    series: '新完全マスター',
    why: 'Ngữ pháp N1 theo nhóm nghĩa + luyện dạng đề. Chủ yếu bản Nhật.',
    hasVietnamese: false,
    vietnameseNote: 'Chưa có bản Việt chính thức từ NXB',
    buyUrl: 'https://www.3anet.co.jp/np/books/3600/',
    buyLabel: 'Xem trên 3A Network',
    levels: ['n1'],
  },
  {
    id: 'skm-series',
    title: 'Bộ Shin Kanzen Master (語彙 · 読解 · 聴解 · 漢字)',
    series: '新完全マスター',
    why: 'Ngoài ngữ pháp, nên lấy thêm từ vựng / đọc / nghe cùng cấp. N3–N4 có một số cuốn bản Việt.',
    hasVietnamese: true,
    vietnameseNote: 'Một số cuốn N3–N4 có bản Việt',
    buyUrl: 'https://www.3anet.co.jp/np/list.html?series_id=4',
    buyLabel: 'Danh sách series 3A',
    levels: ['n5', 'n4', 'n3', 'n2', 'n1'],
  },
];

export function booksForLevel(levelId: string): RecommendedBook[] {
  const id = levelId as BookLevelId;
  return JLPT_RECOMMENDED_BOOKS.filter((book) => book.levels.includes(id));
}
