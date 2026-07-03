import {
  SPEECH_PREFER_LOCAL_VOICE,
  SPEECH_RATE,
  SPEECH_VOICE_PRIORITY,
  type SpeechLangCode,
} from '../config/speech';

export { SPEECH_LANG, SPEECH_RATE, SPEECH_VOICE_PRIORITY } from '../config/speech';
export type { SpeechLangCode } from '../config/speech';

let playSessionId = 0;
let cachedVoices: SpeechSynthesisVoice[] | null = null;
let voicesReadyPromise: Promise<SpeechSynthesisVoice[]> | null = null;

/** Đợi danh sách voice (Chrome/Edge load bất đồng bộ qua voiceschanged). */
export function loadSpeechVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }

  if (cachedVoices?.length) return Promise.resolve(cachedVoices);

  if (!voicesReadyPromise) {
    voicesReadyPromise = new Promise((resolve) => {
      const synth = window.speechSynthesis;

      const capture = () => {
        const voices = synth.getVoices();
        if (voices.length) {
          cachedVoices = voices;
          resolve(voices);
          return true;
        }
        return false;
      };

      if (capture()) return;

      const onChanged = () => {
        if (capture()) synth.removeEventListener('voiceschanged', onChanged);
      };
      synth.addEventListener('voiceschanged', onChanged);

      setTimeout(() => {
        synth.removeEventListener('voiceschanged', onChanged);
        cachedVoices = synth.getVoices();
        resolve(cachedVoices);
      }, 800);
    });
  }

  return voicesReadyPromise;
}

function langPrefix(lang: string): string {
  return lang.toLowerCase().split('-')[0];
}

function isVoiceForLang(voice: SpeechSynthesisVoice, lang: string): boolean {
  const target = lang.toLowerCase();
  const prefix = langPrefix(lang);
  const vl = voice.lang.toLowerCase();
  return vl === target || vl.startsWith(`${prefix}-`) || vl === prefix;
}

function voicesForLang(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice[] {
  return voices.filter((v) => isVoiceForLang(v, lang));
}

function matchVoiceByPriority(
  pool: SpeechSynthesisVoice[],
  priorities: readonly string[],
): SpeechSynthesisVoice | undefined {
  for (const hint of priorities) {
    const exact = pool.find((v) => v.name === hint);
    if (exact) return exact;
  }

  const lowerHints = priorities.map((h) => h.toLowerCase());
  for (const hint of lowerHints) {
    const partial = pool.find((v) => v.name.toLowerCase().includes(hint));
    if (partial) return partial;
  }

  return undefined;
}

/** Chọn voice theo config cố định; không bao giờ fallback sang tiếng Anh. */
export function pickVoiceForLang(
  voices: SpeechSynthesisVoice[],
  lang: string,
): SpeechSynthesisVoice | undefined {
  const langCode = lang as SpeechLangCode;
  const matches = voicesForLang(voices, lang);
  if (!matches.length) return undefined;

  const priorities = SPEECH_VOICE_PRIORITY[langCode] ?? [];
  const fromConfig = matchVoiceByPriority(matches, priorities);
  if (fromConfig) return fromConfig;

  if (SPEECH_PREFER_LOCAL_VOICE) {
    const local = matches.filter((v) => v.localService);
    if (local.length) return local[0];
  }

  const remote = matches.filter((v) => !v.localService);
  if (remote.length) return remote[0];

  return matches[0];
}

export function speechRateForLang(lang: string): number {
  const langCode = lang as SpeechLangCode;
  return SPEECH_RATE[langCode] ?? 0.9;
}

function applySpeechVoice(
  utterance: SpeechSynthesisUtterance,
  voice: SpeechSynthesisVoice | undefined,
  lang: string,
): void {
  utterance.lang = voice?.lang ?? lang;
  if (voice) utterance.voice = voice;
}

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

  void loadSpeechVoices().then((voices) => {
    const voice = pickVoiceForLang(voices, lang);
    if (!voice) {
      console.warn(`[TTS] Không có voice cho "${lang}". Kiểm tra SPEECH_VOICE_PRIORITY trong config/speech.ts`);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    applySpeechVoice(utterance, voice, lang);
    utterance.rate = speechRateForLang(lang);
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  });
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
    rate,
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

  return loadSpeechVoices().then((voices) => {
    const voice = pickVoiceForLang(voices, lang);
    if (!voice) {
      console.warn(`[TTS] Không có voice cho "${lang}". Kiểm tra SPEECH_VOICE_PRIORITY trong config/speech.ts`);
      return Promise.resolve();
    }

    const speechRate = rate ?? speechRateForLang(lang);

    return new Promise<void>((resolve) => {
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
        applySpeechVoice(utterance, voice, lang);
        utterance.rate = speechRate;
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
  });
}
