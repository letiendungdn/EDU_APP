export interface NavItemConfig {
  path: string;
  icon: string;
  label: string;
  exact?: boolean;
}

export interface NavGroupConfig {
  label: string;
  items: NavItemConfig[];
}

export const NAV_GROUPS: NavGroupConfig[] = [
  {
    label: 'Học',
    items: [
      { path: '/kana', icon: 'あ', label: 'Kana' },
      { path: '/vocab', icon: '単', label: 'Từ vựng' },
      { path: '/grammar', icon: '文', label: 'Ngữ pháp' },
      { path: '/kanji', icon: '漢', label: 'Kanji' },
      { path: '/strokes', icon: '筆', label: 'Tra nét viết' },
      { path: '/counters', icon: '①', label: 'Đếm số' },
      { path: '/suffixes', icon: '語', label: 'Hậu tố' },
      { path: '/word-classes', icon: '品', label: 'Loại từ' },
    ],
  },
  {
    label: 'Phát âm',
    items: [
      { path: '/pronunciation', icon: '🎤', label: 'Luyện phát âm' },
      { path: '/pronunciation-rules', icon: '📖', label: 'Quy tắc phát âm' },
      { path: '/tts', icon: '🔊', label: 'Đọc văn bản' },
      { path: '/stt', icon: '🎙️', label: 'Ghi âm → chữ' },
      { path: '/english-katakana', icon: 'EN', label: 'EN ↔ カナ' },
    ],
  },
  {
    label: 'Nội dung',
    items: [
      { path: '/daily-listening', icon: '🎧', label: 'Nghe mỗi ngày' },
      { path: '/conversation', icon: '話', label: 'Giao tiếp · 自己紹介' },
      { path: '/listening-types', icon: '耳', label: 'Dạng nghe JLPT' },
      { path: '/roleplay', icon: '🗣', label: 'Đóng vai' },
      { path: '/book-audio', icon: '📻', label: 'File nghe sách' },
      { path: '/reading', icon: '📰', label: 'Đọc hiểu' },
      { path: '/dictation', icon: '✍️', label: 'Nghe chép' },
      { path: '/notes', icon: '📝', label: 'Ghi chú ngày' },
    ],
  },
  {
    label: 'Luyện tập',
    items: [
      { path: '/practice', icon: '⚔', label: 'Hub luyện tập' },
      { path: '/conjugation', icon: '変', label: 'Chia động từ' },
      { path: '/particles', icon: '助', label: 'Điền trợ từ' },
      { path: '/kanji-readings', icon: '読', label: 'Kanji trong từ' },
      { path: '/grammar-srs', icon: '文', label: 'SRS ngữ pháp' },
      { path: '/srs', icon: '🧠', label: 'SRS — Thẻ ghi nhớ' },
      { path: '/sentence-practice', icon: '✍️', label: 'Luyện câu AI' },
      { path: '/vocab/picture', icon: '🖼️', label: 'Từ điển tranh' },
      { path: '/vocab-review', icon: '🔄', label: 'Từ sai' },
      { path: '/quiz', icon: '✏️', label: 'Quiz' },
      { path: '/mock-exam', icon: '📋', label: 'Thi thử JLPT' },
      { path: '/jlpt', icon: '🎯', label: 'Lộ trình JLPT' },
      { path: '/analytics', icon: '📊', label: 'Tiến độ' },
    ],
  },
  {
    label: 'Khác',
    items: [
      { path: '/community', icon: '👥', label: 'Cộng đồng' },
      { path: '/support', icon: '💬', label: 'Hỗ trợ' },
      { path: '/pricing', icon: '⚡', label: 'Nâng cấp' },
    ],
  },
];
