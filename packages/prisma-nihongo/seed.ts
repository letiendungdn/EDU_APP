import { PrismaClient } from '@prisma/client';
import { seedContent } from './seed-content';
import { seedPronunciationRules } from './seed-pronunciation-rules';
import { seedEnglishKatakana } from './seed-english-katakana';
import { seedKanaRomaji } from './seed-kana-romaji';
import { seedBookAudio } from './seed-book-audio';
import { seedSubscriptionPlans } from './seed-plans';
import { seedCountryNames } from './seed-country-names';

const prisma = new PrismaClient();

async function main() {
  await seedContent(prisma);
  await seedPronunciationRules(prisma);
  await seedEnglishKatakana(prisma);
  await seedKanaRomaji(prisma);
  await seedBookAudio(prisma);
  await seedSubscriptionPlans(prisma);
  await seedCountryNames(prisma);
  console.log('\nSeeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
