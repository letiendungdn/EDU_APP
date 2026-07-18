'use client';
import { useEffect, useRef, useState } from 'react';
import type { Canvas, FabricObject } from 'fabric';

const PAGE_W = 794;  // A4 @ 96dpi
const PAGE_H = 1123;

type BlockType = 'title' | 'instructions' | 'kanji-grid' | 'writing-lines' | 'vocab-match' | 'blank-fill';

type WorksheetBlock = {
  id: string;
  type: BlockType;
  label: string;
  content?: string;
  rows?: number;
};

const BLOCK_TEMPLATES: { type: BlockType; label: string; defaultContent?: string; defaultRows?: number }[] = [
  { type: 'title', label: 'Tiêu đề', defaultContent: 'Bài tập Kanji' },
  { type: 'instructions', label: 'Hướng dẫn', defaultContent: 'Hãy điền vào chỗ trống.' },
  { type: 'kanji-grid', label: 'Ô luyện viết Kanji', defaultContent: '日月火水木金土', defaultRows: 4 },
  { type: 'writing-lines', label: 'Dòng kẻ viết', defaultRows: 8 },
  { type: 'vocab-match', label: 'Nối từ vựng', defaultContent: '日:Mặt trời\n月:Mặt trăng\n火:Lửa\n水:Nước' },
  { type: 'blank-fill', label: 'Điền vào chỗ trống', defaultContent: '___は学生です。\n___が好きです。\n___を食べます。' },
];

let idSeq = 0;
function newId() { return `block-${++idSeq}`; }

