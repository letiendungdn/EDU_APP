import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ApiError } from '../../core/http/api-client';
import type { SubscriptionPlanConfig } from '../../core/models/api.models';

@Component({
  selector: 'app-pricing-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './pricing-page.component.html',
  styleUrl: './pricing-page.component.scss',
})
export class PricingPageComponent {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly plans = signal<SubscriptionPlanConfig[]>([]);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      const data = await this.api.getSubscriptionPlans();
      this.plans.set(data);
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Không tải được gói');
    } finally {
      this.loading.set(false);
    }
  }
}
