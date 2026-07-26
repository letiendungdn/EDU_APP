'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  markAdminSupportRead,
  markSupportRead,
  sendAdminSupportMessage,
  sendSupportMessage,
  getPresignedUploadUrl,
} from '@/api';
import { getStoredToken } from '@/lib/api-client';
import type { SupportMessage } from '@/types/chat';
import { useSupportSSE } from '@/hooks/useChatSSE';
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

function MessageBubble({ msg, isMine }: { msg: SupportMessage; isMine: boolean }) {
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // SSE realtime (user side only — admin uses polling for now)
  useSupportSSE(!isAdmin ? threadId : null, !isAdmin);

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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
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
    if ((!text && !fileUrl) || sending || !token) return;
    setSending(true);
    try {
      if (isAdmin && threadId) {
        const res = await sendAdminSupportMessage(token, threadId, text, fileUrl, fileType);
        setMessages((prev) => [...prev, res.message]);
      } else {
        const res = await sendSupportMessage(token, text, fileUrl, fileType);
        setMessages((prev) => [...prev, res.message]);
      }
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
          return <MessageBubble key={msg.id} msg={msg} isMine={isMine} />;
        })}
        <div ref={bottomRef} />
      </div>

      <form className="support-chat-form" onSubmit={(e) => void handleSubmit(e)}>
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={sending || uploading || (isAdmin && !threadId)}
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
          disabled={uploading || sending || (isAdmin && !threadId)}
          style={{
            padding: '0 10px', borderRadius: 6, border: '1px solid var(--border-color)',
            background: 'transparent', cursor: 'pointer', fontSize: 16,
          }}
        >
          {uploading ? '…' : '📎'}
        </button>
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
