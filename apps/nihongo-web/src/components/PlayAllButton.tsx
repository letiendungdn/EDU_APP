'use client';

interface Props {
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  disabled?: boolean;
  label?: string;
  stopLabel?: string;
}

export default function PlayAllButton({
  isPlaying,
  onPlay,
  onStop,
  disabled = false,
  label = 'Phát tất cả',
  stopLabel = 'Dừng',
}: Props) {
  return (
    <button
      type="button"
      className={`btn btn-play-all ${isPlaying ? 'playing' : ''}`}
      onClick={isPlaying ? onStop : onPlay}
      disabled={disabled}
    >
      {isPlaying ? `⏹ ${stopLabel}` : `🔊 ${label}`}
    </button>
  );
}
