'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

// ── Free translation — MyMemory API (no AI, no key, CORS-enabled) ──────────

type Lang = 'vi' | 'en' | 'ja';

function detectLang(text: string): Lang {
  if (/[぀-ヿ一-龯]/.test(text)) return 'ja';
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text)) return 'vi';
  return 'en';
}

async function myMemory(text: string, from: Lang, to: Lang): Promise<string> {
  const url =
    `https://api.mymemory.translated.web/get` +
    `?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Dịch thất bại (HTTP ${res.status})`);
  const data = (await res.json()) as {
    responseStatus: number;
    responseData: { translatedText: string };
    responseDetails: string;
  };
  if (data.responseStatus !== 200) throw new Error(data.responseDetails ?? 'Dịch thất bại');
  return data.responseData.translatedText;
}

// Kana → romaji (covers hiragana + katakana, no npm needed)
function kanaToRomaji(text: string): string {
  const combo: Record<string, string> = {
    'きゃ':'kya','きゅ':'kyu','きょ':'kyo','しゃ':'sha','しゅ':'shu','しょ':'sho',
    'ちゃ':'cha','ちゅ':'chu','ちょ':'cho','にゃ':'nya','にゅ':'nyu','にょ':'nyo',
    'ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo','みゃ':'mya','みゅ':'myu','みょ':'myo',
    'りゃ':'rya','りゅ':'ryu','りょ':'ryo','ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo',
    'じゃ':'ja', 'じゅ':'ju', 'じょ':'jo', 'びゃ':'bya','びゅ':'byu','びょ':'byo',
    'ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo',
    'キャ':'kya','キュ':'kyu','キョ':'kyo','シャ':'sha','シュ':'shu','ショ':'sho',
    'チャ':'cha','チュ':'chu','チョ':'cho','ニャ':'nya','ニュ':'nyu','ニョ':'nyo',
    'ヒャ':'hya','ヒュ':'hyu','ヒョ':'hyo','ミャ':'mya','ミュ':'myu','ミョ':'myo',
    'リャ':'rya','リュ':'ryu','リョ':'ryo','ギャ':'gya','ギュ':'gyu','ギョ':'gyo',
    'ジャ':'ja', 'ジュ':'ju', 'ジョ':'jo', 'ビャ':'bya','ビュ':'byu','ビョ':'byo',
    'ピャ':'pya','ピュ':'pyu','ピョ':'pyo',
  };
  const single: Record<string, string> = {
    'あ':'a','い':'i','う':'u','え':'e','お':'o',
    'か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
    'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so',
    'た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
    'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no',
    'は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
    'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo',
    'や':'ya','ゆ':'yu','よ':'yo',
    'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro',
    'わ':'wa','を':'wo','ん':'n','っ':'tt',
    'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go',
    'ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
    'だ':'da','ぢ':'di','づ':'du','で':'de','ど':'do',
    'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
    'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
    'ア':'a','イ':'i','ウ':'u','エ':'e','オ':'o',
    'カ':'ka','キ':'ki','ク':'ku','ケ':'ke','コ':'ko',
    'サ':'sa','シ':'shi','ス':'su','セ':'se','ソ':'so',
    'タ':'ta','チ':'chi','ツ':'tsu','テ':'te','ト':'to',
    'ナ':'na','ニ':'ni','ヌ':'nu','ネ':'ne','ノ':'no',
    'ハ':'ha','ヒ':'hi','フ':'fu','ヘ':'he','ホ':'ho',
    'マ':'ma','ミ':'mi','ム':'mu','メ':'me','モ':'mo',
    'ヤ':'ya','ユ':'yu','ヨ':'yo',
    'ラ':'ra','リ':'ri','ル':'ru','レ':'re','ロ':'ro',
    'ワ':'wa','ヲ':'wo','ン':'n','ッ':'tt','ー':'-',
    'ガ':'ga','ギ':'gi','グ':'gu','ゲ':'ge','ゴ':'go',
    'ザ':'za','ジ':'ji','ズ':'zu','ゼ':'ze','ゾ':'zo',
    'ダ':'da','ヂ':'di','ヅ':'du','デ':'de','ド':'do',
    'バ':'ba','ビ':'bi','ブ':'bu','ベ':'be','ボ':'bo',
    'パ':'pa','ピ':'pi','プ':'pu','ペ':'pe','ポ':'po',
  };
  let result = '';
  let i = 0;
  while (i < text.length) {
    const two = text.slice(i, i + 2);
    if (combo[two]) { result += combo[two]; i += 2; continue; }
    result += single[text[i]] ?? text[i];
    i++;
  }
  return result;
}

async function fetchTranslation(text: string): Promise<TranslationResult> {
  const detected = detectLang(text);
  const others   = (['vi', 'en', 'ja'] as Lang[]).filter((l) => l !== detected);

  const translated = await Promise.all(others.map((to) => myMemory(text, detected, to)));

  const byLang = { [detected]: text } as Record<Lang, string>;
  others.forEach((lang, i) => { byLang[lang] = translated[i]; });

  const jaText = byLang.ja;
  const romaji = kanaToRomaji(jaText);

  return {
    detected,
    vi: { text: byLang.vi, pronunciation: '' },
    en: { text: byLang.en, pronunciation: '' },
    ja: { text: jaText, kana: jaText, romaji },
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
  const cardRef                 = useRef<HTMLDivElement>(null);

  // Fetch on mount
  useEffect(() => {
    let cancelled = false;
    fetchTranslation(text)
      .then((r) => { if (!cancelled) setResult(r); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [text]);

  // Reposition after render so card stays within viewport
  useEffect(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const vw   = window.innerWidth;

    let x = anchorX;
    let y = anchorY;
    if (x + rect.width + 12 > vw)              x = Math.max(8, vw - rect.width - 12);
    if (y + rect.height + 12 > window.innerHeight + window.scrollY)
                                                y = anchorY - rect.height - 14;
    setPos({ x, y });
  }, [result, error, anchorX, anchorY]);

  const speak = useCallback((word: string, lang: string) => {
    window.speechSynthesis.cancel();
    const utt  = new SpeechSynthesisUtterance(word);
    utt.lang   = SPEECH_LANG[lang] ?? 'en-US';
    utt.rate   = lang === 'ja' ? 0.8 : 0.9;
    setSpeaking(lang);
    utt.onend  = () => setSpeaking(null);
    utt.onerror = () => setSpeaking(null);
    window.speechSynthesis.speak(utt);
  }, []);

  return (
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
                ? `${result.ja.kana}　${result.ja.romaji}`
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
