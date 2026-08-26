import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import type {
  KanjiEntry,
  KanjiLesson,
  Lesson,
  Vocabulary,
  VocabularyWithLesson,
} from '../../core/models/api.models';
import { playJapanese } from '../../core/utils/speech.util';
import {
  buildKanjiQuiz,
  toKanjiQuizSource,
  toKanjiQuizSourceFromVocab,
  type KanjiQuizMode,
  type KanjiQuizQuestion,
  type KanjiQuizSource,
} from '../../core/utils/kanji-quiz';

type ScopeMode = 'single' | 'range';
type PoolSource = 'kanji' | 'minna';
type QuizResult = 'correct' | 'wrong' | null;
type Phase = 'setup' | 'quiz';

const KANJI_RANGE_PRESETS = [
  { label: '1–5', from: 1, to: 5 },
  { label: '6–10', from: 6, to: 10 },
  { label: '1–10', from: 1, to: 10 },
];

const MINNA_RANGE_PRESETS = [
  { label: '1–10', from: 1, to: 10 },
  { label: '11–20', from: 11, to: 20 },
  { label: '21–30', from: 21, to: 30 },
  { label: '31–40', from: 31, to: 40 },
  { label: '41–50', from: 41, to: 50 },
];

@Component({
  selector: 'app-kanji-quiz-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './kanji-quiz-page.component.html',
  styleUrl: './kanji-quiz-page.component.scss',
})
export class KanjiQuizPageComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  readonly phase = signal<Phase>('setup');
  readonly poolSource = signal<PoolSource>('kanji');
  readonly mode = signal<KanjiQuizMode>('char-to-meaning');
  readonly scopeMode = signal<ScopeMode>('single');
  readonly lesson = signal(1);
  readonly lessonFrom = signal(1);
  readonly lessonTo = signal(5);
  readonly kanjiLessons = signal<KanjiLesson[]>([]);
  readonly minnaLessons = signal<Lesson[]>([]);
  readonly singleKanji = signal<KanjiEntry[]>([]);
  readonly rangeKanji = signal<Array<KanjiEntry & { lessonNumber: number }>>([]);
  readonly singleVocab = signal<Vocabulary[]>([]);
  readonly rangeVocab = signal<VocabularyWithLesson[]>([]);
  readonly loading = signal(false);
  readonly questions = signal<KanjiQuizQuestion[]>([]);
  readonly index = signal(0);
  readonly selectedAnswer = signal('');
  readonly result = signal<QuizResult>(null);
  readonly scoreCorrect = signal(0);
  readonly scoreTotal = signal(0);
  readonly finished = signal(false);

  readonly lessons = computed(() =>
    this.poolSource() === 'minna' ? this.minnaLessons() : this.kanjiLessons(),
  );
  readonly maxLesson = computed(
    () =>
      this.lessons()[this.lessons().length - 1]?.lessonNumber ??
      (this.poolSource() === 'minna' ? 50 : 10),
  );
  readonly lessonOptions = computed(() =>
    this.lessons()
      .map((l) => l.lessonNumber)
      .filter((n) => n > 0),
  );
  readonly rangePresets = computed(() =>
    (this.poolSource() === 'minna' ? MINNA_RANGE_PRESETS : KANJI_RANGE_PRESETS).filter(
      (preset) => preset.to <= this.maxLesson(),
    ),
  );
  readonly pool = computed((): KanjiQuizSource[] => {
    if (this.poolSource() === 'minna') {
      if (this.scopeMode() === 'single') {
        const n = this.lesson();
        return this.singleVocab()
          .map((item) => toKanjiQuizSourceFromVocab(item, n))
          .filter((item): item is KanjiQuizSource => Boolean(item));
      }
      return this.rangeVocab()
        .map((item) => toKanjiQuizSourceFromVocab(item, item.lessonNumber))
        .filter((item): item is KanjiQuizSource => Boolean(item));
    }
    if (this.scopeMode() === 'single') {
      const n = this.lesson();
      return this.singleKanji()
        .map((entry) => toKanjiQuizSource(entry, n))
        .filter((item): item is KanjiQuizSource => Boolean(item));
    }
    return this.rangeKanji()
      .map((entry) => toKanjiQuizSource(entry, entry.lessonNumber))
      .filter((item): item is KanjiQuizSource => Boolean(item));
  });
  readonly rangeLabel = computed(() =>
    this.scopeMode() === 'range'
      ? `Bài ${Math.min(this.lessonFrom(), this.lessonTo())}–${Math.max(this.lessonFrom(), this.lessonTo())}`
      : `Bài ${this.lesson()}`,
  );
  readonly sourceLabel = computed(() =>
    this.poolSource() === 'minna' ? 'Minna (từ có kanji)' : 'Bài kanji',
  );
  readonly current = computed(() => this.questions()[this.index()] ?? null);
  readonly modeLabel = computed(() => {
    const mode = this.mode();
    if (mode === 'char-to-meaning') return 'Kanji → Nghĩa';
    if (mode === 'meaning-to-char') return 'Nghĩa → Kanji';
    return 'Kanji → Đọc';
  });

  constructor() {
    void this.api.getKanjiLessons().then((data) => this.kanjiLessons.set(data));
    void this.api.getLessons().then((data) => this.minnaLessons.set(data));

    this.route.queryParamMap.subscribe((params) => {
      if (params.get('source') === 'minna') {
        this.setPoolSource('minna');
      }
    });

    effect(() => {
      const source = this.poolSource();
      const scope = this.scopeMode();
      this.loading.set(true);
      if (source === 'minna') {
        if (scope === 'single') {
          const n = this.lesson();
          void this.api.getVocabularies(n).then((list) => {
            this.singleVocab.set(list);
            this.loading.set(false);
          });
          return;
        }
        const from = this.lessonFrom();
        const to = this.lessonTo();
        void this.api.getVocabulariesRange(from, to).then((list) => {
          this.rangeVocab.set(list);
          this.loading.set(false);
        });
        return;
      }
      if (scope === 'single') {
        const n = this.lesson();
        void this.api.getKanjiEntries(n).then((list) => {
          this.singleKanji.set(list);
          this.loading.set(false);
        });
        return;
      }
      const from = this.lessonFrom();
      const to = this.lessonTo();
      void this.api.getKanjiEntriesRange(from, to).then((list) => {
        this.rangeKanji.set(list);
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

  setPoolSource(source: PoolSource): void {
    this.poolSource.set(source);
    this.lesson.set(1);
    this.lessonFrom.set(1);
    this.lessonTo.set(source === 'minna' ? 10 : 5);
    this.resetQuizState();
  }

  setMode(mode: KanjiQuizMode): void {
    this.mode.set(mode);
    this.resetQuizState();
  }

  setScope(scope: ScopeMode): void {
    this.scopeMode.set(scope);
    this.resetQuizState();
  }

  onLessonChange(event: Event): void {
    this.lesson.set(Number((event.target as HTMLSelectElement).value));
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
    const built = buildKanjiQuiz(this.pool(), this.mode(), { optionCount: 4 });
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
    const speak = this.current()?.speak;
    if (!speak) return;
    playJapanese(speak);
  }

  speakOption(event: Event, speak?: string): void {
    event.stopPropagation();
    event.preventDefault();
    if (speak) playJapanese(speak);
  }

  scorePercent(): number {
    const total = this.questions().length;
    if (!total) return 0;
    return Math.round((this.scoreCorrect() / total) * 100);
  }

  optionUsesJapanese(): boolean {
    const mode = this.mode();
    return mode === 'meaning-to-char' || mode === 'char-to-reading';
  }
}
