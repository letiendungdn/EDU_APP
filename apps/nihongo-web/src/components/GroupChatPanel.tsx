'use client';

import { FormEvent, useEffect, useRef, useState, type ReactNode } from 'react';
import { markCommunityRead, sendCommunityMessage } from '@/api';
import { getStoredToken } from '@/lib/api-client';
import type { GroupChatMessage } from '@/types/chat';
import './SupportChat.css';

type GroupChatPanelProps = {
  roomId: number | null;
  currentUserId: number;
  initialMessages?: GroupChatMessage[];
  title?: string;
  subtitle?: string;
  headerExtra?: ReactNode;
  onSent?: () => void;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
}

export default function GroupChatPanel({
  roomId,
  currentUserId,
  initialMessages = [],
  title = 'Nhóm chat',
  subtitle,
  headerExtra,
  onSent,
}: GroupChatPanelProps) {
  const [messages, setMessages] = useState<GroupChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, roomId]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token || !roomId) return;
    void markCommunityRead(token, roomId);
  }, [roomId, initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    const token = getStoredToken();
    if (!text || sending || !roomId || !token) return;
    setSending(true);
    setDraft('');
    try {
      const res = await sendCommunityMessage(token, roomId, text);
      setMessages((prev) => [...prev, res.message]);
      onSent?.();
    } finally {
      setSending(false);
    }
  }

  if (!roomId) {
    return (
      <div className="support-chat glass-panel">
        <p className="support-chat-empty">Chọn một hội thoại để bắt đầu.</p>
      </div>
    );
  }

  return (
    <div className="support-chat glass-panel">
      <header className="support-chat-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {headerExtra && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {headerExtra}
          </div>
        )}
      </header>

      <div className="support-chat-messages">
        {messages.length === 0 && (
          <p className="support-chat-empty">Chưa có tin nhắn — hãy chào mọi người!</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`support-chat-bubble${isMine ? ' support-chat-bubble--mine' : ''}`}
            >
              <div className="support-chat-bubble-meta">
                <strong>{msg.sender.name ?? msg.sender.email}</strong>
                <span>{formatTime(msg.createdAt)}</span>
              </div>
              <p>{msg.content}</p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form className="support-chat-form" onSubmit={(e) => void handleSubmit(e)}>
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={sending}
        />
        <button type="submit" className="btn btn-primary" disabled={sending || !draft.trim()}>
          Gửi
        </button>
      </form>
    </div>
  );
}
