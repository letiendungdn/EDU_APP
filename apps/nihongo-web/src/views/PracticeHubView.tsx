'use client';

import Link from 'next/link';
import './DrillView.css';

const ITEMS = [
  { href: '/conjugation', title: '活用 — Chia động từ', desc: 'て・た・ない・辞書形 từ dạng ます Minna' },
  { href: '/particles', title: '助詞 — Trợ từ', desc: 'Điền は/が/を/に/で trong ví dụ ngữ pháp' },
  { href: '/kanji-readings', title: 'Kanji trong từ', desc: '一本 đọc いっぽん, không phải いちほん' },
  { href: '/srs', title: 'SRS hai chiều', desc: 'JP→VN, VN→JP, nghe rồi gõ' },
  { href: '/homophones', title: 'Đồng âm', desc: 'Cùng kana, khác chữ và nghĩa' },
  { href: '/keigo', title: '敬語', desc: '丁寧・尊敬・謙譲 với động từ thường gặp' },
  { href: '/radicals', title: 'Bộ thủ 部首', desc: 'Nhóm kanji theo 氵木言…' },
  { href: '/grammar-srs', title: 'SRS ngữ pháp', desc: 'Ghim mẫu rồi ôn SM-2 trên máy này' },
  { href: '/listening-types', title: '聴解 JLPT', desc: '即時応答・課題理解・ポイント・発話' },
  { href: '/conversation', title: '自己紹介 & câu giao tiếp', desc: 'Bài giới thiệu bản thân + câu thông dụng N5' },
  { href: '/roleplay', title: 'Đóng vai', desc: 'Hội thoại quán / ga / tự giới thiệu' },
  { href: '/counters', title: 'Đếm trong câu', desc: '3本、2匹 gắn vào câu' },
];

export default function PracticeHubView() {
  return (
    <div className="container drill-view">
      <header className="drill-header">
        <h2 className="view-title">Luyện sản xuất</h2>
        <p className="drill-subtitle">
          Bốn mục đầu là việc cần làm hàng ngày. Các mục còn lại bổ sung N4/N3 và nói tự nhiên.
        </p>
      </header>
      <div className="practice-grid">
        {ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="practice-card">
            <strong>{item.title}</strong>
            <span>{item.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
