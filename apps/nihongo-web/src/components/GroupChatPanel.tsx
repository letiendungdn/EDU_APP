'use client';

import { FormEvent, useEffect, useRef, useState, type ReactNode } from 'react';
import { markCommunityRead, sendCommunityMessage, getPresignedUploadUrl } from '@/api';
import { getStoredToken } from '@/lib/api-client';
import type { GroupChatMessage } from '@/types/chat';
import { useCommunityRoomSSE } from '@/hooks/useChatSSE';
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

function MessageBubble({ msg, isMine }: { msg: GroupChatMessage; isMine: boolean }) {
  return (
    <div className={`support-chat-bubble${isMine ? ' support-chat-bubble--mine' : ''}`}>
      <div className="support-chat-bubble-meta">
        <strong>{msg.sender.name ?? msg.sender.email}</strong>
        <span>{formatTime(msg.createdAt)}</span>
      </div>
      {msg.content && <p>{msg.content}</p>}
      {msg.fileUrl && (
        <div style={{ marginTop: 4 }}>
          {msg.fileType?.startsWith('image/') ? (
            <img
              src={msg.fileUrl}
              alt="attachment"
              style={{ maxWidth: 240, maxHeight: 240, borderRadius: 8, display: 'block' }}
            />
          ) : (
            <a href={msg.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--primary-color)' }}>
              📎 Tải file đính kèm
            </a>
          )}
        </div>
      )}
    </div>
  );
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // SSE realtime
  useCommunityRoomSSE(roomId, !!roomId);

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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !roomId) return;
    const token = getStoredToken();
    if (!token) return;

    setUploading(true);
    try {
      const { url, publicUrl } = await getPresignedUploadUrl(token, file.type, 'chat');
      await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      await handleSend('', publicUrl, file.type);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSend(text: string, fileUrl?: string, fileType?: string) {
    const token = getStoredToken();
    if ((!text && !fileUrl) || sending || !roomId || !token) return;
    setSending(true);
    try {
      const res = await sendCommunityMessage(token, roomId, text, fileUrl, fileType);
      setMessages((prev) => [...prev, res.message]);
      onSent?.();
    } finally {
      setSending(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    await handleSend(text);
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
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} isMine={msg.senderId === currentUserId} />
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="support-chat-form" onSubmit={(e) => void handleSubmit(e)}>
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={sending || uploading}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          style={{ display: 'none' }}
          onChange={(e) => void handleFileChange(e)}
        />
        <button
          type="button"
          title="Đính kèm file"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || sending}
          style={{
            padding: '0 10px', borderRadius: 6, border: '1px solid var(--border-color)',
            background: 'transparent', cursor: 'pointer', fontSize: 16,
          }}
        >
          {uploading ? '…' : '📎'}
        </button>
        <button type="submit" className="btn btn-primary" disabled={sending || !draft.trim()}>
          Gửi
        </button>
      </form>
    </div>
  );
}
