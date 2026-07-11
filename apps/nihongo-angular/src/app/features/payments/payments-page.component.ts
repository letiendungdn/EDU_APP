import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ApiError } from '../../core/http/api-client';
import type { PaymentRecord, Subscription } from '../../core/models/api.models';

const SUBSCRIPTION_REFUND_DAYS = 7;

function formatMoney(cents: number, currency: string): string {
  const amount = (cents / 100).toFixed(2);
  return currency === 'USD' ? `$${amount}` : `${amount} ${currency}`;
}

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './payments-page.component.html',
  styleUrl: './payments-page.component.scss',
})
export class PaymentsPageComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');
  readonly payments = signal<PaymentRecord[]>([]);
  readonly subscription = signal<Subscription | null>(null);
  readonly refundingId = signal<number | null>(null);
  readonly subscriptionAction = signal<'refund' | 'cancel' | null>(null);

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
      const [rows, subscription] = await Promise.all([
        this.api.getMyPayments(token),
        this.api.getSubscriptionStatus(token),
      ]);
      this.payments.set(rows);
      this.subscription.set(subscription);
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Không tải được lịch sử');
    } finally {
      this.loading.set(false);
    }
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  statusLabel(status: PaymentRecord['status']): string {
    const labels: Record<PaymentRecord['status'], string> = {
      SUCCEEDED: 'Đã thanh toán',
      PENDING: 'Đang chờ',
      FAILED: 'Thất bại',
      REFUNDED: 'Đã hoàn tiền',
      PARTIALLY_REFUNDED: 'Hoàn một phần',
    };
    return labels[status];
  }

  paymentTitle(payment: PaymentRecord): string {
    if (payment.session) {
      return `Buổi coaching — ${payment.session.coach?.user?.name ?? 'Coach'}`;
    }
    if (payment.subscription) return `Gói ${payment.subscription.plan}`;
    return payment.description ?? `Giao dịch #${payment.id}`;
  }

  canRefund(payment: PaymentRecord): boolean {
    if (payment.status !== 'SUCCEEDED') return false;
    if (payment.subscription) {
      const days = (Date.now() - new Date(payment.createdAt).getTime()) / 86_400_000;
      return days <= SUBSCRIPTION_REFUND_DAYS;
    }
    if (payment.session) {
      const hours = (new Date(payment.session.scheduledAt).getTime() - Date.now()) / 3_600_000;
      return hours > 24 && payment.session.status !== 'CANCELED';
    }
    return false;
  }

  canRefundSubscription(): boolean {
    const latest = this.payments().find(
      (payment) => payment.subscription && payment.status === 'SUCCEEDED',
    );
    return !!latest && this.canRefund(latest);
  }

  async refundPayment(payment: PaymentRecord): Promise<void> {
    const token = this.auth.token();
    if (!token) return;
    const reason = window.prompt('Lý do hoàn tiền (tuỳ chọn):') ?? undefined;
    this.refundingId.set(payment.id);
    this.error.set('');
    this.success.set('');
    try {
      const result = await this.api.requestPaymentRefund(token, payment.id, reason);
      this.success.set(result.message);
      await this.load();
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Hoàn tiền thất bại');
    } finally {
      this.refundingId.set(null);
    }
  }

  async refundSubscription(): Promise<void> {
    const token = this.auth.token();
    if (!token || !window.confirm('Hoàn tiền gói trong 7 ngày và hủy gói ngay?')) return;
    const reason = window.prompt('Lý do hoàn tiền (tuỳ chọn):') ?? undefined;
    this.subscriptionAction.set('refund');
    this.error.set('');
    this.success.set('');
    try {
      const result = await this.api.requestSubscriptionRefund(token, reason);
      this.success.set(result.message);
      await this.load();
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Hoàn tiền thất bại');
    } finally {
      this.subscriptionAction.set(null);
    }
  }

  async cancelSubscription(): Promise<void> {
    const token = this.auth.token();
    if (!token || !window.confirm('Hủy subscription vào cuối kỳ hiện tại?')) return;
    this.subscriptionAction.set('cancel');
    this.error.set('');
    this.success.set('');
    try {
      const result = await this.api.cancelSubscription(token);
      this.success.set(result.message);
      await this.load();
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Hủy subscription thất bại');
    } finally {
      this.subscriptionAction.set(null);
    }
  }
}
