'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  fetchKanaRomajiLookup,
  fetchRomajiConversion,
  type KanaRomajiLookup,
  type RomajiConversion,
} from '../api';
import StrokeOrder from '../components/StrokeOrder';
import {
  flashcardPhraseStrokeScale,
  getStrokeText,
  hasOptionalBracketParts,
  isRomajiInput,
  parseOptionalBracketSegments,
} from '../utils/japanese';
import { playAudio } from '../utils/speech';
import './StrokeLookupView.css';

const EXAMPLES = ['私', '医者', 'watashi', 'arigatou', 'よろしく', '［どうぞ］よろしく', '日本語'] as const;

type RomajiForm = 'kana' | 'kanji';

function lookupStrokeSize(charCount: number, totalChars: number, optional = false): number {
  const denseBase =
    charCount <= 1 ? 120 : charCount <= 2 ? 96 : charCount <= 4 ? 78 : charCount <= 8 ? 64 : 52;
  const scaled = Math.round(denseBase * flashcardPhraseStrokeScale(totalChars));
  return optional ? Math.max(32, Math.round(scaled * 0.55)) : Math.max(36, scaled);
}

function LookupStrokeSegments({
  text,
  onCharClick,
}: {
  text: string;
  onCharClick?: (char: string) => void;
}) {
  const segments = parseOptionalBracketSegments(text);
  const totalChars = segments.reduce(
    (sum, segment) => sum + [...getStrokeText(segment.text)].length,
    0,
  );

  return (
    <div className="stroke-lookup-segments">
      {segments.map((segment, index) => {
        const strokeText = getStrokeText(segment.text);
        if (!strokeText) {
          if (!segment.text.trim()) return null;
          return (
            <span key={index} className="stroke-lookup-punct">
              {segment.text}
            </span>
          );
        }

        const size = lookupStrokeSize(
          [...strokeText].length,
          totalChars,
          segment.optional,
        );

        if (segment.optional) {
          return (
            <span key={index} className="stroke-lookup-optional">
              <span className="stroke-lookup-bracket">{segment.openBracket ?? '['}</span>
              <StrokeOrder
                text={segment.text}
                width={size}
                height={size}
                compact
                onCharClick={onCharClick}
              />
              <span className="stroke-lookup-bracket">{segment.closeBracket ?? ']'}</span>
            </span>
          );
        }

        return (
          <span key={index} className="stroke-lookup-core">
            <StrokeOrder
              text={segment.text}
              width={size}
              height={size}
              compact
              onCharClick={onCharClick}
            />
          </span>
        );
      })}
    </div>
  );
}

