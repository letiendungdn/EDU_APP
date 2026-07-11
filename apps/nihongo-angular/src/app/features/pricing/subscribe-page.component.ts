import { AfterViewInit, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ApiError } from '../../core/http/api-client';
import type {
  CreateSubscriptionResponse,
  SavedCard,
  SubscriptionPlan,
} from '../../core/models/api.models';

@Component({
  selector: 'app-subscribe-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './subscribe-page.component.html',
  styleUrl: './subscribe-page.component.scss',
})
export class SubscribePageComponent implements AfterViewInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly result = signal<CreateSubscriptionResponse | null>(null);
  readonly cards = signal<SavedCard[]>([]);
  readonly cardsLoading = signal(true);
  readonly useNewCard = signal(true);
  readonly selectedCardId = signal<string | null>(null);
  readonly processing = signal(false);
  readonly stripeConfigured = signal(true);

  readonly plan = (this.route.snapshot.queryParamMap.get('plan') ?? 'PRO') as SubscriptionPlan;
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private viewReady = false;

  @ViewChild('paymentElement') private paymentElement?: ElementRef<HTMLDivElement>;

  constructor() {
    void this.initCheckout();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    void this.mountStripeElement();
  }

  private async initCheckout(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      await this.router.navigate(['/login'], {
        queryParams: { redirect: `/subscribe?plan=${this.plan}` },
      });
      return;
    }

    const token = this.auth.token();
    if (!token) {
      this.loading.set(false);
      this.error.set('Chưa đăng nhập');
      return;
    }

    try {
      const result = await this.api.createSubscription(token, this.plan);
      this.result.set(result);
      await this.loadCards(token);
      await this.mountStripeElement();
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Không thể khởi tạo thanh toán');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadCards(token: string): Promise<void> {
    try {
      const cards = await this.api.getPaymentMethods(token);
      this.cards.set(cards);
      const preferred = cards.find((card) => card.isDefault) ?? cards[0];
      if (preferred) {
        this.selectedCardId.set(preferred.id);
        this.useNewCard.set(false);
      }
    } catch {
      this.useNewCard.set(true);
    } finally {
      this.cardsLoading.set(false);
    }
  }

  selectSavedCard(cardId: string): void {
    this.selectedCardId.set(cardId);
    this.useNewCard.set(false);
    this.error.set('');
  }

  selectNewCard(): void {
    this.useNewCard.set(true);
    this.error.set('');
    queueMicrotask(() => void this.mountStripeElement());
  }

  private async mountStripeElement(): Promise<void> {
    const result = this.result();
    if (!this.viewReady || !result?.clientSecret || !this.useNewCard()) return;
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    const host = this.paymentElement?.nativeElement;
    if (!host || host.childElementCount > 0) return;

    this.stripe = await this.loadStripeOnly();
    if (!this.stripe) {
      this.stripeConfigured.set(false);
      return;
    }
    this.elements = this.stripe.elements({
      clientSecret: result.clientSecret,
      appearance: {
        theme: 'night',
        variables: {
          colorPrimary: '#ef4444',
          colorBackground: '#1e293b',
          colorText: '#f8fafc',
          fontFamily: 'Outfit, sans-serif',
        },
      },
    });
    this.elements.create('payment', { layout: 'accordion' }).mount(host);
  }

  async confirmPayment(): Promise<void> {
    const clientSecret = this.result()?.clientSecret;
    if (!clientSecret || this.processing()) return;
    this.processing.set(true);
    this.error.set('');

    try {
      const stripe = this.stripe ?? (await this.loadStripeOnly());
      if (!stripe) throw new Error('Stripe chưa cấu hình');
      const returnUrl = `${window.location.origin}/pricing?success=1`;
      const isSetupIntent = clientSecret.startsWith('seti_');

      if (!this.useNewCard() && this.selectedCardId()) {
        const result = isSetupIntent
          ? await stripe.confirmCardSetup(clientSecret, {
              payment_method: this.selectedCardId()!,
              return_url: returnUrl,
            })
          : await stripe.confirmCardPayment(clientSecret, {
              payment_method: this.selectedCardId()!,
              return_url: returnUrl,
            });
        if (result.error) throw new Error(result.error.message);
      } else {
        if (!this.elements) throw new Error('Form thanh toán chưa sẵn sàng');
        const submit = await this.elements.submit();
        if (submit.error) throw new Error(submit.error.message);
        const result = isSetupIntent
          ? await stripe.confirmSetup({
              elements: this.elements,
              confirmParams: { return_url: returnUrl },
              redirect: 'if_required',
            })
          : await stripe.confirmPayment({
              elements: this.elements,
              confirmParams: { return_url: returnUrl },
              redirect: 'if_required',
            });
        if (result.error) throw new Error(result.error.message);
      }

      await this.router.navigate(['/pricing'], { queryParams: { success: 1 } });
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Thanh toán thất bại');
    } finally {
      this.processing.set(false);
    }
  }

  private async loadStripeOnly(): Promise<Stripe | null> {
    const key = document
      .querySelector('meta[name="stripe-publishable-key"]')
      ?.getAttribute('content')
      ?.trim();
    if (!key) return null;
    this.stripe = await loadStripe(key);
    return this.stripe;
  }
}
