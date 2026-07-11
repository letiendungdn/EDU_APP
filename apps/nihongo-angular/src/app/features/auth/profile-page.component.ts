import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiError } from '../../core/http/api-client';
import type { UpdateProfileInput } from '../../core/models/api.models';
import { PaymentMethodsComponent } from '../../shared/payment-methods/payment-methods.component';

const JLPT_LEVELS = ['', 'N5', 'N4', 'N3', 'N2', 'N1'] as const;

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule, RouterLink, PaymentMethodsComponent],
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.auth.user;
  readonly token = this.auth.token;
  readonly jlptLevels = JLPT_LEVELS;
  readonly loading = signal(false);
  readonly success = signal('');
  readonly error = signal('');

  name = '';
  avatarUrl = '';
  nativeLanguage = 'vi';
  targetJlptLevel = '';
  studyGoalMinutes = 30;

  constructor() {
    effect(() => {
      const u = this.auth.user();
      if (!u) return;
      this.name = u.name ?? '';
      this.avatarUrl = u.avatarUrl ?? '';
      this.nativeLanguage = u.nativeLanguage ?? 'vi';
      this.targetJlptLevel = u.targetJlptLevel ?? '';
      this.studyGoalMinutes = u.studyGoalMinutes ?? 30;
    });

    if (!this.auth.isAuthenticated()) {
      void this.router.navigate(['/login'], { queryParams: { redirect: '/profile' } });
    }
  }

  label(): string {
    const u = this.user();
    if (!u) return '';
    return u.name?.trim() || u.email.split('@')[0];
  }

  initials(): string {
    return this.label().slice(0, 1).toUpperCase();
  }

  async submit(): Promise<void> {
    this.loading.set(true);
    this.success.set('');
    this.error.set('');

    const data: UpdateProfileInput = {
      name: this.name.trim() || undefined,
      avatarUrl: this.avatarUrl.trim() || null,
      nativeLanguage: this.nativeLanguage,
      targetJlptLevel: this.targetJlptLevel || null,
      studyGoalMinutes: this.studyGoalMinutes,
    };

    try {
      await this.auth.updateProfile(data);
      this.success.set('Đã cập nhật thông tin');
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Cập nhật thất bại');
    } finally {
      this.loading.set(false);
    }
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigate(['/']);
  }
}
