import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { playJapanese } from '../../core/utils/speech.util';
import { ReadingStrokesComponent } from '../../shared/reading-strokes/reading-strokes.component';
import {
  resolvePictureVocabImage,
} from '../../core/utils/vocab-image.util';
import type { Lesson, Vocabulary } from '../../core/models/api.models';

type PictureVocab = Vocabulary & {
  lessonNumber?: number;
  resolvedImage: string | null;
};

function mapPictureVocab(list: Vocabulary[], lessonNumber?: number): PictureVocab[] {
  return list.map((v) => ({
    ...v,
    lessonNumber,
    resolvedImage: resolvePictureVocabImage(v),
  }));
}

@Component({
  selector: 'app-picture-dictionary-page',
  standalone: true,
  imports: [ReadingStrokesComponent, RouterLink],
  templateUrl: './picture-dictionary-page.component.html',
  styleUrl: './picture-dictionary-page.component.scss',
})
export class PictureDictionaryPageComponent {
  private readonly api = inject(ApiService);

  readonly mode = signal<'single' | 'range'>('single');
  readonly lesson = signal(1);
  readonly lessonFrom = signal(1);
  readonly lessonTo = signal(50);
  readonly picturesOnly = signal(true);
  readonly search = signal('');
  readonly selected = signal<PictureVocab | null>(null);
  readonly failedImageIds = signal<Set<number>>(new Set());
  readonly lessons = signal<Lesson[]>([]);
  readonly singleList = signal<Vocabulary[]>([]);
  readonly rangeList = signal<PictureVocab[]>([]);
  readonly loadingRange = signal(false);

  readonly maxLesson = computed(() => this.lessons()[this.lessons().length - 1]?.lessonNumber ?? 50);
  readonly rangeLabel = computed(() =>
    this.mode() === 'range'
      ? `Bài ${Math.min(this.lessonFrom(), this.lessonTo())}–${Math.max(this.lessonFrom(), this.lessonTo())}`
      : `Bài ${this.lesson()}`,
  );

  readonly items = computed(() => {
    const raw =
      this.mode() === 'single'
        ? mapPictureVocab(this.singleList(), this.lesson())
        : this.rangeList();

    const withFilter = this.picturesOnly() ? raw.filter((v) => v.resolvedImage) : raw;

    const q = this.search().trim().toLowerCase();
    if (!q) return withFilter;

    return withFilter.filter((v) =>
      [v.kanji, v.kana, v.romaji, v.meaning, v.lessonNumber ? `bài ${v.lessonNumber}` : '']
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  });

  constructor() {
    void this.api.getLessons().then((data) => this.lessons.set(data));

    effect(() => {
      const n = this.lesson();
      if (this.mode() !== 'single') return;
      void this.api.getVocabularies(n).then((list) => this.singleList.set(list));
    });

    effect((onCleanup) => {
      const item = this.selected();
      if (!item?.kana) return;
      const timer = setTimeout(() => playJapanese(item.kana), 200);
      onCleanup(() => clearTimeout(timer));
    });
  }

  setMode(mode: 'single' | 'range'): void {
    this.mode.set(mode);
    this.selected.set(null);
    this.failedImageIds.set(new Set());
    if (mode === 'range' && this.rangeList().length === 0) {
      void this.loadRange(this.lessonFrom(), this.lessonTo());
    }
  }

  openItem(item: PictureVocab): void {
    this.selected.set(item);
  }

  closeModal(): void {
    this.selected.set(null);
  }

  speak(kana: string, event?: Event): void {
    event?.stopPropagation();
    playJapanese(kana);
  }

  onStrokeCharClick(): void {
    const item = this.selected();
    if (item) playJapanese(item.kana);
  }

  loadPreset(from: number, to: number): void {
    this.lessonFrom.set(from);
    this.lessonTo.set(Math.min(to, this.maxLesson()));
    void this.loadRange(from, this.lessonTo());
  }

  setRangeBoundary(boundary: 'from' | 'to', value: number): void {
    if (boundary === 'from') this.lessonFrom.set(value);
    else this.lessonTo.set(value);
    void this.loadRange(this.lessonFrom(), this.lessonTo());
  }

  onImageError(id: number): void {
    this.failedImageIds.update((set) => {
      const next = new Set(set);
      next.add(id);
      return next;
    });
  }

  imageFailed(id: number): boolean {
    return this.failedImageIds().has(id);
  }

  private async loadRange(from: number, to: number): Promise<void> {
    const start = Math.min(from, to);
    const end = Math.max(from, to);
    const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    this.loadingRange.set(true);
    this.failedImageIds.set(new Set());
    try {
      const batches = await Promise.all(numbers.map((n) => this.api.getVocabularies(n)));
      this.rangeList.set(
        batches.flatMap((list, index) => mapPictureVocab(list, numbers[index])),
      );
    } finally {
      this.loadingRange.set(false);
    }
  }
}
