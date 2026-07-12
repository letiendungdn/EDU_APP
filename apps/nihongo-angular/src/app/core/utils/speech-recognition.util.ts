export type SpeechRecognitionLang = 'ja-JP' | 'vi-VN';

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0?: { transcript?: string };
};

type SpeechRecognitionResultEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionInstance) | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function isSpeechRecognitionSupported(): boolean {
  return Boolean(getSpeechRecognitionCtor());
}

export interface SpeechRecognitionController {
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export interface SpeechRecognitionHandlers {
  onFinal: (text: string) => void;
  onInterim: (text: string) => void;
  onError: (message: string) => void;
  onListeningChange: (listening: boolean) => void;
}

export function createSpeechRecognition(
  lang: SpeechRecognitionLang,
  handlers: SpeechRecognitionHandlers,
): SpeechRecognitionController | null {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) return null;

  let shouldRestart = false;
  const recognition = new Ctor();
  recognition.lang = lang;
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event: SpeechRecognitionResultEventLike) => {
    let finalChunk = '';
    let interimChunk = '';

    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const piece = event.results[i][0]?.transcript ?? '';
      if (event.results[i].isFinal) finalChunk += piece;
      else interimChunk += piece;
    }

    if (finalChunk) handlers.onFinal(finalChunk);
    handlers.onInterim(interimChunk);
  };

  recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
    if (event.error === 'aborted' || event.error === 'no-speech') return;
    handlers.onError(
      event.error === 'not-allowed'
        ? 'Micro bị chặn. Hãy cho phép quyền ghi âm cho trang web.'
        : `Lỗi nhận dạng: ${event.error}`,
    );
    shouldRestart = false;
    handlers.onListeningChange(false);
  };

  recognition.onend = () => {
    if (shouldRestart) {
      try {
        recognition.start();
      } catch {
        handlers.onListeningChange(false);
      }
      return;
    }
    handlers.onListeningChange(false);
    handlers.onInterim('');
  };

  return {
    start: () => {
      shouldRestart = true;
      try {
        recognition.start();
        handlers.onListeningChange(true);
      } catch {
        handlers.onError('Không bật được micro. Thử refresh trang.');
        shouldRestart = false;
        handlers.onListeningChange(false);
      }
    },
    stop: () => {
      shouldRestart = false;
      recognition.stop();
      handlers.onListeningChange(false);
    },
    abort: () => {
      shouldRestart = false;
      recognition.abort();
      handlers.onListeningChange(false);
    },
  };
}
