import type { PrismaClient } from './generated/client';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(__dirname, '../..');
const PUBLIC_ROOT = path.join(ROOT, 'apps/nihongo-web/public');

const MEDIA_EXT = new Set(['.mp3', '.wma', '.wav', '.m4a', '.ogg', '.flac', '.aac', '.pdf', '.zip']);

export function parseDriveUrl(url: string): { driveId: string | null; driveKind: string } {
  const folder = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folder) return { driveId: folder[1]!, driveKind: 'FOLDER' };
  const file = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (file) return { driveId: file[1]!, driveKind: 'FILE' };
  return { driveId: null, driveKind: 'EXTERNAL' };
}

function scanDir(absDir: string, webPrefix: string) {
  if (!fs.existsSync(absDir)) return [] as Array<{
    fileName: string;
    localPath: string;
    sizeBytes: number;
    sortOrder: number;
  }>;

  const out: Array<{
    fileName: string;
    localPath: string;
    sizeBytes: number;
    sortOrder: number;
  }> = [];
  let order = 0;

  const walk = (dir: string) => {
    for (const name of fs.readdirSync(dir).sort()) {
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) {
        walk(full);
        continue;
      }
      const ext = path.extname(name).toLowerCase();
      if (!MEDIA_EXT.has(ext)) continue;
      const rel = path.relative(absDir, full).split(path.sep).join('/');
      out.push({
        fileName: name,
        localPath: `${webPrefix}/${rel}`,
        sizeBytes: st.size,
        sortOrder: order++,
      });
    }
  };

  walk(absDir);
  return out;
}

export async function syncBookAudioDrive(prisma: PrismaClient) {
  const items = await prisma.bookAudioItem.findMany();
  const folderMap = new Map<string, number>();

  for (const item of items) {
    const { driveId, driveKind } = parseDriveUrl(item.url);
    if (!driveId) continue;

    if (driveKind === 'FOLDER') {
      let folderDbId = folderMap.get(driveId);
      if (!folderDbId) {
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
        folderDbId = folder.id;
        folderMap.set(driveId, folderDbId);
      }
      await prisma.bookAudioItem.update({
        where: { id: item.id },
        data: { driveId, driveKind, folderId: folderDbId },
      });
    } else if (driveKind === 'FILE') {
      await prisma.bookAudioItem.update({
        where: { id: item.id },
        data: { driveId, driveKind, folderId: null },
      });
    }
  }

  await prisma.bookAudioFile.deleteMany();

  for (const [driveId, folderDbId] of folderMap) {
    const abs = path.join(PUBLIC_ROOT, 'media/book-audio/folders', driveId);
    const files = scanDir(abs, `/media/book-audio/folders/${driveId}`);
    if (files.length === 0) continue;

    await prisma.bookAudioDriveFolder.update({
      where: { id: folderDbId },
      data: { fileCount: files.length, downloadedAt: new Date() },
    });

    await prisma.bookAudioFile.createMany({
      data: files.map((f) => ({
        folderId: folderDbId,
        fileName: f.fileName,
        localPath: f.localPath,
        sizeBytes: f.sizeBytes,
        sortOrder: f.sortOrder,
      })),
    });
    console.log(`Folder ${driveId}: ${files.length} file`);
  }

  const fileItems = await prisma.bookAudioItem.findMany({
    where: { driveKind: 'FILE', driveId: { not: null } },
  });
  for (const item of fileItems) {
    const abs = path.join(PUBLIC_ROOT, 'media/book-audio/files', item.driveId!);
    const files = scanDir(abs, `/media/book-audio/files/${item.driveId}`);
    if (files.length === 0) continue;
    await prisma.bookAudioFile.createMany({
      data: files.map((f) => ({
        itemId: item.id,
        fileName: f.fileName,
        localPath: f.localPath,
        sizeBytes: f.sizeBytes,
        sortOrder: f.sortOrder,
      })),
    });
    console.log(`File ${item.externalKey}: ${files.length} file`);
  }

  const total = await prisma.bookAudioFile.count();
  console.log(`BookAudioFile trong DB: ${total}`);
}

async function main() {
  const { PrismaClient } = await import('./generated/client/index.js');
  const prisma = new PrismaClient();
  try {
    await syncBookAudioDrive(prisma);
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
