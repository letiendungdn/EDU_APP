import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiError } from '../../core/http/api-client';

type AuthTab = 'login' | 'register';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly activeTab = signal<AuthTab>('login');
  readonly loading = signal(false);
  readonly error = signal('');

  email = '';
  password = '';

  private get redirectUrl(): string {
    return this.route.snapshot.queryParamMap.get('redirect') ?? '/';
  }

  setTab(tab: AuthTab): void {
    this.activeTab.set(tab);
    this.error.set('');
  }

  async submit(): Promise<void> {
    if (!this.email.trim() || !this.password) {
      this.error.set('Vui lòng nhập email và mật khẩu.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      if (this.activeTab() === 'login') {
        await this.auth.login(this.email.trim(), this.password);
      } else {
        await this.auth.register(this.email.trim(), this.password);
      }
      await this.router.navigateByUrl(this.redirectUrl);
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Đăng nhập thất bại');
    } finally {
      this.loading.set(false);
    }
  }
}
