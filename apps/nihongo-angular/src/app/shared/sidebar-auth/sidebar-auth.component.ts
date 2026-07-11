import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar-auth',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (!auth.isAuthenticated() || !auth.user()) {
      @if (!hideOnLogin) {
        <div class="auth-header auth-header--guest">
          <a routerLink="/login" class="btn btn-primary btn-sm auth-header-cta">
            Đăng nhập / Đăng ký
          </a>
        </div>
      }
    } @else {
      <div class="auth-header">
        <a routerLink="/profile" class="auth-user-chip" title="Hồ sơ cá nhân">
          <span class="auth-avatar">{{ initials() }}</span>
          <span class="auth-user-name">{{ label() }}</span>
        </a>
        @if (auth.isAdmin()) {
          <a routerLink="/admin" class="btn btn-outline btn-sm">Admin</a>
        }
        <a routerLink="/support" class="btn btn-outline btn-sm">Hỗ trợ</a>
        <button type="button" class="btn btn-outline btn-sm" (click)="logout()">
          Đăng xuất
        </button>
      </div>
    }
  `,
})
export class SidebarAuthComponent {
  @Input() hideOnLogin = false;

  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  label(): string {
    const user = this.auth.user();
    if (!user) return '';
    return user.name?.trim() || user.email.split('@')[0];
  }

  initials(): string {
    return this.label().slice(0, 1).toUpperCase();
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    void this.router.navigateByUrl('/');
  }
}
