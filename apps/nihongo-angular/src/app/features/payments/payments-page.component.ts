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
  selector: 'app-payments-page',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './payments-page.component.html',
  styleUrl: './payments-page.component.scss',
})
export class PaymentsPageComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly payments = signal<PaymentRecord[]>([]);

  readonly formatMoney = formatMoney;

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const token = this.auth.token();
    if (!token) {
      this.loading.set(false);
      this.error.set('Chưa đăng nhập');
      return;
    }

    try {
      const rows = await this.api.getMyPayments(token);
      this.payments.set(rows);
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Không tải được lịch sử');
    } finally {
      this.loading.set(false);
    }
  }
}
