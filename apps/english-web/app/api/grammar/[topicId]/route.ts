import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const topic = await prisma.grammarTopic.findUnique({
    where: { id: +topicId },
    include: {
      lessons: {
        orderBy: { sortOrder: 'asc' },
        include: { exercises: { orderBy: { sortOrder: 'asc' } } },
      },
    },
  });

  if (!topic) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(topic);
}
