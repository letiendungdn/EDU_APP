'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { apiRequest } from '@/lib/api-client';
import { playAudio, stopAudio } from '@/utils/speech';
import { getStrokeText } from '@/utils/japanese';
import StrokeOrder from './StrokeOrder';
import './TranslationCard.css';

// ── Types ──────────────────────────────────────────────────────────────────

interface TranslationResult {
  detected: 'vi' | 'en' | 'ja';
  vi: { text: string; pronunciation: string };
  en: { text: string; pronunciation: string };
  ja: { text: string; kana: string; romaji: string };
  examples: Array<{ vi: string; en: string; ja: string }>;
}

interface Props {
  text: string;
  anchorX: number;
  anchorY: number;
  onClose: () => void;
}

// ── Config ─────────────────────────────────────────────────────────────────

const LANG_META = {
  vi: { flag: '🇻🇳', color: '#fb7185' },
  en: { flag: '🇬🇧', color: '#60a5fa' },
  ja: { flag: '🇯🇵', color: '#fbbf24' },
} as const;

const SPEECH_LANG: Record<string, string> = {
  vi: 'vi-VN',
  en: 'en-US',
  ja: 'ja-JP',
};

// ── Dịch qua api-gateway (MyMemory phía server, có cache) ─────────────────

type Lang = 'vi' | 'en' | 'ja';

function detectLang(text: string): Lang {
  if (/[぀-ヿ一-龯]/.test(text)) return 'ja';
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text)) return 'vi';
  return 'en';
}

async function translateViaApi(text: string, from: Lang, to: Lang): Promise<string> {
  const data = await apiRequest<{ translation: string }>('/translate', {
    method: 'POST',
    body: JSON.stringify({ text, sourceLang: from, targetLang: to }),
  });
  const translated = data.translation?.trim();
  if (!translated) throw new Error('Dịch thất bại — không có kết quả');
  return translated;
}

async function fetchJaReading(jaText: string): Promise<{ kana: string; romaji: string }> {
  const data = await apiRequest<{ kana: string; romaji: string }>('/kana/romaji', {
    method: 'POST',
    body: JSON.stringify({ text: jaText }),
  });
  return { kana: data.kana, romaji: data.romaji };
}

async function fetchTranslation(text: string): Promise<TranslationResult> {
  const detected = detectLang(text);
  const others   = (['vi', 'en', 'ja'] as Lang[]).filter((l) => l !== detected);

  const translated = await Promise.all(others.map((to) => translateViaApi(text, detected, to)));

  const byLang = { [detected]: text } as Record<Lang, string>;
  others.forEach((lang, i) => { byLang[lang] = translated[i]; });

  const jaText = byLang.ja;
  const { kana, romaji } = await fetchJaReading(jaText);

  return {
    detected,
    vi: { text: byLang.vi, pronunciation: '' },
    en: { text: byLang.en, pronunciation: '' },
    ja: { text: jaText, kana, romaji },
    examples: [],
  };
}

// ── Component ──────────────────────────────────────────────────────────────

