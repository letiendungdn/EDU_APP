import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import CallPageClient from './CallPageClient';

export const metadata = { title: 'Video Call — Nihongo Learn' };

export default async function CallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = parseInt(id, 10);
  if (isNaN(sessionId)) notFound();
  return (
    <Suspense fallback={null}>
      <CallPageClient sessionId={sessionId} />
    </Suspense>
  );
}
