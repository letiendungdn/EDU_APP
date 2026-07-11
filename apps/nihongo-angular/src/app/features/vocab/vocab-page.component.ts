import { Component, computed, effect, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { parseReadingVariants, shouldShowKanaStroke } from '../../core/utils/japanese.util';
import { playJapanese } from '../../core/utils/speech.util';
import { LessonSelectorComponent } from '../../shared/lesson-selector/lesson-selector.component';
import { ReadingStrokesComponent } from '../../shared/reading-strokes/reading-strokes.component';
import type { Lesson, Vocabulary } from '../../core/models/api.models';

@Component({
  selector: 'app-vocab-page',
  standalone: true,
  imports: [LessonSelectorComponent, ReadingStrokesComponent],
  templateUrl: './vocab-page.component.html',
  styleUrl: './vocab-page.component.scss',
})
export class VocabPageComponent {
  private readonly api = inject(ApiService);

  readonly lesson = signal(1);
  readonly index = signal(0);
  readonly flipped = signal(false);
  readonly lessons = signal<Lesson[]>([]);
  readonly vocabList = signal<Vocabulary[]>([]);

  readonly current = computed(() => {
    const list = this.vocabList();
    if (!list.length) return null;
    return list[this.index() % list.length];
  });

  readonly hasMultipleReadings = computed(() => {
    const v = this.current();
    if (!v) return false;
    return parseReadingVariants(v.kana, v.romaji).length > 1;
  });

  readonly showDualStroke = computed(() => {
    const v = this.current();
    if (!v) return false;
    return shouldShowKanaStroke(v.kanji, v.kana);
  });

  readonly showKanjiCaption = computed(() => {
    const v = this.current();
    if (!v) return false;
    return !this.hasMultipleReadings() && !this.showDualStroke();
  });

  constructor() {
    void this.api.getLessons().then((data) => this.lessons.set(data));

    effect(() => {
      const n = this.lesson();
      void this.api.getVocabularies(n).then((list) => this.vocabList.set(list));
    });
  }

  onLessonChange(n: number): void {
    this.lesson.set(n);
    this.index.set(0);
    this.flipped.set(false);
  }

  toggleFlip(): void {
    this.flipped.update((v) => !v);
  }

  next(): void {
    const len = this.vocabList().length;
    if (!len) return;
    this.flipped.set(false);
    this.index.update((i) => (i + 1) % len);
  }

  prev(): void {
    const len = this.vocabList().length;
    if (!len) return;
    this.flipped.set(false);
    this.index.update((i) => (i - 1 + len) % len);
  }

  speak(text?: string): void {
    const v = this.current();
    if (v) playJapanese(text ?? v.kana);
  }

  onStrokeCharClick(): void {
    this.speak();
  }
}
