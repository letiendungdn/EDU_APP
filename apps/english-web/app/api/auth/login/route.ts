import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });

  const token = await signToken({ id: user.id, email: user.email, role: user.role });
  const res = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  });
  res.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: '/' });
  return res;
}
