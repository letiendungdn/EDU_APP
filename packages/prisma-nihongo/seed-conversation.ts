import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';
import {
  INTRO_SLOTS,
  PHRASE_GROUPS,
  SELF_INTRO_SCRIPT,
} from './conversation.data';

export async function seedConversation(prisma: PrismaClientType) {
  const lineCount = await prisma.conversationIntroLine.count();
  const force = process.env.FORCE_CONVERSATION_SEED === '1';

  if (lineCount > 0 && !force) {
    console.log(`Conversation đã có trong DB (${lineCount} câu intro). Bỏ qua seed.`);
    console.log('  FORCE_CONVERSATION_SEED=1 để ghi đè.');
    return;
  }

  if (lineCount > 0) {
    await prisma.conversationPhraseItem.deleteMany();
    await prisma.conversationPhraseGroup.deleteMany();
    await prisma.conversationIntroExample.deleteMany();
    await prisma.conversationIntroSlot.deleteMany();
    await prisma.conversationIntroLine.deleteMany();
  }

  for (let i = 0; i < SELF_INTRO_SCRIPT.length; i++) {
    const line = SELF_INTRO_SCRIPT[i];
    await prisma.conversationIntroLine.create({
      data: {
        ja: line.ja,
        kana: line.kana,
        romaji: line.romaji,
        vi: line.vi,
        tip: line.tip ?? null,
        sortOrder: i,
      },
    });
  }

  for (let i = 0; i < INTRO_SLOTS.length; i++) {
    const slot = INTRO_SLOTS[i];
    await prisma.conversationIntroSlot.create({
      data: {
        slot: slot.slot,
        question: slot.question,
        sortOrder: i,
        examples: {
          create: slot.examples.map((ex, sortOrder) => ({
            ja: ex.ja,
            kana: ex.kana,
            romaji: ex.romaji,
            vi: ex.vi,
            note: ex.note ?? null,
            sortOrder,
          })),
        },
      },
    });
  }

  let phraseTotal = 0;
  for (let i = 0; i < PHRASE_GROUPS.length; i++) {
    const group = PHRASE_GROUPS[i];
    await prisma.conversationPhraseGroup.create({
      data: {
        slug: group.id,
        label: group.label,
        hint: group.hint,
        sortOrder: i,
        items: {
          create: group.items.map((item, sortOrder) => ({
            ja: item.ja,
            kana: item.kana,
            romaji: item.romaji,
            vi: item.vi,
            note: item.note ?? null,
            sortOrder,
          })),
        },
      },
    });
    phraseTotal += group.items.length;
  }

  console.log(
    `Conversation: ${SELF_INTRO_SCRIPT.length} intro, ${INTRO_SLOTS.length} slot, ${PHRASE_GROUPS.length} nhóm / ${phraseTotal} câu.`,
  );
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedConversation(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
