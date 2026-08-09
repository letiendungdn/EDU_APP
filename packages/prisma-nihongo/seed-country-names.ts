import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';
import { COUNTRY_NAME_REGIONS } from './country-names.data';

export async function seedCountryNames(prisma: PrismaClientType) {
  const regionCount = await prisma.countryRegion.count();
  const force = process.env.FORCE_COUNTRY_NAMES_SEED === '1';

  if (regionCount > 0 && !force) {
    console.log(`Tên quốc gia đã có trong DB (${regionCount} khu vực). Bỏ qua seed.`);
    console.log('  FORCE_COUNTRY_NAMES_SEED=1 để ghi đè.');
    return;
  }

  if (regionCount > 0) {
    await prisma.countryNameItem.deleteMany();
    await prisma.countryRegion.deleteMany();
  }

  let itemTotal = 0;
  for (let i = 0; i < COUNTRY_NAME_REGIONS.length; i++) {
    const region = COUNTRY_NAME_REGIONS[i];
    await prisma.countryRegion.create({
      data: {
        slug: region.slug,
        label: region.label,
        sortOrder: i,
        items: {
          create: region.items.map((item, sortOrder) => ({
            nameJa: item.nameJa,
            kana: item.kana,
            romaji: item.romaji,
            meaningVi: item.meaningVi,
            countryCode: item.countryCode,
            sortOrder,
          })),
        },
      },
    });
    itemTotal += region.items.length;
  }

  console.log(
    `Tên quốc gia: ${COUNTRY_NAME_REGIONS.length} khu vực, ${itemTotal} mục.`,
  );
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedCountryNames(prisma);
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
