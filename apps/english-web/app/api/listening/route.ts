import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseEnglishLevel } from '@/lib/english-level';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = parseEnglishLevel(searchParams.get('level'));

  const tracks = await prisma.listeningTrack.findMany({
    where: { level },
    include: { _count: { select: { questions: true } } },
    orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
  });

  return NextResponse.json(tracks);
}
