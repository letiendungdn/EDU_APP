import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import {
  playSpeechSequence,
  stopSpeech,
  type SpeechLang,
} from '../../core/utils/speech.util';

const MAX_CHARS = 5000;

interface KanaRomajiLookup {
  text: string;
  kana: string;
  romaji: string;
  kanji: string | null;
  meaning: string | null;
}

const EXAMPLES: Record<SpeechLang, readonly string[]> = {
  'ja-JP': [
    'こんにちは、元気ですか。',
    'ありがとうございます。',
    'すみません、もう一度お願いします。',
    '日本語を勉強しています。',
  ],
  'vi-VN': [
    'Xin chào, hôm nay bạn thế nào?',
    'Cảm ơn bạn rất nhiều.',
    'Tôi đang học tiếng Nhật.',
    'Ý nghĩa: N1 là N2.',
  ],
};

@Component({
  selector: 'app-text-to-speech-page',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './text-to-speech-page.component.html',
  styleUrl: './text-to-speech-page.component.scss',
})
export class TextToSpeechPageComponent {
  readonly maxChars = MAX_CHARS;
  readonly examples = EXAMPLES;

  readonly text = signal('');
  readonly lang = signal<SpeechLang>('ja-JP');
  readonly rate = signal(0.9);
  readonly forceServer = signal(false);
  readonly playing = signal(false);
  readonly reading = signal<KanaRomajiLookup | null>(null);

  readonly trimmed = computed(() => this.text().trim());
  readonly charCount = computed(() => this.text().length);
  readonly overLimit = computed(() => this.charCount() > MAX_CHARS);
  readonly canPlay = computed(() => this.trimmed().length > 0 && !this.overLimit());

  readonly speakLabel = computed(() => {
    if (this.lang() === 'vi-VN') return 'HoaiMy (server)';
    return this.forceServer() ? 'Nanami (server)' : 'Trình duyệt / server';
  });

  private lookupTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly api: ApiService) {
    effect(() => {
      const lang = this.lang();
      this.forceServer.set(lang === 'vi-VN');
      this.rate.set(lang === 'ja-JP' ? 0.9 : 1);
    });

    effect(() => {
      const lang = this.lang();
      const query = this.trimmed();

      if (this.lookupTimer) {
        clearTimeout(this.lookupTimer);
        this.lookupTimer = null;
      }

      if (lang !== 'ja-JP' || !query) {
        this.reading.set(null);
        return;
      }

      this.lookupTimer = setTimeout(() => {
        void this.api.fetchKanaRomajiLookup(query).then(
          (result) => this.reading.set(result),
          () => this.reading.set(null),
        );
      }, 350);
    });
  }

  setLang(lang: SpeechLang): void {
    this.lang.set(lang);
  }

  setText(value: string): void {
    this.text.set(value);
  }

  setRate(value: number): void {
    this.rate.set(value);
  }

  setForceServer(checked: boolean): void {
    this.forceServer.set(checked);
  }

  useExample(example: string): void {
    this.text.set(example);
  }

  play(): void {
    if (!this.canPlay()) return;

    this.playing.set(true);
    stopSpeech();

    const paragraphs = this.trimmed()
      .split(/\n{2,}/)
      .map((part) => part.replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    void playSpeechSequence(paragraphs.length ? paragraphs : [this.trimmed()], this.lang(), {
      rate: this.rate(),
      forceServer: this.forceServer(),
      pauseMs: 600,
    }).finally(() => this.playing.set(false));
  }

  stop(): void {
    stopSpeech();
    this.playing.set(false);
  }
}
