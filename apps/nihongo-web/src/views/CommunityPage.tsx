'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import GroupChatPanel from '@/components/GroupChatPanel';
import { useAuth } from '@/hooks/useAuth';
import {
  queryKeys,
  useCommunityRoomQuery,
  useCommunityRoomsQuery,
} from '@/hooks/queries';
import {
  createCommunityGroup,
  createDirectChat,
  searchCommunityUsers,
} from '@/api/index';
import { getStoredToken } from '@/lib/api-client';
import type { CommunityChatUser, CommunityRoomSummary } from '@/types/api';
import '@/components/Community.css';

function formatPreview(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CommunityPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<CommunityChatUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [pickedMembers, setPickedMembers] = useState<number[]>([]);
  const [creating, setCreating] = useState(false);

  const { data: rooms, refetch: refetchRooms } = useCommunityRoomsQuery(isAuthenticated);
  const { data: roomDetail, refetch: refetchRoom } = useCommunityRoomQuery(selectedId);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?redirect=/community');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!selectedId && rooms?.length) {
      setSelectedId(rooms[0].id);
    }
  }, [rooms, selectedId]);

  useEffect(() => {
    const q = searchQ.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    const token = getStoredToken();
    if (!token) return;

    const timer = setTimeout(() => {
      setSearching(true);
      void searchCommunityUsers(token, q)
        .then(setSearchResults)
        .finally(() => setSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQ]);

  async function handleDirectChat(targetUserId: number) {
    const token = getStoredToken();
    if (!token) return;
    const res = await createDirectChat(token, targetUserId);
    await queryClient.invalidateQueries({ queryKey: queryKeys.communityRooms });
    setSelectedId(res.room.id);
    setSearchQ('');
    setSearchResults([]);
  }

  async function handleCreateGroup(e: FormEvent) {
    e.preventDefault();
    const token = getStoredToken();
    if (!token || !groupName.trim() || pickedMembers.length === 0) return;
    setCreating(true);
    try {
      const res = await createCommunityGroup(token, groupName.trim(), pickedMembers);
      await queryClient.invalidateQueries({ queryKey: queryKeys.communityRooms });
      setSelectedId(res.room.id);
      setShowGroupModal(false);
      setGroupName('');
      setPickedMembers([]);
    } finally {
      setCreating(false);
    }
  }

  function toggleMember(id: number) {
    setPickedMembers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  if (!isAuthenticated || !user) {
    return <div className="page-loading">Đang chuyển hướng...</div>;
  }

  const selectedSummary = rooms?.find((r) => r.id === selectedId);

  return (
    <div className="container" style={{ padding: '1.5rem 1rem 3rem' }}>
      <p style={{ marginBottom: '1rem' }}>
        <Link href="/">← Trang chủ</Link>
      </p>
      <h1 style={{ marginTop: 0 }}>Cộng đồng học viên</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
        Nhắn tin nhóm và chat 1:1 với các học viên khác.
      </p>

      <div className="community-layout">
        <aside className="glass-panel community-sidebar">
          <div className="community-toolbar">
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => setShowGroupModal(true)}
            >
              + Tạo nhóm
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                void refetchRooms();
                if (selectedId) void refetchRoom();
              }}
            >
              ↻
            </button>
          </div>

          <div className="community-search">
            <input
              type="search"
              placeholder="Tìm học viên (email/tên)..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
            />
            {searching && <p className="support-chat-empty">Đang tìm…</p>}
            {searchResults.map((u) => (
              <div key={u.id} className="community-user-result">
                <span>{u.name ?? u.email}</span>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ fontSize: '0.78rem', padding: '0.25rem 0.5rem' }}
                  onClick={() => void handleDirectChat(u.id)}
                >
                  Chat
                </button>
              </div>
            ))}
          </div>

          <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>Hội thoại</h3>
          {!rooms?.length && <p className="support-chat-empty">Chưa có hội thoại.</p>}
          {rooms?.map((room: CommunityRoomSummary) => (
            <button
              key={room.id}
              type="button"
              className={`community-room-item${selectedId === room.id ? ' community-room-item--active' : ''}`}
              onClick={() => setSelectedId(room.id)}
            >
              <strong>
                {room.type === 'GROUP' ? '👥 ' : '💬 '}
                {room.name}
                {room.unreadCount > 0 && (
                  <span className="community-unread">{room.unreadCount}</span>
                )}
              </strong>
              <span>
                {room.lastMessage?.content ?? 'Chưa có tin nhắn'} ·{' '}
                {formatPreview(room.lastMessageAt)}
              </span>
            </button>
          ))}
        </aside>

        <section>
          <GroupChatPanel
            roomId={selectedId}
            currentUserId={user.id}
            initialMessages={roomDetail?.messages ?? []}
            title={selectedSummary?.name ?? roomDetail?.room.name ?? 'Chat'}
            subtitle={
              selectedSummary?.type === 'GROUP'
                ? `${selectedSummary.members.length} thành viên`
                : 'Chat 1:1'
            }
            onSent={() => {
              void refetchRooms();
              if (selectedId) void refetchRoom();
            }}
          />
        </section>
      </div>

      {showGroupModal && (
        <div
          className="community-modal-backdrop"
          role="presentation"
          onClick={() => setShowGroupModal(false)}
        >
          <form
            className="glass-panel community-modal"
            onSubmit={(e) => void handleCreateGroup(e)}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Tạo nhóm mới</h3>
            <label htmlFor="group-name">Tên nhóm</label>
            <input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="VD: N5 ôn thi tháng 7"
              required
            />
            <label>Thành viên (tìm ở ô trên sidebar trước)</label>
            <div className="community-member-pick">
              {pickedMembers.length === 0 && (
                <p className="support-chat-empty">Chưa chọn thành viên.</p>
              )}
              {searchResults.map((u) => (
                <label key={u.id}>
                  <input
                    type="checkbox"
                    checked={pickedMembers.includes(u.id)}
                    onChange={() => toggleMember(u.id)}
                  />
                  {u.name ?? u.email}
                </label>
              ))}
            </div>
            <div className="community-modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowGroupModal(false)}>
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={creating || !groupName.trim() || pickedMembers.length === 0}
              >
                {creating ? 'Đang tạo…' : 'Tạo nhóm'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
