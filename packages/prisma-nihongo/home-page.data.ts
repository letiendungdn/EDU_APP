export type HomeStatSeed = {
  value: string;
  label: string;
  suffix: string;
};

export type HomeFeatureItemSeed = {
  href: string;
  icon: string;
  title: string;
  desc: string;
};

export type HomeFeatureSectionSeed = {
  slug: string;
  title: string;
  items: HomeFeatureItemSeed[];
};

export const HOME_STATS: HomeStatSeed[] = [
  { value: '50', label: 'Bài học', suffix: '+' },
  { value: '2000', label: 'Từ vựng', suffix: '+' },
  { value: '512', label: 'Kanji', suffix: '' },
  { value: 'N5→N1', label: 'JLPT', suffix: '' },
];

export const HOME_SECTIONS: HomeFeatureSectionSeed[] = [
  {
    slug: 'start-here',
    title: 'Bắt đầu từ đây',
    items: [
      { href: '/conversation', icon: '話', title: 'Giao tiếp', desc: '自己紹介 và câu thông dụng N5' },
      { href: '/kana', icon: 'あ', title: 'Kana', desc: 'Hiragana & Katakana từ đầu' },
      { href: '/vocab', icon: '単', title: 'Từ vựng', desc: 'Flashcard Minna no Nihongo' },
      { href: '/grammar', icon: '文', title: 'Ngữ pháp', desc: 'Cấu trúc câu & mẫu câu' },
      { href: '/kanji', icon: '漢', title: 'Kanji', desc: '512 kanji có hình minh họa' },
      { href: '/strokes', icon: '筆', title: 'Tra nét viết', desc: 'Gõ từ tiếng Nhật → xem cách vẽ' },
      { href: '/suffixes', icon: '語', title: 'Hậu tố', desc: 'さん・的・中・たち… gắn sau từ' },
      { href: '/word-classes', icon: '品', title: 'Loại từ', desc: 'Danh từ, tính từ, động từ Minna 1–50' },
    ],
  },
  {
    slug: 'pronunciation',
    title: 'Luyện phát âm',
    items: [
      { href: '/pronunciation', icon: '🎤', title: 'Luyện phát âm', desc: 'Ghi âm & so sánh' },
      { href: '/pronunciation-rules', icon: '📖', title: 'Quy tắc', desc: 'Nguyên âm, phụ âm, trường âm' },
      { href: '/tts', icon: '🔊', title: 'Đọc văn bản', desc: 'Chuyển chữ thành giọng nói' },
      { href: '/stt', icon: '🎙️', title: 'Ghi âm → chữ', desc: 'Nói vào micro → văn bản' },
      { href: '/english-katakana', icon: 'EN', title: 'EN ↔ カナ', desc: 'Gairaigo & từ mượn tiếng Anh' },
      { href: '/daily-listening', icon: '🎧', title: 'Nghe mỗi ngày', desc: '15 phút audio Minna' },
    ],
  },
  {
    slug: 'practice-exams',
    title: 'Kiểm tra & thi thử',
    items: [
      { href: '/practice', icon: '⚔', title: 'Hub luyện tập', desc: '活用・助詞・SRS hai chiều' },
      { href: '/conjugation', icon: '変', title: 'Chia động từ', desc: 'て・た・ない・辞書形' },
      { href: '/particles', icon: '助', title: 'Điền trợ từ', desc: 'は/が/を/に/で trong câu' },
      { href: '/quiz', icon: '✏️', title: 'Quiz', desc: 'Trắc nghiệm & điền từ' },
      { href: '/vocab/quiz', icon: '㊒', title: 'TN từ vựng', desc: 'Nhật↔Việt theo bài, đáp án random' },
      { href: '/kana/quiz', icon: 'あ', title: 'TN Kana', desc: 'Hiragana/Katakana ↔ romaji' },
      { href: '/kanji/quiz', icon: '漢', title: 'TN Kanji', desc: 'Kanji ↔ nghĩa / cách đọc' },
      { href: '/mock-exam', icon: '📋', title: 'Thi thử JLPT', desc: 'Đề thi N5–N4 có giờ đếm ngược' },
      { href: '/vocab-review', icon: '🔄', title: 'Từ sai', desc: 'Ôn lại từ làm sai trong quiz' },
      { href: '/dictation', icon: '✍️', title: 'Nghe chép', desc: 'Dictation luyện tai & viết' },
    ],
  },
  {
    slug: 'content',
    title: 'Nội dung',
    items: [
      { href: '/vocab/picture', icon: '🖼️', title: 'Từ điển tranh', desc: 'Hình ảnh minh họa từng từ' },
      { href: '/reading', icon: '📰', title: 'Đọc hiểu', desc: 'Bài đọc theo cấp độ' },
      { href: '/jlpt', icon: '🎯', title: 'Lộ trình JLPT', desc: 'N5 → N4 → N3 chi tiết' },
      { href: '/analytics', icon: '📊', title: 'Tiến độ', desc: 'Thống kê học tập của bạn' },
    ],
  },
];
