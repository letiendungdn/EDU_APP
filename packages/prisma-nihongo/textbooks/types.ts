/**
 * Kho nội dung soạn riêng cho các giáo trình luyện thi (Sou Matome / Shinkanzen / TRY!).
 * Mỗi cấp có MỘT kho; từng sách dựng bài từ kho theo khung riêng (xem build-units.ts).
 * Nội dung do app tự soạn theo danh sách mẫu/từ JLPT phổ biến — KHÔNG chép từ sách.
 */

export type TbLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

/** [câu tiếng Nhật, romaji, nghĩa tiếng Việt] */
export type TbExample = [jp: string, romaji: string, vi: string];

export type TbGrammar = {
  /** Mẫu ngữ pháp, vd "〜ように" */
  p: string;
  /** Nghĩa ngắn */
  m: string;
  /** Khóa nhóm chức năng (xem TbLevelCatalog.categories) */
  c: string;
  /** Giải thích / lưu ý cách dùng */
  e?: string;
  ex: [TbExample, TbExample];
};

/**
 * [từ, cách đọc (kana), nghĩa, từ loại]
 * Từ chỉ viết kana thì để từ = cách đọc. Từ loại ghi tiếng Việt như dữ liệu sẵn có
 * ("danh từ", "động từ nhóm 1", "tính từ i", "tính từ na", "phó từ", "danh từ, động từ する"…).
 */
export type TbVocab = [word: string, kana: string, meaning: string, pos: string];

export type TbTopic = {
  key: string;
  /** Tên chủ đề tiếng Việt */
  name: string;
  nameJa: string;
  words: TbVocab[];
};

/** [chữ, Hán Việt, âm on, âm kun, nghĩa] — âm ghi kana, nhiều âm cách nhau bằng "、" */
export type TbKanji = [char: string, hanViet: string, on: string, kun: string, meaning: string];

export type TbLevelCatalog = {
  level: TbLevel;
  /** khóa → tên nhóm chức năng ngữ pháp (thứ tự khai báo = thứ tự phần trong Shinkanzen) */
  categories: Record<string, string>;
  grammar: TbGrammar[];
  /** Đúng 6 chủ đề — Sou Matome học mỗi tuần một chủ đề */
  topics: TbTopic[];
  kanji: TbKanji[];
};

export type TbSeries = 'SOUMATOME' | 'SHINKANZEN' | 'TRY';

/** Một bài (một ngày / phần / chương) sẽ thành 1 Lesson (+ 1 KanjiLesson nếu có kanji). */
export type TbUnit = {
  series: TbSeries;
  level: TbLevel;
  section: number;
  sectionTitle: string;
  unit: number;
  title: string;
  grammar: TbGrammar[];
  vocab: TbVocab[];
  kanji: TbKanji[];
};
