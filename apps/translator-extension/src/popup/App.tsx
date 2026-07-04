import React, { useEffect, useState } from 'react';

type Status = 'idle' | 'saved' | 'error';

export default function App() {
  const [key, setKey]         = useState('');
  const [show, setShow]       = useState(false);
  const [status, setStatus]   = useState<Status>('idle');

  useEffect(() => {
    chrome.storage.local.get('geminiApiKey', (d) => {
      if (d.geminiApiKey) setKey(d.geminiApiKey as string);
    });
  }, []);

  function save() {
    if (!key.trim()) { setStatus('error'); return; }
    chrome.storage.local.set({ geminiApiKey: key.trim() }, () => {
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2200);
    });
  }

  function clear() {
    chrome.storage.local.remove('geminiApiKey', () => {
      setKey('');
      setStatus('idle');
    });
  }

  const hasKey = key.length > 0;

  return (
    <div className="popup">
      <header className="popup-header">
        <span className="popup-logo">🌐</span>
        <div>
          <h1>Tri Ngữ Translator</h1>
          <p>Bôi đen bất kỳ từ nào để dịch</p>
        </div>
      </header>

      <section className="popup-section">
        <label className="popup-label" htmlFor="api-key">
          Gemini API Key
          {hasKey && <span className="popup-pill popup-pill--ok">✓ Đã cài</span>}
        </label>

        <div className="popup-input-wrap">
          <input
            id="api-key"
            type={show ? 'text' : 'password'}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="AIzaSy..."
            className={`popup-input${status === 'error' ? ' popup-input--error' : ''}`}
            onKeyDown={(e) => e.key === 'Enter' && save()}
          />
          <button
            className="popup-btn-toggle"
            onClick={() => setShow(!show)}
            title={show ? 'Ẩn key' : 'Hiện key'}
          >
            {show ? '🙈' : '👁'}
          </button>
        </div>

        {status === 'error' && (
          <p className="popup-hint popup-hint--error">Nhập API key trước khi lưu.</p>
        )}

        <p className="popup-hint">
          Lấy miễn phí tại{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
            Google AI Studio
          </a>
          . Key chỉ lưu local, không gửi đi đâu.
        </p>
      </section>

      <div className="popup-actions">
        <button
          className={`popup-btn popup-btn--primary${status === 'saved' ? ' popup-btn--saved' : ''}`}
          onClick={save}
        >
          {status === 'saved' ? '✓ Đã lưu' : 'Lưu'}
        </button>
        {hasKey && (
          <button className="popup-btn popup-btn--ghost" onClick={clear}>
            Xoá key
          </button>
        )}
      </div>

      <footer className="popup-footer">
        <span>🇻🇳 · 🇬🇧 · 🇯🇵</span>
        <span>Bôi đen → dịch ngay</span>
      </footer>
    </div>
  );
}
