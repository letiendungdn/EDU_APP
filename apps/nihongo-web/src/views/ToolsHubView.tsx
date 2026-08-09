'use client';
import Link from 'next/link';

const TOOLS = [
  {
    href: '/kanji-practice',
    icon: '✏️',
    title: 'Luyện viết Kanji',
    titleJa: '漢字練習',
    desc: 'Vẽ kanji trên bảng có mẫu tham chiếu. Điều chỉnh độ mờ, màu sắc, đếm nét và lưu PNG.',
    tags: ['Viết tay', 'Kanji', 'N5–N1'],
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
    preview: (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['日', '月', '山', '川', '火', '水', '木', '人'].map((k) => (
          <span key={k} style={{ fontSize: 22, fontFamily: 'serif', color: '#ef4444', opacity: 0.7 }}>{k}</span>
        ))}
      </div>
    ),
  },
  {
    href: '/whiteboard',
    icon: '🖊',
    title: 'Bảng trắng',
    titleJa: 'ホワイトボード',
    desc: 'Bảng vẽ tự do với đầy đủ công cụ: bút, hình học, văn bản, undo/redo. Xuất PNG hoặc PDF.',
    tags: ['Vẽ tự do', 'Ghi chú', 'Export'],
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
    preview: (
      <svg width="160" height="60" viewBox="0 0 160 60" fill="none">
        <path d="M10 45 Q40 10 70 30 Q100 50 130 15" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6"/>
        <rect x="20" y="20" width="30" height="20" rx="3" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.4"/>
        <circle cx="120" cy="35" r="12" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.4"/>
      </svg>
    ),
  },
  {
    href: '/worksheet',
    icon: '📄',
    title: 'Tạo bài tập',
    titleJa: 'ワークシート',
    desc: 'Kéo-thả các khối: ô luyện viết kanji, dòng kẻ, điền vào chỗ trống. Xuất thành file PDF in ngay.',
    tags: ['In ấn', 'Kanji Grid', 'PDF'],
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.2)',
    preview: (
      <div style={{ fontFamily: 'serif' }}>
        <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
          {['日', '月', '火', '水'].map((k) => (
            <div key={k} style={{
              width: 28, height: 28, border: '1px solid rgba(139,92,246,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#8b5cf6', background: 'rgba(139,92,246,0.06)',
            }}>{k}</div>
          ))}
          <span style={{ fontSize: 11, color: '#9ca3af', alignSelf: 'center', marginLeft: 4 }}>+ 3 hàng trống</span>
        </div>
        <div style={{ height: 1, background: 'rgba(139,92,246,0.3)', marginBottom: 4, width: 140 }} />
        <div style={{ height: 1, background: 'rgba(139,92,246,0.3)', width: 140 }} />
      </div>
    ),
  },
];

export default function ToolsHubView() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 24px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
          Công cụ học tập
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: 'var(--text-primary)', lineHeight: 1.2 }}>
          Canvas Tools
        </h1>
        <p style={{ marginTop: 10, color: 'var(--text-secondary)', fontSize: 15, maxWidth: 480, lineHeight: 1.6 }}>
          Bộ công cụ vẽ và tạo nội dung học tiếng Nhật — luyện viết tay, ghi chú tự do, và in bài tập.
        </p>
      </div>

      {/* Tool cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} style={{ textDecoration: 'none' }}>
            <div
              className="glass-panel"
              style={{
                padding: '22px 20px',
                border: `1px solid ${t.border}`,
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${t.border}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '';
              }}
            >
              {/* Icon + title */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: t.bg, border: `1px solid ${t.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>
                  {t.icon}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{t.title}</div>
                  <div style={{ fontSize: 13, color: t.color, fontFamily: 'serif', marginTop: 1 }}>{t.titleJa}</div>
                </div>
              </div>

              {/* Preview */}
              <div style={{
                minHeight: 64, padding: '12px 14px',
                background: t.bg, borderRadius: 8,
                display: 'flex', alignItems: 'center',
              }}>
                {t.preview}
              </div>

              {/* Description */}
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
                {t.desc}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {t.tags.map((tag) => (
                  <span key={tag} style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 20,
                    background: t.bg, color: t.color,
                    border: `1px solid ${t.border}`, fontWeight: 600,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: 10, borderTop: '1px solid var(--border-color)',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: t.color }}>Mở công cụ</span>
                <span style={{ color: t.color, fontSize: 16 }}>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="glass-panel" style={{
          padding: '18px 22px',
          display: 'flex', alignItems: 'center', gap: 16,
          border: '1px solid rgba(16,185,129,0.2)',
        }}>
          <span style={{ fontSize: 32 }}>🗾</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
              Bản đồ Nhật Bản
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Khám phá 47 tỉnh thành, học từ vựng theo vùng và luyện quiz nhận biết địa danh.
            </div>
          </div>
          <Link href="/japan-map" style={{
            padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: 'rgba(16,185,129,0.12)', color: '#10b981',
            border: '1px solid rgba(16,185,129,0.25)', textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            Khám phá →
          </Link>
        </div>

        <div className="glass-panel" style={{
          padding: '18px 22px',
          display: 'flex', alignItems: 'center', gap: 16,
          border: '1px solid rgba(59,130,246,0.2)',
        }}>
          <span style={{ fontSize: 32 }}>🌐</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
              Tên quốc gia tiếng Nhật
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Học ベトナム・日本・アメリカ… theo châu lục, nghe phát âm và tìm kiếm nhanh.
            </div>
          </div>
          <Link href="/countries" style={{
            padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: 'rgba(59,130,246,0.12)', color: '#3b82f6',
            border: '1px solid rgba(59,130,246,0.25)', textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            Học ngay →
          </Link>
        </div>
      </div>
    </div>
  );
}
