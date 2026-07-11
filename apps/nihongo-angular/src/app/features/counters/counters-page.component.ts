import { Component, computed, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { counterHintBullets } from '../../core/utils/counter-hint.util';
import { playJapanese } from '../../core/utils/speech.util';
import type { CounterCategory, JapaneseCountersPayload } from '../../core/models/reference.models';

@Component({
  selector: 'app-counters-page',
  standalone: true,
  imports: [],
  templateUrl: './counters-page.component.html',
  styleUrl: './counters-page.component.scss',
})
export class CountersPageComponent {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly categories = signal<CounterCategory[]>([]);
  readonly activeId = signal('');
  readonly playingAll = signal(false);

  readonly category = computed(() => {
    const cats = this.categories();
    const id = this.activeId() || cats[0]?.id || '';
    return cats.find((c) => c.id === id) ?? cats[0] ?? null;
  });

  readonly currentHintBullets = computed(() => {
    const cat = this.category();
    return cat ? counterHintBullets(cat.hint) : [];
  });

  constructor() {
    void this.api.getJapaneseCounters().then((data: JapaneseCountersPayload) => {
      this.categories.set(data.categories);
      this.activeId.set(data.categories[0]?.id ?? '');
      this.loading.set(false);
    });
  }

  setCategory(id: string): void {
    this.playingAll.set(false);
    this.activeId.set(id);
  }

  speak(kana: string, event?: Event): void {
    event?.stopPropagation();
    playJapanese(kana);
  }

  async playAll(): Promise<void> {
    const cat = this.category();
    if (!cat || this.playingAll()) return;

    this.playingAll.set(true);
    try {
      for (const item of cat.items) {
        playJapanese(item.kana);
        await new Promise((resolve) => window.setTimeout(resolve, 900));
      }
    } finally {
      this.playingAll.set(false);
    }
  }
}
