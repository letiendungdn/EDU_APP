import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import type { KanaChartsPayload } from '../../core/models/reference.models';
import { playJapanese } from '../../core/utils/speech.util';
import {
  buildKanaQuiz,
  kanaSourcesFromCharts,
  type KanaQuizMode,
  type KanaQuizQuestion,
  type KanaScriptFilter,
} from '../../core/utils/kana-quiz';

type QuizResult = 'correct' | 'wrong' | null;
type Phase = 'setup' | 'quiz';

const SECTION_OPTIONS = [
  { id: 'gojuon', label: '清音' },
  { id: 'dakuon', label: '濁音' },
  { id: 'handakuon', label: '半濁音' },
  { id: 'yoon', label: '拗音' },
] as const;

@Component({
  selector: 'app-kana-quiz-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './kana-quiz-page.component.html',
  styleUrl: './kana-quiz-page.component.scss',
})
export class KanaQuizPageComponent {
  private readonly api = inject(ApiService);

  readonly sectionOptions = SECTION_OPTIONS;
  readonly phase = signal<Phase>('setup');
  readonly mode = signal<KanaQuizMode>('char-to-romaji');
  readonly script = signal<KanaScriptFilter>('hiragana');
  readonly sectionIds = signal<string[]>(['gojuon']);
  readonly charts = signal<KanaChartsPayload | null>(null);
  readonly loading = signal(true);
  readonly questions = signal<KanaQuizQuestion[]>([]);
  readonly index = signal(0);
  readonly selectedAnswer = signal('');
  readonly result = signal<QuizResult>(null);
  readonly scoreCorrect = signal(0);
  readonly scoreTotal = signal(0);
  readonly finished = signal(false);

  readonly pool = computed(() => {
    const ids = this.sectionIds();
    return kanaSourcesFromCharts(
      this.charts(),
      this.script(),
      ids.length ? ids : 'all',
    );
  });

  readonly scopeLabel = computed(() => {
    const script = this.script();
    const scriptLabel =
      script === 'both' ? 'Hira + Kata' : script === 'hiragana' ? 'Hiragana' : 'Katakana';
    const ids = this.sectionIds();
    const sectionLabel =
      ids.length === SECTION_OPTIONS.length || ids.length === 0
        ? 'tất cả'
        : ids
            .map((id) => SECTION_OPTIONS.find((s) => s.id === id)?.label ?? id)
            .join(', ');
    return `${scriptLabel} · ${sectionLabel}`;
  });

  readonly current = computed(() => this.questions()[this.index()] ?? null);

  constructor() {
    void this.api.getKanaCharts().then((data) => {
      this.charts.set(data);
      this.loading.set(false);
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

  setMode(mode: KanaQuizMode): void {
    this.mode.set(mode);
    this.resetQuizState();
  }

  setScript(script: KanaScriptFilter): void {
    this.script.set(script);
    this.resetQuizState();
  }

  toggleSection(id: string): void {
    const prev = this.sectionIds();
    if (prev.includes(id)) {
      const next = prev.filter((item) => item !== id);
      if (!next.length) return;
      this.sectionIds.set(next);
    } else {
      this.sectionIds.set([...prev, id]);
    }
    this.resetQuizState();
  }

  selectAllSections(): void {
    this.sectionIds.set(SECTION_OPTIONS.map((s) => s.id));
    this.resetQuizState();
  }

  startQuiz(): void {
    const built = buildKanaQuiz(this.pool(), this.mode(), { optionCount: 4 });
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
    const kana = this.current()?.kana;
    if (!kana) return;
    playJapanese(kana);
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
}
