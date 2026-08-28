import { Component, computed, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { playJapanese } from '../../core/utils/speech.util';
import { StrokeOrderComponent } from '../../shared/stroke-order/stroke-order.component';
import type { KanaCell, KanaSection } from '../../core/models/reference.models';

type KanaTab = 'hiragana' | 'katakana' | 'both';

export interface KanaPairCell {
  hiragana: string;
  katakana: string;
  romaji: string;
}

export interface KanaPairSection {
  id: string;
  title: string;
  subtitle?: string;
  columns?: number;
  rows: KanaPairCell[][];
}

function pairKanaSections(
  hiragana: KanaSection[],
  katakana: KanaSection[],
): KanaPairSection[] {
  return hiragana.map((hs, sectionIndex) => {
    const ks = katakana.find((s) => s.id === hs.id) ?? katakana[sectionIndex];
    return {
      id: hs.id,
      title: hs.title,
      subtitle: hs.subtitle,
      columns: hs.columns,
      rows: hs.rows.map((row, ri) =>
        row.map((cell, ci) => {
          const kata = ks?.rows[ri]?.[ci];
          return {
            hiragana: cell.kana ?? '',
            katakana: kata?.kana ?? '',
            romaji: cell.romaji || kata?.romaji || '',
          };
        }),
      ),
    };
  });
}

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
    this.activeTab() === 'hiragana'
      ? this.hiraganaSections()
      : this.activeTab() === 'katakana'
        ? this.katakanaSections()
        : [],
  );

  readonly pairedSections = computed(() =>
    pairKanaSections(this.hiraganaSections(), this.katakanaSections()),
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

  onCharClick(item: KanaCell | string): void {
    const kana = typeof item === 'string' ? item : item.kana;
    if (!kana) return;
    this.selectedKana.set(kana);
    if (this.playAudioEnabled()) {
      playJapanese(kana);
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

  pairCellSelected(cell: KanaPairCell): boolean {
    const selected = this.selectedKana();
    return !!selected && (selected === cell.hiragana || selected === cell.katakana);
  }
}
