import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ApiError } from '../../core/http/api-client';
import type { SupportMessage } from '../../core/models/api.models';

const POLL_MS = 5000;

@Component({
  selector: 'app-support-page',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './support-page.component.html',
  styleUrl: './support-page.component.scss',
})
export class SupportPageComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly sending = signal(false);
  readonly error = signal('');
  readonly messages = signal<SupportMessage[]>([]);
  readonly threadId = signal<number | null>(null);

  draft = '';

  constructor() {
    void this.refresh();
    const pollId = setInterval(() => void this.refresh(false), POLL_MS);
    this.destroyRef.onDestroy(() => clearInterval(pollId));
  }

  private async refresh(showLoading = true): Promise<void> {
    const token = this.auth.token();
    if (!token) {
      this.loading.set(false);
      this.error.set('Đăng nhập để chat với admin.');
      return;
    }

    if (showLoading) this.loading.set(true);

    try {
      const res = await this.api.getSupportThread(token);
      this.threadId.set(res.threadId);
      this.messages.set(res.messages);
      this.error.set('');
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Không tải được hội thoại');
    } finally {
      if (showLoading) this.loading.set(false);
    }
  }

  async send(): Promise<void> {
    const token = this.auth.token();
    const text = this.draft.trim();
    if (!token || !text || this.sending()) return;

    this.sending.set(true);
    this.draft = '';

    try {
      await this.api.sendSupportMessage(token, text);
      await this.refresh(false);
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Gửi tin nhắn thất bại');
      this.draft = text;
    } finally {
      this.sending.set(false);
    }
  }

  isMine(msg: SupportMessage): boolean {
    return msg.senderRole === 'USER';
  }
}
