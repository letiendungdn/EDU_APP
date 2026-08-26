-- Seed home page stats & feature sections (from home-page.data.ts)
BEGIN;

DELETE FROM "HomeFeatureItem";
DELETE FROM "HomeFeatureSection";
DELETE FROM "HomeStat";

INSERT INTO "HomeStat" ("value", "label", "suffix", "sortOrder", "updatedAt") VALUES
('50', 'Bài học', '+', 0, NOW()),
('2000', 'Từ vựng', '+', 1, NOW()),
('512', 'Kanji', '', 2, NOW()),
('N5→N1', 'JLPT', '', 3, NOW());

INSERT INTO "HomeFeatureSection" ("slug", "title", "sortOrder", "updatedAt") VALUES
('start-here', 'Bắt đầu từ đây', 0, NOW()),
('pronunciation', 'Luyện phát âm', 1, NOW()),
('practice-exams', 'Kiểm tra & thi thử', 2, NOW()),
('content', 'Nội dung', 3, NOW());

INSERT INTO "HomeFeatureItem" ("sectionId", "href", "icon", "title", "desc", "sortOrder", "updatedAt")
SELECT s.id, v.href, v.icon, v.title, v.item_desc, v.sort_order, NOW()
FROM "HomeFeatureSection" s
JOIN (VALUES
  ('start-here', '/conversation', '話', 'Giao tiếp', '自己紹介 và câu thông dụng N5', 0),
  ('start-here', '/kana', 'あ', 'Kana', 'Hiragana & Katakana từ đầu', 1),
  ('start-here', '/vocab', '単', 'Từ vựng', 'Flashcard Minna no Nihongo', 2),
  ('start-here', '/grammar', '文', 'Ngữ pháp', 'Cấu trúc câu & mẫu câu', 3),
  ('start-here', '/kanji', '漢', 'Kanji', '512 kanji có hình minh họa', 4),
  ('start-here', '/strokes', '筆', 'Tra nét viết', 'Gõ từ tiếng Nhật → xem cách vẽ', 5),
  ('start-here', '/suffixes', '語', 'Hậu tố', 'さん・的・中・たち… gắn sau từ', 6),
  ('start-here', '/word-classes', '品', 'Loại từ', 'Danh từ, tính từ, động từ Minna 1–50', 7),
  ('pronunciation', '/pronunciation', '🎤', 'Luyện phát âm', 'Ghi âm & so sánh', 0),
  ('pronunciation', '/pronunciation-rules', '📖', 'Quy tắc', 'Nguyên âm, phụ âm, trường âm', 1),
  ('pronunciation', '/tts', '🔊', 'Đọc văn bản', 'Chuyển chữ thành giọng nói', 2),
  ('pronunciation', '/stt', '🎙️', 'Ghi âm → chữ', 'Nói vào micro → văn bản', 3),
  ('pronunciation', '/english-katakana', 'EN', 'EN ↔ カナ', 'Gairaigo & từ mượn tiếng Anh', 4),
  ('pronunciation', '/daily-listening', '🎧', 'Nghe mỗi ngày', '15 phút audio Minna', 5),
  ('practice-exams', '/practice', '⚔', 'Hub luyện tập', '活用・助詞・SRS hai chiều', 0),
  ('practice-exams', '/conjugation', '変', 'Chia động từ', 'て・た・ない・辞書形', 1),
  ('practice-exams', '/particles', '助', 'Điền trợ từ', 'は/が/を/に/で trong câu', 2),
  ('practice-exams', '/quiz', '✏️', 'Quiz', 'Trắc nghiệm & điền từ', 3),
  ('practice-exams', '/vocab/quiz', '㊒', 'TN từ vựng', 'Nhật↔Việt theo bài, đáp án random', 4),
  ('practice-exams', '/kana/quiz', 'あ', 'TN Kana', 'Hiragana/Katakana ↔ romaji', 5),
  ('practice-exams', '/kanji/quiz', '漢', 'TN Kanji', 'Kanji ↔ nghĩa / cách đọc', 6),
  ('practice-exams', '/mock-exam', '📋', 'Thi thử JLPT', 'Đề thi N5–N4 có giờ đếm ngược', 7),
  ('practice-exams', '/vocab-review', '🔄', 'Từ sai', 'Ôn lại từ làm sai trong quiz', 8),
  ('practice-exams', '/dictation', '✍️', 'Nghe chép', 'Dictation luyện tai & viết', 9),
  ('content', '/vocab/picture', '🖼️', 'Từ điển tranh', 'Hình ảnh minh họa từng từ', 0),
  ('content', '/reading', '📰', 'Đọc hiểu', 'Bài đọc theo cấp độ', 1),
  ('content', '/jlpt', '🎯', 'Lộ trình JLPT', 'N5 → N4 → N3 chi tiết', 2),
  ('content', '/analytics', '📊', 'Tiến độ', 'Thống kê học tập của bạn', 3)
) AS v(slug, href, icon, title, item_desc, sort_order) ON s.slug = v.slug;

COMMIT;

SELECT (SELECT COUNT(*) FROM "HomeStat") AS stats,
       (SELECT COUNT(*) FROM "HomeFeatureSection") AS sections,
       (SELECT COUNT(*) FROM "HomeFeatureItem") AS items;
