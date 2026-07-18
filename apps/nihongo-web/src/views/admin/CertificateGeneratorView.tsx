'use client';
import { useEffect, useRef, useState } from 'react';
import type { Canvas } from 'fabric';

const CERT_W = 1000;
const CERT_H = 700;

type CertTheme = 'classic' | 'modern' | 'minimal';

type CertData = {
  recipientName: string;
  level: string;
  score: string;
  date: string;
  instructor: string;
  orgName: string;
};

const THEMES: { id: CertTheme; label: string; bg: string; border: string; accent: string; title: string }[] = [
  { id: 'classic', label: 'Cổ điển', bg: '#fffdf2', border: '#b45309', accent: '#92400e', title: '#78350f' },
  { id: 'modern', label: 'Hiện đại', bg: '#f0f9ff', border: '#0369a1', accent: '#075985', title: '#0c4a6e' },
  { id: 'minimal', label: 'Tối giản', bg: '#fafafa', border: '#374151', accent: '#111827', title: '#111827' },
];

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export default function CertificateGeneratorView() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  const [theme, setTheme] = useState<CertTheme>('classic');
  const [certData, setCertData] = useState<CertData>({
    recipientName: 'Nguyễn Văn A',
    level: 'N5',
    score: '85',
    date: new Date().toLocaleDateString('vi-VN'),
    instructor: 'Sensei Yamamoto',
    orgName: 'Nihongo EDU',
  });
  const [bulkNames, setBulkNames] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');

  useEffect(() => {
    let canvas: Canvas;
    import('fabric').then(({ Canvas: FC }) => {
      const el = canvasElRef.current;
      if (!el) return;
      canvas = new FC(el, { width: CERT_W, height: CERT_H, backgroundColor: '#fff', selection: false });
      fabricRef.current = canvas;
      drawCertificate(canvas, certData, theme);
    });
    return () => { canvas?.dispose(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const c = fabricRef.current;
    if (c) drawCertificate(c, certData, theme);
  }, [certData, theme]);

  async function drawCertificate(canvas: Canvas, data: CertData, t: CertTheme) {
    const { Rect, Textbox, Line, Circle } = await import('fabric');
    const cfg = THEMES.find((x) => x.id === t) ?? THEMES[0];

    canvas.clear();
    canvas.backgroundColor = cfg.bg;

    // Outer border
    canvas.add(new Rect({ left: 18, top: 18, width: CERT_W - 36, height: CERT_H - 36, fill: 'transparent', stroke: cfg.border, strokeWidth: 3, rx: 12, ry: 12 }));
    // Inner border
    canvas.add(new Rect({ left: 28, top: 28, width: CERT_W - 56, height: CERT_H - 56, fill: 'transparent', stroke: cfg.border, strokeWidth: 1, strokeDashArray: [8, 5], rx: 8, ry: 8 }));

    // Decorative corner circles
    [[36, 36], [CERT_W - 36, 36], [36, CERT_H - 36], [CERT_W - 36, CERT_H - 36]].forEach(([cx, cy]) => {
      canvas.add(new Circle({ left: cx - 10, top: cy - 10, radius: 10, fill: cfg.border }));
    });

    // Header decoration line
    canvas.add(new Line([60, 110, CERT_W - 60, 110], { stroke: cfg.border, strokeWidth: 1.5 }));
    canvas.add(new Line([60, 115, CERT_W - 60, 115], { stroke: cfg.border, strokeWidth: 0.5 }));

    // Org name
    canvas.add(new Textbox(data.orgName, {
      left: 60, top: 48, width: CERT_W - 120, fontSize: 18, fontWeight: 'bold',
      textAlign: 'center', fill: cfg.accent, fontFamily: 'serif', letterSpacing: 6,
    }));

    // Certificate title
    canvas.add(new Textbox('CHỨNG CHỈ HOÀN THÀNH', {
      left: 60, top: 130, width: CERT_W - 120, fontSize: 36, fontWeight: 'bold',
      textAlign: 'center', fill: cfg.title, fontFamily: 'serif',
    }));

    // Japanese subtitle
    canvas.add(new Textbox('修了証書', {
      left: 60, top: 178, width: CERT_W - 120, fontSize: 22,
      textAlign: 'center', fill: cfg.accent, fontFamily: 'serif',
    }));

    // Body divider
    canvas.add(new Line([200, 230, CERT_W - 200, 230], { stroke: cfg.border, strokeWidth: 0.8 }));

    // Presented to
    canvas.add(new Textbox('Trao tặng cho', {
      left: 60, top: 248, width: CERT_W - 120, fontSize: 16, textAlign: 'center', fill: '#6b7280', fontFamily: 'serif',
    }));

    // Recipient name
    canvas.add(new Textbox(data.recipientName, {
      left: 60, top: 276, width: CERT_W - 120, fontSize: 48, fontWeight: 'bold',
      textAlign: 'center', fill: cfg.title, fontFamily: 'serif',
    }));

    // Achievement text
    canvas.add(new Textbox(
      `đã hoàn thành khóa học Tiếng Nhật cấp độ ${data.level} với số điểm ${data.score}/100`,
      { left: 80, top: 350, width: CERT_W - 160, fontSize: 18, textAlign: 'center', fill: '#374151', fontFamily: 'serif' },
    ));

    // Date
    canvas.add(new Textbox(`Ngày: ${data.date}`, {
      left: 60, top: 430, width: 300, fontSize: 14, fill: '#6b7280', fontFamily: 'serif',
    }));

    // Signature lines
    canvas.add(new Line([200, 560, 450, 560], { stroke: cfg.accent, strokeWidth: 1 }));
    canvas.add(new Line([CERT_W - 450, 560, CERT_W - 200, 560], { stroke: cfg.accent, strokeWidth: 1 }));

    canvas.add(new Textbox(data.instructor, {
      left: 200, top: 570, width: 250, fontSize: 13, textAlign: 'center', fill: '#374151', fontFamily: 'serif',
    }));
    canvas.add(new Textbox('Giảng viên', { left: 200, top: 590, width: 250, fontSize: 12, textAlign: 'center', fill: '#9ca3af' }));

    canvas.add(new Textbox(data.orgName, {
      left: CERT_W - 450, top: 570, width: 250, fontSize: 13, textAlign: 'center', fill: '#374151', fontFamily: 'serif',
    }));
    canvas.add(new Textbox('Tổ chức cấp', { left: CERT_W - 450, top: 590, width: 250, fontSize: 12, textAlign: 'center', fill: '#9ca3af' }));

    // Level badge
    canvas.add(new Rect({ left: CERT_W / 2 - 40, top: 620, width: 80, height: 36, rx: 18, ry: 18, fill: cfg.border }));
    canvas.add(new Textbox(data.level, {
      left: CERT_W / 2 - 40, top: 627, width: 80, fontSize: 18, fontWeight: 'bold', textAlign: 'center', fill: '#fff',
    }));

    canvas.renderAll();
  }

  function handleExportPng() {
    const c = fabricRef.current;
    if (!c) return;
    const a = document.createElement('a');
    a.download = `certificate-${certData.recipientName}.png`;
    a.href = c.toDataURL({ format: 'png', multiplier: 2 });
    a.click();
  }

  async function handleExportPdf() {
    const c = fabricRef.current;
    if (!c) return;
    const { jsPDF } = await import('jspdf');
    const dataUrl = c.toDataURL({ format: 'png', multiplier: 2 });
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [CERT_W, CERT_H] });
    pdf.addImage(dataUrl, 'PNG', 0, 0, CERT_W, CERT_H);
    pdf.save(`certificate-${certData.recipientName}.pdf`);
  }

  async function handleBulkExport() {
    const c = fabricRef.current;
    if (!c) return;
    const names = bulkNames.split('\n').map((n) => n.trim()).filter(Boolean);
    if (!names.length) return;

    setBulkStatus(`Đang tạo ${names.length} chứng chỉ...`);
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [CERT_W, CERT_H] });

    for (let i = 0; i < names.length; i++) {
      await drawCertificate(c, { ...certData, recipientName: names[i] }, theme);
      const dataUrl = c.toDataURL({ format: 'png', multiplier: 1.5 });
      if (i > 0) pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 0, 0, CERT_W, CERT_H);
      setBulkStatus(`Đang tạo ${i + 1}/${names.length}...`);
    }

    // Restore original
    await drawCertificate(c, certData, theme);
    pdf.save('certificates-bulk.pdf');
    setBulkStatus(`Xong! Đã xuất ${names.length} chứng chỉ.`);
  }

  return (
    <div style={{ display: 'flex', gap: 20, padding: 24, minHeight: '100vh', background: '#f9fafb' }}>
      {/* Controls */}
      <div style={{ width: 300, flexShrink: 0 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🏆 Tạo Chứng chỉ</h2>

        {/* Theme */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Chủ đề:</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {THEMES.map((t) => (
              <button key={t.id} onClick={() => setTheme(t.id)}
                style={{ padding: '4px 12px', borderRadius: 6, border: '2px solid', borderColor: theme === t.id ? t.border : '#e5e7eb', background: t.bg, cursor: 'pointer', fontSize: 12, fontWeight: theme === t.id ? 700 : 400 }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form fields */}
        {([
          { key: 'recipientName', label: 'Tên học viên' },
          { key: 'orgName', label: 'Tên tổ chức' },
          { key: 'instructor', label: 'Giảng viên' },
          { key: 'score', label: 'Điểm số' },
          { key: 'date', label: 'Ngày cấp' },
        ] as const).map(({ key, label }) => (
          <div key={key} style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 3 }}>{label}</label>
            <input
              value={certData[key]}
              onChange={(e) => setCertData((prev) => ({ ...prev, [key]: e.target.value }))}
              style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
            />
          </div>
        ))}

        {/* Level */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 3 }}>Cấp độ JLPT</label>
          <select
            value={certData.level}
            onChange={(e) => setCertData((prev) => ({ ...prev, level: e.target.value }))}
            style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}
          >
            {JLPT_LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>

        {/* Single export */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          <button onClick={handleExportPng} style={{ ...btn('#0369a1'), flex: 1 }}>⬇ PNG</button>
          <button onClick={handleExportPdf} style={{ ...btn('#8b5cf6'), flex: 1 }}>⬇ PDF</button>
        </div>

        {/* Bulk mode */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, marginBottom: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={bulkMode} onChange={(e) => setBulkMode(e.target.checked)} />
            Tạo hàng loạt
          </label>
          {bulkMode && (
            <>
              <textarea
                value={bulkNames}
                onChange={(e) => setBulkNames(e.target.value)}
                placeholder="Mỗi dòng một tên học viên..."
                rows={5}
                style={{ width: '100%', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 10px', resize: 'vertical', boxSizing: 'border-box' }}
              />
              <button onClick={handleBulkExport} style={{ ...btn('#16a34a'), width: '100%', marginTop: 6 }}>
                📦 Xuất tất cả PDF
              </button>
              {bulkStatus && <p style={{ fontSize: 12, color: '#16a34a', marginTop: 6 }}>{bulkStatus}</p>}
            </>
          )}
        </div>
      </div>

      {/* Preview */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Xem trước</p>
        <div style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.14)', display: 'inline-block', borderRadius: 8, overflow: 'hidden' }}>
          <canvas ref={canvasElRef} />
        </div>
      </div>
    </div>
  );
}

function btn(bg: string): React.CSSProperties {
  return { padding: '7px 14px', borderRadius: 6, border: 'none', background: bg, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 };
}
