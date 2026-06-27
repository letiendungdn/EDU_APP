'use client';

import { useEffect, useState } from 'react';
import { playAudio, stopAudio } from '../utils/speech';

const MAX_REPLAYS = 2;

interface Props {
  audioText?: string;
  autoPlay?: boolean;
  showText?: boolean;
  unlimited?: boolean;
}

export default function ListeningPlayer({
  audioText,
  autoPlay = true,
  showText = false,
  unlimited = false,
}: Props) {
  const [replaysLeft, setReplaysLeft] = useState(MAX_REPLAYS);

  useEffect(() => {
    if (!unlimited) {
      setReplaysLeft(MAX_REPLAYS);
    }
    if (autoPlay && audioText) {
      playAudio(audioText);
    }
    return () => stopAudio();
  }, [audioText, autoPlay, unlimited]);

  const handlePlay = () => {
    if (!audioText) return;
    if (!unlimited && replaysLeft <= 0) return;
    playAudio(audioText);
    if (!unlimited) {
      setReplaysLeft((n) => n - 1);
    }
  };

  const canPlay = !!audioText && (unlimited || replaysLeft > 0);

  return (
    <div className="listening-player">
      <button
        type="button"
        className="btn btn-primary listening-play-btn"
        onClick={handlePlay}
        disabled={!canPlay}
      >
        🔊 {unlimited ? 'Nghe' : `Nghe lại ${replaysLeft > 0 ? `(${replaysLeft} lần)` : '(hết lượt)'}`}
      </button>
      <p className="listening-hint">
        {unlimited
          ? 'Nghe không giới hạn để ôn lại.'
          : `Audio tự phát khi vào câu. Nghe lại tối đa ${MAX_REPLAYS} lần.`}
      </p>
      {showText && audioText && (
        <p className="listening-reveal japanese-text">{audioText}</p>
      )}
    </div>
  );
}
