import { Prisma, Textbook } from '@prisma/client';

/**
 * Bài soạn riêng theo khung sách (Sou Matome / Shinkanzen / TRY!) lặp lại các mục JLPT
 * đã có trong kho chung → không tính vào các truy vấn "theo cấp" (bảng kanji, thi thử,
 * mind map dữ liệu…) để khỏi hiện trùng. Minna / KLL là nội dung gốc nên vẫn tính.
 */
export const TEXTBOOK_COPY_SERIES: Textbook[] = [Textbook.SOUMATOME, Textbook.SHINKANZEN, Textbook.TRY];

/**
 * Điều kiện Lesson / KanjiLesson thuộc kho theo cấp.
 * Phải có nhánh `textbook: null`: SQL `NOT IN` loại luôn giá trị NULL.
 */
export const LEVEL_POOL_LESSON = {
  OR: [{ textbook: null }, { textbook: { notIn: TEXTBOOK_COPY_SERIES } }],
} satisfies Prisma.LessonWhereInput & Prisma.KanjiLessonWhereInput;

/** Cùng điều kiện cho SQL thô (bí danh bảng Lesson/KanjiLesson truyền vào). */
export function levelPoolSql(alias: string): Prisma.Sql {
  return Prisma.sql`(${Prisma.raw(`${alias}."textbook"`)} IS NULL OR ${Prisma.raw(`${alias}."textbook"`)} NOT IN ('SOUMATOME', 'SHINKANZEN', 'TRY'))`;
}
