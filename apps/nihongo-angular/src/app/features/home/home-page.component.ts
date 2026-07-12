import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface HomeStat {
  value: string;
  label: string;
  suffix: string;
}

interface HomeSectionItem {
  path: string;
  icon: string;
  title: string;
  desc: string;
}

interface HomeSection {
  title: string;
  items: HomeSectionItem[];
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  readonly stats: HomeStat[] = [
    { value: '50', label: 'Bài học', suffix: '+' },
    { value: '2000', label: 'Từ vựng', suffix: '+' },
    { value: '512', label: 'Kanji', suffix: '' },
    { value: 'N5→N1', label: 'JLPT', suffix: '' },
  ];

  readonly sections: HomeSection[] = [
    {
      title: 'Bắt đầu từ đây',
      items: [
        { path: '/kana', icon: 'あ', title: 'Kana', desc: 'Hiragana & Katakana từ đầu' },
        { path: '/vocab', icon: '単', title: 'Từ vựng', desc: 'Flashcard Minna no Nihongo' },
        { path: '/grammar', icon: '文', title: 'Ngữ pháp', desc: 'Cấu trúc câu & mẫu câu' },
        { path: '/kanji', icon: '漢', title: 'Kanji', desc: '512 kanji có hình minh họa' },
        { path: '/strokes', icon: '筆', title: 'Tra nét viết', desc: 'Gõ từ tiếng Nhật → xem cách vẽ' },
      ],
    },
    {
      title: 'Luyện phát âm',
      items: [
        { path: '/pronunciation', icon: '🎤', title: 'Luyện phát âm', desc: 'Ghi âm & so sánh' },
        { path: '/pronunciation-rules', icon: '📖', title: 'Quy tắc', desc: 'Nguyên âm, phụ âm, trường âm' },
        { path: '/tts', icon: '🔊', title: 'Đọc văn bản', desc: 'Chuyển chữ thành giọng nói' },
        { path: '/stt', icon: '🎙️', title: 'Ghi âm → chữ', desc: 'Nói vào micro → văn bản' },
        { path: '/english-katakana', icon: 'EN', title: 'EN ↔ カナ', desc: 'Gairaigo & từ mượn tiếng Anh' },
        { path: '/daily-listening', icon: '🎧', title: 'Nghe mỗi ngày', desc: '15 phút audio Minna' },
      ],
    },
    {
      title: 'Kiểm tra & thi thử',
      items: [
        { path: '/quiz', icon: '✏️', title: 'Quiz', desc: 'Trắc nghiệm & điền từ' },
        { path: '/mock-exam', icon: '📋', title: 'Thi thử JLPT', desc: 'Đề thi N5–N4 có giờ đếm ngược' },
        { path: '/vocab-review', icon: '🔄', title: 'Từ sai', desc: 'Ôn lại từ làm sai trong quiz' },
        { path: '/dictation', icon: '✍️', title: 'Nghe chép', desc: 'Dictation luyện tai & viết' },
      ],
    },
    {
      title: 'Nội dung',
      items: [
        { path: '/vocab/picture', icon: '🖼️', title: 'Từ điển tranh', desc: 'Hình ảnh minh họa từng từ' },
        { path: '/reading', icon: '📰', title: 'Đọc hiểu', desc: 'Bài đọc theo cấp độ' },
        { path: '/jlpt', icon: '🎯', title: 'Lộ trình JLPT', desc: 'N5 → N4 → N3 chi tiết' },
        { path: '/analytics', icon: '📊', title: 'Tiến độ', desc: 'Thống kê học tập của bạn' },
      ],
    },
  ];
}