export default function TranslationCard({ text, anchorX, anchorY, onClose }: Props) {
  const [result, setResult]     = useState<TranslationResult | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [showEx, setShowEx]     = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [pos, setPos]           = useState({ x: anchorX, y: anchorY });
  const [strokeFocus, setStrokeFocus] = useState<string | null>(null);
  const cardRef                 = useRef<HTMLDivElement>(null);

  // Fetch on mount
  useEffect(() => {
    let cancelled = false;
    fetchTranslation(text)
      .then((r) => { if (!cancelled) setResult(r); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [text]);

  const jaStrokeText = useMemo(
    () => (result ? getStrokeText(result.ja.text) : ''),
    [result],
  );
  const strokeSize = useMemo(() => {
    const n = [...jaStrokeText].length;
    if (n <= 1) return 96;
    if (n === 2) return 80;
    if (n === 3) return 68;
    return 56;
  }, [jaStrokeText]);

  // Reposition after render / resize so card stays within the visible viewport
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const place = () => {
      const rect = el.getBoundingClientRect();
      const margin = 10;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      const width = rect.width;
      const height = rect.height;

      let x = anchorX;
      let y = anchorY;

      // Prefer below the selection; flip above if it would overflow the bottom
      if (y + height + margin > scrollY + vh) {
        y = anchorY - height - 14;
      }

      // Final clamp into the visible viewport
      x = Math.min(Math.max(scrollX + margin, x), Math.max(scrollX + margin, scrollX + vw - width - margin));
      y = Math.min(Math.max(scrollY + margin, y), Math.max(scrollY + margin, scrollY + vh - height - margin));

      setPos((prev) => (prev.x === x && prev.y === y ? prev : { x, y }));
    };

    place();
    // Stroke SVG finishes loading a bit later — re-place when card size changes
    const ro = new ResizeObserver(() => place());
    ro.observe(el);
    window.addEventListener('resize', place);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', place);
    };
  }, [result, error, showEx, jaStrokeText, anchorX, anchorY]);

  const speak = useCallback((word: string, lang: string) => {
    stopAudio();
    setSpeaking(lang);
    playAudio(word, SPEECH_LANG[lang] ?? 'en-US');
    // playAudio là fire-and-forget; reset icon sau ~3s nếu không có callback
    window.setTimeout(() => setSpeaking((cur) => (cur === lang ? null : cur)), 3000);
  }, []);

  const openStrokeModal = useCallback((char: string) => {
    setStrokeFocus(char);
  }, []);

  const closeStrokeModal = useCallback(() => {
    setStrokeFocus(null);
  }, []);

  useEffect(() => {
    if (!strokeFocus) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      setStrokeFocus(null);
    }
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [strokeFocus]);

  const strokeModal =
    strokeFocus && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="tc-stroke-modal-backdrop"
            role="presentation"
            onMouseDown={(e) => {
              e.stopPropagation();
              if (e.target === e.currentTarget) closeStrokeModal();
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="tc-stroke-modal"
              role="dialog"
              aria-modal="true"
              aria-label={`Cách vẽ chữ ${strokeFocus}`}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="tc-stroke-modal-close"
                onClick={closeStrokeModal}
                aria-label="Đóng"
              >
                ×
              </button>
              <p className="tc-stroke-modal-char japanese-text">{strokeFocus}</p>
              <p className="tc-stroke-modal-label">Cách vẽ · nhấn chữ để xem lại</p>
              <div className="tc-stroke-modal-canvas">
                <StrokeOrder text={strokeFocus} width={304} height={304} />
              </div>
              {result?.ja.text && result.ja.text !== strokeFocus && (
                <p className="tc-stroke-modal-word japanese-text">
                  Trong từ: {result.ja.text}
                </p>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
    <div
      ref={cardRef}
      className="tc-card translation-card"
      style={{ left: pos.x, top: pos.y }}
    >
      {/* Header */}
      <div className="tc-header">
        <span className="tc-orig">
          "{text.length > 42 ? `${text.slice(0, 42)}…` : text}"
        </span>
        <button className="tc-close" onClick={onClose} aria-label="Đóng">×</button>
      </div>

      {/* Loading */}
      {!result && !error && (
        <div className="tc-loading">
          <span className="tc-spinner" />
          <span>Đang dịch…</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="tc-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Translation rows */}
      {result && (
        <>
          <div className="tc-langs">
            {(['vi', 'en', 'ja'] as const).map((lang) => {
              const meta     = LANG_META[lang];
              const isSource = result.detected === lang;
              const mainText = lang === 'ja' ? result.ja.text : result[lang].text;
              const sub      = lang === 'ja'
                ? (() => {
                    const { kana, romaji } = result.ja;
                    const parts: string[] = [];
                    if (kana && kana !== result.ja.text) parts.push(kana);
                    if (romaji && !parts.includes(romaji) && romaji !== result.ja.text) {
                      parts.push(romaji);
                    }
                    return parts.join(' · ');
                  })()
                : result[lang].pronunciation;

              return (
                <div key={lang} className={`tc-row${isSource ? ' tc-row--source' : ''}`}>
                  <span className="tc-flag">{meta.flag}</span>

                  <div className="tc-body">
                    <span
                      className={`tc-main${lang === 'ja' ? ' tc-main--jp' : ''}`}
                      style={{ color: meta.color }}
                    >
                      {mainText}
                      {isSource && <span className="tc-badge">nguồn</span>}
                    </span>
                    {sub && <span className="tc-sub">{sub}</span>}
                  </div>

                  <button
                    className={`tc-speak${speaking === lang ? ' tc-speak--active' : ''}`}
                    onClick={() => speak(mainText, lang)}
                    aria-label="Phát âm"
                  >
                    <SpeakIcon muted={speaking === lang} />
                  </button>
                </div>
              );
            })}
          </div>

          {jaStrokeText && (
            <div className="tc-stroke">
              <p className="tc-stroke-label">Cách vẽ · nhấn chữ để phóng to</p>
              <StrokeOrder
                text={result.ja.text}
                width={strokeSize}
                height={strokeSize}
                compact
                onCharClick={(char) => openStrokeModal(char)}
              />
            </div>
          )}

          {/* Examples toggle — chỉ hiện khi có data */}
          {result.examples.length > 0 && (
            <button className="tc-ex-toggle" onClick={() => setShowEx(!showEx)}>
              <span>{showEx ? '▲' : '▼'}</span>
              <span>Ví dụ trong câu</span>
              <span className="tc-ex-count">{result.examples.length}</span>
            </button>
          )}

          {/* Examples panel */}
          {showEx && result.examples.length > 0 && (
            <div className="tc-examples">
              {result.examples.map((ex, i) => (
                <div key={i} className="tc-example">
                  {(['vi', 'en', 'ja'] as const).map((lang) => (
                    <div key={lang} className="tc-ex-line">
                      <span className="tc-ex-flag">{LANG_META[lang].flag}</span>
                      <span className={`tc-ex-text${lang === 'ja' ? ' tc-ex-text--jp' : ''}`}>
                        {ex[lang]}
                      </span>
                      <button
                        className="tc-speak tc-speak--sm"
                        onClick={() => speak(ex[lang], lang)}
                        aria-label="Phát âm"
                      >
                        <SpeakIcon muted={false} />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
    {strokeModal}
    </>
  );
}

// ── Icon ───────────────────────────────────────────────────────────────────

function SpeakIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {muted ? (
        <>
          <line x1="23" y1="9"  x2="17" y2="15" />
          <line x1="17" y1="9"  x2="23" y2="15" />
        </>
      ) : (
        <>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </>
      )}
    </svg>
  );
}
