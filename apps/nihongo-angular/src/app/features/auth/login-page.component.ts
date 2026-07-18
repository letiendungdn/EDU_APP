import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiError } from '../../core/http/api-client';
import { GoogleSignInButtonComponent } from '../../shared/google-sign-in-button/google-sign-in-button.component';
import { isKeycloakConfigured, startKeycloakLogin } from '../../core/utils/keycloak.util';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink, GoogleSignInButtonComponent],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly mode = signal<AuthMode>(
    this.route.snapshot.queryParamMap.get('mode') === 'register' ? 'register' : 'login',
  );
  readonly loading = signal(false);
  readonly kcLoading = signal(false);
  readonly error = signal('');
  readonly keycloakEnabled = isKeycloakConfigured();
  readonly showDevLogin = signal(!this.keycloakEnabled);

  email = '';
  password = '';

  constructor() {
    if (this.auth.isAuthenticated()) {
      void this.router.navigateByUrl(this.redirectUrl);
    }
  }

  private get redirectUrl(): string {
    return this.route.snapshot.queryParamMap.get('redirect') ?? '/';
  }

  switchMode(next: AuthMode): void {
    this.mode.set(next);
    this.error.set('');
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode: next === 'register' ? 'register' : null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  revealDevLogin(): void {
    this.showDevLogin.set(true);
  }

  async onKeycloak(): Promise<void> {
    this.error.set('');
    this.kcLoading.set(true);
    try {
      const redirect = this.redirectUrl;
      if (redirect && redirect !== '/') {
        sessionStorage.setItem('kc_post_login_redirect', redirect);
      } else {
        sessionStorage.removeItem('kc_post_login_redirect');
      }
      await startKeycloakLogin();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Không mở được Keycloak');
      this.kcLoading.set(false);
    }
  }

  onGoogleSuccess(role: string): void {
    const dest = role === 'ADMIN' && this.redirectUrl === '/' ? '/admin' : this.redirectUrl;
    void this.router.navigateByUrl(dest);
  }

  onGoogleError(message: string): void {
    this.error.set(message);
  }

  async submit(): Promise<void> {
    if (!this.email.trim() || !this.password) {
      this.error.set('Vui lòng nhập email và mật khẩu.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      if (this.mode() === 'register') {
        await this.auth.register(this.email.trim(), this.password);
      } else {
        await this.auth.login(this.email.trim(), this.password);
      }
      await this.router.navigateByUrl(this.redirectUrl);
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Đăng nhập thất bại');
    } finally {
      this.loading.set(false);
    }
  }
}
