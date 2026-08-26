import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { addMistakeWord } from '../../core/utils/mistake-vocab.util';
import { playJapanese } from '../../core/utils/speech.util';
import {
  buildVocabQuiz,
  type VocabQuizMode,
  type VocabQuizQuestion,
} from '../../core/utils/vocab-quiz';
import { getVocabExamples } from '../../core/utils/vocab-pattern-example';
import { LessonSelectorComponent } from '../../shared/lesson-selector/lesson-selector.component';
import type { Lesson, Vocabulary, VocabularyWithLesson } from '../../core/models/api.models';

type ScopeMode = 'single' | 'range';
type QuizResult = 'correct' | 'wrong' | null;
type Phase = 'setup' | 'quiz';

const RANGE_PRESETS = [
  { label: '1–10', from: 1, to: 10 },
  { label: '11–20', from: 11, to: 20 },
  { label: '21–30', from: 21, to: 30 },
  { label: '31–40', from: 31, to: 40 },
  { label: '41–50', from: 41, to: 50 },
];

@Component({
  selector: 'app-vocab-quiz-page',
  standalone: true,
  imports: [LessonSelectorComponent, RouterLink],
  templateUrl: './vocab-quiz-page.component.html',
  styleUrl: './vocab-quiz-page.component.scss',
})
export class VocabQuizPageComponent {
  private readonly api = inject(ApiService);

  readonly presets = RANGE_PRESETS;
  readonly phase = signal<Phase>('setup');
  readonly mode = signal<VocabQuizMode>('jp-to-vi');
  readonly scopeMode = signal<ScopeMode>('single');
  readonly lesson = signal(1);
  readonly lessonFrom = signal(1);
  readonly lessonTo = signal(10);
  readonly lessons = signal<Lesson[]>([]);
  readonly singleList = signal<Vocabulary[]>([]);
  readonly rangeList = signal<VocabularyWithLesson[]>([]);
  readonly loading = signal(false);
  readonly questions = signal<VocabQuizQuestion[]>([]);
  readonly index = signal(0);
  readonly selectedAnswer = signal('');
  readonly result = signal<QuizResult>(null);
  readonly scoreCorrect = signal(0);
  readonly scoreTotal = signal(0);
  readonly finished = signal(false);

  readonly maxLesson = computed(
    () => this.lessons()[this.lessons().length - 1]?.lessonNumber ?? 50,
  );
  readonly lessonOptions = computed(() =>
    this.lessons()
      .map((l) => l.lessonNumber)
      .filter((n) => n > 0),
  );
  readonly pool = computed(() => {
    if (this.scopeMode() === 'single') {
      const n = this.lesson();
      return this.singleList().map((item) => ({ ...item, lessonNumber: n }));
    }
    return this.rangeList();
  });
  readonly rangeLabel = computed(() =>
    this.scopeMode() === 'range'
      ? `Bài ${Math.min(this.lessonFrom(), this.lessonTo())}–${Math.max(this.lessonFrom(), this.lessonTo())}`
      : `Bài ${this.lesson()}`,
  );
  readonly current = computed(() => this.questions()[this.index()] ?? null);
  readonly patternExamples = computed(() => {
    const q = this.current();
    if (!q) return [];
    return getVocabExamples({
      kanji: q.kanji,
      kana: q.kana,
      exampleJa: q.exampleJa,
      exampleKana: q.exampleKana,
      exampleVi: q.exampleVi,
    });
  });
  readonly visiblePresets = computed(() =>
    this.presets.filter((preset) => preset.to <= this.maxLesson()),
  );

  constructor() {
    void this.api.getLessons().then((data) => this.lessons.set(data));

    effect(() => {
      const scope = this.scopeMode();
      if (scope === 'single') {
        const n = this.lesson();
        this.loading.set(true);
        void this.api.getVocabularies(n).then((list) => {
          this.singleList.set(list);
          this.loading.set(false);
        });
        return;
      }
      const from = this.lessonFrom();
      const to = this.lessonTo();
      this.loading.set(true);
      void this.api.getVocabulariesRange(from, to).then((list) => {
        this.rangeList.set(list);
        this.loading.set(false);
      });
    });
  }

  private resetQuizState(): void {
    this.phase.set('setup');
    this.questions.set([]);
    this.index.set(0);
    this.selectedAnswer.set('');
    this.result.set(null);
    this.scoreCorrect.set(0);
    this.scoreTotal.set(0);
    this.finished.set(false);
  }

  setMode(mode: VocabQuizMode): void {
    this.mode.set(mode);
    this.resetQuizState();
  }

  setScope(scope: ScopeMode): void {
    this.scopeMode.set(scope);
    this.resetQuizState();
  }

  onLessonChange(n: number): void {
    this.lesson.set(n);
    this.resetQuizState();
  }

  onFromChange(event: Event): void {
    this.lessonFrom.set(Number((event.target as HTMLSelectElement).value));
    this.resetQuizState();
  }

  onToChange(event: Event): void {
    this.lessonTo.set(Number((event.target as HTMLSelectElement).value));
    this.resetQuizState();
  }

  applyPreset(from: number, to: number): void {
    this.lessonFrom.set(from);
    this.lessonTo.set(to);
    this.resetQuizState();
  }

  startQuiz(): void {
    const built = buildVocabQuiz(this.pool(), this.mode(), { optionCount: 4 });
    this.questions.set(built);
    this.index.set(0);
    this.selectedAnswer.set('');
    this.result.set(null);
    this.scoreCorrect.set(0);
    this.scoreTotal.set(0);
    this.finished.set(false);
    this.phase.set('quiz');
  }

  selectAnswer(option: string): void {
    if (this.result() !== null) return;
    this.selectedAnswer.set(option);
  }

  submit(): void {
    const current = this.current();
    if (!current || this.result() !== null || !this.selectedAnswer()) return;
    const isCorrect = this.selectedAnswer() === current.answer;
    this.result.set(isCorrect ? 'correct' : 'wrong');
    this.scoreCorrect.update((c) => c + (isCorrect ? 1 : 0));
    this.scoreTotal.update((t) => t + 1);
    if (!isCorrect) {
      addMistakeWord({
        kana: current.kana,
        kanji: current.kanji,
        meaning: current.meaning,
        lessonNumber: current.lessonNumber ?? this.lesson(),
      });
    }
  }

  next(): void {
    if (this.index() + 1 >= this.questions().length) {
      this.finished.set(true);
      return;
    }
    this.index.update((i) => i + 1);
    this.selectedAnswer.set('');
    this.result.set(null);
  }

  retry(): void {
    this.startQuiz();
  }

  backToSetup(): void {
    this.phase.set('setup');
  }

  speakCurrent(event?: Event): void {
    event?.stopPropagation();
    const kana = this.current()?.kana;
    if (!kana) return;
    playJapanese(kana);
  }

  speakJapaneseOption(event: Event, option: string): void {
    event.stopPropagation();
    event.preventDefault();
    const kanaMatch = option.match(/（([^）]+)）/);
    playJapanese(kanaMatch?.[1]?.trim() || option);
  }

  speakExample(event: Event, speak: string): void {
    event.stopPropagation();
    event.preventDefault();
    playJapanese(speak);
  }

  scorePercent(): number {
    const total = this.questions().length;
    if (!total) return 0;
    return Math.round((this.scoreCorrect() / total) * 100);
  }
}
