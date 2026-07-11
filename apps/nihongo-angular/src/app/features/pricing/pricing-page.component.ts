import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiError } from '../../core/http/api-client';
import type {
  PaymentRecord,
  Subscription,
  SubscriptionPlanConfig,
} from '../../core/models/api.models';

@Component({
  selector: 'app-pricing-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './pricing-page.component.html',
  styleUrl: './pricing-page.component.scss',
})
export class PricingPageComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly plans = signal<SubscriptionPlanConfig[]>([]);
  readonly currentSubscription = signal<Subscription | null>(null);
  readonly payments = signal<PaymentRecord[]>([]);
  readonly actionLoading = signal<'refund' | 'cancel' | null>(null);
  readonly success = signal(
    this.route.snapshot.queryParamMap.get('success') ? 'Thanh toán thành công. Gói đang được kích hoạt.' : '',
  );

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      const data = await this.api.getSubscriptionPlans();
      this.plans.set(data);
      const token = this.auth.token();
      if (token) {
        const [subscription, payments] = await Promise.all([
          this.api.getSubscriptionStatus(token),
          this.api.getMyPayments(token),
        ]);
        this.currentSubscription.set(subscription);
        this.payments.set(payments);
      }
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Không tải được gói');
    } finally {
      this.loading.set(false);
    }
  }

  activePlanName(): string {
    const subscription = this.currentSubscription();
    if (!subscription) return '';
    return (
      this.plans().find((plan) => plan.plan === subscription.plan)?.displayName ??
      subscription.plan
    );
  }

  canRefund(): boolean {
    const latest = this.payments().find(
      (payment) => payment.subscription && payment.status === 'SUCCEEDED',
    );
    if (!latest) return false;
    return (Date.now() - new Date(latest.createdAt).getTime()) / 86_400_000 <= 7;
  }

  async refundSubscription(): Promise<void> {
    const token = this.auth.token();
    if (!token || !window.confirm('Trả hàng, hoàn tiền và hủy gói ngay?')) return;
    const reason = window.prompt('Lý do (tuỳ chọn):') ?? undefined;
    this.actionLoading.set('refund');
    this.error.set('');
    try {
      const result = await this.api.requestSubscriptionRefund(token, reason);
      this.success.set(result.message);
      await this.reloadSubscription(token);
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Hoàn tiền thất bại');
    } finally {
      this.actionLoading.set(null);
    }
  }

  async cancelSubscription(): Promise<void> {
    const token = this.auth.token();
    if (!token || !window.confirm('Hủy gói vào cuối kỳ hiện tại?')) return;
    this.actionLoading.set('cancel');
    this.error.set('');
    try {
      const result = await this.api.cancelSubscription(token);
      this.success.set(result.message);
      await this.reloadSubscription(token);
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Hủy gói thất bại');
    } finally {
      this.actionLoading.set(null);
    }
  }

  private async reloadSubscription(token: string): Promise<void> {
    const [subscription, payments] = await Promise.all([
      this.api.getSubscriptionStatus(token),
      this.api.getMyPayments(token),
    ]);
    this.currentSubscription.set(subscription);
    this.payments.set(payments);
  }
}
