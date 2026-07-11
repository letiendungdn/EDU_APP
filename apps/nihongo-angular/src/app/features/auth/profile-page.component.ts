import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiError } from '../../core/http/api-client';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.auth.user;
  readonly saving = signal(false);
  readonly message = signal('');
  readonly error = signal('');

  name = '';

  constructor() {
    const u = this.auth.user();
    this.name = u?.name ?? '';
  }

  async saveName(): Promise<void> {
    this.saving.set(true);
    this.message.set('');
    this.error.set('');

    try {
      await this.auth.updateProfile({ name: this.name.trim() || undefined });
      this.message.set('Đã cập nhật hồ sơ.');
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Không thể cập nhật');
    } finally {
      this.saving.set(false);
    }
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigate(['/']);
  }
}
