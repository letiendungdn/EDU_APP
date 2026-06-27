'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { adminImportVocab } from '../../api';
import { useAuth } from '../../hooks/useAuth';
import './AdminPages.css';

export default function AdminImportPage() {
  const { token, logout } = useAuth();
  const [lessonNumber, setLessonNumber] = useState(1);
  const [text, setText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await adminImportVocab(token, lessonNumber, text);
      setResult(`Đã import ${res.count} từ${res.skipped ? `, bỏ qua ${res.skipped} dòng lỗi` : ''}.`);
    } catch (err) {
      setResult(err instanceof Error ? err.message : 'Import thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar glass-panel">
        <div>
          <h1>Import từ vựng</h1>
          <p>
            <Link href="/admin">← Dashboard</Link>
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={logout}>
          Đăng xuất
        </button>
      </header>

      <form className="glass-panel admin-import-form" onSubmit={handleSubmit}>
        <label>
          Số bài
          <input
            type="number"
            min={1}
            value={lessonNumber}
            onChange={(e) => setLessonNumber(Number(e.target.value))}
          />
        </label>
        <label>
          Dữ liệu (tab-separated: Kanji | Kana | Romaji | Meaning)
          <textarea
            rows={12}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'食べる\tたべる\ttaberu\tăn'}
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={loading || !text.trim()}>
          {loading ? 'Đang import...' : 'Import'}
        </button>
        {result && <p className="admin-meta">{result}</p>}
      </form>
    </div>
  );
}
