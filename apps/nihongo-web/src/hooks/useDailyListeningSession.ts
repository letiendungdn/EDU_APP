import { useCallback, useEffect, useRef, useState } from 'react';
import type { ListeningPlaylistItem } from '../types/api';
import {
  DEFAULT_GOAL_SECONDS,
  formatListeningTime,
  loadListeningStats,
  saveListeningMinutes,
} from '../utils/dailyListeningProgress';
import { playAudioSequence, stopAudio } from '../utils/speech';

export interface PodcastTimerReturn {
  isRunning: boolean;
  elapsed: number;
  goalReached: boolean;
  goalSeconds: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  complete: () => void;
  progressPct: number;
  formatTime: (seconds: number) => string;
}

export function usePodcastTimer(): PodcastTimerReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [goalReached, setGoalReached] = useState(false);

  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (elapsed >= DEFAULT_GOAL_SECONDS && isRunning) {
      setGoalReached(true);
      saveListeningMinutes(elapsed);
      setIsRunning(false);
    }
  }, [elapsed, isRunning]);

  const start = () => {
    setGoalReached(false);
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
    saveListeningMinutes(elapsed);
  };

  const reset = () => {
    setIsRunning(false);
    setElapsed(0);
    setGoalReached(false);
  };

  const complete = () => {
    saveListeningMinutes(Math.max(elapsed, DEFAULT_GOAL_SECONDS));
    setGoalReached(true);
    setIsRunning(false);
  };

  return {
    isRunning,
    elapsed,
    goalReached,
    goalSeconds: DEFAULT_GOAL_SECONDS,
    start,
    pause,
    reset,
    complete,
    progressPct: Math.min(100, Math.round((elapsed / DEFAULT_GOAL_SECONDS) * 100)),
    formatTime: formatListeningTime,
  };
}

export interface MinnaListeningPlayerReturn {
  isRunning: boolean;
  isPaused: boolean;
  elapsed: number;
  currentIndex: number;
  goalReached: boolean;
  goalSeconds: number;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  progressPct: number;
  formatTime: (seconds: number) => string;
}

export function useMinnaListeningPlayer(
  playlist: ListeningPlaylistItem[],
): MinnaListeningPlayerReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [goalReached, setGoalReached] = useState(false);

  const activeRef = useRef(false);
  const playlistRef = useRef(playlist);
  playlistRef.current = playlist;
  const elapsedRef = useRef(elapsed);
  elapsedRef.current = elapsed;

  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (elapsed >= DEFAULT_GOAL_SECONDS && isRunning && !goalReached) {
      setGoalReached(true);
      saveListeningMinutes(elapsed);
      stopAudio();
      activeRef.current = false;
      setIsRunning(false);
    }
  }, [elapsed, isRunning, goalReached]);

  const runLoop = useCallback(async () => {
    const items = playlistRef.current;
    if (!items.length) return;

    while (activeRef.current) {
      await playAudioSequence(
        items.map((item) => item.speakText),
        {
          pauseMs: 700,
          rate: 0.85,
          onItem: (index) => setCurrentIndex(index),
          onStop: () => {
            activeRef.current = false;
          },
        },
      );
      if (!activeRef.current) break;
    }

    if (activeRef.current) {
      activeRef.current = false;
      setIsRunning(false);
      setIsPaused(false);
      saveListeningMinutes(elapsedRef.current);
    }
  }, []);

  const startSession = () => {
    if (!playlistRef.current.length) return;
    stopAudio();
    activeRef.current = true;
    setIsRunning(true);
    setIsPaused(false);
    setGoalReached(false);
    setCurrentIndex(0);
    void runLoop();
  };

  const pauseSession = () => {
    stopAudio();
    activeRef.current = false;
    setIsRunning(false);
    setIsPaused(true);
    saveListeningMinutes(elapsed);
  };

  const resumeSession = () => {
    if (!playlistRef.current.length) return;
    activeRef.current = true;
    setIsRunning(true);
    setIsPaused(false);
    void runLoop();
  };

  const stopSession = () => {
    stopAudio();
    activeRef.current = false;
    setIsRunning(false);
    setIsPaused(false);
    saveListeningMinutes(elapsed);
  };

  useEffect(
    () => () => {
      stopAudio();
      activeRef.current = false;
    },
    [],
  );

  return {
    isRunning,
    isPaused,
    elapsed,
    currentIndex,
    goalReached,
    goalSeconds: DEFAULT_GOAL_SECONDS,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    progressPct: Math.min(100, Math.round((elapsed / DEFAULT_GOAL_SECONDS) * 100)),
    formatTime: formatListeningTime,
  };
}

export { loadListeningStats, formatListeningTime };
