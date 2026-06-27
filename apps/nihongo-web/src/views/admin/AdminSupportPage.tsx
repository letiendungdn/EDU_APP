'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SupportChatPanel from '@/components/SupportChatPanel';
import { useAuth } from '@/hooks/useAuth';
import {
  useAdminSupportThreadQuery,
  useAdminSupportThreadsQuery,
} from '@/hooks/queries';
import type { SupportThreadSummary } from '@/types/chat';
import './AdminPages.css';
import '@/components/SupportChat.css';

function formatPreview(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminSupportPage() {
  const { logout } = useAuth();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: threads, refetch: refetchThreads } = useAdminSupportThreadsQuery();
  const { data: threadDetail, refetch: refetchThread } = useAdminSupportThreadQuery(
    selectedId,
  );

  useEffect(() => {
    if (!selectedId && threads?.length) {
      setSelectedId(threads[0].id);
    }
  }, [threads, selectedId]);

  return (
    <div className="admin-dashboard admin-dashboard--wide">
      <header className="admin-topbar glass-panel">
        <div>
          <h1>Tin nhắn hỗ trợ</h1>
          <p>
            <Link href="/admin">← Dashboard</Link> · Chat với học viên
          </p>
        </div>
        <div className="admin-topbar-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              void refetchThreads();
              if (selectedId) void refetchThread();
            }}
          >
            Làm mới
          </button>
          <button type="button" className="btn btn-outline" onClick={() => void logout()}>
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="support-admin-layout">
        <aside className="glass-panel support-thread-list">
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>Hội thoại</h3>
          {!threads?.length && <p className="support-chat-empty">Chưa có tin nhắn.</p>}
          {threads?.map((t: SupportThreadSummary) => (
            <button
              key={t.id}
              type="button"
              className={`support-thread-item${selectedId === t.id ? ' support-thread-item--active' : ''}`}
              onClick={() => setSelectedId(t.id)}
            >
              <strong>
                {t.user.name ?? t.user.email}
                {t.unreadCount > 0 && (
                  <span className="support-thread-unread">{t.unreadCount}</span>
                )}
              </strong>
              <span>{t.user.email}</span>
              {t.lastMessage && (
                <span>
                  {t.lastMessage.content.slice(0, 40)}
                  {t.lastMessage.content.length > 40 ? '…' : ''} · {formatPreview(t.lastMessageAt)}
                </span>
              )}
            </button>
          ))}
        </aside>

        {selectedId && threadDetail ? (
          <SupportChatPanel
            key={selectedId}
            threadId={selectedId}
            initialMessages={threadDetail.messages}
            isAdmin
            title={threadDetail.thread.user.name ?? threadDetail.thread.user.email}
            subtitle={threadDetail.thread.user.email}
            onSent={() => {
              void refetchThreads();
              void refetchThread();
            }}
          />
        ) : (
          <div className="glass-panel support-chat-empty">Chọn hội thoại để trả lời.</div>
        )}
      </div>
    </div>
  );
}
