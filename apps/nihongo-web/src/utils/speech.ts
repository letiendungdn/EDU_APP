let playSessionId = 0;

const GRAMMAR_N_SAMPLES = ['わたし', 'がくせい', 'せんせい', 'にほんじん', 'ともだち'];
const GRAMMAR_V_SAMPLES = ['いきます', 'たべます', 'のみます', 'みます', 'よみます'];

/** Chuỗi tiếng Nhật cho TTS (bỏ khoảng trắng thừa). */
export function speechTextFromJapanese(jp: string): string {
  return jp.replace(/\s+/g, '').replace(/…/g, '');
}

/**
 * Chuyển mẫu ngữ pháp (N1, N2, V1…) thành câu Nhật có thể đọc được bằng TTS.
 */
export function speechTextFromGrammarPattern(pattern: string): string {
  if (!pattern) return '';

  let text = pattern
    .replace(/<[^>]*>/g, '')
    .replace(/N(\d+)/gi, (_, n) => {
      const idx = Math.max(0, Number(n) - 1);
      return GRAMMAR_N_SAMPLES[idx % GRAMMAR_N_SAMPLES.length] ?? 'なに';
    })
    .replace(/V(\d+)/gi, (_, n) => {
      const idx = Math.max(0, Number(n) - 1);
      return GRAMMAR_V_SAMPLES[idx % GRAMMAR_V_SAMPLES.length] ?? 'します';
    })
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/[／/]/g, '');

  return speechTextFromJapanese(text);
}

/** Các đoạn tiếng Nhật cần đọc cho một mục ngữ pháp (mẫu + ví dụ). */
export function grammarSpeechSegments(pattern: string, examples: { jp: string }[] = []): string[] {
  const segments: string[] = [];
  const patternSpeech = speechTextFromGrammarPattern(pattern);
  if (patternSpeech) segments.push(patternSpeech);

  for (const ex of examples) {
    const line = speechTextFromJapanese(ex.jp);
    if (line && !segments.includes(line)) segments.push(line);
  }

  return segments;
}

function cleanViForSpeech(text: string): string {
  return text
    .replace(/[–—•·]/g, ', ')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Văn bản tiếng Việt: ý nghĩa + giải thích (+ chú ý trong explanation). */
export function grammarExplanationSpeechText(grammar: {
  meaning: string;
  explanation?: string | null;
}): string {
  const parts: string[] = [];

  if (grammar.meaning?.trim()) {
    parts.push(`Ý nghĩa: ${grammar.meaning.trim()}`);
  }
  if (grammar.explanation?.trim()) {
    parts.push(`Giải thích: ${cleanViForSpeech(grammar.explanation)}`);
  }

  return parts.join('. ');
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
