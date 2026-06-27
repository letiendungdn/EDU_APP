import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import { parseEnglishLevel } from '@/lib/english-level';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = parseEnglishLevel(searchParams.get('level'));
  const topicId = searchParams.get('topicId') ? +searchParams.get('topicId')! : undefined;
  const limit = +(searchParams.get('limit') ?? 20);

  const words = await prisma.vocabulary.findMany({
    where: { level, topicId },
    select: { id: true, word: true, phonetic: true, meaningVi: true, exampleEn: true },
    orderBy: { sortOrder: 'asc' },
    take: limit,
  });

  return NextResponse.json(words);
}

export async function POST(req: NextRequest) {
  const { vocabId, userInput, correct } = await req.json();
  const user = await getUser(req);

  await prisma.dictationAttempt.create({
    data: { vocabId, userInput, correct, userId: user?.id ?? null },
  });

  return NextResponse.json({ ok: true });
}
