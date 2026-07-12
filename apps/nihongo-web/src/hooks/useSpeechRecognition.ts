import { useCallback, useEffect, useRef, useState } from 'react';

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

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognitionInstance)
  | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export interface UseSpeechRecognitionOptions {
  lang: SpeechRecognitionLang;
  continuous?: boolean;
}

export interface UseSpeechRecognitionReturn {
  supported: boolean;
  listening: boolean;
  transcript: string;
  interim: string;
  error: string;
  start: () => void;
  stop: () => void;
  clear: () => void;
}

export function useSpeechRecognition({
  lang,
  continuous = true,
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn {
  const [supported] = useState(() => Boolean(getSpeechRecognitionCtor()));
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldRestartRef = useRef(false);

  const stop = useCallback(() => {
    shouldRestartRef.current = false;
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const clear = useCallback(() => {
    setTranscript('');
    setInterim('');
    setError('');
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError('Trình duyệt không hỗ trợ nhận dạng giọng nói. Hãy dùng Chrome hoặc Edge.');
      return;
    }

    setError('');
    shouldRestartRef.current = true;

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionResultEventLike) => {
      let finalChunk = '';
      let interimChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const piece = event.results[i][0]?.transcript ?? '';
        if (event.results[i].isFinal) finalChunk += piece;
        else interimChunk += piece;
      }

      if (finalChunk) {
        setTranscript((prev) => `${prev}${finalChunk}`.trimStart());
      }
      setInterim(interimChunk);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      setError(
        event.error === 'not-allowed'
          ? 'Micro bị chặn. Hãy cho phép quyền ghi âm cho trang web.'
          : `Lỗi nhận dạng: ${event.error}`,
      );
      shouldRestartRef.current = false;
      setListening(false);
    };

    recognition.onend = () => {
      if (shouldRestartRef.current) {
        try {
          recognition.start();
        } catch {
          setListening(false);
        }
        return;
      }
      setListening(false);
      setInterim('');
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setError('Không bật được micro. Thử refresh trang.');
      shouldRestartRef.current = false;
      setListening(false);
    }
  }, [continuous, lang]);

  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!listening) return;
    stop();
    clear();
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    supported,
    listening,
    transcript,
    interim,
    error,
    start,
    stop,
    clear,
  };
}
