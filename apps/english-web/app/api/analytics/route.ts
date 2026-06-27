import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [
    totalCards,
    masteredCards,
    readingAttempts,
    listeningAttempts,
    dictationAttempts,
    studySessions,
  ] = await Promise.all([
    prisma.srsCard.count({ where: { userId: user.id } }),
    prisma.srsCard.count({ where: { userId: user.id, repetitions: { gte: 3 } } }),
    prisma.readingAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true, score: true, total: true },
    }),
    prisma.listeningAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true, score: true, total: true },
    }),
    prisma.dictationAttempt.count({ where: { userId: user.id } }),
    prisma.studySession.findMany({
      where: { userId: user.id },
      orderBy: { date: 'asc' },
      select: { date: true, seconds: true, cardsStudied: true },
    }),
  ]);

  const totalStudySeconds = studySessions.reduce((a, s) => a + s.seconds, 0);
  const daysStudied = studySessions.filter((s) => s.seconds > 0).length;

  return NextResponse.json({
    overview: {
      totalCards,
      masteredCards,
      totalStudySeconds,
      daysStudied,
      dictationAttempts,
      readingAttempts: readingAttempts.length,
      listeningAttempts: listeningAttempts.length,
    },
    studySessions,
    readingHistory: readingAttempts.map((a) => ({
      date: a.createdAt,
      percent: a.total > 0 ? Math.round((a.score / a.total) * 100) : 0,
    })),
    listeningHistory: listeningAttempts.map((a) => ({
      date: a.createdAt,
      percent: a.total > 0 ? Math.round((a.score / a.total) * 100) : 0,
    })),
  });
}
