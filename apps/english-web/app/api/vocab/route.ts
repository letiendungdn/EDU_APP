import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import { parseEnglishLevel } from '@/lib/english-level';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = parseEnglishLevel(searchParams.get('level'));
  const topicId = searchParams.get('topicId') ? +searchParams.get('topicId')! : undefined;
  const page = +(searchParams.get('page') ?? 1);
  const limit = +(searchParams.get('limit') ?? 30);

  const [total, words] = await Promise.all([
    prisma.vocabulary.count({ where: { level, topicId } }),
    prisma.vocabulary.findMany({
      where: { level, topicId },
      include: { topic: { select: { name: true } } },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const user = await getUser(req);
  let srsMap: Record<number, { nextReviewAt: Date; repetitions: number }> = {};
  if (user) {
    const cards = await prisma.srsCard.findMany({
      where: { userId: user.id },
      select: { vocabId: true, nextReviewAt: true, repetitions: true },
    });
    srsMap = Object.fromEntries(cards.map((c) => [c.vocabId, c]));
  }

  return NextResponse.json({
    total,
    page,
    limit,
    words: words.map((w) => ({ ...w, srs: srsMap[w.id] ?? null })),
  });
}