export default function StrokeLookupView() {
  const [input, setInput] = useState('私');
  const [reading, setReading] = useState<KanaRomajiLookup | null>(null);
  const [readingLoading, setReadingLoading] = useState(false);
  const [romajiConversion, setRomajiConversion] = useState<RomajiConversion | null>(null);
  const [romajiForm, setRomajiForm] = useState<RomajiForm>('kanji');
  const [romajiLoading, setRomajiLoading] = useState(false);

  const isRomaji = useMemo(() => isRomajiInput(input), [input]);

  const effectiveText = useMemo(() => {
    if (!isRomaji) return input;
    if (!romajiConversion?.kana) return '';
    if (romajiForm === 'kanji' && romajiConversion.kanji) return romajiConversion.kanji;
    return romajiConversion.kana;
  }, [input, isRomaji, romajiConversion, romajiForm]);

  const strokeText = useMemo(() => getStrokeText(effectiveText), [effectiveText]);
  const hasOptional = hasOptionalBracketParts(effectiveText);
  const totalChars = strokeText.length;
  const singleSize = lookupStrokeSize(totalChars || 1, totalChars || 1);
  const showRomajiToggle =
    isRomaji && (romajiConversion?.options.length ?? 0) > 1;

  useEffect(() => {
    const query = input.trim();
    if (!query || !isRomajiInput(query)) {
      setRomajiConversion(null);
      setRomajiLoading(false);
      return undefined;
    }

    setRomajiLoading(true);
    const timer = setTimeout(() => {
      fetchRomajiConversion(query)
        .then((result) => {
          setRomajiConversion(result);
          setRomajiForm(result.kanji ? 'kanji' : 'kana');
        })
        .catch(() => setRomajiConversion(null))
        .finally(() => setRomajiLoading(false));
    }, 280);

    return () => clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    const query = effectiveText.trim();
    if (!query || !getStrokeText(query)) {
      setReading(null);
      setReadingLoading(false);
      return undefined;
    }

    setReadingLoading(true);
    const timer = setTimeout(() => {
      fetchKanaRomajiLookup(query)
        .then(setReading)
        .catch(() => setReading(null))
        .finally(() => setReadingLoading(false));
    }, 280);

    return () => clearTimeout(timer);
  }, [effectiveText]);

  const handleSpeak = () => {
    const speakText = reading?.kana || strokeText;
    if (speakText) playAudio(speakText);
  };

  const displayKanji =
    reading?.kanji && reading.kanji !== reading.kana ? reading.kanji : null;

  const previewText = effectiveText.trim() || input.trim();

  return (
    <div className="container stroke-lookup-view">
      <header className="stroke-lookup-header">
        <h2 className="view-title">Tra nét viết</h2>
        <p className="stroke-lookup-subtitle">
          Nhập tiếng Nhật (hiragana, katakana, kanji) hoặc romaji (vd. watashi, arigatou) để xem
          nét vẽ và cách đọc.
        </p>
      </header>

      <div className="stroke-lookup-panel glass-panel">
        <label className="stroke-lookup-label" htmlFor="stroke-lookup-input">
          Nội dung cần tra
        </label>
        <input
          id="stroke-lookup-input"
          type="text"
          className={`stroke-lookup-input${isRomaji ? '' : ' japanese-text'}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ví dụ: 私, 医者, watashi, arigatou…"
          autoComplete="off"
          spellCheck={false}
        />

        {isRomaji && (romajiLoading || romajiConversion?.kana) && (
          <div className="stroke-lookup-romaji-bar">
            {romajiLoading && !romajiConversion?.kana ? (
              <span className="stroke-lookup-romaji-status">Đang chuyển romaji…</span>
            ) : (
              <>
                <span className="stroke-lookup-romaji-label">Romaji →</span>
                {showRomajiToggle ? (
                  <div className="stroke-lookup-form-toggle">
                    {romajiConversion!.options.map((option) => (
                      <button
                        key={option.kind}
                        type="button"
                        className={`stroke-lookup-form-btn japanese-text${
                          romajiForm === option.kind ? ' stroke-lookup-form-btn--active' : ''
                        }`}
                        onClick={() => setRomajiForm(option.kind)}
                      >
                        {option.kind === 'kanji' ? 'Kanji' : 'Hiragana'}: {option.text}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="stroke-lookup-romaji-result japanese-text">
                    {effectiveText}
                  </span>
                )}
              </>
            )}
          </div>
        )}

        <div className="stroke-lookup-examples">
          <span className="stroke-lookup-examples-label">Gợi ý:</span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              className={`stroke-lookup-example-btn${
                isRomajiInput(example) ? '' : ' japanese-text'
              }`}
              onClick={() => setInput(example)}
            >
              {example}
            </button>
          ))}
        </div>

        <div className="stroke-lookup-result">
          {strokeText ? (
            <>
              <div className="stroke-lookup-result-head">
                <p className="stroke-lookup-preview japanese-text">{previewText}</p>
                <button type="button" className="btn btn-primary stroke-lookup-speak" onClick={handleSpeak}>
                  🔊 Nghe phát âm
                </button>
              </div>

              {(reading || readingLoading) && (
                <dl className="stroke-lookup-reading">
                  {readingLoading && !reading ? (
                    <p className="stroke-lookup-reading-loading">Đang tra cách đọc…</p>
                  ) : reading ? (
                    <>
                      {displayKanji ? (
                        <div className="stroke-lookup-reading-row">
                          <dt>Kanji</dt>
                          <dd className="japanese-text">{displayKanji}</dd>
                        </div>
                      ) : null}
                      {reading.kana ? (
                        <div className="stroke-lookup-reading-row">
                          <dt>Hiragana</dt>
                          <dd className="japanese-text">{reading.kana}</dd>
                        </div>
                      ) : null}
                      {reading.romaji ? (
                        <div className="stroke-lookup-reading-row">
                          <dt>Romaji</dt>
                          <dd>{reading.romaji}</dd>
                        </div>
                      ) : null}
                      {reading.meaning ? (
                        <div className="stroke-lookup-reading-row stroke-lookup-reading-row--meaning">
                          <dt>Nghĩa</dt>
                          <dd>{reading.meaning}</dd>
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </dl>
              )}
              <div className="stroke-lookup-canvas">
                {hasOptional ? (
                  <LookupStrokeSegments text={effectiveText} onCharClick={handleSpeak} />
                ) : (
                  <StrokeOrder
                    text={effectiveText}
                    width={singleSize}
                    height={singleSize}
                    compact
                    onCharClick={handleSpeak}
                  />
                )}
              </div>
              <p className="stroke-lookup-hint">Nhấn vào từng chữ để xem lại nét vẽ.</p>
            </>
          ) : isRomaji && !romajiLoading ? (
            <p className="stroke-lookup-empty">
              Không nhận dạng được romaji &quot;{input.trim()}&quot;. Thử watashi, arigatou, yoroshiku…
            </p>
          ) : (
            <p className="stroke-lookup-empty">
              Chưa có ký tự hiragana, katakana hoặc kanji để hiển thị nét vẽ.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
