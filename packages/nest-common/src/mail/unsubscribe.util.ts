import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Signs a short, URL-safe token that encodes userId + email.
 * Used as the ?token= param in unsubscribe / email-preferences links.
 * No expiry — preferences are low-sensitivity; revocation is implicit
 * (changing email invalidates old tokens).
 */
export function signUnsubscribeToken(
  userId: number,
  email: string,
  secret: string,
): string {
  return createHmac('sha256', secret)
    .update(`${userId}:${email.toLowerCase()}`)
    .digest('base64url');
}

export function verifyUnsubscribeToken(
  userId: number,
  email: string,
  token: string,
  secret: string,
): boolean {
  const expected = signUnsubscribeToken(userId, email, secret);
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
