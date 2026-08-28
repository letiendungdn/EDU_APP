'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { playAudio } from '../utils/speech';
import { useJapaneseRoleplayQuery } from '../hooks/queries';
import './DrillView.css';

export default function RoleplayView() {
  const { data, isLoading } = useJapaneseRoleplayQuery();
  const scenes = data?.scenes ?? [];

  const [sceneId, setSceneId] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [hideJa, setHideJa] = useState(true);

  useEffect(() => {
    if (scenes.length && !sceneId) {
      setSceneId(scenes[0].id);
    }
  }, [scenes, sceneId]);

  const scene = scenes.find((s) => s.id === sceneId) ?? scenes[0];
  const line = scene?.lines[lineIndex];

  function playScene() {
    if (!scene) return;
    scene.lines.forEach((item, i) => {
      window.setTimeout(() => playAudio(item.ja), i * 2200);
    });
  }

  if (isLoading || !data || !scene || !line) {
    return (
      <div className="container drill-view">
        <p className="drill-meta">Đang tải bài đóng vai...</p>
      </div>
    );
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
        {scenes.map((s) => (
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
