'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SIGNAL_URL =
  process.env.NEXT_PUBLIC_SIGNALING_URL ?? 'http://localhost:3002';

export function usePresence(token: string | null, enabled = true) {
  const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled || !token) {
      setOnlineUserIds([]);
      return;
    }

    const socket = io(`${SIGNAL_URL}/signal`, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('presence-update', ({ userIds }: { userIds: number[] }) => {
      setOnlineUserIds(userIds);
    });

    const ping = setInterval(() => {
      if (socket.connected) socket.emit('presence-ping');
    }, 60_000);

    return () => {
      clearInterval(ping);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, enabled]);

  return onlineUserIds;
}