export default function WorksheetGeneratorView() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  const [blocks, setBlocks] = useState<WorksheetBlock[]>([
    { id: newId(), type: 'title', label: 'Tiêu đề', content: 'Bài tập Kanji N5' },
    { id: newId(), type: 'kanji-grid', label: 'Ô luyện viết Kanji', content: '日月火水', rows: 3 },
    { id: newId(), type: 'writing-lines', label: 'Dòng kẻ viết', rows: 6 },
  ]);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    let canvas: Canvas;
    import('fabric').then(({ Canvas: FC }) => {
      const el = canvasElRef.current;
      if (!el) return;
      canvas = new FC(el, { width: PAGE_W, height: PAGE_H, backgroundColor: '#fff', selection: true });
      fabricRef.current = canvas;
      renderToCanvas(canvas, blocks);
    });
    return () => { canvas?.dispose(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const c = fabricRef.current;
    if (c) renderToCanvas(c, blocks);
  }, [blocks]);

  async function renderToCanvas(canvas: Canvas, blockList: WorksheetBlock[]) {
    const { Textbox, Rect, Line } = await import('fabric');
    canvas.clear();
    canvas.backgroundColor = '#fff';

    let y = 40;
    const MARGIN = 50;
    const INNER_W = PAGE_W - MARGIN * 2;

    for (const block of blockList) {
      if (block.type === 'title') {
        const t = new Textbox(block.content ?? 'Tiêu đề', {
          left: MARGIN, top: y, width: INNER_W, fontSize: 26, fontWeight: 'bold',
          textAlign: 'center', fill: '#111', selectable: true,
        });
        canvas.add(t);
        y += 50;
      } else if (block.type === 'instructions') {
        const t = new Textbox(block.content ?? '', {
          left: MARGIN, top: y, width: INNER_W, fontSize: 14, fill: '#374151',
        });
        canvas.add(t);
        y += 36;
      } else if (block.type === 'kanji-grid') {
        const chars = (block.content ?? '').split('').filter(Boolean);
        const CELL = 56;
        const cols = Math.floor(INNER_W / CELL);
        const rows = block.rows ?? 3;
        // Header chars
        for (let ci = 0; ci < chars.length && ci < cols; ci++) {
          const cx = MARGIN + ci * CELL;
          const rect = new Rect({ left: cx, top: y, width: CELL, height: CELL, fill: '#fef9c3', stroke: '#d97706', strokeWidth: 1 });
          const txt = new Textbox(chars[ci], { left: cx + 10, top: y + 8, width: CELL - 16, fontSize: 30, fontFamily: 'serif', textAlign: 'center', fill: '#b45309' });
          canvas.add(rect, txt);
        }
        y += CELL;
        // Practice rows
        for (let r = 0; r < rows; r++) {
          for (let ci = 0; ci < cols; ci++) {
            const cx = MARGIN + ci * CELL;
            const rect = new Rect({ left: cx, top: y, width: CELL, height: CELL, fill: 'transparent', stroke: '#d1d5db', strokeWidth: 1 });
            canvas.add(rect);
          }
          y += CELL;
        }
        y += 16;
      } else if (block.type === 'writing-lines') {
        const rows = block.rows ?? 6;
        for (let r = 0; r < rows; r++) {
          const line = new Line([MARGIN, y + 28, MARGIN + INNER_W, y + 28], { stroke: '#9ca3af', strokeWidth: 1 });
          canvas.add(line);
          y += 36;
        }
        y += 8;
      } else if (block.type === 'vocab-match') {
        const pairs = (block.content ?? '').split('\n').map((l) => l.split(':'));
        const COL_W = INNER_W / 2 - 20;
        // Left column (Japanese) + Right column (Vietnamese) with connecting line placeholder
        pairs.forEach(([jp, vn], i) => {
          if (!jp) return;
          const leftT = new Textbox(jp?.trim(), { left: MARGIN, top: y + i * 30, width: COL_W, fontSize: 16, fontFamily: 'serif', fill: '#111' });
          const rightT = new Textbox(vn?.trim() ?? '', { left: MARGIN + COL_W + 40, top: y + i * 30, width: COL_W, fontSize: 16, fill: '#374151' });
          canvas.add(leftT, rightT);
        });
        y += pairs.length * 30 + 16;
      } else if (block.type === 'blank-fill') {
        const lines = (block.content ?? '').split('\n');
        lines.forEach((l, i) => {
          const t = new Textbox(l, { left: MARGIN, top: y + i * 32, width: INNER_W, fontSize: 16, fontFamily: 'serif', fill: '#111' });
          canvas.add(t);
        });
        y += lines.length * 32 + 16;
      }
    }

    canvas.renderAll();
  }

  function addBlock(type: BlockType) {
    const tmpl = BLOCK_TEMPLATES.find((t) => t.type === type)!;
    setBlocks((prev) => [...prev, {
      id: newId(),
      type,
      label: tmpl.label,
      content: tmpl.defaultContent,
      rows: tmpl.defaultRows,
    }]);
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function updateBlock(id: string, patch: Partial<WorksheetBlock>) {
    setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, ...patch } : b));
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      if (i < 0) return prev;
      const ni = i + dir;
      if (ni < 0 || ni >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[ni]] = [next[ni], next[i]];
      return next;
    });
  }

  async function handleExportPdf() {
    const c = fabricRef.current;
    if (!c) return;
    const { jsPDF } = await import('jspdf');
    const dataUrl = c.toDataURL({ format: 'png', multiplier: 1 });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [PAGE_W, PAGE_H] });
    pdf.addImage(dataUrl, 'PNG', 0, 0, PAGE_W, PAGE_H);
    pdf.save('worksheet.pdf');
  }

  function handleExportPng() {
    const c = fabricRef.current;
    if (!c) return;
    const a = document.createElement('a');
    a.download = 'worksheet.png';
    a.href = c.toDataURL({ format: 'png', multiplier: 2 });
    a.click();
  }

  return (
    <div style={{ display: 'flex', gap: 20, padding: 24, minHeight: '100vh', background: '#f9fafb' }}>
      {/* Left panel */}
      <div style={{ width: 280, flexShrink: 0 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>📄 Tạo Worksheet</h2>

        <div style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Thêm khối:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {BLOCK_TEMPLATES.map((t) => (
              <button key={t.type} onClick={() => addBlock(t.type)}
                style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: 13 }}>
                + {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Các khối ({blocks.length}):</p>
          {blocks.map((b, i) => (
            <div
              key={b.id}
              draggable
              onDragStart={() => setDraggingId(b.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (!draggingId || draggingId === b.id) return;
                const fromIdx = blocks.findIndex((x) => x.id === draggingId);
                const toIdx = i;
                if (fromIdx < 0) return;
                setBlocks((prev) => {
                  const next = [...prev];
                  const [moved] = next.splice(fromIdx, 1);
                  next.splice(toIdx, 0, moved);
                  return next;
                });
                setDraggingId(null);
              }}
              style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, marginBottom: 6, padding: '8px 10px', cursor: 'grab',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{b.label}</span>
                <button onClick={() => moveBlock(b.id, -1)} style={iconBtn}>↑</button>
                <button onClick={() => moveBlock(b.id, 1)} style={iconBtn}>↓</button>
                <button onClick={() => removeBlock(b.id)} style={{ ...iconBtn, color: '#ef4444' }}>✕</button>
              </div>
              {(b.type === 'title' || b.type === 'instructions' || b.type === 'vocab-match' || b.type === 'blank-fill' || b.type === 'kanji-grid') && (
                <textarea
                  value={b.content ?? ''}
                  onChange={(e) => updateBlock(b.id, { content: e.target.value })}
                  rows={b.type === 'vocab-match' || b.type === 'blank-fill' ? 3 : 1}
                  style={{ width: '100%', fontSize: 12, border: '1px solid #ddd', borderRadius: 4, padding: 4, resize: 'vertical', boxSizing: 'border-box' }}
                />
              )}
              {(b.type === 'kanji-grid' || b.type === 'writing-lines') && (
                <input
                  type="number" min={1} max={12}
                  value={b.rows ?? 4}
                  onChange={(e) => updateBlock(b.id, { rows: Number(e.target.value) })}
                  style={{ width: 60, fontSize: 12, border: '1px solid #ddd', borderRadius: 4, padding: '2px 6px' }}
                  placeholder="Số hàng"
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={handleExportPdf} style={{ ...btn('#8b5cf6'), width: '100%' }}>⬇ Xuất PDF</button>
          <button onClick={handleExportPng} style={{ ...btn('#0369a1'), width: '100%' }}>⬇ Xuất PNG</button>
        </div>
      </div>

      {/* Canvas preview */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Xem trước (A4)</p>
        <div style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.12)', display: 'inline-block', borderRadius: 4, overflow: 'hidden' }}>
          <canvas ref={canvasElRef} />
        </div>
      </div>
    </div>
  );
}

function btn(bg: string): React.CSSProperties {
  return { padding: '7px 16px', borderRadius: 6, border: 'none', background: bg, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 };
}

const iconBtn: React.CSSProperties = {
  padding: '1px 6px', borderRadius: 4, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontSize: 12,
};
