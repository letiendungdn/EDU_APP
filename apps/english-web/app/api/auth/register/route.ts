import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();
  if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash, name } });

  const token = await signToken({ id: user.id, email: user.email, role: user.role });
  const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
  res.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: '/' });
  return res;
}
