import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const track = await prisma.listeningTrack.findUnique({
    where: { id: +id },
    include: {
      questions: {
        orderBy: { sortOrder: 'asc' },
        include: { options: { orderBy: { sortOrder: 'asc' } } },
      },
    },
  });
  if (!track) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(track);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { answers } = await req.json() as { answers: Record<string, string> };
  const user = await getUser(req);

  const questions = await prisma.listeningQuestion.findMany({ where: { trackId: +id } });

  const results = questions.map((q) => ({
    questionId: q.id,
    correct: answers[q.id] === q.answer,
    correctAnswer: q.answer,
    explanation: q.explanation,
  }));

  const correct = results.filter((r) => r.correct).length;
  const total = questions.length;

  if (user) {
    await prisma.listeningAttempt.create({
      data: { userId: user.id, trackId: +id, score: correct, total },
    });
  }

  return NextResponse.json({ correct, total, percent: total > 0 ? Math.round((correct / total) * 100) : 0, results });
}
