import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiError } from '../../core/http/api-client';

@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-login-page.component.html',
  styleUrl: './admin-login-page.component.scss',
})
export class AdminLoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly error = signal('');

  email = '';
  password = '';

  private get redirectUrl(): string {
    return this.route.snapshot.queryParamMap.get('redirect') ?? '/admin';
  }

  async submit(): Promise<void> {
    if (!this.email.trim() || !this.password) {
      this.error.set('Nhập email và mật khẩu admin.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.auth.loginAdmin(this.email.trim(), this.password);
      await this.router.navigateByUrl(this.redirectUrl);
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Đăng nhập thất bại');
    } finally {
      this.loading.set(false);
    }
  }
}
