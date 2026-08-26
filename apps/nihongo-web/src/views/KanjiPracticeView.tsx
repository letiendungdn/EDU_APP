'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import type { Canvas, PencilBrush } from 'fabric';

const STROKE_WIDTHS = [4, 8, 16, 24];
const COLORS = ['#111111', '#ef4444', '#3b82f6', '#16a34a', '#f97316'];
const PRESET_KANJI = [
  '日', '月', '山', '川', '田', '人', '口', '手', '目', '耳',
  '大', '小', '中', '上', '下', '火', '水', '木', '金', '土',
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
];

export default function KanjiPracticeView() {
  const bgRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const brushRef = useRef<PencilBrush | null>(null);

  const [kanji, setKanji] = useState('日');
  const [inputKanji, setInputKanji] = useState('日');
  const [showGuide, setShowGuide] = useState(true);
  const [guideOpacity, setGuideOpacity] = useState(0.15);
  const [color, setColor] = useState('#111111');
  const [strokeWidth, setStrokeWidth] = useState(8);
  const [strokeCount, setStrokeCount] = useState(0);

  const SIZE = 380;

  // Draw kanji reference on background canvas
  const drawBgKanji = useCallback((char: string, opacity: number, visible: boolean) => {
    const bg = bgRef.current;
    if (!bg) return;
    const ctx = bg.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);
    if (!visible) return;
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#ef4444';
    ctx.font = `bold ${SIZE * 0.85}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, SIZE / 2, SIZE / 2);
    ctx.globalAlpha = 1;
  }, []);

  useEffect(() => {
    drawBgKanji(kanji, guideOpacity, showGuide);
  }, [kanji, guideOpacity, showGuide, drawBgKanji]);

  useEffect(() => {
    let canvas: Canvas;
    import('fabric').then(({ Canvas: FC, PencilBrush: PB }) => {
      const el = document.getElementById('kanji-practice-canvas') as HTMLCanvasElement;
      if (!el) return;
      canvas = new FC(el, {
        width: SIZE,
        height: SIZE,
        isDrawingMode: true,
        backgroundColor: 'transparent',
      });
      const brush = new PB(canvas);
      brush.color = color;
      brush.width = strokeWidth;
      canvas.freeDrawingBrush = brush;
      brushRef.current = brush;
      fabricCanvasRef.current = canvas;
      canvas.on('path:created', () => setStrokeCount((n) => n + 1));
    });
    return () => { canvas?.dispose(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync brush color/width reactively
  useEffect(() => {
    const b = brushRef.current;
    if (!b) return;
    b.color = color;
    b.width = strokeWidth;
  }, [color, strokeWidth]);

  function handleClear() {
    const c = fabricCanvasRef.current;
    if (!c) return;
    c.clear();
    c.backgroundColor = 'transparent';
    c.renderAll();
    setStrokeCount(0);
  }

  function handleExport() {
    const bg = bgRef.current;
    const fc = fabricCanvasRef.current;
    if (!bg || !fc) return;
    const merged = document.createElement('canvas');
    merged.width = SIZE;
    merged.height = SIZE;
    const ctx = merged.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.drawImage(bg, 0, 0);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = `kanji-${kanji}.png`;
      a.href = merged.toDataURL('image/png');
      a.click();
    };
    img.src = fc.toDataURL();
  }

  function handleApplyKanji() {
    if (inputKanji.trim()) {
      setKanji(inputKanji.trim()[0]);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>✏️ Luyện viết Kanji</h1>

      {/* Kanji selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <input
          value={inputKanji}
          onChange={(e) => setInputKanji(e.target.value)}
          placeholder="Nhập kanji..."
          maxLength={1}
          style={{ width: 64, fontSize: 24, textAlign: 'center', border: '1px solid #ccc', borderRadius: 6, padding: '4px 8px' }}
        />
        <button onClick={handleApplyKanji} style={actionBtn('#ef4444')}>Chọn</button>
        <span style={{ color: '#888', fontSize: 13 }}>hoặc chọn nhanh:</span>
        {PRESET_KANJI.map((k) => (
          <button
            key={k}
            onClick={() => { setKanji(k); setInputKanji(k); }}
            style={{
              width: 36, height: 36, fontSize: 18, borderRadius: 6,
              border: kanji === k ? '2px solid #ef4444' : '1px solid #ddd',
              background: kanji === k ? '#fef2f2' : '#fff', cursor: 'pointer',
            }}
          >
            {k}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <input type="checkbox" checked={showGuide} onChange={(e) => setShowGuide(e.target.checked)} />
          Hiện mẫu
        </label>
        {showGuide && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            Độ mờ:
            <input
              type="range" min={0.05} max={0.5} step={0.05}
              value={guideOpacity}
              onChange={(e) => setGuideOpacity(Number(e.target.value))}
              style={{ width: 80 }}
            />
          </label>
        )}
        <span style={{ fontSize: 13, color: '#666' }}>Màu:</span>
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{
              width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer',
              border: color === c ? '3px solid #333' : '2px solid transparent',
            }}
          />
        ))}
        <span style={{ fontSize: 13, color: '#666' }}>Độ dày:</span>
        {STROKE_WIDTHS.map((w) => (
          <button
            key={w}
            onClick={() => setStrokeWidth(w)}
            style={{
              width: 30, height: 30, borderRadius: '50%', background: '#fff', cursor: 'pointer',
              border: strokeWidth === w ? '2px solid #ef4444' : '1px solid #ccc',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ display: 'block', width: w / 2, height: w / 2, borderRadius: '50%', background: '#333' }} />
          </button>
        ))}
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        style={{
          position: 'relative', width: SIZE, height: SIZE,
          border: '2px solid #ddd', borderRadius: 8, overflow: 'hidden',
          background: '#fff', cursor: 'crosshair',
        }}
      >
        {/* Background reference kanji */}
        <canvas
          ref={bgRef}
          width={SIZE}
          height={SIZE}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}
        />
        {/* FabricJS drawing layer */}
        <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
          <canvas id="kanji-practice-canvas" />
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#666' }}>Số nét: <strong>{strokeCount}</strong></span>
        <div style={{ flex: 1 }} />
        <button onClick={handleClear} style={actionBtn('#6b7280')}>🗑 Xoá</button>
        <button onClick={handleExport} style={actionBtn('#3b82f6')}>⬇ Lưu PNG</button>
      </div>

      <p style={{ marginTop: 16, color: '#888', fontSize: 13 }}>
        💡 Mẫu kanji hiển thị mờ để bạn luyện viết theo. Tắt &quot;Hiện mẫu&quot; để tự viết không có hướng dẫn.
      </p>
    </div>
  );
}

function actionBtn(bg: string): React.CSSProperties {
  return {
    padding: '6px 16px', borderRadius: 6, border: 'none',
    background: bg, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13,
  };
}
