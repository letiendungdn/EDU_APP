import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ApiError } from '../../core/http/api-client';
import type { CommunityRoomSummary, GroupChatMessage } from '../../core/models/api.models';

const POLL_MS = 5000;

@Component({
  selector: 'app-community-page',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './community-page.component.html',
  styleUrl: './community-page.component.scss',
})
export class CommunityPageComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly sending = signal(false);
  readonly error = signal('');
  readonly rooms = signal<CommunityRoomSummary[]>([]);
  readonly selectedRoomId = signal<number | null>(null);
  readonly roomName = signal('');
  readonly messages = signal<GroupChatMessage[]>([]);

  draft = '';
  private pollId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.pollId) clearInterval(this.pollId);
    });
    void this.loadRooms();
  }

  private async loadRooms(): Promise<void> {
    const token = this.auth.token();
    if (!token) {
      this.loading.set(false);
      this.error.set('Đăng nhập để vào cộng đồng.');
      return;
    }

    try {
      const list = await this.api.getCommunityRooms(token);
      this.rooms.set(list);
      if (!this.selectedRoomId() && list.length) {
        this.selectRoom(list[0].id);
      }
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Không tải được phòng chat');
    } finally {
      this.loading.set(false);
    }
  }

  selectRoom(roomId: number): void {
    this.selectedRoomId.set(roomId);
    if (this.pollId) clearInterval(this.pollId);
    void this.refreshRoom();
    this.pollId = setInterval(() => void this.refreshRoom(), POLL_MS);
  }

  private async refreshRoom(): Promise<void> {
    const token = this.auth.token();
    const roomId = this.selectedRoomId();
    if (!token || roomId == null) return;

    try {
      const room = await this.api.getCommunityRoom(token, roomId);
      this.roomName.set(room.name);
      this.messages.set(room.messages);
    } catch {
      /* keep last snapshot */
    }
  }

  async send(): Promise<void> {
    const token = this.auth.token();
    const roomId = this.selectedRoomId();
    const text = this.draft.trim();
    if (!token || roomId == null || !text || this.sending()) return;

    this.sending.set(true);
    this.draft = '';

    try {
      await this.api.sendCommunityMessage(token, roomId, text);
      await this.refreshRoom();
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Gửi tin nhắn thất bại');
      this.draft = text;
    } finally {
      this.sending.set(false);
    }
  }

  isMine(msg: GroupChatMessage): boolean {
    return msg.senderId === this.auth.user()?.id;
  }
}
