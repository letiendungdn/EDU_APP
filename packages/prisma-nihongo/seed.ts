import { PrismaClient } from '@prisma/client';
import { seedContent } from './seed-content';
import { seedPronunciationRules } from './seed-pronunciation-rules';
import { seedSubscriptionPlans } from './seed-plans';

const prisma = new PrismaClient();

async function main() {
  await seedContent(prisma);
  await seedPronunciationRules(prisma);
  await seedSubscriptionPlans(prisma);
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
