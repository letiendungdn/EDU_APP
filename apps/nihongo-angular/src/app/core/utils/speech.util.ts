export type SpeechLang = 'ja-JP' | 'vi-VN';

export interface PlaySpeechOptions {
  rate?: number;
  forceServer?: boolean;
}

const DEFAULT_RATE: Record<SpeechLang, number> = {
  'ja-JP': 0.9,
  'vi-VN': 1,
};

let playSessionId = 0;
let activeHtmlAudio: HTMLAudioElement | null = null;

function stopHtmlAudio(): void {
  if (!activeHtmlAudio) return;
  activeHtmlAudio.pause();
  activeHtmlAudio.removeAttribute('src');
  activeHtmlAudio.load();
  activeHtmlAudio = null;
}

export function stopSpeech(): void {
  playSessionId += 1;
  stopHtmlAudio();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

async function playServerAudio(text: string, lang: SpeechLang): Promise<void> {
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

function speakWithBrowser(text: string, lang: SpeechLang, rate: number): Promise<void> {
  const sessionId = playSessionId;

  return new Promise((resolve) => {
    if (sessionId !== playSessionId || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

function shouldUseServer(lang: SpeechLang, forceServer: boolean): boolean {
  return forceServer || lang === 'vi-VN';
}

export function playJapanese(text: string): void {
  playSpeech(text, 'ja-JP');
}

export function playSpeech(text: string, lang: SpeechLang, options: PlaySpeechOptions = {}): void {
  const trimmed = text.trim();
  if (!trimmed || typeof window === 'undefined') return;

  stopSpeech();

  const rate = options.rate ?? DEFAULT_RATE[lang];
  const forceServer = options.forceServer ?? lang === 'vi-VN';
  const sessionId = playSessionId;

  void (async () => {
    try {
      if (shouldUseServer(lang, forceServer)) {
        await playServerAudio(trimmed, lang);
        return;
      }
      await speakWithBrowser(trimmed, lang, rate);
    } catch (err) {
      console.warn('[TTS]', err);
      if (sessionId !== playSessionId) return;
      await playServerAudio(trimmed, lang).catch(() => undefined);
    }
  })();
}

export async function playSpeechSequence(
  texts: string[],
  lang: SpeechLang,
  options: PlaySpeechOptions & { pauseMs?: number } = {},
): Promise<void> {
  const items = texts.map((item) => item.trim()).filter(Boolean);
  if (!items.length) return;

  const pauseMs = options.pauseMs ?? 600;
  const rate = options.rate ?? DEFAULT_RATE[lang];
  const forceServer = options.forceServer ?? lang === 'vi-VN';
  const sessionId = ++playSessionId;

  for (const item of items) {
    if (sessionId !== playSessionId) return;

    if (shouldUseServer(lang, forceServer)) {
      await playServerAudio(item, lang);
    } else {
      try {
        await speakWithBrowser(item, lang, rate);
      } catch {
        await playServerAudio(item, lang);
      }
    }

    if (sessionId !== playSessionId) return;
    await new Promise((resolve) => setTimeout(resolve, pauseMs));
  }
}
