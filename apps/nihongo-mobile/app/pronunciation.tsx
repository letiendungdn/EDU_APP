import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

import { speakJapanese, stopSpeaking } from '../src/utils/tts';

function scoreMatch(recognized: string, expected: string): number {
  const r = recognized.trim().replace(/\s/g, '');
  const e = expected.trim().replace(/\s/g, '');
  if (!e) return 0;
  if (r === e) return 1;
  let matches = 0;
  const len = Math.min(r.length, e.length);
  for (let i = 0; i < len; i++) {
    if (r[i] === e[i]) matches += 1;
  }
  return matches / e.length;
}

function scoreFeedback(score: number): string {
  if (score >= 0.9) return 'Xuất sắc!';
  if (score >= 0.7) return 'Tốt lắm!';
  if (score >= 0.5) return 'Khá ổn, luyện thêm nhé!';
  return 'Thử lại nha!';
}

function scoreColor(score: number): string {
  if (score >= 0.8) return '#16a34a';
  if (score >= 0.5) return '#ea580c';
  return '#dc2626';
}

export default function PronunciationScreen() {
  const params = useLocalSearchParams<{ kana?: string; meaning?: string }>();
  const kana = params.kana || 'おはようございます';
  const meaning = params.meaning || 'Chào buổi sáng';

  const [available, setAvailable] = useState(true);
  const [listening, setListening] = useState(false);
  const [recognized, setRecognized] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (cancelled) return;
        if (!perm.granted) {
          setAvailable(false);
          setError('Cần quyền micro / nhận dạng giọng nói để luyện phát âm.');
          return;
        }
        const supported = ExpoSpeechRecognitionModule.isRecognitionAvailable();
        if (!supported) {
          setAvailable(false);
          setError('Thiết bị không hỗ trợ nhận dạng giọng nói.');
        }
      } catch {
        if (!cancelled) {
          setAvailable(false);
          setError('Không khởi tạo được nhận dạng giọng nói (cần dev build).');
        }
      }
    })();
    return () => {
      cancelled = true;
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {
        // ignore
      }
    };
  }, []);

  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('error', (event) => {
    setListening(false);
    if (event.error === 'aborted' || event.error === 'no-speech') return;
    setError(event.message || `Lỗi STT: ${event.error}`);
  });
  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript?.trim() ?? '';
    if (!transcript) return;
    setRecognized(transcript);
    if (event.isFinal) {
      setScore(scoreMatch(transcript, kana));
      setListening(false);
    }
  });

  const startListening = useCallback(async () => {
    if (!available || listening) return;
    setError(null);
    setRecognized('');
    setScore(null);
    try {
      await stopSpeaking();
      ExpoSpeechRecognitionModule.start({
        lang: 'ja-JP',
        interimResults: true,
        continuous: false,
        contextualStrings: [kana],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không bắt đầu được nhận dạng.');
      setListening(false);
    }
  }, [available, listening, kana]);

  const stopListening = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      // ignore
    }
    setListening(false);
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.kana}>{kana}</Text>
        <Text style={styles.meaning}>{meaning}</Text>
        <Pressable style={styles.ttsBtn} onPress={() => speakJapanese(kana)}>
          <Text style={styles.ttsText}>🔊 Nghe mẫu</Text>
        </Pressable>
      </View>

      {!available ? (
        <Text style={styles.error}>{error ?? 'Không hỗ trợ STT.'}</Text>
      ) : (
        <>
          <Pressable
            style={[styles.mic, listening && styles.micActive]}
            onPress={listening ? stopListening : startListening}
          >
            <Text style={styles.micIcon}>{listening ? '⏹' : '🎤'}</Text>
          </Pressable>
          <Text style={styles.hint}>
            {listening ? 'Đang nghe... (bấm để dừng)' : 'Bấm để nói tiếng Nhật'}
          </Text>
        </>
      )}

      {error && available ? <Text style={styles.error}>{error}</Text> : null}

      {recognized ? (
        <View style={styles.result}>
          <Text style={styles.label}>Bạn đọc:</Text>
          <Text style={styles.recognized}>{recognized}</Text>
        </View>
      ) : null}

      {score != null ? (
        <View style={styles.result}>
          <Text style={[styles.score, { color: scoreColor(score) }]}>
            {Math.round(score * 100)}
          </Text>
          <Text style={styles.feedback}>{scoreFeedback(score)}</Text>
          <Pressable style={styles.retry} onPress={startListening}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, backgroundColor: '#f5f3ef', alignItems: 'center' },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  kana: { fontSize: 32, fontWeight: '700', color: '#111827' },
  meaning: { marginTop: 8, fontSize: 16, color: '#6b7280' },
  ttsBtn: {
    marginTop: 16,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ttsText: { color: '#1d4ed8', fontWeight: '600' },
  mic: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micActive: { backgroundColor: '#dc2626' },
  micIcon: { fontSize: 36 },
  hint: { marginTop: 12, color: '#6b7280' },
  label: { color: '#6b7280', marginBottom: 4 },
  recognized: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center' },
  result: { marginTop: 24, alignItems: 'center' },
  score: { fontSize: 40, fontWeight: '800' },
  feedback: { marginTop: 8, fontSize: 16, fontWeight: '600' },
  retry: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  retryText: { fontWeight: '600', color: '#111827' },
  error: { color: '#dc2626', textAlign: 'center', marginTop: 12 },
});
