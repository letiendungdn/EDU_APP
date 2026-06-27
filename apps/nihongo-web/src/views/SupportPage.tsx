'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SupportChatPanel from '@/components/SupportChatPanel';
import { useAuth } from '@/hooks/useAuth';
import { useSupportThreadQuery } from '@/hooks/queries';

export default function SupportPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { data, isLoading, refetch } = useSupportThreadQuery(isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?redirect=/support');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div className="page-loading">Đang chuyển hướng...</div>;
  }

  return (
    <div className="container" style={{ padding: '1.5rem 1rem 3rem' }}>
      <p style={{ marginBottom: '1rem' }}>
        <Link href="/">← Trang chủ</Link>
      </p>
      <h1 style={{ marginTop: 0 }}>Liên hệ hỗ trợ</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
        Nhắn tin trực tiếp với admin — thanh toán, gói học, lỗi kỹ thuật, v.v.
      </p>

      {isLoading ? (
        <div className="page-loading">Đang tải hội thoại...</div>
      ) : (
        <SupportChatPanel
          threadId={data?.thread.id ?? null}
          initialMessages={data?.messages ?? []}
          title="Chat với Admin"
          subtitle="Phản hồi trong giờ hành chính hoặc sớm nhất có thể"
          onSent={() => void refetch()}
        />
      )}
    </div>
  );
}
