'use client';
import { useEffect, useRef, useState } from 'react';
import type { Canvas, FabricObject } from 'fabric';

const CARD_W = 600;
const CARD_H = 360;

type CardSide = 'front' | 'back';

type SavedTemplate = {
  name: string;
  frontJson: string;
  backJson: string;
};

export default function FlashcardEditorView() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  const [side, setSide] = useState<CardSide>('front');
  const [frontJson, setFrontJson] = useState<string>('{}');
  const [backJson, setBackJson] = useState<string>('{}');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [templateName, setTemplateName] = useState('Flashcard mới');
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    let canvas: Canvas;
    import('fabric').then(({ Canvas: FC }) => {
      const el = canvasElRef.current;
      if (!el) return;
      canvas = new FC(el, { width: CARD_W, height: CARD_H, backgroundColor: bgColor, selection: true });
      fabricRef.current = canvas;
    });
    return () => { canvas?.dispose(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch side: save current, load other
  async function switchSide(newSide: CardSide) {
    const c = fabricRef.current;
    if (!c) return;
    const json = JSON.stringify(c.toJSON());
    if (side === 'front') setFrontJson(json);
    else setBackJson(json);

    setSide(newSide);
    const target = newSide === 'front' ? frontJson : backJson;
    try {
      await c.loadFromJSON(JSON.parse(target));
    } catch {
      c.clear();
    }
    c.backgroundColor = bgColor;
    c.renderAll();
  }

  async function addText() {
    const c = fabricRef.current;
    if (!c) return;
    const { Textbox } = await import('fabric');
    const t = new Textbox('テキスト', {
      left: 40, top: 40, width: 220, fontSize: 28, fontFamily: 'serif',
      fill: '#111', editable: true,
    });
    c.add(t);
    c.setActiveObject(t);
    c.renderAll();
  }

  async function addKanji() {
    const c = fabricRef.current;
    if (!c) return;
    const { Textbox } = await import('fabric');
    const t = new Textbox('漢字', {
      left: CARD_W / 2 - 60, top: CARD_H / 2 - 60, width: 120, fontSize: 80, fontFamily: 'serif',
      textAlign: 'center', fill: '#ef4444', editable: true,
    });
    c.add(t);
    c.setActiveObject(t);
    c.renderAll();
  }

  async function addMeaning() {
    const c = fabricRef.current;
    if (!c) return;
    const { Textbox } = await import('fabric');
    const t = new Textbox('Nghĩa tiếng Việt', {
      left: 40, top: CARD_H - 80, width: CARD_W - 80, fontSize: 20, fontFamily: 'sans-serif',
      textAlign: 'center', fill: '#1d4ed8', editable: true,
    });
    c.add(t);
    c.setActiveObject(t);
    c.renderAll();
  }

  async function addRect() {
    const c = fabricRef.current;
    if (!c) return;
    const { Rect } = await import('fabric');
    const r = new Rect({
      left: 40, top: 40, width: 120, height: 60, rx: 8, ry: 8,
      fill: '#fef9c3', stroke: '#d97706', strokeWidth: 2,
    });
    c.add(r);
    c.renderAll();
  }

  async function addDivider() {
    const c = fabricRef.current;
    if (!c) return;
    const { Line } = await import('fabric');
    const l = new Line([40, CARD_H / 2, CARD_W - 40, CARD_H / 2], {
      stroke: '#d1d5db', strokeWidth: 2, strokeDashArray: [6, 4],
    });
    c.add(l);
    c.renderAll();
  }

  function deleteSelected() {
    const c = fabricRef.current;
    if (!c) return;
    const objs = c.getActiveObjects() as FabricObject[];
    objs.forEach((o) => c.remove(o));
    c.discardActiveObject();
    c.renderAll();
  }

  function handleBgChange(newBg: string) {
    setBgColor(newBg);
    if (fabricRef.current) {
      fabricRef.current.backgroundColor = newBg;
      fabricRef.current.renderAll();
    }
  }

  function handleSave() {
    const c = fabricRef.current;
    if (!c) return;
    const json = JSON.stringify(c.toJSON());
    const current: SavedTemplate = {
      name: templateName,
      frontJson: side === 'front' ? json : frontJson,
      backJson: side === 'back' ? json : backJson,
    };
    setSavedTemplates((prev) => {
      const idx = prev.findIndex((t) => t.name === templateName);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = current;
        return next;
      }
      return [...prev, current];
    });
    setStatus('Đã lưu template "' + templateName + '"');
    setTimeout(() => setStatus(''), 2500);
  }

  async function handleLoad(tmpl: SavedTemplate) {
    const c = fabricRef.current;
    if (!c) return;
    setTemplateName(tmpl.name);
    setFrontJson(tmpl.frontJson);
    setBackJson(tmpl.backJson);
    setSide('front');
    try { await c.loadFromJSON(JSON.parse(tmpl.frontJson)); } catch { c.clear(); }
    c.backgroundColor = bgColor;
    c.renderAll();
  }

  function handleExportPng() {
    const c = fabricRef.current;
    if (!c) return;
    const a = document.createElement('a');
    a.download = `flashcard-${side}.png`;
    a.href = c.toDataURL({ format: 'png', multiplier: 2 });
    a.click();
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>🃏 Editor Flashcard</h1>

      {/* Template name */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Tên template..."
          style={{ flex: 1, minWidth: 180, padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14 }}
        />
        <button onClick={handleSave} style={btn('#16a34a')}>💾 Lưu</button>
        {status && <span style={{ color: '#16a34a', fontSize: 13 }}>{status}</span>}
      </div>

      {/* Side tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {(['front', 'back'] as const).map((s) => (
          <button
            key={s}
            onClick={() => switchSide(s)}
            style={{
              padding: '6px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
              background: side === s ? '#ef4444' : '#e5e7eb', color: side === s ? '#fff' : '#374151',
            }}
          >
            {s === 'front' ? '📋 Mặt trước' : '📝 Mặt sau'}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
        <button onClick={addKanji} style={btn('#ef4444')}>+ Kanji</button>
        <button onClick={addText} style={btn('#3b82f6')}>+ Văn bản</button>
        <button onClick={addMeaning} style={btn('#8b5cf6')}>+ Nghĩa</button>
        <button onClick={addRect} style={btn('#f59e0b')}>+ Khung</button>
        <button onClick={addDivider} style={btn('#6b7280')}>+ Đường kẻ</button>
        <div style={{ flex: 1 }} />
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          Màu nền: <input type="color" value={bgColor} onChange={(e) => handleBgChange(e.target.value)}
            style={{ width: 28, height: 24, border: 'none', cursor: 'pointer' }} />
        </label>
        <button onClick={deleteSelected} style={btn('#ef4444')}>🗑 Xóa</button>
        <button onClick={handleExportPng} style={btn('#0369a1')}>⬇ PNG</button>
      </div>

      {/* Canvas */}
      <div style={{ border: '2px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', display: 'inline-block' }}>
        <canvas ref={canvasElRef} />
      </div>

      {/* Saved templates */}
      {savedTemplates.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Templates đã lưu</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {savedTemplates.map((t) => (
              <button
                key={t.name}
                onClick={() => handleLoad(t)}
                style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 13 }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <p style={{ marginTop: 12, color: '#9ca3af', fontSize: 12 }}>
        Double-click để chỉnh sửa văn bản. Kéo để di chuyển. Scale góc để thay đổi kích cỡ.
      </p>
    </div>
  );
}

function btn(bg: string): React.CSSProperties {
  return { padding: '5px 14px', borderRadius: 6, border: 'none', background: bg, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 };
}
