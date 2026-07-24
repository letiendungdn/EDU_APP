'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useKanjiLessonsQuery, useKanjiEntriesQuery } from '@/hooks/queries';

// ── Types ──────────────────────────────────────────────────────────────────

type BlockType = 'title' | 'instructions' | 'kanji-grid' | 'writing-lines' | 'vocab-match' | 'blank-fill';

type WorksheetBlock = {
  id: string;
  type: BlockType;
  label: string;
  content?: string;
  rows?: number;
};

type CharData = { strokes: string[] };

// ── Constants ──────────────────────────────────────────────────────────────

const PAGE_W = 794;
const MARGIN = 48;
const INNER_W = PAGE_W - MARGIN * 2;
const CELL = 52;
const COLS = Math.floor(INNER_W / CELL); // ~13

const BLOCK_TEMPLATES: { type: BlockType; label: string; defaultContent?: string; defaultRows?: number }[] = [
  { type: 'title',        label: 'Tiêu đề',              defaultContent: 'Bài tập Kanji' },
  { type: 'instructions', label: 'Hướng dẫn',            defaultContent: 'Hãy điền vào chỗ trống.' },
  { type: 'kanji-grid',   label: 'Ô luyện viết Kanji',   defaultContent: '日月火水', defaultRows: 3 },
  { type: 'writing-lines',label: 'Dòng kẻ viết',         defaultRows: 6 },
  { type: 'vocab-match',  label: 'Nối từ vựng',          defaultContent: '日:Mặt trời\n月:Mặt trăng\n火:Lửa\n水:Nước' },
  { type: 'blank-fill',   label: 'Điền vào chỗ trống',   defaultContent: '___は学生です。\n___が好きです。\n___を食べます。' },
];

let seq = 0;
const uid = () => `b${++seq}`;

// ── Kanji stroke cell ──────────────────────────────────────────────────────
// Shows a single kanji with strokes 1..strokeIdx highlighted; previous strokes grey

type StrokeCellProps = {
  charData: CharData | null;
  strokeIdx: number;   // 0-based: show strokes 0..strokeIdx
  size: number;
};

function StrokeCell({ charData, strokeIdx, size }: StrokeCellProps) {
  return (
    <div style={{
      position: 'relative', width: size, height: size, flexShrink: 0,
      border: '1px solid #ccc', background: '#fff', overflow: 'hidden',
    }}>
      {charData ? (
        <svg viewBox="0 0 1024 900" width={size} height={size} style={{ display: 'block' }}>
          {/* Grid cross-hair guide */}
          <line x1="512" y1="0" x2="512" y2="900" stroke="#e5e5e5" strokeWidth="8" />
          <line x1="0" y1="450" x2="1024" y2="450" stroke="#e5e5e5" strokeWidth="8" />
          <g transform="translate(0,900) scale(1,-1)">
            {charData.strokes.map((path, j) => (
              <path
                key={j}
                d={path}
                fill={
                  j < strokeIdx ? '#bbb'      // past strokes: grey
                  : j === strokeIdx ? '#1a1a1a' // current stroke: dark
                  : 'rgba(0,0,0,0.06)'          // future strokes: ghost
                }
              />
            ))}
          </g>
        </svg>
      ) : (
        <div style={{ width: size, height: size, background: '#f5f5f5' }} />
      )}
      {/* Stroke number badge */}
      <span style={{
        position: 'absolute', top: 2, right: 3, fontSize: 9,
        color: '#ef4444', fontWeight: 800, lineHeight: 1,
        textShadow: '0 0 2px #fff',
      }}>
        {strokeIdx + 1}
      </span>
    </div>
  );
}

// Empty practice cell
function EmptyCell({ size }: { size: number }) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      border: '1px solid #ccc', background: '#fff', position: 'relative',
    }}>
      {/* faint cross-hair */}
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#ececec' }} />
      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: '#ececec' }} />
    </div>
  );
}

// ── KanjiGridBlock ─────────────────────────────────────────────────────────

