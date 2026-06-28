'use client';

import Link from 'next/link';
import { callPathForUser } from '@/lib/call-session';

type Props = {
  currentUserId: number;
  targetUserId: number;
  compact?: boolean;
};

export default function VideoCallButton({ currentUserId, targetUserId, compact }: Props) {
  const href = callPathForUser(currentUserId, targetUserId);

  return (
    <Link
      href={href}
      className={`btn btn-call${compact ? ' btn-call--compact' : ''}`}
      title="Gọi video"
    >
      📞{compact ? '' : ' Gọi'}
    </Link>
  );
}
