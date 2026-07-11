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
}
