import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';
import { JLPT_ROADMAP_N2_N1, type RoadmapLevelDef } from './jlpt-roadmap-n2-n1.data';

async function upsertLevel(prisma: PrismaClientType, def: RoadmapLevelDef, force: boolean) {
  const existing = await prisma.jlptRoadmapLevel.findUnique({
    where: { externalKey: def.externalKey },
  });

  if (existing && !force) {
    console.log(`  ${def.externalKey}: đã có — bỏ qua.`);
    return false;
  }

  if (existing && force) {
    await prisma.jlptRoadmapLevel.delete({ where: { id: existing.id } });
    console.log(`  ${def.externalKey}: ghi đè (FORCE).`);
  }

  await prisma.jlptRoadmapLevel.create({
    data: {
      externalKey: def.externalKey,
      label: def.label,
      badge: def.badge,
      color: def.color,
      duration: def.duration,
      vocabTarget: def.vocabTarget,
      kanjiTarget: def.kanjiTarget,
      grammarTarget: def.grammarTarget,
      vocabIncrement: def.vocabIncrement,
      kanjiIncrement: def.kanjiIncrement,
      grammarIncrement: def.grammarIncrement,
      passScore: def.passScore,
      summary: def.summary,
      sortOrder: def.sortOrder,
      examSections: {
        create: def.examSections.map((s, sortOrder) => ({
          name: s.name,
          points: s.points,
          time: s.time,
          sortOrder,
        })),
      },
      materials: {
        create: def.materials.map((m, sortOrder) => ({
          title: m.title,
          description: m.description,
          scope: m.scope,
          inAppPath: m.inAppPath ?? null,
          inAppLabel: m.inAppLabel ?? null,
          externalUrl: m.externalUrl ?? null,
          externalLabel: m.externalLabel ?? null,
          sortOrder,
        })),
      },
      phases: {
        create: def.phases.map((phase, sortOrder) => ({
          externalKey: phase.externalKey,
          title: phase.title,
          subtitle: phase.subtitle,
          sortOrder,
          tasks: {
            create: phase.tasks.map((task, taskOrder) => ({
              externalKey: task.externalKey,
              text: task.text,
              inAppPath: task.inAppPath ?? null,
              inAppLabel: task.inAppLabel ?? null,
              externalUrl: task.externalUrl ?? null,
              externalLabel: task.externalLabel ?? null,
              sortOrder: taskOrder,
            })),
          },
        })),
      },
    },
  });

  console.log(`  ${def.externalKey}: đã thêm (${def.phases.length} giai đoạn).`);
  return true;
}

export async function seedJlptRoadmapN2N1(prisma: PrismaClientType) {
  const force = process.env.FORCE_JLPT_ROADMAP_SEED === '1';
  const keys = JLPT_ROADMAP_N2_N1.map((l) => l.externalKey);
  const existing = await prisma.jlptRoadmapLevel.findMany({
    where: { externalKey: { in: keys } },
    select: { externalKey: true },
  });

  if (existing.length === keys.length && !force) {
    console.log('Lộ trình JLPT N2/N1 đã có trong DB. Bỏ qua seed.');
    console.log('  FORCE_JLPT_ROADMAP_SEED=1 để ghi đè.');
    return;
  }

  console.log('Bổ sung lộ trình JLPT N2 & N1...');
  let added = 0;
  for (const def of JLPT_ROADMAP_N2_N1) {
    if (await upsertLevel(prisma, def, force)) added++;
  }

  const total = await prisma.jlptRoadmapLevel.count();
  console.log(`Lộ trình JLPT: thêm ${added} cấp, tổng ${total} cấp (N5–N1).`);
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedJlptRoadmapN2N1(prisma);
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
