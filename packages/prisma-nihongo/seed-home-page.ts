import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';
import { HOME_SECTIONS, HOME_STATS } from './home-page.data';

export async function seedHomePage(prisma: PrismaClientType) {
  const sectionCount = await prisma.homeFeatureSection.count();
  const force = process.env.FORCE_HOME_PAGE_SEED === '1';

  if (sectionCount > 0 && !force) {
    console.log(`Trang chủ đã có trong DB (${sectionCount} nhóm). Bỏ qua seed.`);
    console.log('  FORCE_HOME_PAGE_SEED=1 để ghi đè.');
    return;
  }

  if (sectionCount > 0) {
    await prisma.homeFeatureItem.deleteMany();
    await prisma.homeFeatureSection.deleteMany();
    await prisma.homeStat.deleteMany();
  }

  for (let i = 0; i < HOME_STATS.length; i++) {
    const stat = HOME_STATS[i];
    await prisma.homeStat.create({
      data: {
        value: stat.value,
        label: stat.label,
        suffix: stat.suffix,
        sortOrder: i,
      },
    });
  }

  let itemTotal = 0;
  for (let i = 0; i < HOME_SECTIONS.length; i++) {
    const section = HOME_SECTIONS[i];
    await prisma.homeFeatureSection.create({
      data: {
        slug: section.slug,
        title: section.title,
        sortOrder: i,
        items: {
          create: section.items.map((item, sortOrder) => ({
            href: item.href,
            icon: item.icon,
            title: item.title,
            desc: item.desc,
            sortOrder,
          })),
        },
      },
    });
    itemTotal += section.items.length;
  }

  console.log(
    `Trang chủ: ${HOME_STATS.length} thống kê, ${HOME_SECTIONS.length} nhóm, ${itemTotal} mục.`,
  );
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedHomePage(prisma);
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
