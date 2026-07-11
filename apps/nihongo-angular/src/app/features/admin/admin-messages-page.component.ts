import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ApiError } from '../../core/http/api-client';
import type { AdminSupportThreadSummary, SupportMessage } from '../../core/models/api.models';

const POLL_MS = 5000;

@Component({
  selector: 'app-admin-messages-page',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './admin-messages-page.component.html',
  styleUrl: './admin-messages-page.component.scss',
})
export class AdminMessagesPageComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly sending = signal(false);
  readonly error = signal('');
  readonly threads = signal<AdminSupportThreadSummary[]>([]);
  readonly selectedThreadId = signal<number | null>(null);
  readonly messages = signal<SupportMessage[]>([]);
  readonly activeUser = signal<{ email: string; name: string | null } | null>(null);

  draft = '';
  private pollId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.pollId) clearInterval(this.pollId);
    });
    void this.loadThreads();
  }

  private async loadThreads(): Promise<void> {
    const token = this.auth.token();
    if (!token) {
      this.loading.set(false);
      this.error.set('Chưa đăng nhập admin');
      return;
    }

    try {
      const list = await this.api.getAdminSupportThreads(token);
      this.threads.set(list);
      if (!this.selectedThreadId() && list.length) {
        this.selectThread(list[0]);
      }
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Không tải được hội thoại');
    } finally {
      this.loading.set(false);
    }
  }

  selectThread(thread: AdminSupportThreadSummary): void {
    this.selectedThreadId.set(thread.threadId);
    this.activeUser.set({ email: thread.userEmail, name: thread.userName });
    if (this.pollId) clearInterval(this.pollId);
    void this.refreshThread();
    this.pollId = setInterval(() => void this.refreshThread(), POLL_MS);
  }

  private async refreshThread(): Promise<void> {
    const token = this.auth.token();
    const threadId = this.selectedThreadId();
    if (!token || threadId == null) return;

    try {
      const res = await this.api.getAdminSupportThread(token, threadId);
      this.messages.set(res.messages);
    } catch {
      /* keep snapshot */
    }
  }

  async send(): Promise<void> {
    const token = this.auth.token();
    const threadId = this.selectedThreadId();
    const text = this.draft.trim();
    if (!token || threadId == null || !text || this.sending()) return;

    this.sending.set(true);
    this.draft = '';

    try {
      await this.api.sendAdminSupportMessage(token, threadId, text);
      await this.refreshThread();
      await this.loadThreads();
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Gửi tin nhắn thất bại');
      this.draft = text;
    } finally {
      this.sending.set(false);
    }
  }

  isAdmin(msg: SupportMessage): boolean {
    return msg.senderRole === 'ADMIN';
  }
}
