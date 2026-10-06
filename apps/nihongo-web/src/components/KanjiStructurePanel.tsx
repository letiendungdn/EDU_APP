'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchKanjiSearch } from '../api';
import type { KanjiEntry } from '../types/api';
import {
  KANJI_COMPONENT_INFO,
  KANJI_POSITION_LABEL,
  type KanjiComponentInfo,
} from '../data/kanji-component-info';
import { fetchKanjiSvg, loadComponentIndex } from '../utils/kanji-structure-fetch';
import {
  buildReverseIndex,
  focusGroupIds,
  isKanji,
  kanjiLayout,
  componentLabel,
  componentParts,
  displayElement,
  meaningfulChildren,
  parseKanjiVgTree,
  type KanjiComponentIndex,
  type KanjiNode,
} from '../utils/kanji-structure';
import './KanjiStructurePanel.css';

const BROWSE_LIMIT = 60;

// ── Glyph: dựng lại SVG từ path KanjiVG để tô sáng từng thành phần ────────────

interface GlyphPath {
  d: string;
  groups: string[];
}

interface GlyphNumber {
  x: number;
  y: number;
  text: string;
}

function parseGlyph(svgText: string): { paths: GlyphPath[]; numbers: GlyphNumber[] } {
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const paths: GlyphPath[] = [];
  doc.querySelectorAll('g[id^="kvg:StrokePaths_"] path').forEach((path) => {
    const d = path.getAttribute('d');
    if (!d) return;
    const groups: string[] = [];
    for (let el = path.parentElement; el && el.tagName === 'g'; el = el.parentElement) {
      const id = el.getAttribute('id') ?? '';
      if (id.startsWith('kvg:StrokePaths_')) break;
      groups.push(id.replace(/^kvg:[0-9a-f]+-?/, ''));
    }
    paths.push({ d, groups });
  });
  const numbers: GlyphNumber[] = [];
  doc.querySelectorAll('g[id^="kvg:StrokeNumbers_"] text').forEach((t) => {
    const m = (t.getAttribute('transform') ?? '').match(/matrix\(1 0 0 1 ([\d.]+) ([\d.]+)\)/);
    if (m) numbers.push({ x: Number(m[1]), y: Number(m[2]), text: t.textContent ?? '' });
  });
  return { paths, numbers };
}

function KanjiGlyph({
  svgText,
  focus,
  showNumbers,
}: {
  svgText: string;
  focus: string[] | null;
  showNumbers: boolean;
}) {
  const { paths, numbers } = useMemo(() => parseGlyph(svgText), [svgText]);
  const focusSet = focus && !focus.includes('') ? new Set(focus) : null;
  return (
    <svg
      className={`ks-glyph${focusSet ? ' ks-glyph--focus' : ''}`}
      viewBox="0 0 109 109"
      role="img"
      aria-hidden="true"
    >
      <g className="ks-glyph-guide">
        <line x1="54.5" y1="2" x2="54.5" y2="107" />
        <line x1="2" y1="54.5" x2="107" y2="54.5" />
      </g>
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          className={focusSet && p.groups.some((g) => focusSet.has(g)) ? 'is-focus' : undefined}
        />
      ))}
      {showNumbers &&
        numbers.map((n, i) => (
          <text key={i} x={n.x} y={n.y} className="ks-glyph-number">
            {n.text}
          </text>
        ))}
    </svg>
  );
}

// ── Thông tin thành phần ────────────────────────────────────────────────────

type EntryMap = Record<string, KanjiEntry | null>;

function componentKey(node: KanjiNode): string {
  return node.e ?? node.o ?? '';
}

/** Chữ hiện trên nút. Mã CHISE (CDP-…) thay bằng các thành phần con, ví dụ 白 trên 小. */
function NodeChar({ node }: { node: KanjiNode }) {
  const parts = componentParts(node);
  if (parts.length > 1) {
    return (
      <span className="ks-node-char ks-node-char--parts japanese-text" title={componentLabel(node)}>
        {parts.map((part, i) => (
          <span key={`${part}-${i}`}>{part}</span>
        ))}
      </span>
    );
  }
  return <span className="ks-node-char japanese-text">{parts[0] ?? componentLabel(node)}</span>;
}

