import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ApiError } from '../../core/http/api-client';
import type { PaymentRecord } from '../../core/models/api.models';

function formatMoney(cents: number, currency: string): string {
  const amount = (cents / 100).toFixed(2);
  return currency === 'USD' ? `$${amount}` : `${amount} ${currency}`;
}

@Component({
  selector: 'app-admin-payments-page',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-payments-page.component.html',
  styleUrl: './admin-payments-page.component.scss',
})
export class AdminPaymentsPageComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly payments = signal<PaymentRecord[]>([]);
  readonly total = signal(0);

  readonly formatMoney = formatMoney;

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
      const res = await this.api.getAdminPayments(token, { limit: 50 });
      this.payments.set(res.data);
      this.total.set(res.total);
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Không tải được thanh toán');
    } finally {
      this.loading.set(false);
    }
  }
}
