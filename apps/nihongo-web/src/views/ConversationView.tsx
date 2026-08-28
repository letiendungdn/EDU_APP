'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { ConversationPhraseItem } from '../types/reference';
import PlayAllButton from '../components/PlayAllButton';
import { usePlayAll } from '../hooks/usePlayAll';
import { useJapaneseConversationQuery } from '../hooks/queries';
import { playAudio } from '../utils/speech';
import './DrillView.css';
import './ConversationView.css';

type Mode = 'intro' | 'phrases' | 'quiz';

function shuffle<T>(list: T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function quizOptions(correct: ConversationPhraseItem, bank: ConversationPhraseItem[]): string[] {
  const rest = shuffle(bank.filter((p) => p.ja !== correct.ja)).slice(0, 3).map((p) => p.ja);
  return shuffle([correct.ja, ...rest]);
}

export default function ConversationView() {
  const { data, isLoading } = useJapaneseConversationQuery();
  const introScript = data?.introScript ?? [];
  const introSlots = data?.introSlots ?? [];
  const phraseGroups = data?.phraseGroups ?? [];

  const [mode, setMode] = useState<Mode>('intro');
  const [lineIndex, setLineIndex] = useState(0);
  const [hideJa, setHideJa] = useState(false);
  const [groupId, setGroupId] = useState('');
  const [qIndex, setQIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ ok: 0, n: 0 });
  const { isPlayingAll, startPlayAll, stopPlayAll } = usePlayAll();

  useEffect(() => {
    if (phraseGroups.length && !groupId) {
      setGroupId(phraseGroups[0].id);
    }
  }, [phraseGroups, groupId]);

  const group = phraseGroups.find((g) => g.id === groupId) ?? phraseGroups[0];
  const line = introScript[lineIndex];
  const bank = useMemo(
    () => phraseGroups.flatMap((g) => g.items),
    [phraseGroups],
  );
  const quizDeck = useMemo(() => shuffle(bank).slice(0, 16), [bank]);
  const currentQ = quizDeck[qIndex];
  const options = useMemo(
    () => (currentQ ? quizOptions(currentQ, bank) : []),
    [currentQ, bank],
  );

  if (isLoading || !data || !introScript.length) {
    return (
      <div className="container drill-view conversation-view">
        <p className="drill-meta">Đang tải bài giao tiếp...</p>
      </div>
    );
  }

  return (
    <div className="container drill-view conversation-view">
      <header className="drill-header">
        <h2 className="view-title">会話 — Giao tiếp thông dụng</h2>
        <p className="drill-subtitle">
          Bài 自己紹介 đầy đủ, rồi kho câu hay dùng hằng ngày (N5). Bấm thẻ để nghe.{' '}
          <Link href="/roleplay">Đóng vai hội thoại</Link>
        </p>
      </header>

      <div className="drill-toolbar">
        <button type="button" className={`tab-btn ${mode === 'intro' ? 'active' : ''}`} onClick={() => { setMode('intro'); stopPlayAll(); }}>
          自己紹介
        </button>
        <button type="button" className={`tab-btn ${mode === 'phrases' ? 'active' : ''}`} onClick={() => { setMode('phrases'); stopPlayAll(); }}>
          Câu giao tiếp
        </button>
        <button type="button" className={`tab-btn ${mode === 'quiz' ? 'active' : ''}`} onClick={() => { setMode('quiz'); setPicked(null); stopPlayAll(); }}>
          Quiz
        </button>
      </div>

      {mode === 'intro' && line && (
        <>
          <section className="drill-card intro-script">
            <p className="drill-meta">Bài mẫu — đổi tên / quê / nghề cho đúng bạn</p>
            <p className="drill-prompt japanese-text" style={{ fontSize: '1.25rem' }}>
              {hideJa ? '……' : line.ja}
            </p>
            <p className="drill-meta">{line.kana} · {line.romaji}</p>
            <p>{line.vi}</p>
            {line.tip && <p className="intro-tip">{line.tip}</p>}
            <p className="drill-score">{lineIndex + 1}/{introScript.length}</p>
            <div className="drill-toolbar">
              <button type="button" className="btn btn-primary" onClick={() => playAudio(line.ja)}>🔊 Nghe câu này</button>
              <button type="button" className="btn btn-outline" onClick={() => setHideJa((v) => !v)}>
                {hideJa ? 'Hiện chữ' : 'Che chữ'}
              </button>
              <PlayAllButton
                isPlaying={isPlayingAll}
                onPlay={() => startPlayAll(introScript.map((l) => l.ja), { pauseMs: 700, onItemIndex: setLineIndex })}
                onStop={stopPlayAll}
                label="Đọc cả bài"
              />
            </div>
            <div className="drill-toolbar">
              <button type="button" className="btn btn-nav" disabled={lineIndex === 0} onClick={() => setLineIndex((i) => i - 1)}>Câu trước</button>
              <button type="button" className="btn btn-nav" disabled={lineIndex >= introScript.length - 1} onClick={() => setLineIndex((i) => i + 1)}>Câu sau</button>
            </div>
          </section>

          <h3 className="conv-section-title">Ghép bài của bạn</h3>
          {introSlots.map((slot) => (
            <section key={slot.slot} className="intro-slot">
              <h4>{slot.slot} <span className="japanese-text">· {slot.question}</span></h4>
              <div className="phrase-grid">
                {slot.examples.map((item) => (
                  <button key={item.ja} type="button" className="phrase-card" onClick={() => playAudio(item.ja)}>
                    <strong className="japanese-text">{item.ja}</strong>
                    <span>{item.romaji}</span>
                    <span>{item.vi}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      {mode === 'phrases' && group && (
        <>
          <div className="drill-toolbar">
            {phraseGroups.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`tab-btn ${groupId === g.id ? 'active' : ''}`}
                onClick={() => { setGroupId(g.id); stopPlayAll(); }}
              >
                {g.label}
              </button>
            ))}
          </div>
          <p className="drill-meta" style={{ textAlign: 'center' }}>{group.hint}</p>
          <div className="drill-toolbar">
            <PlayAllButton
              isPlaying={isPlayingAll}
              onPlay={() => startPlayAll(group.items.map((i) => i.ja), { pauseMs: 550 })}
              onStop={stopPlayAll}
              label={`Phát ${group.items.length} câu`}
            />
          </div>
          <div className="phrase-grid">
            {group.items.map((item) => (
              <button key={item.ja} type="button" className="phrase-card" onClick={() => playAudio(item.ja)}>
                <strong className="japanese-text">{item.ja}</strong>
                <span className="japanese-text">{item.kana}</span>
                <span>{item.romaji}</span>
                <span>{item.vi}</span>
                {item.note && <em>{item.note}</em>}
              </button>
            ))}
          </div>
        </>
      )}

      {mode === 'quiz' && currentQ && (
        <>
          <p className="drill-score">{qIndex + 1}/{quizDeck.length} · đúng {score.ok}/{score.n || 0}</p>
          <div className="drill-card">
            <p className="drill-meta">Nghĩa tiếng Việt — chọn câu Nhật đúng</p>
            <p className="drill-prompt" style={{ fontSize: '1.2rem' }}>{currentQ.vi}</p>
            <div className="drill-options">
              {options.map((opt) => {
                const cls =
                  picked == null ? '' : opt === currentQ.ja ? ' is-correct' : opt === picked ? ' is-wrong' : '';
                return (
                  <button
                    key={opt}
                    type="button"
                    className={`drill-option japanese-text${cls}`}
                    disabled={picked != null}
                    onClick={() => {
                      setPicked(opt);
                      setScore((s) => ({ ok: s.ok + (opt === currentQ.ja ? 1 : 0), n: s.n + 1 }));
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {picked && (
              <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={() => playAudio(currentQ.ja)}>
                Nghe đáp án
              </button>
            )}
          </div>
          <button
            type="button"
            className="btn btn-nav"
            onClick={() => {
              setPicked(null);
              setQIndex((i) => (i + 1) % quizDeck.length);
            }}
          >
            Câu tiếp
          </button>
        </>
      )}
    </div>
  );
}
