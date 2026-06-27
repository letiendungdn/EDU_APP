'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  markAdminSupportRead,
  markSupportRead,
  sendAdminSupportMessage,
  sendSupportMessage,
} from '@/api';
import { getStoredToken } from '@/lib/api-client';
import type { SupportMessage } from '@/types/chat';
import './SupportChat.css';

type SupportChatPanelProps = {
  threadId: number | null;
  initialMessages?: SupportMessage[];
  isAdmin?: boolean;
  title?: string;
  subtitle?: string;
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

export default function SupportChatPanel({
  threadId,
  initialMessages = [],
  isAdmin = false,
  title = 'Hỗ trợ',
  subtitle,
  onSent,
}: SupportChatPanelProps) {
  const [messages, setMessages] = useState<SupportMessage[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    if (isAdmin && threadId) {
      void markAdminSupportRead(token, threadId);
    } else if (!isAdmin) {
      void markSupportRead(token);
    }
  }, [isAdmin, threadId, initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    const token = getStoredToken();
    if (!text || sending || !token) return;
    setSending(true);
    setDraft('');
    try {
      if (isAdmin && threadId) {
        const res = await sendAdminSupportMessage(token, threadId, text);
        setMessages((prev) => [...prev, res.message]);
      } else {
        const res = await sendSupportMessage(token, text);
        setMessages((prev) => [...prev, res.message]);
      }
      onSent?.();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="support-chat glass-panel">
      <header className="support-chat-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </header>

      <div className="support-chat-messages">
        {messages.length === 0 && (
          <p className="support-chat-empty">
            {isAdmin ? 'Chưa có tin nhắn.' : 'Gửi tin nhắn — admin sẽ phản hồi sớm.'}
          </p>
        )}
        {messages.map((msg) => {
          const isMine = isAdmin
            ? msg.sender.role === 'ADMIN'
            : msg.sender.role !== 'ADMIN';
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
          disabled={sending || (isAdmin && !threadId)}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={sending || !draft.trim() || (isAdmin && !threadId)}
        >
          Gửi
        </button>
      </form>
    </div>
  );
}
