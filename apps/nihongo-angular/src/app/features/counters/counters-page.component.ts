import { Component, computed, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { counterStrokeDims, getStrokeText } from '../../core/utils/japanese.util';
import { playJapanese } from '../../core/utils/speech.util';
import { StrokeOrderComponent } from '../../shared/stroke-order/stroke-order.component';
import type { CounterCategory, CounterItem, JapaneseCountersPayload } from '../../core/models/reference.models';

function getWritableText(item: CounterItem): string | null {
  const kanjiText = item.kanji ? getStrokeText(item.kanji) : '';
  if (kanjiText) return kanjiText;
  const kanaText = getStrokeText(item.kana);
  return kanaText || null;
}

@Component({
  selector: 'app-counters-page',
  standalone: true,
  imports: [StrokeOrderComponent],
  templateUrl: './counters-page.component.html',
  styleUrl: './counters-page.component.scss',
})
export class CountersPageComponent {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly categories = signal<CounterCategory[]>([]);
  readonly activeId = signal('');

  readonly getWritableText = getWritableText;
  readonly counterStrokeDims = counterStrokeDims;

  readonly category = computed(() => {
    const cats = this.categories();
    const id = this.activeId() || cats[0]?.id || '';
    return cats.find((c) => c.id === id) ?? cats[0] ?? null;
  });

  constructor() {
    void this.api.getJapaneseCounters().then((data: JapaneseCountersPayload) => {
      this.categories.set(data.categories);
      this.activeId.set(data.categories[0]?.id ?? '');
      this.loading.set(false);
    });
  }

  setCategory(id: string): void {
    this.activeId.set(id);
  }

  speak(kana: string): void {
    playJapanese(kana);
  }
}
