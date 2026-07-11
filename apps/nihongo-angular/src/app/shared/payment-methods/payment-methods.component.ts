import { Component, ElementRef, Input, ViewChild, inject, signal } from '@angular/core';
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
import { ApiService } from '../../core/services/api.service';
import { ApiError } from '../../core/http/api-client';
import type { SavedCard } from '../../core/models/api.models';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  templateUrl: './payment-methods.component.html',
})
export class PaymentMethodsComponent {
  private readonly api = inject(ApiService);

  @Input({ required: true }) token = '';
  @ViewChild('cardElement') private cardElement?: ElementRef<HTMLDivElement>;

  readonly cards = signal<SavedCard[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');
  readonly adding = signal(false);
  readonly setupLoading = signal(false);
  readonly actionId = signal<string | null>(null);
  readonly stripeConfigured = signal(true);

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private clientSecret = '';

  ngOnInit(): void {
    void this.loadCards();
  }

  async openAddForm(): Promise<void> {
    this.adding.set(true);
    this.setupLoading.set(true);
    this.error.set('');
    try {
      const result = await this.api.createPaymentMethodSetup(this.token);
      this.clientSecret = result.clientSecret;
      await new Promise<void>((resolve) => queueMicrotask(resolve));
      const key = document
        .querySelector('meta[name="stripe-publishable-key"]')
        ?.getAttribute('content')
        ?.trim();
      if (!key) {
        this.stripeConfigured.set(false);
        return;
      }
      this.stripe = await loadStripe(key);
      if (!this.stripe) throw new Error('Stripe chưa cấu hình');
      this.elements = this.stripe.elements({ clientSecret: result.clientSecret });
      this.elements.create('payment', { layout: 'accordion' }).mount(this.cardElement!.nativeElement);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Không mở được form thẻ');
      this.adding.set(false);
    } finally {
      this.setupLoading.set(false);
    }
  }

  closeAddForm(): void {
    this.elements = null;
    this.clientSecret = '';
    this.adding.set(false);
  }

  async confirmAddCard(): Promise<void> {
    if (!this.stripe || !this.elements || !this.clientSecret) return;
    this.setupLoading.set(true);
    this.error.set('');
    try {
      const submit = await this.elements.submit();
      if (submit.error) throw new Error(submit.error.message);
      const result = await this.stripe.confirmSetup({
        elements: this.elements,
        confirmParams: { return_url: window.location.href },
        redirect: 'if_required',
      });
      if (result.error) throw new Error(result.error.message);
      this.success.set('Đã thêm thẻ thành công');
      this.closeAddForm();
      await this.loadCards();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Thêm thẻ thất bại');
    } finally {
      this.setupLoading.set(false);
    }
  }

  async setDefault(cardId: string): Promise<void> {
    this.actionId.set(cardId);
    this.error.set('');
    try {
      const result = await this.api.setDefaultPaymentMethod(this.token, cardId);
      this.success.set(result.message);
      await this.loadCards();
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Cập nhật thất bại');
    } finally {
      this.actionId.set(null);
    }
  }

  async remove(cardId: string): Promise<void> {
    if (!window.confirm('Xóa thẻ này khỏi tài khoản?')) return;
    this.actionId.set(cardId);
    this.error.set('');
    try {
      await this.api.deletePaymentMethod(this.token, cardId);
      this.success.set('Đã xóa thẻ');
      await this.loadCards();
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Xóa thẻ thất bại');
    } finally {
      this.actionId.set(null);
    }
  }

  private async loadCards(): Promise<void> {
    this.loading.set(true);
    try {
      this.cards.set(await this.api.getPaymentMethods(this.token));
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Không tải được thẻ');
    } finally {
      this.loading.set(false);
    }
  }
}
