import {
  SPEECH_FORCE_SERVER_LANGS,
  SPEECH_PREFER_LOCAL_VOICE,
  SPEECH_RATE,
  SPEECH_VOICE_PRIORITY,
  type SpeechLangCode,
} from '../config/speech';

export {
  SPEECH_FORCE_SERVER_LANGS,
  SPEECH_LANG,
  SPEECH_RATE,
  SPEECH_SERVER_VOICES,
  SPEECH_VOICE_PRIORITY,
} from '../config/speech';
export type { SpeechLangCode } from '../config/speech';

let playSessionId = 0;
let activeHtmlAudio: HTMLAudioElement | null = null;
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

function stopHtmlAudio(): void {
  if (!activeHtmlAudio) return;
  activeHtmlAudio.pause();
  activeHtmlAudio.removeAttribute('src');
  activeHtmlAudio.load();
  activeHtmlAudio = null;
}

function shouldUseServerTts(lang: string, voices: SpeechSynthesisVoice[]): boolean {
  const langCode = lang as SpeechLangCode;
  if (SPEECH_FORCE_SERVER_LANGS.includes(langCode)) return true;
  return !pickVoiceForLang(voices, lang);
}

async function playServerAudio(text: string, lang: string): Promise<void> {
  const sessionId = playSessionId;
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, lang }),
  });

  if (!res.ok) {
    throw new Error(`Server TTS failed (${res.status})`);
  }

  if (sessionId !== playSessionId) return;

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  await new Promise<void>((resolve, reject) => {
    if (sessionId !== playSessionId) {
      URL.revokeObjectURL(url);
      resolve();
      return;
    }

    const audio = new Audio(url);
    activeHtmlAudio = audio;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      if (activeHtmlAudio === audio) activeHtmlAudio = null;
    };

    audio.onended = () => {
      cleanup();
      resolve();
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error('Audio playback failed'));
    };

    void audio.play().catch(reject);
  });
}

async function speakWithBrowser(
  text: string,
  lang: string,
  voice: SpeechSynthesisVoice,
  rate: number,
): Promise<void> {
  const sessionId = playSessionId;

  await new Promise<void>((resolve) => {
    if (sessionId !== playSessionId) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    applySpeechVoice(utterance, voice, lang);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

function applySpeechVoice(
  utterance: SpeechSynthesisUtterance,
  voice: SpeechSynthesisVoice | undefined,
  lang: string,
): void {
  utterance.lang = voice?.lang ?? lang;
  if (voice) utterance.voice = voice;
}

async function speakText(
  text: string,
  lang: string,
  voices: SpeechSynthesisVoice[],
  rate: number,
): Promise<void> {
  if (shouldUseServerTts(lang, voices)) {
    await playServerAudio(text, lang);
    return;
  }

  const voice = pickVoiceForLang(voices, lang);
  if (!voice) {
    await playServerAudio(text, lang);
    return;
  }

  await speakWithBrowser(text, lang, voice, rate);
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
  stopHtmlAudio();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

export const playAudio = (text: string, lang = 'ja-JP'): void => {
  if (!text || typeof window === 'undefined') return;

  stopAudio();

  void loadSpeechVoices()
    .then((voices) => speakText(text, lang, voices, speechRateForLang(lang)))
    .catch((err) => console.warn('[TTS]', err));
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
  if (!items.length || typeof window === 'undefined') {
    return Promise.resolve();
  }

  const sessionId = ++playSessionId;
  let index = 0;
  const speechRate = rate ?? speechRateForLang(lang);

  return loadSpeechVoices().then((voices) => {
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

        void speakText(text, lang, voices, speechRate)
          .catch((err) => console.warn('[TTS]', err))
          .finally(() => {
            if (!isActive()) {
              finish(true);
              return;
            }
            index += 1;
            setTimeout(speakNext, pauseMs);
          });
      };

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      onStart?.();
      speakNext();
    });
  });
}
