import { Component, computed, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  type SpeechRecognitionController,
  type SpeechRecognitionLang,
} from '../../core/utils/speech-recognition.util';

@Component({
  selector: 'app-speech-to-text-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './speech-to-text-page.component.html',
  styleUrl: './speech-to-text-page.component.scss',
})
export class SpeechToTextPageComponent implements OnDestroy {
  readonly supported = isSpeechRecognitionSupported();
  readonly lang = signal<SpeechRecognitionLang>('ja-JP');
  readonly listening = signal(false);
  readonly transcript = signal('');
  readonly interim = signal('');
  readonly error = signal('');

  readonly displayText = computed(() => {
    const final = this.transcript();
    const temp = this.interim();
    if (!final) return temp;
    if (!temp) return final;
    return `${final} ${temp}`;
  });

  private controller: SpeechRecognitionController | null = null;

  ngOnDestroy(): void {
    this.controller?.abort();
  }

  setLang(lang: SpeechRecognitionLang): void {
    if (this.listening()) this.stop();
    this.lang.set(lang);
    this.clear();
  }

  start(): void {
    if (!this.supported) {
      this.error.set('Trình duyệt không hỗ trợ nhận dạng giọng nói. Hãy dùng Chrome hoặc Edge.');
      return;
    }

    this.error.set('');
    this.controller?.abort();

    this.controller = createSpeechRecognition(this.lang(), {
      onFinal: (text) => this.transcript.update((prev) => `${prev}${text}`.trimStart()),
      onInterim: (text) => this.interim.set(text),
      onError: (message) => this.error.set(message),
      onListeningChange: (value) => this.listening.set(value),
    });

    this.controller?.start();
  }

  stop(): void {
    this.controller?.stop();
    this.interim.set('');
  }

  clear(): void {
    this.transcript.set('');
    this.interim.set('');
    this.error.set('');
  }

  async copy(): Promise<void> {
    const text = this.displayText().trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }
}
