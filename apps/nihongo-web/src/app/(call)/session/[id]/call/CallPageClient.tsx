'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import VideoCallUI from '@/components/VideoCallUI/VideoCallUI';

export default function CallPageClient({ sessionId }: { sessionId: number }) {
  const { token, isAuthenticated, authReady } = useAuth();
  const router = useRouter();
  const returnPath = `/session/${sessionId}/call`;

  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(returnPath)}`);
    }
  }, [authReady, isAuthenticated, router, returnPath]);

  if (!authReady) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#0a0a0f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        Đang tải...
      </div>
    );
  }

  if (!token) return null;

  return <VideoCallUI sessionId={sessionId} token={token} />;
}
