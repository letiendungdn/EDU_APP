import * as Speech from 'expo-speech';

export async function speakJapanese(text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;
  await Speech.stop();
  Speech.speak(trimmed, {
    language: 'ja-JP',
    rate: 0.9,
    pitch: 1.0,
  });
}

export async function stopSpeaking(): Promise<void> {
  await Speech.stop();
}
