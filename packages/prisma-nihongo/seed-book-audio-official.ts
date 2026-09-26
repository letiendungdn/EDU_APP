import type { PrismaClient } from './generated/client';

/**
 * File nghe CHÍNH THỨC từ NXB cho các sách còn thiếu trong danh sách File nghe sách
 * (danh sách gốc lấy từ Mailee Books — chỉ có link Google Drive).
 * Idempotent: upsert theo externalKey, chạy lại bao nhiêu lần cũng được.
 */
type OfficialAudio = {
  externalKey: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  title: string;
  url: string;
  note: string;
  sortOrder: number;
};

export const OFFICIAL_BOOK_AUDIO: OfficialAudio[] = [
  {
    externalKey: 'official-shinkanzen-n4-choukai',
    level: 'N4',
    title: 'Shinkanzen N4 Nghe hiểu',
    url: 'https://www.3anet.co.jp/np/resrcs/364620/',
    note: 'Chính thức 3A Network · mp3 tải cả bộ / nghe trực tuyến',
    sortOrder: 28,
  },
  {
    externalKey: 'official-shinkanzen-n1-choukai',
    level: 'N1',
    title: 'Shinkanzen N1 Nghe hiểu',
    url: 'https://www.3anet.co.jp/np/resrcs/364020/',
    note: 'Chính thức 3A Network · mp3 tải cả bộ / nghe trực tuyến',
    sortOrder: 62,
  },
  {
    externalKey: 'official-try-n1',
    level: 'N1',
    title: 'Try N1',
    url: 'https://ask-books.com/book-details/?slug=9784866397870',
    note: 'Chính thức アスク出版 · file zip miễn phí, cũng có trên Apple Podcasts / Spotify',
    sortOrder: 62,
  },
];

export async function seedBookAudioOfficial(prisma: PrismaClient) {
  for (const item of OFFICIAL_BOOK_AUDIO) {
    const { externalKey, ...data } = item;
    await prisma.bookAudioItem.upsert({
      where: { externalKey },
      create: { externalKey, ...data },
      update: data,
    });
  }
  console.log(`BookAudio chính thức: upsert ${OFFICIAL_BOOK_AUDIO.length} mục.`);
}

async function main() {
  const { PrismaClient } = await import('./generated/client/index.js');
  const prisma = new PrismaClient();
  try {
    await seedBookAudioOfficial(prisma);
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
