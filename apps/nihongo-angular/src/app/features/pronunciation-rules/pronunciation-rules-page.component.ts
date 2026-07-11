import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { playJapanese } from '../../core/utils/speech.util';
import type {
  JapanesePronunciationRulesPayload,
  PronunciationRuleSection,
} from '../../core/models/reference.models';

@Component({
  selector: 'app-pronunciation-rules-page',
  standalone: true,
  templateUrl: './pronunciation-rules-page.component.html',
  styleUrl: './pronunciation-rules-page.component.scss',
})
export class PronunciationRulesPageComponent {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly data = signal<JapanesePronunciationRulesPayload | null>(null);
  readonly openId = signal('');

  constructor() {
    void this.api.getJapanesePronunciationRules().then((payload) => {
      this.data.set(payload);
      this.openId.set(payload.sections[0]?.id ?? '');
      this.loading.set(false);
    });
  }

  toggleSection(section: PronunciationRuleSection): void {
    this.openId.update((id) => (id === section.id ? '' : section.id));
  }

  isOpen(section: PronunciationRuleSection): boolean {
    return this.openId() === section.id;
  }

  speakJapanese(text: string): void {
    playJapanese(text);
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
