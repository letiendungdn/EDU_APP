'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useVocabRangeQuery } from '../hooks/queries';
import { playAudio } from '../utils/speech';
import {
  CONJ_FORMS,
  conjugateWord,
  normalizeTypedJp,
  type ConjFormId,
} from '../utils/conjugate';
import './DrillView.css';

type Item = {
  kana: string;
  display: string;
  meaning: string;
  asked: ConjFormId;
  answer: string;
  options: string[];
};

function pickAsked(forms: Record<ConjFormId, string>): ConjFormId {
  const pool: ConjFormId[] = ['te', 'ta', 'nai', 'dict'];
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildItems(
  rows: Array<{ kana: string; kanji?: string | null; meaning: string; partOfSpeech?: string | null }>,
): Item[] {
  const items: Item[] = [];
  for (const row of rows) {
    const result = conjugateWord(row);
    if (!result) continue;
    const asked = pickAsked(result.forms);
    const answer = result.forms[asked];
    const distractors = CONJ_FORMS.map((f) => result.forms[f.id]).filter((f) => f !== answer);
    const extra = items.map((i) => i.answer).filter((a) => a !== answer);
    const options = [answer, ...distractors, ...extra].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4);
    while (options.length < 4 && extra.length) options.push(extra.pop()!);
    for (let i = options.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    items.push({
      kana: row.kana,
      display: row.kanji || row.kana,
      meaning: row.meaning,
      asked,
      answer,
      options,
    });
  }
  return items.sort(() => Math.random() - 0.5).slice(0, 20);
}

export default function ConjugationView() {
  const { data = [], isLoading } = useVocabRangeQuery(1, 50);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState({ ok: 0, n: 0 });
  const [mode, setMode] = useState<'choice' | 'type'>('choice');

  const deck = useMemo(() => buildItems(data), [data]);
  const current = deck[index];
  const askedLabel = CONJ_FORMS.find((f) => f.id === current?.asked)?.label ?? '';
  const locked = picked !== null || (mode === 'type' && score.n > index);

  function grade(value: string) {
    if (!current || picked) return;
    const ok = normalizeTypedJp(value) === normalizeTypedJp(current.answer);
    setPicked(value);
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), n: s.n + 1 }));
  }

  function next() {
    setPicked(null);
    setTyped('');
    setIndex((i) => (i + 1) % Math.max(deck.length, 1));
  }

  if (isLoading) return <div className="container drill-view">Đang tải từ vựng...</div>;
  if (!current) {
    return (
      <div className="container drill-view">
        <p>Chưa đủ động từ/tính từ để luyện. Kiểm tra dữ liệu Minna.</p>
      </div>
    );
  }

  return (
    <div className="container drill-view">
      <header className="drill-header">
        <h2 className="view-title">活用 — Chia động từ / tính từ</h2>
        <p className="drill-subtitle">
          Từ dạng ます (Minna), chọn đúng て・た・ない・辞書形.{' '}
          <Link href="/practice">Tất cả bài luyện</Link>
        </p>
      </header>
      <div className="drill-toolbar">
        <button type="button" className={`tab-btn ${mode === 'choice' ? 'active' : ''}`} onClick={() => setMode('choice')}>
          Trắc nghiệm
        </button>
        <button type="button" className={`tab-btn ${mode === 'type' ? 'active' : ''}`} onClick={() => setMode('type')}>
          Gõ chữ
        </button>
      </div>
      <p className="drill-score">
        {index + 1}/{deck.length} · đúng {score.ok}/{score.n || 0}
      </p>
      <div className="drill-card">
        <p className="drill-meta">{current.meaning}</p>
        <p className="drill-prompt japanese-text">{current.display}</p>
        <p className="drill-meta">
          Dạng ます: {current.kana} → hãy chọn <strong>{askedLabel}</strong>
        </p>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => playAudio(current.kana)}>
          Nghe ます
        </button>
        {mode === 'choice' ? (
          <div className="drill-options" style={{ marginTop: '1rem' }}>
            {current.options.map((opt) => {
              const cls =
                picked == null
                  ? ''
                  : opt === current.answer
                    ? ' is-correct'
                    : opt === picked
                      ? ' is-wrong'
                      : '';
              return (
                <button
                  key={opt}
                  type="button"
                  className={`drill-option japanese-text${cls}`}
                  disabled={picked != null}
                  onClick={() => grade(opt)}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <form
            className="drill-type-row"
            onSubmit={(e) => {
              e.preventDefault();
              grade(typed);
            }}
          >
            <input
              className="japanese-text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={`${askedLabel}形`}
              disabled={picked != null}
            />
            <button type="submit" className="btn btn-primary" disabled={picked != null || !typed.trim()}>
              Kiểm tra
            </button>
          </form>
        )}
        {picked != null && (
          <p className={`drill-feedback ${normalizeTypedJp(picked) === normalizeTypedJp(current.answer) ? '' : ''}`}>
            {normalizeTypedJp(picked) === normalizeTypedJp(current.answer)
              ? 'Đúng'
              : `Sai — đáp án: ${current.answer}`}
          </p>
        )}
      </div>
      <div className="drill-toolbar">
        <button type="button" className="btn btn-nav" onClick={next} disabled={!locked && picked == null}>
          Câu tiếp
        </button>
      </div>
    </div>
  );
}
