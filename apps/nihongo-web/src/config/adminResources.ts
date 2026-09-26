/**
 * Nguồn duy nhất cho metadata (label/icon/href/hint) của các "resource" nội
 * dung quản lý trong Admin — trước đây bị duy trì độc lập ở 3 nơi
 * (AdminShell.NAV, AdminContentResourcePage.META, AdminDashboardPage.STAT_META)
 * nên dễ lệch nhau khi thêm resource mới. Mọi nơi cần label/icon/href của
 * 1 resource nội dung nên import từ đây.
 */

export interface AdminResourceMeta {
  key: string;
  title: string;
  icon: string;
  href: string;
  hint: string;
}

export const ADMIN_CONTENT_RESOURCES: AdminResourceMeta[] = [
  { key: 'lessons', title: 'Lessons', icon: '📚', href: '/admin/content/lessons', hint: 'Thêm / sửa / xoá bài học (Minna & JLPT).' },
  { key: 'vocabularies', title: 'Từ vựng', icon: '🈶', href: '/admin/content/vocabularies', hint: 'Chọn bài → danh sách từ trong bài (thêm / sửa / xoá).' },
  { key: 'grammars', title: 'Ngữ pháp', icon: '📝', href: '/admin/content/grammars', hint: 'Chọn bài → danh sách mẫu ngữ pháp trong bài.' },
  { key: 'exercises', title: 'Exercises', icon: '✏️', href: '/admin/content/exercises', hint: 'Chọn bài → danh sách bài tập trong bài.' },
  { key: 'kanjiLessons', title: 'Kanji lessons', icon: '📖', href: '/admin/content/kanjiLessons', hint: 'Thêm / sửa / xoá "bài kanji" (nhóm chứa các chữ).' },
  { key: 'kanjiEntries', title: 'Kanji', icon: '📌', href: '/admin/content/kanjiEntries', hint: 'Chọn bài kanji → danh sách chữ (thêm / sửa / xoá).' },
  { key: 'reading', title: 'Đọc hiểu', icon: '📰', href: '/admin/content/reading', hint: 'Thêm / sửa / xoá bài đọc hiểu N5-N1 kèm câu hỏi.' },
  { key: 'mockExams', title: 'Đề thi thử', icon: '🎯', href: '/admin/content/mockExams', hint: 'Quản lý template + câu hỏi đề thi thử.' },
  { key: 'mindMaps', title: 'Sơ đồ tư duy', icon: '🗺', href: '/admin/mind-maps', hint: 'Thêm / sửa / xoá / kéo thả nhánh sơ đồ ngữ pháp · từ vựng · kanji.' },
  { key: 'users', title: 'Users', icon: '👤', href: '/admin/content/users', hint: 'Đổi role USER / TEACHER / ADMIN.' },
  { key: 'examResults', title: 'Exam results', icon: '📊', href: '/admin/content/examResults', hint: 'Xem và xoá kết quả thi thử.' },
];

export type AdminContentResource = (typeof ADMIN_CONTENT_RESOURCES)[number]['key'];

const RESOURCE_MAP = new Map(ADMIN_CONTENT_RESOURCES.map((r) => [r.key, r]));

export function isAdminContentResource(value: string): value is AdminContentResource {
  return RESOURCE_MAP.has(value);
}

export function getAdminResourceMeta(key: string): AdminResourceMeta | undefined {
  return RESOURCE_MAP.get(key);
}
