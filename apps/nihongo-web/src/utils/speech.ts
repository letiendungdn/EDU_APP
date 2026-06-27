let playSessionId = 0;

/** Chuỗi tiếng Nhật cho TTS (bỏ khoảng trắng thừa). */
export function speechTextFromJapanese(jp: string): string {
  return jp.replace(/\s+/g, '').replace(/…/g, '');
}

export const stopAudio = (): void => {
  playSessionId += 1;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

export const playAudio = (text: string, lang = 'ja-JP'): void => {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported in this browser.');
    }
    return;
  }

  stopAudio();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
};

export interface PlayAudioSequenceOptions {
  lang?: string;
  rate?: number;
  pauseMs?: number;
  onStart?: () => void;
  onItem?: (index: number, text: string) => void;
  onEnd?: () => void;
  onStop?: () => void;
}

export function playAudioSequence(
  texts: string[],
  options: PlayAudioSequenceOptions = {},
): Promise<void> {
  const {
    lang = 'ja-JP',
    rate = 0.9,
    pauseMs = 450,
    onStart,
    onItem,
    onEnd,
    onStop,
  } = options;

  const items = texts.filter(Boolean);
  if (
    !items.length ||
    typeof window === 'undefined' ||
    !('speechSynthesis' in window)
  ) {
    return Promise.resolve();
  }

  const sessionId = ++playSessionId;
  let index = 0;

  return new Promise((resolve) => {
    const finish = (stopped = false) => {
      if (stopped) onStop?.();
      else onEnd?.();
      resolve();
    };

    const isActive = () => sessionId === playSessionId;

    const speakNext = () => {
      if (!isActive()) {
        finish(true);
        return;
      }

      if (index >= items.length) {
        finish(false);
        return;
      }

      const text = items[index];
      onItem?.(index, text);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        index += 1;
        setTimeout(speakNext, pauseMs);
      };

      utterance.onerror = () => {
        index += 1;
        setTimeout(speakNext, pauseMs);
      };

      window.speechSynthesis.speak(utterance);
    };

    window.speechSynthesis.cancel();
    onStart?.();
    speakNext();
  });
}
