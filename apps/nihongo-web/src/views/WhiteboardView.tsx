'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import type { Canvas, PencilBrush, FabricObject } from 'fabric';
import CanvasToolbar, { DrawTool } from '@/components/canvas/canvas-toolbar';

const WB_WIDTH = 1100;
const WB_HEIGHT = 660;

export default function WhiteboardView() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const brushRef = useRef<PencilBrush | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);

  const [tool, setTool] = useState<DrawTool>('pen');
  const [color, setColor] = useState('#1e1e1e');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isReady, setIsReady] = useState(false);

  // Utility: snapshot state for undo/redo
  const snapshot = useCallback(() => {
    const c = fabricRef.current;
    if (!c) return;
    const json = JSON.stringify(c.toJSON());
    const index = historyIndexRef.current;
    historyRef.current = historyRef.current.slice(0, index + 1);
    historyRef.current.push(json);
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  useEffect(() => {
    let canvas: Canvas;
    import('fabric').then(({ Canvas: FC, PencilBrush: PB }) => {
      const el = canvasElRef.current;
      if (!el) return;
      canvas = new FC(el, {
        width: WB_WIDTH,
        height: WB_HEIGHT,
        backgroundColor: bgColor,
        isDrawingMode: true,
      });
      const brush = new PB(canvas);
      brush.color = color;
      brush.width = strokeWidth;
      canvas.freeDrawingBrush = brush;
      brushRef.current = brush;
      fabricRef.current = canvas;

      canvas.on('path:created', snapshot);
      canvas.on('object:modified', snapshot);
      canvas.on('object:removed', snapshot);

      // Initial snapshot
      historyRef.current = [JSON.stringify(canvas.toJSON())];
      historyIndexRef.current = 0;
      setIsReady(true);
    });
    return () => { canvas?.dispose(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update brush when color/width changes
  useEffect(() => {
    const b = brushRef.current;
    if (!b) return;
    b.color = color;
    b.width = strokeWidth;
  }, [color, strokeWidth]);

  // Switch drawing tool
  useEffect(() => {
    const c = fabricRef.current;
    if (!c || !isReady) return;
    import('fabric').then(({ PencilBrush: PB }) => {
      if (tool === 'pen') {
        c.isDrawingMode = true;
        const b = new PB(c);
        b.color = color;
        b.width = strokeWidth;
        c.freeDrawingBrush = b;
        brushRef.current = b;
      } else if (tool === 'eraser') {
        c.isDrawingMode = true;
        // Eraser via background-colored pen (EraserBrush not in fabric v6 stable)
        const b = new PB(c);
        b.color = bgColor;
        b.width = strokeWidth * 3;
        c.freeDrawingBrush = b;
        brushRef.current = b;
      } else {
        c.isDrawingMode = false;
        c.selection = tool === 'select';
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, isReady]);

  async function addShape(type: DrawTool) {
    const c = fabricRef.current;
    if (!c) return;
    const { Rect, Circle, Line, Textbox } = await import('fabric');
    const cx = WB_WIDTH / 2;
    const cy = WB_HEIGHT / 2;
    let obj: FabricObject | undefined;
    if (type === 'rect') {
      obj = new Rect({ left: cx - 60, top: cy - 40, width: 120, height: 80, fill: 'transparent', stroke: color, strokeWidth });
    } else if (type === 'circle') {
      obj = new Circle({ left: cx - 50, top: cy - 50, radius: 50, fill: 'transparent', stroke: color, strokeWidth });
    } else if (type === 'line') {
      obj = new Line([cx - 60, cy, cx + 60, cy], { stroke: color, strokeWidth });
    } else if (type === 'text') {
      obj = new Textbox('Nhập văn bản...', { left: cx - 80, top: cy - 15, width: 200, fontSize: 18, fill: color });
    }
    if (obj) {
      c.add(obj);
      c.setActiveObject(obj);
      c.renderAll();
      snapshot();
    }
  }

  function handleToolChange(t: DrawTool) {
    setTool(t);
    if (t === 'rect' || t === 'circle' || t === 'line' || t === 'text') {
      addShape(t);
    }
  }

  function handleUndo() {
    const c = fabricRef.current;
    if (!c || historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const state = historyRef.current[historyIndexRef.current];
    c.loadFromJSON(JSON.parse(state)).then(() => c.renderAll());
  }

  function handleRedo() {
    const c = fabricRef.current;
    if (!c || historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const state = historyRef.current[historyIndexRef.current];
    c.loadFromJSON(JSON.parse(state)).then(() => c.renderAll());
  }

  function handleClear() {
    const c = fabricRef.current;
    if (!c) return;
    c.clear();
    c.backgroundColor = bgColor;
    c.renderAll();
    snapshot();
  }

  function handleExportPng() {
    const c = fabricRef.current;
    if (!c) return;
    const a = document.createElement('a');
    a.download = 'whiteboard.png';
    a.href = c.toDataURL({ format: 'png', multiplier: 1 });
    a.click();
  }

  async function handleExportPdf() {
    const c = fabricRef.current;
    if (!c) return;
    const { jsPDF } = await import('jspdf');
    const dataUrl = c.toDataURL({ format: 'png', multiplier: 1 });
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [WB_WIDTH, WB_HEIGHT] });
    pdf.addImage(dataUrl, 'PNG', 0, 0, WB_WIDTH, WB_HEIGHT);
    pdf.save('whiteboard.pdf');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f3f4f6' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #ddd', background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>🖊 Bảng trắng</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          Màu nền:
          <input type="color" value={bgColor} onChange={(e) => {
            setBgColor(e.target.value);
            if (fabricRef.current) {
              fabricRef.current.backgroundColor = e.target.value;
              fabricRef.current.renderAll();
            }
          }} style={{ width: 28, height: 24, border: 'none', cursor: 'pointer' }} />
        </label>
        <span style={{ fontSize: 12, color: '#888' }}>💡 Vẽ tự do, thêm hình, văn bản. Ctrl+Z = undo.</span>
      </div>

      <CanvasToolbar
        activeTool={tool}
        color={color}
        strokeWidth={strokeWidth}
        onToolChange={handleToolChange}
        onColorChange={setColor}
        onStrokeWidthChange={setStrokeWidth}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onExportPng={handleExportPng}
        onExportPdf={handleExportPdf}
      />

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: 16 }}>
        <div style={{ border: '1px solid #ccc', borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', display: 'inline-block' }}>
          <canvas ref={canvasElRef} />
        </div>
      </div>
    </div>
  );
}
