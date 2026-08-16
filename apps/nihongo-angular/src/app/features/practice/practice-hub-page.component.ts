import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

const ITEMS = [
  { path: '/conjugation', title: '活用 — Chia động từ', desc: 'て・た・ない・辞書形 từ dạng ます Minna' },
  { path: '/particles', title: '助詞 — Trợ từ', desc: 'Điền は/が/を/に/で trong ví dụ ngữ pháp' },
  { path: '/kanji-readings', title: 'Kanji trong từ', desc: '一本 đọc いっぽん, không phải いちほん' },
  { path: '/srs', title: 'SRS hai chiều', desc: 'JP→VN, VN→JP, nghe rồi gõ' },
  { path: '/grammar-srs', title: 'SRS ngữ pháp', desc: 'Ghim mẫu rồi ôn SM-2 trên máy này' },
  { path: '/homophones', title: 'Đồng âm', desc: 'Cùng kana, khác chữ và nghĩa' },
  { path: '/keigo', title: '敬語', desc: '丁寧・尊敬・謙譲 với động từ thường gặp' },
  { path: '/radicals', title: 'Bộ thủ 部首', desc: 'Nhóm kanji theo 氵木言…' },
  { path: '/listening-types', title: '聴解 JLPT', desc: '即時応答・課題理解・ポイント・発話' },
  { path: '/conversation', title: '自己紹介 & câu giao tiếp', desc: 'Bài giới thiệu bản thân + câu thông dụng N5' },
  { path: '/roleplay', title: 'Đóng vai', desc: 'Hội thoại quán / ga / tự giới thiệu' },
  { path: '/counters', title: 'Đếm trong câu', desc: '3本、2匹 gắn vào câu' },
];

@Component({
  selector: 'app-practice-hub-page',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './drills.scss',
  template: `
    <div class="container drill-view">
      <header class="drill-header">
        <h2 class="view-title">Luyện sản xuất</h2>
        <p class="drill-subtitle">Bốn mục đầu nên làm hàng ngày. Các mục còn lại bổ sung N4/N3.</p>
      </header>
      <div class="practice-grid">
        @for (item of items; track item.path) {
          <a [routerLink]="item.path" class="practice-card">
            <strong>{{ item.title }}</strong>
            <span>{{ item.desc }}</span>
          </a>
        }
      </div>
    </div>
  `,
})
export class PracticeHubPageComponent {
  readonly items = ITEMS;
}
