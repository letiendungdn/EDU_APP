import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { playJapanese } from '../../core/utils/speech.util';
import { StrokeOrderComponent } from '../../shared/stroke-order/stroke-order.component';
import type { KanjiEntry, KanjiLesson } from '../../core/models/api.models';

@Component({
  selector: 'app-kanji-page',
  standalone: true,
  imports: [RouterLink, StrokeOrderComponent],
  templateUrl: './kanji-page.component.html',
  styleUrl: './kanji-page.component.scss',
})
export class KanjiPageComponent {
  private readonly api = inject(ApiService);

  readonly lesson = signal(1);
  readonly index = signal(0);
  readonly flipped = signal(false);
  readonly loading = signal(true);
  readonly searching = signal(false);
  readonly kanjiLessons = signal<KanjiLesson[]>([]);
  readonly kanjiList = signal<KanjiEntry[]>([]);
  readonly searchInput = signal('');
  readonly searchQuery = signal('');
  readonly searchResults = signal<KanjiEntry[]>([]);
  readonly pendingKanjiId = signal<number | null>(null);

  readonly current = computed(() => {
    const list = this.kanjiList();
    if (!list.length) return null;
    return list[this.index() % list.length];
  });

  readonly currentLessonMeta = computed(() =>
    this.kanjiLessons().find((l) => l.lessonNumber === this.lesson()),
  );

  readonly isSearchActive = computed(() => this.searchQuery().trim().length > 0);

  readonly readings = computed(() => {
    const k = this.current();
    if (!k) return '';
    return [k.onyomi, k.kunyomi].filter(Boolean).join(' · ');
  });

  constructor() {
    void this.api.getKanjiLessons().then((lessons) => {
      this.kanjiLessons.set(lessons);
      if (lessons.length && !lessons.some((l) => l.lessonNumber === this.lesson())) {
        this.lesson.set(lessons[0].lessonNumber);
      }
    });

    effect(() => {
      const n = this.lesson();
      this.loading.set(true);
      void this.api.getKanjiEntries(n).then((list) => {
        this.kanjiList.set(list);
        this.loading.set(false);
        this.index.set(0);
        this.flipped.set(false);
      });
    });

    effect(() => {
      const q = this.searchQuery().trim();
      if (!q) {
        this.searchResults.set([]);
        return;
      }
      this.searching.set(true);
      void this.api.searchKanji(q).then((results) => {
        this.searchResults.set(results);
        this.searching.set(false);
      });
    });

    effect(() => {
      const pendingId = this.pendingKanjiId();
      const list = this.kanjiList();
      if (pendingId == null || !list.length) return;
      const idx = list.findIndex((k) => k.id === pendingId);
      if (idx >= 0) {
        this.index.set(idx);
        this.flipped.set(false);
        this.pendingKanjiId.set(null);
      }
    });
  }

  onLessonChange(event: Event): void {
    const n = Number((event.target as HTMLSelectElement).value);
    this.lesson.set(n);
  }

  onSearchInput(event: Event): void {
    this.searchInput.set((event.target as HTMLInputElement).value);
  }

  submitSearch(event: Event): void {
    event.preventDefault();
    this.searchQuery.set(this.searchInput().trim());
  }

  clearSearch(): void {
    this.searchInput.set('');
    this.searchQuery.set('');
  }

  selectSearchResult(entry: KanjiEntry): void {
    const lessonNumber = entry.lesson?.lessonNumber;
    if (!lessonNumber) return;
    this.pendingKanjiId.set(entry.id);
    this.lesson.set(lessonNumber);
    this.clearSearch();
  }

  toggleFlip(): void {
    this.flipped.update((v) => !v);
  }

  next(): void {
    const len = this.kanjiList().length;
    if (!len) return;
    this.flipped.set(false);
    this.index.update((i) => (i + 1) % len);
  }

  prev(): void {
    const len = this.kanjiList().length;
    if (!len) return;
    this.flipped.set(false);
    this.index.update((i) => (i - 1 + len) % len);
  }

  getKanjiReading(kanji: KanjiEntry): string {
    const raw = kanji.onyomi || kanji.kunyomi || kanji.character || '';
    return raw.split(/[,、]/)[0].replace(/-.*/, '').trim();
  }

  speak(text?: string, event?: Event): void {
    event?.stopPropagation();
    const k = this.current();
    if (!k) return;
    playJapanese(text || this.getKanjiReading(k));
  }
}
