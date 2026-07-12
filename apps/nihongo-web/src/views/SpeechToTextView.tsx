'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  useSpeechRecognition,
  type SpeechRecognitionLang,
} from '../hooks/useSpeechRecognition';
import './SpeechToTextView.css';

const LANG_OPTIONS: Array<{ value: SpeechRecognitionLang; label: string }> = [
  { value: 'ja-JP', label: '🇯🇵 Tiếng Nhật' },
  { value: 'vi-VN', label: '🇻🇳 Tiếng Việt' },
];

export default function SpeechToTextView() {
  const [lang, setLang] = useState<SpeechRecognitionLang>('ja-JP');
  const { supported, listening, transcript, interim, error, start, stop, clear } =
    useSpeechRecognition({ lang });

  const displayText = useMemo(() => {
    const parts = [transcript, interim].filter(Boolean);
    return parts.join(parts.length > 1 && transcript && interim ? ' ' : '');
  }, [transcript, interim]);

  const handleCopy = async () => {
    if (!displayText.trim()) return;
    try {
      await navigator.clipboard.writeText(displayText.trim());
    } catch {
      // ignore
    }
  };

  return (
    <section className="container stt-view">
      <header className="stt-header">
        <h2 className="view-title">Ghi âm → Văn bản</h2>
        <p className="stt-subtitle">
          Nói vào micro — trình duyệt chuyển giọng nói thành chữ (Speech Recognition). Chiều
          ngược lại của{' '}
          <Link href="/tts" className="stt-link">
            Đọc văn bản
          </Link>
          .
        </p>
      </header>

      <div className="stt-panel glass-panel">
        {!supported && (
          <p className="stt-warning">
            Trình duyệt này chưa hỗ trợ nhận dạng giọng nói. Dùng <strong>Chrome</strong> hoặc{' '}
            <strong>Edge</strong> trên máy tính.
          </p>
        )}

        <fieldset className="stt-lang-group">
          <legend className="stt-label">Ngôn ngữ nói</legend>
          {LANG_OPTIONS.map((option) => (
            <label key={option.value} className="stt-lang-option">
              <input
                type="radio"
                name="stt-lang"
                checked={lang === option.value}
                onChange={() => setLang(option.value)}
                disabled={listening}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>

        <div className="stt-output-wrap">
          <label className="stt-label" htmlFor="stt-output">
            Văn bản nhận dạng
          </label>
          <textarea
            id="stt-output"
            className={`stt-output${lang === 'ja-JP' ? ' japanese-text' : ''}`}
            value={displayText}
            readOnly
            placeholder={
              lang === 'ja-JP'
                ? 'Bấm Bắt đầu nghe rồi nói tiếng Nhật…'
                : 'Bấm Bắt đầu nghe rồi nói tiếng Việt…'
            }
            rows={8}
          />
          {listening && interim && (
            <p className="stt-interim-hint">Đang nghe… (dòng xám là tạm thời, chưa chốt)</p>
          )}
        </div>

        {error && <p className="stt-error">{error}</p>}

        <div className="stt-actions">
          {!listening ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={!supported}
              onClick={start}
            >
              🎤 Bắt đầu nghe
            </button>
          ) : (
            <button type="button" className="btn btn-primary stt-stop-btn" onClick={stop}>
              ⏹ Dừng nghe
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline"
            disabled={!displayText.trim()}
            onClick={() => void handleCopy()}
          >
            📋 Sao chép
          </button>
          <button type="button" className="btn btn-outline" onClick={clear}>
            Xóa
          </button>
        </div>

        <p className="stt-note">
          Micro gửi audio lên engine nhận dạng của trình duyệt (Google trên Chrome). Cần HTTPS
          hoặc localhost và quyền micro.
        </p>
      </div>
    </section>
  );
}
