'use client';

import { useMemo, useState } from 'react';
import { useBookAudioFilesQuery } from '../hooks/queries';
import type { BookAudioItem } from '../types/reference';
import './BookAudioView.css';

function linkLabel(url: string): string {
  if (url.includes('drive.google.com')) return 'Google Drive';
  if (url.includes('slideshare.net')) return 'SlideShare';
  if (url.includes('bit.ly')) return 'Link rút gọn';
  return 'Mở link';
}

function isPlayable(path: string): boolean {
  return /\.(mp3|wma|wav|m4a|ogg|flac|aac)$/i.test(path);
}

function BookAudioRow({ item }: { item: BookAudioItem }) {
  const [open, setOpen] = useState(false);
  const files = item.localFiles ?? [];
  const hasLocal = files.length > 0;

  return (
    <li className="book-audio-item">
      <div className="book-audio-item-top">
        <div className="book-audio-item-main">
          {item.no != null && <span className="book-audio-no">{item.no}</span>}
          <div className="book-audio-text">
            <span className="book-audio-title">{item.title}</span>
            {item.note && <span className="book-audio-note">{item.note}</span>}
            {hasLocal && (
              <span className="book-audio-badge">
                {files.length} file local
              </span>
            )}
          </div>
        </div>
        <div className="book-audio-actions">
          {hasLocal && (
            <button
              type="button"
              className="btn btn-sm book-audio-toggle"
              onClick={() => setOpen(!open)}
            >
              {open ? '▲ Thu' : '▼ Nghe'}
            </button>
          )}
          <a
            className="btn btn-sm book-audio-link"
            href={item.url}
            target="_blank"
            rel="noreferrer"
          >
            {linkLabel(item.url)} ↗
          </a>
        </div>
      </div>

      {open && hasLocal && (
        <ul className="book-audio-files">
          {files.map((f) => (
            <li key={f.id} className="book-audio-file">
              <span className="book-audio-file-name">{f.fileName}</span>
              {isPlayable(f.localPath) ? (
                <audio controls preload="none" src={f.localPath} className="book-audio-player" />
              ) : (
                <a className="btn btn-sm" href={f.localPath} target="_blank" rel="noreferrer">
                  Tải file
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function BookAudioView() {
  const { data, isLoading, error } = useBookAudioFilesQuery();
  const sections = data?.sections ?? [];
  const [activeLevel, setActiveLevel] = useState('');

  const resolvedLevel = activeLevel || sections[0]?.level || '';
  const section = useMemo(
    () => sections.find((s) => s.level === resolvedLevel) ?? sections[0],
    [sections, resolvedLevel],
  );

  const totalLocal = useMemo(
    () => sections.reduce(
      (sum, s) => sum + s.items.reduce((n, i) => n + (i.localFiles?.length ?? 0), 0),
      0,
    ),
    [sections],
  );

  if (isLoading) {
    return (
      <div className="container book-audio-view">
        <p className="book-audio-loading">Đang tải danh sách file nghe...</p>
      </div>
    );
  }

  if (error || !data || !section) {
    return (
      <div className="container book-audio-view">
        <p className="book-audio-error">Không tải được danh sách file nghe sách.</p>
      </div>
    );
  }

  return (
    <div className="container book-audio-view">
      <header className="book-audio-header">
        <h2 className="view-title">File nghe sách</h2>
        <p className="book-audio-subtitle">
          Tổng hợp link file nghe &amp; tài liệu JLPT N5–N1 — nguồn{' '}
          <a href={data.sourceUrl} target="_blank" rel="noreferrer">
            {data.publisher}
          </a>
          . {totalLocal > 0 && (
            <span className="book-audio-local-hint">
              Đã tải về server: <strong>{totalLocal}</strong> file — bấm <em>Nghe</em> để phát trong app.
            </span>
          )}
        </p>
      </header>

      <div className="tab-buttons book-audio-tabs">
        {sections.map((s) => (
          <button
            key={s.level}
            type="button"
            className={`btn tab-btn ${resolvedLevel === s.level ? 'active' : ''}`}
            onClick={() => setActiveLevel(s.level)}
          >
            {s.label}
            <span className="book-audio-tab-count">{s.items.length}</span>
          </button>
        ))}
      </div>

      <section className="book-audio-list glass-panel">
        <h3 className="book-audio-section-title">{section.label}</h3>
        <ul className="book-audio-items">
          {section.items.map((item) => (
            <BookAudioRow key={item.id} item={item} />
          ))}
        </ul>
      </section>
    </div>
  );
}
