import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiError } from '../../core/http/api-client';
import { completeKeycloakLogin } from '../../core/utils/keycloak.util';

@Component({
  selector: 'app-auth-callback-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card glass-panel">
        <h1>Keycloak</h1>
        @if (error()) {
          <p class="auth-error">{{ error() }}</p>
          <p class="auth-footer-link"><a routerLink="/login">← Quay lại đăng nhập</a></p>
        } @else {
          <p class="auth-sub">Đang hoàn tất đăng nhập...</p>
        }
      </div>
    </div>
  `,
})
export class AuthCallbackPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly error = signal('');

  async ngOnInit(): Promise<void> {
    if (this.auth.isAuthenticated()) {
      await this.router.navigateByUrl('/');
      return;
    }

    try {
      const user = await completeKeycloakLogin();
      if (!user.access_token) throw new Error('Keycloak không trả access_token');
      const authUser = await this.auth.loginWithOidc(user.access_token, user.id_token);
      const redirect = sessionStorage.getItem('kc_post_login_redirect') ?? '/';
      sessionStorage.removeItem('kc_post_login_redirect');
      const dest = authUser.role === 'ADMIN' && redirect === '/' ? '/admin' : redirect;
      await this.router.navigateByUrl(dest);
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Đăng nhập Keycloak thất bại');
    }
  }
}