function describe(char: string, entries: EntryMap): { title: string; meaning: string } | null {
  const info: KanjiComponentInfo | undefined = KANJI_COMPONENT_INFO[char];
  if (info) {
    const base = info.base ? ` · dạng biến thể của ${info.base}` : '';
    return { title: `Bộ ${info.hv}${info.jp ? ` (${info.jp})` : ''}`, meaning: `${info.vi}${base}` };
  }
  const entry = entries[char];
  if (entry) {
    return {
      title: entry.hanViet ? entry.hanViet.toUpperCase() : char,
      meaning: entry.meaningVi,
    };
  }
  return null;
}

function findRadical(root: KanjiNode): KanjiNode | null {
  let best: KanjiNode | null = null;
  const rank = (r?: string) => (r === 'general' ? 3 : r === 'tradit' ? 2 : r ? 1 : 0);
  const walk = (n: KanjiNode) => {
    if (n.e && rank(n.r) > rank(best?.r)) best = n;
    n.c?.forEach(walk);
  };
  root.c?.forEach(walk);
  return best;
}

function findPhonetic(root: KanjiNode): KanjiNode | null {
  let found: KanjiNode | null = null;
  const walk = (n: KanjiNode) => {
    if (!found && n.ph && n.e) found = n;
    n.c?.forEach(walk);
  };
  root.c?.forEach(walk);
  return found;
}

