import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ApiError } from '../../core/http/api-client';

@Component({
  selector: 'app-admin-import-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-import-page.component.html',
  styleUrl: './admin-import-page.component.scss',
})
export class AdminImportPageComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  readonly loading = signal(false);
  readonly result = signal('');

  lessonNumber = 1;
  text = '';

  async submit(): Promise<void> {
    const token = this.auth.token();
    if (!token || !this.text.trim()) return;

    this.loading.set(true);
    this.result.set('');

    try {
      const res = await this.api.adminImportVocab(token, this.lessonNumber, this.text);
      this.result.set(
        `Đã import ${res.count} từ${res.skipped ? `, bỏ qua ${res.skipped} dòng lỗi` : ''}.`,
      );
    } catch (err) {
      this.result.set(err instanceof ApiError ? err.message : 'Import thất bại');
    } finally {
      this.loading.set(false);
    }
  }
}
