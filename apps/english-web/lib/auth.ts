import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback-secret');

export async function signToken(payload: { id: number; email: string; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { id: number; email: string; role: string };
  } catch {
    return null;
  }
}

export async function getUser(req?: NextRequest) {
  const token = req
    ? req.headers.get('authorization')?.replace('Bearer ', '') ?? req.cookies.get('token')?.value
    : (await cookies()).get('token')?.value;

  if (!token) return null;
  return verifyToken(token);
}
