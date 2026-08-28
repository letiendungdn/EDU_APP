import type { PrismaClient } from './generated/client';

export async function seedBookAudio(prisma: PrismaClient) {
  const count = await prisma.bookAudioItem.count();
  console.log(
    `BookAudio data file đã xóa khỏi repo. Giữ nguyên dữ liệu DB hiện tại (${count} mục).`,
  );
}

async function main() {
  const { PrismaClient } = await import('./generated/client/index.js');
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
