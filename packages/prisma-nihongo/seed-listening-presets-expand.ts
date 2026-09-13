import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';

/**
 * Thêm ListeningPreset cho N4/N3/N2/N1 — hiện chỉ có 3 preset, cả 3 đều N5
 * (n5-early/n5-mid/n5-full, xem infra/postgres/nihongo-content-seed.sql).
 *
 * externalKey đặt theo quy ước "<level>-<tên>" (vd "n3-full") — ReferenceService
 * (getDailyListening) suy ra jlptLevel từ tiền tố này để lọc playlist theo
 * cấp thay vì chỉ lessonNumber range (nội dung JLPT "boost/expand" nằm ở
 * nhiều dải số chồng lấn giữa các cấp, xem listening.service.ts).
 * lessonFrom/lessonTo vẫn lưu để hiển thị + làm fallback khi không suy ra
 * được jlptLevel.
 */
const NEW_PRESETS = [
  { externalKey: 'n4-full', label: 'N4 · Minna II (bài 26–50)', lessonFrom: 26, lessonTo: 50, sortOrder: 10 },
  { externalKey: 'n3-full', label: 'N3 · Bộ N3 trong app', lessonFrom: 301, lessonTo: 354, sortOrder: 20 },
  { externalKey: 'n2-full', label: 'N2 · Bộ N2 trong app', lessonFrom: 401, lessonTo: 753, sortOrder: 30 },
  { externalKey: 'n1-full', label: 'N1 · Bộ N1 trong app', lessonFrom: 501, lessonTo: 1038, sortOrder: 40 },
] as const;

export async function seedListeningPresetsExpand(prisma: PrismaClientType) {
  let created = 0;
  for (const preset of NEW_PRESETS) {
    const existing = await prisma.listeningPreset.findUnique({
      where: { externalKey: preset.externalKey },
    });
    if (existing) continue;
    await prisma.listeningPreset.create({ data: preset });
    created += 1;
  }
  console.log(`Listening presets: +${created} preset mới (N4/N3/N2/N1).`);
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedListeningPresetsExpand(prisma);
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
