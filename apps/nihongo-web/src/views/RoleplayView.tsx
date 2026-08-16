'use client';

import { useState } from 'react';
import Link from 'next/link';
import { playAudio } from '../utils/speech';
import { ROLEPLAY_SCENES } from '../data/roleplay';
import './DrillView.css';

export default function RoleplayView() {
  const [sceneId, setSceneId] = useState(ROLEPLAY_SCENES[0].id);
  const [lineIndex, setLineIndex] = useState(0);
  const [hideJa, setHideJa] = useState(true);
  const scene = ROLEPLAY_SCENES.find((s) => s.id === sceneId) ?? ROLEPLAY_SCENES[0];
  const line = scene.lines[lineIndex];

  function playScene() {
    scene.lines.forEach((item, i) => {
      window.setTimeout(() => playAudio(item.ja), i * 2200);
    });
  }

  return (
    <div className="container drill-view">
      <header className="drill-header">
        <h2 className="view-title">会話 — Đóng vai</h2>
        <p className="drill-subtitle">
          Nghe lượt của đối phương, nói lượt của bạn, rồi hiện chữ.{' '}
          <Link href="/practice">Hub luyện tập</Link>
        </p>
      </header>
      <div className="drill-toolbar">
        {ROLEPLAY_SCENES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`tab-btn ${sceneId === s.id ? 'active' : ''}`}
            onClick={() => { setSceneId(s.id); setLineIndex(0); }}
          >
            {s.title}
          </button>
        ))}
      </div>
      <p className="drill-meta" style={{ textAlign: 'center' }}>
        {scene.titleJa} — {scene.desc}
      </p>
      <div className="drill-card">
        <p className="drill-meta">{line.role} · {lineIndex + 1}/{scene.lines.length}</p>
        <p className="drill-prompt japanese-text">{hideJa ? '……' : line.ja}</p>
        <p className="drill-meta">{line.vi}</p>
        <div className="drill-toolbar">
          <button type="button" className="btn btn-primary" onClick={() => playAudio(line.ja)}>🔊 Nghe lượt này</button>
          <button type="button" className="btn btn-outline" onClick={() => setHideJa((v) => !v)}>
            {hideJa ? 'Hiện chữ' : 'Che chữ'}
          </button>
          <button type="button" className="btn btn-outline" onClick={playScene}>Phát cả đoạn</button>
        </div>
      </div>
      <div className="drill-toolbar">
        <button type="button" className="btn btn-nav" disabled={lineIndex === 0} onClick={() => { setLineIndex((i) => i - 1); setHideJa(true); }}>
          Lượt trước
        </button>
        <button
          type="button"
          className="btn btn-nav"
          disabled={lineIndex >= scene.lines.length - 1}
          onClick={() => { setLineIndex((i) => i + 1); setHideJa(true); }}
        >
          Lượt sau
        </button>
      </div>
    </div>
  );
}
