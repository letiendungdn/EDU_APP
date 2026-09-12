'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchVocabularies } from '@/api';
import { playAudio } from '@/utils/speech';

// Seed word-of-the-day by calendar day so it changes daily but is stable across refreshes
function dayIndex() {
  const now = new Date();
  return now.getFullYear() * 366 + now.getMonth() * 31 + now.getDate();
}

export default function HomeWordOfDay() {
  // Fetch lesson 1 vocab — lightweight (50 words), well-known, always available
  const { data: words, isLoading } = useQuery({
    queryKey: ['vocab', 'lesson', 1],
    queryFn: () => fetchVocabularies(1),
    staleTime: Infinity,   // vocab doesn't change often
  });

  const word = useMemo(() => {
    if (!words?.length) return null;
    return words[dayIndex() % words.length];
  }, [words]);

  if (isLoading || !word) {
    return (
      <div className="home-wotd home-wotd--loading">
        <div className="skeleton" style={{ height: 80, borderRadius: 12 }} />
      </div>
    );
  }

  return (
    <div className="home-wotd">
      <div className="home-wotd__label">Từ hôm nay</div>
      <div className="home-wotd__content">
        <div className="home-wotd__jp">
          {word.kanji && <span className="home-wotd__kanji">{word.kanji}</span>}
          <span className="home-wotd__kana">{word.kana}</span>
        </div>
        <button
          className="home-wotd__audio"
          onClick={() => playAudio(word.kana)}
          title="Phát âm"
          aria-label={`Phát âm: ${word.kana}`}
        >
          🔊
        </button>
      </div>
      <div className="home-wotd__meaning">{word.meaning}</div>
      {word.romaji && <div className="home-wotd__romaji">{word.romaji}</div>}
    </div>
  );
}
