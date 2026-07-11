import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { playJapanese } from '../../core/utils/speech.util';
import type {
  EnglishKatakanaPayload,
  EnglishKatakanaSection,
} from '../../core/models/reference.models';

@Component({
  selector: 'app-english-katakana-page',
  standalone: true,
  templateUrl: './english-katakana-page.component.html',
  styleUrl: './english-katakana-page.component.scss',
})
export class EnglishKatakanaPageComponent {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly data = signal<EnglishKatakanaPayload | null>(null);
  readonly openId = signal('');

  constructor() {
    void this.api.getEnglishKatakana().then((payload) => {
      this.data.set(payload);
      this.openId.set(payload.sections[0]?.id ?? '');
      this.loading.set(false);
    });
  }

  toggleSection(section: EnglishKatakanaSection): void {
    this.openId.update((id) => (id === section.id ? '' : section.id));
  }

  isOpen(section: EnglishKatakanaSection): boolean {
    return this.openId() === section.id;
  }

  speakJapanese(text: string): void {
    playJapanese(text);
  }

  speakEnglish(text: string): void {
    const trimmed = text.trim();
    if (!trimmed || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }

  speakVietnamese(text: string): void {
    const trimmed = text.trim();
    if (!trimmed || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = 'vi-VN';
    window.speechSynthesis.speak(utterance);
  }
}
