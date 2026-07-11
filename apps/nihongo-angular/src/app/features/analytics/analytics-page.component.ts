import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ApiError } from '../../core/http/api-client';
import type { AnalyticsData } from '../../core/models/api.models';

function fmtSeconds(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}g ${m}p` : `${m} phút`;
}

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './analytics-page.component.html',
  styleUrl: './analytics-page.component.scss',
})
export class AnalyticsPageComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly data = signal<AnalyticsData | null>(null);

  readonly fmtSeconds = fmtSeconds;

  constructor() {
    this.load();
  }

  private load(): void {
    const token = this.auth.token();
    if (!token) {
      this.loading.set(false);
      this.error.set('Đăng nhập để xem tiến độ của bạn.');
      return;
    }

    this.api
      .getAnalytics(token)
      .then((res) => this.data.set(res))
      .catch((err) => {
        this.error.set(err instanceof ApiError ? err.message : 'Không tải được dữ liệu');
      })
      .finally(() => this.loading.set(false));
  }

  heatmapCells(): { date: string; seconds: number; color: string }[] {
    const map = new Map(
      (this.data()?.studySessions ?? []).map((entry) => [entry.date.slice(0, 10), entry.seconds]),
    );
    const today = new Date();
    return Array.from({ length: 365 }, (_, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (364 - index));
      const key = date.toISOString().slice(0, 10);
      const seconds = map.get(key) ?? 0;
      return { date: key, seconds, color: this.heatColor(seconds) };
    });
  }

  studyBars(): { label: string; minutes: number; height: number }[] {
    return this.toBars(
      (this.data()?.studySessions ?? []).slice(-30).map((entry) => ({
        date: entry.date,
        seconds: entry.seconds,
      })),
    );
  }

  listeningBars(): { label: string; minutes: number; height: number }[] {
    return this.toBars((this.data()?.listeningHistory ?? []).slice(-30));
  }

  examPoints(): string {
    const exams = this.data()?.examHistory ?? [];
    if (!exams.length) return '';
    const denominator = Math.max(exams.length - 1, 1);
    return exams
      .map((exam, index) => `${(index / denominator) * 100},${100 - Math.min(exam.percent, 100)}`)
      .join(' ');
  }

  private toBars(entries: { date: string; seconds: number }[]): {
    label: string;
    minutes: number;
    height: number;
  }[] {
    const values = entries.map((entry) => Math.round(entry.seconds / 60));
    const max = Math.max(...values, 1);
    return entries.map((entry, index) => ({
      label: this.fmtDate(entry.date),
      minutes: values[index],
      height: Math.max((values[index] / max) * 100, values[index] > 0 ? 3 : 0),
    }));
  }

  private fmtDate(iso: string): string {
    const date = new Date(iso);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }

  private heatColor(seconds: number): string {
    if (seconds === 0) return 'var(--border-color)';
    if (seconds < 300) return '#166534';
    if (seconds < 900) return '#16a34a';
    if (seconds < 1800) return '#4ade80';
    return '#86efac';
  }
}
