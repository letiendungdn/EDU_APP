import { useState, useEffect, useCallback, useRef } from 'react';
import { playAudioSequence, stopAudio } from '../utils/speech';

interface PlayAllOptions {
  onItemIndex?: (index: number) => void;
}

export function usePlayAll(): {
  isPlayingAll: boolean;
  startPlayAll: (texts: string[], options?: PlayAllOptions) => Promise<void>;
  stopPlayAll: () => void;
} {
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const playingRef = useRef(false);

  useEffect(() => () => stopAudio(), []);

  const stopPlayAll = useCallback(() => {
    stopAudio();
    playingRef.current = false;
    setIsPlayingAll(false);
  }, []);

  const startPlayAll = useCallback(
    async (texts: string[], { onItemIndex }: PlayAllOptions = {}) => {
      const items = texts?.filter(Boolean) ?? [];
      if (!items.length || playingRef.current) return;

      playingRef.current = true;
      setIsPlayingAll(true);

      await playAudioSequence(items, {
        onItem: (index) => onItemIndex?.(index),
        onEnd: () => {
          playingRef.current = false;
          setIsPlayingAll(false);
        },
        onStop: () => {
          playingRef.current = false;
          setIsPlayingAll(false);
        },
      });
    },
    [],
  );

  return { isPlayingAll, startPlayAll, stopPlayAll };
}
