import { Component, computed, effect, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { playJapanese } from '../../core/utils/speech.util';
import { LessonSelectorComponent } from '../../shared/lesson-selector/lesson-selector.component';
import type { Grammar, Lesson } from '../../core/models/api.models';

@Component({
  selector: 'app-grammar-page',
  standalone: true,
  imports: [LessonSelectorComponent],
  templateUrl: './grammar-page.component.html',
  styleUrl: './grammar-page.component.scss',
})
export class GrammarPageComponent {
  private readonly api = inject(ApiService);

  readonly lesson = signal(1);
  readonly lessons = signal<Lesson[]>([]);
  readonly grammars = signal<Grammar[]>([]);

  readonly hasData = computed(() => this.grammars().length > 0);

  constructor() {
    void this.api.getLessons().then((data) => this.lessons.set(data));

    effect(() => {
      const n = this.lesson();
      void this.api.getGrammars(n).then((list) => this.grammars.set(list));
    });
  }

  onLessonChange(n: number): void {
    this.lesson.set(n);
  }

  speak(text: string, event: Event): void {
    event.stopPropagation();
    playJapanese(text);
  }
}
