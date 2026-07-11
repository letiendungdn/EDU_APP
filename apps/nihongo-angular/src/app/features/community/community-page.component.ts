import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ApiError } from '../../core/http/api-client';
import type {
  CommunityChatUser,
  CommunityRoomSummary,
  GroupChatMessage,
} from '../../core/models/api.models';

const POLL_MS = 5000;

@Component({
  selector: 'app-community-page',
  standalone: true,
  imports: [FormsModule, DatePipe, RouterLink],
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
  readonly onlineUsers = signal<CommunityChatUser[]>([]);
  readonly searchResults = signal<CommunityChatUser[]>([]);
  readonly searching = signal(false);
  readonly showGroupModal = signal(false);
  readonly creatingGroup = signal(false);
  readonly pickedMembers = signal<number[]>([]);

  draft = '';
  searchQuery = '';
  groupName = '';
  private pollId: ReturnType<typeof setInterval> | null = null;
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.pollId) clearInterval(this.pollId);
      if (this.searchTimer) clearTimeout(this.searchTimer);
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
      void this.loadOnlineUsers();
      if (!this.selectedRoomId() && list.length) {
        this.selectRoom(list[0].id);
      }
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'Không tải được phòng chat');
    } finally {
      this.loading.set(false);
    }
  }

  async loadOnlineUsers(): Promise<void> {
    const token = this.auth.token();
    if (!token) return;
    try {
      this.onlineUsers.set(await this.api.getOnlineCommunityUsers(token));
    } catch {
      this.onlineUsers.set([]);
    }
  }

  onSearch(value: string): void {
    this.searchQuery = value;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    if (value.trim().length < 2) {
      this.searchResults.set([]);
      return;
    }
    this.searchTimer = setTimeout(() => void this.searchUsers(value.trim()), 300);
  }

  private async searchUsers(query: string): Promise<void> {
    const token = this.auth.token();
    if (!token) return;
    this.searching.set(true);
    try {
      this.searchResults.set(await this.api.searchCommunityUsers(token, query));
    } finally {
      this.searching.set(false);
    }
  }

  async createDirectChat(userId: number): Promise<void> {
    const token = this.auth.token();
    if (!token) return;
    const result = await this.api.createDirectChat(token, userId);
    await this.loadRooms();
    this.selectRoom(result.id);
    this.searchQuery = '';
    this.searchResults.set([]);
  }

  toggleMember(userId: number): void {
    this.pickedMembers.update((ids) =>
      ids.includes(userId) ? ids.filter((id) => id !== userId) : [...ids, userId],
    );
  }

  async createGroup(): Promise<void> {
    const token = this.auth.token();
    const name = this.groupName.trim();
    if (!token || !name || !this.pickedMembers().length) return;
    this.creatingGroup.set(true);
    try {
      const result = await this.api.createCommunityGroup(token, name, this.pickedMembers());
      await this.loadRooms();
      this.selectRoom(result.id);
      this.showGroupModal.set(false);
      this.groupName = '';
      this.pickedMembers.set([]);
    } finally {
      this.creatingGroup.set(false);
    }
  }

  roomPreview(room: CommunityRoomSummary): string {
    if (!room.lastMessage) return 'Chưa có tin nhắn';
    return typeof room.lastMessage === 'string' ? room.lastMessage : room.lastMessage.content;
  }

  callPath(userId: number): string {
    const current = this.auth.user()?.id ?? 0;
    const lo = Math.min(current, userId);
    const hi = Math.max(current, userId);
    return `/session/${lo * 1_000_000 + hi}/call`;
  }

  directPeer(): CommunityChatUser | undefined {
    const room = this.rooms().find((entry) => entry.id === this.selectedRoomId());
    if (room?.type !== 'DIRECT') return undefined;
    return room.members?.find((member) => member.id !== this.auth.user()?.id);
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
