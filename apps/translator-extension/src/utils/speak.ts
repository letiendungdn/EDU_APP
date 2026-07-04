const VOICE_LANG = { vi: 'vi-VN', en: 'en-US', ja: 'ja-JP' } as const;
type Lang = keyof typeof VOICE_LANG;

const DEFAULT_TTS_URL = 'http://localhost:8080/api/tts';

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const capture = () => {
      const voices = synth.getVoices();
      if (voices.length) {
        resolve(voices);
        return true;
      }
      return false;
    };
    if (capture()) return;
    synth.addEventListener('voiceschanged', () => capture(), { once: true });
    setTimeout(() => resolve(synth.getVoices()), 600);
  });
}

function pickVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | undefined {
  const prefix = lang.split('-')[0].toLowerCase();
  return (
    voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(`${prefix}-`)) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix))
  );
}

async function playServerTts(text: string, lang: string): Promise<boolean> {
  const { ttsApiUrl } = await chrome.storage.local.get('ttsApiUrl');
  const url = (ttsApiUrl as string | undefined)?.trim() || DEFAULT_TTS_URL;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang }),
    });
    if (!res.ok) return false;

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    await new Promise<void>((resolve, reject) => {
      const audio = new Audio(objectUrl);
      audio.onended = () => {
        URL.revokeObjectURL(objectUrl);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Audio playback failed'));
      };
      void audio.play().catch(reject);
    });
    return true;
  } catch {
    return false;
  }
}

/** vi/ja → server Edge TTS; en → browser voice nếu có. */
export async function speakText(text: string, lang: Lang): Promise<void> {
  const code = VOICE_LANG[lang];
  window.speechSynthesis.cancel();

  if (lang === 'vi' || lang === 'ja') {
    const ok = await playServerTts(text, code);
    if (ok) return;
  }

  const voices = await loadVoices();
  const voice = pickVoice(voices, code);
  if (!voice && (lang === 'vi' || lang === 'ja')) return;

  await new Promise<void>((resolve) => {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = code;
    if (voice) utt.voice = voice;
    utt.rate = lang === 'ja' ? 0.8 : 0.9;
    utt.onend = () => resolve();
    utt.onerror = () => resolve();
    window.speechSynthesis.speak(utt);
  });
}

export function stopSpeech(): void {
  window.speechSynthesis.cancel();
}
