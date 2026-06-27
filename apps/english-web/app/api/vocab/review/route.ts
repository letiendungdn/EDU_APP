import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import { sm2 } from '@/lib/sm2';

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cards = await prisma.srsCard.findMany({
    where: { userId: user.id, nextReviewAt: { lte: new Date() } },
    include: { vocab: true },
    orderBy: { nextReviewAt: 'asc' },
    take: 20,
  });

  return NextResponse.json(cards);
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { vocabId, quality } = await req.json();

  const existing = await prisma.srsCard.findUnique({
    where: { userId_vocabId: { userId: user.id, vocabId } },
  });

  const ef = existing?.easeFactor ?? 2.5;
  const interval = existing?.interval ?? 0;
  const reps = existing?.repetitions ?? 0;

  const result = sm2(quality, ef, interval, reps);

  const card = await prisma.srsCard.upsert({
    where: { userId_vocabId: { userId: user.id, vocabId } },
    create: { userId: user.id, vocabId, ...result, lastReviewAt: new Date() },
    update: { ...result, lastReviewAt: new Date() },
  });

  return NextResponse.json(card);
}
