import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ApiError } from '../../core/http/api-client';
import type { AdminStats } from '../../core/models/api.models';

function formatRevenue(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  templateUrl: './admin-dashboard-page.component.html',
  styleUrl: './admin-dashboard-page.component.scss',
})
export class AdminDashboardPageComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly stats = signal<AdminStats | null>(null);

  readonly formatRevenue = formatRevenue;

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    const token = this.auth.token();
    if (!token) {
      this.loading.set(false);
      this.error.set('Chưa đăng nhập admin');
      return;
    }

    this.loading.set(true);
    try {
      const data = await this.api.getAdminStats(token);
      this.stats.set(data);
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Không tải được thống kê');
    } finally {
      this.loading.set(false);
    }
  }
}
