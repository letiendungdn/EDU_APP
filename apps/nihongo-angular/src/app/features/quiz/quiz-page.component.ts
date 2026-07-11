import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import {
  addMistakeWord,
  extractVocabFromExercise,
  parseExerciseOptions,
} from '../../core/utils/mistake-vocab.util';
import { LessonSelectorComponent } from '../../shared/lesson-selector/lesson-selector.component';
import type { Exercise, Lesson } from '../../core/models/api.models';

type QuizResult = 'correct' | 'wrong' | null;

@Component({
  selector: 'app-quiz-page',
  standalone: true,
  imports: [LessonSelectorComponent, RouterLink],
  templateUrl: './quiz-page.component.html',
  styleUrl: './quiz-page.component.scss',
})
export class QuizPageComponent {
  private readonly api = inject(ApiService);

  readonly lesson = signal(1);
  readonly index = signal(0);
  readonly selectedAnswer = signal('');
  readonly fillAnswer = signal('');
  readonly result = signal<QuizResult>(null);
  readonly scoreCorrect = signal(0);
  readonly scoreTotal = signal(0);
  readonly finished = signal(false);
  readonly loading = signal(true);
  readonly lessons = signal<Lesson[]>([]);
  readonly exercises = signal<Exercise[]>([]);

  readonly current = computed(() => {
    const list = this.exercises();
    if (!list.length) return null;
    return list[this.index()];
  });

  readonly options = computed(() => {
    const ex = this.current();
    return ex ? parseExerciseOptions(ex.options) : [];
  });

  constructor() {
    void this.api.getLessons().then((data) => this.lessons.set(data));

    effect(() => {
      const n = this.lesson();
      this.loading.set(true);
      this.index.set(0);
      this.selectedAnswer.set('');
      this.fillAnswer.set('');
      this.result.set(null);
      this.scoreCorrect.set(0);
      this.scoreTotal.set(0);
      this.finished.set(false);
      void this.api.getExercises(n).then((list) => {
        this.exercises.set(list);
        this.loading.set(false);
      });
    });
  }

  onLessonChange(n: number): void {
    this.lesson.set(n);
  }

  onSelectAnswer(option: string): void {
    if (this.result() !== null) return;
    this.selectedAnswer.set(option);
  }

  onFillInput(event: Event): void {
    this.fillAnswer.set((event.target as HTMLInputElement).value);
  }

  onFillKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.submit();
    }
  }

  private normalizeAnswer(text: string): string {
    return text.trim().toLowerCase().replace(/\s+/g, '');
  }

  submit(): void {
    const ex = this.current();
    if (!ex || this.result() !== null) return;

    const userAnswer = ex.type === 'fill_in_blank' ? this.fillAnswer() : this.selectedAnswer();
    if (!userAnswer.trim()) return;

    const isCorrect = this.normalizeAnswer(ex.answer) === this.normalizeAnswer(userAnswer);
    this.result.set(isCorrect ? 'correct' : 'wrong');
    this.scoreCorrect.update((c) => c + (isCorrect ? 1 : 0));
    this.scoreTotal.update((t) => t + 1);

    if (!isCorrect) {
      const vocab = extractVocabFromExercise(ex, this.lesson());
      if (vocab) addMistakeWord(vocab);
    }
  }

  next(): void {
    const list = this.exercises();
    if (this.index() + 1 >= list.length) {
      this.finished.set(true);
      return;
    }
    this.index.update((i) => i + 1);
    this.selectedAnswer.set('');
    this.fillAnswer.set('');
    this.result.set(null);
  }

  retry(): void {
    this.index.set(0);
    this.selectedAnswer.set('');
    this.fillAnswer.set('');
    this.result.set(null);
    this.scoreCorrect.set(0);
    this.scoreTotal.set(0);
    this.finished.set(false);
  }

  scorePercent(): number {
    const total = this.exercises().length;
    if (!total) return 0;
    return Math.round((this.scoreCorrect() / total) * 100);
  }
}
