import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';
import { ROLEPLAY_SCENES } from './roleplay.data';

export async function seedRoleplay(prisma: PrismaClientType) {
  const sceneCount = await prisma.roleplayScene.count();
  const force = process.env.FORCE_ROLEPLAY_SEED === '1';

  if (sceneCount > 0 && !force) {
    console.log(`Roleplay đã có trong DB (${sceneCount} cảnh). Bỏ qua seed.`);
    console.log('  FORCE_ROLEPLAY_SEED=1 để ghi đè.');
    return;
  }

  if (sceneCount > 0) {
    await prisma.roleplayLine.deleteMany();
    await prisma.roleplayScene.deleteMany();
  }

  let lineTotal = 0;
  for (let i = 0; i < ROLEPLAY_SCENES.length; i++) {
    const scene = ROLEPLAY_SCENES[i];
    await prisma.roleplayScene.create({
      data: {
        slug: scene.id,
        title: scene.title,
        titleJa: scene.titleJa,
        desc: scene.desc,
        sortOrder: i,
        lines: {
          create: scene.lines.map((line, sortOrder) => ({
            role: line.role,
            ja: line.ja,
            vi: line.vi,
            sortOrder,
          })),
        },
      },
    });
    lineTotal += scene.lines.length;
  }

  console.log(`Roleplay: ${ROLEPLAY_SCENES.length} cảnh / ${lineTotal} lượt thoại.`);
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedRoleplay(prisma);
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
