import type { PrismaClient } from './generated/client';
import { BOOK_AUDIO_SOURCE } from './book-audio.data';
import { parseDriveUrl } from './sync-book-audio-drive';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

export async function seedBookAudio(prisma: PrismaClient) {
  const count = await prisma.bookAudioItem.count();
  const force = process.env.FORCE_BOOK_AUDIO_SEED === '1';

  if (count > 0 && !force) {
    console.log(`BookAudio đã có trong DB (${count} mục). Bỏ qua seed.`);
    console.log('  FORCE_BOOK_AUDIO_SEED=1 để ghi đè.');
    return;
  }

  if (count > 0) {
    await prisma.bookAudioFile.deleteMany();
    await prisma.bookAudioItem.deleteMany();
    await prisma.bookAudioDriveFolder.deleteMany();
  }

  await prisma.bookAudioMeta.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      sourceUrl: BOOK_AUDIO_SOURCE.sourceUrl,
      publisher: BOOK_AUDIO_SOURCE.publisher,
    },
    update: {
      sourceUrl: BOOK_AUDIO_SOURCE.sourceUrl,
      publisher: BOOK_AUDIO_SOURCE.publisher,
    },
  });

  const rows: Array<{
    externalKey: string;
    level: string;
    title: string;
    url: string;
    note: string | null;
    listNo: number | null;
    sortOrder: number;
    driveId: string | null;
    driveKind: string | null;
    folderId: number | null;
  }> = [];

  const folderIdByDrive = new Map<string, number>();

  for (const section of BOOK_AUDIO_SOURCE.sections) {
    const levelKey = section.level.toLowerCase();
    for (const item of section.items) {
      const base = slugify(item.title) || `item-${item.sortOrder}`;
      const { driveId, driveKind } = parseDriveUrl(item.url);
      let folderId: number | null = null;

      if (driveId && driveKind === 'FOLDER') {
        let fid = folderIdByDrive.get(driveId);
        if (!fid) {
          const folder = await prisma.bookAudioDriveFolder.upsert({
            where: { driveId },
            create: {
              driveId,
              localPath: `/media/book-audio/folders/${driveId}`,
            },
            update: {
              localPath: `/media/book-audio/folders/${driveId}`,
            },
          });
          fid = folder.id;
          folderIdByDrive.set(driveId, fid);
        }
        folderId = fid;
      }

      rows.push({
        externalKey: `${levelKey}-${base}-${item.sortOrder}`,
        level: section.level,
        title: item.title,
        url: item.url,
        note: item.note ?? null,
        listNo: item.no ?? null,
        sortOrder: item.sortOrder,
        driveId,
        driveKind: driveId ? driveKind : null,
        folderId,
      });
    }
  }

  await prisma.bookAudioItem.createMany({ data: rows });
  console.log(`BookAudio: ${rows.length} mục (${BOOK_AUDIO_SOURCE.sections.length} nhóm).`);
}

async function main() {
  const { PrismaClient } = await import('./generated/client');
  const prisma = new PrismaClient();
  try {
    await seedBookAudio(prisma);
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
