import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import type { ReadingPassage, ReadingResult } from '../../core/models/api.models';

@Component({
  selector: 'app-reading-detail-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './reading-detail-page.component.html',
  styleUrl: './reading-detail-page.component.scss',
})
export class ReadingDetailPageComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  readonly passage = signal<ReadingPassage | null>(null);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly result = signal<ReadingResult | null>(null);
  readonly answers = signal<Record<string, string>>({});

  readonly passageId = computed(() => Number(this.route.snapshot.paramMap.get('id')));

  readonly allAnswered = computed(() => {
    const p = this.passage();
    if (!p?.questions?.length) return false;
    const ans = this.answers();
    return p.questions.every((q) => ans[String(q.id)] !== undefined);
  });

  constructor() {
    effect(() => {
      const id = this.passageId();
      if (!id || Number.isNaN(id)) return;
      this.loading.set(true);
      this.result.set(null);
      this.answers.set({});
      void this.api.getReadingPassage(id).then((data) => {
        this.passage.set(data);
        this.loading.set(false);
      });
    });
  }

  selectAnswer(questionId: number, value: string): void {
    this.answers.update((prev) => ({ ...prev, [String(questionId)]: value }));
  }

  async submit(): Promise<void> {
    if (!this.allAnswered() || this.submitting()) return;
    const id = this.passageId();
    this.submitting.set(true);
    try {
      const res = await this.api.submitReading(id, this.answers());
      this.result.set(res);
    } finally {
      this.submitting.set(false);
    }
  }

  reset(): void {
    this.answers.set({});
    this.result.set(null);
  }

  getResult(questionId: number) {
    return this.result()?.results.find((r) => r.questionId === questionId);
  }
}
