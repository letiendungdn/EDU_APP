export function playJapanese(text: string): void {
  if (typeof window === 'undefined' || !text.trim()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = 'ja-JP';
  window.speechSynthesis.speak(utterance);
}
