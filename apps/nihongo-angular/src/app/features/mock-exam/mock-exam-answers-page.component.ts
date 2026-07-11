import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { playJapanese } from '../../core/utils/speech.util';
import {
  clearMockExamResult,
  loadMockExamResult,
  type MockExamResult,
  type MockExamReviewItem,
} from '../../core/utils/mock-exam.util';

type ReviewFilter = 'all' | 'wrong' | 'correct';

@Component({
  selector: 'app-mock-exam-answers-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './mock-exam-answers-page.component.html',
  styleUrl: './mock-exam-answers-page.component.scss',
})
export class MockExamAnswersPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly level = signal('');
  readonly result = signal<MockExamResult | null>(null);
  readonly filter = signal<ReviewFilter>('all');

  readonly filteredReview = computed((): MockExamReviewItem[] => {
    const res = this.result();
    if (!res) return [];
    if (this.filter() === 'wrong') return res.review.filter((r) => !r.isCorrect);
    if (this.filter() === 'correct') return res.review.filter((r) => r.isCorrect);
    return res.review;
  });

  readonly wrongCount = computed(() => {
    const res = this.result();
    return res ? res.total - res.correctCount : 0;
  });

  ngOnInit(): void {
    const level = this.route.snapshot.paramMap.get('level') ?? '';
    this.level.set(level);

    const navState = history.state?.['result'] as MockExamResult | undefined;
    const saved = navState ?? loadMockExamResult();

    if (!saved || (level && saved.level !== level)) {
      void this.router.navigate(['/mock-exam']);
      return;
    }
    this.result.set(saved);
  }

  questionNumber(item: MockExamReviewItem): number {
    const res = this.result();
    if (!res) return 0;
    return res.review.findIndex((r) => r.id === item.id) + 1;
  }

  playAudio(text: string): void {
    playJapanese(text);
  }

  clearAndNavigate(): void {
    clearMockExamResult();
  }
}
