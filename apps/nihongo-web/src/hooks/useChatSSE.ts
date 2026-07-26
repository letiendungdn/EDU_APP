'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { SupportMessage, GroupChatMessage } from '@/types/chat';
import { getStoredToken } from '@/lib/api-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export function useSupportSSE(threadId: number | null, enabled = true) {
  const queryClient = useQueryClient();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled || !threadId) return;
    const token = getStoredToken();
    if (!token) return;

    const url = `${API_BASE}/api/support/stream`;
    const es = new EventSource(url, { withCredentials: false });
    esRef.current = es;

    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as SupportMessage;
        queryClient.setQueryData<{ thread: unknown; messages: SupportMessage[] }>(
          ['support-thread'],
          (prev) => {
            if (!prev) return prev;
            const exists = prev.messages.some((m) => m.id === msg.id);
            if (exists) return prev;
            return { ...prev, messages: [...prev.messages, msg] };
          },
        );
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [enabled, threadId, queryClient]);
}

export function useCommunityRoomSSE(roomId: number | null, enabled = true) {
  const queryClient = useQueryClient();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled || !roomId) return;
    const token = getStoredToken();
    if (!token) return;

    const url = `${API_BASE}/api/community/rooms/${roomId}/stream`;
    const es = new EventSource(url, { withCredentials: false });
    esRef.current = es;

    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as GroupChatMessage;
        queryClient.setQueryData<{ room: unknown; messages: GroupChatMessage[] }>(
          ['community-room', roomId],
          (prev) => {
            if (!prev) return prev;
            const exists = prev.messages.some((m) => m.id === msg.id);
            if (exists) return prev;
            return { ...prev, messages: [...prev.messages, msg] };
          },
        );
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [enabled, roomId, queryClient]);
}
