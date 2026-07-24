'use client';
import { useEffect, useRef, useState } from 'react';
import type { Map as MapboxMap } from 'mapbox-gl';
import { PREFECTURES, TYPE_COLOR, TYPE_LABEL, type Prefecture } from '@/data/japan-prefectures';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

const REGION_COLORS: Record<string, string> = {
  '北海道地方': '#3b82f6',
  '東北地方':   '#8b5cf6',
  '関東地方':   '#ef4444',
  '中部地方':   '#f59e0b',
  '近畿地方':   '#ec4899',
  '中国地方':   '#14b8a6',
  '四国地方':   '#84cc16',
  '九州地方':   '#f97316',
};

export default function JapanMapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<{ remove: () => void }[]>([]);

  const [selected, setSelected] = useState<Prefecture | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState<{ pref: Prefecture; choices: string[] } | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [visited, setVisited] = useState<Set<string>>(new Set());

  // Load visited from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('jp-map-visited');
      if (raw) setVisited(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  function markVisited(code: string) {
    setVisited((prev) => {
      const next = new Set(prev);
      next.add(code);
      try { localStorage.setItem('jp-map-visited', JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!MAPBOX_TOKEN) return;

    let map: MapboxMap;

    import('mapbox-gl').then((mapboxgl) => {
      (mapboxgl as typeof mapboxgl & { accessToken: string }).accessToken = MAPBOX_TOKEN;

      map = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [137.0, 36.5],
        zoom: 4.5,
        minZoom: 3,
        maxZoom: 10,
      });

      mapRef.current = map;

      map.on('load', () => {
        // Add prefecture markers
        PREFECTURES.forEach((pref) => {
          const el = document.createElement('div');
          const color = REGION_COLORS[pref.region] ?? '#6b7280';
          const inner = document.createElement('div');
          inner.textContent = pref.nameJa.replace(/[都道府県]$/, '').slice(0, 2);
          Object.assign(inner.style, {
            width: '36px', height: '36px', borderRadius: '50%',
            background: color, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '700', fontFamily: 'serif',
            cursor: 'pointer', border: '2px solid #fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            transition: 'transform 0.15s', userSelect: 'none',
          });
          el.appendChild(inner);
          el.addEventListener('mouseenter', () => { inner.style.transform = 'scale(1.25)'; });
          el.addEventListener('mouseleave', () => { inner.style.transform = 'scale(1)'; });
          el.addEventListener('click', () => {
            setSelected(pref);
            markVisited(pref.code);
          });

          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([pref.lng, pref.lat])
            .addTo(map);
          markersRef.current.push(marker);
        });
      });
    });

    return () => {
      map?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quiz logic
  function startQuiz() {
    setQuizMode(true);
    setQuizScore({ correct: 0, total: 0 });
    nextQuizQuestion();
  }

  function nextQuizQuestion() {
    const prefs = filter === 'all' ? PREFECTURES : PREFECTURES.filter((p) => p.region === filter);
    const pref = prefs[Math.floor(Math.random() * prefs.length)];
    // Pick 3 wrong answers
    const others = PREFECTURES.filter((p) => p.code !== pref.code);
    const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
    const choices = [pref.nameJa, ...shuffled.map((p) => p.nameJa)].sort(() => Math.random() - 0.5);
    setQuizQuestion({ pref, choices });
    setQuizFeedback(null);
    // Fly to location
    mapRef.current?.flyTo({ center: [pref.lng, pref.lat], zoom: 6.5, duration: 800 });
  }

  function answerQuiz(choice: string) {
    if (!quizQuestion || quizFeedback) return;
    const correct = choice === quizQuestion.pref.nameJa;
    setQuizFeedback(correct ? 'correct' : 'wrong');
    setQuizScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    if (correct) markVisited(quizQuestion.pref.code);
    setTimeout(nextQuizQuestion, 1200);
  }

  const displayedPrefs = filter === 'all' ? PREFECTURES : PREFECTURES.filter((p) => p.region === filter);
  const regions = [...new Set(PREFECTURES.map((p) => p.region))];

  if (!MAPBOX_TOKEN) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🗾</div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Cần Mapbox Token</h2>
        <p style={{ color: '#6b7280', marginTop: 8 }}>
          Thêm <code>NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx</code> vào file <code>.env.local</code>
        </p>
        <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>
          Lấy token miễn phí tại mapbox.com (100k map loads/tháng)
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f9fafb' }}>
      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Quiz overlay */}
        {quizMode && quizQuestion && (
          <div style={{
            position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.97)', borderRadius: 12, padding: '16px 24px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)', minWidth: 360, textAlign: 'center',
            border: quizFeedback === 'correct' ? '2px solid #16a34a' : quizFeedback === 'wrong' ? '2px solid #ef4444' : '2px solid transparent',
            transition: 'border-color 0.2s',
          }}>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
              🎯 Tỉnh nào đây? — Điểm: {quizScore.correct}/{quizScore.total}
            </div>
            <div style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>
              Vùng: <strong>{quizQuestion.pref.region}</strong> &nbsp;|&nbsp; Nổi tiếng: {quizQuestion.pref.famous}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {quizQuestion.choices.map((c) => (
                <button
                  key={c}
                  onClick={() => answerQuiz(c)}
                  disabled={!!quizFeedback}
                  style={{
                    padding: '10px 8px', borderRadius: 8, border: '1px solid #e5e7eb',
                    background: quizFeedback
                      ? c === quizQuestion.pref.nameJa ? '#dcfce7' : c === quizQuestion.choices.find((x) => x !== quizQuestion.pref.nameJa && quizFeedback === 'wrong') ? '#fee2e2' : '#f9fafb'
                      : '#fff',
                    cursor: quizFeedback ? 'default' : 'pointer',
                    fontFamily: 'serif', fontSize: 18, fontWeight: 700,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            {quizFeedback && (
              <div style={{ marginTop: 10, fontSize: 14, color: quizFeedback === 'correct' ? '#16a34a' : '#ef4444', fontWeight: 700 }}>
                {quizFeedback === 'correct' ? '✅ Đúng rồi!' : `❌ Sai — Đáp án: ${quizQuestion.pref.nameJa}`}
              </div>
            )}
            <button onClick={() => setQuizMode(false)} style={{ marginTop: 10, fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>
              Thoát quiz
            </button>
          </div>
        )}

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 20, left: 20,
          background: 'rgba(255,255,255,0.95)', borderRadius: 10, padding: '10px 14px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)', fontSize: 12,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Vùng</div>
          {Object.entries(REGION_COLORS).map(([region, color]) => (
            <div key={region} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: color }} />
              <span>{region}</span>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.95)', borderRadius: 10, padding: '8px 14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 13, textAlign: 'center',
        }}>
          <div style={{ fontWeight: 700 }}>🗾 {visited.size} / {PREFECTURES.length}</div>
          <div style={{ color: '#6b7280', fontSize: 12 }}>tỉnh đã khám phá</div>
          <div style={{ marginTop: 6, height: 6, background: '#e5e7eb', borderRadius: 3 }}>
            <div style={{ height: '100%', background: '#ef4444', borderRadius: 3, width: `${(visited.size / PREFECTURES.length) * 100}%`, transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Side panel */}
      <div style={{ width: 340, flexShrink: 0, overflowY: 'auto', borderLeft: '1px solid #e5e7eb', background: '#fff', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f3f4f6' }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>🗾 Bản đồ Nhật Bản</h1>

          {/* Region filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, marginBottom: 8 }}
          >
            <option value="all">Tất cả vùng ({PREFECTURES.length} tỉnh)</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <button
            onClick={quizMode ? () => setQuizMode(false) : startQuiz}
            style={{
              width: '100%', padding: '8px', borderRadius: 8, border: 'none',
              background: quizMode ? '#6b7280' : '#ef4444', color: '#fff',
              fontWeight: 700, cursor: 'pointer', fontSize: 14,
            }}
          >
            {quizMode ? '⏹ Dừng Quiz' : '🎯 Bắt đầu Quiz'}
          </button>
        </div>

        {/* Selected prefecture */}
        {selected && !quizMode && (
          <div style={{ padding: 16, borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'serif' }}>{selected.nameJa}</h2>
                <div style={{ color: '#6b7280', fontSize: 14 }}>{selected.nameKana} — {selected.nameRomaji}</div>
                <div style={{ fontSize: 13, color: '#374151', marginTop: 4 }}>
                  🏛 {selected.capital} &nbsp;|&nbsp; {selected.region}
                </div>
              </div>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: REGION_COLORS[selected.region] ?? '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontFamily: 'serif', fontWeight: 700, fontSize: 13, flexShrink: 0,
              }}>
                {selected.nameJa.replace(/[都道府県]$/, '').slice(0, 2)}
              </div>
            </div>

            <div style={{ marginTop: 10, padding: '8px 12px', background: '#fef9c3', borderRadius: 8, fontSize: 13 }}>
              ⭐ {selected.famous}
            </div>

            {/* Vocab */}
            <div style={{ marginTop: 14 }}>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Từ vựng liên quan:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selected.vocab.map((v) => (
                  <div key={v.ja} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                    border: `1px solid ${TYPE_COLOR[v.type]}33`, borderRadius: 8,
                    background: `${TYPE_COLOR[v.type]}08`,
                  }}>
                    <span style={{
                      fontSize: 22, fontFamily: 'serif', fontWeight: 700,
                      color: TYPE_COLOR[v.type], width: 40, textAlign: 'center',
                    }}>{v.ja}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#374151' }}>{v.kana} <span style={{ color: '#9ca3af' }}>— {v.romaji}</span></div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>🇻🇳 {v.vi}</div>
                    </div>
                    <span style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 10,
                      background: TYPE_COLOR[v.type], color: '#fff', fontWeight: 600,
                    }}>
                      {TYPE_LABEL[v.type]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {visited.has(selected.code)
              ? <div style={{ marginTop: 10, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>✅ Đã khám phá</div>
              : <button onClick={() => markVisited(selected.code)} style={{ marginTop: 10, padding: '4px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 12 }}>
                  Đánh dấu đã học
                </button>
            }
          </div>
        )}

        {/* Prefecture list */}
        {!quizMode && (
          <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}>
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, paddingLeft: 4 }}>{displayedPrefs.length} tỉnh/thành</p>
            {displayedPrefs.map((p) => (
              <button
                key={p.code}
                onClick={() => {
                  setSelected(p);
                  markVisited(p.code);
                  const m = mapRef.current as { flyTo: (o: unknown) => void } | null;
                  m?.flyTo({ center: [p.lng, p.lat], zoom: 6.5, duration: 800 });
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px',
                  borderRadius: 8, border: 'none', textAlign: 'left', cursor: 'pointer', marginBottom: 2,
                  background: selected?.code === p.code ? '#fef2f2' : '#fff',
                  borderLeft: `3px solid ${selected?.code === p.code ? '#ef4444' : 'transparent'}`,
                }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', background: REGION_COLORS[p.region] ?? '#e5e7eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontFamily: 'serif', fontWeight: 700, fontSize: 10, flexShrink: 0,
                }}>
                  {p.nameJa.replace(/[都道府県]$/, '').slice(0, 2)}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'serif' }}>{p.nameJa}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.nameRomaji}</div>
                </div>
                {visited.has(p.code) && <span style={{ fontSize: 12 }}>✅</span>}
              </button>
            ))}
          </div>
        )}

        {/* Quiz scores */}
        {quizMode && (
          <div style={{ padding: 16, textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎯</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{quizScore.correct} / {quizScore.total}</div>
            <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Điểm quiz</div>
            {quizScore.total > 0 && (
              <div style={{ marginTop: 8, fontSize: 18, fontWeight: 700, color: quizScore.correct / quizScore.total >= 0.7 ? '#16a34a' : '#f59e0b' }}>
                {Math.round((quizScore.correct / quizScore.total) * 100)}%
              </div>
            )}
            <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 16 }}>
              Nhìn vào vị trí trên bản đồ và chọn tên tỉnh đúng
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
