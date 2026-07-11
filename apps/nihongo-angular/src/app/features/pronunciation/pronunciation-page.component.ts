import { Component, effect, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { playJapanese } from '../../core/utils/speech.util';
import { LessonSelectorComponent } from '../../shared/lesson-selector/lesson-selector.component';
import type { Lesson, Vocabulary } from '../../core/models/api.models';

@Component({
  selector: 'app-pronunciation-page',
  standalone: true,
  imports: [LessonSelectorComponent],
  templateUrl: './pronunciation-page.component.html',
  styleUrl: './pronunciation-page.component.scss',
})
export class PronunciationPageComponent {
  private readonly api = inject(ApiService);

  readonly lesson = signal(1);
  readonly lessons = signal<Lesson[]>([]);
  readonly vocabList = signal<Vocabulary[]>([]);
  readonly loading = signal(false);

  constructor() {
    void this.api.getLessons().then((data) => this.lessons.set(data));

    effect(() => {
      const n = this.lesson();
      this.loading.set(true);
      void this.api.getVocabularies(n).then((list) => {
        this.vocabList.set(list);
        this.loading.set(false);
      });
    });
  }

  onLessonChange(n: number): void {
    this.lesson.set(n);
  }

  speak(kana: string, event: Event): void {
    event.stopPropagation();
    playJapanese(kana);
  }
}
