/** Session ID ổn định cho cuộc gọi 1:1 giữa hai user. */
export function pairCallSessionId(userIdA: number, userIdB: number): number {
  const lo = Math.min(userIdA, userIdB);
  const hi = Math.max(userIdA, userIdB);
  return lo * 1_000_000 + hi;
}

export function callPathForUser(currentUserId: number, otherUserId: number): string {
  return `/session/${pairCallSessionId(currentUserId, otherUserId)}/call`;
}
