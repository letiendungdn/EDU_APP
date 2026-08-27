import { PrismaClient } from './generated/client';
import { seedContent } from './seed-content';
import { seedPronunciationRules } from './seed-pronunciation-rules';
import { seedEnglishKatakana } from './seed-english-katakana';
import { seedKanaRomaji } from './seed-kana-romaji';
import { seedBookAudio } from './seed-book-audio';
import { seedSubscriptionPlans } from './seed-plans';
import { seedCountryNames } from './seed-country-names';
import { seedVocabSuffixes } from './seed-vocab-suffixes';
import { seedKanjiVocabExamples } from './seed-kanji-vocab-examples';
import { seedHomePage } from './seed-home-page';

const prisma = new PrismaClient();

async function main() {
  await seedContent(prisma);
  await seedPronunciationRules(prisma);
  await seedEnglishKatakana(prisma);
  await seedKanaRomaji(prisma);
  await seedBookAudio(prisma);
  await seedSubscriptionPlans(prisma);
  await seedCountryNames(prisma);
  await seedVocabSuffixes(prisma);
  await seedKanjiVocabExamples(prisma);
  await seedHomePage(prisma);
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
