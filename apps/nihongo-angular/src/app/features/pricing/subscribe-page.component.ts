import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ApiError } from '../../core/http/api-client';
import type { CreateSubscriptionResponse, SubscriptionPlan } from '../../core/models/api.models';

@Component({
  selector: 'app-subscribe-page',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './subscribe-page.component.html',
  styleUrl: './subscribe-page.component.scss',
})
export class SubscribePageComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal('');
  readonly result = signal<CreateSubscriptionResponse | null>(null);

  readonly plan = (this.route.snapshot.queryParamMap.get('plan') ?? 'MONTHLY') as SubscriptionPlan;

  constructor() {
    void this.initCheckout();
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
      const res = await this.api.createSubscription(token, this.plan);
      this.result.set(res);
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Không thể khởi tạo thanh toán');
    } finally {
      this.loading.set(false);
    }
  }
}
