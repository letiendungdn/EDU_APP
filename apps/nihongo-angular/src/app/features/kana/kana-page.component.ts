import { Component, computed, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { playJapanese } from '../../core/utils/speech.util';
import { StrokeOrderComponent } from '../../shared/stroke-order/stroke-order.component';
import type { KanaCell, KanaSection } from '../../core/models/reference.models';

type KanaTab = 'hiragana' | 'katakana';

@Component({
  selector: 'app-kana-page',
  standalone: true,
  imports: [StrokeOrderComponent],
  templateUrl: './kana-page.component.html',
  styleUrl: './kana-page.component.scss',
})
export class KanaPageComponent {
  private readonly api = inject(ApiService);

  readonly activeTab = signal<KanaTab>('hiragana');
  readonly playAudioEnabled = signal(true);
  readonly selectedKana = signal<string | null>(null);
  readonly loading = signal(true);
  readonly hiraganaSections = signal<KanaSection[]>([]);
  readonly katakanaSections = signal<KanaSection[]>([]);

  readonly currentSections = computed(() =>
    this.activeTab() === 'hiragana' ? this.hiraganaSections() : this.katakanaSections(),
  );

  constructor() {
    void this.api.getKanaCharts().then((data) => {
      this.hiraganaSections.set(data.hiraganaSections);
      this.katakanaSections.set(data.katakanaSections);
      this.loading.set(false);
    });
  }

  setTab(tab: KanaTab): void {
    this.activeTab.set(tab);
    this.selectedKana.set(null);
  }

  onCharClick(item: KanaCell): void {
    if (!item.kana) return;
    this.selectedKana.set(item.kana);
    if (this.playAudioEnabled()) {
      playJapanese(item.kana);
    }
  }

  playSelected(): void {
    const kana = this.selectedKana();
    if (kana) playJapanese(kana);
  }

  togglePlayAudio(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.playAudioEnabled.set(target.checked);
  }
}
