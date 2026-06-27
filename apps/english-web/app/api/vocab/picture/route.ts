import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveVocabImage } from '@edu/vocab-images';
import { parseEnglishLevel } from '@/lib/english-level';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = parseEnglishLevel(searchParams.get('level'));
  const topicId = searchParams.get('topicId') ? +searchParams.get('topicId')! : undefined;
  const picturesOnly = searchParams.get('picturesOnly') === 'true';
  const limit = +(searchParams.get('limit') ?? 200);

  const words = await prisma.vocabulary.findMany({
    where: {
      level,
      topicId,
    },
    include: { topic: { select: { name: true, icon: true } } },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    take: limit,
  });

  const items = words
    .map((w) => ({
      id: w.id,
      word: w.word,
      phonetic: w.phonetic,
      meaningVi: w.meaningVi,
      level: w.level,
      partOfSpeech: w.partOfSpeech,
      exampleEn: w.exampleEn,
      topic: w.topic,
      imageUrl: resolveVocabImage({
        word: w.word,
        meaning: w.meaningVi,
        imageUrl: w.imageUrl,
      }),
    }))
    .filter((w) => (picturesOnly ? w.imageUrl : true));

  return NextResponse.json({
    total: items.length,
    items,
  });
}
