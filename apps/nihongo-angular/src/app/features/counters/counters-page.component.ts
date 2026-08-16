import { Component, computed, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { counterHintBullets } from '../../core/utils/counter-hint.util';
import { buildCounterSentenceQuestions } from '../../core/utils/counterSentences';
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
  readonly tab = signal<'learn' | 'drill'>('learn');
  readonly qIndex = signal(0);
  readonly picked = signal<string | null>(null);
  readonly score = signal({ ok: 0, n: 0 });

  readonly category = computed(() => {
    const cats = this.categories();
    const id = this.activeId() || cats[0]?.id || '';
    return cats.find((c) => c.id === id) ?? cats[0] ?? null;
  });

  readonly currentHintBullets = computed(() => {
    const cat = this.category();
    return cat ? counterHintBullets(cat.hint) : [];
  });
  readonly questions = computed(() => {
    const cat = this.category();
    return cat ? buildCounterSentenceQuestions(cat.items) : [];
  });
  readonly currentQ = computed(() => this.questions()[this.qIndex()] ?? null);

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
    this.qIndex.set(0);
    this.picked.set(null);
  }

  grade(opt: string): void {
    const q = this.currentQ();
    if (!q || this.picked()) return;
    this.picked.set(opt);
    this.score.update((s) => ({ ok: s.ok + (opt === q.answer ? 1 : 0), n: s.n + 1 }));
  }

  nextQ(): void {
    this.picked.set(null);
    this.qIndex.update((i) => (i + 1) % Math.max(this.questions().length, 1));
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