function ComponentTree({
  nodes,
  entries,
  focusId,
  onFocus,
  onBrowse,
  browsing,
}: {
  nodes: KanjiNode[];
  entries: EntryMap;
  focusId: string | null;
  onFocus: (node: KanjiNode | null) => void;
  onBrowse: (char: string) => void;
  browsing: string | null;
}) {
  return (
    <ul className="ks-tree">
      {nodes.map((node) => {
        const key = componentKey(node);
        const info = describe(key, entries) ?? (node.o ? describe(node.o, entries) : null);
        const pos = node.p ? KANJI_POSITION_LABEL[node.p] : undefined;
        const children = meaningfulChildren(node);
        return (
          <li key={node.id}>
            <div
              className={`ks-node${focusId === node.id ? ' is-active' : ''}`}
              onMouseEnter={() => onFocus(node)}
              onMouseLeave={() => onFocus(null)}
              onFocus={() => onFocus(node)}
              onBlur={() => onFocus(null)}
              tabIndex={0}
            >
              <NodeChar node={node} />
              <div className="ks-node-body">
                <div className="ks-node-badges">
                  {pos && (
                    <span className="ks-badge">
                      {pos.vi}
                      {pos.jp ? <span className="japanese-text"> · {pos.jp}</span> : null}
                    </span>
                  )}
                  {node.r && <span className="ks-badge ks-badge--radical">Bộ thủ</span>}
                  {node.ph && <span className="ks-badge ks-badge--phon">Gợi âm đọc</span>}
                  {node.pt && <span className="ks-badge">Bị tách – phần {node.pt}</span>}
                  {node.o && node.o !== key && (
                    <span className="ks-badge">
                      dạng gốc <span className="japanese-text">{node.o}</span>
                    </span>
                  )}
                  <span className="ks-node-strokes">{node.n} nét</span>
                </div>
                {info ? (
                  <p className="ks-node-info">
                    <strong>{info.title}</strong> — {info.meaning}
                  </p>
                ) : (
                  <p className="ks-node-info ks-node-info--muted">Chưa có ghi chú cho thành phần này.</p>
                )}
                <button
                  type="button"
                  className={`ks-link-btn${browsing === key ? ' is-active' : ''}`}
                  onClick={() => onBrowse(key)}
                >
                  Chữ khác có <span className="japanese-text">{componentLabel(node) || key}</span> →
                </button>
              </div>
            </div>
            {children.length > 0 && (
              <ComponentTree
                nodes={children}
                entries={entries}
                focusId={focusId}
                onFocus={onFocus}
                onBrowse={onBrowse}
                browsing={browsing}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ── Bộ nhớ đệm dùng chung (trang /kanji/structure và cửa sổ phân tích) ─────

const entryCache = new Map<string, Promise<KanjiEntry | null>>();

/** Tra KanjiEntry đúng chữ (API tìm theo chuỗi con nên lọc lại). null = không có trong DB. */
function lookupEntry(char: string): Promise<KanjiEntry | null> {
  let p = entryCache.get(char);
  if (!p) {
    p = fetchKanjiSearch(char)
      .then((list) => list.find((e) => e.character === char) ?? null)
      .catch(() => {
        entryCache.delete(char);
        return null;
      });
    entryCache.set(char, p);
  }
  return p;
}

let reverseIndexCache: { index: KanjiComponentIndex; reverse: Map<string, string[]> } | null = null;

function reverseIndexOf(index: KanjiComponentIndex): Map<string, string[]> {
  if (reverseIndexCache?.index !== index) {
    reverseIndexCache = { index, reverse: buildReverseIndex(index) };
  }
  return reverseIndexCache.reverse;
}

// ── Panel ───────────────────────────────────────────────────────────────────

export interface KanjiStructurePanelProps {
  /** Chữ kanji cần phân tích */
  char: string;
  /** Bấm một chữ trong danh sách "chữ cùng thành phần" */
  onPickChar: (char: string) => void;
}

export default function KanjiStructurePanel({ char, onPickChar }: KanjiStructurePanelProps) {
  const [index, setIndex] = useState<KanjiComponentIndex | null>(null);
  const [svgText, setSvgText] = useState<string | null>(null);
  const [tree, setTree] = useState<KanjiNode | null>(null);
  const [loadedChar, setLoadedChar] = useState<string | null>(null);
  const [entries, setEntries] = useState<EntryMap>({});
  const [focus, setFocus] = useState<KanjiNode | null>(null);
  const [browse, setBrowse] = useState<string | null>(null);
  const [showNumbers, setShowNumbers] = useState(false);

  useEffect(() => {
    loadComponentIndex()
      .then(setIndex)
      .catch(() => setIndex({}));
  }, []);

  // SVG + cây cấu tạo của chữ đang chọn
  useEffect(() => {
    if (!index) return undefined;
    let cancelled = false;
    setFocus(null);
    setBrowse(null);
    void fetchKanjiSvg(char).then((svg) => {
      if (cancelled) return;
      setSvgText(svg);
      setTree(index[char] ?? (svg ? parseKanjiVgTree(svg) : null));
      setLoadedChar(char);
    });
    return () => {
      cancelled = true;
    };
  }, [char, index]);

  // Hán Việt / nghĩa trong DB cho chữ chính và các thành phần là kanji
  useEffect(() => {
    const wanted = new Set<string>([char]);
    const walk = (n: KanjiNode) => {
      for (const k of [n.e, n.o]) if (k && isKanji(k) && !KANJI_COMPONENT_INFO[k]) wanted.add(k);
      n.c?.forEach(walk);
    };
    if (tree && loadedChar === char) tree.c?.forEach(walk);
    let cancelled = false;
    for (const c of wanted) {
      void lookupEntry(c).then((entry) => {
        if (!cancelled) setEntries((prev) => (prev[c] === entry ? prev : { ...prev, [c]: entry }));
      });
    }
    return () => {
      cancelled = true;
    };
  }, [char, tree, loadedChar]);

  const browseList = useMemo(() => {
    if (!browse || !index) return [];
    return [...(reverseIndexOf(index).get(browse) ?? [])].sort(
      (a, b) => (index[a]?.n ?? 0) - (index[b]?.n ?? 0) || a.localeCompare(b),
    );
  }, [browse, index]);

  if (loadedChar !== char) {
    return <p className="ks-empty">Đang tải dữ liệu cấu tạo…</p>;
  }
  if (!tree) {
    return (
      <p className="ks-empty">
        Chưa có dữ liệu cấu tạo cho chữ <span className="japanese-text">{char}</span>.
      </p>
    );
  }

  const top = meaningfulChildren(tree);
  const layout = kanjiLayout(tree);
  const radical = findRadical(tree);
  const phonetic = findPhonetic(tree);
  const mainEntry = entries[char];
  const focusIds = focus ? focusGroupIds(tree, focus) : null;
  const radicalInfo = radical ? describe(componentKey(radical), entries) : null;

  return (
    <div className="ks-result">
      <section className="ks-summary">
        <div className="ks-glyph-card glass-panel">
          {svgText ? (
            <KanjiGlyph svgText={svgText} focus={focusIds} showNumbers={showNumbers} />
          ) : (
            <span className="ks-glyph-fallback japanese-text">{char}</span>
          )}
          <label className="ks-toggle">
            <input type="checkbox" checked={showNumbers} onChange={(e) => setShowNumbers(e.target.checked)} />
            Hiện thứ tự nét
          </label>
        </div>

        <div className="ks-facts glass-panel">
          <p className="ks-formula japanese-text">
            {char}
            {top.length > 0 && (
              <>
                {' = '}
                {top.map((n, i) => (
                  <span key={n.id}>
                    {i > 0 && ' + '}
                    <button
                      type="button"
                      className={`ks-formula-part${focus?.id === n.id ? ' is-active' : ''}`}
                      onMouseEnter={() => setFocus(n)}
                      onMouseLeave={() => setFocus(null)}
                      onClick={() => setBrowse(componentKey(n))}
                    >
                      {componentLabel(n)}
                    </button>
                  </span>
                ))}
              </>
            )}
          </p>
          <dl className="ks-dl">
            {mainEntry?.hanViet && (
              <div>
                <dt>Hán Việt</dt>
                <dd>{mainEntry.hanViet.toUpperCase()}</dd>
              </div>
            )}
            {mainEntry?.meaningVi && (
              <div>
                <dt>Nghĩa</dt>
                <dd>{mainEntry.meaningVi}</dd>
              </div>
            )}
            {mainEntry?.onyomi && (
              <div>
                <dt>Âm On</dt>
                <dd className="japanese-text">{mainEntry.onyomi}</dd>
              </div>
            )}
            {mainEntry?.kunyomi && (
              <div>
                <dt>Âm Kun</dt>
                <dd className="japanese-text">{mainEntry.kunyomi}</dd>
              </div>
            )}
            <div>
              <dt>Số nét</dt>
              <dd>{tree.n}</dd>
            </div>
            {layout && (
              <div>
                <dt>Bố cục</dt>
                <dd>
                  <span className="ks-layout-symbol">{layout.symbol}</span> {layout.label}
                </dd>
              </div>
            )}
            {radical && (
              <div>
                <dt>Bộ thủ</dt>
                <dd>
                  <span className="japanese-text">{componentLabel(radical)}</span>
                  {radicalInfo && ` — ${radicalInfo.title.replace(/^Bộ /, '')}`}
                </dd>
              </div>
            )}
          </dl>
          {phonetic && radical && componentKey(phonetic) !== componentKey(radical) && (
            <p className="ks-note">
              <strong>Chữ hình thanh:</strong> phần <span className="japanese-text">{componentLabel(radical)}</span>{' '}
              gợi ý nghĩa, phần <span className="japanese-text">{componentLabel(phonetic)}</span> gợi âm đọc (On).
              Các chữ cùng phần gợi âm thường đọc giống hoặc gần giống nhau.
            </p>
          )}
          {mainEntry?.mnemonicVi && (
            <p className="ks-note">
              <strong>Mẹo nhớ:</strong> {mainEntry.mnemonicVi}
            </p>
          )}
          {mainEntry === null && (
            <p className="ks-note ks-note--muted">Chữ này chưa có trong bảng kanji của ứng dụng.</p>
          )}
        </div>
      </section>

      <section className="ks-section glass-panel">
        <h3 className="ks-section-title">Các thành phần</h3>
        {top.length > 0 ? (
          <ComponentTree
            nodes={top}
            entries={entries}
            focusId={focus?.id ?? null}
            onFocus={setFocus}
            onBrowse={setBrowse}
            browsing={browse}
          />
        ) : (
          <p className="ks-empty">
            <span className="japanese-text">{char}</span> là chữ đơn (tượng hình / chỉ sự), không tách thành
            bộ phận nhỏ hơn.
          </p>
        )}
      </section>

      {browse && (
        <section className="ks-section glass-panel">
          <div className="ks-section-head">
            <h3 className="ks-section-title">
              Chữ có thành phần <span className="japanese-text">{displayElement(browse)}</span>
              <span className="ks-count"> · {browseList.length} chữ</span>
            </h3>
            <button type="button" className="ks-link-btn" onClick={() => setBrowse(null)}>
              Đóng
            </button>
          </div>
          {browseList.length > 0 ? (
            <div className="ks-browse">
              {browseList.slice(0, BROWSE_LIMIT).map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`ks-browse-char japanese-text${c === char ? ' is-active' : ''}`}
                  onClick={() => onPickChar(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          ) : (
            <p className="ks-empty">Không có chữ nào khác trong dữ liệu có thành phần này.</p>
          )}
          {browseList.length > BROWSE_LIMIT && (
            <p className="ks-count">Hiển thị {BROWSE_LIMIT} chữ ít nét nhất.</p>
          )}
        </section>
      )}
    </div>
  );
}
