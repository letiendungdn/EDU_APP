'use client';

export type DrawTool = 'select' | 'pen' | 'line' | 'rect' | 'circle' | 'text' | 'eraser';

type Props = {
  activeTool: DrawTool;
  color: string;
  strokeWidth: number;
  onToolChange: (tool: DrawTool) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (w: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
  onExportPng?: () => void;
  onExportPdf?: () => void;
  extraButtons?: React.ReactNode;
};

const TOOLS: { id: DrawTool; label: string; icon: string }[] = [
  { id: 'select', label: 'Chọn', icon: '↖' },
  { id: 'pen', label: 'Bút vẽ', icon: '✏️' },
  { id: 'line', label: 'Đường thẳng', icon: '╱' },
  { id: 'rect', label: 'Hình chữ nhật', icon: '▭' },
  { id: 'circle', label: 'Hình tròn', icon: '○' },
  { id: 'text', label: 'Chữ', icon: 'T' },
  { id: 'eraser', label: 'Tẩy', icon: '⌫' },
];

const STROKE_WIDTHS = [2, 4, 8, 16];

export default function CanvasToolbar({
  activeTool,
  color,
  strokeWidth,
  onToolChange,
  onColorChange,
  onStrokeWidthChange,
  onUndo,
  onRedo,
  onClear,
  onExportPng,
  onExportPdf,
  extraButtons,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        alignItems: 'center',
        padding: '8px 12px',
        background: 'var(--toolbar-bg, #f5f5f5)',
        borderBottom: '1px solid var(--toolbar-border, #ddd)',
        fontSize: 13,
      }}
    >
      {TOOLS.map((t) => (
        <button
          key={t.id}
          title={t.label}
          onClick={() => onToolChange(t.id)}
          style={{
            padding: '4px 10px',
            border: '1px solid #ccc',
            borderRadius: 6,
            background: activeTool === t.id ? '#ef4444' : '#fff',
            color: activeTool === t.id ? '#fff' : '#222',
            cursor: 'pointer',
            fontWeight: activeTool === t.id ? 700 : 400,
          }}
        >
          {t.icon}
        </button>
      ))}

      <span style={{ marginLeft: 8, color: '#666' }}>Màu:</span>
      <input
        type="color"
        value={color}
        onChange={(e) => onColorChange(e.target.value)}
        style={{ width: 32, height: 28, border: 'none', cursor: 'pointer' }}
      />

      <span style={{ marginLeft: 4, color: '#666' }}>Nét:</span>
      {STROKE_WIDTHS.map((w) => (
        <button
          key={w}
          onClick={() => onStrokeWidthChange(w)}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: strokeWidth === w ? '2px solid #ef4444' : '1px solid #ccc',
            background: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              display: 'block',
              width: w,
              height: w,
              borderRadius: '50%',
              background: '#222',
            }}
          />
        </button>
      ))}

      <div style={{ flex: 1 }} />

      {onUndo && (
        <button onClick={onUndo} title="Hoàn tác" style={btnStyle}>↩</button>
      )}
      {onRedo && (
        <button onClick={onRedo} title="Làm lại" style={btnStyle}>↪</button>
      )}
      {onClear && (
        <button onClick={onClear} title="Xoá hết" style={{ ...btnStyle, color: '#ef4444' }}>🗑</button>
      )}
      {onExportPng && (
        <button onClick={onExportPng} style={{ ...btnStyle, background: '#3b82f6', color: '#fff', border: 'none' }}>
          ⬇ PNG
        </button>
      )}
      {onExportPdf && (
        <button onClick={onExportPdf} style={{ ...btnStyle, background: '#8b5cf6', color: '#fff', border: 'none' }}>
          ⬇ PDF
        </button>
      )}
      {extraButtons}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '4px 10px',
  border: '1px solid #ccc',
  borderRadius: 6,
  background: '#fff',
  cursor: 'pointer',
  fontSize: 13,
};
