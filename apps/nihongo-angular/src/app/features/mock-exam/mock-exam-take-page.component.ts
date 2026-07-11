import { Component, computed, effect, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { playJapanese } from '../../core/utils/speech.util';
import {
  formatTimer,
  parseMockExamResult,
  parseMockExamSession,
  saveMockExamResult,
  type MockExamQuestion,
  type MockExamSession,
} from '../../core/utils/mock-exam.util';

@Component({
  selector: 'app-mock-exam-take-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './mock-exam-take-page.component.html',
  styleUrl: './mock-exam-take-page.component.scss',
})
export class MockExamTakePageComponent implements OnDestroy {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private timerId: ReturnType<typeof setInterval> | null = null;
  private submitted = false;

  readonly level = signal('');
  readonly exam = signal<MockExamSession | null>(null);
  readonly error = signal('');
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly currentIndex = signal(0);
  readonly answers = signal<Record<string, string>>({});
  readonly timeLeft = signal(0);
  readonly confirmSubmit = signal(false);

  readonly questions = computed(() => this.exam()?.questions ?? []);
  readonly current = computed(() => {
    const qs = this.questions();
    return qs[this.currentIndex()] ?? null;
  });
  readonly answeredCount = computed(() =>
    Object.values(this.answers()).filter((a) => a?.trim()).length,
  );
  readonly isLowTime = computed(() => this.timeLeft() <= 300);

  constructor() {
    effect(() => {
      const level = this.route.snapshot.paramMap.get('level') ?? '';
      this.level.set(level);
      if (!level) return;
      this.startExam(level);
    });

    effect(() => {
      const session = this.exam();
      if (!session || this.submitting()) return;
      this.startTimer();
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private async startExam(level: string): Promise<void> {
    this.submitted = false;
    this.exam.set(null);
    this.answers.set({});
    this.currentIndex.set(0);
    this.confirmSubmit.set(false);
    this.loading.set(true);
    this.error.set('');

    try {
      const data = await this.api.startMockExam(level);
      const session = parseMockExamSession(data);
      this.exam.set(session);
      this.timeLeft.set(session.durationMinutes * 60);
    } catch {
      this.error.set('Không tạo được đề thi. Hãy thử lại sau.');
    } finally {
      this.loading.set(false);
    }
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerId = setInterval(() => {
      this.timeLeft.update((prev) => {
        if (prev <= 1) {
          this.stopTimer();
          void this.doSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  setAnswer(questionId: string, value: string): void {
    this.answers.update((prev) => ({ ...prev, [questionId]: value }));
  }

  playAudio(text: string): void {
    playJapanese(text);
  }

  typeLabel(q: MockExamQuestion | null): string {
    if (!q) return '';
    if (q.type === 'listening') return 'Nghe';
    if (q.type === 'multiple_choice') return 'Trắc nghiệm';
    return 'Điền từ';
  }

  formatTime(seconds: number): string {
    return formatTimer(seconds);
  }

  isAnswered(questionId: string): boolean {
    return !!this.answers()[questionId]?.trim();
  }

  getAnswer(questionId: string): string {
    return this.answers()[questionId] ?? '';
  }

  goToQuestion(index: number): void {
    this.currentIndex.set(index);
  }

  prevQuestion(): void {
    this.currentIndex.update((i) => Math.max(0, i - 1));
  }

  nextQuestion(): void {
    this.currentIndex.update((i) => Math.min(this.questions().length - 1, i + 1));
  }

  async doSubmit(): Promise<void> {
    const session = this.exam();
    if (!session || this.submitting() || this.submitted) return;
    this.submitted = true;
    this.submitting.set(true);
    this.stopTimer();

    try {
      const data = await this.api.submitMockExam(session.examId, this.answers());
      const result = parseMockExamResult(data);
      saveMockExamResult(result);
      await this.router.navigate(['/mock-exam', this.level(), 'answers']);
    } catch {
      this.error.set('Nộp bài thất bại. Phiên thi có thể đã hết hạn — hãy làm đề mới.');
      this.submitted = false;
    } finally {
      this.submitting.set(false);
    }
  }
}
