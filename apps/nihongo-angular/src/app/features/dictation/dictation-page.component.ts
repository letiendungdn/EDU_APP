import { Component, effect, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { playJapanese } from '../../core/utils/speech.util';
import { LessonSelectorComponent } from '../../shared/lesson-selector/lesson-selector.component';
import type { DictationVocab, Lesson } from '../../core/models/api.models';

function normalizeAnswer(value: string): string {
  return value.trim().replace(/\s+/g, '');
}

@Component({
  selector: 'app-dictation-page',
  standalone: true,
  imports: [LessonSelectorComponent],
  templateUrl: './dictation-page.component.html',
  styleUrl: './dictation-page.component.scss',
})
export class DictationPageComponent {
  private readonly api = inject(ApiService);

  readonly lesson = signal(1);
  readonly lessons = signal<Lesson[]>([]);
  readonly queue = signal<DictationVocab[]>([]);
  readonly index = signal(0);
  readonly input = signal('');
  readonly feedback = signal<'correct' | 'wrong' | null>(null);
  readonly score = signal({ correct: 0, total: 0 });
  readonly revealed = signal(false);
  readonly loading = signal(false);

  readonly current = signal<DictationVocab | null>(null);
  readonly isDone = signal(false);

  constructor() {
    void this.api.getLessons().then((data) => this.lessons.set(data));

    effect(() => {
      const q = this.queue();
      const i = this.index();
      this.current.set(i < q.length ? q[i] : null);
      this.isDone.set(q.length > 0 && i >= q.length);
    });
  }

  onLessonChange(n: number): void {
    this.lesson.set(n);
  }

  async startSession(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.api.getDictationVocab(this.lesson(), 20);
      if (!data.length) return;
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      this.queue.set(shuffled);
      this.index.set(0);
      this.score.set({ correct: 0, total: 0 });
      this.input.set('');
      this.feedback.set(null);
      this.revealed.set(false);
      setTimeout(() => playJapanese(shuffled[0].kana), 300);
    } finally {
      this.loading.set(false);
    }
  }

  replay(): void {
    const w = this.current();
    if (w) playJapanese(w.kana);
  }

  check(): void {
    const w = this.current();
    if (!w || this.feedback()) return;
    const expected = normalizeAnswer(w.kana);
    const alt = w.kanji ? normalizeAnswer(w.kanji) : '';
    const given = normalizeAnswer(this.input());
    const correct = given === expected || (alt !== '' && given === alt);
    this.feedback.set(correct ? 'correct' : 'wrong');
    this.score.update((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }));
    void this.api.recordDictationAttempt(w.id, this.input(), correct);
  }

  next(): void {
    const q = this.queue();
    const i = this.index();
    if (i + 1 >= q.length) {
      this.index.set(q.length);
      return;
    }
    this.index.set(i + 1);
    this.input.set('');
    this.feedback.set(null);
    this.revealed.set(false);
    setTimeout(() => playJapanese(q[i + 1].kana), 100);
  }

  onEnter(): void {
    if (this.feedback()) this.next();
    else this.check();
  }

  resetSession(): void {
    this.queue.set([]);
    this.index.set(0);
    this.current.set(null);
    this.isDone.set(false);
  }

  scorePercent(): number {
    const s = this.score();
    return s.total ? Math.round((s.correct / s.total) * 100) : 0;
  }
}
