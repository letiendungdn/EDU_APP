'use client';

import Link from 'next/link';

// ── Data ───────────────────────────────────────────────────────────────────

const STATS = [
  { value: '50',   label: 'Bài học', suffix: '+' },
  { value: '2000', label: 'Từ vựng', suffix: '+' },
  { value: '512',  label: 'Kanji',   suffix: '' },
  { value: 'N5→N1',label: 'JLPT',   suffix: '' },
];

const SECTIONS = [
  {
    title: 'Bắt đầu từ đây',
    items: [
      { href: '/kana',    icon: 'あ', title: 'Kana',         desc: 'Hiragana & Katakana từ đầu' },
      { href: '/vocab',   icon: '単', title: 'Từ vựng',      desc: 'Flashcard Minna no Nihongo' },
      { href: '/grammar', icon: '文', title: 'Ngữ pháp',     desc: 'Cấu trúc câu & mẫu câu' },
      { href: '/kanji',   icon: '漢', title: 'Kanji',        desc: '512 kanji có hình minh họa' },
    ],
  },
  {
    title: 'Luyện phát âm',
    items: [
      { href: '/pronunciation',       icon: '🎤', title: 'Luyện phát âm',  desc: 'Ghi âm & so sánh' },
      { href: '/pronunciation-rules', icon: '📖', title: 'Quy tắc',        desc: 'Nguyên âm, phụ âm, trường âm' },
      { href: '/english-katakana',    icon: 'EN', title: 'EN ↔ カナ',      desc: 'Gairaigo & từ mượn tiếng Anh' },
      { href: '/daily-listening',     icon: '🎧', title: 'Nghe mỗi ngày',  desc: '15 phút audio Minna' },
    ],
  },
  {
    title: 'Kiểm tra & thi thử',
    items: [
      { href: '/quiz',          icon: '✏️', title: 'Quiz',           desc: 'Trắc nghiệm & điền từ' },
      { href: '/mock-exam',     icon: '📋', title: 'Thi thử JLPT',   desc: 'Đề thi N5–N4 có giờ đếm ngược' },
      { href: '/vocab-review',  icon: '🔄', title: 'Từ sai',         desc: 'Ôn lại từ làm sai trong quiz' },
      { href: '/dictation',     icon: '✍️', title: 'Nghe chép',      desc: 'Dictation luyện tai & viết' },
    ],
  },
  {
    title: 'Nội dung',
    items: [
      { href: '/vocab/picture', icon: '🖼️', title: 'Từ điển tranh', desc: 'Hình ảnh minh họa từng từ' },
      { href: '/reading',       icon: '📰', title: 'Đọc hiểu',      desc: 'Bài đọc theo cấp độ' },
      { href: '/jlpt',          icon: '🎯', title: 'Lộ trình JLPT', desc: 'N5 → N4 → N3 chi tiết' },
      { href: '/analytics',     icon: '📊', title: 'Tiến độ',        desc: 'Thống kê học tập của bạn' },
    ],
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="home-page">
      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero__text">
          <p className="home-hero__eyebrow">Học tiếng Nhật hiệu quả</p>
          <h1 className="home-title">
            Chinh phục <em>JLPT</em><br />từng bước một
          </h1>
          <p className="home-subtitle">
            Kana, từ vựng, ngữ pháp, kanji — bài học tương tác theo giáo trình
            Minna no Nihongo với audio chuẩn và flashcard thông minh.
          </p>
          <div className="home-cta-row">
            <Link href="/kana" className="btn btn-primary">
              Bắt đầu học
            </Link>
            <Link href="/jlpt" className="btn btn-outline">
              Lộ trình JLPT →
            </Link>
          </div>
        </div>

        <div className="home-hero__kanji" aria-hidden>
          日本語
        </div>
      </section>

      {/* Stats */}
      <div className="home-stats">
        {STATS.map((s) => (
          <div key={s.label} className="home-stat">
            <div className="home-stat__value">
              {s.value}<span style={{ fontSize: '1rem', opacity: 0.6 }}>{s.suffix}</span>
            </div>
            <div className="home-stat__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Feature sections */}
      {SECTIONS.map((section) => (
        <section key={section.title} className="home-section">
          <div className="home-section__header">
            <h2 className="home-section__title">{section.title}</h2>
            <span className="home-section__count">{section.items.length} mục</span>
          </div>
          <div className="feature-grid">
            {section.items.map((item) => (
              <Link key={item.href} href={item.href} className="feature-card">
                <div className="feature-card__icon">{item.icon}</div>
                <div className="feature-card__body">
                  <div className="feature-card__title">{item.title}</div>
                  <div className="feature-card__desc">{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
