import { PrismaClient } from './generated/client';
import { seedContent } from './seed-content';
import { seedJlptContent } from './seed-jlpt-content';
import { seedPronunciationRules } from './seed-pronunciation-rules';
import { seedEnglishKatakana } from './seed-english-katakana';
import { seedKanaRomaji } from './seed-kana-romaji';
import { seedBookAudio } from './seed-book-audio';
import { seedSubscriptionPlans } from './seed-plans';
import { seedCountryNames } from './seed-country-names';
import { seedVocabSuffixes } from './seed-vocab-suffixes';
import { seedKanjiVocabExamples } from './seed-kanji-vocab-examples';
import { seedConversation } from './seed-conversation';
import { seedRoleplay } from './seed-roleplay';
import { seedHomePage } from './seed-home-page';
import { seedJlptTags } from './seed-jlpt-tags';
import { seedJlptRoadmapN2N1 } from './seed-jlpt-roadmap-n2-n1';
import { seedMockExamTemplates } from './seed-mock-exam-templates';

const prisma = new PrismaClient();

async function main() {
  await seedContent(prisma);
  await seedJlptContent(prisma);
  await seedJlptTags(prisma);
  await seedJlptRoadmapN2N1(prisma);
  await seedMockExamTemplates(prisma);
  await seedPronunciationRules(prisma);
  await seedEnglishKatakana(prisma);
  await seedKanaRomaji(prisma);
  await seedBookAudio(prisma);
  await seedSubscriptionPlans(prisma);
  await seedCountryNames(prisma);
  await seedVocabSuffixes(prisma);
  await seedKanjiVocabExamples(prisma);
  await seedConversation(prisma);
  await seedRoleplay(prisma);
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
