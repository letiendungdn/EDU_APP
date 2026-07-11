import {
  Component,
  HostListener,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import type { SrsDueCard, SrsReviewResult, SrsStats } from '../../core/models/api.models';

type Phase = 'loading' | 'needs-auth' | 'stats' | 'review' | 'done';

interface Rating {
  quality: number;
  label: string;
  color: string;
  key: string;
}

const RATINGS: Rating[] = [
  { quality: 1, label: 'Lại', color: 'again', key: '1' },
  { quality: 2, label: 'Khó', color: 'hard', key: '2' },
  { quality: 3, label: 'Ổn', color: 'good', key: '3' },
  { quality: 4, label: 'Dễ', color: 'easy', key: '4' },
];

const SRS_INFO = [
  { icon: '🔁', label: 'Lại', desc: 'Không nhớ — ôn lại ngay ngày mai' },
  { icon: '💪', label: 'Khó', desc: 'Nhớ mơ hồ — ôn lại sớm' },
  { icon: '✅', label: 'Ổn', desc: 'Nhớ ổn — ôn sau vài ngày' },
  { icon: '⚡', label: 'Dễ', desc: 'Nhớ tốt — ôn sau vài tuần' },
];

function previewInterval(
  quality: number,
  ef: number,
  interval: number,
  reps: number,
): string {
  const q = quality;
  const newEf = Math.max(1.3, ef + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  let days: number;
  if (q < 3) days = 1;
  else if (reps === 0) days = 1;
  else if (reps === 1) days = 6;
  else days = Math.round(interval * newEf);
  if (days < 1) return '<1d';
  if (days === 1) return '1 ngày';
  if (days < 30) return `${days} ngày`;
  return `${Math.round(days / 30)} tháng`;
}

@Component({
  selector: 'app-srs-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './srs-page.component.html',
  styleUrl: './srs-page.component.scss',
})
export class SrsPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly ratings = RATINGS;
  readonly srsInfo = SRS_INFO;
  readonly previewInterval = previewInterval;

  readonly phase = signal<Phase>('loading');
  readonly stats = signal<SrsStats | null>(null);
  readonly queue = signal<SrsDueCard[]>([]);
  readonly index = signal(0);
  readonly flipped = signal(false);
  readonly submitting = signal(false);
  readonly lastResult = signal<SrsReviewResult | null>(null);
  readonly sessionCorrect = signal(0);
  readonly sessionTotal = signal(0);
  readonly addLesson = signal('');
  readonly addingLesson = signal(false);
  readonly addMsg = signal('');

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      this.phase.set('needs-auth');
      return;
    }
    void this.initStats();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.phase() !== 'review') return;
    if (event.key === ' ' && !this.flipped()) {
      event.preventDefault();
      this.flipped.set(true);
      return;
    }
    if (!this.flipped() || this.submitting()) return;
    const rating = RATINGS.find((r) => r.key === event.key);
    if (rating) void this.rate(rating.quality);
  }

  card(): SrsDueCard | undefined {
    return this.queue()[this.index()];
  }

  progressPct(): number {
    const q = this.queue();
    if (!q.length) return 0;
    return (this.index() / q.length) * 100;
  }

  sessionPct(): number {
    const total = this.sessionTotal();
    if (!total) return 0;
    return Math.round((this.sessionCorrect() / total) * 100);
  }

  doneEmoji(): string {
    const pct = this.sessionPct();
    if (pct >= 80) return '🎉';
    if (pct >= 50) return '💪';
    return '📚';
  }

  onAddLessonInput(value: string): void {
    this.addLesson.set(value);
  }

  async initStats(): Promise<void> {
    await this.loadStats();
    this.phase.set('stats');
  }

  async loadStats(): Promise<void> {
    try {
      this.stats.set(await this.api.getSrsStats());
    } catch {
      this.stats.set({ total: 0, dueToday: 0, mastered: 0, learning: 0 });
    }
  }

  async startSession(): Promise<void> {
    this.phase.set('loading');
    try {
      const cards = await this.api.getSrsDueCards(20);
      if (!cards.length) {
        await this.loadStats();
        this.phase.set('stats');
        return;
      }
      this.queue.set(cards);
      this.index.set(0);
      this.flipped.set(false);
      this.lastResult.set(null);
      this.sessionCorrect.set(0);
      this.sessionTotal.set(0);
      this.phase.set('review');
    } catch {
      this.phase.set('stats');
    }
  }

  flipCard(): void {
    if (!this.flipped()) this.flipped.set(true);
  }

  async rate(quality: number): Promise<void> {
    if (this.submitting()) return;
    const card = this.card();
    if (!card) return;

    this.submitting.set(true);
    try {
      const result = await this.api.reviewSrsCard(card.vocabId, quality);
      this.lastResult.set(result);
      if (quality >= 3) this.sessionCorrect.update((n) => n + 1);
      this.sessionTotal.update((n) => n + 1);
    } catch {
      /* continue */
    }
    this.submitting.set(false);

    const nextIndex = this.index() + 1;
    if (nextIndex >= this.queue().length) {
      await this.loadStats();
      this.phase.set('done');
    } else {
      this.index.set(nextIndex);
      this.flipped.set(false);
      this.lastResult.set(null);
    }
  }

  exitSession(): void {
    this.phase.set('stats');
    void this.loadStats();
  }

  async handleAddLesson(): Promise<void> {
    const n = parseInt(this.addLesson(), 10);
    if (!n || n < 1) return;

    this.addingLesson.set(true);
    try {
      const r = await this.api.addSrsLesson(n);
      this.addMsg.set(`Đã thêm ${r.added} từ từ bài ${n} vào bộ thẻ.`);
      await this.loadStats();
    } catch {
      this.addMsg.set('Lỗi — không thể thêm bài.');
    }
    this.addingLesson.set(false);
    this.addLesson.set('');
    setTimeout(() => this.addMsg.set(''), 4000);
  }
}