function KanjiGridBlock({ chars, practiceRows, onLoaded }: { chars: string[]; practiceRows: number; onLoaded?: () => void }) {
  const [dataMap, setDataMap] = useState<Record<string, CharData>>({});
  const pendingRef = useRef(new Set<string>());

  useEffect(() => {
    if (!chars.length) return;
    const todo = chars.filter((c) => !dataMap[c] && !pendingRef.current.has(c));
    if (!todo.length) return;
    todo.forEach((c) => pendingRef.current.add(c));

    import('hanzi-writer').then((m) => {
      const HW = m.default;
      Promise.all(
        todo.map((c) =>
          (HW.loadCharacterData(c) as Promise<CharData>)
            .then((d) => ({ c, d }))
            .catch(() => null),
        ),
      ).then((results) => {
        const patch: Record<string, CharData> = {};
        results.forEach((r) => { if (r) patch[r.c] = r.d; });
        setDataMap((prev) => {
          const next = { ...prev, ...patch };
          // check all chars loaded
          if (chars.every((c) => next[c]) && onLoaded) onLoaded();
          return next;
        });
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chars.join('')]);

  if (!chars.length) return null;

  return (
    <div style={{ marginBottom: 12 }}>
      {chars.map((char) => {
        const data = dataMap[char] ?? null;
        const nStrokes = data?.strokes.length ?? 1;
        // How many stroke-guide cells fit before we run out of columns
        const guideCells = Math.min(nStrokes, COLS - 1); // leave at least 1 practice cell
        const practiceCellsInGuideRow = COLS - guideCells;

        return (
          <div key={char} style={{ marginBottom: 2 }}>
            {/* Stroke-order guide row */}
            <div style={{ display: 'flex' }}>
              {Array.from({ length: guideCells }, (_, i) => (
                <StrokeCell key={i} charData={data} strokeIdx={i} size={CELL} />
              ))}
              {/* Fill rest of row with practice cells */}
              {Array.from({ length: practiceCellsInGuideRow }, (_, i) => (
                <EmptyCell key={`p0-${i}`} size={CELL} />
              ))}
            </div>

            {/* Extra practice rows */}
            {Array.from({ length: practiceRows }, (_, r) => (
              <div key={r} style={{ display: 'flex' }}>
                {Array.from({ length: COLS }, (_, i) => (
                  <EmptyCell key={i} size={CELL} />
                ))}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── Block renderers ────────────────────────────────────────────────────────

function BlockRenderer({ block, onLoaded }: { block: WorksheetBlock; onLoaded?: () => void }) {
  if (block.type === 'title') {
    return (
      <h1 style={{ textAlign: 'center', fontSize: 22, fontWeight: 800, margin: '0 0 16px', fontFamily: 'serif', color: '#111' }}>
        {block.content ?? 'Tiêu đề'}
      </h1>
    );
  }

  if (block.type === 'instructions') {
    return (
      <p style={{ fontSize: 13, color: '#374151', margin: '0 0 14px', fontFamily: 'serif' }}>
        {block.content ?? ''}
      </p>
    );
  }

  if (block.type === 'kanji-grid') {
    const chars = (block.content ?? '').split('').filter((c) => /\S/.test(c));
    return <KanjiGridBlock chars={chars} practiceRows={block.rows ?? 3} onLoaded={onLoaded} />;
  }

  if (block.type === 'writing-lines') {
    return (
      <div style={{ marginBottom: 14 }}>
        {Array.from({ length: block.rows ?? 6 }, (_, i) => (
          <div key={i} style={{ height: CELL, borderBottom: '1px solid #aaa', marginBottom: 2 }} />
        ))}
      </div>
    );
  }

  if (block.type === 'vocab-match') {
    const pairs = (block.content ?? '').split('\n').map((l) => l.split(':'));
    const mid = Math.floor(INNER_W / 2);
    return (
      <div style={{ marginBottom: 14 }}>
        {pairs.map(([jp, vn], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ width: mid - 40, fontFamily: 'serif', fontSize: 18, color: '#111' }}>{jp?.trim()}</span>
            <span style={{ flex: 1, borderBottom: '1px dotted #aaa', marginBottom: 4 }} />
            <span style={{ width: mid - 40, textAlign: 'right', fontSize: 13, color: '#374151' }}>{vn?.trim()}</span>
          </div>
        ))}
      </div>
    );
  }

  if (block.type === 'blank-fill') {
    return (
      <div style={{ marginBottom: 14 }}>
        {(block.content ?? '').split('\n').map((line, i) => (
          <p key={i} style={{ fontSize: 16, fontFamily: 'serif', color: '#111', margin: '0 0 10px', lineHeight: 2 }}>
            {i + 1}. {line}
          </p>
        ))}
      </div>
    );
  }

  return null;
}

// ── Main view ──────────────────────────────────────────────────────────────

// ── KanjiPicker ────────────────────────────────────────────────────────────

function KanjiPicker({ current, onChange }: { current: string; onChange: (chars: string) => void }) {
  const [open, setOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  const { data: lessons, isLoading: loadingLessons } = useKanjiLessonsQuery();
  const { data: entries, isLoading: loadingEntries } = useKanjiEntriesQuery(selectedLesson ?? 0);

  const currentSet = new Set(current.split(''));

  function toggle(char: string) {
    if (currentSet.has(char)) {
      onChange(current.replace(char, ''));
    } else {
      onChange(current + char);
    }
  }

  function addAll() {
    if (!entries) return;
    const toAdd = entries.map((e) => e.character).filter((c) => !currentSet.has(c));
    onChange(current + toAdd.join(''));
  }

  function clearAll() { onChange(''); }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{
        width: '100%', padding: '5px 8px', borderRadius: 5,
        border: '1px dashed #d1d5db', background: 'transparent',
        cursor: 'pointer', fontSize: 11, color: '#6b7280', marginTop: 4,
        textAlign: 'left',
      }}>
        📚 Chọn từ bài Minna...
      </button>
    );
  }

  return (
    <div style={{ marginTop: 4, border: '1px solid #e5e7eb', borderRadius: 7, overflow: 'hidden', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>📚 Chọn từ Minna</span>
        <button onClick={() => setOpen(false)} style={{ ...iconBtn, fontSize: 11 }}>✕</button>
      </div>

      {/* Lesson tabs */}
      <div style={{ overflowX: 'auto', display: 'flex', gap: 3, padding: '6px 8px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        {loadingLessons ? (
          <span style={{ fontSize: 11, color: '#9ca3af' }}>Đang tải...</span>
        ) : (lessons ?? []).map((l) => (
          <button
            key={l.lessonNumber}
            onClick={() => setSelectedLesson(l.lessonNumber)}
            style={{
              flexShrink: 0, padding: '3px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600,
              border: '1px solid',
              borderColor: selectedLesson === l.lessonNumber ? '#6366f1' : '#e5e7eb',
              background: selectedLesson === l.lessonNumber ? '#6366f1' : '#f9fafb',
              color: selectedLesson === l.lessonNumber ? '#fff' : '#374151',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Bài {l.lessonNumber}
            {l._count?.entries ? <span style={{ opacity: 0.7 }}> ({l._count.entries})</span> : null}
          </button>
        ))}
      </div>

      {/* Kanji grid */}
      <div style={{ padding: '6px 8px', minHeight: 60 }}>
        {!selectedLesson ? (
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, textAlign: 'center', padding: '10px 0' }}>
            Chọn bài học ở trên
          </p>
        ) : loadingEntries ? (
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Đang tải kanji...</p>
        ) : !entries?.length ? (
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Bài này chưa có kanji.</p>
        ) : (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
              {entries.map((e) => {
                const selected = currentSet.has(e.character);
                return (
                  <button
                    key={e.id}
                    onClick={() => toggle(e.character)}
                    title={`${e.character} — ${e.meaningVi}${e.onyomi ? ` | on: ${e.onyomi}` : ''}${e.kunyomi ? ` | kun: ${e.kunyomi}` : ''}`}
                    style={{
                      width: 38, height: 38, borderRadius: 6, border: '1.5px solid',
                      borderColor: selected ? '#6366f1' : '#d1d5db',
                      background: selected ? '#eef2ff' : '#fff',
                      cursor: 'pointer', fontFamily: 'serif', fontSize: 20,
                      color: selected ? '#4338ca' : '#111',
                      position: 'relative', transition: 'all 0.1s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {e.character}
                    {selected && (
                      <span style={{
                        position: 'absolute', top: -5, right: -5, width: 13, height: 13,
                        borderRadius: '50%', background: '#6366f1', color: '#fff',
                        fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif',
                      }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Meanings row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 8px', marginBottom: 6 }}>
              {entries.map((e) => (
                <span key={e.id} style={{ fontSize: 10, color: '#6b7280' }}>
                  <span style={{ fontFamily: 'serif', color: '#374151' }}>{e.character}</span>: {e.meaningVi}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={addAll} style={{ ...iconBtn, fontSize: 11, color: '#6366f1', borderColor: '#c7d2fe', flex: 1 }}>
                + Thêm tất cả bài {selectedLesson}
              </button>
              <button onClick={clearAll} style={{ ...iconBtn, fontSize: 11, color: '#ef4444', borderColor: '#fecaca' }}>
                Xoá hết
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main view ──────────────────────────────────────────────────────────────

export default function WorksheetGeneratorView() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [blocks, setBlocks] = useState<WorksheetBlock[]>([
    { id: uid(), type: 'title',      label: 'Tiêu đề',            content: 'Bài tập Kanji N5' },
    { id: uid(), type: 'kanji-grid', label: 'Ô luyện viết Kanji', content: '日月火水', rows: 3 },
    { id: uid(), type: 'writing-lines', label: 'Dòng kẻ viết',    rows: 4 },
  ]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  function addBlock(type: BlockType) {
    const tmpl = BLOCK_TEMPLATES.find((t) => t.type === type)!;
    setBlocks((prev) => [...prev, { id: uid(), type, label: tmpl.label, content: tmpl.defaultContent, rows: tmpl.defaultRows }]);
  }

  function removeBlock(id: string) { setBlocks((p) => p.filter((b) => b.id !== id)); }

  function updateBlock(id: string, patch: Partial<WorksheetBlock>) {
    setBlocks((p) => p.map((b) => b.id === id ? { ...b, ...patch } : b));
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setBlocks((p) => {
      const i = p.findIndex((b) => b.id === id);
      const ni = i + dir;
      if (ni < 0 || ni >= p.length) return p;
      const n = [...p];
      [n[i], n[ni]] = [n[ni], n[i]];
      return n;
    });
  }

  const handleExportPdf = useCallback(async () => {
    const el = previewRef.current;
    if (!el) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [PAGE_W, el.scrollHeight] });
      pdf.addImage(imgData, 'PNG', 0, 0, PAGE_W, el.scrollHeight);
      pdf.save('worksheet.pdf');
    } finally {
      setExporting(false);
    }
  }, []);

  const handleExportPng = useCallback(async () => {
    const el = previewRef.current;
    if (!el) return;
    setExporting(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const a = document.createElement('a');
      a.download = 'worksheet.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    } finally {
      setExporting(false);
    }
  }, []);

  return (
    <div style={{ display: 'flex', gap: 0, minHeight: '100vh', background: '#f3f4f6' }}>

      {/* ── Left panel ── */}
      <div style={{
        width: 270, flexShrink: 0, borderRight: '1px solid #e5e7eb',
        background: '#fff', overflowY: 'auto', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f3f4f6' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', color: '#111' }}>📄 Tạo Worksheet</h2>

          <p style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Thêm khối:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {BLOCK_TEMPLATES.map((t) => (
              <button key={t.type} onClick={() => addBlock(t.type)} style={{
                padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 6,
                background: '#f9fafb', cursor: 'pointer', textAlign: 'left', fontSize: 12, color: '#374151',
              }}>
                + {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '12px 16px', flex: 1, overflowY: 'auto' }}>
          <p style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Các khối ({blocks.length}):
          </p>

          {blocks.map((b, i) => (
            <div
              key={b.id}
              draggable
              onDragStart={() => setDraggingId(b.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (!draggingId || draggingId === b.id) return;
                const from = blocks.findIndex((x) => x.id === draggingId);
                setBlocks((p) => {
                  const n = [...p];
                  const [m] = n.splice(from, 1);
                  n.splice(i, 0, m);
                  return n;
                });
                setDraggingId(null);
              }}
              style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 7, marginBottom: 6, padding: '8px 10px', cursor: 'grab' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, flex: 1, color: '#374151' }}>{b.label}</span>
                <button onClick={() => moveBlock(b.id, -1)} style={iconBtn}>↑</button>
                <button onClick={() => moveBlock(b.id, 1)}  style={iconBtn}>↓</button>
                <button onClick={() => removeBlock(b.id)}   style={{ ...iconBtn, color: '#ef4444' }}>✕</button>
              </div>

              {(b.type === 'title' || b.type === 'instructions' || b.type === 'vocab-match' || b.type === 'blank-fill' || b.type === 'kanji-grid') && (
                <>
                  {b.type === 'kanji-grid' && (
                    <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 3px' }}>Kanji đã chọn ({(b.content ?? '').length} ký tự):</p>
                  )}
                  <textarea
                    value={b.content ?? ''}
                    onChange={(e) => updateBlock(b.id, { content: e.target.value })}
                    rows={b.type === 'vocab-match' || b.type === 'blank-fill' ? 4 : 1}
                    style={{ width: '100%', fontSize: b.type === 'kanji-grid' ? 18 : 12, border: '1px solid #ddd', borderRadius: 5, padding: '4px 6px', resize: 'vertical', boxSizing: 'border-box', fontFamily: b.type === 'kanji-grid' ? 'serif' : 'inherit', letterSpacing: b.type === 'kanji-grid' ? '0.1em' : 'normal' }}
                  />
                  {b.type === 'kanji-grid' && (
                    <KanjiPicker
                      current={b.content ?? ''}
                      onChange={(chars) => updateBlock(b.id, { content: chars })}
                    />
                  )}
                </>
              )}

              {(b.type === 'kanji-grid' || b.type === 'writing-lines') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: '#6b7280' }}>Hàng luyện:</span>
                  <input type="number" min={0} max={8} value={b.rows ?? 3}
                    onChange={(e) => updateBlock(b.id, { rows: Number(e.target.value) })}
                    style={{ width: 48, fontSize: 12, border: '1px solid #ddd', borderRadius: 4, padding: '2px 6px' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={handleExportPdf} disabled={exporting} style={exportBtn('#8b5cf6')}>
            {exporting ? 'Đang xuất...' : '⬇ Xuất PDF'}
          </button>
          <button onClick={handleExportPng} disabled={exporting} style={exportBtn('#0369a1')}>
            {exporting ? 'Đang xuất...' : '⬇ Xuất PNG'}
          </button>
        </div>
      </div>

      {/* ── Right: preview ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>Xem trước (A4) — ô đầu mỗi hàng là hướng dẫn nét viết</p>

        {/* The A4 page */}
        <div
          ref={previewRef}
          style={{
            width: PAGE_W, background: '#fff',
            padding: `${MARGIN}px`,
            boxShadow: '0 2px 24px rgba(0,0,0,0.10)',
            boxSizing: 'border-box',
            fontFamily: 'serif',
          }}
        >
          {blocks.map((b) => (
            <BlockRenderer key={b.id} block={b} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function exportBtn(bg: string): React.CSSProperties {
  return { padding: '8px', borderRadius: 7, border: 'none', background: bg, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, width: '100%' };
}

const iconBtn: React.CSSProperties = {
  padding: '1px 6px', borderRadius: 4, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 11,
};
